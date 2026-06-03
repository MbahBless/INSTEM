import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Award, 
  Sparkles, 
  CheckSquare, 
  Square,
  Building,
  Info,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { User, Application, Report } from "../types";

interface Milestone {
  id: number;
  title: string;
  deadlineLabel: string;
  estimatedDate: string;
  description: string;
  category: "Setup" | "Design" | "Development" | "Testing" | "Evaluation" | "Prep" | "Search" | "Interview" | "Onboarding";
  deliverables: { text: string; done: boolean }[];
  actionRequired?: string;
  requiredReportCount?: number;
}

interface ProjectTimelineProps {
  currentUser: User;
  applications: Application[];
  reports: Report[];
  onTabChange?: (tab: "listings" | "applications" | "reports") => void;
  onAddNotification?: (title: string, message: string) => void;
}

export default function ProjectTimeline({ 
  currentUser, 
  applications, 
  reports,
  onTabChange,
  onAddNotification
}: ProjectTimelineProps) {
  // Check if student has been placed/accepted
  const acceptedApp = applications.find(a => a.status === "ACCEPTED");
  const isPlaced = !!acceptedApp;

  // Predefined Milestones Database for PLACED students
  const placedMilestones: Milestone[] = [
    {
      id: 1,
      category: "Setup",
      title: "Onboarding & Sandbox Configuration",
      deadlineLabel: "End of Week 1",
      estimatedDate: "June 10, 2026",
      description: "Complete supervisor introductory meetings, sign institutional NDAs, configure server security configurations, and run local code workspaces.",
      deliverables: [
        { text: "Workspace Sandbox initialization on port 3000 verified", done: true },
        { text: "Corporate code repository synchronization complete", done: true },
        { text: "Academic orientation checklist filed", done: true }
      ],
      actionRequired: "Confirm Git push with supervisor"
    },
    {
      id: 2,
      category: "Design",
      title: "Architecture Draft & Relational Schema",
      deadlineLabel: "End of Week 4",
      estimatedDate: "July 01, 2026",
      description: "Draft structural software specs. Define SQL schemas or Firestore collection hierarchies. Verify structural endpoint logic before heavy coding steps.",
      deliverables: [
        { text: "Architectural diagram submitted to team dashboard", done: false },
        { text: "API endpoint specifications finalized", done: false },
        { text: "First monthly appraisal logged to coordinator", done: false }
      ],
      requiredReportCount: 2
    },
    {
      id: 3,
      category: "Development",
      title: "Core Feature Dev & Decoupling",
      deadlineLabel: "End of Week 12",
      estimatedDate: "Aug 26, 2026",
      description: "Deconstruct the monolithic codebase into highly encapsulated visual components and APIs. Build reactive dashboard models with persistent storage adapters.",
      deliverables: [
        { text: "Visual metrics tables & real-time analytics wired", done: false },
        { text: "Strict role auth checks validated client-side", done: false },
        { text: "Weekly progress journals up to date in cumulative logbook", done: false }
      ],
      requiredReportCount: 4
    },
    {
      id: 4,
      category: "Testing",
      title: "Security Auditing & Clean Build",
      deadlineLabel: "End of Week 18",
      estimatedDate: "Oct 07, 2026",
      description: "Run performance metrics and linters to prevent memory leaks and redundant re-renders. Verify PDF compiling outputs and safe document downloads.",
      deliverables: [
        { text: "Linter validations showing zero strict syntax bottlenecks", done: false },
        { text: "PDF export layout with cryptographic watermark fully styled", done: false },
        { text: "Beta performance stress testing passed", done: false }
      ],
      actionRequired: "Clean build verification run with team"
    },
    {
      id: 5,
      category: "Evaluation",
      title: "Final Assessment & Dean Review",
      deadlineLabel: "End of Week 24",
      estimatedDate: "Nov 18, 2026",
      description: "Complete formal internship exit surveys, verify supervisor grade evaluations, compile signed academic credentials, and obtain placement certification.",
      deliverables: [
        { text: "Placement summary record verified & downloaded to PDF", done: false },
        { text: "Evaluator performance grade matching academic criteria", done: false },
        { text: "Dean final sign-off complete", done: false }
      ]
    }
  ];

  // Predefined Milestones Database for SEEKING students
  const seekingMilestones: Milestone[] = [
    {
      id: 1,
      category: "Prep",
      title: "Dossier Verification & Portal Setup",
      deadlineLabel: "Day 3 of Term",
      estimatedDate: "June 06, 2026",
      description: "Ensure your registrar-approved Student ID is active, verify matching department listings, and confirm security certificates are synced.",
      deliverables: [
        { text: "Student ID (e.g. SE-2024-089) synced successfully", done: true },
        { text: "Academic major coordinates correct in portal context", done: true }
      ]
    },
    {
      id: 2,
      category: "Search",
      title: "Internship Ads Keywords Matching",
      deadlineLabel: "Day 7 of Term",
      estimatedDate: "June 10, 2026",
      description: "Query recruitment campaigns using specific tech stack selectors (React, Node, SQL). Bookmark high-priority roles offering robust technical mentoring.",
      deliverables: [
        { text: "First keyword search in internship registers successfully made", done: true },
        { text: "Filtered bookmarks database compiled with at least 3 companies", done: false }
      ],
      actionRequired: "Bookmark target advertising boards"
    },
    {
      id: 3,
      category: "Prep",
      title: "Application Filing & Pipeline Push",
      deadlineLabel: "Day 14 of Term",
      estimatedDate: "June 17, 2026",
      description: "Frame personalized cover letters detailing deployed modules. Transmit credentials to recruitment partner queues for screening assessment.",
      deliverables: [
        { text: "Polished cover letter focusing on react/tailwind completed", done: false },
        { text: "At least 1 active job application successfully submitted", done: false }
      ],
      actionRequired: "Transmit application via portal"
    },
    {
      id: 4,
      category: "Interview",
      title: "Technical Assesment & Recruitment Board",
      deadlineLabel: "Day 28 of Term",
      estimatedDate: "July 01, 2026",
      description: "Settle live video panels and coding challenges. Verify salary/stipend indices, remote policies, and weekly duration bounds before binding lock.",
      deliverables: [
        { text: "Practice system architectural design frameworks", done: false },
        { text: "Track recruiter review logs & respond to coordination notes", done: false }
      ]
    },
    {
      id: 5,
      category: "Onboarding",
      title: "Contract Binding & Registrar Lock",
      deadlineLabel: "Day 42 of Term",
      estimatedDate: "July 15, 2026",
      description: "Upon receiving official recruitment letters, lock matching coordinator signatures and register on-site workspace keys.",
      deliverables: [
        { text: "ACCEPTED contract updated to placement index", done: false },
        { text: "Authorized supervisor matched for weekly appraisal logs", done: false }
      ]
    }
  ];

  const milestones: Milestone[] = isPlaced ? placedMilestones : seekingMilestones;

  // Selected active milestone to show details for (default to first uncompleted or last)
  const [selectedId, setSelectedId] = useState<number>(1);
  const [customDeliverables, setCustomDeliverables] = useState<Record<string, boolean>>({});

  // Dynamic automatic completion overrides based on active state:
  useEffect(() => {
    // Let's populate default statuses or trigger adjustments has student completed things?
    const initialCheckState: Record<string, boolean> = {};
    
    milestones.forEach(m => {
      m.deliverables.forEach(d => {
        const key = `${m.id}-${d.text}`;
        initialCheckState[key] = d.done;
      });
    });

    // Dynamically check real achievements:
    if (isPlaced) {
      // Milestone 1 deliverables auto-passed if placed
      initialCheckState[`1-${milestones[0].deliverables[0].text}`] = true;
      initialCheckState[`1-${milestones[0].deliverables[1].text}`] = true;
      initialCheckState[`1-${milestones[0].deliverables[2].text}`] = true;

      // Milestone 2 deliverables: if they have at least 1 weekly logbook reports
      if (reports.length >= 1) {
        initialCheckState[`2-First monthly appraisal logged to coordinator`] = true;
      }
      // Milestone 3: if reports are 2+
      if (reports.length >= 2) {
        initialCheckState[`3-Weekly progress journals up to date in cumulative logbook`] = true;
      }
      // Milestone 5: if any report is approved or we have A/B grade evaluated
      const graded = reports.some(r => !!r.grade);
      if (graded) {
        initialCheckState[`5-Evaluator performance grade matching academic criteria`] = true;
      }
    } else {
      // Seeking flow:
      // Milestone 1: Done because they have logged in and their Student ID exists
      if (currentUser.studentId) {
        initialCheckState[`1-Student ID (e.g. SE-2024-089) synced successfully`] = true;
        initialCheckState[`1-Academic major coordinates correct in portal context`] = true;
      }
      // Milestone 2: Done if they have searched or internships length has loaded
      initialCheckState[`2-First keyword search in internship registers successfully made`] = true;
      if (applications.length > 0) {
        initialCheckState[`2-Filtered bookmarks database compiled with at least 3 companies`] = true;
      }
      // Milestone 3: Done if applications.length > 0
      if (applications.length > 0) {
        initialCheckState[`3-At least 1 active job application successfully submitted`] = true;
        initialCheckState[`3-Polished cover letter focusing on react/tailwind completed`] = true;
      }
      // Milestone 4: Done if they are under review or interviewing
      const reviewing = applications.some(a => a.status === "UNDER_REVIEW" || a.status === "INTERVIEWING");
      if (reviewing) {
        initialCheckState[`4-Track recruiter review logs & respond to coordination notes`] = true;
      }
    }

    setCustomDeliverables(initialCheckState);

    // Set default selected milestone based on student progression
    if (isPlaced) {
      if (reports.length === 0) setSelectedId(2); // needs reports
      else if (reports.length === 1) setSelectedId(3); // dev tab
      else if (reports.length > 1 && !reports.some(r => !!r.grade)) setSelectedId(4); // audits
      else setSelectedId(5); // completion
    } else {
      if (applications.length === 0) setSelectedId(2);
      else if (applications.length > 0 && !applications.some(a => a.status === "INTERVIEWING")) setSelectedId(3);
      else setSelectedId(4);
    }
  }, [isPlaced, reports, applications, currentUser]);

  const toggleDeliverable = (milestoneId: number, text: string) => {
    const key = `${milestoneId}-${text}`;
    const nextState = !customDeliverables[key];
    setCustomDeliverables(prev => ({
      ...prev,
      [key]: nextState
    }));

    if (onAddNotification) {
      if (nextState) {
        onAddNotification(
          "Milestone Objective Checked",
          `Completed: "${text}" has been successfully logged inside sandbox cache registry.`
        );
      } else {
        onAddNotification(
          "Milestone Objective Reset",
          `Restored: "${text}" has been marked back to pending audit.`
        );
      }
    }
  };

  // Helper properties per milestone
  const getMilestoneStatus = (id: number) => {
    const m = milestones.find(item => item.id === id);
    if (!m) return "Upcoming";

    const mDeliverables = m.deliverables;
    const allDone = mDeliverables.every(d => customDeliverables[`${id}-${d.text}`]);
    const someDone = mDeliverables.some(d => customDeliverables[`${id}-${d.text}`]);

    if (allDone) return "Completed";
    if (someDone || selectedId === id) return "In Progress";
    return "Upcoming";
  };

  const getMilestoneProgress = (id: number) => {
    const m = milestones.find(item => item.id === id);
    if (!m) return 0;
    const doneCount = m.deliverables.filter(d => customDeliverables[`${id}-${d.text}`]).length;
    return Math.round((doneCount / m.deliverables.length) * 100);
  };

  const activeMilestone = milestones.find(m => m.id === selectedId) || milestones[0];
  const activeStatus = getMilestoneStatus(selectedId);
  const activeProgress = getMilestoneProgress(selectedId);

  // Overall Timeline completion percentage:
  const totalDeliverables = milestones.reduce((sum, m) => sum + m.deliverables.length, 0);
  const totalCompleted = milestones.reduce((sum, m) => {
    return sum + m.deliverables.filter(d => customDeliverables[`${m.id}-${d.text}`]).length;
  }, 0);
  const overallProgress = Math.round((totalCompleted / totalDeliverables) * 100);

  return (
    <div id="project-timeline" className="mb-10 bg-neutral-950 border border-neutral-900 rounded-lg p-6 md:p-8 gold-glow">
      
      {/* Box Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-mono uppercase tracking-wider font-semibold border border-yellow-500/20">
              Interactive Tool
            </span>
            <span className="text-xs text-neutral-400 font-mono">WORKSPACE CHRONOLOGY</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white mt-1.5 flex items-center gap-2">
            Placement & Internship Milestone Timeline
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isPlaced ? (
              <span>Tracking live assignments with coordinator <b className="text-white">{acceptedApp.companyName}</b>. Keep logbooks current against predefined contract guidelines.</span>
            ) : (
              <span>Your search framework guidelines. Transition steps from seekers ledger to placed status.</span>
            )}
          </p>
        </div>

        {/* Dynamic percentage counter badge */}
        <div className="flex items-center gap-4 bg-black border border-neutral-800 p-3 rounded-lg self-stretch sm:self-auto">
          <div className="text-left">
            <div className="text-[9px] text-neutral-500 font-mono uppercase leading-none">CURRICULUM COMPLETE</div>
            <div className="text-xl font-display font-black text-yellow-500 tracking-tighter mt-1">{overallProgress}%</div>
          </div>
          <div className="w-16 h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      {/* HORIZONTAL STEP INDICATOR VISUAL */}
      <div className="relative mb-10 mt-6 px-1 lg:px-4">
        {/* Underlying Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-900 -translate-y-1/2 z-0" />
        
        {/* Progress Fill Connector Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${Math.max(0, Math.min(100, ((selectedId - 1) / (milestones.length - 1)) * 100))}%` }}
        />

        {/* Milestones Horizontal Array */}
        <div className="flex justify-between items-center relative z-10">
          {milestones.map((m, index) => {
            const mStatus = getMilestoneStatus(m.id);
            const mProgress = getMilestoneProgress(m.id);
            const isSelected = selectedId === m.id;
            
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex flex-col items-center group focus:outline-none cursor-pointer"
                style={{ width: `${100 / milestones.length}%` }}
              >
                {/* Visual Circle Node */}
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-350 border ${
                  isSelected 
                    ? "bg-yellow-500 text-black border-yellow-400 scale-110 shadow-lg shadow-yellow-500/20" 
                    : mStatus === "Completed"
                      ? "bg-black text-yellow-500 border-yellow-500/80 hover:border-yellow-400"
                      : mStatus === "In Progress"
                        ? "bg-neutral-900 text-yellow-500/80 border-yellow-500/30 hover:border-yellow-500/60"
                        : "bg-black text-neutral-600 border-neutral-900 hover:border-neutral-800"
                }`}>
                  {mStatus === "Completed" ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <span className="font-mono text-xs sm:text-sm font-bold">{m.id}</span>
                  )}
                </div>

                {/* Shorthand Label */}
                <span className={`text-[10px] sm:text-xs font-medium text-center mt-3 max-w-[80px] sm:max-w-[120px] line-clamp-1 transition-colors ${
                  isSelected ? "text-yellow-500 font-bold" : "text-neutral-400 group-hover:text-neutral-200"
                }`}>
                  {m.title.split(" & ")[0]}
                </span>

                {/* Deadlines Stamp */}
                <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 group-hover:text-neutral-400 mt-1 transition-colors">
                  {m.deadlineLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE MILESTONE DETAIL CARD DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-black border border-neutral-900 rounded-lg p-5 md:p-6">
        
        {/* Left Side: Summary and deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
              Stage {activeMilestone.id} — {activeMilestone.category}
            </span>
            
            <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Deadline: {activeMilestone.deadlineLabel} ({activeMilestone.estimatedDate})</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              {activeMilestone.title}
              {activeStatus === "Completed" && <CheckCircle2 className="text-green-500 w-4 h-4 inline" />}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              {activeMilestone.description}
            </p>
          </div>

          {/* Action alerts / Prompt checks */}
          {activeStatus !== "Completed" && (activeMilestone.actionRequired || activeMilestone.requiredReportCount) && (
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-md flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-neutral-300">
                <span className="font-bold text-yellow-500 uppercase font-mono tracking-wider">Milestone Requirement: &nbsp;</span>
                {activeMilestone.actionRequired ? (
                  <span>{activeMilestone.actionRequired}</span>
                ) : (
                  <span>Submit at least <b className="text-white font-semibold font-mono">{activeMilestone.requiredReportCount} weekly logs</b> in your Logbook system to verify. Current logs submitted: <b className="text-white font-mono">{reports.length}</b>.</span>
                )}
              </div>
            </div>
          )}

          {/* Prompt action hooks */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            {!isPlaced && onTabChange && (
              <button 
                onClick={() => onTabChange("listings")}
                className="text-[10px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900/60 hover:border-yellow-500/30 text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <span>Browse Internship Ads</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            
            {isPlaced && onTabChange && (
              <button 
                onClick={() => onTabChange("reports")}
                className="text-[10px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900/60 hover:border-yellow-500/30 text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <span>Update Weekly Logbook</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            {isPlaced && activeMilestone.id === 5 && (
              <div className="text-[10px] text-neutral-500 flex items-center gap-1 bg-neutral-950 px-3 py-1.5 border border-neutral-900 rounded font-mono">
                <Info className="w-3.5 h-3.5" />
                <span>Tip: Export final logs to PDF using the header command.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Specific deliverables checklist */}
        <div className="border-t lg:border-t-0 lg:border-l border-neutral-900 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-neutral-900">
              <span className="text-[10px] text-neutral-500 font-mono uppercase">Deliverables Checklist</span>
              <span className="text-[10px] font-mono text-yellow-500 font-bold">{activeProgress}% DONE</span>
            </div>

            <div className="space-y-2.5">
              {activeMilestone.deliverables.map((del, dIdx) => {
                const delKey = `${activeMilestone.id}-${del.text}`;
                const isChecked = !!customDeliverables[delKey];
                
                return (
                  <button
                    key={dIdx}
                    onClick={() => toggleDeliverable(activeMilestone.id, del.text)}
                    className="w-full text-left flex items-start gap-2.5 p-2 rounded hover:bg-neutral-900/60 transition-all border border-transparent hover:border-neutral-900/40 cursor-pointer group"
                  >
                    <div className="mt-0.5 text-neutral-500 group-hover:text-yellow-500 transition-colors shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600 group-hover:text-neutral-500" />
                      )}
                    </div>
                    <span className={`text-[11px] leading-snug transition-colors ${
                      isChecked ? "text-neutral-400 line-through decoration-neutral-800" : "text-neutral-200"
                    }`}>
                      {del.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick dossier feedback stamp */}
          <div className="mt-6 pt-4 border-t border-neutral-900/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <div className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-yellow-500" />
              <span>Status: <b className={`uppercase ${
                activeStatus === "Completed" ? "text-green-500" : activeStatus === "In Progress" ? "text-yellow-500" : "text-neutral-500"
              }`}>{activeStatus}</b></span>
            </div>
            <span>ID: SEC-TL-{activeMilestone.id}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
