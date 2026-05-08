import { AgentId, AgentResponse } from "./types";
import { AGENT_MAP, MODERATOR_SYSTEM_PROMPT, OPENING_SYSTEM_PROMPT } from "./agents";
import { Lang } from "./i18n";

const LANG_DIRECTIVE: Record<Lang, string> = {
  en: "",
  de: "\n\nWICHTIG: Antworte ausschließlich auf Deutsch. Behalte deine Stimme und Persönlichkeit bei, drücke dich aber durchgehend auf Deutsch aus.",
};

async function callProxy(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
  isModerator = false,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch("/api/council", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userMessage, maxTokens, isModerator }),
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? `Server error ${response.status}`);
  }

  return data.text as string;
}

export async function callOpening(
  question: string,
  activeAgentIds: AgentId[],
  signal?: AbortSignal,
  lang: Lang = "en"
): Promise<string> {
  const memberList = activeAgentIds
    .map((id) => `${AGENT_MAP[id].name} (${AGENT_MAP[id].represents})`)
    .join(", ");

  const userMessage  = `The gardener's question: "${question}"\n\nCouncil members present today: ${memberList}.`;
  const systemPrompt = OPENING_SYSTEM_PROMPT + LANG_DIRECTIVE[lang];

  return callProxy(systemPrompt, userMessage, 120, true, signal);
}

export async function callAgent(
  agentId: AgentId,
  question: string,
  signal?: AbortSignal,
  lang: Lang = "en"
): Promise<string> {
  const agent        = AGENT_MAP[agentId];
  const systemPrompt = agent.systemPrompt + LANG_DIRECTIVE[lang];

  return callProxy(systemPrompt, question, 400, false, signal);
}

export async function callModerator(
  question: string,
  agentResponses: AgentResponse[],
  signal?: AbortSignal,
  lang: Lang = "en"
): Promise<string> {
  const councilContext = agentResponses
    .filter((r) => r.status === "done" && r.text)
    .map((r) => {
      const agent = AGENT_MAP[r.agentId];
      return `**${agent.name}** (${agent.represents}):\n${r.text}`;
    })
    .join("\n\n");

  const userMessage  = `The gardener's question:\n"${question}"\n\nThe council has spoken:\n\n${councilContext}\n\nNow synthesise their voices.`;
  const systemPrompt = MODERATOR_SYSTEM_PROMPT + LANG_DIRECTIVE[lang];

  return callProxy(systemPrompt, userMessage, 600, true, signal);
}
