"use client";

import { useState, useRef, useEffect } from "react";

/**
 * AI chat widget for Zenith. Talks to /api/chat (server-side, keeps
 * the API key off the client). If the backend flags a message as a
 * crisis response, this component surfaces the SOS action prominently
 * instead of just rendering it as a normal chat bubble.
 *
 * Pass `onOpenSOS` — e.g. wire it to the same state that controls
 * <SOSButton />'s modal — so a crisis reply can open it directly.
 */
export default function AIChat({ onOpenSOS }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey — how are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Something went wrong on my end — try again in a moment." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.text, crisis: data.crisis }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Couldn't reach the server — check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div ref={scrollRef} style={styles.scroll}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === "user" ? styles.userBubble : styles.botBubble}>
            {m.text}
            {m.crisis && onOpenSOS && (
              <button onClick={onOpenSOS} style={styles.sosInlineButton}>
                Open SOS support
              </button>
            )}
          </div>
        ))}
        {loading && <div style={styles.botBubble}>…</div>}
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type how you're feeling..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendButton} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#0A0F1F",
    color: "#F5F5F7",
  },
  scroll: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#3FA672",
    color: "#fff",
    borderRadius: "12px 12px 2px 12px",
    padding: "0.6rem 0.9rem",
    maxWidth: "80%",
    fontSize: "0.9rem",
  },
  botBubble: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "12px 12px 12px 2px",
    padding: "0.6rem 0.9rem",
    maxWidth: "80%",
    fontSize: "0.9rem",
    lineHeight: 1.4,
  },
  sosInlineButton: {
    display: "block",
    marginTop: "0.6rem",
    background: "#E24A4A",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 0.8rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.75rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    padding: "0.6rem 0.8rem",
    color: "#F5F5F7",
    fontSize: "0.9rem",
  },
  sendButton: {
    background: "#3FA672",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.6rem 1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
