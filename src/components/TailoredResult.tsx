import React from "react";
import { Check, Copy, Printer, FileDown, CheckCircle, AlertTriangle, Lightbulb, RefreshCw, ArrowLeft, ArrowDown, Download, Loader2 } from "lucide-react";
import { TailoringAnalysis, CVData } from "../types";

interface TailoredResultProps {
  analysis: TailoringAnalysis;
  onReset: () => void;
  onPrint: () => void;
  onDownloadPDF: () => void;
  isPdfGenerating: boolean;
  cvData: CVData;
}

export default function TailoredResult({ analysis, onReset, onPrint, onDownloadPDF, isPdfGenerating, cvData }: TailoredResultProps) {
  const [copied, setCopied] = React.useState(false);

  // Score tier styles
  const getScoreColor = (score: number) => {
    if (score >= 85) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", progress: "bg-emerald-500" };
    if (score >= 65) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", progress: "bg-amber-500" };
    return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", progress: "bg-rose-500" };
  };

  const styleColors = getScoreColor(analysis.matchScore);

  const handleCopyText = () => {
    try {
      // Build plain-text layout for easy copy paste
      const sections = [
        `${cvData.personalInfo.fullName}`,
        `${cvData.personalInfo.email} | ${cvData.personalInfo.phone} | ${cvData.personalInfo.location}`,
        `${cvData.personalInfo.website}`,
        `\nSUMMARY\n${cvData.personalInfo.summary}`,
        `\nEXPERIENCE`,
        ...cvData.experience.map(
          (exp) =>
            `${exp.position} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}`
        ),
        `\nEDUCATION`,
        ...cvData.education.map(
          (edu) =>
            `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`
        ),
        `\nSKILLS`,
        ...cvData.skills.map((cat) => `${cat.name}: ${cat.skills.join(", ")}`),
      ];

      navigator.clipboard.writeText(sections.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text: ", err);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${cvData.personalInfo.fullName.replace(/\s+/g, "_")}_Tailored_CV.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8" id="tailored-result-analytics">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Tailoring Complete!</h2>
          <p className="text-gray-500 text-xs mt-1">Review your match scores, changes, and prepare for interviews below.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            id="start-over-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset / Tailor Again</span>
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            id="copy-plain-text-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            id="print-pdf-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF fallback</span>
          </button>
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isPdfGenerating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            id="download-pdf-direct-btn"
          >
            {isPdfGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isPdfGenerating ? "Generating PDF..." : "Download PDF"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-2 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer"
            title="Download JSON Backup"
            id="download-json-btn"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Match Score Meter */}
        <div className={`p-6 rounded-xl border ${styleColors.border} ${styleColors.bg} flex flex-col items-center justify-center text-center`}>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">ATS Match Rating</span>
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-white shadow-xs border border-gray-100">
            <span className={`text-3xl font-black ${styleColors.text}`}>{analysis.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-200/60 h-2 rounded-full overflow-hidden mt-5 max-w-[160px]">
            <div className={`h-full ${styleColors.progress}`} style={{ width: `${analysis.matchScore}%` }} />
          </div>
          <p className="text-xs text-gray-600 font-medium mt-3 leading-relaxed">
            Your modified accomplishments now match standard parsing thresholds!
          </p>
        </div>

        {/* Change Log / Changes made */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Summary of Changes Made</span>
          </h3>
          <div className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-4 border border-gray-100 rounded-xl max-h-[140px] overflow-y-auto">
            {analysis.summaryOfChanges.split("\n").map((line, idx) => (
              <p key={idx} className="mb-1.5 last:mb-0">{line}</p>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-100" />

      {/* Keywords Matrices */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Keywords Matched */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Keywords Matched & Integrated ({analysis.keywordsMatched?.length || 0})</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 p-4 border border-emerald-100/60 bg-emerald-50/10 rounded-xl min-h-[100px]">
            {analysis.keywordsMatched?.map((word, idx) => (
              <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {word}
              </span>
            ))}
            {(!analysis.keywordsMatched || analysis.keywordsMatched.length === 0) && (
              <span className="text-xs text-gray-400">No matching keywords isolated.</span>
            )}
          </div>
        </div>

        {/* Keywords Missing / Development opportunities */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Keywords Missing / Study Prep ({analysis.keywordsMissing?.length || 0})</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 p-4 border border-amber-100/60 bg-amber-50/10 rounded-xl min-h-[100px]">
            {analysis.keywordsMissing?.map((word, idx) => (
              <span key={idx} className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {word}
              </span>
            ))}
            {(!analysis.keywordsMissing || analysis.keywordsMissing.length === 0) && (
              <span className="text-xs text-gray-400">Perfect keyword optimization! Nothing missing.</span>
            )}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-100" />

      {/* Interview Prep / High Yield Tips */}
      {analysis.interviewTips && analysis.interviewTips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-500" />
            <span>Interview Strategy (Tailored Tips)</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {analysis.interviewTips.map((tip, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 flex gap-3">
                <span className="font-extrabold text-emerald-600 text-sm">0{idx + 1}</span>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt scroll hint */}
      <div className="mt-8 flex justify-center text-center">
        <a href="#cv-preview-section" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 font-semibold transition-colors duration-200">
          <span>Scroll down to see the final tailored CV layout</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce mt-0.5" />
        </a>
      </div>
    </div>
  );
}
