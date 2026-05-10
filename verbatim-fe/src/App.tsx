import Header from "./components/layout/Header";
import MicButton from "./components/MicButton";
import SummarizeButton from "./components/SummarizeButton";
import SummaryPanel from "./components/SummaryPanel";
import TranscriptPanel from "./components/TranscriptPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-7">
        <Header status="idle" />
        <main className="flex flex-col gap-4">
          <MicButton isRecording={false} onClick={() => {}} />
          <TranscriptPanel transcript="" interimText="" />
          <SummarizeButton
            disabled={true}
            isLoading={false}
            onClick={() => {}}
          />
          <SummaryPanel summary="" isLoading={false} error="" />
        </main>
      </div>
    </div>
  );
}
