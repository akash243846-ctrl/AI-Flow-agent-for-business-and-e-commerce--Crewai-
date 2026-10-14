import { useRef, useState } from 'react';
import {
  Sparkles,
  Terminal,
  Upload,
  FileSpreadsheet,
  X,
  Wand2,
  RotateCcw,
  Cpu,
  ArrowRight
} from 'lucide-react';

const PRESET_BLUEPRINTS = [
  {
    category: 'D2C E-Commerce',
    title: 'Indian Kidswear 30-Day Growth',
    prompt:
      'Research the Indian kidswear e-commerce market, analyze FirstCry, Hopscotch, and Myntra Kids dynamics, evaluate unit economics (AOV, CAC, RTO), and create an aggressive 30-day omnichannel growth plan.',
  },
  {
    category: 'Quick-Commerce',
    title: 'Blinkit/Zepto vs Amazon Margins',
    prompt:
      'Analyze the operational, margin, and dark store economics between selling on Quick-Commerce (Blinkit, Zepto, Swiggy Instamart) vs traditional Marketplaces (Amazon, Flipkart) for Indian CPG brands.',
  },
  {
    category: 'B2B SaaS',
    title: 'Enterprise Churn & CRM Pricing',
    prompt:
      'Evaluate B2B sales automation CRM tools for small and medium manufacturing enterprises in India. Analyze integration barriers, customer churn patterns, and a 30-day rollout roadmap.',
  },
  {
    category: 'Cross-Border',
    title: 'Shopify US/UAE Export Blueprint',
    prompt:
      'Formulate a cross-border e-commerce expansion blueprint for Indian home decor and apparel brands targeting US and GCC markets via Shopify, DHL logistics, and local payment gateways.',
  },
  {
    category: 'Performance Marketing',
    title: 'CAC/ROAS Unit Economics',
    prompt:
      'Develop a unit economics optimization framework for high-return D2C apparel brands. Address RTO (Return to Origin) reduction, Meta Ads CAC inflation, and retention strategies.',
  },
];

interface StudioWorkspaceProps {
  queryInput: string;
  setQueryInput: (val: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isSubmitting: boolean;
  executionSpeed: string;
  setExecutionSpeed: (val: string) => void;
  targetRegion: string;
  setTargetRegion: (val: string) => void;
  outputDeliverable: string;
  setOutputDeliverable: (val: string) => void;
  onLaunch: (e: React.FormEvent) => void;
  onEnhance: () => void;
  hasActiveTask: boolean;
  onBackToDeliverable: () => void;
}

export function StudioWorkspace({
  queryInput,
  setQueryInput,
  selectedFile,
  setSelectedFile,
  isSubmitting,
  executionSpeed,
  setExecutionSpeed,
  targetRegion,
  setTargetRegion,
  outputDeliverable,
  setOutputDeliverable,
  onLaunch,
  onEnhance,
  hasActiveTask,
  onBackToDeliverable,
}: StudioWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFileSelect(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.tsv')) {
      alert('Only .csv and .tsv dataset files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Studio Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 glass-panel rounded-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Terminal className="w-4 h-4" />
            <span>Studio Workspace v3.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            Universal Business &amp; E-Commerce Strategy Engine
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Orchestrate multi-agent autonomous crews powered by Google Gemini and live market intelligence to evaluate unit economics, analyze competitor moats, and synthesize board-ready blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {hasActiveTask && (
            <button
              type="button"
              onClick={onBackToDeliverable}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Back to Deliverables
            </button>
          )}

          <div className="bg-[#0A0E18] border border-white/[0.08] px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-slate-500">Active Crew</div>
              <div className="text-xs font-semibold text-slate-200">Gemini Flash Multi-Agent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Select Strategic Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider px-1">
          <span>Strategic Presets</span>
          <span className="text-cyan-400">5 Curated Blueprints</span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {PRESET_BLUEPRINTS.map((preset, idx) => {
            const colors = [
              { border: 'hover:border-cyan-400/50', glow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]', dot: 'bg-cyan-400', tag: 'text-cyan-300' },
              { border: 'hover:border-fuchsia-400/50', glow: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]', dot: 'bg-fuchsia-400', tag: 'text-fuchsia-300' },
              { border: 'hover:border-emerald-400/50', glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]', dot: 'bg-emerald-400', tag: 'text-emerald-300' },
              { border: 'hover:border-amber-400/50', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]', dot: 'bg-amber-400', tag: 'text-amber-300' },
              { border: 'hover:border-violet-400/50', glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]', dot: 'bg-violet-400', tag: 'text-violet-300' },
            ][idx % 5];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setQueryInput(preset.prompt)}
                className={`flex items-center gap-2 bg-[#0D121F]/90 hover:bg-[#151D30] text-slate-300 hover:text-white border border-white/[0.08] ${colors.border} ${colors.glow} px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 shadow-sm group active:scale-95`}
              >
                <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse group-hover:scale-125 transition-transform`} />
                <span className={`font-bold ${colors.tag}`}>{preset.category}:</span>
                <span className="text-slate-300 group-hover:text-white">{preset.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Creation Form: Bento Grid */}
      <form onSubmit={onLaunch} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Strategic Objective & Constraints */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group focus-within:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Strategic Objective, E-Commerce Query, or Challenge</span>
              </label>
              <div className="text-[11px] font-mono text-slate-500 bg-[#07090E] px-2.5 py-1 rounded-full border border-white/[0.06]">
                <span className={queryInput.length > 1800 ? 'text-amber-400' : 'text-slate-300'}>
                  {queryInput.length}
                </span>{' '}
                / 2,000 chars
              </div>
            </div>

            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter any business challenge, market expansion question, or e-commerce question... E.g., How can an Indian D2C footwear brand scale from Rs 10 Lakhs/month to Rs 1 Crore/month on Shopify? Include CAC reduction, Meta Ads funnels, supplier margin negotiations, and a 30-day action plan."
              required
              rows={6}
              className="w-full bg-[#07090E]/80 text-slate-200 placeholder:text-slate-600 p-4 rounded-xl border border-white/[0.08] focus:border-cyan-500/50 focus:outline-none transition-all resize-none text-sm leading-relaxed font-sans"
            />

            {/* Bottom Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-white/[0.06]">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                AI structured prompt synthesis enabled
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEnhance}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141C2E] hover:bg-[#1E293B] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-white/[0.08] transition-colors"
                >
                  <Wand2 className="w-3 h-3 text-cyan-400" />
                  <span>Enhance Prompt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141C2E] hover:bg-[#1E293B] text-slate-400 hover:text-white rounded-lg text-xs font-medium border border-white/[0.08] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Optional CSV Dataset Dropzone */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Dataset Ingestion</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Optional
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.tsv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-white/[0.1] hover:border-cyan-500/40 bg-[#07090E]/60 hover:bg-[#07090E]'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-200 mb-0.5">Drag &amp; drop file here</span>
              <span className="text-[11px] text-slate-500 font-mono mb-3">.csv, .tsv up to 10MB</span>
              <button
                type="button"
                className="px-3 py-1.5 bg-[#141C2E] text-slate-300 text-xs rounded-lg border border-white/[0.08] pointer-events-none"
              >
                Browse Files
              </button>
            </div>

            {/* Attached file preview chip */}
            {selectedFile && (
              <div className="mt-3 bg-[#07090E] border border-white/[0.08] p-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-medium text-slate-200 truncate">{selectedFile.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB ?" Pandas Profiling
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Parameters: 3 Columns Grid */}
        <div className="glass-panel rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Execution Speed</label>
            <select
              value={executionSpeed}
              onChange={(e) => setExecutionSpeed(e.target.value)}
              className="w-full bg-[#07090E] text-slate-200 border border-white/[0.08] rounded-xl px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none"
            >
              <option>Ultra-Fast (Flash / 1-pass)</option>
              <option>Deep Reasoning (Pro / 3-pass)</option>
              <option>Exhaustive Multi-Agent Crew</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Market Region</label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full bg-[#07090E] text-slate-200 border border-white/[0.08] rounded-xl px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none"
            >
              <option>India (Tier 1 &amp; Metro Focus)</option>
              <option>North America (US/CA)</option>
              <option>GCC / Middle East (UAE/KSA)</option>
              <option>Global / Cross-Border</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Output Deliverable</label>
            <select
              value={outputDeliverable}
              onChange={(e) => setOutputDeliverable(e.target.value)}
              className="w-full bg-[#07090E] text-slate-200 border border-white/[0.08] rounded-xl px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none"
            >
              <option>Executive Strategic Briefing (.PDF)</option>
              <option>Financial Model &amp; Unit Economics (.XLSX)</option>
              <option>Full Crew Code &amp; Markdown Repo</option>
            </select>
          </div>
        </div>

        {/* Kickoff Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Estimated runtime: ~45-90s across 5 parallel CrewAI agents</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !queryInput.trim()}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-xl ${
              isSubmitting || !queryInput.trim()
                ? 'bg-surface-container-high text-outline cursor-not-allowed border border-white/[0.05]'
                : 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed hover:opacity-95 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_28px_rgba(0,240,255,0.4)] hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Deploying Autonomous Crew...</span>
              </>
            ) : (
              <>
                <span>Deploy Autonomous Strategy Crew</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
