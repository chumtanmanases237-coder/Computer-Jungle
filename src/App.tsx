/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  Wrench,
  FileText,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Layers,
  Menu,
  X,
  Phone,
  MapPin,
  Cpu,
} from "lucide-react";

// Components
import HomeView from "./components/HomeView";
import AdmissionForm from "./components/AdmissionForm";
import CertificateVerification from "./components/CertificateVerification";
import CvBuilderView from "./components/CvBuilderView";
import RepairsView from "./components/RepairsView";
import DocServicesView from "./components/DocServicesView";
import ShopView from "./components/ShopView";
import AdminDashboard from "./components/AdminDashboard";
import StudentPortal from "./components/StudentPortal";
import TeacherPortal from "./components/TeacherPortal";
import AiChatbot from "./components/AiChatbot";

import { Course, Department, Product } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prefilledCourseId, setPrefilledCourseId] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchBaseData = async () => {
    try {
      const [resCourses, resDepts, resProds] = await Promise.all([
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/departments").then((r) => r.json()),
        fetch("/api/shop/products").then((r) => r.json()),
      ]);
      setCourses(resCourses || []);
      setDepartments(resDepts || []);
      setProducts(resProds || []);
    } catch (err) {
      console.error("Failed to load initial school data profiles", err);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  const handleCustomNavigate = (tab: string, arg?: any) => {
    setActiveTab(tab);
    if (arg && arg.courseId) {
      setPrefilledCourseId(arg.courseId);
    } else {
      setPrefilledCourseId("");
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Public Website", icon: BookOpen },
    { id: "admissions", label: "Admissions Desk", icon: GraduationCap },
    { id: "registry", label: "Certificate Registry", icon: ShieldCheck },
    { id: "cvbuilder", label: "AI CV Builder", icon: Sparkles },
    { id: "repairs", label: "Repairs Workshop", icon: Wrench },
    { id: "docs", label: "Document Services", icon: FileText },
    { id: "shop", label: "Hardware & Accessories Shop", icon: ShoppingBag },
    { id: "student", label: "Student Portal", icon: Layers },
    { id: "teacher", label: "Teacher Workspace", icon: Layers },
    { id: "admin", label: "Admin Panel", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-100">
      {/* Top sticky navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 cursor-pointer lg:hidden"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div
            onClick={() => handleCustomNavigate("home")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105 font-bold text-lg italic">
              CJ
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
                Computer Jungle
              </h1>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest block">
                School of Computer Technology • Kumba
              </span>
            </div>
          </div>
        </div>

        {/* Address and telephone header row (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-blue-400" />
            Confidence Street Junction, Fiango, Kumba
          </span>
          <span className="flex items-center gap-1 font-bold text-zinc-200">
            <Phone className="h-4 w-4 text-blue-400" />
            +237 677 83 64 22
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar Nav Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-zinc-950 border-r border-zinc-800 pt-20 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-auto ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 py-6 space-y-1.5 h-full overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleCustomNavigate(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-zinc-800"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Dynamic workspace area */}
        <main className="flex-1 p-6 md:p-8 max-w-full overflow-hidden space-y-8">
          {activeTab === "home" && (
            <HomeView courses={courses} onNavigate={handleCustomNavigate} />
          )}

          {activeTab === "admissions" && (
            <AdmissionForm
              courses={courses}
              departments={departments}
              prefilledCourseId={prefilledCourseId}
            />
          )}

          {activeTab === "registry" && <CertificateVerification />}

          {activeTab === "cvbuilder" && <CvBuilderView />}

          {activeTab === "repairs" && <RepairsView />}

          {activeTab === "docs" && <DocServicesView />}

          {activeTab === "shop" && (
            <ShopView products={products} onRefreshProducts={fetchBaseData} />
          )}

          {activeTab === "student" && <StudentPortal />}

          {activeTab === "teacher" && <TeacherPortal />}

          {activeTab === "admin" && <AdminDashboard />}
        </main>
      </div>

      {/* Floating AI chat agent */}
      <AiChatbot />

      {/* Footer information section */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 px-6 border-t border-zinc-800 text-center space-y-3 font-mono">
        <p className="text-xs text-zinc-300">
          COMPUTER JUNGLE TRAINING CENTER &bull; Confidence Street Junction, Fiango, Kumba, SW Region, Cameroon
        </p>
        <p className="text-[10px]">
          &quot;In Computer, We Trust&quot; &bull; Lead Admin Desk Tel: +237 677 83 64 22
        </p>
        <p className="text-[9px] text-zinc-600">
          Digital Campus &copy; {new Date().getFullYear()} Computer Jungle Inc. All rights reserved. Registered with national registries.
        </p>
      </footer>
    </div>
  );
}
