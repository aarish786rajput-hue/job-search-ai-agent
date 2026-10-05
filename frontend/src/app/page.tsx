"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Loader2,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  description: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state
  useEffect(() => {
    Promise.resolve().then(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    });
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (title) params.append("title", title);
      if (location) params.append("location", location);
      if (experience) params.append("experience", experience);

      const res = await fetch(`${API_BASE}/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setJobs(data);
    } catch {
      setError("Could not connect to backend. Please ensure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchJobs();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchJobs();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Hero + Nav */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        {/* Nav */}
        <nav className="relative z-20 flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="font-bold text-xl text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Capabl.
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                >
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/50 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm px-3 py-2 rounded-xl"
                >
                  <LogIn className="w-4 h-4" /> Log in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-indigo-500/25 text-sm active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4" /> Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[350px] w-[350px] rounded-full bg-indigo-500 opacity-20 dark:opacity-25 blur-[120px] pointer-events-none"></div>

        {/* Hero Header */}
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-18 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 border border-indigo-100 dark:border-indigo-800/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Career Assistant</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Find your dream job <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              faster and smarter
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-normal">
            Experience the next generation of job searching. Personalized recommendations, advanced filtering, and a seamless career experience.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 backdrop-blur-md">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title or keyword"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 outline-none transition-all text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Location (e.g. Bengaluru)"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 outline-none transition-all text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex-1 relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 outline-none transition-all appearance-none cursor-pointer text-sm"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">Any Experience</option>
                <option value="Fresher" className="dark:bg-slate-900 dark:text-slate-100">Fresher</option>
                <option value="2-4 Years" className="dark:bg-slate-900 dark:text-slate-100">2-4 Years</option>
                <option value="3-5 Years" className="dark:bg-slate-900 dark:text-slate-100">3-5 Years</option>
                <option value="4-6 Years" className="dark:bg-slate-900 dark:text-slate-100">4-6 Years</option>
              </select>
            </div>
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/30 hover:shadow-lg active:scale-[0.98] flex items-center justify-center min-w-[140px] text-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Jobs"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Jobs</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Top tech roles curated for your profile</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            {jobs.length} result{jobs.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Backend error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Finding the perfect matches...</p>
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">Try adjusting your search keywords or location filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/70 dark:to-violet-950/70 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl group-hover:scale-110 transition-transform">
                    {job.company.charAt(0)}
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {job.salary}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-4">{job.company}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/70">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/70">
                    <Briefcase className="w-3.5 h-3.5" /> {job.experience}
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                  {job.description}
                </p>

                <button className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white dark:hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-300 border border-slate-200 dark:border-slate-700/80 hover:border-transparent mt-auto text-sm cursor-pointer">
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
