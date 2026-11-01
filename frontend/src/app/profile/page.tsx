"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, Sparkles,
  LogOut, ArrowLeft, Loader2, AlertCircle, CheckCircle,
  Bookmark, Trash2, Bell, Briefcase, MapPin, DollarSign,
  Clock, Plus, Send, ToggleLeft, ToggleRight, Radio, Save
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { NotificationBell } from "../components/NotificationBell";
import { API_BASE } from "../lib/api";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  target_role?: string;
  target_salary?: string;
  preferred_locations?: string;
  notice_period?: string;
  work_mode?: string;
  primary_skills?: string;
  experience_years?: string;
}

interface JobAlert {
  id: number;
  keyword: string;
  location: string;
  min_salary: string;
  work_mode: string;
  channel: string;
  frequency: string;
  is_active: boolean;
  matched_jobs_count: number;
  created_at?: string;
}

interface TrackedApplication {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  salary: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"goals" | "alerts" | "applications">("goals");
  const [toastMessage, setToastMessage] = useState<string>("");
  const router = useRouter();

  // Career Goals Form State
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [targetSalary, setTargetSalary] = useState("15 LPA");
  const [noticePeriod, setNoticePeriod] = useState("30 days");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [preferredLocations, setPreferredLocations] = useState("Bengaluru, Remote");
  const [primarySkills, setPrimarySkills] = useState("React, Next.js, FastAPI, Python");
  const [experienceYears, setExperienceYears] = useState("2-4 Years");
  const [savingGoals, setSavingGoals] = useState(false);

  // New Alert Form State
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("Bengaluru");
  const [newMinSalary, setNewMinSalary] = useState("15 LPA");
  const [newWorkMode, setNewWorkMode] = useState("Any");
  const [newChannel, setNewChannel] = useState("Email & SMS");
  const [creatingAlert, setCreatingAlert] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profRes, appRes, alertRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/applications`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/alerts`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (profRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!profRes.ok) throw new Error("Failed to load profile.");
        const profData = await profRes.json();
        setProfile(profData);

        if (profData.target_role) setTargetRole(profData.target_role);
        if (profData.target_salary) setTargetSalary(profData.target_salary);
        if (profData.notice_period) setNoticePeriod(profData.notice_period);
        if (profData.work_mode) setWorkMode(profData.work_mode);
        if (profData.preferred_locations) setPreferredLocations(profData.preferred_locations);
        if (profData.primary_skills) setPrimarySkills(profData.primary_skills);
        if (profData.experience_years) setExperienceYears(profData.experience_years);

        if (appRes.ok) {
          const appsData = await appRes.json();
          setApplications(appsData);
        }

        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setAlerts(alertData);
        }
      } catch {
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // ── Save Career Goals ──────────────────────────────────────────────────────
  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingGoals(true);
    try {
      const payload = {
        target_role: targetRole,
        target_salary: targetSalary,
        notice_period: noticePeriod,
        work_mode: workMode,
        preferred_locations: preferredLocations,
        primary_skills: primarySkills,
        experience_years: experienceYears
      };

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setProfile(updated);
      showToast("Career goals & Indian job preferences saved successfully! ✨");
    } catch {
      showToast("Failed to save career goals.");
    } finally {
      setSavingGoals(false);
    }
  };

  // ── Create Job Alert ───────────────────────────────────────────────────────
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !newKeyword.trim()) return;

    setCreatingAlert(true);
    try {
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          location: newLocation,
          min_salary: newMinSalary,
          work_mode: newWorkMode,
          channel: newChannel,
          frequency: "Instant"
        })
      });

      if (!res.ok) throw new Error("Could not create alert");
      const created = await res.json();
      setAlerts((prev) => [created, ...prev]);
      setNewKeyword("");
      setShowAddAlert(false);
      showToast(`Job alert activated for '${created.keyword}' (${created.channel})! 🔔`);
    } catch {
      showToast("Failed to create job alert.");
    } finally {
      setCreatingAlert(false);
    }
  };

  // ── Toggle Alert ───────────────────────────────────────────────────────────
  const handleToggleAlert = async (alertId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, is_active: !a.is_active } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Trigger Test Notification ──────────────────────────────────────────────
  const handleTriggerTest = async (alert: JobAlert) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/alerts/${alert.id}/trigger`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(
          `🔔 Notification Sent via ${alert.channel}: Matched ${alert.matched_jobs_count || 2} jobs for '${alert.keyword}'!`
        );
      }
    } catch {
      showToast("Notification simulation failed.");
    }
  };

  // ── Delete Alert ───────────────────────────────────────────────────────────
  const handleDeleteAlert = async (alertId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        showToast("Job alert deleted.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Update Application Status ──────────────────────────────────────────────
  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        showToast(`Application moved to '${newStatus}'!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Delete Application ─────────────────────────────────────────────────────
  const handleDeleteApp = async (appId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
        showToast("Application removed from tracker.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading your profile & career hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-200 border border-slate-700 dark:border-slate-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500 opacity-15 dark:opacity-20 blur-[120px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center max-w-6xl mx-auto px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-5 h-5" /> Capabl.
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/50 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              Candidate Profile &amp; Career Hub
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Week 4 Track B
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Manage your career goals, active job alerts with Email/SMS notifications, and ATS applications.
            </p>
          </div>
        </div>

        {/* Profile Summary Banner */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/25 shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h2>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{profile?.email}</p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                Targeting: {profile?.target_role || targetRole} • {profile?.target_salary || targetSalary} • {profile?.notice_period || noticePeriod} Notice
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-around md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Job Alerts</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{alerts.length} Active</span>
            </div>
            <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Applications</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{applications.length} Saved</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "goals"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Career Goals &amp; Preferences
          </button>

          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "alerts"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bell className="w-4 h-4" />
            Job Alert System ({alerts.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "applications"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            ATS Tracker ({applications.length})
          </button>
        </div>

        {/* ── TAB 1: CAREER GOALS & PREFERENCES (WEEK 4 CORE) ─────────────── */}
        {activeTab === "goals" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Career Goals &amp; Indian Market Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize your target compensation (in LPA), notice period (30/60/90 days), and preferred hiring locations.
              </p>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Target Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, AI Engineer"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Full Stack Developer", "AI Engineer", "Backend Developer", "Data Scientist"].map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setTargetRole(r)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 border border-transparent cursor-pointer"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Salary (in LPA) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Target Annual Salary (in LPA format)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                      placeholder="e.g. 15 LPA, 24 LPA"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {["8-12 LPA", "15-20 LPA", "25-35 LPA", "40+ LPA"].map((sal) => (
                      <button
                        type="button"
                        key={sal}
                        onClick={() => setTargetSalary(sal)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {sal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice Period (Indian specific: Immediate, 30, 60, 90 days) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Notice Period Handling (Indian Industry Standard)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Immediate", "30 days", "60 days", "90 days"].map((period) => (
                      <button
                        type="button"
                        key={period}
                        onClick={() => setNoticePeriod(period)}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          noticePeriod === period
                            ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Work-From-Home / Location Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Remote", "Hybrid", "On-site"].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setWorkMode(mode)}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          workMode === mode
                            ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Locations (Metro vs Tier-2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Preferred Tech Hubs (Metro &amp; Tier-2)
                  </label>
                  <input
                    type="text"
                    value={preferredLocations}
                    onChange={(e) => setPreferredLocations(e.target.value)}
                    placeholder="e.g. Bengaluru, Pune, Hyderabad, Remote"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi-NCR", "Remote"].map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => {
                          if (!preferredLocations.includes(loc)) {
                            setPreferredLocations(preferredLocations ? `${preferredLocations}, ${loc}` : loc);
                          }
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        + {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Fresher">Fresher (0 Years)</option>
                    <option value="1-3 Years">Junior (1-3 Years)</option>
                    <option value="3-5 Years">Mid-Senior (3-5 Years)</option>
                    <option value="5-8 Years">Lead / Principal (5-8 Years)</option>
                  </select>
                </div>

                {/* Primary Skills */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Primary Tech Skills
                  </label>
                  <input
                    type="text"
                    value={primarySkills}
                    onChange={(e) => setPrimarySkills(e.target.value)}
                    placeholder="e.g. React, Next.js, FastAPI, Python, PostgreSQL, LangGraph"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingGoals}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {savingGoals ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Career Goals
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: JOB ALERT SYSTEM WITH NOTIFICATIONS (WEEK 4 CORE) ───── */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Automated Job Alerts &amp; Notifications
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Receive instant notifications via Email and SMS when new openings match your criteria.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showAddAlert ? "Cancel" : "Create New Alert"}
                </button>
              </div>

              {/* Add Alert Form */}
              {showAddAlert && (
                <form
                  onSubmit={handleCreateAlert}
                  className="mb-8 p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 animate-in fade-in duration-200"
                >
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Set Alert Criteria</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Job Title / Keyword
                      </label>
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g. AI Engineer, Python"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Location
                      </label>
                      <select
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Any">Any Location / Remote</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Delhi">Delhi-NCR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Minimum Target Salary
                      </label>
                      <input
                        type="text"
                        value={newMinSalary}
                        onChange={(e) => setNewMinSalary(e.target.value)}
                        placeholder="e.g. 15 LPA"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Notification Channel
                      </label>
                      <select
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Email & SMS">Email &amp; SMS (Recommended)</option>
                        <option value="Email">Email Only</option>
                        <option value="SMS">SMS Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={creatingAlert || !newKeyword.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {creatingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Activate Alert
                    </button>
                  </div>
                </form>
              )}

              {/* Active Alerts List */}
              {alerts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No active job alerts</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Create alerts for your target roles to get instant email and SMS notifications when relevant tech openings are published.
                  </p>
                  <button
                    onClick={() => setShowAddAlert(true)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Create Your First Job Alert
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.keyword}</h4>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              alert.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            }`}
                          >
                            {alert.is_active ? "Active" : "Paused"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {alert.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <DollarSign className="w-3 h-3" /> Min: {alert.min_salary}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Channel: {alert.channel}</span>
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3" /> {alert.matched_jobs_count} matched opening(s) live right now
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTriggerTest(alert)}
                          className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                          title="Simulate sending email/SMS notification"
                        >
                          <Send className="w-3.5 h-3.5" /> Test Dispatch
                        </button>

                        <button
                          onClick={() => handleToggleAlert(alert.id)}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-xl transition-colors cursor-pointer"
                          title={alert.is_active ? "Pause alert" : "Resume alert"}
                        >
                          {alert.is_active ? <ToggleRight className="w-5 h-5 text-indigo-600" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors cursor-pointer"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: APPLICATION TRACKING SYSTEM (ATS TRACKER) ─────────────── */}
        {activeTab === "applications" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-500" />
                  Application Tracking System (ATS Pipeline)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Track your job pipeline from Saved to Interviewing and Offer stages.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {applications.length} Tracked
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No tracked applications yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Browse jobs on the homepage and click &quot;Apply &amp; Track&quot; or save any opening to manage your pipeline here.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Browse &amp; Track Jobs →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.job_title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {app.company} • {app.location} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{app.salary}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                          app.status === "Offer"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                            : app.status === "Interviewing"
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                            : app.status === "Applied"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800"
                            : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer Received</option>
                        <option value="Rejected">Archived</option>
                      </select>

                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove from tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
