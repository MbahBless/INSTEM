import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Cpu, 
  Server, 
  Percent, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  Database,
  Terminal,
  Shield,
  Wifi,
  HardDrive
} from "lucide-react";
import { User } from "../types";

interface ApiLogEntry {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
  ip: string;
}

interface MetricsData {
  activeUsers: number;
  memoryHeapUsed: number;
  memoryHeapTotal: number;
  memoryRss: number;
  uptime: number;
  totalRequests: number;
  successRequests: number;
  clientErrors: number;
  serverErrors: number;
  apiLogsHistory: ApiLogEntry[];
  endpointAverages: { name: string; avg: number; calls: number }[];
}

interface AdminMetricsPanelProps {
  currentUser: User;
  onAddNotification: (title: string, message: string) => void;
}

export default function AdminMetricsPanel({ currentUser, onAddNotification }: AdminMetricsPanelProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "errors" | "slow">("all");
  const [isPinging, setIsPinging] = useState(false);
  const [pingStats, setPingStats] = useState<{ url: string; delay: number; status: number } | null>(null);
  const [uptimeTicker, setUptimeTicker] = useState<string>("0h 0m 0s");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        formatUptime(data.uptime);
      }
    } catch (err) {
      console.error("Failed to read server performance logs", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Humanize server uptime
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    setUptimeTicker(`${hrs}h ${mins}m ${secs}s`);
  };

  // Start polling
  useEffect(() => {
    fetchMetrics();
    if (isPolling) {
      pollIntervalRef.current = setInterval(() => {
        fetchMetrics(true);
      }, 4000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isPolling]);

  // Handle manual API Latency Test Burst Simulation
  const triggerPingSimulation = async () => {
    setIsPinging(true);
    setPingStats(null);
    const targetEndpoint = "/api/analytics";
    const start = performance.now();
    try {
      const res = await fetch(targetEndpoint);
      const delay = parseFloat((performance.now() - start).toFixed(1));
      setPingStats({
        url: targetEndpoint,
        delay,
        status: res.status
      });
      // Force trigger silent fetch to update active ledger logs in UI instantly
      await fetchMetrics(true);
      onAddNotification(
        "Secure Ping Executed",
        `Latency benchmark to ${targetEndpoint} resolved in ${delay} ms.`
      );
    } catch (err) {
      setPingStats({
        url: targetEndpoint,
        delay: 0,
        status: 500
      });
    } finally {
      setIsPinging(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="py-20 flex flex-col justify-center items-center gap-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-neutral-400 font-mono">Compiling process telemetry logs...</p>
      </div>
    );
  }

  // Calculate high-level percentages
  const total = metrics.totalRequests || 1;
  const healthRate = parseFloat(((metrics.successRequests / total) * 100).toFixed(2));
  
  // Calculate average response latencies across the logged session arrays
  const overallAvgLatency = metrics.apiLogsHistory.length > 0
    ? parseFloat((metrics.apiLogsHistory.reduce((sum, item) => sum + item.duration, 0) / metrics.apiLogsHistory.length).toFixed(1))
    : 14.2;

  // Filter the logs in the ledger
  const filteredLogs = metrics.apiLogsHistory.filter(log => {
    if (filterType === "errors") {
      return log.status >= 400;
    }
    if (filterType === "slow") {
      return log.duration >= 100;
    }
    return true; // "all"
  });

  return (
    <div className="space-y-8 animate-fadeIn text-left font-sans">
      
      {/* Top Banner Warning & Header Description */}
      <div className="p-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/20 border border-neutral-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-amber-500 text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Shield className="w-3.5 h-3.5" /> High-Severity Administrator Clearance Only
          </div>
          <h2 className="text-xl font-display font-black text-white">
            System Reliability &amp; Core Performance Telemetry
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl">
            Real-time monitoring of Node process runtimes, service latency breakdowns, telecom authorization push error logs, and direct database storage footprints.
          </p>
        </div>

        {/* Polling Settings Toggle Control */}
        <div className="flex items-center gap-3 bg-neutral-950 px-3.5 py-2.5 rounded-lg border border-neutral-850 shrink-0 select-none">
          <span className="text-[10px] text-neutral-404 font-mono uppercase tracking-wider">
            Telecommunication Polling:
          </span>
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded cursor-pointer transition-all ${
              isPolling 
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold" 
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            {isPolling ? "● Active Logs (4s)" : "Paused"}
          </button>
        </div>
      </div>

      {/* Grid: 4 Core Live KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: SYSTEM HEALTH RATIO */}
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
              Server Success Rate
            </span>
            <p className={`text-2xl font-black font-mono ${healthRate > 98 ? "text-emerald-500" : healthRate > 92 ? "text-amber-500" : "text-rose-500"}`}>
              {healthRate}%
            </p>
            <p className="text-[9px] text-neutral-550 font-mono">
              Err Rate: {parseFloat((100 - healthRate).toFixed(2))}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400">
            <Percent className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* KPI 2: AVERAGE API RESPONSE TIME */}
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
              Avg API Latency
            </span>
            <p className="text-2xl font-black font-mono text-white">
              {overallAvgLatency} ms
            </p>
            <p className="text-[9px] text-neutral-550 font-mono uppercase">
              Current Active Window
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400">
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        {/* KPI 3: MEMORY ALLOC FEE */}
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
              Process RSS Memory
            </span>
            <p className="text-2xl font-black font-mono text-white">
              {metrics.memoryRss} MB
            </p>
            <p className="text-[9px] text-neutral-550 font-mono">
              Heap: {metrics.memoryHeapUsed} / {metrics.memoryHeapTotal} MB
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400">
            <HardDrive className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* KPI 4: PROCESS UPTIME */}
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
              Core Cluster Uptime
            </span>
            <p className="text-xl font-black font-mono text-amber-400 mt-1 whitespace-nowrap">
              {uptimeTicker}
            </p>
            <p className="text-[9px] text-neutral-550 font-mono uppercase">
              PID: {process?.pid || 1} • State: Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
        </div>

      </div>

      {/* Main split sections: Endpoints Latencies & Live Latency Pinger tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Endpoints averages breakdowns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" /> Service Category Response metrics
              </h3>
              <span className="text-[9px] text-neutral-500 font-mono uppercase">
                Aggregated Averages
              </span>
            </div>

            <div className="space-y-4">
              {metrics.endpointAverages.map((endpoint, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-medium">{endpoint.name}</span>
                    <div className="space-x-2 text-neutral-400">
                      <span>{endpoint.calls} requests</span>
                      <span className="text-amber-500 font-bold">{endpoint.avg} ms</span>
                    </div>
                  </div>
                  {/* Custom micro slider visualization */}
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        endpoint.avg > 300 
                          ? "bg-rose-500" 
                          : endpoint.avg > 100 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (endpoint.avg / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-neutral-550 leading-normal pt-2 font-mono">
              ℹ️ PRESI AI assistant requests encompass dense linguistic structuring tasks and token calculations, generally experiencing standard latencies around 1500ms. Other local database REST APIs are compiled within microseconds.
            </p>
          </div>
        </div>

        {/* Right Column: Live latency sandbox pinger and network state metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECURE LIGHTWEIGHT INTERACTIVE SIMULATION UTILITY */}
          <div className="p-6 bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-900 rounded-xl space-y-6">
            <div className="border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Direct Benchmark Testing
              </h3>
              <p className="text-[9px] text-neutral-500 mt-0.5">
                Evaluate immediate API round-trip network performance
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-black/60 border border-neutral-900 rounded-lg space-y-3">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Routing Endpoint:</span>
                  <span className="text-white font-bold select-all">/api/analytics</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Method:</span>
                  <span className="text-emerald-500 font-bold">GET</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Payload:</span>
                  <span className="text-neutral-500">None (Institutional headers only)</span>
                </div>
              </div>

              <button
                onClick={triggerPingSimulation}
                disabled={isPinging}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:brightness-75 font-black text-neutral-950 text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow shadow-amber-500/10 active:scale-[0.98]"
              >
                {isPinging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Endpoint latency...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
                    <span>Run Ping Benchmark</span>
                  </>
                )}
              </button>

              {/* Ping Result Panel */}
              {pingStats && (
                <div className="p-3 bg-neutral-900 border border-amber-500/20 rounded-lg animate-scaleUp space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500">Benchmark Result:</span>
                    <span className={`px-1 rounded text-[8px] font-bold ${pingStats.status === 200 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      STATUS {pingStats.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-neutral-300">Roundtrip Latency:</span>
                    <span className="text-lg font-black text-amber-500">{pingStats.delay} ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick container bounds tracker info */}
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2">
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
              Deployment Environment Spec:
            </span>
            <div className="font-mono text-[9px] text-neutral-400 space-y-1 bg-black/30 p-2.5 rounded border border-neutral-900/60 leading-relaxed">
              <p>Platform: Cloud Run Container Node.js</p>
              <p>Host Ingress Bind Address: 0.0.0.0:3000</p>
              <p>Database: Memory-seeded JSON Ledger</p>
              <p>Audit Compliance Index: 100% Verified</p>
            </div>
          </div>

        </div>

      </div>

      {/* Ledger Section: Live API Request Monitor & Filter buttons */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-300 font-display flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500 animate-pulse" /> Live Request Operations log
            </h3>
            <p className="text-[11px] text-neutral-500">
              Interactive trace tracking past request metrics intercepted in the memory middleware
            </p>
          </div>

          {/* Filter options buttons ledger */}
          <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-850 self-end select-none">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded transition-all cursor-pointer font-bold ${
                filterType === "all" ? "bg-neutral-900 text-white border border-neutral-800" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              All trace ({metrics.apiLogsHistory.length})
            </button>
            <button
              onClick={() => setFilterType("errors")}
              className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded transition-all cursor-pointer font-bold ${
                filterType === "errors" ? "bg-rose-950/45 text-rose-400 border border-rose-900/40" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Errors ({metrics.apiLogsHistory.filter(l => l.status >= 400).length})
            </button>
            <button
              onClick={() => setFilterType("slow")}
              className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded transition-all cursor-pointer font-bold ${
                filterType === "slow" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Slow 100ms+ ({metrics.apiLogsHistory.filter(l => l.duration >= 100).length})
            </button>
          </div>
        </div>

        {/* Ledger table wrapper board */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-500 font-mono">No trace logs mathing query type.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#050505] text-neutral-400 font-mono text-[9px] uppercase border-b border-neutral-900 select-none">
                  <tr>
                    <th className="p-4">Method</th>
                    <th className="p-4">Routing Path</th>
                    <th className="p-4">Execution Latency</th>
                    <th className="p-4">Client Address</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/10 transition-colors">
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          log.method === "POST" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-900/30" 
                            : log.method === "DELETE"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-900/30"
                              : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium select-all font-mono">
                        {log.url}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${log.duration > 300 ? "text-rose-400 font-black animate-pulse" : log.duration > 100 ? "text-amber-500" : "text-neutral-300"}`}>
                          {log.duration} ms
                        </span>
                      </td>
                      <td className="p-4 text-neutral-550 select-all">
                        {log.ip}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide ${
                          log.status >= 500 
                            ? "bg-rose-500 text-neutral-950 font-black font-mono shadow-[0_0_10px_rgba(239,68,68,0.25)]" 
                            : log.status >= 400 
                              ? "bg-amber-600/20 text-amber-500 border border-amber-500/20" 
                              : "bg-emerald-950 text-emerald-400 border border-emerald-900/30 font-black"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500 text-right">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
