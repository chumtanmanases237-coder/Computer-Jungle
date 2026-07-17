/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wrench, Search, ShieldAlert, CheckCircle2, FileText, AlertCircle, RefreshCw, Smartphone, Laptop, Printer, HelpCircle } from "lucide-react";

export default function RepairsView() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deviceType, setDeviceType] = useState<"Laptop" | "Desktop" | "Printer" | "Network Device" | "UPS" | "Other">("Laptop");
  const [deviceName, setDeviceName] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [deviceImgBase64, setDeviceImgBase64] = useState("");

  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Tracking repair states
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        deviceType,
        deviceName,
        issueDescription,
        imageUrl: deviceImgBase64,
      };

      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setSubmittedTicket(data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeviceImgBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const response = await fetch("/api/repairs");
      const list = await response.json();
      const match = list.find((t: any) => t.id.toUpperCase() === trackId.trim().toUpperCase());

      if (match) {
        setTrackResult(match);
      } else {
        setTrackError("Repair ticket reference not registered in our workshop archives.");
      }
    } catch (err) {
      setTrackError("Connection to workshop server failed.");
    } finally {
      setTrackLoading(false);
    }
  };

  // Progress Stepper indicators
  const stepList = ["Booked", "Diagnosing", "Quoted", "Repairing", "Completed"];
  const getStepIndex = (status: string) => {
    const idx = stepList.indexOf(status);
    return idx !== -1 ? idx : 1;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-zinc-950 rounded-2xl shadow-sm border border-zinc-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Book Repairs Panel */}
        <div className="lg:col-span-7 space-y-6">
          {submittedTicket ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
              <div className="bg-blue-600 h-12 w-12 rounded-full text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-zinc-100 font-sans">Repair Ticket Registered!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Excellent. Your device is now logged into Kumba&apos;s primary systematic repair workstation. Deliver the physical device to <strong>Confidence Street Junction, Fiango, Kumba</strong>.
              </p>

              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 inline-block font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">REPAIR REFERENCE CODE</span>
                <span className="text-sm font-bold text-blue-400 tracking-wider">{submittedTicket.id}</span>
              </div>

              <p className="text-xs text-zinc-500">
                Provide this ticket reference ID to the technician desk upon arrival. Monitor repair diagnostics using the tracking portal.
              </p>

              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-6 rounded-xl cursor-pointer transition-colors"
              >
                Book Another Device Repair
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-400 animate-pulse" />
                  <span>Systematic Computer & Printer Repairs</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Get certified diagnostics, transparent component pricing, and expert hardware soldering.
                </p>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Sango"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sango@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +237 671 23 45 67"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Device Category</label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value as any)}
                      className="w-full text-xs px-2 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none"
                    >
                      <option className="bg-zinc-950 text-zinc-100">Laptop</option>
                      <option className="bg-zinc-950 text-zinc-100">Desktop</option>
                      <option className="bg-zinc-950 text-zinc-100">Printer</option>
                      <option className="bg-zinc-950 text-zinc-100">Network Device</option>
                      <option className="bg-zinc-950 text-zinc-100">UPS</option>
                      <option className="bg-zinc-950 text-zinc-100">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Device Make & Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HP Pavilion x360"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Image / Issue Proof</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs file:bg-zinc-900 file:hover:bg-zinc-800 file:border file:border-zinc-800 file:text-zinc-300 file:text-[10px] file:font-bold file:px-3 file:py-2 file:rounded-lg file:cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Fault / Issue Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe exactly what happened. (e.g. laptop got water spilled, blue screen of death loop, broken charging socket...)"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-zinc-600"
                  />
                </div>

                <div className="bg-amber-950/20 rounded-xl p-3 text-[11px] text-amber-400 flex items-start gap-2 border border-amber-900/30">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Estimated Diagnostic Policy:</strong> Initial systematic diagnostic evaluation is entirely <strong>FREE</strong> if the client completes repair at Computer Jungle. Refusing repairs results in a standard 2,000 CFAF checkup fee.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Register Device for Repairs"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Real-time Tracking Stepper side panel */}
        <div className="lg:col-span-5 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-start">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-blue-400" />
                <span>Track Active Repair State</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enter your submitted REP Repair ticket ID below to monitor diagnostic updates in real-time.
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. REP-1001"
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
              <span className="text-[10px] text-zinc-500">Quick Demo Code:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackId("REP-1001");
                  setTrackResult({
                    id: "REP-1001",
                    customerName: "Chief Sango of Fiango",
                    deviceName: "HP Pavilion x360",
                    deviceType: "Laptop",
                    issueDescription: "No power entirely after water spill on keyboard.",
                    status: "Diagnosing",
                    assignedTechnician: "Engr. Paul Ayuk",
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 hover:text-zinc-200 cursor-pointer text-zinc-400 font-mono"
              >
                REP-1001 (Diagnosing)
              </button>
            </div>

            {trackError && (
              <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p>{trackError}</p>
              </div>
            )}

            {trackResult && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">TICKET REF: {trackResult.id}</span>
                  <span className="text-[10px] font-black text-blue-400 font-mono uppercase bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded">
                    {trackResult.status}
                  </span>
                </div>

                {/* Progress Stepper UI */}
                <div className="space-y-4 relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-800" />

                  {stepList.map((step, i) => {
                    const currentStepIdx = getStepIndex(trackResult.status);
                    const isCompleted = i <= currentStepIdx;
                    return (
                      <div key={step} className="flex items-start gap-3 relative z-10">
                        <div
                          className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-[10px] border transition-colors ${
                            isCompleted
                              ? "bg-blue-600 border-blue-600 text-white animate-pulse"
                              : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="text-left">
                          <span
                            className={`text-xs font-bold block ${
                              isCompleted ? "text-zinc-200" : "text-zinc-500 font-normal"
                            }`}
                          >
                            {step}
                          </span>
                          {step === trackResult.status && (
                            <span className="text-[9px] text-blue-400 font-mono block">Active Station</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono border-t border-zinc-800 pt-3">
                  <p><strong className="text-zinc-500">Device:</strong> {trackResult.deviceName} ({trackResult.deviceType})</p>
                  <p><strong className="text-zinc-500">Assigned Tech:</strong> {trackResult.assignedTechnician || "Lead Workshop Desk"}</p>
                  {trackResult.quotedPriceCFAF && (
                    <p className="text-blue-400 font-bold"><strong className="text-zinc-500">Repair Cost:</strong> {trackResult.quotedPriceCFAF.toLocaleString()} CFAF</p>
                  )}
                  {trackResult.technicianNotes && (
                    <p className="text-zinc-300 italic"><strong className="text-zinc-500">Notes:</strong> {trackResult.technicianNotes}</p>
                  )}
                </div>

                {trackResult.status === "Completed" && (
                  <div className="border-t border-dashed border-zinc-800 pt-3 space-y-2">
                    <div className="bg-blue-950/20 border border-blue-900/30 text-blue-400 p-2 rounded text-[11px] font-mono">
                      🎉 Your laptop is ready for pickup! Total charge: 15,000 CFAF.
                    </div>
                    <a
                      href={`/api/repairs/${trackResult.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs py-2 rounded-lg cursor-pointer text-center block"
                    >
                      Download Invoice Receipt
                    </a>
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
