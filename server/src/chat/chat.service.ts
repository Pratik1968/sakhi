import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ChatTurn } from './dto/ask.dto';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Sakhi's scope + tone. Kept tight so the assistant stays on safety / first aid /
// Indian legal-process help and always points to real help in an emergency.
const SYSTEM_INSTRUCTION = `You are Sakhi, a calm, supportive safety assistant inside an Indian women's personal-safety app.

You ONLY help with three things:
1. Personal safety tips (staying safe while walking/commuting, in unsafe situations, de-escalation, sharing location with trusted contacts).
2. Basic first aid (small cuts, burns, sprains, panic/anxiety, fainting) — simple, practical steps.
3. Indian legal guidance for women — rights and the practical STEPS to act, e.g. how to file an FIR / a complaint, Zero FIR, filing online, what to carry, women's police help desks, relevant helplines. Explain the process in clear numbered steps.

Rules:
- Be concise and practical. Prefer short numbered steps or short bullet points over long paragraphs.
- If there is any sign of an emergency or immediate danger, tell the user FIRST to call 112 (national emergency) or 100 (police); women's helpline 1091; ambulance 108; domestic-abuse 181.
- You are NOT a doctor or lawyer — for anything serious add a one-line reminder to seek a professional or the authorities. Do not invent specific legal section numbers you are unsure about; describe the process instead.
- Stay on topic. If asked something unrelated to safety, first aid, or women's legal help, gently steer back and offer what you can help with.
- Warm, non-judgmental, reassuring tone. India context by default.`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async ask(message: string, history: ChatTurn[] = []): Promise<{ reply: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set');
      throw new ServiceUnavailableException('The assistant is not configured right now.');
    }

    // Keep the last 10 turns, map to Gemini roles ('me' -> user, 'bot' -> model),
    // drop empties, then append the new user message.
    const contents = [
      ...history
        .slice(-10)
        .filter((t) => t && typeof t.text === 'string' && t.text.trim())
        .map((t) => ({
          role: t.from === 'bot' ? 'model' : 'user',
          parts: [{ text: String(t.text).slice(0, 2000) }],
        })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      // Gemini 3.x flash "thinks" before answering (~700 tokens here), and that
      // counts toward the output budget — keep it high so the visible answer
      // isn't truncated.
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      // This is a help context (discussing harassment/assault legal steps, first
      // aid). Relax the filters to BLOCK_ONLY_HIGH so legitimate safety guidance
      // isn't over-blocked, while still guarding the worst content.
      safetySettings: [
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT',
      ].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' })),
    };

    let data: any;
    try {
      const res = await fetch(ENDPOINT(GEMINI_MODEL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });
      data = await res.json().catch(() => null);
      if (!res.ok) {
        this.logger.error(`Gemini ${res.status}: ${JSON.stringify(data)?.slice(0, 300)}`);
        throw new ServiceUnavailableException('The assistant is unavailable right now.');
      }
    } catch (e) {
      if (e instanceof ServiceUnavailableException) throw e;
      this.logger.error(`Gemini request failed: ${e instanceof Error ? e.message : e}`);
      throw new ServiceUnavailableException('The assistant is unavailable right now.');
    }

    const reply = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: any) => p?.text ?? '')
      .join('')
      .trim();

    if (!reply) {
      // Blocked or empty candidate — return a safe, useful fallback.
      return {
        reply:
          "I couldn't answer that one. If you're in danger right now, call 112 (emergency) or the women's helpline 1091. You can also reach helplines from the Circle tab.",
      };
    }

    return { reply };
  }
}
