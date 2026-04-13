import React from 'react';
import { TypoResult } from '../services/geminiService';
import { AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface TypoResultsProps {
  results: TypoResult[];
}

export function TypoResults({ results }: TypoResultsProps) {
  if (results.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-green-800 mb-2">Dokumen Bersih!</h3>
        <p className="text-green-600">Tidak ditemukan typo atau kesalahan ejaan dalam dokumen ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Hasil Pengecekan</h2>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
          {results.length} Kesalahan Ditemukan
        </span>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-red-50 p-2 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-lg font-semibold text-red-600 line-through decoration-red-300">
                    {result.originalWord}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg font-semibold text-green-600">
                    {result.correction}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{result.location}</span>
                </div>

                <div 
                  className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700 font-mono"
                  dangerouslySetInnerHTML={{
                    __html: `"...${result.context.replace(
                      new RegExp(`(${result.originalWord})`, 'gi'),
                      '<mark class="bg-red-100 text-red-800 rounded px-1">$1</mark>'
                    )}..."`
                  }}
                />

                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Penjelasan: </span>
                  {result.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
