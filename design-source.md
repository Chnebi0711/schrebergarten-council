# Schrebergarten Council — Frontend Source Files

This file bundles all frontend source code for design review.
Stack: Next.js 15 · TypeScript · Tailwind CSS · custom CSS · Lora (serif) + Inter (sans) fonts.

---

## Design Tokens (colour palette)

```
--parchment:      #F5EDD6   warm paper base
--parchment-mid:  #EDE0C0
--parchment-dark: #D9C8A0
--ink:            #3D2B1F   dark brown text
--ink-light:      #6B4F3A
--ink-faint:      #A08060   placeholder / muted
--golden:         #C4A882   borders, dividers, rings
--sage:           #5A7A52   forest green accent
--sage-dark:      #3C6B35   buttons, Fig Tree
```

Background: garden photograph at 32 % opacity over the parchment base colour.
Fonts: **Lora** (serif, headings & italic labels) · **Inter** (sans, body & UI).

---

## Agent roster

| ID | Name | Represents | Emoji |
|---|---|---|---|
| pollinator | Pollinator | Bees, butterflies & hoverflies | 🐝 |
| soil | Soil | Microbes, worms & root ecosystems | 🪱 |
| hedgehog | Hedgehog | Animals living in the garden | 🦔 |
| snail | Snail | Species seen as pests, seeking coexistence | 🐌 |
| biodiversity | Biodiversity | Edge species, native plants & habitat corridors | 🌿 |
| neighbor | Neighbor | Adjacent gardeners & community | 🏡 |
| — | Fig Tree | Moderator / synthesiser (always present) | 🌳 |

Each agent has a circular portrait image (`/images/<id>.png`) rendered with `mix-blend-mode: multiply` so it integrates with the parchment background.

---

## App structure — two views

**View 1 — Selection**
- Title + subtitle
- Council circle (460 × 460 px): Fig Tree at centre, 6 agents on a 165 px radius orbit
- Dashed SVG orbit ring + spoke lines from centre to each agent
- Click an agent to toggle them in/out (dimmed = excluded)
- Question textarea + "Convene the council" button (italic serif, forest green)

**View 2 — Deliberation**
- Same circle, only selected agents shown, speaking agent gets a green pulse ring
- Question shown in a left-bordered italic quote box
- Speech card below circle: current speaker label + word-by-word revealed text
- Completed agents collapse into expandable `<details>` rows
- Fig Tree synthesis card (dark green) with Save button
- "← New question" ghost button

---

## `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Design tokens ──────────────────────────────────────── */
:root {
  --parchment:      #F5EDD6;
  --parchment-mid:  #EDE0C0;
  --parchment-dark: #D9C8A0;
  --ink:            #3D2B1F;
  --ink-light:      #6B4F3A;
  --ink-faint:      #A08060;
  --golden:         #C4A882;
  --sage:           #5A7A52;
  --sage-dark:      #3C6B35;
  --sage-glow:      rgba(74, 155, 74, 0.55);
  --font-serif:     var(--font-lora), Georgia, serif;
  --font-sans:      var(--font-inter), system-ui, sans-serif;
}

/* ─── Base ───────────────────────────────────────────────── */
html, body {
  background-color: var(--parchment);
  color: var(--ink);
  font-family: var(--font-sans);
}

/* ─── Background image + parchment tint ─────────────────── */
.parchment-bg {
  background-color: transparent;
  min-height: 100dvh;
  position: relative;
  isolation: isolate;
}

.parchment-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: url("/images/background.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.32;
}

/* ─── Council circle ─────────────────────────────────────── */
.council-container {
  position: relative;
  width: 460px;
  height: 460px;
  flex-shrink: 0;
}

.agent-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: opacity 0.25s, transform 0.25s;
  user-select: none;
}

.agent-node:hover .agent-img-wrap { transform: scale(1.08); }
.agent-node.inactive              { opacity: 0.35; }
.agent-node.inactive:hover        { opacity: 0.55; }

.agent-img-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.agent-img-wrap img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  mix-blend-mode: multiply;
  display: block;
}

/* Selection ring — amber */
.agent-ring-select {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2.5px solid #C4A882;
  transition: border-color 0.2s, box-shadow 0.2s;
  pointer-events: none;
}

.agent-node.active .agent-ring-select {
  border-color: #A07840;
  box-shadow: 0 0 0 3px rgba(160, 120, 64, 0.18);
}

/* Speaking ring — green pulse */
.agent-ring-speak {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2.5px solid var(--sage);
  pointer-events: none;
  animation: speak-pulse 1.6s ease-in-out infinite;
}

@keyframes speak-pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--sage-glow); border-color: var(--sage); }
  50%       { box-shadow: 0 0 0 12px rgba(74,155,74,0); border-color: var(--sage-dark); }
}

/* Fig Tree centre node */
.figtree-node {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 2;
}

.figtree-img-wrap { position: relative; width: 100px; height: 100px; border-radius: 50%; }

.figtree-img-wrap img {
  width: 100%; height: 100%;
  border-radius: 50%; object-fit: cover;
  mix-blend-mode: multiply; display: block;
}

.figtree-ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px dashed var(--golden);
  pointer-events: none;
}

.figtree-ring.speaking {
  border-style: solid;
  border-color: var(--sage);
  animation: speak-pulse 1.6s ease-in-out infinite;
}

/* ─── Cards ──────────────────────────────────────────────── */
.speech-card {
  background: rgba(255, 253, 245, 0.92);
  border: 1.5px solid var(--golden);
  border-radius: 14px;
  backdrop-filter: blur(4px);
}

.synthesis-card {
  background: rgba(45, 80, 35, 0.92);
  border: 2px solid var(--sage-dark);
  border-radius: 16px;
  color: #DFF0D8;
}

/* ─── Buttons ────────────────────────────────────────────── */
.btn-convene {
  background: var(--sage-dark);
  color: #F0F7EC;
  border: none;
  border-radius: 10px;
  padding: 12px 32px;
  font-family: var(--font-serif);
  font-size: 1rem;
  font-style: italic;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(60, 107, 53, 0.22);
}

.btn-convene:hover:not(:disabled) {
  background: #2D5A27;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(60, 107, 53, 0.3);
}

.btn-convene:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  border: 1.5px solid var(--golden);
  color: var(--ink-light);
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-ghost:hover { background: var(--parchment-mid); color: var(--ink); }

/* ─── Textarea ───────────────────────────────────────────── */
.council-textarea {
  background: rgba(255, 253, 245, 0.7);
  border: 1.5px solid var(--golden);
  border-radius: 10px;
  color: var(--ink);
  font-size: 0.9rem;
  padding: 12px 16px;
  resize: none;
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.council-textarea:focus {
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(90, 122, 82, 0.15);
}

.council-textarea::placeholder { color: var(--ink-faint); font-style: italic; }

/* ─── Quote box ──────────────────────────────────────────── */
.question-quote {
  border-left: 3px solid var(--golden);
  padding: 10px 16px;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--ink-light);
  background: rgba(196, 168, 130, 0.1);
  border-radius: 0 8px 8px 0;
}

/* ─── Scrollbar ──────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--parchment-mid); }
::-webkit-scrollbar-thumb { background: var(--golden); border-radius: 3px; }
```

---

## `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora  = Lora({ variable: "--font-lora",  subsets: ["latin"], style: ["normal","italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Schrebergarten Council",
  description: "A garden council where non-human and human voices weigh in on your plans.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## `app/page.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { callAgent, callModerator, callOpening } from "@/lib/api";
import { speak, stopSpeech } from "@/lib/speech";
import { AgentId, AgentResponse } from "@/lib/types";
import ApiKeyGate from "@/components/ApiKeyGate";
import CouncilCircle from "@/components/CouncilCircle";

type View = "selection" | "deliberation";
const ALL_AGENT_IDS = AGENTS.map((a) => a.id) as AgentId[];

function wordReveal(text, onUpdate, intervalRef) {
  return new Promise((resolve) => {
    const words = text.split(/\s+/).filter(Boolean);
    let i = 0;
    const id = setInterval(() => {
      i++;
      onUpdate(words.slice(0, i).join(" "));
      if (i >= words.length) { clearInterval(id); intervalRef.current = null; resolve(); }
    }, 38);
    intervalRef.current = id;
  });
}

function speakAsync(text, agentId, muted, signal) {
  if (muted || signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    speak(text, agentId, resolve);
    signal.addEventListener("abort", () => resolve(), { once: true });
  });
}

export default function Home() {
  const [apiKey, setApiKey]         = useState(null);
  const [view, setView]             = useState("selection");
  const [activeAgents, setActiveAgents] = useState(new Set(ALL_AGENT_IDS));
  const [question, setQuestion]     = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [openingText, setOpeningText]   = useState("");
  const [responses, setResponses]   = useState([]);
  const [moderatorText, setModeratorText] = useState("");
  const [isRunning, setIsRunning]   = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [speakerLabel, setSpeakerLabel] = useState("");
  const [currentText, setCurrentText]   = useState("");
  const [muted, setMuted]           = useState(false);
  const abortRef       = useRef(null);
  const revealTimerRef = useRef(null);

  // ... (full state machine — see repo for complete runCouncil implementation)

  return (
    <div className="parchment-bg">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(245,237,214,0.88)", backdropFilter: "blur(8px)",
                 borderBottom: "1px solid var(--golden)" }}>
        <div className="flex items-center gap-2">
          <Image src="/images/fig-tree.png" alt="" width={28} height={28}
            className="rounded-full opacity-80" style={{ mixBlendMode:"multiply" }} />
          <span style={{ color:"var(--sage-dark)", fontFamily:"var(--font-serif)" }}
            className="text-sm font-semibold">Schrebergarten Council</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Stop button (only while running), mute toggle, change key */}
        </div>
      </header>

      {/* ════ VIEW 1 — SELECTION ════ */}
      {view === "selection" && (
        <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-8">

          <div className="text-center">
            <h1 className="text-3xl font-semibold"
              style={{ fontFamily:"var(--font-serif)", color:"var(--ink)" }}>
              Schrebergarten Council
            </h1>
            <p className="text-sm italic" style={{ color:"var(--ink-light)" }}>
              Ask the garden. Hear every voice.
            </p>
          </div>

          <CouncilCircle activeAgents={activeAgents} speakingId={null}
            mode="selection" onToggle={toggleAgent} />

          <p className="text-xs" style={{ color:"var(--ink-faint)" }}>
            Click a council member to include or exclude them.
          </p>

          <div className="w-full max-w-lg flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color:"var(--ink-light)" }}>Your question for the council</label>
            <textarea className="council-textarea" rows={3}
              placeholder="What should I plant near the compost heap?" />
            <button className="btn-convene self-center">Convene the council</button>
          </div>
        </main>
      )}

      {/* ════ VIEW 2 — DELIBERATION ════ */}
      {view === "deliberation" && (
        <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-7">

          {/* Question quote */}
          <div className="w-full max-w-lg">
            <div className="question-quote">&ldquo;{lastQuestion}&rdquo;</div>
          </div>

          {/* Circle — only selected agents, speaking agent glows */}
          <CouncilCircle activeAgents={activeAgents} speakingId={speakingId}
            mode="deliberation" />

          {/* Current speaker card */}
          <div className="speech-card w-full max-w-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold"
                style={{ fontFamily:"var(--font-serif)" }}>{speakerLabel}</span>
              {/* animated loading dots */}
            </div>
            <p className="text-sm leading-relaxed" style={{ color:"var(--ink-light)" }}>
              {currentText || <em style={{ color:"var(--ink-faint)" }}>Gathering thoughts…</em>}
            </p>
          </div>

          {/* Past voices — collapsible */}
          {responses.map((r) => (
            <details key={r.agentId}>
              <summary>{/* agent image + name */}</summary>
              <div>{r.text}</div>
            </details>
          ))}

          {/* Fig Tree synthesis */}
          {moderatorText && (
            <div className="synthesis-card w-full max-w-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/fig-tree.png" alt="Fig Tree" width={36} height={36}
                  className="rounded-full" style={{ mixBlendMode:"screen" }} />
                <div>
                  <span className="text-sm font-semibold block"
                    style={{ color:"#A8D8A0", fontFamily:"var(--font-serif)" }}>Fig Tree</span>
                  <span className="text-xs" style={{ color:"#6B9E63" }}>
                    Synthesis · The garden as a whole</span>
                </div>
                <button className="ml-auto …">↓ Save</button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color:"#DFF0D8" }}>{moderatorText}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-10">
            <button className="btn-ghost">← New question</button>
            {moderatorText && <button className="btn-ghost">↓ Download session</button>}
          </div>
        </main>
      )}
    </div>
  );
}
```

---

## `components/CouncilCircle.tsx`

```tsx
"use client";

import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { AgentId } from "@/lib/types";

// Geometry
const CX = 230, CY = 230, R = 165, SIZE = 460;

const AGENT_ANGLES = {
  pollinator: -90, soil: -30, hedgehog: 30,
  snail: 90, biodiversity: 150, neighbor: 210,
};

function agentPos(id) {
  const rad = (AGENT_ANGLES[id] * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function spokePoint(pos, offset) {
  const dx = pos.x - CX, dy = pos.y - CY;
  const dist = Math.sqrt(dx*dx + dy*dy), t = offset / dist;
  return { x: CX + dx*t, y: CY + dy*t };
}

export default function CouncilCircle({ activeAgents, speakingId, mode, onToggle }) {
  const visibleAgents = mode === "deliberation"
    ? AGENTS.filter(a => activeAgents.has(a.id))
    : AGENTS;

  return (
    <div className="council-container mx-auto" style={{ width: SIZE, height: SIZE }}>

      {/* SVG: dashed orbit ring + spokes */}
      <svg width={SIZE} height={SIZE} className="absolute inset-0 pointer-events-none">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#C4A882"
          strokeWidth="1.2" strokeDasharray="7 6" opacity="0.6" />
        {visibleAgents.map(agent => {
          const pos = agentPos(agent.id);
          const start = spokePoint(pos, 54), end = spokePoint(pos, R - 52);
          return <line key={agent.id}
            x1={start.x} y1={start.y} x2={end.x} y2={end.y}
            stroke="#C4A882" strokeWidth="1" strokeDasharray="4 5"
            opacity={activeAgents.has(agent.id) ? 0.55 : 0.2} />;
        })}
      </svg>

      {/* Fig Tree — centre */}
      <div className="figtree-node">
        <div className="figtree-img-wrap">
          <Image src="/images/fig-tree.png" alt="Fig Tree" width={100} height={100}
            className="rounded-full" style={{ mixBlendMode:"multiply" }} />
          <div className={`figtree-ring ${speakingId === "moderator" ? "speaking" : ""}`} />
        </div>
        <span style={{ color:"var(--sage-dark)", fontFamily:"var(--font-serif)",
          fontSize:"0.7rem", fontWeight:600 }}>Fig Tree</span>
      </div>

      {/* Agent nodes */}
      {visibleAgents.map(agent => {
        const pos = agentPos(agent.id);
        const isActive   = activeAgents.has(agent.id);
        const isSpeaking = speakingId === agent.id;
        return (
          <div key={agent.id}
            className={`agent-node ${isActive ? "active" : "inactive"}`}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => mode === "selection" && onToggle?.(agent.id)}>
            <div className="agent-img-wrap">
              <Image src={agent.image} alt={agent.name} width={80} height={80}
                className="rounded-full" style={{ mixBlendMode:"multiply" }} />
              {!isSpeaking && <div className="agent-ring-select" />}
              {isSpeaking  && <div className="agent-ring-speak"  />}
            </div>
            <span style={{ fontSize:"0.7rem", fontWeight:600,
              color: isActive ? "var(--ink)" : "var(--ink-faint)" }}>
              {agent.emoji} {agent.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

---

## `components/ApiKeyGate.tsx`

```tsx
"use client";
import { useState } from "react";

export default function ApiKeyGate({ onSave }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed.startsWith("sk-ant-")) { setError("Key should start with sk-ant-"); return; }
    localStorage.setItem("sc_api_key", trimmed);
    onSave(trimmed);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--parchment)" }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily:"var(--font-serif)" }}>
            Schrebergarten Council</h1>
          <p className="text-sm mt-2" style={{ color:"var(--ink-light)" }}>
            A garden council where non-human and human voices weigh in on your plans.</p>
        </div>
        <div className="bg-white/80 rounded-2xl border p-6"
          style={{ borderColor:"var(--golden)" }}>
          <h2 className="text-sm font-medium mb-1" style={{ color:"var(--ink)" }}>
            Anthropic API Key</h2>
          <p className="text-xs mb-4" style={{ color:"var(--ink-faint)" }}>
            Your key is stored only in this browser. No server involved.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" value={value}
              onChange={e => { setValue(e.target.value); setError(""); }}
              placeholder="sk-ant-…" className="council-textarea" style={{ resize:"none" }} />
            {error && <p className="text-xs" style={{ color:"#B43228" }}>{error}</p>}
            <button type="submit" className="btn-convene w-full">Enter the Council</button>
          </form>
        </div>
        <p className="text-center text-xs mt-4" style={{ color:"var(--ink-faint)" }}>
          Get a key at <span className="font-mono">console.anthropic.com</span></p>
      </div>
    </div>
  );
}
```

---

## Images in `/public/images/`

| File | Used for |
|---|---|
| `background.png` | Full-page background (opacity 0.32) |
| `fig-tree.png` | Fig Tree centre node + header icon |
| `bee.png` | Pollinator |
| `soil.png` | Soil |
| `hedgehog.png` | Hedgehog |
| `snail.png` | Snail |
| `biodiversity.png` | Biodiversity |
| `neighbor.png` | Neighbor |

All agent images rendered with `mix-blend-mode: multiply` so white backgrounds dissolve into the parchment.
