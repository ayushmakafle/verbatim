// Props:
//   disabled: boolean
//   isLoading: boolean
//   onClick: function

export default function SummarizeButton({ disabled, isLoading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-3 rounded-xl border-2 border-gray-200 bg-white
                 text-sm font-semibold tracking-wide text-gray-700
                 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                 disabled:opacity-35 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex justify-center gap-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              className="animate-bounce text-gray-400"
              style={{ animationDelay: `${delay}s` }}
            >
              ●
            </span>
          ))}
        </span>
      ) : (
        "✦ Summarize"
      )}
    </button>
  );
}
