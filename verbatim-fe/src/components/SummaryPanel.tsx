// Props:
//   summary: string
//   isLoading: boolean
//   error: string

import ReactMarkdown from "react-markdown";

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
        <div
          className="text-sm text-gray-800 leading-relaxed
                     [&_p]:mb-2 [&_p:last-child]:mb-0
                     [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-2
                     [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-2
                     [&_strong]:font-semibold [&_strong]:text-gray-900
                     [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mb-2
                     [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2
                     [&_code]:bg-gray-100 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
                     [&_a]:text-blue-600 [&_a]:underline"
        >
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
