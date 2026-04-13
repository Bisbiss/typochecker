import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TypoResult {
  originalWord: string;
  correction: string;
  context: string;
  location: string;
  explanation: string;
}

export async function checkTypos(text: string): Promise<TypoResult[]> {
  // Membagi teks menjadi beberapa bagian (chunk) untuk menghindari limit token API
  const chunkSize = 4000; // karakter per chunk
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
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalWord: {
                  type: Type.STRING,
                  description: "The misspelled word or phrase.",
                },
                correction: {
                  type: Type.STRING,
                  description: "The suggested correction.",
                },
                context: {
                  type: Type.STRING,
                  description: "A short snippet of the surrounding text.",
                },
                location: {
                  type: Type.STRING,
                  description: "The location of the error (e.g., 'Page 1' or 'Paragraph 2').",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Explanation of the error in Indonesian.",
                },
              },
              required: ["originalWord", "correction", "context", "location", "explanation"],
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || "[]";
      const results = JSON.parse(jsonStr) as TypoResult[];
      allResults = [...allResults, ...results];
      
      // Memberikan sedikit jeda antar request jika chunk lebih dari 1 untuk menghindari rate limit (Requests Per Minute)
      if (chunks.length > 1 && i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`Error checking typos in chunk ${i + 1}:`, error);
      
      const errMsg = error?.message?.toLowerCase() || "";
      const isLimit = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exhausted");
      
      const limitMessage = "Limit API AI telah tercapai (terlalu banyak permintaan atau kuota habis). Silakan coba lagi beberapa saat kemudian.";
      const generalMessage = "Gagal menganalisis teks. Jika ini karena limit API, silakan coba lagi beberapa saat kemudian.";

      throw new Error(isLimit ? limitMessage : generalMessage);
    }
  }

  return allResults;
}
