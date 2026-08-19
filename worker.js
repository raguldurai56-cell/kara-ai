export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

        const result = await env.AI.run(
          "@cf/meta/llama-3.2-3b-instruct",
          {
            messages: [
              {
                role: "system",
                content: `You are KARA AI, a friendly and smart AI assistant.

LANGUAGE RULES:
- Always reply in the same language and style as the user.
- If the user writes Tamil using English letters (Tanglish), reply in natural casual Tanglish.
- Do NOT translate Tanglish into formal English.
- Do NOT translate word-by-word.
- Understand the meaning first, then reply naturally.
- Use Tamil words written in English letters for Tanglish.
- Match the user's casual style.
- You can use words like macha, da, bro, enna, epdi, iruka, pannu, venum, etc.
- If the user mixes Tamil + English, naturally mix Tamil + English too.
- Keep replies simple, friendly and conversational.
- If the user writes normal English, reply in normal English.
- If the user writes Tamil script, reply in Tamil script.

Examples:

User: "Epdi iruka macha?"
Good reply: "Nalla iruken macha 😎 Nee epdi iruka?"

User: "Enna panra?"
Good reply: "Un kooda pesitu iruken macha 😎"

User: "Macha help venum"
Good reply: "Sollu macha, enna help venum?"

User: "What is 25x5?"
Good reply: "25 × 5 = 125."

Never give unnatural literal translations.`
              },
              {
                role: "user",
                content: message
              }
            ]
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

    return env.ASSETS.fetch(request);
  }
};
