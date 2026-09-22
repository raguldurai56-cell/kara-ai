const MODEL_TEXT = "gemini-3-flash-preview";
// Image generation uses Pollinations.ai on the frontend (free, no API key needed) — see HOME_PAGE script below.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // CORS PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // =========================
    // KARA AI CHAT API (STREAMING)
    // =========================
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return json({ error: "Message empty." }, 400);
        }

        if (!env.GEMINI_API_KEY) {
          return json({ error: "KARA AI API key is not configured." }, 500);
        }

        return await streamChat(message, env);

      } catch (error) {
        return json(
          { error: "KARA AI server error.", details: error?.message || String(error) },
          500
        );
      }
    }

    // =========================
    // KARA AI IMAGE PROMPT ENHANCER
    // =========================
    if (url.pathname === "/api/enhance-image-prompt" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return json({ error: "Message empty." }, 400);
        }

        if (!env.GEMINI_API_KEY) {
          return json({ error: "KARA AI API key is not configured." }, 500);
        }

        const enhanced = await enhanceImagePrompt(message, env);
        return json({ prompt: enhanced });

      } catch (error) {
        return json(
          { error: "KARA AI server error.", details: error?.message || String(error) },
          500
        );
      }
    }

    // =========================
    // KARA AI HOMEPAGE
    // =========================
    return new Response(HOME_PAGE, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        ...corsHeaders()
      }
    });
  }
};


// =========================
// STREAMING CHAT HANDLER
// =========================
async function streamChat(message, env) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;

  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              "You are KARA AI, a helpful, friendly AI assistant. " +
              "Answer clearly and naturally. " +
              "If the user speaks Tamil or Tanglish, reply in the same style. " +
              "Talk like a close friendly Tamil friend when appropriate. " +
              "Do not claim to be ChatGPT. " +
              "Your name is KARA AI. " +
              "If the user asks who created you, who is your creator, who made you, or similar, " +
              "reply that you were created by D.Ragul s/o Duraikannan."
          }
        ]
      },
      contents: [
        { role: "user", parts: [{ text: message }] }
      ]
    })
  });

  if (!geminiResponse.ok || !geminiResponse.body) {
    let errMsg = "Gemini API request failed.";
    try {
      const errData = await geminiResponse.json();
      errMsg = errData?.error?.message || errMsg;
    } catch (e) {}
    return json({ error: errMsg }, geminiResponse.status || 500);
  }

  const reader = geminiResponse.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete last line for next chunk

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text =
                parsed?.candidates?.[0]?.content?.parts
                  ?.map(p => p.text || "")
                  .join("") || "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch (e) {
              // skip malformed chunk
            }
          }
        }
      } catch (e) {
        // stream ended unexpectedly, just close
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...corsHeaders()
    }
  });
}


// =========================
// IMAGE PROMPT ENHANCER (uses Gemini text model)
// =========================
async function enhanceImagePrompt(shortPrompt, env) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${env.GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              "You turn a short, casual image idea into one vivid, detailed prompt " +
              "for an AI image generator. Add subject details, setting, lighting, mood, " +
              "and art style. Output ONLY the final prompt as one paragraph, in English, " +
              "no explanations, no quotes, no extra text."
          }
        ]
      },
      contents: [
        { role: "user", parts: [{ text: shortPrompt }] }
      ]
    })
  });

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("")
      .trim();

  // Fall back to the original prompt if enhancement fails for any reason
  return text || shortPrompt;
}


// =========================
// JSON RESPONSE
// =========================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}


// =========================
// CORS HEADERS
// =========================
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}


// =========================
// KARA AI HOMEPAGE
// =========================
const HOME_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>KARA AI</title>
  <style>
    * { box-sizing: border-box; }
    html { background: #0b0f19; }
    body {
      margin: 0; padding: 0;
      font-family: Arial, sans-serif;
      background: #0b0f19; color: white;
      min-height: 100vh; overflow-x: hidden;
    }
    header {
      padding: 18px; text-align: center;
      font-size: 26px; font-weight: bold;
      border-bottom: 1px solid #202737;
      background: #0b0f19;
    }
    .container {
      width: 100%; max-width: 800px; margin: auto;
      padding: 20px; padding-bottom: 140px;
    }
    #welcome { text-align: center; margin-top: 70px; }
    #welcome h1 { font-size: 42px; margin-bottom: 10px; }
    #welcome p { color: #9ca3af; font-size: 18px; }
    #chat { margin-top: 30px; padding-bottom: 100px; }
    .message {
      padding: 14px 16px; border-radius: 15px; margin: 12px 0;
      line-height: 1.5; white-space: pre-wrap;
      word-wrap: break-word; overflow-wrap: anywhere;
    }
    .user { background: #2563eb; margin-left: 20%; }
    .ai { background: #182033; margin-right: 20%; }
    .ai img {
      max-width: 100%; border-radius: 10px; margin-top: 8px; display: block;
    }
    .input-area {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #0b0f19; border-top: 1px solid #202737;
      padding: 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom));
      z-index: 999;
    }
    .input-box {
      width: 100%; max-width: 800px; margin: auto;
      display: flex; gap: 8px; align-items: center;
    }
    input {
      flex: 1; min-width: 0; width: 100%; padding: 15px;
      border-radius: 12px; border: 1px solid #374151;
      background: #111827; color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff; outline: none; font-size: 16px;
      font-family: Arial, sans-serif; opacity: 1 !important;
      appearance: none; -webkit-appearance: none; box-shadow: none;
    }
    input:focus {
      color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;
      border-color: #2563eb; outline: none;
    }
    input::placeholder {
      color: #9ca3af !important; -webkit-text-fill-color: #9ca3af !important; opacity: 1 !important;
    }
    input:disabled {
      color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; opacity: 0.7 !important;
    }
    button {
      flex-shrink: 0; padding: 15px 18px; border: none;
      border-radius: 12px; background: #2563eb; color: white;
      font-weight: bold; cursor: pointer; font-size: 16px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    #imageMode {
      background: #182033; border: 1px solid #374151;
    }
    #imageMode.active {
      background: #7c3aed; border-color: #7c3aed;
    }
    @media (max-width: 600px) {
      header { font-size: 24px; padding: 17px; }
      .container { padding: 15px; padding-bottom: 140px; }
      .user { margin-left: 5%; }
      .ai { margin-right: 5%; }
      #welcome { margin-top: 60px; }
      #welcome h1 { font-size: 34px; }
      #welcome p { font-size: 17px; }
      .input-box { gap: 6px; }
      input { font-size: 16px; padding: 15px 13px; }
      button { padding: 15px 14px; }
    }
    @media (max-width: 380px) {
      .input-box { gap: 4px; }
      input { padding: 14px 10px; }
      button { padding: 14px 10px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <header>🤖 KARA AI</header>
  <div class="container">
    <div id="welcome">
      <h1>Hi, I'm KARA 👋</h1>
      <p>Your AI assistant.</p>
    </div>
    <div id="chat"></div>
  </div>
  <div class="input-area">
    <div class="input-box">
      <button id="imageMode" type="button" title="Toggle image generation">🎨</button>
      <input id="message" type="text" placeholder="Message KARA..." autocomplete="off" autocapitalize="sentences" spellcheck="true" />
      <button id="send" type="button">Send</button>
    </div>
  </div>

  <script>
    const input = document.getElementById("message");
    const send = document.getElementById("send");
    const chat = document.getElementById("chat");
    const welcome = document.getElementById("welcome");
    const imageModeBtn = document.getElementById("imageMode");

    let imageMode = false;
    let currentController = null;
    let isGenerating = false;

    imageModeBtn.addEventListener("click", function () {
      if (isGenerating) return;
      imageMode = !imageMode;
      imageModeBtn.classList.toggle("active", imageMode);
      input.placeholder = imageMode ? "Describe the image to generate..." : "Message KARA...";
    });

    function addMessage(text, type) {
      const div = document.createElement("div");
      div.className = "message " + type;
      div.textContent = text;
      chat.appendChild(div);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 50);
      return div;
    }

    function setGeneratingState(active) {
      isGenerating = active;
      send.textContent = active ? "Stop" : "Send";
      imageModeBtn.disabled = active;
    }

    async function sendMessage() {
      if (isGenerating) {
        if (currentController) currentController.abort();
        return;
      }

      const message = input.value.trim();
      if (!message) return;

      welcome.style.display = "none";
      addMessage(message, "user");
      input.value = "";

      currentController = new AbortController();
      setGeneratingState(true);

      if (imageMode) {
        await handleImageRequest(message, currentController.signal);
      } else {
        await handleChatRequest(message, currentController.signal);
      }

      setGeneratingState(false);
      currentController = null;
      input.focus();
    }

    async function handleChatRequest(message, signal) {
      const thinking = addMessage("KARA is thinking...", "ai");
      let fullText = "";
      let started = false;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message }),
          signal: signal
        });

        if (!response.ok) {
          let errText = "Something went wrong.";
          try {
            const errData = await response.json();
            errText = errData.error || errText;
          } catch (e) {}
          thinking.textContent = "⚠️ " + errText;
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            if (!started) {
              thinking.textContent = "";
              started = true;
            }
            fullText += chunk;
            thinking.textContent = fullText;
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        }

        if (!fullText) {
          thinking.textContent = "No response.";
        }

      } catch (error) {
        if (error.name === "AbortError") {
          thinking.textContent = fullText ? fullText + "\\n\\n⏹️ Stopped." : "⏹️ Stopped.";
        } else {
          thinking.textContent = "⚠️ Connection error. Please try again.";
        }
      }
    }

    async function handleImageRequest(message, signal) {
      const thinking = addMessage("KARA is preparing the idea...", "ai");

      try {
        let finalPrompt = message;
        try {
          const enhanceRes = await fetch("/api/enhance-image-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message }),
            signal: signal
          });
          if (enhanceRes.ok) {
            const enhanceData = await enhanceRes.json();
            if (enhanceData.prompt) finalPrompt = enhanceData.prompt;
          }
        } catch (e) {
          if (e.name === "AbortError") throw e;
        }

        const maxAttempts = 3;
        let lastError = null;
        let loadedUrl = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          if (signal.aborted) throw new DOMException("Aborted", "AbortError");

          thinking.textContent = attempt === 1
            ? "KARA is generating the image..."
            : "KARA is retrying (" + attempt + "/" + maxAttempts + ")...";

          const seed = Math.floor(Math.random() * 1000000);
          const imageUrl =
            "https://image.pollinations.ai/prompt/" +
            encodeURIComponent(finalPrompt) +
            "?width=1024&height=1024&seed=" + seed +
            "&model=flux&nologo=true";

          try {
            await new Promise((resolve, reject) => {
              const testImg = new Image();
              const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
              signal.addEventListener("abort", onAbort, { once: true });
              testImg.onload = () => {
                signal.removeEventListener("abort", onAbort);
                resolve();
              };
              testImg.onerror = () => {
                signal.removeEventListener("abort", onAbort);
                reject(new Error("Image load failed"));
              };
              testImg.src = imageUrl;
            });
            loadedUrl = imageUrl;
            break;
          } catch (err) {
            if (err.name === "AbortError") throw err;
            lastError = err;
          }
        }

        if (!loadedUrl) throw lastError || new Error("Image generation failed");

        const img = document.createElement("img");
        img.src = loadedUrl;
        thinking.textContent = "";
        thinking.appendChild(img);

        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

      } catch (error) {
        if (error.name === "AbortError") {
          thinking.textContent = "⏹️ Stopped.";
        } else {
          thinking.textContent = "⚠️ Image generation failed after retries. Please try again.";
        }
      }
    }

    send.addEventListener("click", sendMessage);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener("focus", function () {
      input.style.color = "#ffffff";
      input.style.webkitTextFillColor = "#ffffff";
    });
  </script>
</body>
</html>`;
