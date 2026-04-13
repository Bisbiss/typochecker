import { GoogleGenAI, Type } from "@google/genai";

export interface TypoResult {
  originalWord: string;
  correction: string;
  context: string;
  location: string;
  explanation: string;
}

export async function checkTypos(text: string): Promise<TypoResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY belum diatur. Jika di Vercel, pastikan Anda menambahkan Environment Variables di menu Settings dashboard Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const chunkSize = 4000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }

  let allResults: TypoResult[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const prompt = `
You are an expert proofreader for Indonesian and English languages.
Your task is to analyze the following document text and identify any typographical errors (typos), spelling mistakes, or grammatical errors.
For each error found, provide:
1. The original misspelled word.
2. The suggested correction.
3. A short snippet of the surrounding text for context (about 5-10 words).
4. The location of the error (e.g., "Page 1" if page markers like [Page 1] are present, or a general location description).
5. A brief explanation of why it is an error and why the correction is better.

Only focus on actual errors, not stylistic choices.
Return the results as a JSON array of objects.

Document Text (Part ${i + 1} of ${chunks.length}):
---
${chunk}
---
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalWord: { type: Type.STRING, description: "The misspelled word or phrase." },
                correction: { type: Type.STRING, description: "The suggested correction." },
                context: { type: Type.STRING, description: "A short snippet of the surrounding text." },
                location: { type: Type.STRING, description: "The location of the error (e.g., 'Page 1' or 'Paragraph 2')." },
                explanation: { type: Type.STRING, description: "Explanation of the error in Indonesian." },
              },
              required: ["originalWord", "correction", "context", "location", "explanation"],
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || "[]";
      const results = JSON.parse(jsonStr) as TypoResult[];
      allResults = [...allResults, ...results];

      if (chunks.length > 1 && i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`Error checking typos in chunk ${i + 1} with Gemini:`, error);
      const errMsg = error?.message || "";
      const isLimit = errMsg.toLowerCase().includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("limit");

      const limitMessage = "Limit API Gemini telah tercapai (terlalu banyak permintaan atau kuota habis). Silakan coba lagi beberapa saat kemudian.";
      const generalMessage = "Gagal menganalisis teks dengan Gemini. " + errMsg;

      throw new Error(isLimit ? limitMessage : generalMessage);
    }
  }

  return allResults;
}
