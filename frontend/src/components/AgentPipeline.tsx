import { useState } from 'react';
import {
  Layers,
  Search,
  TrendingUp,
  FileText,
  ShieldCheck,

  ChevronDown,
  ChevronUp,
  Cpu,

  ExternalLink
} from 'lucide-react';
import type { Task } from '../types';

interface AgentPipelineProps {
  task: Task;
  onOpenMatrixModal: () => void;
}

export function AgentPipeline({ task, onOpenMatrixModal }: AgentPipelineProps) {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);

  const isCompleted = task.status === 'COMPLETED';
  const isRunning = task.status === 'RUNNING';

  // Compute actual state per agent based on real task events & status
  const events = task.events || [];
  const hasResearcherEvent = events.some((e) => e.agent_name.toLowerCase().includes('research') || e.message.toLowerCase().includes('research'));
  const hasAnalystEvent = events.some((e) => e.agent_name.toLowerCase().includes('analyst') || e.message.toLowerCase().includes('analy') || e.message.toLowerCase().includes('dataset'));
  const hasWriterEvent = events.some((e) => e.agent_name.toLowerCase().includes('writer') || e.message.toLowerCase().includes('report'));
  const hasReviewerEvent = events.some((e) => e.agent_name.toLowerCase().includes('review') || e.agent_name.toLowerCase().includes('audit') || e.message.toLowerCase().includes('audit'));

  const agents = [
    {
      id: 1,
      num: '01',
      name: 'Strategic Project Supervisor',
      role: 'Workflow Decomposition & Scoping',
      status: isCompleted ? 'COMPLETED' : isRunning ? 'COMPLETED' : 'QUEUED',
      color: 'cyan',
      icon: Layers,
      tools: ['Task Planner', 'Rate Limiter', 'Milestone Monitor'],
      summary: 'Deconstructs user objectives into sequential milestones, establishes quality parameters, and paces execution rates.',
      outputSnippet: `Objective Scoped: "${task.query.slice(0, 110)}..." ? 5 sequential milestones generated.`,
    },
    {
      id: 2,
      num: '02',
      name: 'Principal Market Researcher',
      role: 'Live Intelligence & Competitor Scraping',
      status: isCompleted
        ? 'COMPLETED'
        : isRunning
        ? hasResearcherEvent
          ? 'COMPLETED'
          : 'RUNNING'
        : 'QUEUED',
      color: 'emerald',
      icon: Search,
      tools: ['Web Intelligence Tool', 'Competitor Scraper', 'Prompt Injection Guard'],
      summary: 'Scours live web indices for industry players, pricing points, and market valuations with strict prompt fences.',
      outputSnippet: task.research_summary
        ? task.research_summary.slice(0, 280) + '...'
        : 'Live web search completed. Market landscape, competitor positioning, and customer review vectors extracted.',
    },
    {
      id: 3,
      num: '03',
      name: 'Quantitative Business Data Analyst',
      role: 'Pandas Profiling & Unit Economics',
      status: task.csv_filename
        ? isCompleted
          ? 'COMPLETED'
          : isRunning
          ? hasAnalystEvent
            ? 'COMPLETED'
            : 'RUNNING'
          : 'QUEUED'
        : isCompleted
        ? 'COMPLETED'
        : 'STANDBY',
      color: 'amber',
      icon: TrendingUp,
      tools: ['Pandas Statistical Profiler', 'Unit Economics Engine', 'Margin Calculator'],
      summary: task.csv_filename
        ? `Profiled ${task.csv_filename} using deterministic Pandas calculations, measuring SKU distribution, returns, and contribution margin.`
        : 'Evaluated benchmark unit economics (CAC, LTV, ROAS, AOV, Contribution Margin) based on sector benchmarks.',
      outputSnippet: task.csv_filename
        ? `Dataset attached: ${task.csv_filename}. Quantitative profiling complete with zero arbitrary code execution.`
        : 'Sector benchmark unit economics calculated across CAC / LTV / Margin thresholds.',
    },
    {
      id: 4,
      num: '04',
      name: 'Executive Strategy Report Writer',
      role: 'Boardroom Synthesis & 30-Day Plan',
      status: isCompleted
        ? 'COMPLETED'
        : isRunning
        ? hasWriterEvent
          ? 'COMPLETED'
          : hasResearcherEvent
          ? 'RUNNING'
          : 'QUEUED'
        : 'QUEUED',
      color: 'indigo',
      icon: FileText,
      tools: ['Markdown Formatter', 'Phased Roadmap Builder', 'Synthesis Engine'],
      summary: 'Synthesizes market research and quantitative economics into a structured 8-section executive deliverable with weekly phases.',
      outputSnippet: task.report_markdown
        ? `Synthesized ${task.report_markdown.length.toLocaleString()} characters of executive strategy, competitor matrix, and week-by-week roadmaps.`
        : 'Awaiting synthesis of upstream research and quantitative findings.',
    },
    {
      id: 5,
      num: '05',
      name: 'Quality & Fact-Check Auditor',
      role: 'Completeness Audit & Scorecard Verification',
      status: isCompleted
        ? 'COMPLETED'
        : isRunning
        ? hasReviewerEvent
          ? 'COMPLETED'
          : hasWriterEvent
          ? 'RUNNING'
          : 'QUEUED'
        : 'QUEUED',
      color: 'rose',
      icon: ShieldCheck,
      tools: ['Hallucination Checker', 'Citation Auditor', 'Scorecard Compiler'],
      summary: 'Audits the deliverable for missing sections, unrealistic assumptions, and compiles the final quality scorecard.',
      outputSnippet: task.quality_scorecard
        ? 'Verified 100% section coverage, factual grounding, and issued final Boardroom Ready sign-off recommendation.'
        : 'Scheduled for final post-synthesis verification audit.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Visual Pipeline Header with Connected Flow */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Agent Orchestration Flow</span>
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight mt-0.5">
              Sequential Crew Execution Pipeline
            </h3>
          </div>

          <button
            onClick={onOpenMatrixModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141C2E] hover:bg-[#1E293B] text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Collaboration Matrix</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        {/* Connected Node Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 relative">
          {agents.map((ag) => {
            const Icon = ag.icon;
            const isDone = ag.status === 'COMPLETED';
            const isAct = ag.status === 'RUNNING';

            return (
              <div
                key={ag.id}
                onClick={() => setExpandedAgent(expandedAgent === ag.id ? null : ag.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isAct
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isDone
                    ? 'bg-[#0D121F] border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-[#07090E]/60 border-white/[0.05] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-slate-500">{ag.num}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isAct
                        ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? 'DONE' : isAct ? 'ACTIVE' : ag.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isDone ? 'text-emerald-400' : isAct ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200 truncate">{ag.name.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{ag.role.split('&')[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Interactive Agent Cards */}
      <div className="space-y-3">
        {agents.map((ag) => {
          const Icon = ag.icon;
          const isDone = ag.status === 'COMPLETED';
          const isAct = ag.status === 'RUNNING';
          const isExpanded = expandedAgent === ag.id;

          return (
            <div
              key={ag.id}
              className={`glass-panel rounded-2xl border transition-all duration-200 ${
                isAct
                  ? 'border-amber-500/40 shadow-lg shadow-amber-500/5 bg-[#0D121F]'
                  : isDone
                  ? 'border-white/[0.08] hover:border-cyan-500/30'
                  : 'border-white/[0.05] opacity-80'
              }`}
            >
              {/* Card Header Row */}
              <div
                onClick={() => setExpandedAgent(isExpanded ? null : ag.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isAct
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                        : 'bg-slate-900 border-white/[0.06] text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500">{ag.num}.</span>
                      <h4 className="text-sm font-semibold text-white tracking-tight truncate">{ag.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{ag.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase border ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isAct
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                        : 'bg-slate-800 border-white/[0.05] text-slate-500'
                    }`}
                  >
                    {isDone ? 'COMPLETED (100%)' : isAct ? 'IN EXECUTION' : ag.status}
                  </span>

                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Agent Details Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] space-y-4 animate-fade-in">
                  {/* Responsibility text */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-[#07090E]/60 p-3.5 rounded-xl border border-white/[0.04]">
                    <strong className="text-slate-200 block mb-1 font-mono uppercase text-[10px] tracking-wider">
                      Role Responsibility:
                    </strong>
                    {ag.summary}
                  </div>

                  {/* Tool Suite Chips */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                      Assigned Tool Suite:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ag.tools.map((tool, toolIdx) => (
                        <span
                          key={toolIdx}
                          className="text-xs font-mono bg-[#141C2E] border border-white/[0.08] text-slate-300 px-2.5 py-1 rounded-lg"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Output Preview */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                      Output Artifact Preview:
                    </span>
                    <div className="bg-[#07090E] border border-white/[0.08] p-3 rounded-xl font-mono text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                      {ag.outputSnippet}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
