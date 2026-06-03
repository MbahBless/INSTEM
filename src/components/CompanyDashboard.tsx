import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Check, 
  X, 
  CheckCircle, 
  User, 
  Calendar,
  AlertCircle,
  Briefcase,
  Users,
  Award,
  Loader2,
  Clock,
  Sparkles,
  FileDown
} from "lucide-react";
import { User as UserType, Internship, Application, Report } from "../types";
import { generateCompanyPDF } from "../utils/pdfGenerator";
import UserSettingsPanel from "./UserSettingsPanel";

interface CompanyDashboardProps {
  currentUser: UserType;
  onAddNotification: (title: string, message: string) => void;
}

export default function CompanyDashboard({ currentUser, onAddNotification }: CompanyDashboardProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "applications" | "reports" | "interns" | "settings">("listings");
  const [loading, setLoading] = useState(true);

  // Post job form states
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDepartment, setNewDepartment] = useState("Software Engineering");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newType, setNewType] = useState("Full-time");
  const [newStipend, setNewStipend] = useState("$3,500/month");
  const [newDuration, setNewDuration] = useState("6 Months");
  const [newDescription, setNewDescription] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [isPostingJob, setIsPostingJob] = useState(false);

  // Status updating parameters
  const [auditFeedback, setAuditFeedback] = useState<Record<string, string>>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Report auditing feedback
  const [reportFeedback, setReportFeedback] = useState<Record<string, string>>({});
  const [reportGrade, setReportGrade] = useState<Record<string, string>>({});
  const [isGrading, setIsGrading] = useState<string | null>(null);

  // Skills endorsements state
  const [selectedPlacement, setSelectedPlacement] = useState<Application | null>(null);
  const [mentorName, setMentorName] = useState(currentUser.name || "");
  const [projectTitle, setProjectTitle] = useState("");
  const [markCompleted, setMarkCompleted] = useState(false);
  const [selectedEndorsementSkills, setSelectedEndorsementSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [isSubmittingEndorsement, setIsSubmittingEndorsement] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<UserType | null>(null);

  const defaultSkillsList = [
    "TypeScript", "React", "Node.js", "SQL / Postgres", 
    "Tailwind CSS", "REST API Design", "Git & GitHub Workflow",
    "Security Auditing", "Cryptography", "Data Modeling", 
    "Python", "Statistical Analysis", "System Optimization"
  ];

  const fetchStudentDetails = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentDetails(data);
        if (data.projectTitle) {
          setProjectTitle(data.projectTitle);
        }
        if (data.projectCompleted) {
          setMarkCompleted(data.projectCompleted);
        }
      }
    } catch (err) {
      console.error("Error fetching student details", err);
    }
  };

  const handleSelectPlacement = (placement: Application) => {
    setSelectedPlacement(placement);
    setSelectedStudentDetails(null);
    setSelectedEndorsementSkills([]);
    setProjectTitle(placement.internshipTitle || "");
    setMarkCompleted(false);
    fetchStudentDetails(placement.studentId);
  };

  const handleSubmitEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement) return;
    if (selectedEndorsementSkills.length === 0) {
      alert("Please check at least one skill to endorse.");
      return;
    }
    setIsSubmittingEndorsement(true);
    try {
      const response = await fetch(`/api/students/${selectedPlacement.studentId}/endorse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: selectedEndorsementSkills,
          projectTitle: projectTitle,
          completed: markCompleted,
          mentorName: mentorName,
          companyName: currentUser.companyName || currentUser.name
        })
      });

      if (response.ok) {
        const studentData = await response.json();
        setSelectedStudentDetails(studentData);
        alert(`Skills endorsed successfully for ${selectedPlacement.studentName}!`);
        onAddNotification(
          "Skills Endorsed",
          `You endorsed ${selectedPlacement.studentName} for: ${selectedEndorsementSkills.join(", ")}.`
        );
        if (markCompleted) {
          onAddNotification(
            "Project Certified Complete",
            `You certified project "${projectTitle}" as COMPLETED for ${selectedPlacement.studentName}.`
          );
        }
        setSelectedEndorsementSkills([]);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to submit endorsements.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting connection request.");
    } finally {
      setIsSubmittingEndorsement(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [currentUser]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const [listingsRes, appsRes, reportsRes] = await Promise.all([
        fetch("/api/internships"),
        fetch(`/api/applications?companyId=${currentUser.id}`),
        fetch(`/api/reports?companyId=${currentUser.id}`)
      ]);

      if (listingsRes.ok && appsRes.ok && reportsRes.ok) {
        const listings = await listingsRes.json();
        const apps = await appsRes.json();
        const reps = await reportsRes.json();
        
        // Filter jobs posted by this company
        const companyJobs = listings.filter((l: Internship) => l.companyId === currentUser.id);
        
        setInternships(companyJobs);
        setApplications(apps);
        setReports(reps);
      }
    } catch (err) {
      console.error("Error drawing company data", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;
    setIsPostingJob(true);

    const requirements = requirementsText
      .split("\n")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    try {
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          location: newLocation,
          type: newType,
          stipend: newStipend,
          duration: newDuration,
          description: newDescription,
          requirements: requirements.length > 0 ? requirements : ["Basic Skills Required"],
          department: newDepartment,
          companyId: currentUser.id,
          companyName: currentUser.companyName || currentUser.name
        })
      });

      if (response.ok) {
        const addedJob = await response.json();
        setInternships([addedJob, ...internships]);
        setNewTitle("");
        setNewDescription("");
        setRequirementsText("");
        setShowPostModal(false);
        alert("New Internship published on active catalog successfully!");
        onAddNotification(
          "Campaign Listed",
          `Success: You posted a new vacancy - "${addedJob.title}".`
        );
      }
    } catch (err) {
      console.error("Posting error", err);
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleDeleteJob = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the listing: "${name}"?`)) return;
    try {
      const response = await fetch(`/api/internships/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setInternships(internships.filter((item) => item.id !== id));
        alert("Listing successfully removed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: "ACCEPTED" | "REJECTED" | "UNDER_REVIEW" | "INTERVIEWING") => {
    const feedback = auditFeedback[appId] || "";
    setIsUpdatingStatus(appId);

    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback })
      });

      if (response.ok) {
        const updated = await response.json();
        setApplications(applications.map((a) => (a.id === appId ? updated : a)));
        // Clear local inputs
        setAuditFeedback(prev => {
          const dict = { ...prev };
          delete dict[appId];
          return dict;
        });
        alert(`Application status marked as ${status}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleGradeReport = async (reportId: string, status: "APPROVED" | "REVISION_REQUESTED") => {
    const feedback = reportFeedback[reportId] || "Excellent progress milestones.";
    const grade = reportGrade[reportId] || "A";
    setIsGrading(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, grade, status })
      });

      if (response.ok) {
        const updated = await response.json();
        setReports(reports.map(r => r.id === reportId ? updated : r));
        setReportFeedback(prev => {
          const dict = { ...prev };
          delete dict[reportId];
          return dict;
        });
        alert(`Progress Report audited. Marked as ${status} with Grade "${grade}"!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(null);
    }
  };

  const activePlacements = applications.filter(a => a.status === "ACCEPTED");

  return (
    <div className="bg-black text-white min-h-screen p-6 md:p-10">
      
      {/* Metrics Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-neutral-900">
        <div>
          <span className="text-xs text-yellow-500 font-mono tracking-widest uppercase">
            Recruiter Node — {currentUser.companyName}
          </span>
          <h1 className="text-3xl font-display font-medium text-white tracking-tight mt-1">
            Corporate Command Center
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Signing Authority: <b className="text-white">{currentUser.name}</b>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => {
              try {
                generateCompanyPDF(currentUser, internships, applications, reports);
                onAddNotification(
                  "PDF Report Compiled",
                  `Your corporate workspace summary and progress audit sheet has been compiled and downloaded.`
                );
              } catch (err) {
                console.error("PDF generation failed", err);
                alert("Failed to build PDF. Please check data sync.");
              }
            }}
            className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-3 bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 text-yellow-500 rounded hover:bg-neutral-850 hover:text-yellow-400 transition-all uppercase tracking-wider cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Download Summary Report
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 text-black bg-yellow-500 hover:bg-yellow-400 px-5 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
          >
            <Plus className="w-4 h-4 text-black" /> Advertise Internship
          </button>
        </div>
      </div>

      {/* Overview Cards (Gold high contrast layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 font-display">
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
          <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mb-1">Active Ad campaigns</p>
          <p className="text-3xl font-bold text-white">{internships.length}</p>
        </div>
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
          <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mb-1">Inbound Candidates</p>
          <p className="text-3xl font-bold text-white">{applications.length}</p>
        </div>
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
          <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mb-1">Active Interns Placed</p>
          <p className="text-3xl font-bold text-yellow-500">{activePlacements.length}</p>
        </div>
      </div>

      {/* Tab select navigations */}
      <div className="flex border-b border-neutral-900 mb-8 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "listings" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "listings" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Published Vacancies ({internships.length})
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "applications" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "applications" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Inbound Resumes ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "reports" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "reports" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Weekly Progress Audits ({reports.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("interns");
            if (activePlacements.length > 0 && !selectedPlacement) {
              handleSelectPlacement(activePlacements[0]);
            }
          }}
          className={`pb-4 font-display font-medium transition-colors cursor-pointer relative ${
            activeTab === "interns" ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "interns" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          Endorse Intern Skills ({activePlacements.length})
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

      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          <p className="text-xs text-neutral-400 font-mono">Drawing server directories...</p>
        </div>
      ) : (
        <>
          {/* LISTINGS PANEL */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {internships.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <Briefcase className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">No Advertised Jobs Listed</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Click "Advertise Internship" to construct your corporate requirements sheet.
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#050505] text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-900 text-[10px]">
                      <tr>
                        <th className="p-4">Vacancy Title</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Structure / Duration</th>
                        <th className="p-4">Stipend Index</th>
                        <th className="p-4 text-right">Operation controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {internships.map((job) => (
                        <tr key={job.id} className="hover:bg-neutral-900/25 transition-colors">
                          <td className="p-4 font-semibold text-neutral-200">
                            <div>{job.title}</div>
                            <span className="text-[10px] text-neutral-500 font-mono font-normal block mt-0.5">{job.location}</span>
                          </td>
                          <td className="p-4 text-neutral-300 font-medium">{job.department}</td>
                          <td className="p-4 text-neutral-400">
                            {job.type} / {job.duration}
                          </td>
                          <td className="p-4 text-yellow-500 font-semibold font-mono">{job.stipend}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-900 rounded transition-all cursor-pointer"
                              title="Delete job ad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION MANAGER PANEL */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              {applications.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">No Candidate Submissions Yet</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your pipeline will activate as candidates submit their portfolios for review.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col justify-between gap-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="text-left">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-850 text-yellow-500 uppercase font-bold">
                            Vacancy: {app.internshipTitle}
                          </span>
                          <h2 className="text-base font-semibold text-white mt-2 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-neutral-500" />
                            Candidate: {app.studentName}
                          </h2>
                          <p className="text-xs text-neutral-500 mt-1">
                            Academic Major: <span className="text-white font-medium">{app.studentDepartment}</span> | Email: <b className="text-neutral-400 font-mono">{app.studentEmail}</b>
                          </p>

                          <div className="mt-4 p-4 bg-black rounded border border-neutral-900">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1.5">Candidate Cover Letter / Bio</p>
                            <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl font-sans">
                              {app.coverLetter || "No pitch provided."}
                            </p>
                          </div>
                        </div>

                        {/* Pipeline workflow actions */}
                        <div className="bg-black/60 p-4 rounded-lg border border-neutral-900 self-start lg:min-w-80">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase">Pipeline Node State:</span>
                            <span className="text-xs text-yellow-500 font-semibold font-mono tracking-widest uppercase">{app.status}</span>
                          </div>

                          {app.status === "REJECTED" || app.status === "ACCEPTED" ? (
                            <div className="text-xs p-2 bg-neutral-900 text-neutral-400 rounded text-center border border-neutral-800">
                              System node locked. Status is permanently <b className="text-white uppercase">{app.status}</b>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Feedback Input box */}
                              <div>
                                <label className="block text-[9px] text-neutral-500 font-mono uppercase mb-1">Assigned feedback notes</label>
                                <input
                                  type="text"
                                  value={auditFeedback[app.id] || ""}
                                  onChange={(e) => setAuditFeedback({ ...auditFeedback, [app.id]: e.target.value })}
                                  placeholder="Type feedback: e.g. Accepted for interview stage..."
                                  className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "UNDER_REVIEW")}
                                  disabled={isUpdatingStatus === app.id}
                                  className="py-1.5 rounded transition-all bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 cursor-pointer"
                                >
                                  Mark Review
                                </button>
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "INTERVIEWING")}
                                  disabled={isUpdatingStatus === app.id}
                                  className="py-1.5 rounded transition-all bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 cursor-pointer"
                                >
                                  Invite Interview
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "REJECTED")}
                                  disabled={isUpdatingStatus === app.id}
                                  className="py-2 rounded transition-all bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-white cursor-pointer"
                                >
                                  Reject candidate
                                </button>
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "ACCEPTED")}
                                  disabled={isUpdatingStatus === app.id}
                                  className="py-2 rounded transition-all bg-green-500 text-black hover:bg-green-400 cursor-pointer"
                                >
                                  Hired & Placed
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROGRESS REPORTS PANEL */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {reports.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-lg">
                  <Award className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-white">No Student Logs Submitted</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your active student interns will submit reports as they complete their weekly benchmarks.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reports.map((rep) => (
                    <div 
                      key={rep.id} 
                      className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col justify-between gap-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="text-left space-y-4">
                          <div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-850 text-white uppercase font-bold">
                              {rep.title}
                            </span>
                            <h3 className="text-md font-semibold text-white mt-2">
                              Intern: {rep.studentName}
                            </h3>
                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Filed: {new Date(rep.submittedAt).toLocaleDateString()} | Hours logged: <b className="text-white">{rep.hoursLogged} hours</b>
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-black rounded border border-neutral-900">
                              <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-1">Key achievements completed</span>
                              <p className="text-xs text-neutral-300 leading-relaxed font-sans">{rep.content}</p>
                            </div>
                            <div className="p-3 bg-black rounded border border-neutral-900">
                              <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-1 font-mono">Challenges & Roadblocks met</span>
                              <p className="text-xs text-neutral-300 leading-relaxed font-sans">{rep.challenges}</p>
                            </div>
                          </div>
                        </div>

                        {/* Auditing controls for reports */}
                        <div className="bg-black/80 p-4 rounded border border-neutral-900 lg:min-w-80">
                          <div className="flex justify-between items-center mb-4 border-b border-neutral-905 pb-3">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase">Audit Panel:</span>
                            <span className={`text-[10px] tracking-wider uppercase font-bold font-mono px-2 py-0.5 rounded ${
                              rep.status === "APPROVED" ? "bg-green-950 text-green-500 border border-green-900/30" : "bg-yellow-950 text-yellow-500 border border-yellow-905"
                            }`}>
                              {rep.status}
                            </span>
                          </div>

                          {rep.status === "APPROVED" ? (
                            <div className="text-xs space-y-2 border border-neutral-900 p-3 rounded">
                              <p className="font-mono text-[10px] text-neutral-500 uppercase">Final evaluations saved</p>
                              <p className="text-neutral-400">Assigned Grade: <span className="text-yellow-500 font-bold text-sm">{rep.grade || "A"}</span></p>
                              <p className="text-neutral-400 italic">"{rep.feedback || 'Approved.'}"</p>
                            </div>
                          ) : (
                            <div className="space-y-4 text-xs">
                              {/* Written feedback input */}
                              <div>
                                <label className="block text-[9px] text-neutral-400 font-mono uppercase mb-1">Quality Assessment notes</label>
                                <input
                                  type="text"
                                  value={reportFeedback[rep.id] || ""}
                                  onChange={(e) => setReportFeedback({ ...reportFeedback, [rep.id]: e.target.value })}
                                  placeholder="Great, merge completed. Maintain this file standard..."
                                  className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500"
                                />
                              </div>

                              {/* Grade selection */}
                              <div>
                                <label className="block text-[9px] text-neutral-400 font-mono uppercase mb-1">Assign Letter Grade</label>
                                <select
                                  value={reportGrade[rep.id] || "A"}
                                  onChange={(e) => setReportGrade({ ...reportGrade, [rep.id]: e.target.value })}
                                  className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500"
                                >
                                  <option value="A+">A+ (Exceptional Work)</option>
                                  <option value="A">A (Exemplary Output)</option>
                                  <option value="B">B (Solid Project Benchmarks)</option>
                                  <option value="C">C (Satisfactory Progression)</option>
                                  <option value="D">D (Needs Immediate Tutoring)</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold pt-2 border-t border-neutral-900">
                                <button
                                  onClick={() => handleGradeReport(rep.id, "REVISION_REQUESTED")}
                                  disabled={isGrading === rep.id}
                                  className="py-2 text-red-500 bg-red-950/20 border border-red-900/30 rounded hover:bg-neutral-900 hover:text-white transition-all cursor-pointer"
                                >
                                  Request revision
                                </button>
                                <button
                                  onClick={() => handleGradeReport(rep.id, "APPROVED")}
                                  disabled={isGrading === rep.id}
                                  className="py-2 text-black bg-yellow-500 hover:bg-yellow-400 rounded transition-all cursor-pointer"
                                >
                                  Approve & Grade
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ENDORSE INTERN SKILLS PANEL */}
          {activeTab === "interns" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {/* Left column: List of Placements */}
              <div className="space-y-4 lg:col-span-1">
                <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-450 mb-3">Placed Interns</h3>
                  {activePlacements.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      No active interns currently placed.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePlacements.map((placement) => {
                        const isSelected = selectedPlacement?.id === placement.id;
                        return (
                          <button
                            key={placement.id}
                            onClick={() => handleSelectPlacement(placement)}
                            className={`w-full text-left p-3.5 rounded transition-all cursor-pointer border flex flex-col gap-1 ${
                              isSelected 
                                ? "bg-yellow-500/10 border-yellow-500 text-white" 
                                : "bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
                            }`}
                          >
                            <span className="text-xs font-semibold">{placement.studentName}</span>
                            <span className="text-[10px] font-mono text-neutral-500">{placement.internshipTitle}</span>
                            <span className="text-[9px] font-mono uppercase text-yellow-500 block mt-1">{placement.studentDepartment}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right/Middle columns: Selected student dossier and endorsement form */}
              <div className="lg:col-span-2 space-y-6">
                {!selectedPlacement ? (
                  <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-lg text-center">
                    <User className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white">No Intern Selected</h4>
                    <p className="text-xs text-neutral-400 mt-1">Select an active placed student from the ledger list to view candidate profile analytics and endorse skills.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Student dossier header */}
                    <div className="p-6 bg-neutral-950 border border-neutral-905 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <span className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-805 text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
                            Active Placement Profile
                          </span>
                          <h2 className="text-lg font-bold text-white mt-1.5">{selectedPlacement.studentName}</h2>
                          <p className="text-xs text-neutral-450 mt-0.5">
                            Major Department: <span className="text-white font-medium">{selectedPlacement.studentDepartment}</span> | Email: <span className="text-neutral-300 font-mono">{selectedPlacement.studentEmail}</span>
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-start sm:items-end gap-1 text-left sm:text-right">
                          <span className="text-[10px] text-neutral-500 font-mono uppercase">PROJECT STATUS</span>
                          {selectedStudentDetails?.projectCompleted ? (
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-green-950 text-green-500 rounded border border-green-905 uppercase font-bold">
                              ✓ COMPLETED & CERTIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-yellow-950/40 text-yellow-500 rounded border border-yellow-800/20 uppercase font-bold">
                              ● ACTIVE DEVELOPMENT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display already endorsed skills */}
                      {selectedStudentDetails?.endorsedSkills && selectedStudentDetails.endorsedSkills.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-neutral-900">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-2">Certified Skill Endorsements ({selectedStudentDetails.endorsedSkills.length})</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudentDetails.endorsedSkills.map((s, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-black border border-neutral-850 rounded text-xs font-mono text-yellow-500" title={`Endorsed by ${s.endorsedBy} at ${s.companyName} on ${new Date(s.date).toLocaleDateString()}`}>
                                <Award className="w-3.5 h-3.5 text-yellow-500" />
                                <span>{s.skill}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skill endorsement form card */}
                    <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
                      <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-yellow-500" />
                        Skills Endorsement & Project Certification Panel
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase mb-4">VERIFIED RECRUITER LEDGER TRANSACTION</p>

                      <form onSubmit={handleSubmitEndorsement} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Mentor / Evaluator Name</label>
                            <input
                              type="text"
                              required
                              value={mentorName}
                              onChange={(e) => setMentorName(e.target.value)}
                              placeholder="e.g. Lead Dev Jane Doe"
                              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Project Milestone Title</label>
                            <input
                              type="text"
                              required
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              placeholder="e.g. High-performance API decoupling modules"
                              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* Skills checklist selection with dynamic custom inputs */}
                        <div>
                          <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-2">Select Skills to Endorse</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/50 p-4 rounded border border-neutral-900 mb-2 max-h-48 overflow-y-auto">
                            {defaultSkillsList.map((skill) => {
                              const alreadyEndorsed = selectedStudentDetails?.endorsedSkills?.some(
                                s => s.skill.toLowerCase() === skill.toLowerCase()
                              );
                              const isChecked = selectedEndorsementSkills.includes(skill);
                              return (
                                <button
                                  type="button"
                                  key={skill}
                                  disabled={alreadyEndorsed}
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedEndorsementSkills(selectedEndorsementSkills.filter(s => s !== skill));
                                    } else {
                                      setSelectedEndorsementSkills([...selectedEndorsementSkills, skill]);
                                    }
                                  }}
                                  className={`p-2 rounded text-left border flex items-center justify-between transition-all cursor-pointer font-sans text-xs ${
                                    alreadyEndorsed
                                      ? "bg-neutral-900 border-neutral-950 text-neutral-500 cursor-not-allowed"
                                      : isChecked
                                        ? "bg-yellow-500/10 border-yellow-500 text-white font-semibold"
                                        : "bg-black border-neutral-800 text-neutral-350 hover:border-neutral-700 hover:text-white"
                                  }`}
                                >
                                  <span>{skill}</span>
                                  {alreadyEndorsed ? (
                                    <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase">Endorsed</span>
                                  ) : isChecked ? (
                                    <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Skill Input */}
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={customSkillInput}
                              onChange={(e) => setCustomSkillInput(e.target.value)}
                              placeholder="Add custom skill not listed... (e.g., Docker, Redux)"
                              className="bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 flex-1 font-sans"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (customSkillInput.trim()) {
                                    const skill = customSkillInput.trim();
                                    if (!selectedEndorsementSkills.includes(skill)) {
                                      setSelectedEndorsementSkills([...selectedEndorsementSkills, skill]);
                                    }
                                    setCustomSkillInput("");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customSkillInput.trim()) {
                                  const skill = customSkillInput.trim();
                                  if (!selectedEndorsementSkills.includes(skill)) {
                                    setSelectedEndorsementSkills([...selectedEndorsementSkills, skill]);
                                  }
                                  setCustomSkillInput("");
                                }
                              }}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white border border-neutral-800 text-neutral-305 rounded cursor-pointer text-xs"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Project completion checkbox */}
                        <div className="p-4 bg-black/45 border border-neutral-900 rounded flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="project-completed-checkbox"
                            checked={markCompleted}
                            onChange={(e) => setMarkCompleted(e.target.checked)}
                            className="mt-1 accent-yellow-500 cursor-pointer h-4 w-4 rounded"
                          />
                          <div className="text-left font-sans text-xs">
                            <label htmlFor="project-completed-checkbox" className="font-semibold text-white cursor-pointer select-none">
                              Complete Project & Award Registration Status
                            </label>
                            <p className="text-neutral-500 text-[11px] mt-0.5 leading-normal">
                              Checking this box certifies that the student has successfully accomplished their core project objectives and completed their internship milestones.
                            </p>
                          </div>
                        </div>

                        {/* Register Action Button */}
                        <button
                          type="submit"
                          disabled={isSubmittingEndorsement || selectedEndorsementSkills.length === 0}
                          className={`w-full py-3 rounded font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${
                            selectedEndorsementSkills.length === 0 
                              ? "bg-neutral-900 border border-neutral-850 text-neutral-500 cursor-not-allowed" 
                              : "bg-yellow-500 text-black hover:bg-yellow-400"
                          }`}
                        >
                          {isSubmittingEndorsement ? "Submitting Skills Certifications..." : "Certify Project & Endorse Skills"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMPANY PROFILE SETTINGS TAB */}
          {activeTab === "settings" && (
            <UserSettingsPanel 
              currentUser={currentUser} 
              onAddNotification={onAddNotification} 
            />
          )}
        </>
      )}

      {/* NEW INTERNSHIP POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 text-neutral-450 hover:text-white p-1 hover:bg-neutral-900 rounded cursor-pointer"
            >
              ✕
            </button>
            <div className="p-8">
              <h2 className="text-xl font-display font-semibold text-white mb-1">Host Internship Campaign</h2>
              <p className="text-xs text-neutral-500 mb-6 font-mono">PUBLISH ADVERTISEMENTS TO UNIVERSITY LEDGERS</p>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Vacancy Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Backend Node.js Engineer Intern"
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Academic Department</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Information Security">Information Security</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Telecommunication Engineering">Telecommunication</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Structure</label>
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Duration</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Monthly Stipend</label>
                    <input
                      type="text"
                      value={newStipend}
                      onChange={(e) => setNewStipend(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Detailed Description & Objectives</label>
                  <textarea
                    required
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide description of roles and responsibilities"
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">Skill stack (one per line)</label>
                  <textarea
                    rows={3}
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="TypeScript&#10;Postgres / SQL&#10;Linux fundamentals"
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPostingJob}
                  className="w-full text-black bg-yellow-500 hover:bg-yellow-400 py-3 rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-all mt-4"
                >
                  {isPostingJob ? "Listing Vacancy on Cloud..." : "Host Vacancy"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
