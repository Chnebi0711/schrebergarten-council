"use client";

import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { AgentId } from "@/lib/types";

interface Props {
  activeAgents: Set<AgentId>;
  speakingId: AgentId | "moderator" | null;
  mode: "selection" | "deliberation";
  size?: number; // 380 (selection) | 360 (deliberation)
  onToggle?: (id: AgentId) => void;
  disabled?: boolean;
  figtreeLabel?: string;
}

const AGENT_ANGLES: Record<AgentId, number> = {
  pollinator:   -90,
  soil:         -30,
  hedgehog:      30,
  snail:         90,
  biodiversity: 150,
  neighbor:     210,
};

function agentPos(id: AgentId, cx: number, cy: number, r: number) {
  const rad = (AGENT_ANGLES[id] * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function spokePoint(pos: { x: number; y: number }, cx: number, cy: number, offset: number) {
  const dx = pos.x - cx, dy = pos.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const t = offset / dist;
  return { x: cx + dx * t, y: cy + dy * t };
}

export default function CouncilCircle({
  activeAgents,
  speakingId,
  mode,
  size = 380,
  onToggle,
  disabled = false,
  figtreeLabel = "Fig Tree",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = Math.round(size * 0.38);

  const isFigTreeSpeaking = speakingId === "moderator";
  const visibleAgents =
    mode === "deliberation"
      ? AGENTS.filter((a) => activeAgents.has(a.id))
      : AGENTS;

  return (
    <div className="council-container mx-auto" style={{ width: size, height: size }}>

      {/* ── SVG: orbit ring + spokes ── */}
      <svg
        width={size} height={size}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="#C4A882" strokeWidth="1.2" strokeDasharray="7 6" opacity="0.6" />

        {visibleAgents.map((agent) => {
          const pos   = agentPos(agent.id, cx, cy, r);
          const start = spokePoint(pos, cx, cy, 62);
          const end   = spokePoint(pos, cx, cy, r - 44);
          return (
            <line key={agent.id}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="#C4A882" strokeWidth="1" strokeDasharray="4 5"
              opacity={activeAgents.has(agent.id) ? 0.5 : 0.15}
            />
          );
        })}
      </svg>

      {/* ── Fig Tree — centre ── */}
      <div className="figtree-node">
        {/* visual wrapper: rings are siblings of img-wrap, not clipped by it */}
        <div style={{ position: "relative", width: 112, height: 112 }}>
          <div className="figtree-img-wrap">
            <Image src="/images/fig-tree.png" alt="Fig Tree"
              width={112} height={112} style={{ mixBlendMode: "multiply" }} />
          </div>
          {isFigTreeSpeaking && <div className="figtree-ring-speak" />}
        </div>
        <span className="figtree-label">{figtreeLabel}</span>
      </div>

      {/* ── Agent nodes ── */}
      {visibleAgents.map((agent) => {
        const pos        = agentPos(agent.id, cx, cy, r);
        const isActive   = activeAgents.has(agent.id);
        const isSpeaking = speakingId === agent.id;

        return (
          <div
            key={agent.id}
            className={`agent-node ${isActive ? "active" : "inactive"}`}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => {
              if (mode === "selection" && !disabled && onToggle) onToggle(agent.id);
            }}
            role={mode === "selection" ? "checkbox" : undefined}
            aria-checked={mode === "selection" ? isActive : undefined}
            aria-label={agent.name}
            tabIndex={mode === "selection" ? 0 : -1}
            onKeyDown={(e) => {
              if (mode === "selection" && (e.key === " " || e.key === "Enter")) {
                e.preventDefault();
                if (!disabled && onToggle) onToggle(agent.id);
              }
            }}
          >
            {/* visual wrapper keeps rings outside overflow:hidden clip */}
            <div style={{ position: "relative", width: 76, height: 76 }}>
              <div className="agent-img-wrap">
                <Image src={agent.image} alt={agent.name}
                  width={76} height={76} style={{ mixBlendMode: "multiply" }} />
              </div>
              {/* amber selection ring */}
              {!isSpeaking && (
                <div style={{
                  position: "absolute", inset: -4, borderRadius: "50%",
                  border: `2.5px solid ${isActive ? "#A07840" : "#C4A882"}`,
                  boxShadow: isActive ? "0 0 0 3px rgba(160,120,64,0.15)" : "none",
                  pointerEvents: "none",
                }} />
              )}
              {/* green speaking ring */}
              {isSpeaking && (
                <div style={{
                  position: "absolute", inset: -6, borderRadius: "50%",
                  border: "2.5px solid #5A7A52",
                  animation: "speak-pulse 1.6s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              )}
            </div>

            <span className="agent-label" style={{ color: isActive ? "var(--ink)" : "#aaa" }}>
              {agent.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
