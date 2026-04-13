/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { TypoResults } from './components/TypoResults';
import { extractTextFromFile } from './services/fileParser';
import { checkTypos, TypoResult } from './services/geminiService';
import { Loader2, SpellCheck2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TypoResult[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length === 0) {
        throw new Error("Tidak ada teks yang dapat diekstrak dari dokumen ini.");
      }

      const typos = await checkTypos(text);
      setResults(typos);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses dokumen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <SpellCheck2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">TypoChecker by Lampung Cerdas</h1>
            <p className="text-xs text-gray-500 font-medium">ID & EN Document Proofreader</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Cek Typo Dokumen Anda
            </h2>
            <p className="text-lg text-gray-600">
              Unggah file Word (DOCX) atau PDF. AI kami akan menganalisis dokumen Anda untuk menemukan kesalahan ketik, ejaan, dan tata bahasa dalam bahasa Indonesia maupun Inggris dengan akurasi tinggi.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">Menganalisis dokumen...</p>
            <p className="text-sm text-gray-500 mt-2">Ini mungkin memakan waktu beberapa saat tergantung ukuran dokumen.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 max-w-3xl mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800 mb-1">Terjadi Kesalahan</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {results && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <TypoResults results={results} />
          </div>
        )}
      </main>
    </div>
  );
}
