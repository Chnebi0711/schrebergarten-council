export type AgentId =
  | "pollinator"
  | "soil"
  | "hedgehog"
  | "snail"
  | "biodiversity"
  | "neighbor";

export type OutputMode = "transcript" | "consensus" | "conflict";

export interface AgentConfig {
  id: AgentId;
  name: string;
  represents: string;
  color: string;
  borderColor: string;
  bgColor: string;
  emoji: string;
  image: string;
  systemPrompt: string;
}

export interface AgentResponse {
  agentId: AgentId;
  text: string;
  status: "idle" | "loading" | "done" | "error";
}
