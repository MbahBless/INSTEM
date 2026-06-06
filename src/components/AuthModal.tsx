import React, { useState } from "react";
import { User, ShieldCheck, Lock, Mail, Users, Check, X, GraduationCap, Building2 } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  defaultRole?: "STUDENT" | "COMPANY" | "SCHOOL";
}

export default function AuthModal({ onClose, onLoginSuccess, defaultRole = "STUDENT" }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "COMPANY" | "SCHOOL">(defaultRole);
  
  // Registration parameters
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = isRegister 
      ? { email, password, name, role, companyName, department, studentId }
      : { email, password };

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication procedure failed.");
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl relative">
        
        {/* Absolute exit button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-900 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-left">
          {/* Header branding */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded bg-yellow-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <span className="font-display text-sm font-semibold text-yellow-500 uppercase tracking-widest">
              Secure Auth Terminal
            </span>
          </div>

          <h2 className="text-2xl font-display font-medium text-white mb-2">
            {isRegister ? "Join INSTEM Matrix" : "Authenticating Access"}
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            {isRegister 
              ? "Establish your role key to access interactive pipelines." 
              : "Verify your credentials for student, company, or institute portals."}
          </p>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-500 text-xs rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for register */}
            {isRegister && (
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Lechindem Mbah Bless"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  placeholder="student@instem.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role Selection (Registered only) */}
            {isRegister && (
              <>
                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-2">
                    Select Identity Key
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("STUDENT")}
                      className={`py-2 px-1 rounded border text-center font-display transition-all ${
                        role === "STUDENT" 
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" 
                          : "border-neutral-800 bg-black text-neutral-400"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[10px]">Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("COMPANY")}
                      className={`py-2 px-1 rounded border text-center font-display transition-all ${
                        role === "COMPANY" 
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" 
                          : "border-neutral-800 bg-black text-neutral-400"
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[10px]">Company</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("SCHOOL")}
                      className={`py-2 px-1 rounded border text-center font-display transition-all ${
                        role === "SCHOOL" 
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" 
                          : "border-neutral-800 bg-black text-neutral-400"
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[10px]">School</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Fields based on Role selection */}
                {role === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="SE-2024-089"
                        className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">
                        Academic major
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Software Eng"
                        className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>
                )}

                {role === "COMPANY" && (
                  <div className="animate-fadeIn">
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">
                      Corporate Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Goldman Tech Solutions"
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                )}

                {role === "SCHOOL" && (
                  <div className="animate-fadeIn">
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase mb-1">
                      Faculty / Department
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science Dean"
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-black bg-yellow-500 hover:bg-yellow-400 py-2.5 rounded font-bold text-xs uppercase tracking-wider mt-4 cursor-pointer transition-all disabled:opacity-40"
            >
              {loading ? "Transmitting state..." : isRegister ? "Register Credentials" : "Authorize Session Key"}
            </button>
          </form>

          {/* Quick Demo Pre-seed Tip */}
          {!isRegister && (
            <div className="mt-4 p-3 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 leading-normal">
              <span className="text-yellow-500 font-semibold font-mono">Tip:</span> Ready-made preview users: <br />
              <b className="text-white">student@instem.com</b> / <b className="text-white">password123</b> (Lechindem Mbah Bless)<br />
              <b className="text-white">company@instem.com</b> or <b className="text-white">admin@instem.com</b> with same password.
            </div>
          )}

          {/* Toggle register switch */}
          <div className="mt-6 pt-4 border-t border-neutral-900 text-center">
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsRegister(!isRegister);
              }}
              className="text-white hover:text-yellow-500 text-xs font-mono select-none"
            >
              {isRegister 
                ? "Already registered? Initiate Authentication" 
                : "Need platform credentials? Register Here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
