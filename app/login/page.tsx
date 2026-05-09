"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      // Hard navigation so the browser commits the Set-Cookie header
      // before the next request — router.replace() races with the cookie
      window.location.href = "/";
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  }

  return (
    <div className="parchment-bg min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6" style={{ maxWidth: 380, width: "100%" }}>

        {/* Fig Tree logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            border: "2px dashed #C4A882",
            background: "#F5EDD6",
            overflow: "hidden",
          }}>
            <Image src="/images/fig-tree.png" alt="Fig Tree" width={72} height={72}
              style={{ mixBlendMode: "multiply", display: "block" }} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontWeight: 600,
            fontSize: "1.3rem", color: "var(--ink)", textAlign: "center",
          }}>
            Schrebergarten Council
          </h1>
          <p style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "0.8rem", color: "var(--ink-light)", textAlign: "center",
          }}>
            Ask the garden. Hear every voice.
          </p>
        </div>

        {/* Password form */}
        <div style={{
          background: "rgba(255,253,245,0.92)",
          border: "1.5px solid #C4A882",
          borderRadius: 14,
          padding: "24px 28px",
          width: "100%",
          backdropFilter: "blur(4px)",
        }}>
          <label style={{
            fontFamily: "var(--font-sans)", fontSize: "0.68rem",
            fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
            color: "var(--ink-light)", display: "block", marginBottom: 10,
          }}>
            Access password
          </label>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter the garden password"
              className="council-textarea"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}
            />
            {error && (
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "0.75rem",
                color: "#B43228",
              }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-convene"
              disabled={!password.trim() || loading}
            >
              {loading ? "Checking…" : "Enter the Council"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
