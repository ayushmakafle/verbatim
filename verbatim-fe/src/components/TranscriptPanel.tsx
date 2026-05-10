// Props:
//   transcript: string  — finalized speech text
//   interimText: string — in-progress speech (greyed out)

export default function TranscriptPanel({ transcript = "", interimText = "" }) {
  const isEmpty = !transcript && !interimText;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[90px]">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          Transcript
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(transcript)}
          disabled={isEmpty}
          className="text-xs border border-gray-200 rounded-md px-2 py-0.5 text-gray-400
                     hover:border-gray-400 hover:text-gray-600 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          copy
        </button>
      </div>

      {isEmpty ? (
        <p className="text-sm text-gray-300 italic leading-relaxed">
          Your transcript will appear here as you speak…
        </p>
      ) : (
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {transcript}
          <span className="text-gray-300">{interimText}</span>
        </p>
      )}
    </div>
  );
}
