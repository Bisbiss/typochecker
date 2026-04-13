import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, File as FileIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        isLoading && "opacity-50 cursor-not-allowed",
        "flex flex-col items-center justify-center min-h-[300px]"
      )}
    >
      <input {...getInputProps()} />
      
      {acceptedFiles.length > 0 ? (
        <div className="flex flex-col items-center text-blue-600">
          {acceptedFiles[0].name.endsWith('.pdf') ? (
            <FileIcon className="w-16 h-16 mb-4" />
          ) : (
            <FileText className="w-16 h-16 mb-4" />
          )}
          <p className="text-lg font-medium">{acceptedFiles[0].name}</p>
          <p className="text-sm text-gray-500 mt-2">
            {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <UploadCloud className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop your document here
          </p>
          <p className="text-sm mb-4">or click to browse files</p>
          <div className="flex gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
            <span className="bg-gray-100 px-2 py-1 rounded">DOCX</span>
          </div>
        </div>
      )}
    </div>
  );
}
