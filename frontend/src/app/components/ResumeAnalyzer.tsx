"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { API_BASE } from "../lib/api";

interface ResumeAnalysis {
  email?: string;
  phone?: string;
  skills: string[];
  total_skills_found: number;
  ats_score: number;
  rating: string;
  strengths: string[];
  improvements: string[];
  word_count: number;
}

interface ResumeAnalyzerProps {
  onSkillsDetected?: (skills: string[]) => void;
}

export function ResumeAnalyzer({ onSkillsDetected }: ResumeAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (uploadedFile: File) => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const res = await fetch(`${API_BASE}/api/resume/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to analyze resume.");
      }

      const data: ResumeAnalysis = await res.json();
      setAnalysis(data);
      if (onSkillsDetected && data.skills.length > 0) {
        onSkillsDetected(data.skills);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error processing resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50/70 via-violet-50/50 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 sm:p-8 shadow-lg shadow-indigo-100/40 dark:shadow-none mb-12 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Resume Analyzer & ATS Scorer (Week 3)
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Upload Your Resume for Instant AI Job Matching
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Our NLP engine parses your technical skills, calculates your ATS score, and recommends top matches.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      {!analysis && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-8 text-center bg-white/80 dark:bg-slate-800/50 backdrop-blur-xs transition-all relative cursor-pointer group"
        >
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Parsing PDF & Analyzing Technical Skills with NLP...
              </p>
              <p className="text-xs text-slate-400 mt-1">Calculating ATS Score and matching job profiles</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
                Drop your Resume PDF here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400">Supports PDF & TXT up to 5MB</p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ATS Score Card */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">ATS Match Score</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {analysis.ats_score}
                  </span>
                  <span className="text-slate-400 text-sm">/ 100</span>
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.rating}
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${analysis.ats_score}%` }}
                />
              </div>
            </div>

            {/* Extracted Skills Card */}
            <div className="md:col-span-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  Detected Skills ({analysis.total_skills_found})
                </span>
                <button
                  onClick={() => {
                    setAnalysis(null);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Upload Another Resume
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {analysis.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white/90 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-sm space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Insights & Suggestions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {analysis.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-bold">✓</span> {str}
                </div>
              ))}
              {analysis.improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                  <span className="font-bold">!</span> {imp}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
