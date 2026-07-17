/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Course, Department } from "../types";
import { Sparkles, CheckCircle, Search, Clipboard, AlertCircle, FileText, Download, User, RefreshCw } from "lucide-react";

interface AdmissionFormProps {
  courses: Course[];
  departments: Department[];
  prefilledCourseId?: string;
}

export default function AdmissionForm({ courses, departments, prefilledCourseId }: AdmissionFormProps) {
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("2005-01-01");
  const [nationalID, setNationalID] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(prefilledCourseId || courses[0]?.id || "");
  const [shift, setShift] = useState<"Morning Shift" | "Afternoon Shift" | "Evening Shift">("Morning Shift");
  const [paymentMethod, setPaymentMethod] = useState<"MTN Mobile Money" | "Orange Money" | "Stripe" | "Bank Transfer" | "Cash">("MTN Mobile Money");
  const [passportBase64, setPassportBase64] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Screenshot Proof of Transfer States
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [isDraggingScreenshot, setIsDraggingScreenshot] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  // Statuses
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Tracking State
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const downpayment = selectedCourse ? (selectedCourse.feesCFAF < 50000 ? selectedCourse.feesCFAF : 50000) : 50000;
  const remaining = selectedCourse ? selectedCourse.feesCFAF - downpayment : 0;

  // File drop handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingScreenshot(true);
  };

  const handleScreenshotDragLeave = () => {
    setIsDraggingScreenshot(false);
  };

  const handleScreenshotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingScreenshot(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deptId = selectedCourse ? selectedCourse.departmentId : "dept-dp";
      const payload = {
        fullName,
        email,
        phone,
        birthDate,
        nationalID,
        departmentId: deptId,
        courseId: selectedCourseId,
        shift,
        paymentMethod,
        passportUrl: passportBase64,
        screenshotUrl: screenshotBase64,
        paymentReference: transactionRef,
      };

      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setSubmittedApp(data.application);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const response = await fetch("/api/admissions");
      const list = await response.json();
      const match = list.find((a: any) => a.id.toUpperCase() === trackId.trim().toUpperCase());

      if (match) {
        setTrackResult(match);
      } else {
        setTrackError("No application found with this reference ID.");
      }
    } catch (err) {
      setTrackError("Error contacting database registry.");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-zinc-950 rounded-2xl shadow-sm border border-zinc-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Admission Wizard */}
        <div className="lg:col-span-7">
          {submittedApp ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
              <div className="bg-blue-600 h-12 w-12 rounded-full text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-zinc-100">Application Submitted! 🎉</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                Thank you, <strong>{fullName}</strong>. Your online admission application has been registered successfully. Our registrar is reviewing your details and payment.
              </p>

              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 inline-block font-mono text-center">
                <span className="text-[10px] text-zinc-500 block uppercase">Tracking ID Reference</span>
                <span className="text-sm font-bold text-blue-400 tracking-widest">{submittedApp.id}</span>
              </div>

              <div className="text-xs text-zinc-500 pt-3">
                Use the Tracking Form on the right with this reference ID to download your official Admission Letter once approved.
              </div>
              
              <button
                onClick={() => setSubmittedApp(null)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/10"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-zinc-100">CJTC Online Admission Application</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Please provide accurate educational details and submit passport photos below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mary Etonde"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-zinc-900 placeholder-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mary@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-zinc-900 placeholder-zinc-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Telephone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +237 677 83 64 22"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-zinc-900 placeholder-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">National ID / Birth Cert No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 119827110"
                      value={nationalID}
                      onChange={(e) => setNationalID(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-zinc-900 placeholder-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Choose Course / Specialization</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-100">
                          {c.title} ({c.durationMonths} months)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Preferred Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      <option className="bg-zinc-950 text-zinc-100">Morning Shift</option>
                      <option className="bg-zinc-950 text-zinc-100">Afternoon Shift</option>
                      <option className="bg-zinc-950 text-zinc-100">Evening Shift</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      <option className="bg-zinc-950 text-zinc-100">MTN Mobile Money</option>
                      <option className="bg-zinc-950 text-zinc-100">Orange Money</option>
                      <option className="bg-zinc-950 text-zinc-100">Stripe</option>
                      <option className="bg-zinc-950 text-zinc-100">Bank Transfer</option>
                      <option className="bg-zinc-950 text-zinc-100">Cash</option>
                    </select>
                  </div>
                </div>

                {/* Usability Drag-and-drop Image Uploader */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Passport Size Photo (Image)</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative cursor-pointer ${
                      isDragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {passportBase64 ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={passportBase64} alt="Passport preview" className="h-12 w-12 rounded-lg object-cover border border-zinc-800" />
                        <div className="text-left">
                          <span className="text-xs text-blue-400 font-bold block">Passport photo attached!</span>
                          <span className="text-[10px] text-zinc-500">Drag another or click to change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <User className="h-8 w-8 text-zinc-500 mx-auto" />
                        <p className="text-xs text-zinc-300 font-semibold">Drag & drop your passport image or click to choose</p>
                        <p className="text-[10px] text-zinc-500">PNG, JPG formats (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display billing summary */}
                {selectedCourse && (
                  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Financial Summary (Downpayment Required)</span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Course downpayment (DP) required:</span>
                      <span className="font-bold text-zinc-200">{downpayment.toLocaleString()} CFAF</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Remaining course tuition:</span>
                      <span className="font-mono text-zinc-400">{remaining.toLocaleString()} CFAF</span>
                    </div>
                    <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-100">Total Course Fee:</span>
                      <span className="font-mono font-black text-blue-400">{selectedCourse.feesCFAF.toLocaleString()} CFAF</span>
                    </div>
                  </div>
                )}

                {/* Interactive payment instruction sheet */}
                {selectedCourse && (paymentMethod === "MTN Mobile Money" || paymentMethod === "Orange Money" || paymentMethod === "Bank Transfer") && (
                  <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 space-y-3.5 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Real Payment Instructions</span>
                    </div>
                    <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                      {paymentMethod === "MTN Mobile Money" && (
                        <div>
                          Please transfer <strong className="text-zinc-100 font-mono">{downpayment.toLocaleString()} CFAF</strong> directly to our MTN Mobile Money account:
                          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80 my-1 font-mono text-xs">
                            📞 MTN MoMo: <strong className="text-blue-400 text-sm">677 83 64 22</strong>
                            <br />
                            Account Holder: <strong className="text-zinc-100 font-sans">Mr. Azemoh Edmond</strong>
                          </div>
                          <span className="text-[10px] text-zinc-400">After transferring, please enter the transaction reference number and upload the confirmation screenshot below.</span>
                        </div>
                      )}
                      {paymentMethod === "Orange Money" && (
                        <div>
                          Please transfer <strong className="text-zinc-100 font-mono">{downpayment.toLocaleString()} CFAF</strong> directly to our Orange Money account:
                          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80 my-1 font-mono text-xs">
                            📞 Orange Money: <strong className="text-amber-400 text-sm">699 12 34 56</strong>
                            <br />
                            Account Holder: <strong className="text-zinc-100 font-sans">Mr. Azemoh Edmond</strong>
                          </div>
                          <span className="text-[10px] text-zinc-400">After transferring, please enter the transaction reference number and upload the confirmation screenshot below.</span>
                        </div>
                      )}
                      {paymentMethod === "Bank Transfer" && (
                        <div>
                          Please wire <strong className="text-zinc-100 font-mono">{downpayment.toLocaleString()} CFAF</strong> to our corporate bank account:
                          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80 my-1 font-mono text-xs space-y-0.5">
                            🏦 Bank: <strong className="text-zinc-100 font-sans">Afriland First Bank (Kumba Branch)</strong>
                            <br />
                            Account Number: <strong className="text-blue-400 text-sm">01004928102-39</strong>
                            <br />
                            Account Name: <strong className="text-zinc-100 font-sans">Computer Jungle S.A.</strong>
                          </div>
                          <span className="text-[10px] text-zinc-400">Please enter your transfer reference number and upload your transaction receipt/screenshot below.</span>
                        </div>
                      )}
                    </div>

                    {/* Transaction ID input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase">Transaction ID / Reference Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TXN-1928374 or MoMo reference ID"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full text-xs px-3.5 py-2 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-zinc-700 font-mono"
                      />
                    </div>

                    {/* Screenshot Proof Drag-and-drop Image Uploader */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase">Screenshot of Transfer Proof</label>
                      <div
                        onDragOver={handleScreenshotDragOver}
                        onDragLeave={handleScreenshotDragLeave}
                        onDrop={handleScreenshotDrop}
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors relative cursor-pointer ${
                          isDraggingScreenshot ? "border-blue-500 bg-blue-500/10" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          required={!screenshotBase64}
                          onChange={handleScreenshotChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {screenshotBase64 ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={screenshotBase64} alt="Screenshot preview" className="h-10 w-10 rounded object-cover border border-zinc-800" />
                            <div className="text-left">
                              <span className="text-xs text-emerald-400 font-bold block">Screenshot Attached!</span>
                              <span className="text-[10px] text-zinc-500">Drag another or click to change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs text-zinc-300 font-semibold">Drag & drop receipt/screenshot or click to select</p>
                            <p className="text-[10px] text-zinc-500">PNG, JPG format of confirmation screen</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Application & Pay"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Tracking Admissions Letter */}
        <div className="lg:col-span-5 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-start">
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-blue-400" />
                <span>Track Application / Get Letter</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enter your submitted ADM Code to retrieve review status or download your official admission letter.
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ADM-CJ-8192"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-zinc-600"
              />
              <button
                type="submit"
                disabled={trackLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors shadow-md shadow-blue-600/10"
              >
                {trackLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Track"}
              </button>
            </form>

            {/* Quick Helper */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">Demo Reference ID:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackId("ADM-CJ-MOCK");
                  setTrackResult({
                    id: "ADM-CJ-MOCK",
                    fullName: "Achuo Divine Neba",
                    email: "achuo.divine@gmail.com",
                    status: "Approved",
                    courseId: "Computer Hardware Engineering & Applied Systems",
                    shift: "Evening Shift",
                    assignedStudentId: "CJ-STUD-101",
                    assignedRegNumber: "REG/CJ/2025/042",
                    assignedClassroom: "Hardware Lab 2",
                    assignedInstructor: "Engr. Paul Ayuk",
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 hover:text-zinc-200 cursor-pointer text-zinc-400 font-mono"
              >
                ADM-CJ-MOCK
              </button>
            </div>

            {trackError && (
              <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p>{trackError}</p>
              </div>
            )}

            {trackResult && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">STATUS UPDATE</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      trackResult.status === "Approved"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30"
                        : trackResult.status === "Rejected"
                        ? "bg-red-950/40 text-red-400 border border-red-900/30"
                        : "bg-amber-950/40 text-amber-400 border border-amber-800/30"
                    }`}
                  >
                    {trackResult.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <p><strong className="text-zinc-500">Applicant:</strong> {trackResult.fullName}</p>
                  <p><strong className="text-zinc-500">Applied Program:</strong> {trackResult.courseId}</p>
                  <p><strong className="text-zinc-500">Shift Requested:</strong> {trackResult.shift}</p>
                </div>

                {trackResult.status === "Approved" ? (
                  <div className="space-y-3.5 border-t border-dashed border-zinc-800 pt-3">
                    <div className="bg-zinc-950 p-3 rounded-lg text-[11px] text-zinc-300 font-mono space-y-1 border border-zinc-800">
                      <p><strong className="text-zinc-500">Student ID:</strong> {trackResult.assignedStudentId}</p>
                      <p><strong className="text-zinc-500">Reg Number:</strong> {trackResult.assignedRegNumber}</p>
                      <p><strong className="text-zinc-500">Classroom:</strong> {trackResult.assignedClassroom}</p>
                      <p><strong className="text-zinc-500">Instructor:</strong> {trackResult.assignedInstructor}</p>
                    </div>

                    <a
                      href={`/api/admissions/${trackResult.id}/letter`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center block transition-colors shadow-md shadow-blue-600/10"
                    >
                      Download Official Admission Letter
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-950/20 text-amber-400 border border-amber-900/30 p-3 rounded-lg text-[11px]">
                    <strong>Pending Review:</strong> Your payment reference and qualifications are currently being validated by our Registrar. Please check back in 24 hours.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
