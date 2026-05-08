import { speak } from "@/lib/speech";

interface Props {
  text: string;
  isLoading: boolean;
  muted: boolean;
  variant?: "opening" | "synthesis";
  onDownload?: () => void;
}

export default function ModeratorCard({
  text,
  isLoading,
  muted,
  variant = "synthesis",
  onDownload,
}: Props) {
  function handleReplay() {
    if (text) speak(text, "moderator");
  }

  const sublabel =
    variant === "opening"
      ? "Opening · Welcoming the council"
      : "Synthesis · The garden as a whole";

  return (
    <div
      className={`
        rounded-xl border-2 p-5 transition-all duration-300
        ${variant === "opening"
          ? "border-emerald-600 bg-emerald-900"
          : "border-emerald-700 bg-emerald-950"}
        ${isLoading ? "animate-pulse" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">🌳</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-semibold text-emerald-300">Fig Tree</span>
            <span className="text-xs text-emerald-600">{sublabel}</span>
            <div className="ml-auto flex items-center gap-2">
              {text && !isLoading && !muted && (
                <button
                  onClick={handleReplay}
                  title="Replay voice"
                  className="text-emerald-600 hover:text-emerald-400 transition-colors text-xs"
                >
                  🔈
                </button>
              )}
              {variant === "synthesis" && text && !isLoading && onDownload && (
                <button
                  onClick={onDownload}
                  title="Download session as Markdown"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                    bg-emerald-800 text-emerald-300 hover:bg-emerald-700 hover:text-emerald-100
                    transition-colors"
                >
                  ↓ Download
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="h-3 bg-emerald-800 rounded-full w-full" />
              <div className="h-3 bg-emerald-800 rounded-full w-5/6" />
              <div className="h-3 bg-emerald-800 rounded-full w-4/6" />
              <div className="h-3 bg-emerald-800 rounded-full w-full mt-3" />
              <div className="h-3 bg-emerald-800 rounded-full w-3/4" />
            </div>
          )}

          {text && !isLoading && (
            <p className="text-sm text-emerald-100 leading-relaxed whitespace-pre-line">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
