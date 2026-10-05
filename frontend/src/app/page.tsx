"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, DollarSign, Loader2, Sparkles, LogIn, UserPlus, AlertCircle, LogOut, User } from "lucide-react";
import Link from "next/link";

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

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
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
      setError("Could not connect to backend. Make sure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
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
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hero + Nav */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Nav */}
        <nav className="relative z-20 flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
          <div className="font-bold text-xl text-indigo-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Capabl.
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-slate-600 font-semibold hover:text-indigo-600 transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" /> Log in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm text-sm"
                >
                  <UserPlus className="w-4 h-4" /> Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>

        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6 border border-indigo-100 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Assistant</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Find your dream job <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              faster and smarter
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
            Experience the next generation of job searching. Personalized recommendations, advanced filtering, and a seamless experience.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title or keyword"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Location (e.g. Bengaluru)"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex-1 relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none cursor-pointer"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Any Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="2-4 Years">2-4 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="4-6 Years">4-6 Years</option>
              </select>
            </div>
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md shadow-indigo-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center min-w-[140px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Jobs"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Recommended Jobs</h2>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {jobs.length} result{jobs.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Backend error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Finding the perfect matches...</p>
          </div>
        ) : jobs.length === 0 && !error ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">Try adjusting your search filters to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 hover:border-indigo-200 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-110 transition-transform">
                    {job.company.charAt(0)}
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {job.salary}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{job.company}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    <Briefcase className="w-3.5 h-3.5" /> {job.experience}
                  </span>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                  {job.description}
                </p>

                <button className="w-full bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-semibold py-2.5 rounded-xl transition-all duration-300 border border-slate-200 hover:border-transparent mt-auto text-sm">
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
