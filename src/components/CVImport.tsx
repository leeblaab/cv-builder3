import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { CVData } from "../types";

interface CVImportProps {
  onImportSuccess: (data: CVData) => void;
}

export default function CVImport({ onImportSuccess }: CVImportProps) {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Reading input text...",
    "Analyzing sentence structure with Gemini AI...",
    "Extracting contact information...",
    "Structuring work experience bullet points...",
    "Categorizing technical skills...",
    "Polishing structured dataset..."
  ];

  // Rotate loading steps every 1.5s during analysis
  const startLoadingAnimation = () => {
    setLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return interval;
  };

  const parseCVText = async (textToParse: string) => {
    if (!textToParse.trim()) {
      setError("Please paste your CV text or upload a document first.");
      return;
    }

    setError(null);
    const interval = startLoadingAnimation();

    try {
      const response = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToParse }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to parse CV. Please try again.");
      }

      const parsedCV: CVData = await response.json();
      onImportSuccess(parsedCV);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while parsing.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Handle manual file upload (TXT, JSON, PDF, DOCX/DOC)
  const handleFile = (file: File) => {
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.personalInfo) {
            onImportSuccess(json as CVData);
          } else {
            setError("Invalid JSON format. Expected structured CV fields.");
          }
        } catch (err) {
          setError("Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      parseCVFile(file);
    }
  };

  const parseCVFile = async (file: File) => {
    setError(null);
    const interval = startLoadingAnimation();

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/parse-cv-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to parse document. Please try again.");
      }

      const parsedCV: CVData = await response.json();
      onImportSuccess(parsedCV);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while parsing the file.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
      <div className="max-w-xl mx-auto text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">AI Resume Importer</h2>
        <p className="text-gray-500 mt-1.5">
          Paste any existing text resume, or drop a file to automatically structure it into a customizable profile.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Left: Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[300px] ${
            isDragActive
              ? "border-emerald-500 bg-emerald-50/30"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
          }`}
          id="drag-drop-zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            accept=".txt,.json,.pdf,.docx,.doc"
          />
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <span className="font-semibold text-gray-800">Drag & Drop Resume File</span>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Supports <strong className="font-semibold">.pdf</strong>, <strong className="font-semibold">.docx</strong>, <strong className="font-semibold">.txt</strong>, or pre-exported structured <strong className="font-semibold">.json</strong>.
          </p>
          <span className="text-xs text-gray-400 mt-4 px-3 py-1 bg-gray-100 rounded-full font-mono">
            Or click to select from files
          </span>
        </div>

        {/* Right: Text Paste Area */}
        <div className="flex flex-col h-full min-h-[300px]" id="text-paste-zone">
          <div className="flex-1 flex flex-col">
            <label htmlFor="raw-cv-textarea" className="block text-sm font-semibold text-gray-700 mb-2">
              Or paste raw CV text
            </label>
            <textarea
              id="raw-cv-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your existing resume text here..."
              className="w-full flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-sans resize-none min-h-[180px]"
              disabled={loading}
            />
          </div>
          <button
            type="button"
            id="parse-text-btn"
            disabled={loading}
            onClick={() => parseCVText(rawText)}
            className="mt-4 w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Parse CV with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Parsing Your Resume</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium min-h-[20px] text-emerald-600 font-mono">
              {steps[loadingStep]}
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-6">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000"
                style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              This usually takes 5 to 10 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 max-w-2xl mx-auto" id="parse-error-alert">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-800 text-sm">Parsing Failed</span>
            <p className="text-rose-600 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
