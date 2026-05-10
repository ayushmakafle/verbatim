import Header from "./components/layout/Header";
import MicButton from "./components/MicButton";
import TranscriptPanel from "./components/TranscriptPanel";
import SummarizeButton from "./components/SummarizeButton";
import SummaryPanel from "./components/SummaryPanel";
import { useRef, useState } from "react";

type Status = "idle" | "recording" | "transcribing" | "done";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError("");
    setTranscript("");
    setSummary("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all mic tracks so the browser releases the mic
        stream.getTracks().forEach((t) => t.stop());
        await transcribeAudio();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch (err) {
      setError("Microphone access denied.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setStatus("transcribing");
  }

  function handleMicClick() {
    status === "recording" ? stopRecording() : startRecording();
  }

  async function transcribeAudio() {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      const res = await fetch("http://localhost:3001/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTranscript(data.transcript);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed.");
      setStatus("idle");
    }
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
            isTranscribing={status === "transcribing"}
            onClick={handleMicClick}
          />
          <TranscriptPanel transcript={transcript} interimText="" />
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
