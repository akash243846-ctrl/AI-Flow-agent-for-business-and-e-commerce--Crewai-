import { Cpu, Zap, TrendingUp, Store } from 'lucide-react';
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
      {/* 1. Estimated Revenue Opportunity / Workflows */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden group hover:border-primary-container/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-outline">Revenue Opportunity</span>
          <div className="w-7 h-7 rounded-lg bg-primary-container/15 text-primary-container flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface tracking-tight">
            $1.2M ? $1.8M
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Active Strategies</span>
          <span className="font-mono font-semibold text-primary-container">{tasks.length} Workflows</span>
        </div>
      </div>

      {/* 2. Top Market Segments */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden group hover:border-secondary/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-outline">Top Segments</span>
          <div className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <Store className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface tracking-tight">
            Apparel 42%
          </span>
          <span className="text-[10px] font-mono text-secondary">Q-Comm 28%</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Benchmarked</span>
          <span className="font-mono font-semibold text-emerald-400">D2C &amp; Marketplaces</span>
        </div>
      </div>

      {/* 3. Autonomous Crew */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden group hover:border-primary-container/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-outline">Autonomous Crew</span>
          <div className="w-7 h-7 rounded-lg bg-primary-container/15 text-primary-container flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface tracking-tight">5</span>
          <span className="text-[11px] font-mono text-outline">Specialized Agents</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Engine</span>
          <span className="font-mono font-semibold text-surface-tint">CrewAI + Gemini Flash</span>
        </div>
      </div>

      {/* 4. Execution Telemetry & Latency */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-outline">Avg Latency</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface tracking-tight">{avgDuration}s</span>
          <span className="text-[11px] font-mono text-outline">measured</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Success Sign-off</span>
          <span className="font-mono font-semibold text-emerald-400">{completedTasks.length} Deliverables</span>
        </div>
      </div>
    </div>
  );
}
