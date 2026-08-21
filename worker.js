const MODEL = "gemini-3.6-flash";

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
        const message = String(body.message || "").trim();

        if (!message) {
          return json(
            { error: "Message empty." },
            400
          );
        }

        if (!env.GEMINI_API_KEY) {
          return json(
            { error: "KARA AI API key is not configured." },
            500
          );
        }

        const endpoint =
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

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
                    "Do not claim to be ChatGPT. " +
                    "Your name is KARA AI."
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
            {
              error: "KARA AI did not return a response."
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
  return new Response(
    JSON.stringify(data),
    {
      status: status,

      headers: {
        "Content-Type": "application/json",
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
      font-size: 18px;
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
      word-wrap: break-word;
    }

    .user {
      background: #2563eb;
      margin-left: 20%;
    }

    .ai {
      background: #182033;
      margin-right: 20%;
    }

    .input-area {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #0b0f19;
      border-top: 1px solid #202737;
      padding: 12px;
    }

    .input-box {
      max-width: 800px;
      margin: auto;
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 15px;
      border-radius: 12px;
      border: 1px solid #374151;
      background: #111827;
      color: white;
      outline: none;
      font-size: 16px;
    }

    input:disabled {
      opacity: 0.6;
    }

    button {
      padding: 15px 20px;
      border: none;
      border-radius: 12px;
      background: #2563eb;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {

      .user {
        margin-left: 5%;
      }

      .ai {
        margin-right: 5%;
      }

      #welcome h1 {
        font-size: 36px;
      }

      .input-box {
        gap: 6px;
      }

      button {
        padding: 15px 16px;
      }
    }

  </style>

</head>


<body>

  <header>
    🤖 KARA AI
  </header>


  <div class="container">

    <div id="welcome">

      <h1>
        Hi, I'm KARA 👋
      </h1>

      <p>
        Your AI assistant.
      </p>

    </div>


    <div id="chat"></div>

  </div>


  <div class="input-area">

    <div class="input-box">

      <input
        id="message"
        type="text"
        placeholder="Message KARA..."
        autocomplete="off"
      />

      <button id="send">
        Send
      </button>

    </div>

  </div>


  <script>

    const input =
      document.getElementById("message");

    const send =
      document.getElementById("send");

    const chat =
      document.getElementById("chat");

    const welcome =
      document.getElementById("welcome");


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

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });

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


      welcome.style.display = "none";

      addMessage(
        message,
        "user"
      );

      input.value = "";

      send.disabled = true;
      input.disabled = true;


      const thinking =
        addMessage(
          "KARA is thinking...",
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

          thinking.textContent =
            "⚠️ " +
            (
              data.error ||
              "Something went wrong."
            );

          return;
        }


        thinking.textContent =
          data.reply ||
          "No response.";


      } catch (error) {

        thinking.textContent =
          "⚠️ Connection error. Please try again.";

      } finally {

        send.disabled = false;
        input.disabled = false;
        input.focus();

      }
    }


    // =========================
    // SEND BUTTON
    // =========================
    send.addEventListener(
      "click",
      sendMessage
    );


    // =========================
    // ENTER KEY
    // =========================
    input.addEventListener(
      "keydown",
      function(event) {

        if (event.key === "Enter") {
          sendMessage();
        }

      }
    );

  </script>

</body>

</html>`;
