import React, { useState, useEffect } from "react";
import { Sparkles, FileText, UploadCloud, Edit3, Settings2, Printer, Check, Copy, Download, RefreshCw, Layers, Loader2, LogOut, Cloud, CloudOff, Lock, Info } from "lucide-react";
import { CVData, TailoredCVResult, TemplateStyle } from "./types";
import { initialCV, sampleJobDescription } from "./initialCV";
import CVForm from "./components/CVForm";
import CVImport from "./components/CVImport";
import CVPreview from "./components/CVPreview";
import JobTailor from "./components/JobTailor";
import TailoredResult from "./components/TailoredResult";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import AuthScreen from "./components/AuthScreen";
import LandingPage from "./components/LandingPage";
import BillingModal from "./components/BillingModal";

export default function App() {
  const [cvData, setCVData] = useState<CVData>(initialCV);
  const [tailorResult, setTailorResult] = useState<TailoredCVResult | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "import" | "tailor">("edit");
  const [previewStyle, setPreviewStyle] = useState<TemplateStyle>("modern");
  const [previewData, setPreviewData] = useState<"original" | "tailored">("original");

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudSaving, setCloudSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadCompleted, setLoadCompleted] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Subscription Plans & Usage states
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "unlimited">("free");
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showRegisterRequiredModal, setShowRegisterRequiredModal] = useState(false);

  // Guest Mode Sandbox & Auth triggers
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showAuthMode, setShowAuthMode] = useState<"signin" | "signup" | null>(null);


  // Monitor Supabase auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser as any);
      if (currentUser) {
        setAuthLoading(true);
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .single();

          if (error && error.code !== "PGRST116") {
            throw error;
          }

          if (data) {
            if (data.cv_data) {
              setCVData(data.cv_data);
            }
            if (data.tailor_result) {
              setTailorResult(data.tailor_result);
            }
            if (data.plan) {
              setUserPlan(data.plan as any);
            } else {
              setUserPlan("free");
            }
            if (data.monthly_usage !== undefined) {
              setMonthlyUsage(data.monthly_usage);
            } else {
              setMonthlyUsage(0);
            }
          } else {
            // First time user, save default sample cvData
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: currentUser.id,
                cv_data: initialCV,
                plan: "free",
                monthly_usage: 0,
                updated_at: new Date().toISOString()
              });
            if (insertError) throw insertError;
            setUserPlan("free");
            setMonthlyUsage(0);
          }
        } catch (error) {
          console.error("Error loading user profile from Supabase:", error);
        } finally {
          setLoadCompleted(true);
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
        setLoadCompleted(false);
        setTailorResult(null);
        setUserPlan("free");
        setMonthlyUsage(0);
      }
    });

    // Also check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser as any);
      if (currentUser) {
        setAuthLoading(true);
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .single();

          if (error && error.code !== "PGRST116") {
            throw error;
          }

          if (data) {
            if (data.cv_data) {
              setCVData(data.cv_data);
            }
            if (data.tailor_result) {
              setTailorResult(data.tailor_result);
            }
            if (data.plan) {
              setUserPlan(data.plan as any);
            } else {
              setUserPlan("free");
            }
            if (data.monthly_usage !== undefined) {
              setMonthlyUsage(data.monthly_usage);
            } else {
              setMonthlyUsage(0);
            }
          } else {
            // First time user, save default sample cvData
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: currentUser.id,
                cv_data: initialCV,
                plan: "free",
                monthly_usage: 0,
                updated_at: new Date().toISOString()
              });
            if (insertError) throw insertError;
            setUserPlan("free");
            setMonthlyUsage(0);
          }
        } catch (error) {
          console.error("Error loading user profile from Supabase:", error);
        } finally {
          setLoadCompleted(true);
          setAuthLoading(false);
        }
      }
    };
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  // Automatically save cvData and tailorResult to Supabase whenever they change
  useEffect(() => {
    if (!user || !loadCompleted) return;

    setCloudSaving("saving");
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("users")
          .update({
            cv_data: cvData,
            tailor_result: tailorResult,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
        if (error) throw error;
        setCloudSaving("saved");
      } catch (error) {
        console.error("Error auto-saving to Supabase:", error);
        setCloudSaving("error");
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(delayDebounceFn);
  }, [cvData, tailorResult, user, loadCompleted]);

  // Success hook when Gemini parses raw text CV
  const handleImportSuccess = (parsedData: CVData) => {
    setCVData(parsedData);
    setTailorResult(null); // Reset previous tailoring since base CV has changed
    setPreviewData("original");
    setActiveTab("edit");
  };

  // Success hook when CV is tailored to job description
  const handleTailorSuccess = (result: TailoredCVResult) => {
    setTailorResult(result);
    setPreviewData("tailored");
    
    // Increment usage for registered users upon successful tailoring
    if (!isGuestMode) {
      incrementUsage();
    }

    // Scroll automatically down to result
    setTimeout(() => {
      document.getElementById("tailored-result-analytics")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Reset tailoring state
  const handleResetTailor = () => {
    setTailorResult(null);
    setPreviewData("original");
    setActiveTab("tailor");
  };

  // Standard web print utility targeting the CV element
  const handlePrint = () => {
    if (isGuestMode) {
      setShowRegisterRequiredModal(true);
      return;
    }

    // Check registered limits
    const limit = getLimitForPlan(userPlan);
    if (monthlyUsage >= limit) {
      setShowBillingModal(true);
      return;
    }

    const origTitle = document.title;
    document.title = `${cvData.personalInfo?.fullName || "Resume"}_CV`;
    window.print();
    document.title = origTitle;
    incrementUsage();
  };

  // Native PDF exporter utilizing html2canvas + jsPDF
  const handleDownloadPDF = async () => {
    if (isGuestMode) {
      setShowRegisterRequiredModal(true);
      return;
    }

    // Check registered limits
    const limit = getLimitForPlan(userPlan);
    if (monthlyUsage >= limit) {
      setShowBillingModal(true);
      return;
    }

    const element = document.getElementById("printable-cv-stage");
    if (!element) {
      alert("Error: CV preview element not found. Please ensure the preview is rendered on screen.");
      return;
    }

    setIsPdfGenerating(true);

    try {
      // Calculate optimized configurations for high fidelity conversion
      const canvas = await html2canvas(element, {
        scale: 2, // Higher density output
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Standard A4 width in mm
      const pageHeight = 297; // Standard A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add secondary pages if length exceeds a single standard page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Safe alphanumeric file name
      const activeName = (previewData === "tailored" && tailorResult
        ? tailorResult.tailoredCV.personalInfo?.fullName
        : cvData.personalInfo?.fullName) || "Resume";
      const suffix = previewData === "tailored" ? "_Tailored_CV" : "_CV";
      const fileName = `${activeName.replace(/[^a-z0-9]/gi, "_")}${suffix}.pdf`;

      pdf.save(fileName);
      
      // Successfully downloaded, increment usage!
      incrementUsage();
    } catch (error: any) {
      console.error("Failed to generate PDF:", error);
      alert(`We couldn't generate the PDF directly. Please use the 'Print Fallback' option instead.`);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Quick reset to initial template
  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to load the sample template? This will replace your current edits.")) {
      setCVData(initialCV);
      setTailorResult(null);
      setPreviewData("original");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsGuestMode(false);
      setShowAuthMode(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getLimitForPlan = (plan: "free" | "pro" | "unlimited") => {
    if (plan === "free") return 5;
    if (plan === "pro") return 30;
    return 100;
  };

  const incrementUsage = async () => {
    if (!user) return;
    const newUsage = monthlyUsage + 1;
    setMonthlyUsage(newUsage);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          monthly_usage: newUsage,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to increment usage in cloud:", e);
    }
  };

  const handleUpgradePlan = async (newPlan: "free" | "pro" | "unlimited") => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("users")
        .update({
          plan: newPlan,
          monthly_usage: 0, // reset quota upon successful subscription upgrade!
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      if (error) throw error;

      setUserPlan(newPlan);
      setMonthlyUsage(0);
    } catch (err) {
      console.error("Failed to complete mock upgrade:", err);
      throw err;
    }
  };

  const handleBeforeTailor = () => {
    if (isGuestMode) {
      // Testing for free is fully allowed!
      return true;
    }

    const limit = getLimitForPlan(userPlan);
    if (monthlyUsage >= limit) {
      setShowBillingModal(true);
      return false; // prevent tailoring API trigger
    }
    return true; // allowed
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Verifying secure session...
          </span>
        </div>
      </div>
    );
  }

  // Render Landing Page or Auth screen if not logged in and not in sandbox test mode
  if (!user && !isGuestMode) {
    if (showAuthMode !== null) {
      return (
        <AuthScreen 
          initialIsSignUp={showAuthMode === "signup"} 
          onClose={() => setShowAuthMode(null)} 
        />
      );
    }
    return (
      <LandingPage 
        onStartTesting={() => setIsGuestMode(true)} 
        onOpenAuth={(mode) => setShowAuthMode(mode)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-16">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md shadow-emerald-600/10">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">AI-Driven Workflows</span>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">AI CV Builder & Tailorer</h1>
            </div>
          </div>

          {/* Sync status, profile and logout */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
            {isGuestMode ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-700">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Sandbox Guest Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthMode("signin")}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
                  id="header-signin-btn"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthMode("signup")}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition cursor-pointer"
                  id="header-register-btn"
                >
                  Register Free
                </button>
              </>
            ) : user ? (
              <>
                {/* Cloud saving status */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                  {cloudSaving === "saving" && (
                    <>
                      <Cloud className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-emerald-600 font-medium animate-pulse">Saving to Cloud...</span>
                    </>
                  )}
                  {cloudSaving === "saved" && (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-600 font-medium">All changes synced</span>
                    </>
                  )}
                  {cloudSaving === "error" && (
                    <>
                      <CloudOff className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-600 font-medium">Sync offline</span>
                    </>
                  )}
                  {cloudSaving === "idle" && (
                    <>
                      <Cloud className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Cloud Connected</span>
                    </>
                  )}
                </div>

                {/* Subscription Plan Badge - Click to open Billing Manager */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/60 rounded-xl text-xs font-black text-emerald-700 transition cursor-pointer"
                  id="header-plan-badge-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="capitalize">{userPlan} Plan</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm ml-1 font-semibold">
                    {monthlyUsage} / {getLimitForPlan(userPlan)}
                  </span>
                </button>

                {/* Profile badge */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100/55 border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] uppercase font-black">
                    {user.email ? user.email.charAt(0) : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
              </>
            ) : null}

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl flex items-center gap-1 transition cursor-pointer border border-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-transparent"
                id="header-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {isGuestMode && (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200/60 py-3 px-4 md:px-8 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm shrink-0">Sandbox Mode</span>
            <p>You are testing the CV tailorer for free! Register a free account to unlock high-fidelity PDF downloads and keep changes synced.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => setShowAuthMode("signup")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow-xs"
            >
              Register Free
            </button>
            <button
              type="button"
              onClick={() => setIsGuestMode(false)}
              className="text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
            >
              Exit Sandbox
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid lg:grid-cols-12 gap-8">
        {/* Left Column: Input Panel, Tab Controls, Importers */}
        <section className="lg:col-span-6 space-y-6" id="cv-inputs-section">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                id="tab-edit-cv"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>1. Edit CV Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("import")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeTab === "import"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                id="tab-import-cv"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import Text Resume</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tailor")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeTab === "tailor"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                id="tab-tailor-cv"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>2. Tailor to Job</span>
              </button>
            </div>

            {/* Tab Body contents */}
            <div className="p-5">
              {activeTab === "edit" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Manual Profile Editor</h3>
                    <p className="text-xs text-gray-400">Fill details or import to autopopulate.</p>
                  </div>
                  <CVForm cvData={cvData} onChange={(newCV) => setCVData(newCV)} />
                </div>
              )}

              {activeTab === "import" && (
                <CVImport onImportSuccess={handleImportSuccess} />
              )}

              {activeTab === "tailor" && (
                <JobTailor
                  cvData={cvData}
                  onTailoringComplete={handleTailorSuccess}
                  sampleJob={sampleJobDescription}
                  onBeforeTailor={handleBeforeTailor}
                />
              )}
            </div>
          </div>

          {/* AI Tailoring Analysis Report Box (rendered below actions if complete) */}
          {tailorResult && (
            <TailoredResult
              analysis={tailorResult.analysis}
              onReset={handleResetTailor}
              onPrint={handlePrint}
              onDownloadPDF={handleDownloadPDF}
              isPdfGenerating={isPdfGenerating}
              cvData={previewData === "tailored" ? tailorResult.tailoredCV : cvData}
            />
          )}
        </section>

        {/* Right Column: Live CV Interactive Preview */}
        <section className="lg:col-span-6 space-y-6" id="cv-preview-section">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-5 sticky top-24">
            {/* Toolbar for styling */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">Interactive Preview Settings</span>
              </div>

              {/* Toggle switch for Original vs Tailored (if tailored) */}
              {tailorResult && (
                <div className="flex bg-gray-100 p-1 rounded-xl" id="preview-version-toggle">
                  <button
                    type="button"
                    onClick={() => setPreviewData("original")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      previewData === "original" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Original CV
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewData("tailored")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      previewData === "tailored" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-600 hover:text-emerald-700 font-bold"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tailored CV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Template Style:</span>
              {(["classic", "modern", "tech", "creative"] as TemplateStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPreviewStyle(style)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize cursor-pointer transition-all border ${
                    previewStyle === style
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                  id={`template-btn-${style}`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* LIVE CANVAS CONTAINER */}
            <div className="relative border border-gray-100 rounded-xl bg-gray-50/50 p-2 md:p-4 max-h-[800px] overflow-y-auto shadow-inner">
              <CVPreview
                cvData={previewData === "tailored" && tailorResult ? tailorResult.tailoredCV : cvData}
                style={previewStyle}
              />
            </div>

            {/* Quick Export controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500 border-t border-gray-100 pt-4 mt-2">
              <span className="hidden sm:inline">Tip: Custom templates adapt beautifully to PDF layouts.</span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:underline font-semibold cursor-pointer"
                  id="preview-print-trigger-btn"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Fallback</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isPdfGenerating}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold py-1.5 px-3.5 rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-sm transition"
                  id="preview-download-pdf-btn"
                >
                  {isPdfGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isPdfGenerating ? "Generating..." : "Download PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PRINT STYLING TARGET OVERLAY */}
      {/* This hidden section is formatted perfectly for physical US Letter or A4 printer media */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-cv-stage, #printable-cv-stage * {
            visibility: visible;
          }
          #printable-cv-stage {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          /* Keep text and links readable in black text printing */
          #printable-cv-stage a {
            color: black !important;
            text-decoration: underline !important;
          }
        }
      `}</style>

      {/* BILLING AND PLANS MANAGEMENT MODAL */}
      {showBillingModal && (
        <BillingModal
          currentPlan={userPlan}
          usage={monthlyUsage}
          onClose={() => setShowBillingModal(false)}
          onUpgrade={handleUpgradePlan}
        />
      )}

      {/* REGISTER REQUIRED MODAL FOR GUEST SANDBOX USERS */}
      {showRegisterRequiredModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-md font-black text-slate-900">Registration Required</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generating and downloading high-fidelity PDF resumes is a premium feature. Please create a free account to download instantly and sync progress securely!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowRegisterRequiredModal(false);
                  setShowAuthMode("signup");
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Sign Up for Free Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterRequiredModal(false);
                  setShowAuthMode("signin");
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Sign In to Existing Profile
              </button>
              <button
                type="button"
                onClick={() => setShowRegisterRequiredModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Continue Free Testing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
