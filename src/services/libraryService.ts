import nspell from 'nspell';
import { TypoResult } from './geminiService';

let spellchecker: any = null;

export async function checkTyposLibrary(text: string): Promise<TypoResult[]> {
  if (!spellchecker) {
    try {
      // Mengambil file dictionary bahasa Indonesia dari public/locales
      const affRes = await fetch('/locales/id.aff');
      const dicRes = await fetch('/locales/id.dic');
      
      if (!affRes.ok || !dicRes.ok) {
        throw new Error("Gagal memuat file kamus (dictionary) dari server.");
      }

      const aff = await affRes.text();
      const dic = await dicRes.text();
      spellchecker = nspell(aff, dic);
    } catch (e: any) {
      throw new Error("Terjadi kesalahan saat inisialisasi Mode Library: " + e.message);
    }
  }

  // Tokenize the text into words (alphabetic only for simplicity)
  // Termasuk karakter non-ASCII (seperti kata berimbuhan) yang umumnya ditangani Regex Unicode jika diperlukan,
  // Tapi untuk bahasa Indonesia basic alphabetic a-zA-Z sudah cukup menangkap sebagian besar kata dasar.
  const words = text.match(/[a-zA-Z]+/g) || [];
  const results: TypoResult[] = [];
  
  // Menggunakan Set agar kata yang sama tidak dicek berulang-ulang
  const uniqueWords = [...new Set(words)];

  for (const word of uniqueWords) {
    // Hanya mengecek kata dengan panjang lebih dari 3 agar tidak terlalu sensitif ke singkatan dsb.
    if (word.length > 3 && !spellchecker.correct(word)) {
      const suggestions = spellchecker.suggest(word);
      if (suggestions.length > 0) {
        // Cari konteks kalimat
        // Menggunakan regex untuk mencari kata di dalam teks asli
        const regex = new RegExp(`(.{0,30}\\b)(${word})(\\b.{0,30})`, 'i');
        const match = text.match(regex);
        let ctx = "...";
        if (match) {
          ctx = `${match[1] || ''}${match[2]}${match[3] || ''}`;
        }

        results.push({
          originalWord: word,
          correction: suggestions[0], // Ambil sugesti pertama
          context: ctx.trim(),
          location: "Dokumen",
          explanation: "Kata ini tidak dikenali oleh kamus offline/library, mungkin salah eja."
        });
      }
    }
  }

  return results;
}
