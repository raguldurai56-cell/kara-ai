const CHAT_MODEL = "gemini-3.6-flash";

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
    // KARA AI CHAT API
    // =========================
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();

        const message = String(
          body?.message || ""
        ).trim();

        if (!message) {
          return json(
            { error: "Message empty." },
            400
          );
        }

        // Check API key
        if (!env.GEMINI_API_KEY) {
          return json(
            {
              error:
                "KARA AI API key is not configured."
            },
            500
          );
        }

        // Gemini API endpoint
        const endpoint =
          `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

        // Gemini request
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
                    "Your name is KARA AI. " +
                    "Do not claim to be ChatGPT. " +
                    "Answer clearly, naturally and accurately. " +
                    "If the user speaks Tamil, reply in Tamil. " +
                    "If the user speaks Tanglish, reply in Tanglish. " +
                    "Talk like a close friendly Tamil friend when appropriate. " +
                    "Keep answers useful and easy to understand. " +
                    "For mathematical calculations, carefully calculate the answer before replying."
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

        // =========================
        // GEMINI API ERROR
        // =========================
        if (!response.ok) {
          const apiError =
            data?.error?.message ||
            "Gemini API request failed.";

          return json(
            {
              error: apiError
            },
            response.status
          );
        }

        // =========================
        // GET AI RESPONSE
        // =========================
        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part?.text || "")
            .join("")
            .trim();

        if (!reply) {
          return json(
            {
              error:
                "KARA AI did not return a response."
            },
            500
          );
        }

        return json({
          reply: reply
        });

      } catch (error) {
        return json(
          {
            error: "KARA AI server error.",
            details:
              error?.message ||
              String(error)
          },
          500
        );
      }
    }

    // =========================
    // IMAGE API DISABLED
    // =========================
    // Image generation is intentionally disabled
    // because the Gemini image model does not have
    // Gemini API Free Tier availability.

    if (
      url.pathname === "/api/image" &&
      request.method === "POST"
    ) {
      return json(
        {
          error:
            "Image generation is currently disabled in the ₹0 version of KARA AI."
        },
        403
      );
    }

    // =========================
    // HOMEPAGE
    // =========================
    return new Response(
      HOME_PAGE,
      {
        headers: {
          "Content-Type":
            "text/html; charset=UTF-8",
          ...corsHeaders()
        }
      }
    );
  }
};

// =========================
// JSON RESPONSE
// =========================

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status: status,

      headers: {
        "Content-Type":
          "application/json",
        ...corsHeaders()
      }
    }
  );
}

// =========================
// CORS HEADERS
// =========================

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type"
  };
}

// =========================
// KARA AI HOMEPAGE
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

    html {
      scroll-behavior: smooth;
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
      font-size: 20px;
    }

    #chat {
      margin-top: 30px;
      padding-bottom: 100px;
    }

    .message {
      padding: 14px 16px;
      border-radius: 15px;
      margin: 12px 0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
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
      font-size: 16px;
    }

    input::placeholder {
      color: #6b7280;
    }

    button {
      padding: 14px 18px;
      border: none;
      border-radius: 12px;
      background: #2563eb;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 16px;
    }

    button:hover {
      opacity: 0.9;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {

      #welcome {
        margin-top: 50px;
      }

      #welcome h1 {
        font-size: 38px;
      }

      .user {
        margin-left: 5%;
      }

      .ai {
        margin-right: 5%;
      }

      .input-box {
        gap: 6px;
      }

      input {
        min-width: 0;
      }

      button {
        padding: 14px;
      }
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

      <p>
        Your friendly AI assistant
      </p>

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

      <button
        id="sendButton"
        onclick="sendMessage()"
      >
        Send
      </button>

    </div>

  </div>

  <script>

    const input =
      document.getElementById("message");

    const chat =
      document.getElementById("chat");

    const sendButton =
      document.getElementById("sendButton");

    // =========================
    // ENTER KEY
    // =========================

    input.addEventListener(
      "keydown",
      function(event) {

        if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
        }

      }
    );

    // =========================
    // ADD MESSAGE
    // =========================

    function addMessage(text, type) {

      const div =
        document.createElement("div");

      div.className =
        "message " + type;

      div.textContent = text;

      chat.appendChild(div);

      window.scrollTo(
        0,
        document.body.scrollHeight
      );

      return div;
    }

    // =========================
    // SEND MESSAGE
    // =========================

    async function sendMessage() {

      const message =
        input.value.trim();

      if (!message) {
        return;
      }

      input.value = "";

      sendButton.disabled = true;

      addMessage(
        message,
        "user"
      );

      const loading =
        addMessage(
          "KARA AI is thinking...",
          "ai"
        );

      try {

        const response =
          await fetch(
            "/api/chat",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                message: message
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          loading.textContent =
            data?.error ||
            "Something went wrong.";

          return;
        }

        loading.textContent =
          data?.reply ||
          "KARA AI did not return a response.";

      } catch (error) {

        loading.textContent =
          "Connection error. Please try again.";

      } finally {

        sendButton.disabled = false;

        input.focus();

      }
    }

  </script>

</body>

</html>`;
