import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import multer from "multer";
import { toFile } from "groq-sdk";
import { Readable } from "stream";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// multer stores the upload in memory as a Buffer
const upload = multer({ storage: multer.memoryStorage() });

// ── Logger middleware ─────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface SummarizeBody {
  transcript: string;
}

// ── POST /api/transcribe ──────────────────────────────────────────────────────
app.post(
  "/api/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "audio file is required" });
      return;
    }

    console.log(
      `  ↳ transcribe | size: ${(req.file.size / 1024).toFixed(1)}kb | type: ${req.file.mimetype}`,
    );

    try {
      // Groq expects a File-like object — convert the Buffer using a Readable stream
      const readable = Readable.from(req.file.buffer);
      const file = await toFile(readable, "recording.webm", {
        type: req.file.mimetype,
      });

      const transcription = await groq.audio.transcriptions.create({
        file,
        model: "whisper-large-v3-turbo",
        response_format: "json",
      });

      console.log(`  ↳ transcript length: ${transcription.text.length} chars`);
      res.json({ transcript: transcription.text });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`  ↳ Groq transcribe error: ${message}`);
      res.status(500).json({ error: message });
    }
  },
);

// ── POST /api/summarize ───────────────────────────────────────────────────────
app.post(
  "/api/summarize",
  async (req: Request<{}, {}, SummarizeBody>, res: Response) => {
    const { transcript } = req.body;

    if (!transcript?.trim()) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    console.log(
      `  ↳ summarize | transcript length: ${transcript.length} chars`,
    );

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Summarize the following spoken transcript concisely. Highlight the key points. Transcript: ${transcript.trim()}`,
          },
        ],
      });

      const summary =
        completion.choices[0]?.message?.content ?? "No summary returned.";
      console.log(`  ↳ summary length: ${summary.length} chars`);
      res.json({ summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`  ↳ Groq error: ${message}`);
      res.status(500).json({ error: message });
    }
  },
);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
