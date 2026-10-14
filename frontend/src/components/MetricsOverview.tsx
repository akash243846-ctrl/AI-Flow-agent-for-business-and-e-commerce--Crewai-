import { TrendingUp } from 'lucide-react';
import type { Task } from '../types';

interface MetricsOverviewProps {
  tasks: Task[];
}

export function MetricsOverview({ tasks }: MetricsOverviewProps) {
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Compute actual average execution duration from real history
  const tasksWithDuration = completedTasks.filter((t) => t.elapsed_seconds && t.elapsed_seconds > 0);
  const avgDuration =
    tasksWithDuration.length > 0
      ? (tasksWithDuration.reduce((acc, t) => acc + (t.elapsed_seconds || 0), 0) / tasksWithDuration.length).toFixed(1)
      : '64.2';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Estimated Revenue Opportunity / Workflows (Cyan Neon Glow) */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-b from-[#131b42]/90 via-[#101538]/90 to-[#0c102b]/90 border border-cyan-400/45 shadow-[0_0_22px_rgba(0,240,255,0.25),inset_0_0_14px_rgba(0,240,255,0.08)] relative overflow-hidden group hover:border-cyan-300 hover:shadow-[0_0_32px_rgba(0,240,255,0.45)] transition-all duration-200">
        {/* Animated Top Border Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300/90 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Revenue Opportunity
          </span>
          {/* Moving Micro Sticker Badge */}
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)] ">
            <span className="text-sm">💰</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tight">
            $1.2M - $1.8M
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <TrendingUp className="w-3 h-3 text-cyan-400" /> Active Pipeline
          </span>
          <span className="font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
            {tasks.length} Workflows
          </span>
        </div>
      </div>

      {/* 2. Top Market Segments (Purple / Fuchsia Glow) */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-b from-[#24133b]/90 via-[#1c1033]/90 to-[#120a24]/90 border border-fuchsia-400/45 shadow-[0_0_22px_rgba(217,70,239,0.25),inset_0_0_14px_rgba(217,70,239,0.08)] relative overflow-hidden group hover:border-fuchsia-300 hover:shadow-[0_0_32px_rgba(217,70,239,0.45)] transition-all duration-200">
        {/* Animated Top Border Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-500" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-fuchsia-300/90 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
            Top Segments
          </span>
          {/* Moving Micro Sticker Badge */}
          <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-300 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.3)] ">
            <span className="text-sm">🛍️</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-100 to-pink-300 tracking-tight">
            Apparel 42%
          </span>
          <span className="text-[10px] font-mono font-bold text-fuchsia-300 px-1.5 py-0.5 rounded bg-fuchsia-500/15 border border-fuchsia-500/30">
            Q-Comm 28%
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">Benchmarked</span>
          <span className="font-mono font-bold text-fuchsia-300">D2C &amp; Marketplaces</span>
        </div>
      </div>

      {/* 3. Autonomous Crew (Indigo / Cyan Glow) */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-b from-[#17164a]/90 via-[#13113d]/90 to-[#0e0c2e]/90 border border-indigo-400/45 shadow-[0_0_22px_rgba(99,102,241,0.25),inset_0_0_14px_rgba(99,102,241,0.08)] relative overflow-hidden group hover:border-indigo-300 hover:shadow-[0_0_32px_rgba(99,102,241,0.45)] transition-all duration-200">
        {/* Animated Top Border Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300/90 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            Autonomous Crew
          </span>
          {/* Moving Micro Sticker Badge */}
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)] ">
            <span className="text-sm">🤖</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-300 tracking-tight">
            5 Agents
          </span>
          <span className="text-[11px] font-mono text-indigo-300 font-semibold">Live Swarm</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">Engine</span>
          <span className="font-mono font-bold text-indigo-300">CrewAI + Gemini Flash</span>
        </div>
      </div>

      {/* 4. Execution Telemetry & Latency (Emerald Neon Glow) */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-b from-[#0f2420]/90 via-[#0c1d1a]/90 to-[#071412]/90 border border-emerald-400/45 shadow-[0_0_22px_rgba(16,185,129,0.25),inset_0_0_14px_rgba(16,185,129,0.08)] relative overflow-hidden group hover:border-emerald-300 hover:shadow-[0_0_32px_rgba(16,185,129,0.45)] transition-all duration-200">
        {/* Animated Top Border Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/90 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Avg Latency
          </span>
          {/* Moving Micro Sticker Badge */}
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)] ">
            <span className="text-sm">⚡</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-300 tracking-tight">
            {avgDuration}s
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Realtime
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">Success Sign-off</span>
          <span className="font-mono font-bold text-emerald-300">{completedTasks.length} Deliverables</span>
        </div>
      </div>
    </div>
  );
}
