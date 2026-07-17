/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, ShieldCheck, Printer, Calendar, Award, User, RefreshCw, AlertTriangle } from "lucide-react";
import { Certificate } from "../types";

export default function CertificateVerification() {
  const [certId, setCertId] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError("");
    setCertificate(null);

    try {
      const response = await fetch(`/api/certificates/verify/${certId.trim()}`);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.certificate);
      } else {
        setError(data.message || "Certificate verification failed. Check the ID.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to school registry. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadMock = (id: string) => {
    setCertId(id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-950 rounded-2xl shadow-sm border border-zinc-800">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Certificate Verification Registry</h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-lg mx-auto">
          Verify digital credentials issued by Computer Jungle Training Center Kumba. Enter your unique certification ID below.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex gap-2 max-w-lg mx-auto mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="e.g. CERT-CJ-2026-8801"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/10"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify Code"}
        </button>
      </form>

      {/* Suggested Quick Codes */}
      <div className="flex justify-center items-center gap-3 mb-8">
        <span className="text-[11px] text-zinc-500 font-medium">Quick Demo IDs:</span>
        <button
          onClick={() => loadMock("CERT-CJ-2026-8801")}
          className="text-[10px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 rounded-lg font-mono border border-zinc-800 cursor-pointer transition-colors"
        >
          CERT-CJ-2026-8801 (Hardware)
        </button>
        <button
          onClick={() => loadMock("CERT-CJ-2026-8802")}
          className="text-[10px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 rounded-lg font-mono border border-zinc-800 cursor-pointer transition-colors"
        >
          CERT-CJ-2026-8802 (Data Proc)
        </button>
      </div>

      {error && (
        <div className="max-w-lg mx-auto bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs mb-6">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <span className="font-bold">Registry Verification Error</span>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {certificate && (
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6 mt-6 shadow-sm">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-4">
            <ShieldCheck className="h-5 w-5 text-blue-400 animate-pulse" />
            <span>CREDENTIAL VERIFIED SECURE</span>
          </div>

          {/* Certificate design */}
          <div className="bg-zinc-950 border-4 border-double border-amber-500/20 p-8 rounded-xl bg-gradient-to-tr from-zinc-950 to-zinc-900 relative shadow-inner overflow-hidden print:border-amber-600">
            {/* Watermark/Background Shield overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <Award className="h-80 w-80 text-amber-500" />
            </div>

            <div className="text-center">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-500/60 font-mono">
                Computer Jungle Training Center
              </span>
              <h1 className="text-xl font-serif font-black text-zinc-100 mt-1">
                OFFICIAL CERTIFICATE OF COMPLETION
              </h1>
              <p className="text-[11px] font-mono text-zinc-400 mt-2">
                Confidence Street Junction, Fiango, Kumba, Cameroon
              </p>

              <div className="my-6 border-b border-dashed border-amber-500/20 max-w-sm mx-auto" />

              <p className="text-xs italic text-zinc-500">This certifies that</p>
              <h3 className="text-lg font-bold text-zinc-100 font-serif mt-1 border-b border-zinc-800 max-w-md mx-auto pb-1">
                {certificate.studentName}
              </h3>

              <p className="text-xs text-zinc-400 mt-3">
                has successfully completed the prescribed curriculum and passed all exams for:
              </p>
              <h4 className="text-sm font-extrabold text-amber-400 mt-1">
                {certificate.courseTitle}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">({certificate.departmentName})</p>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                <span className="text-xs bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 font-bold px-2.5 py-1 rounded-lg">
                  Grade: {certificate.grade}
                </span>
              </div>

              {/* Grid with dates, register number & signatures */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-dashed border-amber-500/20 text-[10px]">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    <span>Issue Date:</span>
                  </div>
                  <p className="font-semibold font-mono text-zinc-200">{certificate.issueDate}</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-zinc-500">
                    <User className="h-3 w-3" />
                    <span>Student ID:</span>
                  </div>
                  <p className="font-semibold font-mono text-zinc-200">{certificate.studentId}</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-zinc-500">Reg No:</div>
                  <p className="font-semibold font-mono text-zinc-200">{certificate.regNumber}</p>
                </div>
              </div>

              {/* Verification barcode seal footer */}
              <div className="mt-8 pt-4 flex justify-between items-end border-t border-zinc-800">
                <div className="text-left">
                  <div className="h-8 w-32 border-l border-r border-zinc-800 flex items-center justify-between px-2 text-[6px] font-mono bg-zinc-900 text-zinc-400 select-none">
                    ||||| ||| |||| || ||||| ||||| |||| ||
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 block mt-1">Registry Ref: {certificate.id}</span>
                </div>

                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800 shadow-sm flex items-center gap-2">
                  <div className="bg-blue-600 h-8 w-8 rounded text-white font-mono flex items-center justify-center text-[8px] font-black">
                    QR
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] font-bold block text-blue-400">SECURE QR CODE</span>
                    <span className="text-[6px] text-zinc-500 block font-mono">Scan to Verify Registry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-800"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
