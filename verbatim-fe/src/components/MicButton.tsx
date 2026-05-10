interface MicButtonProps {
  isRecording?: boolean;
  isTranscribing: boolean;
  onClick: () => void;
}

export default function MicButton({
  isRecording,
  isTranscribing,
  onClick,
}: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-2">
      <button
        onClick={onClick}
        disabled={isTranscribing}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`
          w-18 h-18 rounded-full border-2 text-2xl transition-all duration-200
          flex items-center justify-center hover:scale-105
          ${isRecording ? "border-red-400 bg-red-50 animate-pulse" : ""}
          ${isTranscribing ? "border-yellow-400 bg-yellow-50 opacity-60 cursor-not-allowed" : ""}
          ${!isRecording && !isTranscribing ? "border-gray-200 bg-white hover:border-gray-400" : ""}
        `}
      >
        {isRecording ? "⏹" : isTranscribing ? "⏳" : "🎙"}
      </button>
      <p className="text-sm text-gray-400">
        {isRecording
          ? "Tap to Stop"
          : isTranscribing
            ? "Transcribing…"
            : "Tap to record"}
      </p>
    </div>
  );
}
