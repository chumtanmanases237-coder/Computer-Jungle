/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { DollarSign, GraduationCap, Wrench, FileText, CheckCircle2, ShieldAlert, XCircle, RefreshCw, Layers, Sliders, Save, PlusCircle, LogOut } from "lucide-react";
import PortalAuth from "./PortalAuth";

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("cj_user_admin");
    return saved ? JSON.parse(saved) : null;
  });

  const [admissions, setAdmissions] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active review action states
  const [activeTab, setActiveTab] = useState<"Stats" | "Admissions" | "Repairs" | "Orders">("Stats");
  const [refreshing, setRefreshing] = useState(false);

  // State to edit repair ticket
  const [editingRepairId, setEditingRepairId] = useState<string | null>(null);
  const [repairStatus, setRepairStatus] = useState("Diagnosing");
  const [repairPrice, setRepairPrice] = useState(15000);
  const [repairNotes, setRepairNotes] = useState("Systematic capacitor replacement near charging IC.");

  // State to review admission application
  const [selectedReviewAdm, setSelectedReviewAdm] = useState<any | null>(null);
  const [reviewClassroom, setReviewClassroom] = useState("Laboratory Room 1");
  const [reviewInstructor, setReviewInstructor] = useState("Mr. Azemoh Edmond");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRegistryData = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      const [resAdm, resRep, resOrd] = await Promise.all([
        fetch("/api/admissions").then((r) => r.json()),
        fetch("/api/repairs").then((r) => r.json()),
        fetch("/api/documentation").then((r) => r.json()), // reuse orders / documentation
      ]);

      setAdmissions(resAdm || []);
      setRepairs(resRep || []);
      setOrders(resOrd || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadRegistryData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("cj_user_admin");
    setCurrentUser(null);
    setAdmissions([]);
    setRepairs([]);
    setOrders([]);
  };

  const handleReviewAdmission = async (id: string, status: "Approved" | "Rejected") => {
    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/admissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          feedback: reviewFeedback,
          assignedClassroom: reviewClassroom,
          assignedInstructor: reviewInstructor,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedReviewAdm(null);
        setReviewFeedback("");
        loadRegistryData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepairId) return;

    try {
      const response = await fetch(`/api/repairs/${editingRepairId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: repairStatus,
          quotedPriceCFAF: Number(repairPrice),
          technicianNotes: repairNotes,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEditingRepairId(null);
        loadRegistryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Static reports analytics charts
  const revenueData = [
    { name: "Jan", Tuition: 450000, Repairs: 120000, Documentation: 85000 },
    { name: "Feb", Tuition: 620000, Repairs: 180000, Documentation: 110000 },
    { name: "Mar", Tuition: 850000, Repairs: 250000, Documentation: 140000 },
    { name: "Apr", Tuition: 1100000, Repairs: 310000, Documentation: 210000 },
    { name: "May", Tuition: 950000, Repairs: 290000, Documentation: 195000 },
    { name: "Jun", Tuition: 1300000, Repairs: 450000, Documentation: 310000 },
  ];

  const totalTuition = admissions.length * 50000;
  const totalRepairs = repairs.reduce((acc, curr) => acc + (curr.quotedPriceCFAF || 5000), 0);
  const totalDocs = orders.reduce((acc, curr) => acc + (curr.calculatedPriceCFAF || 1000), 0);
  const grossRevenue = totalTuition + totalRepairs + totalDocs;

  if (!currentUser) {
    return (
      <div className="py-6">
        <PortalAuth role="Admin" onSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  if (loading && admissions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">CJTC Administrative Panel</h2>
            <button
              onClick={handleLogout}
              className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold flex items-center gap-1 bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 px-2.5 py-1 rounded-md transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout Lock</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active: <span className="text-zinc-200 font-mono font-bold">{currentUser.name} ({currentUser.role})</span> &bull; Manage student enrollments, repairs, and cash registers.
          </p>
        </div>

        <button
          onClick={loadRegistryData}
          disabled={refreshing}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-800"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Grid counters summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Gross Income</span>
            <DollarSign className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-zinc-200 font-mono">{(grossRevenue || 1250000).toLocaleString()} CFAF</p>
          <span className="text-[10px] text-blue-400 font-bold block mt-1">+14.2% from last month</span>
        </div>

        <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Active Student Registries</span>
            <GraduationCap className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-zinc-200 font-mono">{admissions.length} Students</p>
          <span className="text-[10px] text-blue-400 font-bold block mt-1">
            {admissions.filter((a) => a.status === "Approved").length} Active study seats
          </span>
        </div>

        <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Repairs Workshop Queue</span>
            <Wrench className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-zinc-200 font-mono">{repairs.length} Tickets</p>
          <span className="text-[10px] text-amber-400 font-bold block mt-1">
            {repairs.filter((r) => r.status !== "Completed").length} In active workshop lab
          </span>
        </div>

        <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Documentation Services</span>
            <FileText className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-zinc-200 font-mono">{orders.length} Jobs</p>
          <span className="text-[10px] text-blue-400 font-bold block mt-1">100% Mobile Money receipts</span>
        </div>
      </div>

      {/* Internal Navigation Sub-menus */}
      <div className="flex border-b border-zinc-800 gap-2">
        {["Stats", "Admissions", "Repairs", "Orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`text-xs font-bold pb-2.5 px-3 transition-all cursor-pointer border-b-2 ${
              activeTab === tab
                ? "border-blue-500 text-zinc-100 font-extrabold"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-8 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">Gross Revenue Analytics</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Detailed breakdown of monthly earnings across departments</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTuition" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRepairs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid #27272a", backgroundColor: "#09090b", color: "#f4f4f5" }} />
                  <Area type="monotone" dataKey="Tuition" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTuition)" strokeWidth={2} name="School Tuition" />
                  <Area type="monotone" dataKey="Repairs" stroke="#10b981" fillOpacity={1} fill="url(#colorRepairs)" strokeWidth={2} name="Laptop Repairs" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick list low stock or upcoming action notices */}
          <div className="lg:col-span-4 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">Low Stock Inventory Alerts</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Items needing immediate reordering or physical delivery checks</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                <div className="text-[11px] text-amber-300">
                  <span className="font-bold block">Cruzer Blade 64GB USB</span>
                  <span className="text-zinc-400">Stock remains: 3 units</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                <div className="text-[11px] text-amber-300">
                  <span className="font-bold block">HP LaserJet Pro M404n</span>
                  <span className="text-zinc-400">Stock remains: 2 units</span>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-[10px] text-zinc-500 space-y-1">
                <span className="font-bold text-zinc-400 block">Automatic Restocking Policy:</span>
                <p>When stock reaches zero, online shop clients are automatically blocked from buying that specific product unit.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Admissions" && (
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-800/80">
            <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">Online Admissions Submissions</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Review credentials, verify downpayment receipt, and allocate student IDs.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="p-4">Reference Code</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Applied Program</th>
                  <th className="p-4">Preferred Shift</th>
                  <th className="p-4">Payment Info</th>
                  <th className="p-4">Approval Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm) => (
                  <tr key={adm.id} className="border-b border-zinc-800 last:border-none hover:bg-zinc-900/10">
                    <td className="p-4 font-mono font-bold text-zinc-400">{adm.id}</td>
                    <td className="p-4 font-bold text-zinc-200">{adm.fullName}</td>
                    <td className="p-4 text-zinc-400">{adm.courseId}</td>
                    <td className="p-4 font-mono text-zinc-400">{adm.shift}</td>
                    <td className="p-4 text-zinc-400">
                      <span className="block">{adm.paymentMethod}</span>
                      {adm.paymentReference && (
                        <span className="block font-mono text-[10px] text-zinc-500">Ref: {adm.paymentReference}</span>
                      )}
                      {adm.screenshotUrl ? (
                        <button
                          onClick={() => {
                            setSelectedReviewAdm(adm);
                            if (adm.assignedClassroom) setReviewClassroom(adm.assignedClassroom);
                            if (adm.assignedInstructor) setReviewInstructor(adm.assignedInstructor);
                          }}
                          className="text-[10px] text-blue-400 hover:underline font-bold flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          View Transfer Screenshot
                        </button>
                      ) : (
                        <span className="text-[9px] text-zinc-600 block">No Screenshot</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border ${
                          adm.status === "Approved"
                            ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                            : adm.status === "Rejected"
                            ? "bg-red-950/30 text-red-400 border-red-900/30"
                            : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {adm.status === "Pending" && (
                        <button
                          onClick={() => {
                            setSelectedReviewAdm(adm);
                            setReviewClassroom("Laboratory Room 1");
                            setReviewInstructor("Mr. Azemoh Edmond");
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                        >
                          Review & Approve
                        </button>
                      )}
                      {adm.status === "Approved" && (
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-zinc-400 font-bold">Assigned Student ID:</span>
                          <span className="text-[10px] text-emerald-400 font-mono">{adm.assignedStudentId}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admissions review modal */}
      {selectedReviewAdm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div>
                <h3 className="font-black text-sm text-zinc-100 tracking-tight">Review Online Admission Application</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Reference ID: {selectedReviewAdm.id}</p>
              </div>
              <button
                onClick={() => setSelectedReviewAdm(null)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-bold bg-zinc-900 border border-zinc-800 rounded-lg h-7 w-7 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-left bg-zinc-950">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-1">Applicant Details</span>
                  <p className="pt-1"><strong className="text-zinc-500">Full Name:</strong> <span className="text-zinc-200">{selectedReviewAdm.fullName}</span></p>
                  <p><strong className="text-zinc-500">Email Address:</strong> <span className="text-zinc-200">{selectedReviewAdm.email}</span></p>
                  <p><strong className="text-zinc-500">Phone Number:</strong> <span className="text-zinc-200">{selectedReviewAdm.phone}</span></p>
                  <p><strong className="text-zinc-500">Date of Birth:</strong> <span className="text-zinc-200">{selectedReviewAdm.birthDate}</span></p>
                  <p><strong className="text-zinc-500">National ID:</strong> <span className="text-zinc-200">{selectedReviewAdm.nationalID || "N/A"}</span></p>
                </div>

                <div className="space-y-2 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-1">Program Details</span>
                  <p className="pt-1"><strong className="text-zinc-500">Chosen Course:</strong> <span className="text-blue-400 font-bold">{selectedReviewAdm.courseId}</span></p>
                  <p><strong className="text-zinc-500">Preferred Shift:</strong> <span className="text-zinc-200">{selectedReviewAdm.shift}</span></p>
                  <p><strong className="text-zinc-500">Payment Method:</strong> <span className="text-zinc-200 font-semibold">{selectedReviewAdm.paymentMethod}</span></p>
                  <p><strong className="text-zinc-500">Transaction ID:</strong> <span className="text-amber-400 font-mono font-bold">{selectedReviewAdm.paymentReference || "N/A"}</span></p>
                </div>
              </div>

              {/* Passport Photo vs Screenshot Proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Passport Photo</span>
                  {selectedReviewAdm.passportUrl ? (
                    <img
                      src={selectedReviewAdm.passportUrl}
                      alt="Student passport"
                      className="w-full h-40 object-cover rounded-xl border border-zinc-800 bg-zinc-900"
                    />
                  ) : (
                    <div className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">
                      No Passport Uploaded
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Screenshot Transfer Proof</span>
                  {selectedReviewAdm.screenshotUrl ? (
                    <div className="relative group border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900">
                      <img
                        src={selectedReviewAdm.screenshotUrl}
                        alt="Transfer screenshot"
                        className="w-full h-40 object-contain cursor-pointer hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-200 px-2.5 py-1 rounded-md">
                          Screenshot Proof
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">
                      No Screenshot Uploaded
                    </div>
                  )}
                </div>
              </div>

              {selectedReviewAdm.status === "Pending" ? (
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-4">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Allocation & Registrar Checklist</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Assign Classroom / Lab Room</label>
                      <input
                        type="text"
                        value={reviewClassroom}
                        onChange={(e) => setReviewClassroom(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Assign Instructor</label>
                      <input
                        type="text"
                        value={reviewInstructor}
                        onChange={(e) => setReviewInstructor(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Feedback / Notes (Simulated Email details are generated automatically)</label>
                    <textarea
                      placeholder="Enter optional feedback or correction requirements here."
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Review Decision Details</span>
                  <p><strong className="text-zinc-500">Status:</strong> <span className="text-emerald-400 font-bold">{selectedReviewAdm.status}</span></p>
                  <p><strong className="text-zinc-500">Classroom:</strong> <span className="text-zinc-300 font-mono">{selectedReviewAdm.assignedClassroom}</span></p>
                  <p><strong className="text-zinc-500">Instructor:</strong> <span className="text-zinc-300">{selectedReviewAdm.assignedInstructor}</span></p>
                  <p><strong className="text-zinc-500">Notification logs:</strong> <span className="text-zinc-400 font-sans leading-relaxed block bg-zinc-950 p-2 rounded mt-1 border border-zinc-900 font-mono text-[10px]">{selectedReviewAdm.feedback}</span></p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
              {selectedReviewAdm.status === "Pending" ? (
                <>
                  <button
                    type="button"
                    disabled={submittingReview}
                    onClick={() => handleReviewAdmission(selectedReviewAdm.id, "Rejected")}
                    className="bg-red-950/40 hover:bg-red-950/60 border border-red-900/30 text-red-400 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    disabled={submittingReview}
                    onClick={() => handleReviewAdmission(selectedReviewAdm.id, "Approved")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/15"
                  >
                    {submittingReview ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Approve & Create Student Account"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedReviewAdm(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Close View
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Repairs" && (
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden space-y-6 p-5">
          <div>
            <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">Device Repair Station Diagnostics</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Log custom diagnostic notes, set client quote prices in CFAF, and update systematic progress states.</p>
          </div>

          {editingRepairId && (
            <form onSubmit={handleUpdateRepair} className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl space-y-4 max-w-2xl">
              <h4 className="text-xs font-bold text-zinc-100">Update Ticket: {editingRepairId}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">State Progress</label>
                  <select
                    value={repairStatus}
                    onChange={(e) => setRepairStatus(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2 focus:outline-none"
                  >
                    <option className="bg-zinc-950 text-zinc-100">Booked</option>
                    <option className="bg-zinc-950 text-zinc-100">Diagnosing</option>
                    <option className="bg-zinc-950 text-zinc-100">Quoted</option>
                    <option className="bg-zinc-950 text-zinc-100">Repairing</option>
                    <option className="bg-zinc-950 text-zinc-100">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Estimated Parts Price CFAF</label>
                  <input
                    type="number"
                    required
                    value={repairPrice}
                    onChange={(e) => setRepairPrice(Number(e.target.value))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Technician Notes</label>
                  <input
                    type="text"
                    required
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingRepairId(null)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                >
                  Save Station Updates
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Device Description</th>
                  <th className="p-4">Status Progress</th>
                  <th className="p-4">Diagnostics Cost</th>
                  <th className="p-4">Technician Commentary</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((rep) => (
                  <tr key={rep.id} className="border-b border-zinc-800 last:border-none hover:bg-zinc-900/10">
                    <td className="p-4 font-mono font-bold text-zinc-400">{rep.id}</td>
                    <td className="p-4 font-bold text-zinc-200">{rep.customerName}</td>
                    <td className="p-4 text-zinc-400">{rep.deviceName} ({rep.deviceType})</td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] bg-blue-950/30 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded uppercase font-bold">
                        {rep.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-200">
                      {rep.quotedPriceCFAF ? `${rep.quotedPriceCFAF.toLocaleString()} CFAF` : "Pending Quote"}
                    </td>
                    <td className="p-4 text-zinc-400 italic truncate max-w-[180px]">
                      {rep.technicianNotes || "Analyzing circuitry lines..."}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingRepairId(rep.id);
                          setRepairStatus(rep.status);
                          setRepairPrice(rep.quotedPriceCFAF || 15000);
                          setRepairNotes(rep.technicianNotes || "Systematic diagnostics...");
                        }}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-800 hover:text-white transition-all"
                      >
                        Edit Diagnostics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Orders" && (
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-800/80">
            <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">Completed Customer Documentation Jobs</h3>
            <p className="text-[10px] text-zinc-550 mt-0.5 font-sans">Monitor office printing queue, custom cover letters, scanning receipts and Mobile Money payouts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="p-4">Order Code</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Job Service</th>
                  <th className="p-4">Source Draft File</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Execution Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} className="border-b border-zinc-800 last:border-none hover:bg-zinc-900/10">
                    <td className="p-4 font-mono font-bold text-zinc-400">{ord.id}</td>
                    <td className="p-4 font-bold text-zinc-200">{ord.customerName}</td>
                    <td className="p-4 text-zinc-400">{ord.serviceType} (x{ord.quantity})</td>
                    <td className="p-4 text-zinc-500 font-mono truncate max-w-[120px]">{ord.fileName}</td>
                    <td className="p-4 font-mono font-bold text-blue-400">
                      {ord.calculatedPriceCFAF?.toLocaleString() || "1,000"} CFAF
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
