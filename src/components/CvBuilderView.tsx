/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Printer, RefreshCw, User, Mail, Phone, MapPin, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";

interface CVData {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  objective: string;
  education: string;
  experience: string;
  skills: string[];
  style: string;
}

export default function CvBuilderView() {
  const [form, setForm] = useState({
    name: "Achu Silas Ndumbe",
    email: "achu.silas@gmail.com",
    phone: "+237 675 11 22 33",
    address: "Fiango, Kumba, SW Region, Cameroon",
    education: "Hardware Maintenance Course (12 months), Computer Jungle Training Center Kumba",
    experience: "Repaired laptops for community members, set up local Wi-Fi router for family shop",
    skills: "Windows installation, basic soldering, office reports typing",
    objective: "To get a technical IT assistant job in Kumba.",
    templateStyle: "ATS Professional",
  });

  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/cv-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCv(data.optimizedCV);
        setAiUsed(data.aiModelUsed !== "Rule-Based Mock fallback");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-zinc-950 rounded-2xl shadow-sm border border-zinc-800">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">AI-Powered Tech Resume Builder</h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-lg mx-auto">
          Create an ATS-compliant professional tech CV. Input your credentials and let our Gemini AI assistant optimize your career points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
          <h3 className="font-bold text-sm text-zinc-200 mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
            <span>Enter CV Details</span>
          </h3>

          <form onSubmit={handleOptimize} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Address / Location</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Education & Certifications</label>
              <textarea
                rows={2}
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Experience / Lab Work</label>
              <textarea
                rows={2}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="List your projects, repairs or administrative roles..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Professional Skills (comma separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Target Objective / Summary</label>
              <textarea
                rows={2}
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Style Template</label>
                <select
                  value={form.templateStyle}
                  onChange={(e) => setForm({ ...form, templateStyle: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none"
                >
                  <option className="bg-zinc-950 text-zinc-100">ATS Professional</option>
                  <option className="bg-zinc-950 text-zinc-100">Minimalist Charcoal</option>
                  <option className="bg-zinc-950 text-zinc-100">Academic Standard</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Optimize with AI"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview panel */}
        <div className="lg:col-span-7 border border-zinc-800 bg-zinc-950 rounded-2xl p-6 relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {cv && (
              <button
                onClick={handlePrint}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 p-2.5 rounded-xl cursor-pointer shadow-sm text-xs flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4 text-zinc-400" />
                <span>Download CV</span>
              </button>
            )}
          </div>

          {!cv ? (
            <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <div className="bg-zinc-900 text-blue-400 p-4 rounded-full mb-4 border border-zinc-800">
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="font-bold text-sm text-zinc-300">No CV Generated Yet</h4>
              <p className="text-xs max-w-sm mt-1">
                Fill out the technical form on the left, then click <strong>&quot;Optimize with AI&quot;</strong> to generate a recruiter-grade CV.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900/60 p-8 border border-zinc-800 rounded-xl shadow-lg font-sans max-w-full print:border-none print:shadow-none print:p-0">
              {aiUsed && (
                <div className="bg-blue-950/20 border border-blue-900/40 text-blue-400 text-[10px] py-1.5 px-3 rounded-lg mb-6 flex items-center gap-1.5 select-none print:hidden">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Optimized by <strong>Gemini AI model</strong> for high-rate ATS screening!</span>
                </div>
              )}

              {/* Personal Header */}
              <div className="text-center pb-6 border-b border-zinc-800">
                <h2 className="text-2xl font-black text-zinc-100 tracking-tight">{cv.personal.name}</h2>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {cv.personal.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {cv.personal.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {cv.personal.address}
                  </span>
                </div>
              </div>

              {/* Objective */}
              <div className="mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Professional Summary
                </h4>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{cv.objective}</p>
              </div>

              {/* Education */}
              <div className="mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> Education & Credentials
                </h4>
                <div className="mt-2.5">
                  <p className="text-xs font-bold text-zinc-200">{cv.education}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 font-semibold">Computer Jungle Training Center</p>
                </div>
              </div>

              {/* Experience */}
              <div className="mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" /> Practical Internships & Projects
                </h4>
                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed whitespace-pre-line">{cv.experience}</p>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-1">
                  Technical Core Competencies
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cv.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-zinc-900 text-zinc-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg font-mono border border-zinc-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer motto */}
              <div className="mt-12 text-center text-[10px] text-zinc-500 font-mono border-t border-zinc-800 pt-4">
                &quot;In Computer, We Trust&quot; &bull; Computer Jungle Alumnus CV
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
