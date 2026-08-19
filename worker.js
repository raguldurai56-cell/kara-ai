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

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content:
                  "You are KARA AI, a friendly, smart and helpful AI assistant. Answer clearly and naturally. Keep answers easy to understand.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          }
        );

        return Response.json({
          reply: result.response,
        });
      } catch (error) {
        return Response.json(
          {
            error: "KARA brain error",
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

    // Website
    return env.ASSETS.fetch(request);
  },
};
