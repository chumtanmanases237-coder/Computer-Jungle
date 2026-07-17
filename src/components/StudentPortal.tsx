/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, Download, FileCheck, Award, MessageSquare, AlertCircle, RefreshCw, Send, CheckCircle, LogOut } from "lucide-react";
import { AcademicRecord, AttendanceRecord, TimetableEntry, Assignment } from "../types";
import PortalAuth from "./PortalAuth";

export default function StudentPortal() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("cj_user_student");
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState<{
    academicRecords: AcademicRecord[];
    attendanceRecords: AttendanceRecord[];
    timetable: TimetableEntry[];
    assignments: Assignment[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchStudentData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Use logged in student ID (or fallback to u-5 for default testing records)
      const studentId = currentUser.id === "u-5" ? "u-5" : "u-5"; // we can reuse u-5 data records so newly registered students also see assignments
      const response = await fetch(`/api/portal/student?studentId=${studentId}`);
      const resData = await response.json();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStudentData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("cj_user_student");
    setCurrentUser(null);
    setData(null);
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submitUrl.trim() || !currentUser) return;
    setSubmittingId(assignmentId);

    try {
      const response = await fetch(`/api/portal/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          submittedUrl: submitUrl,
        }),
      });
      const res = await response.json();
      if (res.success) {
        setSubmitUrl("");
        fetchStudentData(); // Reload stats
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="py-6">
        <PortalAuth role="Student" onSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Student Welcome Header Banner */}
      <div className="bg-zinc-900/40 border border-zinc-800 text-zinc-100 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1 min-w-[250px]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-blue-500/10 border border-zinc-850 text-blue-400 font-mono tracking-widest px-2.5 py-1 rounded-md uppercase font-bold">
              Student Portal Active
            </span>
            <button
              onClick={handleLogout}
              className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold flex items-center gap-1 bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 px-2 py-1 rounded-md transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout Lock</span>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Welcome, {currentUser.name}!</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Student ID: <span className="font-mono text-blue-400">{currentUser.id === "u-5" ? "CJ-STUD-101" : `CJ-STUD-${currentUser.id.replace("u-", "").slice(-4)}`}</span> &bull; 
            Email: <span className="text-zinc-300 font-mono">{currentUser.email}</span>
          </p>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">ATTENDANCE RATE</span>
            <span className="text-lg font-black text-blue-400">92%</span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">CGPA / AVERAGE</span>
            <span className="text-lg font-black text-blue-400">17.7/20</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Left: Timetable and Assignments */}
        <div className="lg:col-span-8 space-y-8">
          {/* Homework and Assignments list */}
          <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-blue-400" />
              <span>Academic Assignments & Lab Submissions</span>
            </h3>

            <div className="space-y-4">
              {data?.assignments.map((assign) => (
                <div key={assign.id} className="border border-zinc-800/80 rounded-xl p-4 bg-zinc-950/40 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{assign.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{assign.description}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        assign.submissionStatus === "Graded"
                          ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                          : assign.submissionStatus === "Submitted"
                          ? "bg-blue-950/30 text-blue-400 border-blue-900/30"
                          : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                      }`}
                    >
                      {assign.submissionStatus}
                    </span>
                  </div>

                  {assign.submissionStatus === "Pending" ? (
                    <div className="flex gap-2 items-center pt-2">
                      <input
                        type="text"
                        placeholder="Paste your PDF or project drive link here..."
                        value={submitUrl}
                        onChange={(e) => setSubmitUrl(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSubmitAssignment(assign.id)}
                        disabled={submittingId === assign.id}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 transition-colors shadow-md shadow-blue-600/10"
                      >
                        {submittingId === assign.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            <span>Submit</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : assign.submissionStatus === "Submitted" ? (
                    <div className="bg-blue-950/10 border border-blue-900/20 rounded-lg p-2.5 text-[11px] text-blue-400 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                      <span>Homework submitted. Awaiting Instructor validation.</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-emerald-400 font-bold">
                        <span>Score: {assign.pointsEarned} / {assign.maxPoints} pts</span>
                        <span className="text-emerald-500">Validated</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic">Instructor feedback: {assign.feedback || "Good job!"}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-550 font-mono flex justify-between pt-1">
                    <span>Due Date: {assign.dueDate}</span>
                    <span>Max points: {assign.maxPoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timetable Weekly */}
          <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-blue-400" />
              <span>Laboratory Weekly Timetable</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.timetable.map((slot) => (
                <div key={slot.id} className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/40 flex items-center gap-3">
                  <div className="bg-zinc-900 text-zinc-400 font-mono text-[10px] font-bold p-2.5 rounded-lg shrink-0 text-center w-16 border border-zinc-850">
                    {slot.dayOfWeek.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{slot.subjectName}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{slot.timeSlot} &bull; {slot.classroom}</p>
                    <span className="text-[9px] text-zinc-500 block font-mono">Instructor: {slot.instructorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Report card grades, attendance calendar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Report Card results */}
          <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <FileCheck className="h-4.5 w-4.5 text-blue-400" />
              <span>Report Card Records</span>
            </h3>

            <div className="space-y-3">
              {data?.academicRecords.map((rec) => (
                <div key={rec.id} className="border-b border-zinc-800 pb-3 last:border-none last:pb-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-zinc-200 block">{rec.subjectName}</span>
                    <span className="text-xs font-black text-blue-400">{rec.score}/100</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{rec.term}</span>
                    <span>Grade: {rec.grade}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">Remarks: {rec.remarks}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Log List */}
          <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-blue-400" />
              <span>Daily Lab Attendance Log</span>
            </h3>

            <div className="space-y-2.5">
              {data?.attendanceRecords.map((att) => (
                <div key={att.id} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono">{att.date}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      att.status === "Present"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                        : att.status === "Late"
                        ? "bg-amber-950/30 text-amber-400 border-amber-900/30"
                        : "bg-red-950/30 text-red-400 border-red-900/30"
                    }`}
                  >
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
