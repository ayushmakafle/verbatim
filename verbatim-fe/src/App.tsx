import Header from "./components/layout/Header";
import MicButton from "./components/MicButton";
import TranscriptPanel from "./components/TranscriptPanel";
import SummarizeButton from "./components/SummarizeButton";
import SummaryPanel from "./components/SummaryPanel";
import { useRef, useState } from "react";

type Status = "idle" | "recording" | "done";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      setError("Web Speech API not supported. Use Chrome or Edge.");
      return;
    }

    finalRef.current = "";
    setTranscript("");
    setInterimText("");
    setSummary("");
    setError("");

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += chunk + " ";
        } else {
          interim += chunk;
        }
      }

      setTranscript(finalRef.current);
      setInterimText(interim);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(`Mic error: ${e.error}`);
      stopRecording();
    };

    recognition.onend = () => {
      if (recognitionRef.current) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setStatus("recording");
  }

  function stopRecording() {
    if (!recognitionRef.current) return;

    const rec = recognitionRef.current;
    recognitionRef.current = null;
    rec.onend = null;
    rec.stop();

    setInterimText("");
    setStatus(finalRef.current.trim() ? "done" : "idle");
  }

  function handleMicClick() {
    status === "recording" ? stopRecording() : startRecording();
  }

  async function handleSummarize() {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      const res = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-7">
        <Header status={status} />
        <main className="flex flex-col gap-4">
          <MicButton
            isRecording={status === "recording"}
            onClick={handleMicClick}
          />
          <TranscriptPanel transcript={transcript} interimText={interimText} />
          <SummarizeButton
            disabled={!transcript.trim()}
            isLoading={isLoading}
            onClick={handleSummarize}
          />
          <SummaryPanel summary={summary} isLoading={isLoading} error={error} />
        </main>
      </div>
    </div>
  );
}
