"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, Sparkles,
  LogOut, ArrowLeft, Loader2, AlertCircle, CheckCircle,
  Bookmark, Trash2
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { API_BASE } from "../lib/api";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfileAndApps = async () => {
      try {
        const [profRes, appRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/applications`, {
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

        if (appRes.ok) {
          const appsData = await appRes.json();
          setApplications(appsData);
        }
      } catch {
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndApps();
  }, [router]);

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
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading your profile & application tracker...</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
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
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500 opacity-15 dark:opacity-20 blur-[120px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center max-w-5xl mx-auto px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-5 h-5" /> Capabl.
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/50 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Profile & Career Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your profile, ATS application status, and career goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                {profile?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{profile?.email}</p>

              {/* Status Badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                {profile?.is_active ? "Account Active" : "Account Inactive"}
              </div>

              {/* User ID */}
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-4 font-mono">User ID: #{profile?.id}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2 space-y-4">
            {/* Account Details */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Account Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/70">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-800/50">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Full Name</p>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm">{profile?.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/70">
                  <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-100 dark:border-violet-800/50">
                    <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Email Address</p>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm">{profile?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 3 Feature 3: Application Tracking System (ATS Table) */}
        <div className="mt-10 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-500" />
                Application Tracking System (ATS Tracker)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track your active job applications, interview stages, and saved opportunities
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
                Go to the jobs page and click &quot;Apply &amp; Track&quot; or bookmark any opening to manage your pipeline here.
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
      </div>
    </main>
  );
}
