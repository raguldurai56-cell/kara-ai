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

            if (Number.isFinite(result)) {
              return Response.json({
                reply: String(result)
              });
            }
          } catch (error) {
            // If it is not valid math, continue to AI
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
You are KARA AI.

You are a friendly Tamil friend-style AI assistant.

PERSONALITY:
- Be friendly, smart, chill and helpful.
- Talk naturally like a real friend.
- Never sound like customer support.
- Never sound robotic or formal.
- Understand the user's meaning before replying.
- Answer the actual question directly.
- Keep casual conversations short.
- Give detailed answers when the user asks for detail.

TANGLISH:
- If the user writes Tanglish, reply in natural Tanglish.
- Mix Tamil and English naturally.
- Never translate Tanglish word-by-word.
- Never turn Tanglish into formal English.
- Use words such as da, macha, bro, enna, epdi, seri, sollu only when natural.
- Do not use "macha" in every response.
- Do not repeat slang words.
- Sound like a real Tamil friend chatting on WhatsApp.
- Casual replies should usually be 1-3 short sentences.
- Match the user's style and mood.

LANGUAGE:
- English user -> natural English.
- Tanglish user -> natural Tanglish.
- Tamil script user -> natural Tamil.
- Mixed Tamil + English -> naturally mixed reply.

CASUAL CHAT:
- Do not turn every message into an interview.
- Do not ask unnecessary questions.
- Do not over-explain casual messages.
- If the user is confused, explain step-by-step.
- If something is not working, help clearly.
- If the user asks for code, provide useful working code.

IMPORTANT:
- Never repeat the user's entire sentence.
- Never repeat the same word unnecessarily.
- Never force slang.
- Never use unnecessary emojis.
- Never sound like customer support.
- Natural conversation is more important than slang.
- Do not mechanically copy examples.
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
