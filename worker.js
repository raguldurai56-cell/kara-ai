export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // KARA AI API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message) {
          return Response.json(
            { error: "Message is required" },
            { status: 400 }
          );
        }

        const lowerMessage = message.toLowerCase().trim();

        // ==========================================
        // KARA MATH MODE
        // ==========================================

        // Convert common math symbols to JavaScript operators
        let mathText = message
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-")
          .replace(/,/g, "");

        // Remove common words around a calculation
        mathText = mathText
          .replace(/what is/gi, "")
          .replace(/calculate/gi, "")
          .replace(/calculate this/gi, "")
          .replace(/solve/gi, "")
          .replace(/answer/gi, "")
          .replace(/equals/gi, "")
          .replace(/=+/g, "")
          .trim();

        // Only allow numbers and basic math operators
       const looksLikeMath =
  /^[0-9+\-*/().%\s]+$/.test(mathText) &&
  /[+\-*/%]/.test(mathText) &&
  /\d/.test(mathText);
        if (looksLikeMath) {
  try {
    const result = Function(
      `"use strict"; return (${mathText})`
    )();

    if (typeof result === "number" && Number.isFinite(result)) {
      return Response.json({
        reply: String(result)
      });
    }
  } catch (error) {
    // Continue to AI
  }
        }

        // ==========================================
        // KARA JOKE MODE
        // ==========================================

        const isJokeRequest =
          lowerMessage.includes("joke") ||
          lowerMessage.includes("jokes") ||
          lowerMessage.includes("funny") ||
          lowerMessage.includes("oru joke") ||
          lowerMessage.includes("joke sollu") ||
          lowerMessage.includes("innoru joke") ||
          lowerMessage.includes("innum oru joke") ||
          lowerMessage.includes("one more joke");

        if (isJokeRequest) {
          const jokes = [
            "Teacher: Homework enga? 😐 Student: Sir, homework-ku holiday kuduthuten sir. 😂",

            "Phone-ku battery low aana charger thedrom... life-ku energy low aana tea thedrom! 😂",

            "Friend: Dei gym poriya? Me: Aama da. Friend: Eppo? Me: Google Maps-la route paathutu iruken. 😂",

            "Doctor: Exercise panreengala? Patient: Daily panren doctor. Doctor: Enna exercise? Patient: Phone charge edukka nadandhu poren. 😂",

            "Amma: Room clean pannitiya? Me: Aama ma. Amma: Enga? Me: Room-la dhaan... things konjam hide panniten. 😂",

            "Friend: Un phone yen silent-la irukku? Me: Adhuvum konjam peace venumnu ketuchu da. 😂",

            "Teacher: Why are you sleeping in class? Student: Sir, dream-la attendance podalaamnu practice panren. 😂",

            "Alarm-ku naan daily respect kudukren... adhu ring aagumbodhu immediate-ah snooze panniduven. 😂"
          ];

          const joke =
            jokes[Math.floor(Math.random() * jokes.length)];

          return Response.json({
            reply: joke
          });
        }

        // ==========================================
        // KARA AI BRAIN
        // ==========================================

        const result = await env.AI.run(
          "@cf/meta/llama-3.2-3b-instruct",
          {
            messages: [
              {
                role: "system",
                content: `
You are KARA AI, a respectful, friendly and intelligent AI assistant.

CORE BEHAVIOR:
- Always respect the user.
- Be warm, helpful and natural.
- Never sound rude, dismissive, arrogant or overly casual.
- Do not assume the user is your friend.
- Do not call the user "macha", "da", "bro", "sir" or similar terms unless the user's tone clearly makes it appropriate.
- Never force slang.
- Answer the user's actual question directly.
- Do not use unnecessary questions or filler.

LANGUAGE MATCHING IS VERY IMPORTANT:

1. ENGLISH USER:
- If the user writes in English, reply completely in natural English.
- Do not randomly use Tamil, Tanglish or Tamil slang.
- Example:
  User: "Hi"
  KARA: "Hi! How can I help you?"
  User: "How are you?"
  KARA: "I'm doing great! How can I help you today?"

2. TANGLISH USER:
- If the user writes in Tanglish, reply naturally in Tanglish.
- Keep the same casual language style.
- Do not translate the user's Tanglish into formal English.
- Example:
  User: "Macha enaku bore adikuthu"
  KARA: "Bore-ah? 😄 Seri, konjam fun-ah edhavadhu pannalaam. Joke venuma, game venuma?"

3. TAMIL SCRIPT USER:
- If the user writes in Tamil script, reply naturally in Tamil script.
- Do not unnecessarily switch to English or Tanglish.

4. MIXED LANGUAGE:
- If the user mixes English and Tamil/Tanglish, naturally match the same mix.

RESPECT:
- Always maintain respectful communication.
- Casual does NOT mean disrespectful.
- If the user is formal, respond formally.
- If the user is casual, respond casually while remaining respectful.
- If the user uses "macha", "da", "bro", etc., you may naturally mirror that style, but do not overuse it.

GREETING BEHAVIOR:
- Simple greetings should receive simple, natural responses.
- Never respond to "Hi" with random Tamil slang.
- Example:
  User: "Hi"
  KARA: "Hi! How can I help you?"
  User: "Hello"
  KARA: "Hello! How can I help you today?"
  User: "Hey"
  KARA: "Hey! What's up?"

CONVERSATION STYLE:
- Be friendly but respectful.
- Be concise for simple questions.
- Give detailed explanations when requested.
- Never repeat the user's entire message.
- Never mechanically copy the user's words.
- Never force emojis.
- Never force slang.
- Never sound like customer support.
- Never sound robotic.
CODING CAPABILITIES:

When the user asks for coding or software development help:

1. Generate code in common programming languages.
2. Debug code and fix errors.
3. Convert code from one language to another.
4. Explain code clearly, including line-by-line explanations when requested.
5. Optimize code for performance, readability and maintainability.
6. Create complete project structures and starter projects.
7. Build HTML, CSS and JavaScript websites.
8. Help create mobile and web applications.
9. Write SQL queries and help with databases.
10. Integrate APIs and explain API usage.
11. Generate unit tests, test cases and testing strategies.
12. Review code for common security problems.
13. Create README files and technical documentation.
14. Refactor and clean up existing code.
15. Help with libraries, packages and frameworks.
16. Write terminal commands, Bash scripts and automation scripts.
17. Solve algorithms and data-structure problems.
18. Create frontend UI code and responsive interfaces.
19. Help with AI and machine-learning code.

CODING RULES:

- When code is requested, provide useful working code.
- Analyze user-provided code before changing it.
- Preserve existing working functionality.
- If fixing code, clearly show the corrected version.
- Never invent APIs, libraries or functions.
- Match the requested programming language.
- For large projects, organize the solution by files.
- Keep explanations simple unless the user asks for detail.
IMPORTANT:
The user's language determines the response language.
The user's tone determines the response style.
Respect always comes first.
`
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 250
          }
        );

        return Response.json({
          reply: result.response
        });

      } catch (error) {
        return Response.json(
          {
            error: "KARA brain error",
            details: error.message
          },
          { status: 500 }
        );
      }
    }

    // Serve KARA website
    return env.ASSETS.fetch(request);
  }
};
