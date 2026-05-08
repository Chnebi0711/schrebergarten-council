import { AgentResponse } from "@/lib/types";
import { AGENT_MAP } from "@/lib/agents";

interface Props {
  responses: AgentResponse[];
}

export default function ConflictTable({ responses: agentResponses }: Props) {
  const doneResponses = agentResponses.filter((r) => r.status === "done" && r.text);

  if (doneResponses.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        No responses yet — run the council first.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide w-36">
              Voice
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Position
            </th>
          </tr>
        </thead>
        <tbody>
          {doneResponses.map((r, i) => {
            const agent = AGENT_MAP[r.agentId];
            return (
              <tr
                key={r.agentId}
                className={`border-b border-stone-100 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent.emoji}</span>
                    <div>
                      <div className={`font-semibold text-xs ${agent.color}`}>{agent.name}</div>
                      <div className="text-[10px] text-stone-400 leading-tight">{agent.represents}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-700 leading-relaxed align-top">
                  {r.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
