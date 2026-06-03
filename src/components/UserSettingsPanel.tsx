import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Mail, 
  FileSpreadsheet, 
  Eye, 
  Save, 
  Check, 
  Loader2, 
  Lock, 
  Unlock, 
  Settings, 
  Info,
  Sliders,
  Server,
  CloudAlert,
  Moon,
  Palette
} from "lucide-react";
import { User, UserSettings } from "../types";

interface UserSettingsPanelProps {
  currentUser: User;
  onAddNotification: (title: string, message: string) => void;
  onSettingsSaved?: (updatedUser: User) => void;
}

export default function UserSettingsPanel({ 
  currentUser, 
  onAddNotification,
  onSettingsSaved 
}: UserSettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>({
    dataVisibility: "PUBLIC",
    emailFrequency: "WEEKLY",
    exportPreference: "PDF"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Local theme selector synchronization
  const [themePreference, setThemePreference] = useState<"midnight" | "charcoal">(() => {
    const saved = localStorage.getItem("app_theme");
    return saved === "charcoal" ? "charcoal" : "midnight";
  });

  // Track outer event signals to sync controls if Navbar changes it
  useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem("app_theme");
      setThemePreference(saved === "charcoal" ? "charcoal" : "midnight");
    };
    window.addEventListener("themechange", syncTheme);
    return () => window.removeEventListener("themechange", syncTheme);
  }, []);

  const changeThemePreference = (newTheme: "midnight" | "charcoal") => {
    setThemePreference(newTheme);
    localStorage.setItem("app_theme", newTheme);
    window.dispatchEvent(new Event("themechange"));
    onAddNotification(
      "Theme Variation Toggled",
      `System visual mode successfully customized to ${newTheme === "charcoal" ? "Deep Charcoal" : "Midnight Black"}.`
    );
  };

  // Fetch settings from server on mount or user switch
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${currentUser.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load user settings from DB", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/users/${currentUser.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        setSaveSuccess(true);
        if (onSettingsSaved && result.user) {
          onSettingsSaved(result.user);
        }
        onAddNotification(
          "Settings Modified",
          `System configurations for ${currentUser.name} successfully updated to the secure operational database.`
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error("Server responded with a non-OK status");
      }
    } catch (err) {
      console.error("Error saving user configurations", err);
      onAddNotification(
        "Update Failed",
        "Unable to authenticate secure writing to database. Please reload and retry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col justify-center items-center gap-2 bg-neutral-950 border border-neutral-900 rounded-lg">
        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
        <p className="text-xs font-mono text-neutral-400">Negotiating Configuration Layers...</p>
      </div>
    );
  }

  // Set descriptive messaging specifically per User role for maximum custom depth
  const getRoleDescriptors = () => {
    switch (currentUser.role) {
      case "STUDENT":
        return {
          title: "Student Placement Controls",
          desc: "Manage who can view your logbook hour reports, academic endorsements, and general contact listings across the university ecosystem.",
          visibilityOptions: [
            { value: "PUBLIC", label: "Public Broadcast", desc: "Visible to all accredited advisors, registrars, and corporate hiring sponsors." },
            { value: "RESTRICTED", label: "Restricted Cooperative", desc: "Only visible to your designated department advisor and actively interviewing companies." },
            { value: "PRIVATE", label: "Encrypted Log", desc: "Locked. Raw progress notes visible exclusively to the primary registrar." }
          ],
          emailDesc: "Syncs alert threads notifying you of report feedback, review grades, or new internship listings matching your technical disciplines."
        };
      case "COMPANY":
        return {
          title: "Corporate Visibility Settings",
          desc: "Control listing exposure levels, student candidate search capabilities, and supervisor analytics tracking preferences.",
          visibilityOptions: [
            { value: "PUBLIC", label: "Enterprise Public", desc: "Openly visible. Your internships and corporate profile are browsable by all active students." },
            { value: "RESTRICTED", label: "Cooperative Pipeline", desc: "Only visible to students affiliated with computing departments who possess matching skill thresholds." },
            { value: "PRIVATE", label: "Draft Sandbox Only", desc: "All postings are saved as internal private drafts. Invites are fully manual." }
          ],
          emailDesc: "Alert frequency setting controls candidate submission warnings, supervisor log sign-off prompts, and interview schedule logs."
        };
      case "SCHOOL":
        return {
          title: "Institutional Authority Controls",
          desc: "Audit exposure rules for comprehensive school analytics data, placement rates, and inter-department logs output templates.",
          visibilityOptions: [
            { value: "PUBLIC", label: "Transparent Academic Hub", desc: "Publicly broadcast overall placement counts and top sponsor companies stats." },
            { value: "RESTRICTED", label: "Internal Administrative Only", desc: "Hide charts details from public domains. Restrict view solely to verified educators." },
            { value: "PRIVATE", label: "Strict Secure Archives", desc: "Secure operational databases locked. All analytical indexes require dean credentials access." }
          ],
          emailDesc: "Controls automatic delivery times for administrative log audits, pending revisions alerts, and compliance milestones."
        };
      default:
        return {
          title: "Workspace Configuration Layer",
          desc: "Customize metadata settings, notification frequency, and export formats.",
          visibilityOptions: [
            { value: "PUBLIC", label: "Public Integration", desc: "Openly shared metadata structure." },
            { value: "RESTRICTED", label: "Restricted Node", desc: "Only visible to authenticated session nodes." },
            { value: "PRIVATE", label: "Strict Private", desc: "Private metadata encrypted." }
          ],
          emailDesc: "Controls the automated telemetry alerts dispatch frequency."
        };
    }
  };

  const info = getRoleDescriptors();

  return (
    <div id="settings-interface-card" className="p-6 md:p-8 bg-neutral-950 border border-neutral-900 rounded-lg text-left shadow-2xl relative overflow-hidden animate-fadeIn">
      
      {/* Visual Accent Corner Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-500/3 rounded-full blur-xl pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-yellow-500/15 text-yellow-500 border border-yellow-500/20">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{info.title}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-normal max-w-xl">
              {info.desc}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-yellow-500 uppercase tracking-widest shrink-0 self-stretch sm:self-auto text-center">
          Role: {currentUser.role}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 0: VISUAL THEME SELECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
            <Palette className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
              0. Visual Comfort & Interface Theme
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => changeThemePreference("midnight")}
              className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-4 select-none relative group h-full ${
                themePreference === "midnight" 
                  ? "bg-yellow-500/5 border-yellow-500/60 text-white" 
                  : "bg-black border-neutral-900 hover:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className={`p-2.5 rounded shrink-0 ${themePreference === "midnight" ? "bg-yellow-500/20 text-yellow-500" : "bg-neutral-900 text-neutral-500"}`}>
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-wide">Midnight Black</span>
                  {themePreference === "midnight" && <Check className="w-3.5 h-3.5 text-yellow-500" />}
                </div>
                <p className="text-[11px] text-neutral-405 text-neutral-400 leading-normal">
                  Obsidian layout. Extreme high-contrast pure black background for ultimate dark room comfort and OLED energy efficiencies.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => changeThemePreference("charcoal")}
              className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-4 select-none relative group h-full ${
                themePreference === "charcoal" 
                  ? "bg-yellow-500/5 border-yellow-500/60 text-white" 
                  : "bg-black border-neutral-900 hover:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className={`p-2.5 rounded shrink-0 ${themePreference === "charcoal" ? "bg-yellow-500/20 text-yellow-500" : "bg-neutral-900 text-neutral-500"}`}>
                <Palette className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-wide">Deep Charcoal</span>
                  {themePreference === "charcoal" && <Check className="w-3.5 h-3.5 text-yellow-500" />}
                </div>
                <p className="text-[11px] text-neutral-405 text-neutral-400 leading-normal">
                  Sleek stone canvas. Soft gray-charcoal matte tone layout optimal for warm visual acoustics and high long-term readability of metrics.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 1: DATA VISIBILITY CONFIGURE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
            <Eye className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
              1. Security & Data Visibility Permissions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {info.visibilityOptions.map((opt) => {
              const isSelected = settings.dataVisibility === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between select-none relative group h-full ${
                    isSelected 
                      ? "bg-yellow-500/5 border-yellow-500/60 text-white" 
                      : "bg-black border-neutral-900 hover:border-neutral-800 text-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="dataVisibility"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setSettings({ ...settings, dataVisibility: opt.value as any })}
                    className="sr-only"
                  />
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold tracking-wide">{opt.label}</span>
                      {isSelected ? (
                        opt.value === "PRIVATE" ? (
                          <Lock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        )
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-neutral-700 group-hover:border-neutral-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal mb-6">
                      {opt.desc}
                    </p>
                  </div>
                  
                  <span className="text-[9px] font-mono text-neutral-600 block border-t border-neutral-900/40 pt-2 shrink-0">
                    ID: ACCESS_{opt.value}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 2 & 3 DOUBLE COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* COLUMN A: EMAIL FREQUENCY */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
              <Mail className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                2. Automated Email Intervals
              </h3>
            </div>
            
            <p className="text-xs text-neutral-450 leading-relaxed min-h-[36px]">
              {info.emailDesc}
            </p>

            <div className="space-y-2">
              {([
                { value: "DAILY", label: "Daily Digests", desc: "Crucial for urgent reviews, deadlines & log audits." },
                { value: "WEEKLY", label: "Weekly Overviews", desc: "Optimized synthesis of operational metrics & applications." },
                { value: "MONTHLY", label: "Monthly Analytics", desc: "Long-term compliance history and end-of-term charts audit." },
                { value: "OFF", label: "Deactivated / Off", desc: "Completely silence recurring mailbox threads." }
              ]).map((it) => (
                <label
                  key={it.value}
                  className={`p-3 rounded border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    settings.emailFrequency === it.value
                      ? "bg-neutral-900 border-yellow-500/40 text-white"
                      : "bg-black border-neutral-900/60 hover:bg-neutral-910 text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value={it.value}
                      checked={settings.emailFrequency === it.value}
                      onChange={() => setSettings({ ...settings, emailFrequency: it.value as any })}
                      className="accent-yellow-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-semibold">{it.label}</p>
                      <p className="text-[10px] text-neutral-500">{it.desc}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-neutral-600 uppercase hidden sm:inline">{it.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* COLUMN B: EXPORT FORMAT PREFERENCE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
              <FileSpreadsheet className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                3. Download & Export Preferences
              </h3>
            </div>
            
            <p className="text-xs text-neutral-450 leading-relaxed min-h-[36px]">
              Determines the automated formatting target when triggering "Export Report" actions on placement audit logs.
            </p>

            <div className="space-y-4">
              {([
                { value: "PDF", name: "PDF Document (*.pdf)", ext: "PDF", desc: "Formatted styled document. Perfect for academic dean signatures or offline physical archiving of logs." },
                { value: "CSV", name: "CSV Spreadsheet (*.csv)", ext: "CSV", desc: "Tabular raw data stream. Import easily into Excel or Google Sheets for private department data math." },
                { value: "JSON", name: "JSON Structured Layout (*.json)", ext: "JSON", desc: "Raw declarative API database array. Ideal for external data migrations and system sync feeds." }
              ]).map((pref) => {
                const isSelected = settings.exportPreference === pref.value;
                return (
                  <div
                    key={pref.value}
                    onClick={() => setSettings({ ...settings, exportPreference: pref.value as any })}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-neutral-900 border-yellow-500/40 text-white" 
                        : "bg-black border-neutral-900/60 hover:bg-neutral-910 text-neutral-400"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-yellow-500" : "bg-neutral-700"}`} />
                        <span className="text-xs font-bold">{pref.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {pref.ext}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      {pref.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENT SETTINGS METADATA STATE */}
        <div className="p-4 bg-black border border-neutral-900 rounded-lg flex items-start gap-3 text-[11px] text-neutral-400 leading-normal">
          <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="text-white font-semibold">Active Encryption Roster Protocol</p>
            <p>Your current active system IP and credential states are bound. Updating configurations applies instantly to memory storage, logs triggers, and dynamic metadata filters.</p>
          </div>
        </div>

        {/* ACTION SUBMIT FOOTER PANEL */}
        <div className="pt-4 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
            <Server className="w-3.5 h-3.5 text-neutral-600" />
            <span>Database Node Server: <b>http://localhost:3000/api</b></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full sm:w-auto px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                saveSuccess
                  ? "bg-green-500 text-black font-semibold"
                  : "bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving Settings...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Saved Operational DB!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Apply Configurations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
