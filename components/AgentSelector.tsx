"use client";

import { AgentConfig, AgentId } from "@/lib/types";

interface Props {
  agents: AgentConfig[];
  activeAgents: Set<AgentId>;
  onToggle: (id: AgentId) => void;
  disabled: boolean;
}

export default function AgentSelector({ agents, activeAgents, onToggle, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {agents.map((agent) => {
        const isActive = activeAgents.has(agent.id);
        return (
          <button
            key={agent.id}
            onClick={() => onToggle(agent.id)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              border transition-all duration-150 select-none
              ${isActive
                ? `${agent.bgColor} ${agent.borderColor} ${agent.color} opacity-100`
                : "bg-stone-100 border-stone-200 text-stone-400 opacity-60"
              }
              ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:opacity-90"}
            `}
          >
            <span>{agent.emoji}</span>
            <span>{agent.name}</span>
          </button>
        );
      })}
    </div>
  );
}
