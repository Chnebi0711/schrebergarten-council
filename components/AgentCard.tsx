import { AgentConfig, AgentResponse } from "@/lib/types";
import { speak } from "@/lib/speech";

interface Props {
  agent: AgentConfig;
  response: AgentResponse;
  muted: boolean;
}

export default function AgentCard({ agent, response, muted }: Props) {
  const isLoading = response.status === "loading";
  const isError = response.status === "error";
  const isDone = response.status === "done";

  function handleReplay() {
    if (isDone && response.text) {
      speak(response.text, agent.id);
    }
  }

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-300
        ${agent.bgColor} ${agent.borderColor}
        ${isLoading ? "animate-pulse" : ""}
        ${isError ? "border-red-300 bg-red-50" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">{agent.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-sm font-semibold ${agent.color}`}>{agent.name}</span>
            <span className="text-xs text-stone-400">{agent.represents}</span>
            {isDone && !muted && (
              <button
                onClick={handleReplay}
                title="Replay voice"
                className="ml-auto text-stone-400 hover:text-stone-600 transition-colors text-xs"
              >
                🔈
              </button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-2 mt-2">
              <div className="h-3 bg-stone-200 rounded-full w-full" />
              <div className="h-3 bg-stone-200 rounded-full w-5/6" />
              <div className="h-3 bg-stone-200 rounded-full w-4/6" />
            </div>
          )}

          {isDone && (
            <p className="text-sm text-stone-700 leading-relaxed">{response.text}</p>
          )}

          {isError && (
            <p className="text-sm text-red-600 leading-relaxed">
              {response.text || "Something went wrong calling this agent."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
