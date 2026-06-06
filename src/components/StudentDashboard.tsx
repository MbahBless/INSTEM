import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  Plus, 
  FileText, 
  ArrowUpRight, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  CheckCircle, 
  Calendar,
  Layers,
  Sparkles,
  Award,
  FileDown
} from "lucide-react";
import { User, Internship, Application, Report } from "../types";
import { generateStudentPDF } from "../utils/pdfGenerator";
import ProjectTimeline from "./ProjectTimeline";
import InternshipMap from "./InternshipMap";
import UserSettingsPanel from "./UserSettingsPanel";
import PremiumSubscription from "./PremiumSubscription";
import PresiAiAssistant from "./PresiAiAssistant";
import PresiAiDrawer from "./PresiAiDrawer";
import LechindemAvatar from "./LechindemAvatar";

interface StudentDashboardProps {
  currentUser: User;
  onAddNotification: (title: string, message: string) => void;
  onUserUpdate?: (user: User) => void;
}

export default function StudentDashboard({ currentUser, onAddNotification, onUserUpdate }: StudentDashboardProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "applications" | "reports" | "map" | "settings" | "ai_tools">("listings");
  const [studentProfile, setStudentProfile] = useState<User | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  
  // Searching & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Selected detail modal
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Submit report states
  const [showSubmitReportModal, setShowSubmitReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [reportChallenges, setReportChallenges] = useState("");
  const [reportHours, setReportHours] = useState(40);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Automated Daily Check-in Reminder Settings State
  const [daemonActive, setDaemonActive] = useState(true);
  const [isAccelerated, setIsAccelerated] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>("Never scanned");
  const [nextCheckSeconds, setNextCheckSeconds] = useState(60);
  const [showAlertBanner, setShowAlertBanner] = useState(false);

  // Keep a stable ref to reports to prevent infinite interval resets or dependencies stale/re-renders
  const reportsRef = useRef<Report[]>([]);
  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  // Scanner logic
  const runTaskCheckInScan = (force = false) => {
    if (!daemonActive && !force) return;

    const todayStr = new Date().toDateString();
    const currentReports = reportsRef.current;
    
    const loggedToday = currentReports.some(r => {
      try {
        return new Date(r.submittedAt).toDateString() === todayStr;
      } catch {
        return false;
      }
    });

    if (loggedToday) {
      setShowAlertBanner(false);
    } else {
      setShowAlertBanner(true);
      
      const lastAlertTimeKey = `last_checkin_alert_time_${currentUser.id}`;
      const lastAlertTime = localStorage.getItem(lastAlertTimeKey);
      const now = Date.now();
      
      const timeThreshold = isAccelerated ? 15000 : 3600000; // 15 seconds in accelerated mode, 1 hour in real-time mode
      const shouldNotify = !lastAlertTime || (now - parseInt(lastAlertTime) > timeThreshold);

      if (shouldNotify || force) {
        onAddNotification(
          "Task Check-in Alert",
          "Automated Warning: You haven't submitted today's progress log milestones yet. Maintain healthy project cycles and keep your advisors updated."
        );
        localStorage.setItem(lastAlertTimeKey, now.toString());
      }
    }
    setLastCheckTime(new Date().toLocaleTimeString());
  };

  // Run immediately on page mount when reports length changes
  const reportsLength = reports.length;
  useEffect(() => {
    if (!daemonActive) return;
    runTaskCheckInScan();
  }, [reportsLength, daemonActive]);

  // Recheck on recurring background interval timer
  useEffect(() => {
    if (!daemonActive) return;

    const intervalPeriod = 1000; // Update countdown tick every second
    const limit = isAccelerated ? 15 : 60; // 15s in speed mode, 60s in regular mode

    const intervalId = setInterval(() => {
      setNextCheckSeconds((prev) => {
        if (prev <= 1) {
          runTaskCheckInScan();
          return limit;
        }
        return prev - 1;
      });
    }, intervalPeriod);

    return () => clearInterval(intervalId);
  }, [daemonActive, isAccelerated]);

  useEffect(() => {
    fetchDashboardDetails();
  }, [currentUser]);

  const fetchDashboardDetails = async () => {
    setLoading(true);
    try {
      const [listingsRes, appsRes, reportsRes, profileRes] = await Promise.all([
        fetch("/api/internships"),
        fetch(`/api/applications?studentId=${currentUser.id}`),
        fetch(`/api/reports?studentId=${currentUser.id}`),
        fetch(`/api/students/${currentUser.id}`)
      ]);

      if (listingsRes.ok && appsRes.ok && reportsRes.ok) {
        const listings = await listingsRes.json();
        const apps = await appsRes.json();
        const reps = await reportsRes.json();
        setInternships(listings);
        setApplications(apps);
        setReports(reps);
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setStudentProfile(profile);
        }
      }
    } catch (err) {
      console.error("Error drawing student data stream", err);
    } finally {
      setLoading(false);
    }
  };

  // Submission handles
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;
    setIsApplying(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: selectedInternship.id,
          studentId: currentUser.id,
          coverLetter
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Application filing error.");
      }

      setApplications([data, ...applications]);
      setSelectedInternship(null);
      setCoverLetter("");
      alert(`Applied successfully to "${selectedInternship.title}"!`);
      onAddNotification(
        "Application Filed Successfully",
        `Your application for ${selectedInternship.title} is now undergoing Review.`
      );
    } catch (err: any) {
      alert(err.message || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmitProgressReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportContent) return;
    setIsSubmittingReport(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          title: reportTitle,
          content: reportContent,
          challenges: reportChallenges,
          hoursLogged: reportHours
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setReports([data, ...reports]);
      setReportTitle("");
      setReportContent("");
      setReportChallenges("");
      setReportHours(40);
      setShowSubmitReportModal(false);
      alert("Weekly log audited and transmitted successfully to coordinator!");
    } catch (err: any) {
      alert(err.message || "Error submitting log sheet.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Searching logic
  const filteredListings = internships.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || item.type === selectedType;
    let matchesLocation = true;
    if (selectedLocation) {
      if (selectedLocation === "Remote") {
        matchesLocation = item.location.toLowerCase().includes("remote") || item.type?.toLowerCase() === "remote";
      } else {
        const keywords = selectedLocation.toLowerCase().split(/[ ,/]+/);
        matchesLocation = keywords.every(kw => item.location.toLowerCase().includes(kw));
      }
    }
    return matchesSearch && matchesType && matchesLocation;
  });

  // Check if student is active (placed in an accepted role)
  const acceptedApp = applications.find(a => a.status === "ACCEPTED");

  return (
    <div className="bg-black text-white min-h-screen p-6 md:p-10">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-neutral-900">
        <div className="flex items-center gap-4">
          <LechindemAvatar className="w-16 h-16" />
          <div>
            <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">
              Active Workspace — {currentUser.department}
            </span>
            <h1 className="text-3xl font-display font-medium text-white tracking-tight mt-0.5">
              Welcome Back, <span className="gold-text-gradient font-bold">{currentUser.name}</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Student ID: <b className="text-white">{currentUser.studentId}</b>
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 rounded transition-all uppercase tracking-wider cursor-pointer font-bold shadow shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950/25 animate-pulse" />
            PRESI Sidecar AI
          </button>

          <button
            onClick={() => {
              try {
                generateStudentPDF(currentUser, applications, reports);
                onAddNotification(
                  "PDF Report Compiled",
                  `Your student workspace activity logbook summary has been compiled and downloaded.`
                );
              } catch (err) {
                console.error("PDF generation failed", err);
                alert("Failed to build PDF. Please check data sync.");
              }
            }}
            className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 text-yellow-500 rounded hover:bg-neutral-850 hover:text-yellow-400 transition-all uppercase tracking-wider cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Download PDF Report
          </button>

          {/* State Tag card */}
          <div className="flex items-center gap-2 px-4 py-2 border border-neutral-800 bg-neutral-950 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-neutral-300">
              Current Status: {acceptedApp ? (
                <span className="text-yellow-500 font-semibold uppercase">Placed at {acceptedApp.companyName}</span>
              ) : "Unplaced (Seeking Role)"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Project Timeline component */}
      <ProjectTimeline 
        currentUser={currentUser}
        applications={applications}
        reports={reports}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddNotification={onAddNotification}
      />

      {/* AUTOMATED MONITOR AND TASK CONTROLLER SECTION */}
      <div id="checkin-monitor-dashboard-card" className="mt-8 mb-6 p-5 bg-neutral-950 border border-neutral-900 rounded-lg text-left shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded border hidden sm:block ${daemonActive ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-neutral-900 border-neutral-800 text-neutral-500"}`}>
              <Clock className={`w-5 h-5 ${daemonActive && "animate-pulse"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-yellow-500 font-mono tracking-widest uppercase">
                  Automated Reminder System
                </span>
                <span className={`w-2 h-2 rounded-full ${daemonActive ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
              </div>
              <h2 className="text-base font-bold text-white mt-1">Daily Task Check-in Monitor</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-right text-xs col-span-2">
              <p className="text-neutral-500 text-[10px] uppercase font-mono">Monitor Status</p>
              <p className={daemonActive ? "text-green-500 font-bold" : "text-neutral-400 font-medium"}>
                {daemonActive ? "Active & Scanning" : "Offline / Inactive"}
              </p>
            </div>
            
            <button
              onClick={() => {
                const nextState = !daemonActive;
                setDaemonActive(nextState);
                if (!nextState) {
                  setShowAlertBanner(false);
                }
              }}
              className={`px-3 py-1.5 font-mono text-[10px] rounded border transition-all cursor-pointer ${
                daemonActive 
                  ? "bg-red-950/40 text-red-400 hover:bg-red-950 border-red-900/30" 
                  : "bg-green-950/40 text-green-400 hover:bg-green-950 border-green-900/30"
              }`}
            >
              {daemonActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Status Metric Panel */}
          <div className="p-4 bg-black border border-neutral-900/60 rounded flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-neutral-500 font-mono uppercase block">Logged Progress Today</span>
              {reports.some(r => new Date(r.submittedAt).toDateString() === new Date().toDateString()) ? (
                <div className="mt-2 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-semibold">Logged & Completed</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
                  <span className="text-xs font-semibold">Pending Entry</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-neutral-550 leading-normal mt-3 font-sans">
              Monitors the local reporting database on an active interval cycle to keep placement credentials continuous.
            </p>
          </div>

          {/* Background Run Telemetry */}
          <div className="p-4 bg-black border border-neutral-900/60 rounded flex flex-col justify-between font-mono text-[11px] text-neutral-400 space-y-2">
            <div>
              <span className="text-[9px] text-neutral-500 uppercase block mb-1">Background Runner Settings</span>
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span>Last Scanned:</span>
                  <span className="text-white font-medium">{lastCheckTime}</span>
                </p>
                <p className="flex justify-between">
                  <span>Heartbeat Check:</span>
                  <span className="text-yellow-500 font-medium">In {nextCheckSeconds}s</span>
                </p>
                <p className="flex justify-between">
                  <span>Mode:</span>
                  <span className={isAccelerated ? "text-yellow-500 font-bold" : "text-neutral-400"}>
                    {isAccelerated ? "Simulated Day Cycle" : "Real-Time 24H"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-neutral-900/40">
              <button
                onClick={() => {
                  const targetAcc = !isAccelerated;
                  setIsAccelerated(targetAcc);
                  setNextCheckSeconds(targetAcc ? 15 : 60);
                }}
                className={`flex-1 py-1 px-2 text-[9px] font-semibold border rounded transition-colors text-center cursor-pointer ${
                  isAccelerated 
                    ? "bg-yellow-500 text-black border-yellow-400" 
                    : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850"
                }`}
                title="Accelerates the time loop to fire mock check-ins speedier for testing"
              >
                {isAccelerated ? "Real 24h Mode" : "Accelerated Demo Timer"}
              </button>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-4 bg-black border border-neutral-900/60 rounded flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-neutral-500 font-mono uppercase block mb-2">Simulate Alarm System</span>
              <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                Trigger manual actions or force background scanner processes immediately to verify that warning prompts, modals, and push notifications work.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => runTaskCheckInScan(true)}
                disabled={!daemonActive}
                className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition-colors ${
                  !daemonActive 
                    ? "bg-neutral-900 border border-neutral-950 text-neutral-600 cursor-not-allowed" 
                    : "bg-neutral-900 hover:bg-neutral-850 text-yellow-500 border border-yellow-500/10"
                }`}
              >
                Force Run Scan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL SKILLS & PORTFOLIO ANALYTICS MATRIX */}
      {((studentProfile?.endorsedSkills && studentProfile.endorsedSkills.length > 0) || studentProfile?.projectCompleted) && (
        <div id="skills-analytics-matrix" className="mt-8 mb-10 p-6 bg-neutral-950 border border-neutral-900 rounded-lg text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-neutral-900">
            <div>
              <span className="text-[10px] text-yellow-500 font-mono tracking-widest uppercase">
                Academic Portfolio & Mentor Endorsements
              </span>
              <h2 className="text-lg font-bold text-white mt-1">Verified Skill Stack Analytics</h2>
            </div>
            
            {studentProfile?.projectCompleted && (
              <div className="px-3 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-mono font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Placement Project Fully Certified Complete</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Overall Completion stats */}
            <div className="p-4 bg-black border border-neutral-900 rounded">
              <span className="text-[9px] text-neutral-500 font-mono uppercase block mb-1">Project Milestone Details</span>
              {studentProfile?.projectCompleted ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase">{studentProfile.projectTitle || "Decoupled Feature Dashboard Placement"}</h4>
                  <p className="text-[11px] text-neutral-400">
                    Your supervising corporate mentors have evaluated all core criteria and submitted complete endorsement signatures.
                  </p>
                  <p className="text-[10px] text-neutral-550 font-mono">
                    Certified on: {new Date(studentProfile.projectCompletedDate || "").toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">Project is currently in active progression. Check your Milestone Timeline above for core metrics.</p>
              )}
            </div>

            {/* Column 2: Specific certified skills lists */}
            <div className="p-4 bg-black border border-neutral-900 rounded select-none md:col-span-2">
              <span className="text-[9px] text-neutral-500 font-mono uppercase block mb-3">Skills Endorsement Matrix</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentProfile?.endorsedSkills?.map((s, idx) => {
                  const pct = Math.max(50, 95 - (idx * 8));
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded bg-neutral-950 border border-neutral-900">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-yellow-500">{s.skill}</span>
                        <span className="text-[9px] font-mono text-neutral-400">Level: {pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono block mt-1">Certified by: {s.endorsedBy} ({s.companyName})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list navigation */}
      <div className="flex border-b border-neutral-900 mb-8 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "listings" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "listings" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Open Internships
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "applications" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "applications" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          My Applications ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "reports" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "reports" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Logbook Logs ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "map" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "map" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Geography Map
        </button>

        <button
          onClick={() => setActiveTab("ai_tools")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative flex items-center gap-1.5 ${
            activeTab === "ai_tools" ? "text-amber-500 font-bold animate-pulse" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "ai_tools" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span>PRESI AI Tools</span>
          {!currentUser.isPremium && (
            <span className="px-1 py-0.5 rounded bg-gradient-to-r from-blue-700 to-amber-500 text-white font-mono text-[8px] uppercase font-black tracking-wider leading-none">
              VIP
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "settings" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "settings" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Security Settings
        </button>
      </div>

      {/* Automated Daily Task Check-in Action Warning Banner */}
      {showAlertBanner && (
        <div id="checkin-warning-alert-banner" className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-bold">Unsubmitted Milestones Entry</p>
              <h4 className="text-sm font-semibold text-white mt-0.5">Automated Daily Check-in Alert: Progress Log Needed</h4>
              <p className="text-xs text-neutral-450 mt-1">Our automated recurring background process has flagged that your progress milestones for today are not documented yet. Log your hours to maintain compliant placement analytics.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("reports");
              setShowSubmitReportModal(true);
            }}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs rounded transition-all uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Log Progress Now
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          <p className="text-xs text-neutral-400 font-mono">Syncing corporate stream database...</p>
        </div>
      ) : (
        <>
          {/* LISTINGS TAB */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {/* Filter utilities */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-neutral-900/40">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search roles, skill keywords, or company names..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-2 self-end">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase">Filter:</span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {filteredListings.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">No Matching Internships Found</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Try updating your keys or experiencing other domains to unlock more professional listings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((job) => {
                    const applied = applications.some((val) => val.internshipId === job.id);
                    return (
                      <div 
                        key={job.id}
                        className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-yellow-500/20 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-yellow-500 uppercase tracking-widest">
                              {job.type}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500">{job.duration}</span>
                          </div>

                          <h3 className="text-base font-semibold text-white group-hover:text-yellow-500 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-neutral-400 font-medium mb-4 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                            {job.companyName}
                          </p>

                          <p className="text-xs text-neutral-400 line-clamp-3 mb-6 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-900 pt-4 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </span>
                            <span className="flex items-center gap-0.5 text-white font-semibold">
                              <DollarSign className="w-3.5 h-3.5 text-yellow-500" /> {job.stipend}
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedInternship(job)}
                            className={`w-full py-2 rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                              applied 
                                ? "bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed" 
                                : "bg-neutral-900 text-yellow-500 hover:text-black hover:bg-yellow-500 border border-yellow-500/10"
                            }`}
                            disabled={applied}
                          >
                            {applied ? "Applied" : "View Application Matrix"}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              {applications.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">No Application Ledgers Filled</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your active queue is empty. Browse standard listings and file your initial application to get started.
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-900 bg-black/40">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Application Pipeline Tracker</h3>
                  </div>
                  <div className="divide-y divide-neutral-900">
                    {applications.map((app) => (
                      <div key={app.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <h4 className="text-base font-semibold text-white">{app.internshipTitle}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                            <span className="font-medium text-white">{app.companyName}</span>
                            <span className="font-mono text-neutral-500">Filed: {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                          {app.feedback && (
                            <div className="mt-2 p-2 bg-black border border-neutral-900 text-[11px] text-neutral-400 rounded max-w-lg">
                              <span className="text-yellow-500 font-bold">Feedback:</span> {app.feedback}
                            </div>
                          )}
                        </div>

                        {/* Interactive Steps workflow visualization */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900">
                            {app.status === "ACCEPTED" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-green-950 text-green-500 rounded border border-green-900/30 uppercase tracking-widest font-bold">
                                Accepted & Placed
                              </span>
                            )}
                            {app.status === "REJECTED" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-red-950 text-red-500 rounded border border-red-900/30 uppercase tracking-widest font-bold">
                                Completed Archive
                              </span>
                            )}
                            {app.status !== "ACCEPTED" && app.status !== "REJECTED" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-yellow-950 text-yellow-500 rounded border border-yellow-900/30 uppercase tracking-widest font-bold">
                                {app.status}
                              </span>
                            )}
                          </div>

                          {/* Visual Step indicators */}
                          <div className="flex items-center gap-1 text-[10px] font-mono bg-black p-1 rounded border border-neutral-900">
                            <span className={`px-2 py-0.5 rounded ${app.status === "APPLIED" ? "bg-neutral-800 text-yellow-500 font-bold" : "text-neutral-600"}`}>1. Applied</span>
                            <span className="text-neutral-700">→</span>
                            <span className={`px-2 py-0.5 rounded ${app.status === "UNDER_REVIEW" ? "bg-neutral-800 text-yellow-500 font-bold" : "text-neutral-600"}`}>2. Review</span>
                            <span className="text-neutral-700">→</span>
                            <span className={`px-2 py-0.5 rounded ${app.status === "INTERVIEWING" ? "bg-neutral-800 text-yellow-500 font-bold" : "text-neutral-600"}`}>3. Interview</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Report header controls */}
              <div className="flex justify-between items-center pb-4 border-b border-neutral-900/40">
                <div>
                  <h3 className="text-base font-semibold text-white">Cumulative Student Logbook</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Submit daily milestones and log working hours securely for oversight audits.</p>
                </div>

                <button
                  onClick={() => setShowSubmitReportModal(true)}
                  className="flex items-center gap-1.5 text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2.5 rounded font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Log Weekly Report
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">Logbook is Empty</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Keep your mentors updated! Click "Log Weekly Report" to document hours and key software design breakthroughs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col justify-between">
                      <div>
                        {/* Header status */}
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-900">
                          <div>
                            <span className="text-xs font-mono font-bold text-neutral-400 block">{rep.title}</span>
                            <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">Hours: {rep.hoursLogged} hrs logged</span>
                          </div>
                          
                          <div>
                            {rep.status === "APPROVED" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-green-950 text-green-500 rounded border border-green-900/30 uppercase tracking-widest font-bold">
                                Approved
                              </span>
                            )}
                            {rep.status === "PENDING" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-yellow-950 text-yellow-500 rounded border border-yellow-900/30 uppercase tracking-widest font-bold font-mono">
                                Pending Audit
                              </span>
                            )}
                            {rep.status === "REVISION_REQUESTED" && (
                              <span className="px-2 py-0.5 text-[9px] font-mono bg-red-950 text-red-500 rounded border border-red-900/30 uppercase tracking-widest font-bold">
                                Revision Needed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">1. Weekly Accomplishments</span>
                            <p className="text-xs text-neutral-300 leading-relaxed mt-1">{rep.content}</p>
                          </div>
                          
                          <div>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">2. Blockers & Technical Challenges</span>
                            <p className="text-xs text-neutral-400 leading-relaxed mt-1">{rep.challenges}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer evaluation (Grades / Feedbacks) */}
                      <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-between items-center bg-black/40 p-4 rounded border border-neutral-900/60">
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase font-mono block">Oversight Evaluator</span>
                          <span className="text-xs font-semibold text-neutral-300 block">{rep.companyName}</span>
                          {rep.feedback && (
                            <p className="text-[11px] text-neutral-400 italic mt-1 font-sans">
                              "{rep.feedback}"
                            </p>
                          )}
                        </div>
                        
                        {rep.grade && (
                          <div className="text-center px-4 border-l border-neutral-900">
                            <span className="text-[9px] text-neutral-500 uppercase font-mono block">Grade</span>
                            <span className="text-2xl font-display font-black text-yellow-500 tracking-tighter block">{rep.grade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GEOGRAPHY MAP TAB */}
          {activeTab === "map" && (
            <div className="space-y-8">
              <InternshipMap 
                internships={internships} 
                onSelectLocation={(loc) => setSelectedLocation(loc)} 
                selectedLocation={selectedLocation} 
              />
              
              {/* Filtered jobs matching selected map location */}
              <div id="geographic-results" className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span>
                      {selectedLocation 
                        ? `Opportunities in "${selectedLocation}" (${filteredListings.length})` 
                        : `All Regional Opportunities (${internships.length})`}
                    </span>
                  </h3>
                  {selectedLocation && (
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-xs font-mono text-yellow-500 hover:underline cursor-pointer"
                    >
                      Clear Geographic Filter
                    </button>
                  )}
                </div>

                {filteredListings.length === 0 ? (
                  <div className="py-12 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">No matching jobs in this location. Select another node above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((job) => {
                      const applied = applications.some((val) => val.internshipId === job.id);
                      return (
                        <div 
                          key={job.id}
                          className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-yellow-500/20 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-yellow-500 uppercase tracking-widest">
                                {job.type}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-500">{job.duration}</span>
                            </div>

                            <h3 className="text-base font-semibold text-white group-hover:text-yellow-500 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-xs text-neutral-400 font-medium mb-4 flex items-center gap-1.5 mt-1">
                              <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                              {job.companyName}
                            </p>

                            <p className="text-xs text-neutral-400 line-clamp-3 mb-6 leading-relaxed">
                              {job.description}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-900 pt-4 mb-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                              </span>
                              <span className="flex items-center gap-0.5 text-white font-semibold">
                                <DollarSign className="w-3.5 h-3.5 text-yellow-500" /> {job.stipend}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedInternship(job);
                              }}
                              className={`w-full py-2 rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                applied 
                                  ? "bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed" 
                                  : "bg-neutral-900 text-yellow-500 hover:text-black hover:bg-yellow-500 border border-yellow-500/10"
                              }`}
                              disabled={applied}
                            >
                              {applied ? "Applied" : "View Application Matrix"}
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USER PROFILE SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <UserSettingsPanel 
                currentUser={currentUser} 
                onAddNotification={onAddNotification} 
                onSettingsSaved={onUserUpdate}
              />
            </div>
          )}

          {/* PRESI AI TOOLS TAB */}
          {activeTab === "ai_tools" && (
            <div className="space-y-6">
              {!currentUser.isPremium ? (
                <PremiumSubscription 
                  currentUser={currentUser} 
                  onSubscribed={(updatedUser) => {
                    if (onUserUpdate) {
                      onUserUpdate(updatedUser);
                    }
                  }}
                  onAddNotification={onAddNotification} 
                />
              ) : (
                <PresiAiAssistant 
                  currentUser={currentUser} 
                  onAddNotification={onAddNotification} 
                />
              )}
            </div>
          )}
        </>
      )}

      {/* DETAIL DRAWER / SUBMIT APPLICATION MODAL */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl h-full bg-neutral-950 border-l border-neutral-800 p-8 overflow-y-auto text-left shadow-2xl animate-slideLeft flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-neutral-950 pb-4">
                <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">
                  Filing Application Matrix
                </span>
                <button 
                  onClick={() => setSelectedInternship(null)}
                  className="text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-900 border border-neutral-850 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white leading-normal">{selectedInternship.title}</h2>
                  <p className="text-sm font-semibold text-yellow-500 mt-1">{selectedInternship.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black p-4 rounded border border-neutral-900 text-xs text-neutral-400 font-mono">
                  <p>Location: <b className="text-white">{selectedInternship.location}</b></p>
                  <p>Type: <b className="text-white">{selectedInternship.type}</b></p>
                  <p>Duration: <b className="text-white">{selectedInternship.duration}</b></p>
                  <p>Stipend: <b className="text-yellow-500 font-black">{selectedInternship.stipend}</b></p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white uppercase mb-2">Scope of Objectives</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{selectedInternship.description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white uppercase mb-2">Technical Prerequisite Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.requirements.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-[10px] text-yellow-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover letter form */}
                <form id="app-form" onSubmit={handleApply} className="pt-4 border-t border-neutral-900">
                  <label className="block text-[11px] text-neutral-400 font-mono uppercase mb-2">
                    Inbound Pitch / Cover Letter
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe why you are perfect for this role. What relevant software modules, frameworks, of projects have you deployed?"
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none font-sans leading-relaxed"
                  />
                </form>
              </div>
            </div>

            <button
              type="submit"
              form="app-form"
              disabled={isApplying}
              className="w-full text-black bg-yellow-500 hover:bg-yellow-400 py-3 rounded text-xs font-bold uppercase tracking-wider mt-6 cursor-pointer"
            >
              {isApplying ? "Filing application..." : "Submit File to Recruiter"}
            </button>
          </div>
        </div>
      )}

      {/* NEW PROGRESS REPORT MODAL */}
      {showSubmitReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden text-left relative">
            <button
              onClick={() => setShowSubmitReportModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              ✕
            </button>
            <div className="p-8">
              <h2 className="text-xl font-display font-semibold text-white mb-2">Log Progress Milestones</h2>
              <p className="text-xs text-neutral-400 mb-6 font-mono">WEEKLY PROGRESS REPORT PACKET</p>
              
              <form onSubmit={handleSubmitProgressReport} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Report Title</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Week 4: Frontent views & state decoupling"
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Hours Logged</label>
                    <input
                      type="number"
                      required
                      value={reportHours}
                      onChange={(e) => setReportHours(parseInt(e.target.value) || 0)}
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Status Code</label>
                    <div className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-400 font-mono">
                      PENDING REVIEW
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1 font-mono">1. Weekly Tasks completed</label>
                  <textarea
                    required
                    rows={4}
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    placeholder="Outline key tasks, PRs merged, databases modeled, of systems verified."
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1 font-mono">2. Obstacles Faced / Technical help Needed</label>
                  <textarea
                    rows={2}
                    value={reportChallenges}
                    onChange={(e) => setReportChallenges(e.target.value)}
                    placeholder="Detail any complex bugs, build errors, of resource blocks."
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full text-black bg-yellow-500 hover:bg-yellow-400 py-2.5 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {isSubmittingReport ? "Transmitting state..." : "Transmit Log to Coordinator"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating PRESI AI Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-neutral-950 font-black rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all ease-out duration-300 scale-100 hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/20"
        >
          <Sparkles className="w-4 h-4 fill-neutral-950/20 animate-pulse text-neutral-950" />
          <span className="text-xs font-display font-black tracking-wider uppercase">PRESI AI Assistant</span>
        </button>
      </div>

      {/* Slide-out Sidecar AI Drawer */}
      <PresiAiDrawer
        currentUser={currentUser}
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onAddNotification={onAddNotification}
        onUpgradeTrigger={() => setActiveTab("ai_tools")}
      />
    </div>
  );
}
