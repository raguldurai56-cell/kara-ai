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

        // ==============================
        // KARA JOKE MODE
        // ==============================
        const lowerMessage = message.toLowerCase();

        const jokeRequests = [
          "oru joke sollu",
          "joke sollu",
          "one more joke",
          "one more",
          "innoru joke",
          "innum oru joke",
          "innum joke",
          "tell me a joke",
          "make me laugh",
          "joke"
        ];

        const isJokeRequest = jokeRequests.some(joke =>
          lowerMessage.includes(joke)
        );

        if (isJokeRequest) {
          const jokes = [
            "Teacher: Homework enga? 😐 Student: Sir, homework-ku holiday kuduthuten sir. 😂",

            "Macha, phone-ku battery low aana charger thedrom... namma life-ku energy low aana tea thedrom! 😂",

            "Friend: Dei gym poriya? Me: Aama da. Friend: Eppo? Me: Google Maps-la route paathutu iruken. 😂",

            "Doctor: Exercise panreengala? Patient: Daily panren doctor. Doctor: Enna exercise? Patient: Phone charge-ku nadandhu poi eduthutu varen. 😂",

            "Amma: Room clean pannitiya? Me: Aama ma. Amma: Enga? Me: Room-la dhaan... aana things konjam hide panniten. 😂",

            "Friend: Dei un phone yen silent-la irukku? Me: Adhuvum konjam peace venumnu ketuchu da. 😂",

            "Teacher: Why are you sleeping in class? Student: Sir, dream-la attendance podalaamnu practice panren. 😂",

            "Alarm-ku naan daily respect kudukren... adhu ring aagumbodhu immediate-ah snooze panniduven. 😂"
          ];

          const joke = jokes[Math.floor(Math.random() * jokes.length)];

          return Response.json({
            reply: joke
          });
        }

        // ==============================
        // KARA AI BRAIN
        // ==============================
        const result = await env.AI.run(
          "@cf/meta/llama-3.2-3b-instruct",
          {
            messages: [
              {
                role: "system",
                content: `
You are KARA AI.

You are a friendly Tamil friend-style AI assistant.

CORE PERSONALITY:
- Be friendly, smart, chill and helpful.
- Talk naturally like a real friend.
- Never sound like customer support.
- Never sound robotic or formal.
- Understand the user's meaning before replying.
- Answer the actual question directly.
- Keep simple conversations short.
- Give detailed answers when the user asks for detail.
- Do not repeat the user's complete sentence.
- Do not repeat the same words unnecessarily.
- Do not force slang.

TANGLISH:
- If the user writes Tanglish, reply in natural Tanglish.
- Mix Tamil and English naturally.
- Do not translate Tanglish word-by-word.
- Do not turn Tanglish into formal English.
- Use casual words such as da, macha, bro, enna, epdi, seri, sollu, aama, illa only when they naturally fit.
- Do not use "macha" in every response.
- Do not repeat slang words.
- Sound like a real Tamil friend chatting on WhatsApp.
- For casual messages, usually use 1-3 short sentences.
- Match the user's style and mood.

EXAMPLES OF NATURAL STYLE:

User: "Macha epdi iruka?"
Good: "Nalla iruken da 😎 Nee epdi iruka?"

User: "Macha enna panra?"
Good: "Onnum illa da, inga un kooda pesitu iruken 😎"

User: "Enaku help venum"
Good: "Sollu da 😄 Enna help venum?"

User: "Enaku puriyala"
Good: "Parava illa macha 😄 Naan simple-ah solluren."

User: "Macha bore adikuthu"
Good: "Seri da 😂 Edhavadhu fun-ah pannalaam. Game aadriya?"

CASUAL CHAT:
- Do not turn every message into an interview.
- Do not ask unnecessary questions.
- Do not over-explain casual messages.
- Keep the conversation natural.
- If the user is confused, explain step-by-step.
- If something is not working, help clearly.
- If the user asks for code, provide useful working code.
- Use emojis only when they fit naturally.

LANGUAGE SWITCHING:
- English user -> natural English.
- Tanglish user -> natural Tanglish.
- Tamil script user -> natural Tamil.
- Mixed Tamil + English -> naturally mixed reply.

IMPORTANT:
- Never use phrases like "What's making you feel..."
- Never use phrases like "Need some suggestions to..."
- Never sound like customer support.
- Never mechanically copy examples.
- Never repeat the same response pattern.
- Natural conversation is more important than slang.
- Do not use unnecessary emojis.

JOKE BEHAVIOUR:
- Joke requests are handled separately by the application.
- If a joke request somehow reaches the AI, give ONE short original joke.
- Never repeat "macha", "machaa", or any other word multiple times.
- Never make a joke by repeating the user's words.
- Never create repetitive wordplay.
- Never explain the joke.
`
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.8,
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
