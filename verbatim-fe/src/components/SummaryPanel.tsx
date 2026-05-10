// Props:
//   summary: string
//   isLoading: boolean
//   error: string

export default function SummaryPanel({
  summary = "",
  isLoading = false,
  error = "",
}) {
  const isEmpty = !summary && !isLoading && !error;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[80px]">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          Summary
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(summary)}
          disabled={isEmpty || isLoading}
          className="text-xs border border-gray-200 rounded-md px-2 py-0.5 text-gray-400
                     hover:border-gray-400 hover:text-gray-600 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          copy
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-300 italic">Summarizing…</p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!isLoading && !error && isEmpty && (
        <p className="text-sm text-gray-300 italic leading-relaxed">
          AI summary will appear after transcription…
        </p>
      )}
      {!isLoading && !error && summary && (
        <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
