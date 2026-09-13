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
    content="width=device-width, initial-scale=1.0, viewport-fit=cover"
  >

  <title>KARA AI</title>

  <style>

    /* =========================
       GLOBAL
       ========================= */

    * {
      box-sizing: border-box;
    }

    html {
      background: #0b0f19;
    }

    body {
      margin: 0;
      padding: 0;

      font-family: Arial, sans-serif;

      background: #0b0f19;
      color: white;

      min-height: 100vh;

      overflow-x: hidden;
    }


    /* =========================
       HEADER
       ========================= */

    header {
      padding: 18px;

      text-align: center;

      font-size: 26px;
      font-weight: bold;

      border-bottom: 1px solid #202737;

      background: #0b0f19;
    }


    /* =========================
       MAIN CONTAINER
       ========================= */

    .container {
      width: 100%;
      max-width: 800px;

      margin: auto;

      padding: 20px;

      padding-bottom: 120px;
    }


    /* =========================
       WELCOME
       ========================= */

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


    /* =========================
       CHAT
       ========================= */

    #chat {
      margin-top: 30px;

      padding-bottom: 100px;
    }


    /* =========================
       MESSAGE
       ========================= */

    .message {
      padding: 14px 16px;

      border-radius: 15px;

      margin: 12px 0;

      line-height: 1.5;

      white-space: pre-wrap;

      word-wrap: break-word;

      overflow-wrap: anywhere;
    }


    /* =========================
       USER MESSAGE
       ========================= */

    .user {
      background: #2563eb;

      margin-left: 20%;
    }


    /* =========================
       AI MESSAGE
       ========================= */

    .ai {
      background: #182033;

      margin-right: 20%;
    }


    /* =========================
       INPUT AREA
       ========================= */

    .input-area {
      position: fixed;

      bottom: 0;
      left: 0;
      right: 0;

      background: #0b0f19;

      border-top: 1px solid #202737;

      padding: 12px;

      padding-bottom:
        calc(12px + env(safe-area-inset-bottom));

      z-index: 999;
    }


    /* =========================
       INPUT BOX
       ========================= */

    .input-box {
      width: 100%;

      max-width: 800px;

      margin: auto;

      display: flex;

      gap: 10px;

      align-items: center;
    }


    /* =========================
       TEXT INPUT
       IMPORTANT MOBILE FIX
       ========================= */

    input {
      flex: 1;

      min-width: 0;

      width: 100%;

      padding: 15px;

      border-radius: 12px;

      border: 1px solid #374151;

      background: #111827;

      color: #ffffff !important;

      -webkit-text-fill-color: #ffffff !important;

      caret-color: #ffffff;

      outline: none;

      font-size: 16px;

      font-family: Arial, sans-serif;

      opacity: 1 !important;

      appearance: none;

      -webkit-appearance: none;

      box-shadow: none;
    }


    /* =========================
       INPUT FOCUS
       ========================= */

    input:focus {
      color: #ffffff !important;

      -webkit-text-fill-color: #ffffff !important;

      border-color: #2563eb;

      outline: none;
    }


    /* =========================
       PLACEHOLDER
       ========================= */

    input::placeholder {
      color: #9ca3af !important;

      -webkit-text-fill-color: #9ca3af !important;

      opacity: 1 !important;
    }


    /* =========================
       DISABLED INPUT
       ========================= */

    input:disabled {
      color: #ffffff !important;

      -webkit-text-fill-color: #ffffff !important;

      opacity: 0.7 !important;
    }


    /* =========================
       SEND BUTTON
       ========================= */

    button {
      flex-shrink: 0;

      padding: 15px 20px;

      border: none;

      border-radius: 12px;

      background: #2563eb;

      color: white;

      font-weight: bold;

      cursor: pointer;

      font-size: 16px;
    }


    /* =========================
       BUTTON DISABLED
       ========================= */

    button:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }


    /* =========================
       MOBILE
       ========================= */

    @media (max-width: 600px) {

      header {
        font-size: 24px;

        padding: 17px;
      }

      .container {
        padding: 15px;

        padding-bottom: 120px;
      }

      .user {
        margin-left: 5%;
      }

      .ai {
        margin-right: 5%;
      }

      #welcome {
        margin-top: 60px;
      }

      #welcome h1 {
        font-size: 34px;
      }

      #welcome p {
        font-size: 17px;
      }

      .input-box {
        gap: 7px;
      }

      input {
        font-size: 16px;

        padding: 15px 13px;
      }

      button {
        padding: 15px 16px;
      }
    }


    /* =========================
       VERY SMALL SCREEN
       ========================= */

    @media (max-width: 380px) {

      .input-box {
        gap: 5px;
      }

      input {
        padding: 14px 10px;
      }

      button {
        padding: 14px 12px;
      }

    }

  </style>

</head>


<body>


  <!-- =========================
       HEADER
       ========================= -->

  <header>
    🤖 KARA AI
  </header>


  <!-- =========================
       MAIN
       ========================= -->

  <div class="container">


    <!-- WELCOME -->

    <div id="welcome">

      <h1>
        Hi, I'm KARA 👋
      </h1>

      <p>
        Your AI assistant.
      </p>

    </div>


    <!-- CHAT -->

    <div id="chat"></div>


  </div>


  <!-- =========================
       INPUT AREA
       ========================= -->

  <div class="input-area">

    <div class="input-box">


      <input
        id="message"
        type="text"
        placeholder="Message KARA..."
        autocomplete="off"
        autocapitalize="sentences"
        spellcheck="true"
      />


      <button
        id="send"
        type="button"
      >
        Send
      </button>


    </div>

  </div>


  <script>

    // =========================
    // ELEMENTS
    // =========================

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


      // Scroll to bottom

      setTimeout(() => {

        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth"
        });

      }, 50);


      return div;
    }


    // =========================
    // SEND MESSAGE
    // =========================

    async function sendMessage() {

      const message =
        input.value.trim();


      // Empty message

      if (!message) {
        return;
      }


      // Hide welcome

      welcome.style.display = "none";


      // Add user message

      addMessage(
        message,
        "user"
      );


      // Clear input

      input.value = "";


      // Disable only SEND button
      // IMPORTANT:
      // Input is NOT disabled.
      // This avoids mobile text visibility issues.

      send.disabled = true;


      // Thinking message

      const thinking =
        addMessage(
          "KARA is thinking...",
          "ai"
        );


      try {

        // =========================
        // API REQUEST
        // =========================

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


        // =========================
        // READ RESPONSE
        // =========================

        const data =
          await response.json();


        // =========================
        // ERROR
        // =========================

        if (!response.ok) {

          thinking.textContent =
            "⚠️ " +
            (
              data.error ||
              "Something went wrong."
            );

          return;
        }


        // =========================
        // AI RESPONSE
        // =========================

        thinking.textContent =
          data.reply ||
          "No response.";


      } catch (error) {

        // =========================
        // CONNECTION ERROR
        // =========================

        thinking.textContent =
          "⚠️ Connection error. Please try again.";

      } finally {

        // Enable SEND button

        send.disabled = false;

        // Keep input active

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

          event.preventDefault();

          sendMessage();

        }

      }
    );


    // =========================
    // KEEP INPUT READY
    // =========================

    input.addEventListener(
      "focus",
      function() {

        input.style.color = "#ffffff";

        input.style.webkitTextFillColor =
          "#ffffff";

      }
    );

  </script>


</body>

</html>`;
