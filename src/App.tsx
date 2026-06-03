import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PublicPages from "./components/PublicPages";
import AuthModal from "./components/AuthModal";
import StudentDashboard from "./components/StudentDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import SchoolDashboard from "./components/SchoolDashboard";
import SessionTimeoutManager from "./components/SessionTimeoutManager";
import { User, Notification } from "./types";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact" | "dashboard">("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [defaultAuthRole, setDefaultAuthRole] = useState<"STUDENT" | "COMPANY" | "SCHOOL">("STUDENT");
  const [loading, setLoading] = useState(true);

  // Theme variation switcher state
  const [theme, setTheme] = useState<"midnight" | "charcoal">(() => {
    const saved = localStorage.getItem("app_theme");
    return saved === "charcoal" ? "charcoal" : "midnight";
  });

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  // Load first default student session automatically for seamless preview
  useEffect(() => {
    mockAutoLogin();
  }, []);

  const mockAutoLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@instem.com", password: "password123" })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        fetchNotifications(data.user.id);
      }
    } catch (err) {
      console.error("Auto login process halted", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const list = await response.json();
        setNotifications(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab("dashboard");
    fetchNotifications(user.id);
  };

  const onLogout = () => {
    setCurrentUser(null);
    setNotifications([]);
    setActiveTab("home");
  };

  // Switch role helper for live interactive demo
  const handleSwitchUser = async (role: "STUDENT" | "COMPANY" | "SCHOOL") => {
    setLoading(true);
    let targetEmail = "student@instem.com";
    if (role === "COMPANY") targetEmail = "company@instem.com";
    if (role === "SCHOOL") targetEmail = "admin@instem.com";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: "password123" })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setActiveTab("dashboard");
        fetchNotifications(data.user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLocalNotification = async (title: string, message: string) => {
    if (!currentUser) return;
    const newNotif: Notification = {
      id: `notif_local_${Date.now()}`,
      userId: currentUser.id,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
  };

  const openAuthWithDefaultRole = (role: "STUDENT" | "COMPANY" | "SCHOOL" = "STUDENT") => {
    setDefaultAuthRole(role);
    setAuthOpen(true);
  };

  return (
    <div id="app-theme-root" className={`text-white min-h-screen flex flex-col justify-between font-sans selection:bg-yellow-500 selection:text-black bg-black ${
      theme === "charcoal" ? "theme-charcoal" : "theme-midnight"
    }`}>
      
      {/* Central Header Navigation */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuthWithDefaultRole}
        onLogout={onLogout}
        onSwitchUser={handleSwitchUser}
        onMarkAllNotificationsRead={handleMarkAllRead}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container viewport */}
      <main className="flex-grow">
        {loading ? (
          <div className="py-32 flex flex-col justify-center items-center gap-4">
            <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />
            <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
              Authorizing System Access...
            </p>
          </div>
        ) : (
          <>
            {/* PUBLIC NAVIGATION PANEL VIEWS */}
            {activeTab !== "dashboard" && (
              <PublicPages
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onGetStarted={() => openAuthWithDefaultRole("STUDENT")}
              />
            )}

            {/* DASHBOARD INTEGRATION ROUTER */}
            {activeTab === "dashboard" && currentUser && (
              <div className="animate-fadeIn">
                {currentUser.role === "STUDENT" && (
                  <StudentDashboard 
                    currentUser={currentUser} 
                    onAddNotification={handleAddLocalNotification}
                    onUserUpdate={setCurrentUser}
                  />
                )}
                {currentUser.role === "COMPANY" && (
                  <CompanyDashboard 
                    currentUser={currentUser} 
                    onAddNotification={handleAddLocalNotification}
                  />
                )}
                {currentUser.role === "SCHOOL" && (
                  <SchoolDashboard 
                    currentUser={currentUser} 
                    onAddNotification={handleAddLocalNotification}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Secure footer */}
      <Footer />

      {/* Auth Modal overlay drawer */}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={onLoginSuccess}
          defaultRole={defaultAuthRole}
        />
      )}

      {/* Persistent Security Inactivity monitor */}
      <SessionTimeoutManager
        currentUser={currentUser}
        onLogout={onLogout}
        onAddNotification={handleAddLocalNotification}
      />
    </div>
  );
}
