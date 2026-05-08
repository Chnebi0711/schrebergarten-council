import { OutputMode } from "@/lib/types";

interface Props {
  mode: OutputMode;
  onChange: (mode: OutputMode) => void;
  disabled: boolean;
}

const MODES: { id: OutputMode; label: string; description: string }[] = [
  { id: "transcript", label: "Transcript", description: "Each voice in sequence" },
  { id: "consensus", label: "Consensus", description: "What the council agrees on" },
  { id: "conflict", label: "Conflict", description: "Where they disagree" },
];

export default function OutputModeBar({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 w-fit">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          disabled={disabled}
          title={m.description}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${mode === m.id
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
