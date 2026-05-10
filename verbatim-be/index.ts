import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────────────
interface SummarizeBody {
  transcript: string;
}

// ── POST /api/summarize ───────────────────────────────────────────────────────
app.post(
  "/api/summarize",
  async (req: Request<{}, {}, SummarizeBody>, res: Response) => {
    const { transcript } = req.body;

    if (!transcript?.trim()) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

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
      res.json({ summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Groq error:", message);
      res.status(500).json({ error: message });
    }
  },
);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
