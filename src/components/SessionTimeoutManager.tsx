import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Clock, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Power, 
  HelpCircle,
  Eye,
  AlertTriangle,
  Bell
} from "lucide-react";
import { User } from "../types";

interface SessionTimeoutManagerProps {
  currentUser: User | null;
  onLogout: () => void;
  onAddNotification: (title: string, message: string) => void;
}

// Inactivity limits in seconds for testing & user production guidelines
const IDLE_LIMIT = 120; // 2 minutes of complete inactivity
const WARNING_LIMIT = 30; // 30 seconds final countdown modal warning before auto-logout

export default function SessionTimeoutManager({
  currentUser,
  onLogout,
  onAddNotification,
}: SessionTimeoutManagerProps) {
  // Mode-switch helper: false if active, true if inactivity warning modal is shown
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_LIMIT);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [secondsSinceLastActivity, setSecondsSinceLastActivity] = useState(0);

  // Floating controls helper for testing
  const [showTesterWidget, setShowTesterWidget] = useState(false);

  // Keep references to active handles
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modalCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track live user actions to reset inactivity counter
  const resetActivityTime = () => {
    if (showWarningModal) return; // Frozen while modal is showing
    setLastActivity(new Date());
    setSecondsSinceLastActivity(0);
  };

  // Wire up page interaction listeners
  useEffect(() => {
    if (!currentUser) {
      // Clear timers and reset modal if user logged out
      setShowWarningModal(false);
      setSecondsSinceLastActivity(0);
      return;
    }

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    
    events.forEach(event => {
      window.addEventListener(event, resetActivityTime);
    });

    // Check inactivity every 1 second
    activityTimerRef.current = setInterval(() => {
      setSecondsSinceLastActivity(prev => {
        const nextSec = prev + 1;
        if (nextSec >= IDLE_LIMIT) {
          // Trigger Warning Prompt Mode
          setShowWarningModal(true);
          setCountdown(WARNING_LIMIT);
        }
        return nextSec;
      });
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTime);
      });
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [currentUser, showWarningModal]);

  // Modal Countdown decrement effect
  useEffect(() => {
    if (!showWarningModal) {
      if (modalCountdownTimerRef.current) clearInterval(modalCountdownTimerRef.current);
      return;
    }

    modalCountdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Time expired! Log them out
          handleForceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (modalCountdownTimerRef.current) clearInterval(modalCountdownTimerRef.current);
    };
  }, [showWarningModal]);

  const handleKeepLoggedIn = () => {
    setShowWarningModal(false);
    resetActivityTime();
    onAddNotification(
      "Session Secure Protected 🔐",
      "Your credentials has been secured. Your active terminal lease has been renewed."
    );
  };

  const handleForceLogout = () => {
    setShowWarningModal(false);
    onLogout();
    onAddNotification(
      "Session Terminated due to Inactivity ⏳",
      "You have been logged out securely to safeguard academic and placement records."
    );
  };

  // Immediate simulation of inactivity warning
  const simulateIdleTimeout = () => {
    setSecondsSinceLastActivity(IDLE_LIMIT - 1);
    setShowWarningModal(true);
    setCountdown(WARNING_LIMIT);
    onAddNotification(
      "Simulating Ideal Inactivity",
      "Drafting warning countdown modal simulation threshold."
    );
  };

  if (!currentUser) return null;

  // Percentage of idle threshold compiled
  const idleStatusProgress = Math.min(100, (secondsSinceLastActivity / IDLE_LIMIT) * 100);

  return (
    <>
      {/* Discreet micro indicator at top of screen or bottom left */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 select-none">
        
        {/* Collapsible toggle widget panel for quick evaluation */}
        <button
          onClick={() => setShowTesterWidget(!showTesterWidget)}
          className={`flex items-center gap-1.5 px-3 py-2 bg-neutral-950 border rounded-full text-[10px] uppercase font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer ${
            showTesterWidget 
              ? "border-amber-500 text-amber-400 shadow-lg shadow-amber-500/5 bg-neutral-900" 
              : "border-neutral-850 text-neutral-400 hover:border-neutral-800 hover:text-white"
          }`}
          title="See Live Session Security diagnostics"
        >
          <Lock className={`w-3 h-3 ${secondsSinceLastActivity > IDLE_LIMIT - 30 ? "text-amber-500 animate-pulse" : "text-emerald-500"}`} />
          <span>Session Shield</span>
        </button>

        {showTesterWidget && (
          <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center gap-3 animate-scaleUp text-left shadow-2xl relative">
            <div className="space-y-1 font-mono text-[9px] leading-tight">
              <p className="text-neutral-500 uppercase font-bold">Trace monitoring:</p>
              <p className="text-neutral-300">Idle time: <span className="text-white font-extrabold">{secondsSinceLastActivity}s</span> / {IDLE_LIMIT}s</p>
              
              {/* Simple inline tiny bar loader */}
              <div className="w-24 h-1 bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${idleStatusProgress > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${idleStatusProgress}%` }}
                />
              </div>
            </div>

            {/* Simulated timeout triggers */}
            <button
              onClick={simulateIdleTimeout}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded font-bold uppercase text-[8px] font-mono whitespace-nowrap cursor-pointer transition-all hover:scale-102 flex items-center gap-1"
              title="Skip wait and trigger warning modal instantly"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Simulate Idle</span>
            </button>
          </div>
        )}
      </div>

      {/* WARNING OVERLAY DIALOG MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-neutral-950 border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl relative overflow-hidden">
            
            {/* Glowing Orange Frame Top Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

            {/* Core warning body header with lock indicators */}
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-bounce text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-display uppercase tracking-wider">
                    Session Idle Timeout warning
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Security Gateway Watchdog
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Hi **{currentUser.name}**, you have been inactive for over <span className="font-extrabold text-white">2 minutes</span>. For your academic privacy and session security, your active workspace lease is about to expire.
                </p>

                {/* Highly Visual Numeric Tick Ring Column */}
                <div className="flex items-center gap-3 border-t border-neutral-850/60 pt-3">
                  <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                  <span className="text-xs text-neutral-300 font-mono">
                    Auto-Logout occurring in: <span className="text-amber-500 font-extrabold text-sm font-mono animate-ping tracking-tight">{countdown}s</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleKeepLoggedIn}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 shadow shadow-amber-500/15"
                >
                  <Unlock className="w-4 h-4 text-neutral-950" />
                  <span>Renew Active Lease</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceLogout}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Power className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>Logout Securely Now</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
