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
  Palette,
  Clock,
  CreditCard,
  ArrowUpRight,
  Download,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Activity
} from "lucide-react";
import { User, UserSettings } from "../types";

interface UserSettingsPanelProps {
  currentUser: User;
  onAddNotification: (title: string, message: string) => void;
  onSettingsSaved?: (updatedUser: User) => void;
}

interface TransactionItem {
  id: string;
  amount: string;
  plan: string;
  provider: "momo" | "om" | "visa" | "mastercard";
  date: string;
  status: "SUCCESS" | "UPGRADED" | "REFUNDED" | "FAILED" | "PENDING";
  itemDesc: string;
  txnRef: string;
}

export default function UserSettingsPanel({ 
  currentUser, 
  onAddNotification,
  onSettingsSaved 
}: UserSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"preferences" | "billing">("preferences");
  
  const [settings, setSettings] = useState<UserSettings>({
    dataVisibility: "PUBLIC",
    emailFrequency: "WEEKLY",
    exportPreference: "PDF"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Billing states
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedChangePlan, setSelectedChangePlan] = useState<"monthly" | "annual">("annual");
  const [changeProvider, setChangeProvider] = useState<"momo" | "om">("momo");
  const [changePhone, setChangePhone] = useState(currentUser.phoneNumber || "+237 ");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [billingPromptStep, setBillingPromptStep] = useState<"idle" | "form" | "ussd" | "done">("idle");
  const [billingLog, setBillingLog] = useState("");

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

  // Load and seed transactions list based on user settings state
  useEffect(() => {
    const storageKey = `sub_history_${currentUser.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to parse saved transactions, re-seeding...", e);
      }
    }

    // Seed transaction list based on current user status
    let seedData: TransactionItem[] = [];
    const dateToday = new Date().toISOString();
    const dateOneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTwoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    if (currentUser.isPremium) {
      if (currentUser.subscriptionPlan === "annual") {
        seedData = [
          {
            id: `txn_${Date.now() - 100000}`,
            amount: "10,000 FCFA",
            plan: "Scholar VIP Annual",
            provider: "momo",
            date: dateToday,
            status: "SUCCESS",
            itemDesc: "PRESI Premium Annual Active Lease - MTN MoMo",
            txnRef: `TX-ANN-${Math.floor(100000 + Math.random() * 900000)}`
          },
          {
            id: `txn_${Date.now() - 200000}`,
            amount: "1,000 FCFA",
            plan: "Starter Monthly Support",
            provider: "om",
            date: dateOneMonthAgo,
            status: "UPGRADED",
            itemDesc: "Plan Switch Upgrade Adjustment - Orange Money",
            txnRef: `TX-MNT-${Math.floor(100000 + Math.random() * 900000)}`
          },
          {
            id: `txn_${Date.now() - 300000}`,
            amount: "1,000 FCFA",
            plan: "Starter Monthly Support",
            provider: "momo",
            date: dateTwoMonthsAgo,
            status: "SUCCESS",
            itemDesc: "PRESI Premium Monthly Active Lease - MTN MoMo",
            txnRef: `TX-MNT-${Math.floor(100000 + Math.random() * 900000)}`
          }
        ];
      } else {
        seedData = [
          {
            id: `txn_${Date.now() - 100000}`,
            amount: "1,000 FCFA",
            plan: "Starter Monthly Support",
            provider: "momo",
            date: dateToday,
            status: "SUCCESS",
            itemDesc: "PRESI Premium Monthly Active Lease - MTN MoMo",
            txnRef: `TX-MNT-${Math.floor(100000 + Math.random() * 900000)}`
          },
          {
            id: `txn_${Date.now() - 300005}`,
            amount: "1,000 FCFA",
            plan: "Starter Monthly Support",
            provider: "om",
            date: dateOneMonthAgo,
            status: "SUCCESS",
            itemDesc: "PRESI Premium Monthly Active Lease - Orange Money",
            txnRef: `TX-MNT-${Math.floor(100000 + Math.random() * 900000)}`
          }
        ];
      }
    } else {
      seedData = [
        {
          id: `txn_${Date.now() - 500000}`,
          amount: "0 FCFA",
          plan: "Free Tier",
          provider: "momo",
          date: dateOneMonthAgo,
          status: "SUCCESS",
          itemDesc: "Baseline Free Academic Tier Active",
          txnRef: `TX-FREE-${Math.floor(100000 + Math.random() * 900000)}`
        }
      ];
    }

    setTransactions(seedData);
    localStorage.setItem(storageKey, JSON.stringify(seedData));
  }, [currentUser.id, currentUser.isPremium, currentUser.subscriptionPlan]);

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

  // Subscription action triggers
  const handleProcessChangePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = changePhone.trim();
    if (!cleanPhone || cleanPhone === "+237") {
      alert("Please enter a valid Mobile Money phone number.");
      return;
    }

    setIsChangingPlan(true);
    setBillingPromptStep("ussd");
    setBillingLog("1. Initiating secure telecom gateway handshake...");

    setTimeout(() => {
      setBillingLog("2. Emitted secure carrier PIN-push request on handset...");
      
      setTimeout(() => {
        setBillingLog("3. Authorized. Deducting corresponding tokens from account...");

        setTimeout(async () => {
          try {
            const res = await fetch(`/api/users/${currentUser.id}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan: selectedChangePlan,
                paymentMethod: changeProvider,
                phoneNumber: cleanPhone
              })
            });

            if (res.ok) {
              const data = await res.json();
              
              // Create dynamic ledger invoice record
              const newTxn: TransactionItem = {
                id: `txn_${Date.now()}`,
                amount: selectedChangePlan === "annual" ? "10,000 FCFA" : "1,000 FCFA",
                plan: selectedChangePlan === "annual" ? "Scholar VIP Annual" : "Starter Monthly Support",
                provider: changeProvider,
                date: new Date().toISOString(),
                status: "SUCCESS",
                itemDesc: `Plan Activation: PRESI ${selectedChangePlan === "annual" ? "Annual" : "Monthly"} Scholar VIP - ${changeProvider === "om" ? "Orange Money" : "MTN MoMo"}`,
                txnRef: `TX-${selectedChangePlan === "annual" ? "ANN" : "MNT"}-${Math.floor(100000 + Math.random() * 900000)}`
              };

              const updatedTransactions = [newTxn, ...transactions];
              setTransactions(updatedTransactions);
              localStorage.setItem(`sub_history_${currentUser.id}`, JSON.stringify(updatedTransactions));

              onAddNotification(
                "PRESI Subscriptions Modified 👑",
                `Your plan has been changed smoothly to ${selectedChangePlan === "annual" ? "Annual VIP Tier" : "Starter Monthly Support"}.`
              );

              setBillingPromptStep("done");
              setTimeout(() => {
                if (onSettingsSaved && data.user) {
                  onSettingsSaved(data.user);
                }
                setBillingPromptStep("idle");
              }, 1800);
            } else {
              alert("Payment verification has timed out. Please check your current wallet balance.");
              setBillingPromptStep("form");
            }
          } catch (err) {
            console.error(err);
            alert("Connection error in checkout gate. Restoring plan state.");
            setBillingPromptStep("form");
          } finally {
            setIsChangingPlan(false);
          }
        }, 1200);
      }, 1000);
    }, 850);
  };

  const handleDowngradePlan = () => {
    setIsChangingPlan(true);
    setTimeout(() => {
      const newTxn: TransactionItem = {
        id: `txn_${Date.now()}`,
        amount: "0 FCFA",
        plan: "Starter Monthly Support",
        provider: "momo",
        date: new Date().toISOString(),
        status: "PENDING",
        itemDesc: "Pending Downgrade: Scheduled Starter Monthly transition (Effective next cycle transition)",
        txnRef: `TX-DWN-${Math.floor(100000 + Math.random() * 900000)}`
      };

      const revisedUser: User = {
        ...currentUser,
        subscriptionPlan: "monthly"
      };

      const updatedTxns = [newTxn, ...transactions];
      setTransactions(updatedTxns);
      localStorage.setItem(`sub_history_${currentUser.id}`, JSON.stringify(updatedTxns));

      onAddNotification(
        "Plan Downgrade Programmed ⏳",
        "Your transition to Starter Monthly has been logged and scheduled to trigger on expiration of current VIP lease."
      );
      if (onSettingsSaved) {
        onSettingsSaved(revisedUser);
      }
      setIsChangingPlan(false);
    }, 1000);
  };

  const handleCancelPlan = () => {
    setIsChangingPlan(true);
    setTimeout(() => {
      const newTxn: TransactionItem = {
        id: `txn_${Date.now()}`,
        amount: "0 FCFA",
        plan: "Free Tier",
        provider: "momo",
        date: new Date().toISOString(),
        status: "PENDING",
        itemDesc: "Pending Termination request: Revert to standard learning tier",
        txnRef: `TX-CAN-${Math.floor(100000 + Math.random() * 900000)}`
      };

      const revisedUser: User = {
        ...currentUser,
        isPremium: false,
        subscriptionPlan: undefined,
        subscriptionExpiresAt: undefined
      };

      const updatedTxns = [newTxn, ...transactions];
      setTransactions(updatedTxns);
      localStorage.setItem(`sub_history_${currentUser.id}`, JSON.stringify(updatedTxns));

      onAddNotification(
        "Subscription Scheduled for Cancel 🔴",
        "Your premium auto-renewal settings have been successfully disabled. No further transactions occur."
      );
      if (onSettingsSaved) {
        onSettingsSaved(revisedUser);
      }
      setIsChangingPlan(false);
    }, 1000);
  };

  const simulateDownloadInvoice = (txn: TransactionItem) => {
    onAddNotification(
      "Receipt Compiled Successfully 📥",
      `Invoice receipt compiled for TXN Ref ${txn.txnRef} (${txn.amount}). Started local download.`
    );
    
    // Create direct mock file download in browser
    const fileContent = `INSTEM PRESI SCHOLAR VIP RECEIPT\n` +
      `====================================\n` +
      `Transaction Ref: ${txn.txnRef}\n` +
      `User ID: ${currentUser.id}\n` +
      `Email: ${currentUser.email}\n` +
      `Item Description: ${txn.itemDesc}\n` +
      `Amount paid: ${txn.amount}\n` +
      `Channel Node: ${txn.provider.toUpperCase()} Mobile Money\n` +
      `Timestamp: ${new Date(txn.date).toLocaleString()}\n` +
      `Status Key: ${txn.status}\n` +
      `====================================\n` +
      `🔐 Secure placement monitoring certificate issued by INSTEM Academic Hub.`;
      
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_Receipt_${txn.txnRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBillingCycleProgress = () => {
    if (!currentUser.isPremium || !currentUser.subscriptionExpiresAt) {
      return { percentage: 0, daysLeft: 0, totalDays: 30, text: "No active commercial billing cycle." };
    }

    const expiryDate = new Date(currentUser.subscriptionExpiresAt);
    const today = new Date();
    const msDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    
    const totalDays = currentUser.subscriptionPlan === "annual" ? 365 : 30;
    const percentage = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

    return {
      percentage,
      daysLeft,
      totalDays,
      text: `${daysLeft} days remaining of ${totalDays}-day billing cycle.`
    };
  };

  const cycle = getBillingCycleProgress();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-yellow-500/15 text-yellow-500 border border-yellow-500/20">
            <Settings className="w-5 h-5" />
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

      {/* INNER TAB INTEGRATION BLOCK */}
      <div className="flex items-center gap-2 border-b border-neutral-900 mb-6 pb-0.5 select-none text-[12px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2 font-bold tracking-wide transition-all duration-150 border-b-2 cursor-pointer relative ${
            activeTab === "preferences"
              ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Preferences & Visibility
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 font-bold tracking-wide transition-all duration-150 border-b-2 cursor-pointer relative flex items-center gap-1.5 ${
            activeTab === "billing"
              ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Subscription History</span>
          {currentUser.isPremium && (
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {activeTab === "preferences" ? (
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
                  <p className="text-[11px] text-neutral-400 leading-normal">
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
                  <p className="text-[11px] text-neutral-400 leading-normal">
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
              
              <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px]">
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
              
              <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px]">
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
      ) : (
        /* ==================== SUBSCRIPTION HISTORY TAB ==================== */
        <div className="space-y-8 animate-fadeIn">
          
          {/* CURRENT SUBSCRIPTION METADATA STATE AND BILLING GAUGE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Status card */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Current Account Level</span>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${currentUser.isPremium ? "bg-amber-500/20 text-amber-500" : "bg-neutral-800 text-neutral-500"}`}>
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                    {currentUser.isPremium 
                      ? `${currentUser.subscriptionPlan === "annual" ? "Annual" : "Monthly"} Scholar VIP` 
                      : "Free Standard Tier"}
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {currentUser.isPremium 
                    ? "Enjoy boundless educational assistance, smart formatting models, and unlimited questions."
                    : "Standard placement dashboard. Upgrade to bypass daily AI model limits."}
                </p>
              </div>

              {currentUser.isPremium && currentUser.subscriptionExpiresAt && (
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                  <span>Expiration date:</span>
                  <span className="text-white font-bold">{new Date(currentUser.subscriptionExpiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Billing Cycle Gauge Card */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-850 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Active Billing Cycle Status</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Time Left Assessment lease</h4>
                  </div>
                  <Clock className="w-4 h-4 text-neutral-500" />
                </div>
                
                {/* Custom Visual progress bar */}
                <div className="mt-4 space-y-2">
                  <div className="w-full h-2 rounded-full h-2 bg-black border border-neutral-850 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        cycle.percentage > 50 
                          ? "bg-gradient-to-r from-yellow-500 to-amber-500" 
                          : cycle.percentage > 15 
                            ? "bg-amber-500" 
                            : "bg-red-500 animate-pulse"
                      }`}
                      style={{ width: `${currentUser.isPremium ? cycle.percentage : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                    <span>{currentUser.isPremium ? "Cycle lease active" : "No cycle tracking"}</span>
                    <span className="text-white font-extrabold">{currentUser.isPremium ? `${cycle.daysLeft} days left` : "Inactive"}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 italic mt-3 leading-tight leading-normal">
                {currentUser.isPremium 
                  ? `Your subscription tier auto-renews dynamically via MTN/Orange MoMo gateway. Next transaction occurs: ${new Date(currentUser.subscriptionExpiresAt || "").toLocaleDateString()}`
                  : "Deploy premium capabilities starting at 1,000 FCFA/mo. Choose MTN MoMo or Orange Money."}
              </p>
            </div>
          </div>

          {/* INTERACTIVE PLAN CHANGES PANEL */}
          <div className="p-5 md:p-6 bg-black border border-neutral-900 rounded-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
              <Activity className="w-4 h-4 text-yellow-500" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Subscription Control & Plan Switches
              </h3>
            </div>

            {billingPromptStep === "idle" && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1 max-w-xl">
                  <p className="text-xs font-bold text-white">Need to upgrade or change billing tiers?</p>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Toggle instantly between the **Starter Monthly Plan (1,000 FCFA)** or the **Scholar VIP Annual Plan (10,000 FCFA)**. Plan upgrades calculates unused value dynamically and adds adjustment invoice records.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  {!currentUser.isPremium ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChangePlan("annual");
                        setBillingPromptStep("form");
                      }}
                      className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-black font-mono tracking-wider text-[10px] uppercase rounded cursor-pointer"
                    >
                      Configure Premium Subscription
                    </button>
                  ) : (
                    <>
                      {currentUser.subscriptionPlan === "monthly" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChangePlan("annual");
                            setBillingPromptStep("form");
                          }}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black font-mono tracking-wider text-[10px] uppercase rounded cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-black/10" />
                          <span>Upgrade to VIP Annual (Save 16%)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChangePlan("monthly");
                            setBillingPromptStep("form");
                          }}
                          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white border border-neutral-800 text-neutral-300 font-bold font-mono text-[10px] uppercase rounded cursor-pointer"
                        >
                          Switch to Starter Monthly Target
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isChangingPlan}
                        onClick={handleDowngradePlan}
                        className="px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-400 text-[10px] font-mono hover:text-amber-500 cursor-pointer rounded"
                        title="Program downgrade to take effect at end of cycle"
                      >
                        Downgrade Tier
                      </button>

                      <button
                        type="button"
                        disabled={isChangingPlan}
                        onClick={handleCancelPlan}
                        className="px-3 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-red-500 hover:bg-red-500/5 text-[10px] font-mono cursor-pointer rounded"
                        title="Disable autorenew on current plan"
                      >
                        Cancel Auto-Renew
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* FORM STEP IN CHECKOUT WIZARD */}
            {billingPromptStep === "form" && (
              <form onSubmit={handleProcessChangePlan} className="space-y-4 animate-scaleUp max-w-lg">
                <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white uppercase">
                      Confirming Selected Billing Adjustment:
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      Switching to **{selectedChangePlan.toUpperCase()}** Scholars level
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20 font-mono">
                    {selectedChangePlan === "annual" ? "10,000" : "1,000"} FCFA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 font-mono uppercase">MTN / Orange Carrier</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setChangeProvider("momo")}
                        className={`flex-1 py-2 text-xs font-bold rounded border cursor-pointer select-none transition-all text-center ${
                          changeProvider === "momo"
                            ? "bg-yellow-500 bg-yellow-500/10 border-yellow-500 text-yellow-500"
                            : "bg-black border-neutral-850 text-neutral-500"
                        }`}
                      >
                        MTN MoMo
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangeProvider("om")}
                        className={`flex-1 py-2 text-xs font-bold rounded border cursor-pointer select-none transition-all text-center ${
                          changeProvider === "om"
                            ? "bg-orange-500/10 border-orange-500 text-orange-500"
                            : "bg-black border-neutral-850 text-neutral-500"
                        }`}
                      >
                        Orange Money
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 font-mono uppercase">Phone number</label>
                    <input
                      type="tel"
                      required
                      value={changePhone}
                      onChange={(e) => setChangePhone(e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="+237 677 88 99 00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBillingPromptStep("idle")}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded text-xs font-mono cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded cursor-pointer"
                  >
                    Activate Checkout Request
                  </button>
                </div>
              </form>
            )}

            {/* USSD CHANNELS LOADER LOG */}
            {billingPromptStep === "ussd" && (
              <div className="py-6 text-center space-y-4 animate-pulse max-w-sm mx-auto">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">Routing USSD Carrier Prompts...</h4>
                  <p className="text-[10px] text-amber-500 font-mono">{billingLog}</p>
                </div>
              </div>
            )}

            {/* SUCCESS WIDGET ACTION DONE */}
            {billingPromptStep === "done" && (
              <div className="py-6 text-center space-y-3 animate-scaleUp max-w-xs mx-auto">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Payment Confirmed and Logged</h4>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    VIP Scholars features has been compiled. Updating settings dashboard layers...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* HISTORICAL PAYMENTS DATABASE TABLE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Historical Receipts & Transaction Ledger
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-neutral-900 text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date/Time</th>
                    <th className="py-3 px-4">Receipt ID / Ref</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Carrier Channel</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/60 font-mono text-[11px] text-neutral-300">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400">
                        {new Date(txn.date).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-white">
                        {txn.txnRef}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-200">
                        {txn.itemDesc}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded text-[9px] uppercase text-neutral-400 font-bold">
                          {txn.provider.toUpperCase()} MoMo
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-amber-500 font-bold whitespace-nowrap">
                        {txn.amount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          txn.status === "SUCCESS" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                            : txn.status === "UPGRADED"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : txn.status === "REFUNDED"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => simulateDownloadInvoice(txn)}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-850 hover:border-neutral-800 rounded transition-colors text-[9px] font-mono cursor-pointer inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-2.5 h-2.5 text-neutral-500" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs italic font-sans">
                        No transactions recorded in secure workspace vault. Upgrade to VIP level to generate ledgers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-neutral-900/40 border border-neutral-900 rounded text-[10px] text-neutral-500 leading-normal font-sans">
              🔒 **Compliance Statement:** All INSTEM billing systems are encrypted using state-of-the-art TLS tunnels and standard mobile aggregators securely. Direct carrier logs can be requested via student administrative offices.
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
