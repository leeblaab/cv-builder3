import React, { useState } from "react";
import { Sparkles, Loader2, ArrowRight, ShieldCheck, AlertCircle, Bookmark, CheckCircle, Lightbulb } from "lucide-react";
import { CVData, TailoredCVResult } from "../types";

interface JobTailorProps {
  cvData: CVData;
  onTailoringComplete: (result: TailoredCVResult) => void;
  sampleJob: string;
  onBeforeTailor?: () => boolean;
}

export default function JobTailor({ cvData, onTailoringComplete, sampleJob, onBeforeTailor }: JobTailorProps) {
  const [jobDescription, setJobDescription] = useState(sampleJob);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadingSteps = [
    "Analyzing target job description...",
    "Extracting desired tech stack and core soft skills...",
    "Scanning current CV for potential transferrable achievements...",
    "Aligning summary and roles with critical keywords...",
    "Generating interview prep tactics based on the matches...",
    "Finalizing tailored professional resume..."
  ];

  const handleTailor = async () => {
    if (onBeforeTailor) {
      const allowed = onBeforeTailor();
      if (!allowed) return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a valid Job Description first.");
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      const response = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, jobDescription }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to tailor your resume. Please check your credentials.");
      }

      const result: TailoredCVResult = await response.json();
      onTailoringComplete(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during CV tailoring.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
      <div className="max-w-2xl mx-auto text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Powered by Gemini AI
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-3">Tailor CV to Job Description</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Paste the job description of your target role. Gemini will intelligently rewrite your resume summaries, reframe accomplishments, highlight skills, and boost your ATS score.
        </p>
      </div>

      <div className="space-y-5 max-w-4xl mx-auto">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="job-description-textarea" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Target Job Description
            </label>
            <button
              type="button"
              onClick={() => setJobDescription(sampleJob)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              Load Sample Job (Senior Full-Stack)
            </button>
          </div>
          <textarea
            id="job-description-textarea"
            rows={12}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job posting title, company info, responsibilities, and key requirements here..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-sans resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Factual Integrity: Original companies, dates, and roles are fully preserved.</span>
          </div>

          <button
            type="button"
            id="tailor-now-btn"
            disabled={loading || !jobDescription.trim()}
            onClick={handleTailor}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tailoring Your CV...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Optimize & Tailor Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Modal Screen */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Tailoring in Progress</h3>
            <p className="text-sm text-emerald-600 font-semibold font-mono mt-2 min-h-[40px] px-2">
              {loadingSteps[loadingStep]}
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-6">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Gemini is aligning descriptions, updating ATS keywords, and formulating interview advice.
            </p>
          </div>
        </div>
      )}

      {/* Error Output */}
      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 max-w-2xl mx-auto" id="tailor-error-alert">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-800 text-sm">Tailoring Failed</span>
            <p className="text-rose-600 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
