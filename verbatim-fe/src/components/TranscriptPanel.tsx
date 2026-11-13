// Props:
//   transcript: string  — finalized Whisper transcript (shown after stop)
//   interimText: string — live Whisper partials while recording (greyed, refreshed every few seconds)

export default function TranscriptPanel({ transcript = "", interimText = "" }) {
  const isEmpty = !transcript && !interimText;
  const isLive = !transcript && !!interimText;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[90px]">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
          Transcript
          {isLive && (
            <span className="flex items-center gap-1 text-red-400 normal-case tracking-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              live
            </span>
          )}
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
          Your transcript will appear here moments after you start speaking…
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
