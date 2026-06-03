import React, { useState } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Loader2, 
  Copy, 
  Check, 
  Send, 
  User as UserIcon,
  HelpCircle,
  Cpu,
  GraduationCap
} from "lucide-react";
import { User } from "../types";
import ReactMarkdown from "react-markdown";

interface PresiAiAssistantProps {
  currentUser: User;
  onAddNotification: (title: string, message: string) => void;
}

export default function PresiAiAssistant({
  currentUser,
  onAddNotification,
}: PresiAiAssistantProps) {
  const [activeSubTool, setActiveSubTool] = useState<"qa" | "cv" | "report">("qa");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>("");

  // Specific form states for structure builders
  const [cvName, setCvName] = useState(currentUser.name || "");
  const [cvDept, setCvDept] = useState(currentUser.department || "Software Engineering");
  const [cvSkills, setCvSkills] = useState("");
  const [cvExperience, setCvExperience] = useState("");

  const [reportTasks, setReportTasks] = useState("");
  const [reportTitle, setReportTitle] = useState("Vite React Deployment Process");

  const [chatLog, setChatLog] = useState<{ sender: "user" | "bot"; text: string }[]>([
    {
      sender: "bot",
      text: `Greetings, **${currentUser.name}**! 🎓 Welcome to the **PRESI VIP AI Academic Assistant** suite.\n\nI am configured with Gemini to facilitate automated academic pipelines. Ask me university queries, or select one of the dedicated builders above to compile professional CVs and internship reports instantly.`,
    },
  ]);

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    onAddNotification("CV Copied to Clipboard ✔", "Your structured CV document has been exported to local system stack.");
    setTimeout(() => setCopied(false), 2000);
  };

  const executeAiGeneration = async (type: "cv" | "report" | "qa", userPrompt: string, payloadExtra: any = {}) => {
    setIsGenerating(true);
    setGeneratedResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt: userPrompt,
          userName: cvName,
          department: cvDept,
          extraInfo: payloadExtra.extraInfo || ""
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedResult(data.text);
        if (type === "qa") {
          setChatLog(prev => [...prev, { sender: "bot", text: data.text }]);
        }
      } else {
        alert("PRESI assistant encountered an api packet issue. Resetting helper...");
      }
    } catch (err) {
      console.error(err);
      alert("AI Service is temporarily busy. Check connection metrics.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchCVGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvSkills && !cvExperience) {
      alert("Please input your focus skills or general placement history.");
      return;
    }
    const combinedPrompt = `Skills: ${cvSkills}. Experience/Projects: ${cvExperience}`;
    executeAiGeneration("cv", combinedPrompt, { extraInfo: "Standard Placement Resume" });
  };

  const handleLaunchReportGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTasks) {
      alert("Please outline your logbook activities or accomplishments.");
      return;
    }
    executeAiGeneration("report", reportTasks, { extraInfo: reportTitle });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setChatLog(prev => [...prev, { sender: "user", text: userMsg }]);
    setPrompt("");
    executeAiGeneration("qa", userMsg);
  };

  return (
    <div id="presi-ai-dashboard-container" className="space-y-6 animate-fadeIn text-left">
      {/* Premium Visual Headers */}
      <div className="p-6 bg-gradient-to-r from-blue-950 via-neutral-950 to-amber-950 border border-amber-500/30 rounded-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest bg-amber-500 text-neutral-950 font-black rounded uppercase inline-flex items-center gap-1">
            ⭐️ VIP Member Status Active
          </span>
          <h2 className="text-xl font-display font-bold text-white mt-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>PRESI AI Expert Suite</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Unlimited AI computations synced. Highly optimal academic reasoning for student placements.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2 border border-neutral-800 rounded font-mono text-[10px] shrink-0 text-amber-500">
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Active Plan: Scholar Annual VIP</span>
        </div>
      </div>

      {/* Selector Multi-Buttons */}
      <div className="grid grid-cols-3 gap-3 border-b border-neutral-900 pb-4">
        <button
          onClick={() => setActiveSubTool("qa")}
          className={`py-3 px-4 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTool === "qa"
              ? "bg-neutral-900 border-amber-500/40 text-amber-500 shadow-md"
              : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Ask Anything</span>
        </button>

        <button
          onClick={() => setActiveSubTool("cv")}
          className={`py-3 px-4 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTool === "cv"
              ? "bg-neutral-900 border-amber-500/40 text-amber-500 shadow-md"
              : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Generate Professional CV</span>
        </button>

        <button
          onClick={() => setActiveSubTool("report")}
          className={`py-3 px-4 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTool === "report"
              ? "bg-neutral-900 border-amber-500/40 text-amber-500 shadow-md"
              : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Write Logbook Report</span>
        </button>
      </div>

      {/* Inner Application Tools Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Workspace Controls Card */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-900 rounded-xl p-6 self-start space-y-6">
          {activeSubTool === "qa" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                <HelpCircle className="w-4 h-4 text-neutral-400" /> Conversational Scholar AI
              </h3>
              <p className="text-xs text-neutral-450 leading-relaxed">
                Interact with the PRESI model on specialized software requirements, engineering log structures, or ask questions about mobile money webhook integrations.
              </p>

              <form onSubmit={handleSendChat} className="space-y-3.5 pt-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. explain MTN Momo APIs payload integrations..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Computing Response...
                    </>
                  ) : (
                    <>
                      Send Prompt
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeSubTool === "cv" && (
            <form onSubmit={handleLaunchCVGen} className="space-y-4">
              <h3 className="text-sm font-semibold text-yellow-500 font-display">
                CV & Resume Document Builder
              </h3>
              <p className="text-xs text-neutral-450 leading-relaxed">
                Fill out core credentials below. PRESI AI structures standard modern African industry models.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">FullName</label>
                  <input
                    type="text"
                    required
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Academic Department</label>
                  <input
                    type="text"
                    required
                    value={cvDept}
                    onChange={(e) => setCvDept(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Principal Software skills</label>
                  <textarea
                    rows={2}
                    placeholder="React, SQLite, Firebase, D3.js Charts, CSS Flexbook"
                    value={cvSkills}
                    onChange={(e) => setCvSkills(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Accomplishments / Experiences</label>
                  <textarea
                    rows={3}
                    placeholder="Built a custom telemetry switcher. Integrated MTN Momo collection push protocols."
                    value={cvExperience}
                    onChange={(e) => setCvExperience(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating CV Matrix...
                  </>
                ) : (
                  <>
                    Compile Resume
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeSubTool === "report" && (
            <form onSubmit={handleLaunchReportGen} className="space-y-4">
              <h3 className="text-sm font-semibold text-yellow-500 font-display">
                Interim logbook & Report compiler
              </h3>
              <p className="text-xs text-neutral-450 leading-relaxed">
                Generate highly formatted academic weekly summaries and final audit reviews for deans and supervisors.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Target report title</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Tasks Completed</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Configured server.ts dual-theme properties hook. Enabled MTN collection push states in payment modules."
                    value={reportTasks}
                    onChange={(e) => setReportTasks(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Drafting Logbook Report...
                  </>
                ) : (
                  <>
                    Create Report Draft
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Workspace Display / Chat dialogue */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden flex flex-col justify-between h-[520px]">
          {/* Header toolbar */}
          <div className="px-5 py-3 border-b border-neutral-900/60 flex items-center justify-between bg-black/40">
            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PRESI CORE AI TERMINAL</span>
            </span>

            {/* Actions */}
            {generatedResult && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[10px] text-neutral-300 hover:text-white border border-neutral-800 rounded bg-neutral-900 flex items-center gap-1.5 cursor-pointer hover:border-neutral-700 transition-colors"
                title="Copy generated document markdown"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </button>
            )}
          </div>

          {/* Core Content Body viewport (Auto Scrolls) */}
          <div className="p-6 flex-grow overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-neutral-900">
            {activeSubTool === "qa" ? (
              <div className="space-y-4">
                {chatLog.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${
                      chat.sender === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`p-2 rounded shrink-0 h-8 w-8 flex items-center justify-center border ${
                      chat.sender === "user" 
                        ? "bg-neutral-900 text-neutral-400 border-neutral-800"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {chat.sender === "user" ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-xl leading-relaxed ${
                      chat.sender === "user"
                        ? "bg-gradient-to-r from-blue-900/30 to-indigo-900/10 border border-blue-900/30 text-white"
                        : "bg-neutral-900/40 border border-neutral-900 text-neutral-300"
                    }`}>
                      <div className="markdown-body text-xs">
                        <ReactMarkdown>{chat.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 h-8 w-8 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-900 text-neutral-350">
                      <span>PRESI thinking... resolving API parameters ...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Build result placeholder */
              <div className="h-full">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="font-mono text-[10px] uppercase">Compacting secure deep logical network tokens...</p>
                  </div>
                ) : generatedResult ? (
                  <div className="markdown-body p-2 leading-relaxed text-neutral-200">
                    <ReactMarkdown>{generatedResult}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                    <Sparkles className="w-8 h-8 text-neutral-800" />
                    <h4 className="text-white font-semibold text-xs uppercase tracking-wide">Workspace Empty</h4>
                    <p className="text-[11px] max-w-xs leading-normal text-neutral-550">
                      Launch compile on your resume or report via controls. Formatted documents render here dynamically.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
