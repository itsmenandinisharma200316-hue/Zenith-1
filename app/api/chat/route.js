// app/api/chat/route.js  (Next.js App Router)
//
// Server-side endpoint for the Zenith AI chat companion. Keeps the
// Anthropic API key server-only (set ANTHROPIC_API_KEY in your Vercel
// project's environment variables — never expose it client-side).
//
// Safety design: before we even call the model, we check the incoming
// message for crisis language. If it matches, we skip the model call
// entirely and return a fixed, calm response that points straight to
// Tele MANAS — this is deliberate. A crisis moment isn't the place to
// rely on the model "handling it right"; a hardcoded, tested response
// is more reliable than a generated one, every time.

const CRISIS_PATTERNS = [
  /suicid/i,
  /kill myself/i,
  /end my life/i,
  /want to die/i,
  /don'?t want to (live|be alive)/i,
  /self.?harm/i,
  /hurt(ing)? myself/i,
  /can'?t go on/i,
  /no reason to live/i,
];

const CRISIS_RESPONSE = {
  role: "assistant",
  crisis: true,
  text:
    "I'm really glad you told me this, and I want to make sure you get real support right now — " +
    "more than I can give as an app. Tele MANAS is a free, confidential, 24/7 helpline with trained " +
    "counsellors: call 14416 or 1-800-891-4416, anytime, at no cost. If you're in immediate danger, " +
    "please also contact emergency services (112 in India). Would you like me to open the SOS screen for you?",
};

const SYSTEM_PROMPT = `You are the in-app chat companion for Zenith, a mindfulness app.
Your role is light-touch support: reflective listening, grounding exercises, breathing
techniques, and gentle encouragement toward the app's tracks and tools. You are not a
therapist and do not provide diagnosis, treatment plans, or clinical advice.

If a user expresses distress that is serious but not acute crisis (e.g. general anxiety,
stress, low mood), respond supportively and, where relevant, mention that Tele MANAS
(free, 24/7, 14416) is available if they'd like to talk to a trained counsellor.

Keep responses brief, warm, and conversational — a few sentences, not lectures.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage && CRISIS_PATTERNS.some((re) => re.test(lastUserMessage.content))) {
      return Response.json(CRISIS_RESPONSE);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server is not configured with an API key" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: "Upstream API error", detail: errText }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n") || "";

    return Response.json({ role: "assistant", crisis: false, text });
  } catch (err) {
    return Response.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
