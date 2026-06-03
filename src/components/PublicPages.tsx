import React, { useState } from "react";
import { 
  ArrowRight, 
  Users, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Send,
  MessageSquare,
  Mail,
  Award,
  Sparkles,
  Cpu,
  Smartphone,
  Check,
  FileText,
  BookOpen
} from "lucide-react";
import { motion } from "motion/react";

interface PublicPagesProps {
  activeTab: "home" | "about" | "contact";
  onGetStarted: () => void;
  setActiveTab: (tab: "home" | "about" | "contact") => void;
}

export default function PublicPages({ activeTab, onGetStarted, setActiveTab }: PublicPagesProps) {
  const [mockMode, setMockMode] = useState<"cv" | "report" | "qa">("cv");
  
  // Contact state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
      alert("Inquiry successfully transmitted! Our coordinator will contact you via email shortly.");
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* LANDING PAGE VIEW */}
      {activeTab === "home" && (
        <motion.div 
          className="pb-24"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Hero Grid */}
          <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-yellow-500 mb-6 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Next-Gen Placement Management System
              </span>

              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
                Bridge the Gap Between <br />
                <span className="gold-text-gradient font-extrabold">Talent & Industry</span>
              </h1>

              <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                INSTEM is your unified terminal linking talented students, innovative businesses, and academic institutions in an elite internship management system.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-black bg-yellow-500 hover:bg-yellow-400 px-8 py-4 rounded-md font-medium text-sm transition-all shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:translate-y-0.5 cursor-pointer"
                >
                  Enter Application Platform <ArrowRight className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className="w-full sm:w-auto text-neutral-300 hover:text-white border border-neutral-800 bg-neutral-950 px-8 py-4 rounded-md font-medium text-sm transition-all hover:bg-neutral-900 cursor-pointer"
                >
                  Discover Core Pillars
                </button>
              </div>

              {/* Key Highlights Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 pt-10 border-t border-neutral-900/60 font-display">
                <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-900 text-center">
                  <p className="text-3xl font-bold text-white">94%</p>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-1">Placement Index</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-900 text-center">
                  <p className="text-3xl font-bold text-white">200+</p>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-1">Partner Corporates</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-900 text-center">
                  <p className="text-3xl font-bold text-white">12k+</p>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-1">Active Students</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-900 text-center">
                  <p className="text-3xl font-bold text-white">&lt; 2hr</p>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-1">Reporting Lead Time</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Modular Interfaces Section */}
          <section className="px-6 max-w-7xl mx-auto py-12">
            <div className="text-center mb-16">
              <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">The Central Terminal</span>
              <h2 className="text-2xl sm:text-4xl font-display font-medium text-white mt-1">Three Dedicated Portals. One Platform.</h2>
              <p className="text-neutral-500 text-sm max-w-xl mx-auto mt-2">
                Providing personalized workspaces customized entirely around your procedural workflow objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Box 1: Students */}
              <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-yellow-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                    <GraduationCap className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-3 group-hover:text-yellow-500 transition-colors">
                    For Passionate Students
                  </h3>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                    Discover handpicked technical profiles and enterprise opportunities, apply seamlessly with direct cover letters, log on-site performance hours, and compile weekly progress audits directly to your tutors.
                  </p>
                </div>
                <ul className="space-y-2.5 border-t border-neutral-900 pt-6">
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> One-click internship applies
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Unified logbook submissions
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Live role tracking dashboard
                  </li>
                </ul>
              </div>

              {/* Box 2: Companies */}
              <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-yellow-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-3 group-hover:text-yellow-500 transition-colors">
                    For Growing Partner Companies
                  </h3>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                    Advertise open internship listings with complex requirement tags, manage candidates through customizable application stages (Applied, Review, Interview, Accept), and write formal grades/feedback for student performance.
                  </p>
                </div>
                <ul className="space-y-2.5 border-t border-neutral-900 pt-6">
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Rapid Job posting & indexing
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Full Candidate pipeline management
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Progress auditing with feedback
                  </li>
                </ul>
              </div>

              {/* Box 3: Academic Schools */}
              <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-yellow-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-3 group-hover:text-yellow-500 transition-colors">
                    For Educational Oversight Tutors
                  </h3>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                    Audit deep placement indices and aggregate academic metrics, track individual student logs across distinct corporate environments, and verify formal supervisor evaluations to fulfill institutional accreditation standards.
                  </p>
                </div>
                <ul className="space-y-2.5 border-t border-neutral-900 pt-6">
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Comprehensive Placement rate aggregates
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Department performance matrices
                  </li>
                  <li className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" /> Fast log audit and PDF/CSV outputs
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Secure Monitoring Section */}
          <section className="bg-neutral-950 py-16 mt-16 border-y border-neutral-900 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <span className="text-[10px] text-yellow-500 font-mono tracking-widest uppercase">
                  Data Accuracy & Oversight
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-2 leading-tight">
                  Centralized Reporting & Verification Matrix
                </h2>
                <p className="text-neutral-400 text-xs leading-relaxed mt-4">
                  INSTEM makes it easy to fulfill accreditation standards by storing complete histories of internship roles. Keep track of approved working contracts, student log sheets, supervisor feedback, and cumulative performance scores dynamically.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="flex gap-2">
                    <Clock className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">Audit Trails</h4>
                      <p className="text-[11px] text-neutral-500">Secure chronological record for validation review Teams.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">Live Insights</h4>
                      <p className="text-[11px] text-neutral-500">Real-time stats showing placement success and job distributions.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 p-1 bg-black rounded-lg border border-neutral-800 gold-glow">
                <div className="bg-neutral-950 p-6 rounded text-left">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-900">
                    <span className="text-xs font-semibold text-white">Live Activity Stream</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-red-950 text-red-500 border border-red-900/40">● LIVE FEED</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-black rounded border border-neutral-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-neutral-200">Alex Johnson (Student)</p>
                        <p className="text-neutral-500 text-[10px]">Submitted Progress Report 4</p>
                      </div>
                      <span className="text-yellow-500 text-[10px] font-mono">11 mins ago</span>
                    </div>
                    <div className="p-3 bg-black rounded border border-neutral-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-neutral-200">Goldman Tech Solutions</p>
                        <p className="text-neutral-500 text-[10px]">Published: "Frontend Engineer Intern"</p>
                      </div>
                      <span className="text-yellow-500 text-[10px] font-mono">1 hour ago</span>
                    </div>
                    <div className="p-3 bg-black rounded border border-neutral-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-neutral-200">Dr. Robert Carter (School Auditor)</p>
                        <p className="text-neutral-500 text-[10px]">Exported Performance PDF Log</p>
                      </div>
                      <span className="text-yellow-500 text-[10px] font-mono">4 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PRESI AI INTERACTIVE PREVIEW & PRICING PLANS SECTION */}
          <section className="px-6 max-w-7xl mx-auto py-20 border-t border-neutral-900/60 text-left">
            <div className="text-center mb-16">
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] uppercase tracking-widest font-mono font-bold inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-amber-500/20 animate-pulse" /> PRESI AI Student Engine
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-medium text-white mt-3">
                Instant Academic &amp; Placement Support
              </h2>
              <p className="text-neutral-500 text-sm max-w-xl mx-auto mt-2 text-center">
                Empowering college students with localized CV building, academic Q&amp;A, and quick logs formatting. Choose a tool below to preview.
              </p>
            </div>

            {/* PRESI AI INTERACTIVE PREVIEW CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto mb-24">
              
              {/* Controls panel */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest font-bold mb-4">
                  Select Preview Tool:
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setMockMode("cv")}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-4 ${
                      mockMode === "cv"
                        ? "bg-neutral-900 border-amber-500 text-white"
                        : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
                    }`}
                  >
                    <span className={`p-2 rounded shrink-0 ${mockMode === "cv" ? "bg-amber-500/15 text-amber-500" : "bg-neutral-900 text-neutral-550"}`}>
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">Automated CV/Resume Builder</h4>
                      <p className="text-xs text-neutral-500 mt-1">Structure resume content according to industry templates.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMockMode("report")}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-4 ${
                      mockMode === "report"
                        ? "bg-neutral-900 border-amber-500 text-white"
                        : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
                    }`}
                  >
                    <span className={`p-2 rounded shrink-0 ${mockMode === "report" ? "bg-amber-500/15 text-amber-500" : "bg-neutral-900 text-neutral-550"}`}>
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">Academic Report Writer</h4>
                      <p className="text-xs text-neutral-500 mt-1">Transform work tasks lists into standard academic-grade summaries.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMockMode("qa")}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-4 ${
                      mockMode === "qa"
                        ? "bg-neutral-900 border-amber-500 text-white"
                        : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
                    }`}
                  >
                    <span className={`p-2 rounded shrink-0 ${mockMode === "qa" ? "bg-amber-500/15 text-amber-500" : "bg-neutral-900 text-neutral-550"}`}>
                      <MessageSquare className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">Educational Q&amp;A Tutor</h4>
                      <p className="text-xs text-neutral-500 mt-1">Query programming issues or Mobile Money integration rules on the fly.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Interface Card Preview */}
              <div className="lg:col-span-7 p-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 rounded-2xl shadow-xl shadow-amber-500/5">
                <div className="bg-neutral-950 rounded-xl p-6 text-left h-[380px] flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-900/60">
                    <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 uppercase font-bold">
                      <Cpu className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>PRESI Workspace: {mockMode === "cv" ? "CV Compiler Engine" : mockMode === "report" ? "Academic Summaries" : "Tutor Assistant"}</span>
                    </span>
                    <span className="px-2 py-0.5 text-[8px] bg-amber-500 text-neutral-950 font-mono rounded font-black tracking-widest uppercase">
                      VIP PREMIUM PRO</span>
                  </div>

                  <div className="flex-grow py-4 overflow-y-auto text-xs font-mono">
                    {mockMode === "cv" && (
                      <div className="space-y-4 font-sans text-neutral-300">
                        <div className="bg-neutral-900/50 p-4 rounded border border-neutral-900 text-left font-mono">
                          <p className="text-[10px] text-amber-500 mb-1 font-bold">// COMPILED RESUME OUTLINE</p>
                          <h4 className="text-sm text-white font-black uppercase">ALEX JOHNSON — DOUALA SW ENGINEER</h4>
                          <h5 className="text-[10px] text-neutral-400 uppercase tracking-widest mt-2 border-b border-neutral-850 pb-1">TECHNICAL EXPERTISE</h5>
                          <p className="text-[11px] text-neutral-300 mt-1">• Frontend state managers, Vite build tooling, React framework</p>
                          <p className="text-[11px] text-neutral-300">• Mobile money Collection Push webhooks (MTN &amp; Orange)</p>
                          <h5 className="text-[10px] text-neutral-400 uppercase tracking-widest mt-2 border-b border-neutral-850 pb-1">ACCOMPLISHED PROJECT</h5>
                          <p className="text-[11px] text-neutral-300 mt-1">**INSTEM Student Portal:** Unified secure placement rosters, tracking calendars, and localized mobile pricing triggers metrics.</p>
                        </div>
                      </div>
                    )}

                    {mockMode === "report" && (
                      <div className="space-y-4 font-sans text-neutral-300">
                        <div className="bg-neutral-900/50 p-4 rounded border border-neutral-900 text-left font-mono">
                          <p className="text-[10px] text-amber-500 mb-1 font-bold">// GENERATED LOGBOOK SUMMARY WEEK 4</p>
                          <p className="text-[11px] text-white">**Objective:** Build high-fidelity pricing sections and Mobile Money collect integrations.</p>
                          <p className="text-[11px] text-neutral-300 mt-2">**Completed Tasks:** Structured server.ts user model indices. Designed dual Midnight/Charcoal theme selectors with local persistence. Deployed robust mock checkout drawer triggering collection pushes, leading to 95% audit compliance.</p>
                          <p className="text-[11px] text-neutral-300 mt-1">**Blockers Resolved:** Overcame sandbox environment proxy limits by funneling all telecom API payloads through server endpoints.</p>
                        </div>
                      </div>
                    )}

                    {mockMode === "qa" && (
                      <div className="space-y-3 font-sans text-neutral-300 text-left">
                        <div className="flex justify-end">
                          <p className="text-[11px] text-neutral-450 bg-neutral-900 px-3 py-2 rounded-lg max-w-[85%]">"Explain Mobile Money push collections webhooks."</p>
                        </div>
                        <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-900 text-left font-mono text-[11px] leading-relaxed">
                          <p className="text-[10px] text-amber-500 font-bold mb-1">// PRESI CORE TUTOR REPLY</p>
                          <p className="text-neutral-300">When a student taps "Confirm Subscription," the platform issues a Collection Push to the provider. The handset triggers a USSD pin prompt. Once authorized, the aggregator posts a payload directly to your server:
                          <br /><span className="text-yellow-500">POST /api/webhooks/momo</span></p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={onGetStarted}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:opacity-95 text-center cursor-pointer"
                  >
                    Unlock Full PRESI AI Suite Now
                  </button>
                </div>
              </div>
            </div>

            {/* VISUALLY STRIKING PRICING GRID PORTION */}
            <div id="landing-pricing-plans" className="text-center max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Unlocking Premium Academics</span>
                <h3 className="text-2xl font-bold text-white mt-1">Affordable Educational Subscriptions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2 max-w-2xl mx-auto">
                {/* Monthly */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-8 flex flex-col justify-between text-left hover:border-neutral-800 transition-all">
                  <div>
                    <h4 className="text-base font-bold text-white">Starter Monthly Plan</h4>
                    <p className="text-[11px] text-neutral-500 mt-1">Flexible academic assistant tools</p>
                    <div className="my-6">
                      <span className="text-3xl font-black text-white">1,000</span>
                      <span className="text-xs text-neutral-500 ml-1">FCFA / month</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-neutral-450 mb-8">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Conversational AI Access</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Standard Q&amp;A and Homework</li>
                      <li className="flex items-center gap-2 text-neutral-600"><Check className="w-3.5 h-3.5 text-neutral-700" /> Professional Report writer</li>
                    </ul>
                  </div>
                  <button onClick={onGetStarted} className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-bold text-xs uppercase rounded cursor-pointer transition-all">
                    Get Started
                  </button>
                </div>

                {/* Annual */}
                <div className="bg-neutral-950 border-2 border-amber-500 rounded-xl p-8 flex flex-col justify-between text-left transform md:scale-105 shadow-xl relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 text-[8px] tracking-widest font-bold uppercase px-3 py-1 rounded">
                    Best Value
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-amber-500 flex items-center gap-1">Scholar Scholar VIP <span className="text-[9px] bg-amber-500/10 px-1 py-0.5 rounded uppercase font-bold text-amber-500">PRO</span></h4>
                    <p className="text-[11px] text-neutral-400 mt-1">Complete year acceleration</p>
                    <div className="my-6">
                      <span className="text-3xl font-black text-white">10,000</span>
                      <span className="text-xs text-neutral-400 ml-1">FCFA / year</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-neutral-300 mb-8">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Infinite AI Academic computations</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Advanced formatted CV builder</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Pro logbook compiler</li>
                    </ul>
                  </div>
                  <button onClick={onGetStarted} className="w-full py-3 bg-gradient-to-r from-blue-700 to-amber-500 text-white font-bold text-xs uppercase rounded hover:opacity-90 transition-all cursor-pointer shadow-md">
                    Upgrade to VIP Scholar
                  </button>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* ABOUT PAGE VIEW */}
      {activeTab === "about" && (
        <motion.div 
          className="max-w-4xl mx-auto py-16 px-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">Who We Are</span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mt-1">Our Core Pillars</h1>
            <p className="text-neutral-400 text-sm max-w-xl mx-auto mt-2">
              Transforming academic internships from spreadsheet chaos to smooth, trackable excellence.
            </p>
          </div>

          <div className="space-y-12 leading-relaxed">
            <div className="p-6 bg-neutral-950 border border-neutral-950 rounded-lg">
              <h2 className="text-xl font-display font-semibold text-white mb-3">1. Transparency</h2>
              <p className="text-neutral-300 text-sm">
                INSTEM replaces fragmented emails or offline printouts with a transparent digital portal. Students, company supervisors, and university mentors always share a single source of truth for all milestones.
              </p>
            </div>

            <div className="p-6 bg-neutral-950 border border-neutral-950 rounded-lg">
              <h2 className="text-xl font-display font-semibold text-white mb-3">2. Continuous Feedback loops</h2>
              <p className="text-neutral-300 text-sm">
                Skill growth happens when progress reports are submitted regularly and reviewed quickly. INSTEM's reporting system allows students to log hours and share achievements in real-time, enabling supervisors to provide immediate support.
              </p>
            </div>

            <div className="p-6 bg-neutral-950 border border-neutral-950 rounded-lg">
              <h2 className="text-xl font-display font-semibold text-white mb-3">3. Modern SaaS Philosophy</h2>
              <p className="text-neutral-300 text-sm">
                We believe software should be intuitive, fast, and secure. That's why our codebase leverages solid REST API logic, role-based controls, elegant responsive tables, and simple deployment protocols.
              </p>
            </div>

            {/* Core Project Architect Credentials */}
            <div className="p-6 bg-neutral-950 border border-yellow-500/10 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800 text-yellow-500 font-display font-bold">
                C
              </div>
              <div>
                <p className="text-xs text-yellow-500 font-mono tracking-wider uppercase">Project Catalyst</p>
                <p className="text-sm font-semibold text-white">Central African Technical Initiative</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Pioneered to streamline cooperative workflows across academic institutes in Central Africa and beyond. Contact us to pilot the framework in your department today.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CONTACT PAGE VIEW */}
      {activeTab === "contact" && (
        <motion.div 
          className="max-w-4xl mx-auto py-16 px-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">Let's Connect</span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mt-1">Contact Coordination Desk</h1>
            <p className="text-neutral-400 text-sm max-w-xl mx-auto mt-2">
              Have questions about integrating INSTEM into your university department or corporate recruitment pipeline? Send us a quick inquiry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Direct Channels</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-neutral-950 border border-neutral-900 flex items-center justify-center text-yellow-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Email Inquiry</h4>
                    <a href="mailto:lechindemmbah@gmail.com" className="text-sm font-medium text-white hover:text-yellow-500 transition-colors">
                      lechindemmbah@gmail.com
                    </a>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Average response: &lt; 24h</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-neutral-950 border border-neutral-900 flex items-center justify-center text-yellow-500 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-neutral-500 font-mono uppercase tracking-wider">WhatsApp support</h4>
                    <a 
                      href="https://wa.me/237653293486" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-medium text-white hover:text-yellow-500 transition-colors"
                    >
                      +237 653 293 486
                    </a>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Instant messaging channel</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-neutral-950 border border-neutral-900 flex items-center justify-center text-yellow-500 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Technical Hub</h4>
                    <span className="text-sm font-medium text-white">
                      INSTEM DevOps Team
                    </span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Regional Placement Coordination Portal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-lg">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Send an Inquiry</h3>
              
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 font-mono uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 font-mono uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 font-mono uppercase mb-1.5">Your Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Company">Company / Corporate Partner</option>
                    <option value="School">School Admin / Academic Tutor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 font-mono uppercase mb-1.5">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none"
                    placeholder="How can we help your team?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full flex items-center justify-center gap-2 text-black bg-yellow-500 hover:bg-yellow-400 py-3 rounded text-xs font-semibold cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitted ? "Sending Inbound Signal..." : "Transmit Message"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
