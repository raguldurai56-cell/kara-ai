const CHAT_MODEL = "gemini-3.6-flash";
const IMAGE_MODEL = "gemini-3.1-flash-image";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // =========================
    // KARA AI CHAT API
    // =========================
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return json({ error: "Message empty." }, 400);
        }

        if (!env.GEMINI_API_KEY) {
          return json(
            { error: "KARA AI API key is not configured." },
            500
          );
        }

        const endpoint =
          `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text:
                    "You are KARA AI, a helpful, friendly AI assistant. " +
                    "Answer clearly and naturally. " +
                    "If the user speaks Tamil or Tanglish, reply in the same style. " +
                    "Talk like a close friendly Tamil friend when appropriate. " +
                    "Do not claim to be ChatGPT. Your name is KARA AI."
                }
              ]
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: message
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return json(
            {
              error:
                data?.error?.message ||
                "Gemini API request failed."
            },
            response.status
          );
        }

        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!reply) {
          return json(
            { error: "KARA AI did not return a response." },
            500
          );
        }

        return json({ reply });
      } catch (error) {
        return json(
          {
            error: "KARA AI server error.",
            details: error?.message || String(error)
          },
          500
        );
      }
    }

    // =========================
    // KARA AI IMAGE GENERATION
    // =========================
    if (url.pathname === "/api/image" && request.method === "POST") {
      try {
        const body = await request.json();
        const prompt = String(body.prompt || "").trim();

        if (!prompt) {
          return json({ error: "Image prompt empty." }, 400);
        }

        if (!env.GEMINI_API_KEY) {
          return json(
            { error: "KARA AI API key is not configured." },
            500
          );
        }

        const endpoint =
          `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["IMAGE"]
            }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return json(
            {
              error:
                data?.error?.message ||
                "Image generation failed."
            },
            response.status
          );
        }

        const parts =
          data?.candidates?.[0]?.content?.parts || [];

        const imagePart = parts.find(
          part => part?.inlineData?.data
        );

        if (!imagePart) {
          return json(
            {
              error: "KARA AI did not return an image."
            },
            500
          );
        }

        const mimeType =
          imagePart.inlineData.mimeType || "image/png";

        const image =
          `data:${mimeType};base64,${imagePart.inlineData.data}`;

        return json({
          image
        });
      } catch (error) {
        return json(
          {
            error: "KARA AI image server error.",
            details: error?.message || String(error)
          },
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
// JSON RESPONSE
// =========================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
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
// HOMEPAGE
// =========================
const HOME_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>KARA AI</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0b0f19;
      color: white;
      min-height: 100vh;
    }

    header {
      padding: 18px;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
      border-bottom: 1px solid #202737;
    }

    .container {
      max-width: 800px;
      margin: auto;
      padding: 20px;
    }

    #welcome {
      text-align: center;
      margin-top: 70px;
    }

    #welcome h1 {
      font-size: 42px;
      margin-bottom: 10px;
    }

    #welcome p {
      color: #9ca3af;
    }

    #chat {
      margin-top: 30px;
      padding-bottom: 100px;
    }

    .message {
      padding: 14px 16px;
      border-radius: 15px;
      margin: 12px 0;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .user {
      background: #2563eb;
      margin-left: 20%;
    }

    .ai {
      background: #1f2937;
      margin-right: 20%;
    }

    .input-area {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background: #111827;
      border-top: 1px solid #202737;
      padding: 12px;
    }

    .input-box {
      max-width: 800px;
      margin: auto;
      display: flex;
      gap: 8px;
    }

    input {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #374151;
      background: #0b0f19;
      color: white;
      outline: none;
    }

    button {
      padding: 14px 18px;
      border: none;
      border-radius: 12px;
      background: #2563eb;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }
  </style>
</head>

<body>

  <header>
    KARA AI
  </header>

  <div class="container">

    <div id="welcome">
      <h1>KARA AI</h1>
      <p>Your friendly AI assistant</p>
    </div>

    <div id="chat"></div>

  </div>

  <div class="input-area">
    <div class="input-box">
      <input
        id="message"
        type="text"
        placeholder="Message KARA AI..."
        autocomplete="off"
      >
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script>
    const input = document.getElementById("message");
    const chat = document.getElementById("chat");

    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });

    function addMessage(text, type) {
      const div = document.createElement("div");
      div.className = "message " + type;
      div.textContent = text;
      chat.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight);
      return div;
    }

    async function sendMessage() {
      const message = input.value.trim();

      if (!message) return;

      input.value = "";

      addMessage(message, "user");

      const loading = addMessage("KARA AI is thinking...", "ai");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message
          })
        });

        const data = await response.json();

        if (!response.ok) {
          loading.textContent =
            data.error || "Something went wrong.";
          return;
        }

        loading.textContent =
          data.reply || "KARA AI did not return a response.";

      } catch (error) {
        loading.textContent =
          "Connection error. Please try again.";
      }
    }
  </script>

</body>
</html>`;
