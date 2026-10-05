"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, Briefcase, Sparkles,
  LogOut, ArrowLeft, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to load profile.");
        const data = await res.json();
        setProfile(data);
      } catch {
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading your profile...</p>
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your career assistant account</p>
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

            {/* Quick Links */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                <Briefcase className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-4 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl transition-all group"
                >
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Browse Jobs</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Find your next role</p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl opacity-60 cursor-not-allowed">
                  <div className="w-9 h-9 bg-slate-300 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Resume Builder</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Coming in Week 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
