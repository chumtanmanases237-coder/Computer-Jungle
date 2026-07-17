/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DocServiceType } from "../types";
import { FileText, Calculator, ShoppingBag, Search, RefreshCw, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

export default function DocServicesView() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceType, setServiceType] = useState<DocServiceType>("Typing");
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [fileName, setFileName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MTN Mobile Money");

  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Tracking orders state
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  // Core pricing metrics in CFAF per unit page/item
  const pricingMatrix: Record<DocServiceType, number> = {
    Typing: 500, // per page
    Printing: 100, // per page
    "Color Printing": 250, // per page
    Photocopy: 50, // per page
    Scanning: 100, // per page
    "Passport Photo": 1500, // set of 4
    "School ID Design": 3000,
    "CV Creation": 5000,
    "Cover Letter": 2000,
    Binding: 500, // per book
    Lamination: 500, // per page
    "Flyers & Posters": 10000, // setup
    "Funeral Programs": 15000, // setup
    "Business Cards": 5000, // set of 50
  };

  const getPricePerUnit = () => {
    return pricingMatrix[serviceType] || 500;
  };

  const calculateTotal = () => {
    return getPricePerUnit() * quantity;
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        serviceType,
        fileName: fileName || "uploaded_document.pdf",
        instructions,
        quantity,
        calculatedPriceCFAF: calculateTotal(),
        paymentMethod,
      };

      const response = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setSubmittedOrder(data.order);
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
      const response = await fetch("/api/documentation");
      const list = await response.json();
      const match = list.find((o: any) => o.id.toUpperCase() === trackId.trim().toUpperCase());

      if (match) {
        setTrackResult(match);
      } else {
        setTrackError("Document order reference ID not found.");
      }
    } catch (err) {
      setTrackError("Error contacting workshop database.");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-zinc-950 rounded-2xl shadow-sm border border-zinc-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cost Calculator & Booking Form */}
        <div className="lg:col-span-7 space-y-6">
          {submittedOrder ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
              <div className="bg-blue-600 h-12 w-12 rounded-full text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-zinc-100 font-sans">Document Order Submitted!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Thank you! Your documentation processing order for <strong>{serviceType}</strong> has been registered. Our desk staff at Fiango Junction is starting work.
              </p>

              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 inline-block font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">ORDER REFERENCE CODE</span>
                <span className="text-sm font-bold text-blue-400 tracking-wider">{submittedOrder.id}</span>
              </div>

              <p className="text-xs text-zinc-500">
                You paid {calculateTotal().toLocaleString()} CFAF via {paymentMethod}. Track order progress using the tracking desk.
              </p>

              <button
                onClick={() => setSubmittedOrder(null)}
                className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-6 rounded-xl cursor-pointer transition-colors"
              >
                Place Another Document Order
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <span>CJTC Documentation Price Calculator</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Calculate typing, printing, laminating, scanning and card designs, pay via Mobile Money, and track delivery status.
                </p>
              </div>

              <form onSubmit={handleOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Divine Neba"
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
                      placeholder="e.g. divine@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Telephone Number (Mobile Money Account)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +237 677 83 64 22"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Select Service</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as DocServiceType)}
                      className="w-full text-xs px-2 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none"
                    >
                      {Object.keys(pricingMatrix).map((opt) => (
                        <option key={opt} className="bg-zinc-950 text-zinc-100">{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Quantity (Pages / Cards / Units)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Upload Document Draft</label>
                    <input
                      type="file"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                      className="w-full text-xs file:bg-zinc-900 file:hover:bg-zinc-800 file:border file:border-zinc-800 file:text-zinc-300 file:text-[10px] file:font-bold file:px-3 file:py-2.5 file:rounded-lg file:cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Specific Layout / Formatting Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Enter specific margins, fonts, lamination request details..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Payment Wallet</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none"
                    >
                      <option className="bg-zinc-950 text-zinc-100">MTN Mobile Money</option>
                      <option className="bg-zinc-950 text-zinc-100">Orange Money</option>
                    </select>
                  </div>

                  {/* Pricing feedback widget */}
                  <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">ESTIMATED BILL</span>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-zinc-400">Price per unit page:</span>
                      <span className="font-mono text-zinc-200">{getPricePerUnit()} CFAF</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 mt-1.5">
                      <span className="font-bold text-zinc-100">Total Price:</span>
                      <span className="font-mono font-black text-blue-400">{calculateTotal().toLocaleString()} CFAF</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : `Pay ${calculateTotal().toLocaleString()} CFAF & Order`}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Real-time Order Tracker side panel */}
        <div className="lg:col-span-5 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-start">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-blue-400" />
                <span>Track Active Order State</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enter your submitted DOC Code to monitor printing or document typing progress.
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. DOC-2001"
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
                  setTrackId("DOC-2001");
                  setTrackResult({
                    id: "DOC-2001",
                    customerName: "Tabi Collins Enow",
                    serviceType: "CV Creation",
                    fileName: "tabi_draft_details.docx",
                    quantity: 1,
                    calculatedPriceCFAF: 5000,
                    paymentStatus: "Paid",
                    status: "In Progress",
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 hover:text-zinc-200 cursor-pointer text-zinc-400 font-mono"
              >
                DOC-2001
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
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">DOC ORDER: {trackResult.id}</span>
                  <span className="text-[10px] font-black text-blue-400 font-mono uppercase bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded">
                    {trackResult.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                  <p><strong className="text-zinc-500">Customer:</strong> {trackResult.customerName}</p>
                  <p><strong className="text-zinc-500">Ordered Job:</strong> {trackResult.serviceType}</p>
                  <p><strong className="text-zinc-500">Units/Qty:</strong> {trackResult.quantity}</p>
                  <p><strong className="text-zinc-500">File Name:</strong> <span className="font-mono text-[11px] text-zinc-400">{trackResult.fileName}</span></p>
                  <p className="text-blue-400 font-bold"><strong className="text-zinc-500">Amount Charged:</strong> {trackResult.calculatedPriceCFAF.toLocaleString()} CFAF</p>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                  <span className="font-bold block text-zinc-300">Production Status Commentary:</span>
                  <p>
                    {trackResult.status === "Submitted" && "Your document draft is pending initial review by our administrative assistant."}
                    {trackResult.status === "In Progress" && "Our staff is actively formatting your CV or operating the high-speed laser photocopier."}
                    {trackResult.status === "Completed" && "Perfect! The print/processing job is finished and ready for pickup at our Fiango Junction office!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
