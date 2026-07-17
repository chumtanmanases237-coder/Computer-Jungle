/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, User, Mail, Lock, Phone, RefreshCw, Sparkles, GraduationCap, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { User as UserType } from "../types";

interface PortalAuthProps {
  role: "Student" | "Teacher" | "Admin";
  onSuccess: (user: UserType) => void;
}

export default function PortalAuth({ role, onSuccess }: PortalAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Recovery States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetCodeHint, setResetCodeHint] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { name, email, phone, password, role: "Student" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Check role permissions on successful login
      const user: UserType = data.user;
      
      if (isLogin) {
        if (role === "Student" && user.role !== "Student") {
          throw new Error("This account is not registered as a Student.");
        }
        if (role === "Teacher" && user.role !== "Instructor" && user.role !== "Teacher") {
          throw new Error("This account does not have Instructor credentials.");
        }
        if (role === "Admin" && !["Super Admin", "Admin", "Principal", "Accountant"].includes(user.role)) {
          throw new Error("Access denied. Admin authorization required.");
        }
      }

      // Store session
      localStorage.setItem(`cj_user_${role.toLowerCase()}`, JSON.stringify(user));
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setResetting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResetMessage(data.message);
      if (data.resetCode) {
        setResetCodeHint(`Generated Verification Code: ${data.resetCode} (Current password: ${data.tempPasswordHint})`);
      }
      setResetStep("verify");
    } catch (err: any) {
      setResetError(err.message || "An error occurred");
    } finally {
      setResetting(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setResetting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reset failed");
      }

      setResetMessage(data.message);
      setTimeout(() => {
        setShowResetModal(false);
        setIsLogin(true);
        setPassword("");
        setEmail(resetEmail);
        setResetStep("request");
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
        setResetCodeHint(null);
        setResetMessage(null);
      }, 2500);
    } catch (err: any) {
      setResetError(err.message || "An error occurred");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto my-12 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Visual Header */}
      <div className="relative p-6 text-center border-b border-zinc-900 bg-linear-to-b from-blue-950/10 to-zinc-950">
        <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3">
          {role === "Student" ? (
            <GraduationCap className="h-6 w-6 text-blue-400" />
          ) : role === "Teacher" ? (
            <Sparkles className="h-6 w-6 text-blue-400" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          )}
        </div>
        <h2 className="text-lg font-black tracking-tight text-zinc-100 uppercase">
          {role} Workspace Secure Lock
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          {role === "Student"
            ? "Enter your student credentials or register to start tracking assignments."
            : `Authorized access lock for Computer Jungle ${role} accounts.`}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Toggle between login / signup for Students */}
        {role === "Student" && (
          <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                isLogin
                  ? "bg-zinc-800 text-blue-400 border border-zinc-700/50 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Secure Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                !isLogin
                  ? "bg-zinc-800 text-blue-400 border border-zinc-700/50 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-950/15 border border-red-900/30 text-red-400 text-xs p-3.5 rounded-xl text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your first & last name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +237 6XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder={
                  role === "Student"
                    ? "student@computerjungle.com"
                    : role === "Teacher"
                    ? "paul.ayuk@computerjungle.com"
                    : "admin@computerjungle.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                Security Password
              </label>
              {isLogin && (
                <span className="text-[9px] text-zinc-500 font-mono">
                  Default: {role.toLowerCase()}123
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetEmail(email || "");
                  setResetError(null);
                  setResetMessage(null);
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer font-mono inline-block"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/15 mt-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <span>{isLogin ? "Unlock Workspace" : "Register & Login"}</span>
            )}
          </button>
        </form>

        {isLogin && (
          <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-900 text-center text-[10px] text-zinc-500 font-mono space-y-1">
            <span className="text-zinc-400 block font-bold uppercase">Predefined Accounts for Testing:</span>
            {role === "Student" && (
              <p>Email: <span className="text-blue-400">student@computerjungle.com</span><br/>Password: <span className="text-blue-400 font-bold">student123</span></p>
            )}
            {role === "Teacher" && (
              <p>Email: <span className="text-blue-400">paul.ayuk@computerjungle.com</span><br/>Password: <span className="text-blue-400 font-bold">teacher123</span></p>
            )}
            {role === "Admin" && (
              <p>Email: <span className="text-blue-400">admin@computerjungle.com</span><br/>Password: <span className="text-blue-400 font-bold">admin123</span></p>
            )}
          </div>
        )}
      </div>

      {/* Reset Password Modal Overlay */}
      {showResetModal && (
        <div className="absolute inset-0 bg-zinc-950/98 backdrop-blur-md p-6 flex flex-col justify-center z-20">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <KeyRound className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider">
                Security Password Recovery
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400">
              {resetStep === "request" 
                ? "Request a password recovery code by entering your registered email address below."
                : "A password recovery code has been generated. Enter it below along with your desired new password."}
            </p>

            {resetError && (
              <div className="bg-red-950/20 border border-red-900/30 text-red-400 text-xs p-3 rounded-xl font-mono text-center">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs p-3 rounded-xl font-mono text-center">
                {resetMessage}
              </div>
            )}

            {resetCodeHint && (
              <div className="bg-blue-950/30 border border-blue-900/20 text-blue-400 text-[11px] p-3 rounded-xl font-mono space-y-1">
                <span className="font-bold uppercase text-[9px] text-blue-300 block">Simulation Alert (Testing Only):</span>
                <p className="break-all">{resetCodeHint}</p>
              </div>
            )}

            {resetStep === "request" ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@computerjungle.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetEmail("");
                      setResetError(null);
                      setResetMessage(null);
                      setResetCodeHint(null);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/15"
                  >
                    {resetting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Generate OTP</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                    Verification OTP Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter 6-digit code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-mono animate-pulse"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">
                    Desired New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("request");
                      setResetError(null);
                      setResetMessage(null);
                      setResetCodeHint(null);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-zinc-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                  >
                    {resetting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Save Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
