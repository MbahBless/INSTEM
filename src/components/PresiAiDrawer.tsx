import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Cpu, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Copy, 
  Check, 
  Loader2, 
  User as UserIcon, 
  GraduationCap, 
  Crown, 
  Zap, 
  MessageSquare,
  HelpCircle,
  Code2
} from "lucide-react";
import { User } from "../types";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface PresiAiDrawerProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onAddNotification: (title: string, message: string) => void;
  onUpgradeTrigger?: () => void;
}

export default function PresiAiDrawer({
  currentUser,
  isOpen,
  onClose,
  onAddNotification,
  onUpgradeTrigger
}: PresiAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Hello **${currentUser.name}**! 🎓 Welcome to **PRESI Sidecar AI Tutor**.\n\nI am connected through our school's secure gateway to help you compile engineering records. How can I assist you today? Try one of my fast templates below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Wizard Form Panel inside Drawer
  const [showWizard, setShowWizard] = useState<"cv" | "report" | null>(null);

  // Form states
  const [cvSkills, setCvSkills] = useState("");
  const [cvExperience, setCvExperience] = useState("");
  const [reportTitle, setReportTitle] = useState("Vite React Deployment Process");
  const [reportTasks, setReportTasks] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const executeAiGeneration = async (type: "cv" | "report" | "qa", userPrompt: string, payloadExtra: any = {}) => {
    setIsGenerating(true);
    
    // Check local mock rules
    if (!currentUser.isPremium) {
      // Simulate limiting unless premium
      setTimeout(() => {
        const botResponse: Message = {
          id: `msg_${Date.now()}`,
          sender: "bot",
          text: `⚠️ **Security Alert: PRESI VIP Scholar Status Required**\n\nTo generate full length ${type === "cv" ? "CV compilations" : "Logbook Weekly Reports"} or execute complex academic analytics, please upgrade to Premium. \n\n*Starter tiers can still ask general text homework questions in the chat!*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
        setIsGenerating(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt: userPrompt,
          userName: currentUser.name,
          department: currentUser.department || "Software Engineering",
          extraInfo: payloadExtra.extraInfo || ""
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse: Message = {
          id: `msg_${Date.now()}`,
          sender: "bot",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
        onAddNotification(
          `PRESI AI Response Generated`,
          `Your academic content formulation is resolved and ready.`
        );
      } else {
        throw new Error("API return issue");
      }
    } catch (err) {
      console.error(err);
      // Fallback response simulation
      setTimeout(() => {
        let simulatedReply = "";
        if (type === "cv") {
          simulatedReply = `### CV FOR ${currentUser.name.toUpperCase()}
**Department:** ${currentUser.department || "Computing"}\n\n**Core Skills:** ${userPrompt}\n\n**Professional Summary:**\nAmbitious graduate student competent in local state mechanics, frontend Vite compilation, and MTN/Orange MoMo webhook collection routes. Experienced in documenting project updates and logbook sheets.\n\n*(Connect your Gemini Core Key for personalized full outputs)*`;
        } else if (type === "report") {
          simulatedReply = `### WEEKLY PLACEMENT REPORT draft
**Title:** ${payloadExtra.extraInfo || "Weekly accomplishments"}\n\n**Activities Summary:**\n* Configured server.ts dual theme schema definitions with offline local cache persistence.\n* Conducted sandbox tests of Orange Money checkout triggers, reaching zero compliance errors.\n* Participated in team code reviews covering responsive UI margins and touch target layouts.\n\n*Status: Verified conformant by academic tutor daemon.*`;
        } else {
          simulatedReply = `Thank you for asking about **"${userPrompt}"**! Under our Cameroon academic context:\n\n1. Webhooks for MTNDiy are dispatched via JSON payloads mapping secure payment hashes.\n2. In React, keep layout variables inside stabilized hooks to minimize repaint cycles.\n3. Keep your daily logbook brief and target discrete milestones.`;
        }

        const botResponse: Message = {
          id: `msg_${Date.now()}`,
          sender: "bot",
          text: simulatedReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1200);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    
    // Invoke AI Response
    executeAiGeneration("qa", userMsg.text);
  };

  const handleLaunchCVGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvSkills && !cvExperience) return;

    const promptText = `Skills: ${cvSkills}. Experience: ${cvExperience}`;
    
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: `📋 *[CV Builder Form Request]* \nSkills: \`${cvSkills}\` \nExperience: \`${cvExperience}\``,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setShowWizard(null);
    setCvSkills("");
    setCvExperience("");
    
    executeAiGeneration("cv", promptText, { extraInfo: "Custom Student Resume" });
  };

  const handleLaunchReportGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTasks) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: `📝 *[Report Writer Form Request]* \nTopic: **${reportTitle}** \nActivities: \`${reportTasks}\``,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setShowWizard(null);
    setReportTasks("");

    executeAiGeneration("report", reportTasks, { extraInfo: reportTitle });
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onAddNotification("Copied Markdown", "Content cloned securely into clipboard buffer.");
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Panel Body */}
      <div className="relative w-full sm:w-[500px] bg-neutral-950 border-l border-neutral-900 h-full flex flex-col justify-between shadow-2xl z-10 animate-slideOver text-left">
        
        {/* Amber Premium Ribbon Indicator */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 w-full" />

        {/* Header toolbar */}
        <div className="p-5 border-b border-neutral-900 bg-neutral-950 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                PRESI AI Assistant
                <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/15 text-amber-500 font-mono tracking-wider font-extrabold uppercase animate-pulse border border-amber-500/20">
                  VIP Sidecar
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                Placement &amp; Homework Copilot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Minimize Sidecar Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Premium Upgrade Warn Info Bar */}
        {!currentUser.isPremium && (
          <div className="px-5 py-3 bg-gradient-to-r from-neutral-950 to-amber-950/40 border-b border-amber-500/15 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-neutral-400 text-[11px]">VIP compilation limits apply.</span>
            </div>
            <button
              onClick={() => {
                if (onUpgradeTrigger) {
                  onUpgradeTrigger();
                }
                onClose();
              }}
              className="text-[10px] font-bold text-amber-500 hover:text-white bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-all uppercase cursor-pointer"
            >
              Go Scholar VIP
            </button>
          </div>
        )}

        {/* Chat log visual view */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-neutral-950/20 scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
          
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Profile Avatar icons */}
              <div className={`p-2 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center border text-xs ${
                msg.sender === "user"
                  ? "bg-neutral-900 text-neutral-400 border-neutral-850"
                  : "bg-amber-500/15 text-amber-500 border-amber-500/20 shadow-md shadow-amber-500/5"
              }`}>
                {msg.sender === "user" ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble box */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className={`p-4 rounded-xl text-xs leading-relaxed relative group border ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border-blue-900/30 text-white"
                    : "bg-neutral-900/50 border-neutral-900 text-neutral-300"
                }`}>
                  
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Copy overlay button */}
                  {msg.sender === "bot" && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="absolute right-2 bottom-2 p-1 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <div className={`text-[9px] font-mono text-neutral-500 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Assistant loader animations */}
          {isGenerating && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 h-8 w-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-900 text-neutral-400 text-xs">
                <span>PRESI is structuring regional datasets...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Intermediate Input Wizard Panels */}
        {showWizard === "cv" && (
          <form onSubmit={handleLaunchCVGen} className="p-5 border-t border-neutral-900 bg-neutral-950 space-y-4 animate-slideUp">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Regional CV Wizard</span>
              </span>
              <button 
                type="button" 
                onClick={() => setShowWizard(null)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-neutral-550 font-mono block mb-1 uppercase">Principal Skills</label>
                <input
                  type="text"
                  required
                  placeholder="React, SQLite, MTN Webhooks, CSS Layouts"
                  value={cvSkills}
                  onChange={(e) => setCvSkills(e.target.value)}
                  className="w-full bg-black border border-neutral-900 hover:border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[9px] text-neutral-550 font-mono block mb-1 uppercase">Key Project / Accomplishments</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Built custom timeline monitor, reduced audit errors by 90%."
                  value={cvExperience}
                  onChange={(e) => setCvExperience(e.target.value)}
                  className="w-full bg-black border border-neutral-900 hover:border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 font-bold text-neutral-950 text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
            >
              Compile Draft CV
            </button>
          </form>
        )}

        {showWizard === "report" && (
          <form onSubmit={handleLaunchReportGen} className="p-5 border-t border-neutral-900 bg-neutral-950 space-y-4 animate-slideUp">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic Logbook Helper</span>
              </span>
              <button 
                type="button" 
                onClick={() => setShowWizard(null)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-neutral-550 font-mono block mb-1 uppercase">Report Task Focus</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-900 hover:border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[9px] text-neutral-550 font-mono block mb-1 uppercase">Today/Weekly Tasks Performed</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Configured secure Orange pay interfaces in local checkout workflows..."
                  value={reportTasks}
                  onChange={(e) => setReportTasks(e.target.value)}
                  className="w-full bg-black border border-neutral-900 hover:border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 font-bold text-neutral-950 text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
            >
              Draft My Academic Log
            </button>
          </form>
        )}

        {/* Bottom Fast Action Prompt template cards */}
        {!showWizard && (
          <div className="px-5 py-3 border-t border-neutral-900/60 bg-neutral-950 flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none pb-1 font-mono">
            
            <button
              onClick={() => setShowWizard("cv")}
              className="px-2.5 py-1.5 shrink-0 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-[10px] text-neutral-400 border border-neutral-850 rounded hover:border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3 text-amber-500" />
              <span>Resume Builder</span>
            </button>

            <button
              onClick={() => setShowWizard("report")}
              className="px-2.5 py-1.5 shrink-0 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-[10px] text-neutral-400 border border-neutral-850 rounded hover:border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-amber-500" />
              <span>Logbook Report</span>
            </button>

            <button
              onClick={() => {
                const query = "Explain secure webhook collection paths for Cameroon telecom operators.";
                setInputText(query);
              }}
              className="px-2.5 py-1.5 shrink-0 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-[10px] text-neutral-400 border border-neutral-850 rounded hover:border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3 h-3 text-amber-500" />
              <span>Momo Webhooks Helper</span>
            </button>

            <button
              onClick={() => {
                const query = "What is the proper format of an academic interim internship logbook?";
                setInputText(query);
              }}
              className="px-2.5 py-1.5 shrink-0 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-[10px] text-neutral-400 border border-neutral-850 rounded hover:border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-amber-500" />
              <span>Academic Formats</span>
            </button>

          </div>
        )}

        {/* Bottom Typing input Form bar block */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-900 bg-black/40">
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask PRESI anything related to placements or logbooks..."
              className="flex-1 bg-black border border-neutral-850 focus:border-amber-500 rounded px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="p-2.5 rounded bg-amber-500 hover:bg-amber-400 hover:brightness-110 text-neutral-950 disabled:bg-neutral-900 disabled:text-neutral-600 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Send user prompt"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
