import React, { useState } from 'react';
import { 
  Bot, 
  Zap, 
  Rocket, 
  ShieldCheck, 
  BarChart3, 
  Target, 
  Sparkles
} from 'lucide-react';

interface StickerItem {
  id: string;
  emoji: string;
  title: string;
  badge: string;
  sub: string;
  icon: React.ElementType;
  gradient: string;
  borderGlow: string;
  shadowGlow: string;
  accentColor: string;
}

const STICKERS: StickerItem[] = [
  {
    id: 'agent-swarm',
    emoji: '🤖',
    title: 'Autonomous Swarm',
    badge: '5 Agents Online',
    sub: 'Sequential CrewAI Pipeline',
    icon: Bot,
    gradient: 'from-cyan-950/60 via-[#0e1938] to-[#0a1226]',
    borderGlow: 'border-cyan-400/60 hover:border-cyan-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(0,240,255,0.35),inset_0_0_10px_rgba(0,240,255,0.12)] hover:shadow-[0_0_26px_rgba(0,240,255,0.6)]',
    accentColor: 'text-cyan-400'
  },
  {
    id: 'gemini-flash',
    emoji: '⚡',
    title: 'Gemini 3.1 Flash',
    badge: 'Ultra Fast <90s',
    sub: 'Multimodal Neural Engine',
    icon: Zap,
    gradient: 'from-amber-950/60 via-[#231812] to-[#140e0a]',
    borderGlow: 'border-amber-400/60 hover:border-amber-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(245,158,11,0.35),inset_0_0_10px_rgba(245,158,11,0.12)] hover:shadow-[0_0_26px_rgba(245,158,11,0.6)]',
    accentColor: 'text-amber-400'
  },
  {
    id: 'growth-scale',
    emoji: '🚀',
    title: '10x Growth Velocity',
    badge: '+340% ROAS Scale',
    sub: 'Indian D2C & Quick-Comm',
    icon: Rocket,
    gradient: 'from-fuchsia-950/60 via-[#261033] to-[#14081c]',
    borderGlow: 'border-fuchsia-400/60 hover:border-fuchsia-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(217,70,239,0.35),inset_0_0_10px_rgba(217,70,239,0.12)] hover:shadow-[0_0_26px_rgba(217,70,239,0.6)]',
    accentColor: 'text-fuchsia-400'
  },
  {
    id: 'fact-checked',
    emoji: '🛡️',
    title: 'Zero Hallucinations',
    badge: '100% Fact Checked',
    sub: 'Deterministic Auditor Score',
    icon: ShieldCheck,
    gradient: 'from-emerald-950/60 via-[#0e261c] to-[#071611]',
    borderGlow: 'border-emerald-400/60 hover:border-emerald-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(16,185,129,0.35),inset_0_0_10px_rgba(16,185,129,0.12)] hover:shadow-[0_0_26px_rgba(16,185,129,0.6)]',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'data-profiling',
    emoji: '📊',
    title: 'Safe Pandas Analytics',
    badge: 'Deterministic CSV',
    sub: 'Zero Arbitrary Code Risk',
    icon: BarChart3,
    gradient: 'from-violet-950/60 via-[#1a1138] to-[#0e0921]',
    borderGlow: 'border-violet-400/60 hover:border-violet-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(139,92,246,0.35),inset_0_0_10px_rgba(139,92,246,0.12)] hover:shadow-[0_0_26px_rgba(139,92,246,0.6)]',
    accentColor: 'text-violet-400'
  },
  {
    id: 'omnichannel-plan',
    emoji: '🎯',
    title: 'Omnichannel Blueprint',
    badge: '30-Day Phased Plan',
    sub: 'Blinkit, Zepto, Amazon, D2C',
    icon: Target,
    gradient: 'from-rose-950/60 via-[#2b0e1a] to-[#16060c]',
    borderGlow: 'border-rose-400/60 hover:border-rose-300',
    shadowGlow: 'shadow-[0_0_16px_rgba(244,63,94,0.35),inset_0_0_10px_rgba(244,63,94,0.12)] hover:shadow-[0_0_26px_rgba(244,63,94,0.6)]',
    accentColor: 'text-rose-400'
  }
];

export function AnimatedStickersBar() {
  const [clickedSticker, setClickedSticker] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setClickedSticker(id);
    setTimeout(() => {
      setClickedSticker((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-4.5 bg-gradient-to-r from-[#111638]/95 via-[#181340]/95 to-[#101b3a]/95 border border-cyan-400/40 shadow-[0_0_28px_rgba(0,240,255,0.22),inset_0_0_18px_rgba(0,240,255,0.06)] backdrop-blur-2xl">
      {/* Background Static Radiant Glow Accents */}
      <div className="absolute -left-10 -top-10 w-52 h-52 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-fuchsia-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar for capabilities */}
      <div className="flex items-center justify-between mb-3 px-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-300">
            ✨ AI Engine Capabilities &amp; Static Neon Badges
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/35 font-semibold shadow-[0_0_10px_rgba(0,240,255,0.25)]">
            Static Neon Glow
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono font-bold text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Agent Swarm Verified</span>
        </div>
      </div>

      {/* Static Glowing Cards Row (No floating translations) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {STICKERS.map((s) => {
          const Icon = s.icon;
          const isSelected = clickedSticker === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              className={`relative text-left p-3.5 rounded-xl border bg-gradient-to-b ${s.gradient} ${s.borderGlow} ${s.shadowGlow} transition-all duration-200 backdrop-blur-md cursor-pointer select-none group/item active:scale-95 ${
                isSelected ? 'ring-2 ring-cyan-400 shadow-[0_0_32px_rgba(0,240,255,0.8)]' : ''
              }`}
              title={`${s.title} - ${s.sub}`}
            >
              {/* Luminous Emoji / Icon Pill */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/20 flex items-center justify-center text-lg shadow-inner group-hover/item:scale-105 transition-transform">
                  <span>{s.emoji}</span>
                </div>
                <Icon className={`w-4 h-4 ${s.accentColor} opacity-90 group-hover/item:scale-110 transition-transform`} />
              </div>

              {/* Title & Badge with Permanent Radiant Glow */}
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white tracking-tight line-clamp-1">
                  {s.title}
                </div>
                <div className={`text-[10px] font-mono font-bold ${s.accentColor} line-clamp-1`}>
                  {isSelected ? '✓ Active Mode' : s.badge}
                </div>
              </div>

              {/* Micro Subtitle */}
              <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[9px] text-slate-300 line-clamp-1 font-mono">
                {s.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
