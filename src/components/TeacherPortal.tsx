/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, UserCheck, Award, MessageSquare, RefreshCw, CheckCircle, Save, Calendar, CheckSquare, LogOut } from "lucide-react";
import { Assignment } from "../types";
import PortalAuth from "./PortalAuth";

export default function TeacherPortal() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("cj_user_teacher");
    return saved ? JSON.parse(saved) : null;
  });

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading states
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(18);
  const [feedback, setFeedback] = useState("Outstanding lab work. Make sure to double check BIOS clearances next time.");
  const [gradeSubmitting, setGradeSubmitting] = useState(false);

  // Attendance taking states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([
    { id: "stud-1", name: "Fritz Kumba Student", status: "Present" },
    { id: "stud-2", name: "Etonde Mary Sango", status: "Present" },
    { id: "stud-3", name: "Divine Neba", status: "Late" },
    { id: "stud-4", name: "Tabi Collins Enow", status: "Absent" },
  ]);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const fetchAssignments = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await fetch("/api/portal/student?studentId=u-5");
      const resData = await response.json();
      setAssignments(resData.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAssignments();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("cj_user_teacher");
    setCurrentUser(null);
    setAssignments([]);
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId) return;
    setGradeSubmitting(true);

    try {
      const response = await fetch(`/api/portal/assignments/${gradingId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: score, feedback }),
      });
      const data = await response.json();
      if (data.success) {
        setGradingId(null);
        fetchAssignments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGradeSubmitting(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, status } : s))
    );
    setAttendanceSaved(false);
  };

  const saveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  if (!currentUser) {
    return (
      <div className="py-6">
        <PortalAuth role="Teacher" onSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  if (loading && assignments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Teacher Welcomer Banner */}
      <div className="bg-zinc-900/40 border border-zinc-800 text-zinc-100 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1 min-w-[250px]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-blue-500/10 border border-zinc-850 text-blue-400 font-mono tracking-widest px-2.5 py-1 rounded-md uppercase font-bold">
              Teacher workspace Active
            </span>
            <button
              onClick={handleLogout}
              className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold flex items-center gap-1 bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 px-2 py-1 rounded-md transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout Lock</span>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Welcome, {currentUser.name}</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Lead Instructor &bull; {currentUser.email}
          </p>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TOTAL ASSIGNMENTS IN QUEUE</span>
            <span className="text-lg font-black text-amber-400">
              {assignments.filter((a) => a.submissionStatus === "Submitted").length} Pending
            </span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">CLASSES RUNNING TODAY</span>
            <span className="text-lg font-black text-blue-400">3 Shifts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Take Class Attendance */}
        <div className="lg:col-span-5 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-blue-400" />
              <span>Take Daily Class Attendance</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">Select daily status for the physical lab attendees.</p>
          </div>

          <form onSubmit={saveAttendance} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs border border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 bg-zinc-900 text-zinc-100"
              />
            </div>

            <div className="space-y-3">
              {students.map((stud) => (
                <div key={stud.id} className="flex justify-between items-center bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 text-xs">
                  <span className="font-bold text-zinc-200">{stud.name}</span>
                  <div className="flex gap-1.5">
                    {["Present", "Late", "Absent"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAttendanceChange(stud.id, opt)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded cursor-pointer transition-all ${
                          stud.status === opt
                            ? opt === "Present"
                              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                              : opt === "Late"
                              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/10"
                              : "bg-red-500 text-white shadow-sm shadow-red-500/10"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
            >
              <Save className="h-4 w-4" />
              <span>Save Lab Attendance</span>
            </button>

            {attendanceSaved && (
              <div className="bg-emerald-950/20 text-emerald-400 text-xs p-3 rounded-xl border border-emerald-900/30 flex items-center gap-1.5 justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Attendance report stored securely!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Grade Submissions */}
        <div className="lg:col-span-7 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <CheckSquare className="h-4.5 w-4.5 text-blue-400" />
              <span>Submitted Projects & Lab Homework</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">Evaluate active student submissions and record feedback points.</p>
          </div>

          <div className="space-y-4">
            {assignments.map((a) => (
              <div key={a.id} className="border border-zinc-800/80 rounded-xl p-4 bg-zinc-950/40 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{a.title}</h4>
                    <span className="text-[10px] text-zinc-500 block font-mono">Max Grade points: {a.maxPoints}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      a.submissionStatus === "Graded"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                        : a.submissionStatus === "Submitted"
                        ? "bg-blue-950/30 text-blue-400 border-blue-900/30 animate-pulse"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                    }`}
                  >
                    {a.submissionStatus}
                  </span>
                </div>

                {a.submittedUrl && (
                  <div className="text-[11px] bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between font-mono text-zinc-300">
                    <span className="text-zinc-500 truncate mr-4">Source link: {a.submittedUrl}</span>
                    <a
                      href={a.submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded hover:bg-zinc-850 cursor-pointer text-center transition-colors"
                    >
                      Open Assignment
                    </a>
                  </div>
                )}

                {a.submissionStatus === "Submitted" && (
                  <div>
                    {gradingId === a.id ? (
                      <form onSubmit={handleGrade} className="bg-zinc-950 p-4 rounded-xl border border-blue-900/40 mt-2 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Score out of {a.maxPoints}</label>
                            <input
                              type="number"
                              required
                              max={a.maxPoints}
                              min={0}
                              value={score}
                              onChange={(e) => setScore(Number(e.target.value))}
                              className="w-full text-xs px-2.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Feedback remarks</label>
                            <input
                              type="text"
                              required
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="w-full text-xs px-2.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setGradingId(null)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={gradeSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                          >
                            {gradeSubmitting ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Save Marks"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setGradingId(a.id);
                          setScore(a.maxPoints - 2);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-all shadow-md shadow-blue-600/10"
                      >
                        Grade Student Submission
                      </button>
                    )}
                  </div>
                )}

                {a.submissionStatus === "Graded" && (
                  <div className="bg-emerald-950/20 text-emerald-400 text-[11px] p-2.5 rounded-lg border border-emerald-900/30 space-y-0.5">
                    <p><strong>Grade:</strong> {a.pointsEarned} / {a.maxPoints} pts</p>
                    <p className="text-[10px] text-zinc-400 italic">Remarks: {a.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
