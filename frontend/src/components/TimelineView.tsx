import { useState, useMemo } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Terminal, 
  Bot
} from "lucide-react";
import type { Task } from "../types";

interface TimelineViewProps {
  task: Task | null;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Strategic Supervisor": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    dot: "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
  },
  "Market Researcher": {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
  },
  "Quantitative Data Analyst": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
  },
  "Strategy Report Writer": {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
  },
  "Quality and Fact-Check Auditor": {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
  },
};

export const TimelineView: React.FC<TimelineViewProps> = ({ task, onToast }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const rawEvents = task?.events || [];

  const availableAgents = useMemo(() => {
    const set = new Set<string>();
    rawEvents.forEach((e) => {
      if (e.agent_name) set.add(e.agent_name);
    });
    return Array.from(set);
  }, [rawEvents]);

  const filteredEvents = useMemo(() => {
    return rawEvents.filter((event) => {
      const matchAgent = selectedAgent === "ALL" || event.agent_name.toLowerCase().includes(selectedAgent.toLowerCase());
      const matchSearch =
        !searchQuery ||
        event.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.agent_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAgent && matchSearch;
    });
  }, [rawEvents, selectedAgent, searchQuery]);

  const toggleExpand = (id: number) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLogs = () => {
    if (!filteredEvents.length) return;
    const text = filteredEvents
      .map(
        (e) =>
          `[${new Date(e.timestamp).toLocaleTimeString()}] [${e.agent_name}] [${e.event_type.toUpperCase()}]: ${e.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast("Execution trace logs copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Agent filter chips */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedAgent("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedAgent === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Events ({rawEvents.length})
          </button>
          {availableAgents.map((agent) => {
            const shortName = agent.split(" ")[0];
            const isActive = selectedAgent.toLowerCase() === agent.toLowerCase();
            return (
              <button
                key={agent}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trace events..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={!filteredEvents.length}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-50 transition-all shrink-0"
            title="Copy trace log to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Log"}</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="glass-panel p-6 rounded-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Execution Trace & Agent Telemetry</h3>
              <p className="text-xs text-slate-400">
                Synchronous CrewAI thought events, tool calls, and state transitions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{filteredEvents.length} Recorded Events</span>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-medium text-slate-300 mb-1">No Trace Events Available</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {rawEvents.length === 0
                ? "Execute a workflow from the Studio tab to stream real-time agent thoughts and tool executions."
                : "No events match the current filter criteria. Reset filters to view all entries."}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500/50 before:via-indigo-500/30 before:to-slate-800">
            {filteredEvents.map((evt, idx) => {
              const theme = AGENT_COLORS[evt.agent_name] || {
                bg: "bg-slate-800/40",
                text: "text-slate-300",
                border: "border-slate-700",
                dot: "bg-slate-400"
              };
              const isExpanded = !!expandedEvents[evt.id];
              const isError = evt.event_type.toLowerCase().includes("error") || evt.event_type.toLowerCase().includes("fail");
              const isSuccess = evt.event_type.toLowerCase().includes("finish") || evt.event_type.toLowerCase().includes("complete");

              return (
                <div key={evt.id || idx} className="relative group">
                  {/* Timeline Node Point */}
                  <div
                    className={`absolute -left-[30px] top-3.5 w-3 h-3 rounded-full border-2 border-slate-950 transition-transform group-hover:scale-125 ${
                      isError
                        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                        : isSuccess
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        : theme.dot
                    }`}
                  />

                  {/* Card Container */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm group-hover:bg-slate-900/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Agent Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          <Bot className="w-3 h-3" />
                          {evt.agent_name}
                        </span>

                        {/* Event Type Pill */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                            isError
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : isSuccess
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-900 text-slate-400 border-slate-800"
                          }`}
                        >
                          {evt.event_type}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
                      <p className={!isExpanded && evt.message.length > 220 ? "line-clamp-2" : ""}>
                        {evt.message}
                      </p>

                      {evt.message.length > 220 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(evt.id)}
                          className="mt-2 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Expand details <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
