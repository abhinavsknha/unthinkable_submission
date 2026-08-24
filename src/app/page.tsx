"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [statusText, setStatusText] = useState("Analyze");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStatusText("Analyzing...");

    try {
      const formData = new FormData();
      
      // OCR on the client side to avoid Vercel Serverless limits and timeouts
      if (file.type.startsWith("image/")) {
        setStatusText("Downloading OCR Engine (may take a moment on first run)...");
        const Tesseract = (await import("tesseract.js")).default;
        const { data } = await Tesseract.recognize(file, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setStatusText(`Extracting text... ${Math.round(m.progress * 100)}%`);
            } else if (m.status) {
              setStatusText(`Preparing OCR: ${m.status}...`);
            }
          }
        });
        
        if (!data.text || data.text.trim() === "") {
          throw new Error("No text could be extracted from the image.");
        }
        formData.append("text", data.text);
        setStatusText("Finalizing analysis...");
      } else {
        formData.append("file", file);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze document.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setStatusText("Analyze");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Social Media Content Analyzer
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Upload a document or image containing your social media post to get engagement suggestions.
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  {isDragActive ? "Drop the file here" : "Upload a file or drag and drop"}
                </span>
              </div>
              <p className="text-xs text-gray-500">PDF, PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center space-x-3 truncate">
                {file.type === "application/pdf" ? (
                  <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                {statusText}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Analysis Results
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {result.analysis.summary}
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions for Improvement:</h4>
                  <ul className="space-y-3">
                    {result.analysis.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Metrics:</h4>
                  <div className="bg-gray-50 p-3 rounded-md inline-block">
                    <span className="text-2xl font-bold text-gray-900">{result.analysis.wordCount}</span>
                    <span className="text-sm text-gray-500 ml-2">words</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Extracted Text
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
                  {result.extractedText}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
