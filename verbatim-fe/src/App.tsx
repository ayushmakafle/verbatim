import Header from "./components/layout/Header";
import MicButton from "./components/MicButton";
import TranscriptPanel from "./components/TranscriptPanel";
import SummarizeButton from "./components/SummarizeButton";
import SummaryPanel from "./components/SummaryPanel";
import { useRef, useState } from "react";

type Status = "idle" | "recording" | "transcribing" | "done";

const API_URL = import.meta.env.VITE_API_URL;

// How often MediaRecorder emits a chunk and we refresh the live transcript.
const LIVE_INTERVAL_MS = 4000;

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [liveText, setLiveText] = useState(""); // Whisper partials — shown while recording
  const [transcript, setTranscript] = useState(""); // Whisper final — shown after stop
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveInFlightRef = useRef(false); // guards against overlapping live requests

  async function startRecording() {
    setError("");
    setTranscript("");
    setLiveText("");
    setSummary("");
    chunksRef.current = [];
    liveInFlightRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // best-effort live refresh; final transcription still runs on stop
          void updateLiveTranscript();
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await transcribeAudio();
      };

      mediaRecorderRef.current = recorder;
      // timeslice makes ondataavailable fire every LIVE_INTERVAL_MS
      recorder.start(LIVE_INTERVAL_MS);

      setStatus("recording");
    } catch {
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

  // POST the given audio to Groq Whisper and return the transcript text.
  async function postTranscribe(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    const res = await fetch(`${API_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.transcript;
  }

  // Re-transcribe the audio captured so far to update the live text.
  // Sends the accumulated blob (webm chunks aren't independently decodable).
  async function updateLiveTranscript() {
    if (liveInFlightRef.current) return; // skip if one is already running
    liveInFlightRef.current = true;

    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const text = await postTranscribe(blob);
      // ignore late responses that land after the user stopped recording
      if (mediaRecorderRef.current?.state === "recording") {
        setLiveText(text);
      }
    } catch {
      // live updates are best-effort — swallow and let the final pass report errors
    } finally {
      liveInFlightRef.current = false;
    }
  }

  // Final transcription of the full recording, run once on stop.
  async function transcribeAudio() {
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const text = await postTranscribe(blob);
      setLiveText("");
      setTranscript(text);
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
      const res = await fetch(`${API_URL}/api/summarize`, {
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

  const displayTranscript = status === "recording" ? "" : transcript;
  const displayInterim = status === "recording" ? liveText : "";

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
          <TranscriptPanel
            transcript={displayTranscript}
            interimText={displayInterim}
          />
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
