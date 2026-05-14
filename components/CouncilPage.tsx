"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { callAgent, callModerator, callOpening } from "@/lib/api";
import { speak, stopSpeech, unlockSpeech } from "@/lib/speech";
import { AgentId, AgentResponse } from "@/lib/types";
import { Lang, translations } from "@/lib/i18n";
import CouncilCircle from "@/components/CouncilCircle";

type View = "selection" | "deliberation";

const ALL_AGENT_IDS = AGENTS.map((a) => a.id) as AgentId[];

// ── Word-reveal helper ──────────────────────────────────────
function wordReveal(
  text: string,
  onUpdate: (s: string) => void,
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
): Promise<void> {
  return new Promise((resolve) => {
    const words = text.split(/\s+/).filter(Boolean);
    let i = 0;
    const id = setInterval(() => {
      i++;
      onUpdate(words.slice(0, i).join(" "));
      if (i >= words.length) {
        clearInterval(id);
        intervalRef.current = null;
        resolve();
      }
    }, 38); // ~26 words/sec
    intervalRef.current = id;
  });
}

// ── Speech helper — awaitable, resolves on completion or abort ──
function speakAsync(
  text: string,
  agentId: string,
  muted: boolean,
  signal: AbortSignal,
  lang = "en"
): Promise<void> {
  if (muted || signal.aborted) return Promise.resolve();
  return new Promise<void>((resolve) => {
    speak(text, agentId, resolve, lang);
    signal.addEventListener("abort", () => resolve(), { once: true });
  });
}

// ── Main page ───────────────────────────────────────────────
export default function CouncilPage() {
  // Language
  const [lang, setLang] = useState<Lang>("en");

  // View
  const [view, setView] = useState<View>("selection");

  // Selection state
  const [activeAgents, setActiveAgents] = useState<Set<AgentId>>(
    new Set(ALL_AGENT_IDS)
  );
  const [question, setQuestion] = useState("");

  // Deliberation state
  const [lastQuestion, setLastQuestion]   = useState("");
  const [openingText,  setOpeningText]    = useState("");
  const [responses,    setResponses]      = useState<AgentResponse[]>([]);
  const [moderatorText, setModeratorText] = useState("");
  const [isRunning,    setIsRunning]      = useState(false);

  // Speaking + word-reveal
  const [speakingId,   setSpeakingId]  = useState<AgentId | "moderator" | null>(null);
  const [speakerLabel, setSpeakerLabel] = useState("");
  const [currentText,  setCurrentText]  = useState("");

  // Audio
  const [muted, setMuted] = useState(false);

  // Refs
  const abortRef       = useRef<AbortController | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Persist settings ──────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem("sc_muted") === "true") setMuted(true);
    const savedLang = localStorage.getItem("sc_lang");
    if (savedLang === "de") setLang("de");
  }, []);

  // Convenience: current translation bundle
  const t = translations[lang];

  function toggleLang() {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "de" : "en";
      localStorage.setItem("sc_lang", next);
      return next;
    });
  }

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("sc_muted", String(next));
      if (next) stopSpeech();
      return next;
    });
  }

  // ── Agent toggle ──────────────────────────────────────────
  function toggleAgent(id: AgentId) {
    setActiveAgents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ── Stop council ──────────────────────────────────────────
  function stopCouncil() {
    abortRef.current?.abort();
    abortRef.current = null;
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    stopSpeech();
    setIsRunning(false);
    setSpeakingId(null);
    setCurrentText("");
  }

  // ── Reset to selection ────────────────────────────────────
  function newQuestion() {
    stopCouncil();
    setOpeningText("");
    setResponses([]);
    setModeratorText("");
    setLastQuestion("");
    setView("selection");
  }

  // ── Download session ─────────────────────────────────────
  function downloadSession() {
    const locale = lang === "de" ? "de-CH" : "en-CH";
    const date = new Date().toLocaleDateString(locale, {
      year: "numeric", month: "long", day: "numeric",
    });
    const agentLines = responses
      .filter((r) => r.status === "done" && r.text)
      .map((r) => {
        const agent = AGENTS.find((a) => a.id === r.agentId)!;
        return `### ${agent.emoji} ${agent.name}\n*${agent.represents}*\n\n${r.text}`;
      })
      .join("\n\n---\n\n");

    const content = [
      `# ${t.mdTitle}`,
      `*${date}*`,
      ``,
      `## ${t.mdQuestion}`,
      `> ${lastQuestion}`,
      ``,
      openingText ? `## ${t.mdOpening}\n*${t.figTree}:* ${openingText}\n` : "",
      `## ${t.mdVoices}`,
      ``,
      agentLines,
      ``,
      `---`,
      ``,
      `## 🌳 ${t.mdSynthesis}`,
      ``,
      moderatorText,
    ]
      .filter((l) => l !== undefined)
      .join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `council-${date.replace(/\s/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Run council ───────────────────────────────────────────
  async function runCouncil() {
    if (!question.trim() || isRunning) return;

    // Unlock iOS speech synthesis — must happen synchronously inside the
    // user gesture (button tap) before any await.
    if (!muted) unlockSpeech();

    // Capture translations at call time so label language stays
    // consistent throughout the session even if user switches mid-run
    const T = translations[lang];

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    const q = question.trim();
    setLastQuestion(q);
    setQuestion("");
    setOpeningText("");
    setResponses([]);
    setModeratorText("");
    setCurrentText("");
    setSpeakingId(null);
    setIsRunning(true);
    setView("deliberation");
    stopSpeech();

    const activeAgentList = AGENTS.filter((a) => activeAgents.has(a.id));

    // ── Opening (Fig Tree) ──
    try {
      setSpeakingId("moderator");
      setSpeakerLabel(`🌳 ${T.figTree}`);
      setCurrentText("");

      const opening = await callOpening(
        q,
        activeAgentList.map((a) => a.id),
        signal,
        lang
      );

      await Promise.all([
        wordReveal(opening, setCurrentText, revealTimerRef),
        speakAsync(opening, "moderator", muted, signal, lang),
      ]);
      setOpeningText(opening);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setIsRunning(false);
        return;
      }
    }

    if (signal.aborted) { setIsRunning(false); return; }

    // ── Each agent ──
    const finalResponses: AgentResponse[] = [];

    for (const agent of activeAgentList) {
      if (signal.aborted) break;

      setSpeakingId(agent.id);
      setSpeakerLabel(agent.name);
      setCurrentText("");

      try {
        const text = await callAgent(agent.id, q, signal, lang);

        if (signal.aborted) break;

        await Promise.all([
          wordReveal(text, setCurrentText, revealTimerRef),
          speakAsync(text, agent.id, muted, signal, lang),
        ]);

        const done: AgentResponse = { agentId: agent.id, text, status: "done" };
        finalResponses.push(done);
        setResponses([...finalResponses]);
      } catch (err) {
        if ((err as Error).name === "AbortError") break;
        const message = err instanceof Error ? err.message : "Unknown error";
        finalResponses.push({ agentId: agent.id, text: message, status: "error" });
        setResponses([...finalResponses]);
      }
    }

    if (signal.aborted) { setIsRunning(false); return; }

    // ── Fig Tree synthesis ──
    try {
      setSpeakingId("moderator");
      setSpeakerLabel(`🌳 ${T.figTree}`);
      setCurrentText("");

      const synthesis = await callModerator(q, finalResponses, signal, lang);

      if (!signal.aborted) {
        await Promise.all([
          wordReveal(synthesis, setCurrentText, revealTimerRef),
          speakAsync(synthesis, "moderator", muted, signal, lang),
        ]);
        setModeratorText(synthesis);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        const message = err instanceof Error ? err.message : "Unknown error";
        setModeratorText(`${T.figTree} is silent. (${message})`);
      }
    }

    setSpeakingId(null);
    setSpeakerLabel("");
    setCurrentText("");
    setIsRunning(false);
    abortRef.current = null;
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="parchment-bg">

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between"
        style={{
          padding: "16px 20px",
          background: "rgba(245,237,214,0.88)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(196,168,130,0.5)",
        }}
      >
        <div className="flex items-center gap-2">
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "1.5px dashed #C4A882",
            background: "#F5EDD6",
            overflow: "hidden", flexShrink: 0,
          }}>
            <Image src="/images/fig-tree.png" alt="" aria-hidden="true"
              width={28} height={28}
              style={{ mixBlendMode: "multiply", display: "block" }} />
          </div>
          <span style={{
            fontFamily: "var(--font-serif)", fontWeight: 600,
            fontSize: "0.82rem", color: "#3C6B35",
          }}>
            Schrebergarten Council
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <button onClick={stopCouncil}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "rgba(180,50,40,0.08)", border: "1px solid rgba(180,50,40,0.35)", color: "#B43228" }}
            >
              {t.stopBtn}
            </button>
          )}

          {/* ── Language toggle ── */}
          <button
            onClick={toggleLang}
            aria-label={lang === "en" ? "Auf Deutsch wechseln" : "Switch to English"}
            style={{
              display: "flex", alignItems: "center", gap: "2px",
              fontFamily: "var(--font-sans)", fontSize: "0.72rem",
              letterSpacing: "0.04em", background: "none", border: "none",
              cursor: "pointer", padding: "2px 0",
            }}
          >
            <span style={{
              fontWeight: lang === "en" ? 700 : 400,
              color: lang === "en" ? "var(--ink)" : "var(--ink-faint)",
              transition: "color 0.15s, font-weight 0.15s",
            }}>EN</span>
            <span style={{ color: "var(--ink-faint)", margin: "0 1px" }}>·</span>
            <span style={{
              fontWeight: lang === "de" ? 700 : 400,
              color: lang === "de" ? "var(--ink)" : "var(--ink-faint)",
              transition: "color 0.15s, font-weight 0.15s",
            }}>DE</span>
          </button>

          <button onClick={toggleMute}
            aria-label={muted ? t.unmuteTitle : t.muteTitle}
            title={muted ? t.unmuteTitle : t.muteTitle}
            className="text-sm transition-colors" style={{ color: "var(--ink-faint)" }}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          PAGE 1 — SELECTION
      ════════════════════════════════════════════ */}
      {view === "selection" && (
        <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-8">

          {/* Title block */}
          <div className="flex flex-col items-center gap-3">
            <h1 style={{
              fontFamily: "var(--font-serif)", fontWeight: 600,
              fontSize: "1.7rem", color: "var(--ink)", textAlign: "center",
            }}>
              Schrebergarten Council
            </h1>
            <p style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "0.82rem", color: "var(--ink-light)",
            }}>
              {t.tagline}
            </p>
            <div className="deco-divider" aria-hidden="true">
              <span>✦</span>
            </div>
          </div>

          {/* Council circle */}
          <div className="flex flex-col items-center gap-3">
            <CouncilCircle
              activeAgents={activeAgents}
              speakingId={null}
              mode="selection"
              size={380}
              onToggle={toggleAgent}
              figtreeLabel={t.figTree}
            />
            <p style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "0.72rem", color: "var(--ink-faint)",
            }}>
              {t.circleHint}
            </p>
          </div>

          {/* Question + convene */}
          <div className="w-full max-w-lg flex flex-col gap-3">
            <label htmlFor="question" style={{
              fontFamily: "var(--font-sans)", fontSize: "0.68rem",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
              color: "var(--ink-light)",
            }}>
              {t.questionLabel}
            </label>
            <textarea
              id="question"
              className="council-textarea"
              rows={3}
              placeholder={t.questionPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runCouncil(); }
              }}
            />
            <button className="btn-convene self-center" disabled={!question.trim()} onClick={runCouncil}>
              {t.conveneBtn}
            </button>
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════
          PAGE 2 — DELIBERATION
      ════════════════════════════════════════════ */}
      {view === "deliberation" && (
        <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-5">

          {/* Question quote */}
          {lastQuestion && (
            <div className="w-full max-w-lg">
              <div className="question-quote">&ldquo;{lastQuestion}&rdquo;</div>
            </div>
          )}

          {/* Council circle — deliberation size */}
          <CouncilCircle
            activeAgents={activeAgents}
            speakingId={speakingId}
            mode="deliberation"
            size={360}
            figtreeLabel={t.figTree}
          />

          {/* ── Current speaker card ── */}
          {(speakingId !== null || isRunning) && (
            <div className="speech-card w-full max-w-lg" style={{ minHeight: 100 }}>
              <div className="flex items-center gap-2 mb-2">
                {speakingId && speakingId !== "moderator" && (() => {
                  const agent = AGENTS.find(a => a.id === speakingId);
                  return agent ? (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F5EDD6", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={agent.image} alt={agent.name} width={36} height={36}
                        style={{ mixBlendMode: "multiply", display: "block" }} />
                    </div>
                  ) : null;
                })()}
                {speakingId === "moderator" && (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F5EDD6", overflow: "hidden", flexShrink: 0 }}>
                    <Image src="/images/fig-tree.png" alt={t.figTree} width={36} height={36}
                      style={{ mixBlendMode: "multiply", display: "block" }} />
                  </div>
                )}
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)", flex: 1 }}>
                  {speakerLabel || "…"}
                </span>
                {isRunning && (
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "var(--ink-faint)" }}>
                    {t.speakingIndicator}
                  </span>
                )}
              </div>
              {currentText ? (
                <p className="speech-card-body">{currentText}</p>
              ) : (
                <p className="speech-card-body">
                  <em style={{ color: "var(--ink-faint)" }}>
                    {speakingId === "moderator" && responses.length === 0
                      ? t.figTreeStirs
                      : speakingId === "moderator"
                      ? t.figTreeConsiders
                      : t.gatheringThoughts}
                  </em>
                </p>
              )}
            </div>
          )}

          {/* ── Past voices (completed agent responses) ── */}
          {responses.length > 0 && (
            <div className="w-full max-w-lg space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--ink-faint)" }}>
                {t.voicesHeard}
              </p>
              {responses.map((r) => {
                const agent = AGENTS.find((a) => a.id === r.agentId)!;
                return (
                  <details key={r.agentId} className="agent-details">
                    <summary>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#F5EDD6", overflow: "hidden", flexShrink: 0 }}>
                        <Image src={agent.image} alt={agent.name} width={22} height={22}
                          style={{ mixBlendMode: "multiply", display: "block" }} />
                      </div>
                      <span>{agent.name}</span>
                      <span style={{ marginLeft: "auto", color: "var(--ink-faint)", fontSize: "0.7rem" }}>▾</span>
                    </summary>
                    <div className="agent-details-body">
                      {r.status === "error" ? (
                        <span style={{ color: "#B43228" }}>{r.text}</span>
                      ) : (
                        r.text
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          {/* ── Fig Tree synthesis ── */}
          {moderatorText && !isRunning && (
            <div className="synthesis-card w-full max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/fig-tree.png" alt={t.figTree}
                  width={36} height={36}
                  className="rounded-full flex-shrink-0"
                  style={{ mixBlendMode: "screen", opacity: 0.9 }} />
                <div>
                  <span className="text-sm font-semibold block"
                    style={{ color: "#A8D8A0", fontFamily: "var(--font-serif)" }}>
                    {t.figTree}
                  </span>
                  <span className="text-xs" style={{ color: "#6B9E63" }}>
                    {t.synthesisSubtitle}
                  </span>
                </div>
                <button onClick={downloadSession}
                  className="ml-auto flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: "rgba(90, 122, 82, 0.35)",
                    border: "1px solid rgba(90, 122, 82, 0.5)",
                    color: "#A8D8A0",
                  }}>
                  {t.saveBtn}
                </button>
              </div>
              <p className="synthesis-card-body">{moderatorText}</p>
            </div>
          )}

          {/* ── Actions ── */}
          {!isRunning && (
            <div className="flex gap-3 pb-10">
              <button className="btn-ghost" onClick={newQuestion}>
                {t.newQuestion}
              </button>
              {moderatorText && (
                <button className="btn-ghost" onClick={downloadSession}>
                  {t.downloadSession}
                </button>
              )}
            </div>
          )}
        </main>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
