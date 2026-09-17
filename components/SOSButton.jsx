"use client";

import { useState } from "react";

/**
 * SOS entry point for Tele MANAS — India's free, government-run,
 * 24/7 mental health helpline. This component has NO subscription
 * check, NO usage limit, and NO paywall anywhere in it, intentionally —
 * do not wrap it in any plan/entitlement gate.
 */
export default function SOSButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={styles.fab}
        aria-label="Get immediate support"
      >
        SOS
      </button>

      {open && (
        <div style={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="sos-title">
          <div style={styles.card}>
            <h2 id="sos-title" style={styles.title}>
              You're not alone.
            </h2>
            <p style={styles.body}>
              Tele MANAS is a free, confidential, 24/7 mental health helpline run by the
              Government of India. Trained counsellors are available right now, in your
              language. This is completely free — always.
            </p>

            <a href="tel:14416" style={styles.callButton}>
              Call 14416
            </a>
            <a href="tel:18008914416" style={styles.callButtonSecondary}>
              Call 1-800-891-4416
            </a>

            <p style={styles.note}>
              If you or someone else is in immediate physical danger, please also contact
              local emergency services (112 in India).
            </p>

            <button onClick={() => setOpen(false)} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "1.5rem",
    right: "1.5rem",
    zIndex: 999,
    background: "#E24A4A",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    width: "56px",
    height: "56px",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(226,74,74,0.4)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 15, 31, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1.5rem",
  },
  card: {
    background: "#0A0F1F",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    color: "#F5F5F7",
  },
  title: { fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.75rem" },
  body: { fontSize: "0.95rem", opacity: 0.85, lineHeight: 1.5, marginBottom: "1.5rem" },
  callButton: {
    display: "block",
    padding: "0.9rem",
    borderRadius: "10px",
    background: "#3FA672",
    color: "#fff",
    fontWeight: 600,
    textDecoration: "none",
    marginBottom: "0.75rem",
  },
  callButtonSecondary: {
    display: "block",
    padding: "0.9rem",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    color: "#F5F5F7",
    fontWeight: 500,
    textDecoration: "none",
    marginBottom: "1.25rem",
  },
  note: { fontSize: "0.8rem", opacity: 0.6, marginBottom: "1.25rem", lineHeight: 1.4 },
  closeButton: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
};
