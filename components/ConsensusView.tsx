interface Props {
  moderatorText: string;
  isLoading: boolean;
}

export default function ConsensusView({ moderatorText, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-stone-100 rounded-xl p-4 space-y-2">
            <div className="h-3 bg-stone-200 rounded-full w-1/4" />
            <div className="h-3 bg-stone-200 rounded-full w-full" />
            <div className="h-3 bg-stone-200 rounded-full w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (!moderatorText) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        Run the council to see the Fig Tree&apos;s synthesis.
      </p>
    );
  }

  // The moderator is prompted to write 3 paragraphs
  const paragraphs = moderatorText.split(/\n\n+/).filter(Boolean);
  const labels = ["Agreement", "Tensions", "Recommendation"];
  const colors = [
    "border-l-green-500 bg-green-50",
    "border-l-amber-500 bg-amber-50",
    "border-l-emerald-700 bg-emerald-50",
  ];

  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <div
          key={i}
          className={`border-l-4 rounded-r-xl p-4 ${colors[i] ?? "border-l-stone-300 bg-stone-50"}`}
        >
          {labels[i] && (
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
              {labels[i]}
            </div>
          )}
          <p className="text-sm text-stone-700 leading-relaxed">{para}</p>
        </div>
      ))}
    </div>
  );
}
