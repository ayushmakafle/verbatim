// Props:
//   status: "idle" | "recording" | "done"

const badgeStyles = {
  idle: "border-gray-200 text-gray-400",
  recording: "border-red-400 text-red-400",
  done: "border-green-400 text-green-500",
};

export default function Header({ status = "idle" }) {
  return (
    <header className="flex justify-between items-center mb-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Verbatim
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          speech → transcript → summary
        </p>
      </div>
      <span
        className={`text-xs px-3 py-1 rounded-full border ${badgeStyles[status]}`}
      >
        {status}
      </span>
    </header>
  );
}
