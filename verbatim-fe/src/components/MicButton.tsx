// Props:
//   isRecording: boolean
//   onClick: function

export default function MicButton({ isRecording = false, onClick }) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-2">
      <button
        onClick={onClick}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`
          w-18 h-18 rounded-full border-2 text-2xl transition-all duration-200
          flex items-center justify-center
          hover:scale-105
          ${
            isRecording
              ? "border-red-400 bg-red-50 animate-pulse"
              : "border-gray-200 bg-white hover:border-gray-400"
          }
        `}
      >
        {isRecording ? "⏹" : "🎙"}
      </button>
      <p className="text-sm text-gray-400">
        {isRecording ? "tap to stop" : "tap to record"}
      </p>
    </div>
  );
}
