"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Bot, Award, CheckCircle, AlertCircle,
  ArrowRight, Loader2, Copy, Check, Calendar,
  DollarSign, TrendingUp, Compass, BookOpen, Send
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { NotificationBell } from "../components/NotificationBell";
import { API_BASE } from "../lib/api";

interface EvalResult {
  score: number;
  strengths: string[];
  improvements: string[];
  model_answer: string;
  is_complete: boolean;
  next_index: number | null;
  next_question: string | null;
}

interface NegotiationResult {
  offered_lpa: number;
  target_lpa: number;
  difference_lpa: number;
  difference_percent: number;
  estimated_in_hand_monthly_offered: string;
  estimated_in_hand_monthly_target: string;
  email_draft: string;
  talking_points: string[];
}

interface RoadmapResult {
  target_role: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  total_required: number;
  roadmap: Array<{ week: string; focus: string; project: string }>;
}

export default function InterviewCareerPage() {
  const [activeTab, setActiveTab] = useState<"interview" | "negotiate" | "roadmap" | "schedule">("interview");

  // ── Mock Interview State ───────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState("AI Engineer");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvalResult | null>(null);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [scoresHistory, setScoresHistory] = useState<number[]>([]);

  // ── Negotiation State ──────────────────────────────────────────────────────
  const [companyName, setCompanyName] = useState("Tech Innovators");
  const [negotiateRole, setNegotiateRole] = useState("Senior AI Engineer");
  const [offeredLpa, setOfferedLpa] = useState("18");
  const [targetLpa, setTargetLpa] = useState("24");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // ── Roadmap State ──────────────────────────────────────────────────────────
  const [roadmapRole, setRoadmapRole] = useState("AI Engineer");
  const [currentSkills, setCurrentSkills] = useState("Python, FastAPI, SQL, React");
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [analyzingRoadmap, setAnalyzingRoadmap] = useState(false);

  // ── Schedule State ─────────────────────────────────────────────────────────
  const [scheduleRole, setScheduleRole] = useState("Full Stack Developer");
  const [scheduleDate, setScheduleDate] = useState("2026-11-05");
  const [scheduleTime, setScheduleTime] = useState("15:00");
  const [scheduledResult, setScheduledResult] = useState<{
    scheduled_for: string;
    google_calendar_url: string;
    ics_content: string;
  } | null>(null);
  const [scheduling, setScheduling] = useState(false);

  // ── Start Interview ────────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`${API_BASE}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, difficulty })
      });
      const data = await res.json();
      setCurrentQuestion(data.question);
      setTotalQuestions(data.total_questions);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setEvaluation(null);
      setInterviewStarted(true);
      setInterviewFinished(false);
      setScoresHistory([]);
    } catch {
      alert("Could not initialize interview. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // ── Submit Answer ──────────────────────────────────────────────────────────
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || evaluating) return;

    setEvaluating(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE}/api/interview/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          role: selectedRole,
          question_index: currentQuestionIndex,
          question: currentQuestion,
          user_answer: userAnswer
        })
      });

      const data: EvalResult = await res.json();
      setEvaluation(data);
      setScoresHistory((prev) => [...prev, data.score]);

      if (data.is_complete) {
        setInterviewFinished(true);
      }
    } catch {
      alert("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // ── Next Question ──────────────────────────────────────────────────────────
  const handleNextQuestion = () => {
    if (evaluation?.next_question) {
      setCurrentQuestion(evaluation.next_question);
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer("");
      setEvaluation(null);
    }
  };

  // ── Calculate Negotiation ──────────────────────────────────────────────────
  const handleCalculateNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    setNegotiating(true);
    try {
      const res = await fetch(`${API_BASE}/api/interview/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companyName,
          role: negotiateRole,
          offered_lpa: parseFloat(offeredLpa),
          target_lpa: parseFloat(targetLpa),
          notice_period_days: parseInt(noticePeriod)
        })
      });
      const data = await res.json();
      setNegotiationResult(data);
    } catch {
      alert("Negotiation calculation failed.");
    } finally {
      setNegotiating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  // ── Analyze Roadmap ────────────────────────────────────────────────────────
  const handleAnalyzeRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzingRoadmap(true);
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: roadmapRole,
          current_skills: currentSkills
        })
      });
      const data = await res.json();
      setRoadmapResult(data);
    } catch {
      alert("Roadmap analysis failed.");
    } finally {
      setAnalyzingRoadmap(false);
    }
  };

  // ── Schedule Interview ─────────────────────────────────────────────────────
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE}/api/interview/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          role: scheduleRole,
          date: scheduleDate,
          time: scheduleTime
        })
      });
      const data = await res.json();
      setScheduledResult(data);
    } catch {
      alert("Scheduling failed.");
    } finally {
      setScheduling(false);
    }
  };

  const downloadICS = () => {
    if (!scheduledResult?.ics_content) return;
    const blob = new Blob([scheduledResult.ics_content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock-interview-${scheduleRole.replace(/\s+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const averageScore = scoresHistory.length
    ? Math.round(scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length)
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-violet-500 opacity-15 dark:opacity-20 blur-[130px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center max-w-6xl mx-auto px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-5 h-5" /> CareerCraft
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <ThemeToggle />
          <Link
            href="/profile"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300"
          >
            My Profile
          </Link>
        </div>
      </nav>

      {/* Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                AI Career Suite &amp; Mock Interview Arena
                <span className="text-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  AI Powered
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Real-time AI Mock Interviews, Skill Gap Roadmaps, Salary Negotiation Coach, and Calendar Scheduling.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "interview"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Mock Interview Arena
          </button>

          <button
            onClick={() => setActiveTab("negotiate")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "negotiate"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Salary Negotiation Assistant
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Compass className="w-4 h-4" />
            Skill Gap &amp; Career Roadmap
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "schedule"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar Scheduling
          </button>
        </div>

        {/* ── TAB 1: AI MOCK INTERVIEW ARENA ─────────────────────────────────── */}
        {activeTab === "interview" && (
          <div className="space-y-6">
            {!interviewStarted ? (
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="max-w-xl">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">
                    Interactive AI Simulator
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Start Your Technical Mock Interview
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Practice realistic technical and architectural questions evaluated by our AI evaluator. Get immediate scores, strength breakdowns, and reference model answers.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Select Target Role
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {["AI Engineer", "Full Stack Developer", "Backend Developer"].map((r) => (
                          <button
                            key={r}
                            onClick={() => setSelectedRole(r)}
                            className={`p-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                              selectedRole === r
                                ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {["Junior", "Mid-Level", "Senior / Lead"].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                              difficulty === d
                                ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    disabled={evaluating}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Begin Interview Session
                  </button>
                </div>
              </div>
            ) : interviewFinished ? (
              /* Finish Screen */
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Mock Interview Completed!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  You finished all technical rounds for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedRole}</span>.
                </p>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-6">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Average Technical Score</span>
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{averageScore}%</span>
                  <p className="text-xs text-slate-500 mt-1">
                    {averageScore >= 80 ? "🌟 Excellent! Interview ready for top tech firms." : "👍 Solid attempt. Review the model answers to sharpen key concepts."}
                  </p>
                </div>

                <button
                  onClick={handleStartInterview}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
                >
                  Practice Another Session
                </button>
              </div>
            ) : (
              /* Active Interview Q&A */
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-xs font-medium text-slate-400">Role: {selectedRole}</span>
                  </div>

                  {/* Question Box */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                    {currentQuestion}
                  </h3>

                  {/* Answer Input */}
                  {!evaluation ? (
                    <form onSubmit={handleSubmitAnswer} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Your Technical Response:
                        </label>
                        <textarea
                          rows={6}
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type or dictate your architectural answer here. Mention key trade-offs, frameworks, and concurrency or caching mechanisms..."
                          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 font-sans"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={evaluating || !userAnswer.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          {evaluating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Submit for AI Review
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Evaluation Feedback Card */
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Score Banner */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg">
                            {evaluation.score}
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Technical Accuracy Score</span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {evaluation.score >= 80 ? "Strong Answer" : evaluation.score >= 60 ? "Proficient with Minor Gaps" : "Needs More Depth"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                          <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                            <CheckCircle className="w-4 h-4" /> Key Strengths
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {evaluation.strengths.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                            <AlertCircle className="w-4 h-4" /> Improvement Areas
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {evaluation.improvements.map((im, idx) => (
                              <li key={idx}>• {im}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Model Answer */}
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                          <BookOpen className="w-4 h-4 text-indigo-500" /> Reference Ideal Answer (Senior Level)
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {evaluation.model_answer}
                        </p>
                      </div>

                      {/* Next Question Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleNextQuestion}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          {evaluation.is_complete ? "View Final Summary" : "Next Question"} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SALARY NEGOTIATION ASSISTANT ────────────────────────────── */}
        {activeTab === "negotiate" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Indian Tech Pay Calculator &amp; Scripts
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                Salary Negotiation Coach &amp; In-Hand Estimator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Calculate estimated monthly in-hand take-home pay and generate tailored counter-offer email drafts for Indian HR discussions.
              </p>
            </div>

            <form onSubmit={handleCalculateNegotiation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={negotiateRole}
                  onChange={(e) => setNegotiateRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Offered CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={offeredLpa}
                  onChange={(e) => setOfferedLpa(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={targetLpa}
                  onChange={(e) => setTargetLpa(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={negotiating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {negotiating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Generate Negotiation Strategy
                </button>
              </div>
            </form>

            {negotiationResult && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                {/* Metrics Breakdown Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-medium">Offered In-Hand (Est.)</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{negotiationResult.estimated_in_hand_monthly_offered}</span>
                  </div>

                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-medium">Target In-Hand (Est.)</span>
                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{negotiationResult.estimated_in_hand_monthly_target}</span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">CTC Gap</span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">+{negotiationResult.difference_lpa} LPA</span>
                  </div>

                  <div className="p-4 bg-violet-50/70 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-800">
                    <span className="text-[11px] text-violet-600 dark:text-violet-400 block font-medium">Percentage Lift</span>
                    <span className="text-lg font-bold text-violet-700 dark:text-violet-300">+{negotiationResult.difference_percent}%</span>
                  </div>
                </div>

                {/* Counter Offer Email Draft */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Professional HR Counter-Offer Email Draft</h4>
                    <button
                      onClick={() => copyToClipboard(negotiationResult.email_draft)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEmail ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    {negotiationResult.email_draft}
                  </pre>
                </div>

                {/* Key Talking Points */}
                <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">Key Discussion Levers with Indian HR:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {negotiationResult.talking_points.map((tp, idx) => (
                      <li key={idx}>• {tp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CAREER PATH & SKILL GAP ROADMAP ─────────────────────────── */}
        {activeTab === "roadmap" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Personalized Learning Pathways
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-500" />
                Skill Gap Analysis &amp; Actionable Career Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Analyze missing competencies against industry job descriptions and follow a structured milestone curriculum.
              </p>
            </div>

            <form onSubmit={handleAnalyzeRoadmap} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Engineering Role</label>
                  <select
                    value={roadmapRole}
                    onChange={(e) => setRoadmapRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="AI Engineer">AI Engineer (LangGraph, RAG, LLMOps)</option>
                    <option value="Full Stack Developer">Full Stack Developer (Next.js, FastAPI, Tailwind)</option>
                    <option value="Backend Developer">Backend Developer (Python, Redis, Microservices)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Current Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    placeholder="e.g. Python, SQL, JavaScript"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={analyzingRoadmap}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {analyzingRoadmap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                  Analyze Competencies
                </button>
              </div>
            </form>

            {roadmapResult && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                {/* Match Overview */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Skill Compatibility with {roadmapResult.target_role}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Matched {roadmapResult.matched_skills.length} of {roadmapResult.total_required} core competencies.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {roadmapResult.match_percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Profile Match</span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Ready Competencies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmapResult.matched_skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Missing Competencies (Skill Gaps)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmapResult.missing_skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Milestone Action Roadmap */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recommended Milestone Action Roadmap:
                  </h4>
                  {roadmapResult.roadmap.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{step.week}</h5>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-2">{step.focus}</p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Hands-on Deliverable:</span> {step.project}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: CALENDAR SCHEDULING ────────────────────────────────────── */}
        {activeTab === "schedule" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Calendar Integration &amp; Reminders
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Schedule a Practice Mock Interview
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Book a structured technical session and sync it directly to Google Calendar or your default calendar app via .ICS export.
              </p>
            </div>

            <form onSubmit={handleScheduleInterview} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Interview Role</label>
                <select
                  value={scheduleRole}
                  onChange={(e) => setScheduleRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Session Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Session Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={scheduling}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Schedule Practice Session
                </button>
              </div>
            </form>

            {scheduledResult && (
              <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Session Booked Successfully!
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Scheduled for <span className="font-semibold text-slate-900 dark:text-white">{scheduledResult.scheduled_for}</span> ({scheduleRole}).
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={scheduledResult.google_calendar_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Add to Google Calendar
                  </a>

                  <button
                    onClick={downloadICS}
                    className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Download .ICS File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
