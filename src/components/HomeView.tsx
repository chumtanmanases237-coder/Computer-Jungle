/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, HelpCircle, Laptop, ShieldCheck, Cpu, Phone, MapPin, Award, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";
import { Course } from "../types";

interface HomeViewProps {
  courses: Course[];
  onNavigate: (tab: string, arg?: any) => void;
}

export default function HomeView({ courses, onNavigate }: HomeViewProps) {
  const faqList = [
    { q: "Where exactly is the Training Center located in Kumba?", a: "We are situated at Confidence Street Junction, Fiango, Kumba, South West Region, Cameroon. Our facilities feature fully-equipped computer labs with backup power generators." },
    { q: "What are the available learning shifts?", a: "We support three training schedules to fit your workflow: Morning Shift (8:00 AM - 12:00 PM), Afternoon Shift (1:00 PM - 4:00 PM), and Evening Shift (5:00 PM - 8:00 PM)." },
    { q: "Can I pay my tuition fees in installments?", a: "Yes, tuition fees can be paid in flexible installment plans (usually 2 or 3 payments). Installments must be approved by the Accountant and Principal." },
    { q: "Are certificates officially validated?", a: "Absolutely. All certificates are registered with a unique registry code, validation status, and barcode on our digital validation portal for employers." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-8 md:p-16 shadow-2xl border border-zinc-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800/5 rounded-full blur-3xl" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <Award className="h-4 w-4" />
            <span>Kumba&apos;s Premier School of Computer Technology</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-blue-400">
            COMPUTER JUNGLE <br className="hidden md:block" />
            TRAINING CENTER KUMBA
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-xl">
            Equipping Cameroon&apos;s future tech leaders with professional practical skills in Data Processing, Systematic Hardware Maintenance, Electronics Diagnostics, and Full-Stack Software Engineering.
          </p>

          <blockquote className="border-l-2 border-blue-500 pl-4 text-xs italic text-blue-400 font-mono">
            &quot;In Computer, We Trust&quot;
          </blockquote>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={() => onNavigate("admissions")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-600/20 cursor-pointer flex items-center gap-2 group"
            >
              <span>Apply Online Now</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate("repairs")}
              className="bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-100 font-medium text-xs px-6 py-3.5 rounded-xl cursor-pointer transition-colors"
            >
              Book Laptop Repair
            </button>
          </div>
        </div>
      </section>

      {/* Core Institutional Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-zinc-800 text-blue-400 border border-zinc-700 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight">Our Mission</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              To provide affordable, high-quality, fully-practical technical IT education that bridges the gap between digital theory and hands-on professional mastery.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-zinc-800 text-blue-400 border border-zinc-700 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight">Our Vision</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              To build a modernized tech ecosystem in Kumba where every citizen can confidently repair, operate, and build digital software infrastructure.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-zinc-800 text-blue-400 border border-zinc-700 rounded-xl flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight">Our Core Values</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Uncompromising focus on laboratory-based assignments, digital trust, student discipline, continuous diagnostics, and career integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Departments & Courses Section */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 font-mono">Academic Catalog</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mt-1">Our Professional Courses</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
            Choose a department below. Every curriculum includes dedicated computer lab seats and professional instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                    {course.durationMonths} Months Program
                  </span>
                  <span className="text-sm font-black text-zinc-100 font-mono">
                    {course.feesCFAF.toLocaleString()} CFAF
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 mt-3 tracking-tight">
                  {course.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Core Subjects Covered:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.subjects.slice(0, 3).map((sub, i) => (
                      <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg border border-zinc-700">
                        {sub}
                      </span>
                    ))}
                    {course.subjects.length > 3 && (
                      <span className="text-[9px] text-zinc-500 px-1 py-0.5 font-medium">+{course.subjects.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-[11px] text-zinc-400 font-mono border-t border-zinc-800/50 pt-3">
                  <p><strong className="text-zinc-300 font-bold">Schedule:</strong> {course.schedule}</p>
                  <p><strong className="text-zinc-300 font-bold">Lead Instructor:</strong> {course.instructor}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => onNavigate("admissions", { courseId: course.id })}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                >
                  <span>Apply for this Course</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Showcase */}
      <section className="bg-zinc-900/30 rounded-2xl p-8 border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 font-mono">Campus Services</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Digital Documentation & Repairs Workshop</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Beyond education, we provide Kumba&apos;s community with elite professional services. From heavy-duty photocopying, ATS CV building, lamination, and custom digital student ID printing, to systematic motherboard microsoldering and electronic hardware repairs.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Diagnostic Quotations and repairs tracked live online.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Full documentation typing and digital PDF exports.</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onNavigate("repairs")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Laptop Repairs
            </button>
            <button
              onClick={() => onNavigate("docs")}
              className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 font-medium text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              Documentation Shop
            </button>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80"
            alt="Hardware workshop laboratory"
            className="rounded-xl shadow-lg border border-zinc-800 object-cover h-64 w-full"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-6">
        <div className="text-center">
          <HelpCircle className="h-8 w-8 text-blue-400 mx-auto" />
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-2">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Got queries? Find instant answers about admissions, fees, and location policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {faqList.map((faq, i) => (
            <div key={i} className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800">
              <h4 className="font-bold text-xs text-zinc-200 flex items-start gap-1.5">
                <span className="text-blue-400 font-mono">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-2 pl-3.5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* School Contact Card & Location */}
      <section className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[9px] font-mono tracking-widest text-blue-400 uppercase">Contact Us Today</span>
          <h3 className="text-xl font-bold tracking-tight">Visit Kumba&apos;s Leading Technical Computer Labs</h3>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            We are always open to discuss custom corporate trainings, student enrollments, hardware repair quotes, and cyber services.
          </p>

          <div className="space-y-2.5 pt-2 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Confidence Street Junction, Fiango, Kumba, Cameroon</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-400 shrink-0" />
              <span>+237 677 83 64 22</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs text-zinc-200">Live Campus Hours</h4>
          <div className="space-y-1.5 text-xs font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Morning Shift:</span>
              <span className="text-blue-400">8:00 AM – 12:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Afternoon Shift:</span>
              <span className="text-blue-400">1:00 PM – 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Evening Shift:</span>
              <span className="text-blue-400">5:00 PM – 8:00 PM</span>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Admissions Desk</span>
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 px-2 py-0.5 rounded font-mono">OPEN</span>
          </div>
        </div>
      </section>
    </div>
  );
}
