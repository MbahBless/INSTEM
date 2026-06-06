import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Mail, 
  MessageSquare, 
  User as UserIcon, 
  ChevronDown, 
  Bell, 
  Check, 
  LogOut, 
  Layers,
  Search as SearchIcon,
  X,
  Building2,
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  Info,
  ChevronRight,
  Moon,
  Palette
} from "lucide-react";
import { User, Notification, Internship } from "../types";
import LechindemAvatar from "./LechindemAvatar";

// Seed data for quick keyword matching of Academic Announcements
const ACADEMIC_ANNOUNCEMENTS = [
  {
    id: "ann_1",
    title: "Summer 2026 Term Registration Operational",
    category: "Academic Calendar",
    date: "June 01, 2026",
    author: "Dr. Robert Carter",
    content: "Registrar portals are now active for the Summer 2026 term. All students must sync their department codes (e.g. SE, IS, DS, TE) by the end of week 1 to ensure correct milestone progress tracking."
  },
  {
    id: "ann_2",
    title: "Mid-Term Logbook Progress Appraisal Deadline",
    category: "Milestones",
    date: "August 30, 2026",
    author: "Registrar Office",
    content: "The official deadline for mid-term progress validation and supervisor certification logs is August 30. Your student portal timeline percentage counts towards accreditation approval."
  },
  {
    id: "ann_3",
    title: "Industry Cooperative Forum Day",
    category: "Career Fair",
    date: "June 15, 2026",
    author: "Dept. of Computing",
    content: "Goldman Tech Solutions, Matrix Systems, and other partner engineering firms will conduct live campus information panels in Computational Theater C on June 15 at 10:00 AM UTC."
  },
  {
    id: "ann_4",
    title: "Logbook Audits & Hour Lock Requirements",
    category: "Regulation",
    date: "June 03, 2026",
    author: "Dean of Computer Science",
    content: "Effective immediately, all cooperative internship positions require logging a minimum of 30 authenticated working hours per week. Failure to submit progress notes triggers revision requests."
  }
];

// Seed data for Corporate Partners Profiles
const COMPONENT_COMPANIES = [
  {
    id: "comp_1",
    name: "Goldman Tech Solutions",
    location: "San Francisco, CA / Remote",
    industry: "Enterprise SaaS & Sandbox Tech",
    description: "An industry leader in container environments and real-time frontend synchronization services. Proud primary hiring sponsor of active INSTEM students.",
    website: "https://goldmantech.example.com",
    contact: "recruitment@goldmantech.example.com"
  },
  {
    id: "comp_2",
    name: "Matrix Systems Labs",
    location: "New York, NY",
    industry: "Artificial Intelligence & Database Scaling",
    description: "Builders of high-throughput backend architecture systems, specializing in TypeScript API servers, relational database layouts, and search indices.",
    website: "https://matrixsystems.example.com",
    contact: "careers@matrixsystems.example.com"
  },
  {
    id: "comp_3",
    name: "Quantum Cryptography Hub",
    location: "Austin, TX / Hybrid",
    industry: "Cybersecurity & Document Verification",
    description: "Developing safe watermarking and layout security tools. Active monitors of cryptographic compliance matrices for academic institutions.",
    website: "https://quantumcipher.example.com",
    contact: "talent@quantumcipher.example.com"
  }
];

interface NavbarProps {
  currentUser: User | null;
  notifications: Notification[];
  activeTab: "home" | "about" | "contact" | "dashboard";
  setActiveTab: (tab: "home" | "about" | "contact" | "dashboard") => void;
  onOpenAuth: (defaultRole?: "STUDENT" | "COMPANY" | "SCHOOL") => void;
  onLogout: () => void;
  onSwitchUser: (role: "STUDENT" | "COMPANY" | "SCHOOL") => void;
  onMarkAllNotificationsRead: () => void;
  theme: "midnight" | "charcoal";
  setTheme: (theme: "midnight" | "charcoal") => void;
}

export default function Navbar({
  currentUser,
  notifications,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  onMarkAllNotificationsRead,
  theme,
  setTheme
}: NavbarProps) {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<"all" | "internships" | "companies" | "announcements">("all");
  const [dbInternships, setDbInternships] = useState<Internship[]>([]);
  
  // Selected search item for detail popover modal
  const [selectedResultItem, setSelectedResultItem] = useState<{
    type: "internship" | "company" | "announcement";
    data: any;
  } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read);

  // Fetch internships list for global search index updates
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await fetch("/api/internships");
        if (res.ok) {
          const list = await res.json();
          setDbInternships(list);
        }
      } catch (err) {
        console.error("Failed to load internships database for search index", err);
      }
    };
    fetchInternships();
  }, [currentUser]);

  // Click outside to close search result dropdown box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Keyboard Hotkey Listener: ⌘K or Ctrl+K to focus search bar
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Matching algorithm
  const q = searchQuery.toLowerCase().trim();

  const matchedInternships = q ? dbInternships.filter(item => 
    item.title.toLowerCase().includes(q) ||
    item.companyName.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.department.toLowerCase().includes(q) ||
    item.requirements.some(r => r.toLowerCase().includes(q))
  ) : [];

  const matchedCompanies = q ? COMPONENT_COMPANIES.filter(item => 
    item.name.toLowerCase().includes(q) ||
    item.industry.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.location.toLowerCase().includes(q)
  ) : [];

  const matchedAnnouncements = q ? ACADEMIC_ANNOUNCEMENTS.filter(item => 
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q) ||
    item.author.toLowerCase().includes(q)
  ) : [];

  // Counts
  const totalMatchesCount = matchedInternships.length + matchedCompanies.length + matchedAnnouncements.length;

  const handleItemClick = (type: "internship" | "company" | "announcement", data: any) => {
    setSelectedResultItem({ type, data });
    setShowSearchResults(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-neutral-800 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0" 
          onClick={() => setActiveTab("home")}
        >
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-yellow-500/20 gold-glow">
            <Briefcase className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="hidden xs:block">
            <span className="font-display text-xl font-bold tracking-wider text-white">
              IN<span className="text-yellow-500">STEM</span>
            </span>
            <p className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase leading-none mt-0.5">
              Systems Management
            </p>
          </div>
        </div>

        {/* Navigation links (kept clean and distinct) */}
        <nav className="hidden xl:flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveTab("home")}
            className={`font-display text-xs lg:text-sm font-medium tracking-wide transition-colors ${
              activeTab === "home" ? "text-yellow-500" : "text-neutral-400 hover:text-white"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`font-display text-xs lg:text-sm font-medium tracking-wide transition-colors ${
              activeTab === "about" ? "text-yellow-500" : "text-neutral-400 hover:text-white"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`font-display text-xs lg:text-sm font-medium tracking-wide transition-colors ${
              activeTab === "contact" ? "text-yellow-500" : "text-neutral-400 hover:text-white"
            }`}
          >
            Contact
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-display text-xs lg:text-sm font-medium tracking-wide transition-colors ${
                activeTab === "dashboard" ? "text-yellow-500 underline decoration-yellow-500 decoration-2 underline-offset-8" : "text-neutral-400 hover:text-white"
              }`}
            >
              Go To Dashboard
            </button>
          )}
        </nav>

        {/* BRAND NEW GLOBAL SEARCH BAR COLUMN */}
        <div ref={searchContainerRef} className="relative flex-grow max-w-sm lg:max-w-md mx-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search internships, partners, policies..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/80 rounded-full pl-9 pr-14 py-2 text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 focus:ring-1 focus:ring-yellow-500/15"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden lg:block absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-neutral-700 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                ⌘K
              </span>
            )}
          </div>

          {/* Floater dropdown popover */}
          {showSearchResults && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl z-50 max-h-[440px] overflow-hidden flex flex-col">
              
              {/* Category tabs header */}
              <div className="flex border-b border-neutral-900 bg-black/60 text-[10px] font-mono scrollbar-none overflow-x-auto">
                <button
                  onClick={() => setActiveSearchTab("all")}
                  className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap ${
                    activeSearchTab === "all" ? "border-yellow-500 text-yellow-500 font-bold bg-neutral-900/40" : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  All ({totalMatchesCount})
                </button>
                <button
                  onClick={() => setActiveSearchTab("internships")}
                  className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap ${
                    activeSearchTab === "internships" ? "border-yellow-500 text-yellow-500 font-bold bg-neutral-900/40" : "border-transparent text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Jobs ({matchedInternships.length})
                </button>
                <button
                  onClick={() => setActiveSearchTab("companies")}
                  className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap ${
                    activeSearchTab === "companies" ? "border-yellow-500 text-yellow-500 font-bold bg-neutral-900/40" : "border-transparent text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Companies ({matchedCompanies.length})
                </button>
                <button
                  onClick={() => setActiveSearchTab("announcements")}
                  className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap ${
                    activeSearchTab === "announcements" ? "border-yellow-500 text-yellow-500 font-bold bg-neutral-900/40" : "border-transparent text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Announcements ({matchedAnnouncements.length})
                </button>
              </div>

              {/* Matches List area */}
              <div className="overflow-y-auto p-2 bg-black/40 divide-y divide-neutral-900/40">
                {totalMatchesCount === 0 && (
                  <div className="py-8 px-4 text-center">
                    <Info className="w-5 h-5 text-neutral-700 mx-auto mb-1.5" />
                    <p className="text-xs text-neutral-500">No matches found for "{searchQuery}"</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Try typing "frontend", "deadline", or "goldman"</p>
                  </div>
                )}

                {/* 1. INTERNSHIPS SECTOR */}
                {(activeSearchTab === "all" || activeSearchTab === "internships") && matchedInternships.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick("internship", item)}
                    className="w-full text-left p-3 hover:bg-neutral-900/60 transition-colors flex items-start gap-2.5 rounded group"
                  >
                    <div className="w-7 h-7 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-white group-hover:text-yellow-500 transition-colors line-clamp-1">{item.title}</h4>
                        <span className="text-[9px] font-mono text-yellow-500/80 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded shrink-0">{item.stipend}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{item.companyName} • {item.location}</p>
                      <span className="inline-block mt-1 text-[8px] font-mono text-neutral-500 uppercase">Sector: {item.department}</span>
                    </div>
                  </button>
                ))}

                {/* 2. COMPANIES SECTOR */}
                {(activeSearchTab === "all" || activeSearchTab === "companies") && matchedCompanies.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick("company", item)}
                    className="w-full text-left p-3 hover:bg-neutral-900/60 transition-colors flex items-start gap-2.5 rounded group"
                  >
                    <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-yellow-500 transition-colors">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{item.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] font-mono text-neutral-500 uppercase">{item.industry}</span>
                        <span className="text-[8px] font-mono text-neutral-600">• {item.location}</span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* 3. ANNOUNCEMENTS SECTOR */}
                {(activeSearchTab === "all" || activeSearchTab === "announcements") && matchedAnnouncements.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick("announcement", item)}
                    className="w-full text-left p-3 hover:bg-neutral-900/60 transition-colors flex items-start gap-2.5 rounded group"
                  >
                    <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-white group-hover:text-yellow-500 transition-colors line-clamp-1">{item.title}</h4>
                        <span className="text-[8px] font-mono text-neutral-500 shrink-0 ml-1">{item.date}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{item.content}</p>
                      <span className="inline-block mt-1 text-[8px] font-mono text-neutral-500 uppercase">Policy Notice</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Informational Footer stamp */}
              <div className="px-3 py-2 bg-neutral-900/40 border-t border-neutral-800 text-[9px] font-mono text-neutral-500 flex justify-between items-center shrink-0">
                <span>Use keywords like "React" or "Deadline"</span>
                <span className="text-yellow-500 font-bold">{totalMatchesCount} matches</span>
              </div>

            </div>
          )}
        </div>

        {/* Right control drawer / CTA status / user channels */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Universal Theme switcher */}
          <button
            onClick={() => setTheme(theme === "midnight" ? "charcoal" : "midnight")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-medium rounded border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer font-mono"
            title="Toggle theme variation"
            id="theme-toggler-navbar"
          >
            {theme === "midnight" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-yellow-500" />
                <span className="hidden sm:inline">Theme: Midnight</span>
              </>
            ) : (
              <>
                <Palette className="w-3.5 h-3.5 text-yellow-500" />
                <span className="hidden sm:inline">Theme: Charcoal</span>
              </>
            )}
          </button>

          {/* Contact details */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <a
              href="mailto:lechindemmbah@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-yellow-500 transition-all"
              title="Mail Support Desk"
            >
              <Mail className="w-3 h-3 text-yellow-500" />
              <span className="hidden xl:inline">lechindemmbah@gmail.com</span>
            </a>
          </div>

          {currentUser ? (
            <>
              {/* Simulator controller trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRoleSwitcher(!showRoleSwitcher);
                    setShowNotifDropdown(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-medium rounded border border-yellow-500/20 text-yellow-500 font-mono"
                  title="Toggle actor perspective roles"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Role: {currentUser.role}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-52 bg-neutral-950 border border-neutral-800 rounded shadow-2xl py-1 z-50">
                    <div className="px-3 py-1.5 border-b border-neutral-900">
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                        Developer Switcher
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSwitchUser("STUDENT");
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-910 flex items-center justify-between ${
                        currentUser.role === "STUDENT" ? "text-yellow-500 font-semibold bg-neutral-900/30" : "text-neutral-300"
                      }`}
                    >
                      <span>Experience Student UI</span>
                      {currentUser.role === "STUDENT" && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser("COMPANY");
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-910 flex items-center justify-between ${
                        currentUser.role === "COMPANY" ? "text-yellow-500 font-semibold bg-neutral-900/30" : "text-neutral-300"
                      }`}
                    >
                      <span>Experience Company UI</span>
                      {currentUser.role === "COMPANY" && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser("SCHOOL");
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-910 flex items-center justify-between ${
                        currentUser.role === "SCHOOL" ? "text-yellow-500 font-semibold bg-neutral-900/30" : "text-neutral-300"
                      }`}
                    >
                      <span>Experience School UI</span>
                      {currentUser.role === "SCHOOL" && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Notification bell controls */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowRoleSwitcher(false);
                  }}
                  className="relative p-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-950 border border-neutral-800 rounded shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-neutral-900 flex justify-between items-center bg-black/50">
                      <span className="text-xs font-semibold text-white">Notifications</span>
                      {unreadNotifs.length > 0 && (
                        <button 
                          onClick={onMarkAllNotificationsRead}
                          className="text-[10px] text-yellow-500 hover:underline font-mono"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-neutral-500 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-900/65">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-3 text-left transition-colors ${
                              notif.read ? "bg-transparent" : "bg-neutral-900/30"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-semibold text-white leading-tight">{notif.title}</h4>
                              <span className="text-[8px] text-neutral-500 font-mono shrink-0">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 leading-normal">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile button badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                {currentUser.role === "STUDENT" ? (
                  <LechindemAvatar className="w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:block text-right">
                  <p className="text-[11px] font-semibold text-white leading-none">{currentUser.name}</p>
                  <p className="text-[9px] text-neutral-500 font-mono leading-none mt-1">{currentUser.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded hover:bg-red-950/20 hover:text-red-500 text-neutral-500 transition-colors cursor-pointer"
                  title="Sign Out Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenAuth("STUDENT")}
                className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-2 rounded hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("STUDENT")}
                className="text-xs font-semibold text-black px-3.5 py-2 rounded bg-yellow-500 hover:bg-yellow-400 font-display transition-all cursor-pointer shadow shadow-yellow-500/15"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* FLOATING DETAIL DIALOG OVERLAY PORTAL */}
      {selectedResultItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-lg w-full overflow-hidden shadow-2.5xl flex flex-col gold-glow">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-900 bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-yellow-500/10 text-yellow-500 text-[9px] font-mono uppercase tracking-widest font-semibold border border-yellow-500/20">
                  {selectedResultItem.type} Record
                </span>
                <span className="text-xs text-neutral-500 font-mono">ID CODE: {selectedResultItem.data.id}</span>
              </div>
              <button 
                onClick={() => setSelectedResultItem(null)}
                className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[480px]">
              
              {/* Type 1: Internship Modal Detail representation */}
              {selectedResultItem.type === "internship" && (
                <>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white">{selectedResultItem.data.title}</h3>
                    <p className="text-sm text-yellow-500 font-semibold mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 inline" /> {selectedResultItem.data.companyName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-neutral-900">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-neutral-600 uppercase font-mono">Location</p>
                        <p className="text-neutral-200 mt-0.5">{selectedResultItem.data.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <DollarSign className="w-3.5 h-3.5 text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-neutral-600 uppercase font-mono">Stipend / Salary</p>
                        <p className="text-neutral-200 mt-0.5">{selectedResultItem.data.stipend}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-neutral-600 uppercase font-mono">Duration</p>
                        <p className="text-neutral-200 mt-0.5">{selectedResultItem.data.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Briefcase className="w-3.5 h-3.5 text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-neutral-600 uppercase font-mono">Classification</p>
                        <p className="text-neutral-200 mt-0.5">{selectedResultItem.data.type || "Full-time"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Job Description</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-3 rounded border border-neutral-900">
                      {selectedResultItem.data.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Requirements & Tech Specs</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(selectedResultItem.data.requirements) ? selectedResultItem.data.requirements.map((req: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-200">
                          {req}
                        </span>
                      )) : (
                        <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-200">
                          {selectedResultItem.data.requirements}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Type 2: Company Modal Detail representation */}
              {selectedResultItem.type === "company" && (
                <>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-yellow-500" />
                      {selectedResultItem.data.name}
                    </h3>
                    <p className="text-xs text-yellow-500 mt-1 uppercase tracking-wider font-mono">Specialization: {selectedResultItem.data.industry}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-900">
                    <div className="text-xs">
                      <p className="text-[9px] text-neutral-600 uppercase font-mono">Corporate Location</p>
                      <p className="text-neutral-300 font-medium mt-0.5">{selectedResultItem.data.location}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-[9px] text-neutral-600 uppercase font-mono">Inquiry Contact</p>
                      <p className="text-neutral-300 font-medium mt-0.5 font-mono text-[10px]">{selectedResultItem.data.contact}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Company Profile & Mission</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-3.5 rounded border border-neutral-900">
                      {selectedResultItem.data.description}
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Website Address:</span>
                    <a 
                      href={selectedResultItem.data.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-yellow-500 hover:underline flex items-center gap-1"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </>
              )}

              {/* Type 3: Announcement Modal Detail representation */}
              {selectedResultItem.type === "announcement" && (
                <>
                  <div>
                    <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10 uppercase">
                      {selectedResultItem.data.category}
                    </span>
                    <h3 className="text-lg font-display font-bold text-white mt-2 leading-tight">
                      {selectedResultItem.data.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-y border-neutral-900 text-xs text-neutral-400 font-mono">
                    <span>Published: {selectedResultItem.data.date}</span>
                    <span>Author: {selectedResultItem.data.author}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">Official Circular</h4>
                    <span className="p-1 px-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-mono inline-block mb-2">
                      Academic Oversight Board Directive
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed bg-black/40 p-4 rounded border border-neutral-900 whitespace-pre-line">
                      {selectedResultItem.data.content}
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded flex items-start gap-2.5 text-[11px] text-neutral-400 leading-normal">
                    <Clock className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <span>Directive targets all registered students enrolled in active workspace placements. Keep timelines and journals strictly verified to prevent accreditation flags.</span>
                  </div>
                </>
              )}

            </div>

            {/* Modal CTA footer */}
            <div className="px-6 py-4.5 border-t border-neutral-900 bg-black/40 flex justify-between items-center gap-4">
              <div className="text-xs text-neutral-500 font-mono">
                {currentUser ? `Active user: ${currentUser.role}` : "Sign in required for actions"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedResultItem(null)}
                  className="px-4 py-2 rounded text-neutral-400 hover:text-white border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
                >
                  Close Record
                </button>
                {selectedResultItem.type === "internship" && (
                  <button
                    onClick={() => {
                      setSelectedResultItem(null);
                      setActiveTab("dashboard");
                    }}
                    className="px-4.5 py-2 rounded text-black bg-yellow-500 hover:bg-yellow-400 text-xs font-semibold font-mono transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Dashboard Pipeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
