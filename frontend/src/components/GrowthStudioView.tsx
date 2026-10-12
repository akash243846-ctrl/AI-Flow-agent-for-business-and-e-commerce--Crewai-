import { useState, useMemo } from 'react';
import {
  Percent,
  Sparkles,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  Bot
} from 'lucide-react';

interface GrowthStudioViewProps {
  onApplyToStudio?: (promptSnippet: string) => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function GrowthStudioView({ onApplyToStudio, onToast }: GrowthStudioViewProps) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [monthlySpend, setMonthlySpend] = useState<number>(200000);
  const [aov, setAov] = useState<number>(2450);
  const [cac, setCac] = useState<number>(580);
  const [rtoRate, setRtoRate] = useState<number>(14);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(62);
  const [copied, setCopied] = useState<boolean>(false);

  const currSymbol = currency === 'INR' ? '?' : '$';

  // Live Calculations
  const metrics = useMemo(() => {
    const rawOrders = Math.max(1, Math.floor(monthlySpend / Math.max(1, cac)));
    const rtoCount = Math.floor(rawOrders * (rtoRate / 100));
    const deliveredOrders = Math.max(0, rawOrders - rtoCount);
    
    const grossRevenue = deliveredOrders * aov;
    const cogs = grossRevenue * (1 - grossMarginPct / 100);
    // Reverse logistics cost per RTO order (~120 INR or $3)
    const rtoReverseCost = rtoCount * (currency === 'INR' ? 140 : 3.5);
    const netProfit = grossRevenue - cogs - monthlySpend - rtoReverseCost;
    const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const roas = monthlySpend > 0 ? (grossRevenue / monthlySpend).toFixed(2) : '0';
    const cacToAov = ((cac / aov) * 100).toFixed(1);

    // 6-Month trajectory (scaled compounding with 8% MoM retention)
    const trajectory = [1, 2, 3, 4, 5, 6].map((m) => {
      const growthMult = 1 + (m - 1) * 0.12;
      return Math.round(grossRevenue * growthMult);
    });

    return {
      rawOrders,
      deliveredOrders,
      rtoCount,
      grossRevenue,
      cogs,
      netProfit,
      netMarginPct: netMarginPct.toFixed(1),
      roas,
      cacToAov,
      trajectory
    };
  }, [monthlySpend, aov, cac, rtoRate, grossMarginPct, currency]);

  const formatCurrency = (val: number) => {
    if (currency === 'INR') {
      return '? ' + val.toLocaleString('en-IN');
    }
    return '$ ' + val.toLocaleString('en-US');
  };

  const handleCopySummary = () => {
    const summary = `AgentFlow AI - Unit Economics Modeling Summary:
- Monthly Ad Spend: ${formatCurrency(monthlySpend)}
- Average Order Value (AOV): ${formatCurrency(aov)}
- Blended CAC: ${formatCurrency(cac)} (${metrics.cacToAov}% of AOV)
- RTO Rate: ${rtoRate}%
- Gross Margin: ${grossMarginPct}%
- Projected Monthly Delivered Revenue: ${formatCurrency(metrics.grossRevenue)}
- Monthly Net Contribution Profit: ${formatCurrency(metrics.netProfit)} (Net Margin: ${metrics.netMarginPct}%)
- Blended ROAS: ${metrics.roas}x
- 6-Month Cumulative Run-Rate: ${formatCurrency(metrics.trajectory.reduce((a, b) => a + b, 0))}`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    onToast('Unit Economics model copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToWorkflow = () => {
    const snippet = `Optimize D2C unit economics with Monthly Ad Spend: ${formatCurrency(monthlySpend)}, AOV: ${formatCurrency(aov)}, CAC: ${formatCurrency(cac)}, RTO: ${rtoRate}%, and Gross Margin: ${grossMarginPct}%. Formulate a 30-day strategy to reduce RTO and scale ROAS past 3.5x.`;
    if (onApplyToStudio) {
      onApplyToStudio(snippet);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-surface-tint font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quantitative Business Modeling
              </span>
              <span className="text-outline">?</span>
              <span className="text-xs text-on-surface-variant font-mono">Agent 03 Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Unit Economics &amp; Growth Studio
            </h1>
            <p className="text-xs text-on-surface-variant max-w-xl mt-1">
              Simulate blended CAC, RTO friction, AOV, and margin thresholds with real-time multi-agent forecasting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Switcher */}
            <div className="flex items-center bg-surface-container-high p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setCurrency('INR');
                  setMonthlySpend(200000);
                  setAov(2450);
                  setCac(580);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  currency === 'INR'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                INR (?)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  setMonthlySpend(15000);
                  setAov(75);
                  setCac(24);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-container-high hover:bg-surface-bright text-on-surface border border-white/[0.08] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Export Model'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Simulator Controls (Left 5 cols) vs Projected Analytics (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-fixed">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Simulator Controls</h3>
                  <p className="text-[11px] text-outline">Adjust commercial levers to project scale</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Dynamic
              </span>
            </div>

            <div className="space-y-4">
              {/* 1. Monthly Ad Spend */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Monthly Ad Spend</span>
                  <span className="font-mono font-bold text-primary-container">
                    {formatCurrency(monthlySpend)}
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 25000 : 1000}
                  max={currency === 'INR' ? 1500000 : 100000}
                  step={currency === 'INR' ? 5000 : 500}
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full accent-primary-container bg-surface-container-high h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* 2. Target CAC */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Target Blended CAC</span>
                  <span className="font-mono font-bold text-secondary">
                    {formatCurrency(cac)} ({metrics.cacToAov}% of AOV)
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 150 : 8}
                  max={currency === 'INR' ? 2500 : 120}
                  step={currency === 'INR' ? 10 : 1}
                  value={cac}
                  onChange={(e) => setCac(Number(e.target.value))}
                  className="w-full accent-secondary bg-surface-container-high h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* 3. Average Order Value (AOV) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Average Order Value (AOV)</span>
                  <span className="font-mono font-bold text-on-surface">
                    {formatCurrency(aov)}
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 400 : 20}
                  max={currency === 'INR' ? 8000 : 350}
                  step={currency === 'INR' ? 50 : 5}
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-surface-container-high h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* 4. Return to Origin (RTO %) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">RTO / Return Friction</span>
                  <span className={`font-mono font-bold ${rtoRate > 20 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {rtoRate}% ({metrics.rtoCount} orders returned)
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={35}
                  step={1}
                  value={rtoRate}
                  onChange={(e) => setRtoRate(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-surface-container-high h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* 5. Product Gross Margin % */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Product Gross Margin %</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {grossMarginPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={85}
                  step={1}
                  value={grossMarginPct}
                  onChange={(e) => setGrossMarginPct(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-surface-container-high h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Presets for Simulator */}
            <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-outline text-[11px]">Quick Models:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAov(currency === 'INR' ? 1800 : 55);
                    setCac(currency === 'INR' ? 420 : 16);
                    setRtoRate(18);
                    setGrossMarginPct(60);
                  }}
                  className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface text-[10px] font-mono border border-white/[0.06]"
                >
                  Apparel D2C
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAov(currency === 'INR' ? 950 : 28);
                    setCac(currency === 'INR' ? 180 : 7);
                    setRtoRate(6);
                    setGrossMarginPct(55);
                  }}
                  className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface text-[10px] font-mono border border-white/[0.06]"
                >
                  Quick-Comm CPG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAov(currency === 'INR' ? 4500 : 140);
                    setCac(currency === 'INR' ? 900 : 35);
                    setRtoRate(4);
                    setGrossMarginPct(78);
                  }}
                  className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface text-[10px] font-mono border border-white/[0.06]"
                >
                  B2B High-Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Action to Push to Studio */}
          {onApplyToStudio && (
            <button
              type="button"
              onClick={handleApplyToWorkflow}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed hover:opacity-95 shadow-lg shadow-primary-container/15 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Economics to Strategy Studio</span>
            </button>
          )}
        </div>

        {/* Right Column: Dynamic Financial Forecast (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4 Core Financial KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container/90 border border-white/[0.08]">
              <span className="text-[10px] uppercase font-mono text-outline block">Gross Revenue</span>
              <p className="text-base font-bold font-mono text-on-surface mt-1 truncate">
                {formatCurrency(metrics.grossRevenue)}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> {metrics.deliveredOrders} orders
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/90 border border-white/[0.08]">
              <span className="text-[10px] uppercase font-mono text-outline block">Blended ROAS</span>
              <p className="text-base font-bold font-mono text-primary-container mt-1">
                {metrics.roas}x
              </p>
              <span className="text-[10px] text-surface-tint font-mono mt-0.5 block">
                Target: &gt; 3.0x
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/90 border border-white/[0.08]">
              <span className="text-[10px] uppercase font-mono text-outline block">Net Contribution</span>
              <p className={`text-base font-bold font-mono mt-1 ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(metrics.netProfit)}
              </p>
              <span className="text-[10px] font-mono text-on-surface-variant mt-0.5 block">
                {metrics.netMarginPct}% net margin
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/90 border border-white/[0.08]">
              <span className="text-[10px] uppercase font-mono text-outline block">RTO Friction Loss</span>
              <p className="text-base font-bold font-mono text-amber-400 mt-1">
                {rtoRate}%
              </p>
              <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                -{metrics.rtoCount} lost units
              </span>
            </div>
          </div>

          {/* 6-Month Compounding Revenue Trajectory */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">6-Month Revenue Trajectory</h4>
                <p className="text-[11px] text-outline">Projected monthly run-rate incorporating 8% MoM retention</p>
              </div>
              <span className="text-xs font-mono text-primary-container font-semibold">
                {formatCurrency(metrics.trajectory[5])} / mo by M6
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2">
              {metrics.trajectory.map((val, idx) => {
                const maxVal = metrics.trajectory[5] || 1;
                const heightPct = Math.max(25, Math.round((val / maxVal) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-surface-container-lowest h-32 rounded-lg p-1 flex items-end justify-center border border-white/[0.04]">
                      <div
                        className="w-full rounded bg-gradient-to-t from-primary-container/40 to-secondary/80 transition-all duration-500 hover:opacity-90"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-outline">M{idx + 1}</span>
                    <span className="text-[9px] font-mono text-on-surface truncate max-w-full">
                      {currSymbol}{(val / 1000).toFixed(0)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agentic Strategic Optimization Tip from Data Analyst */}
          <div className="p-4 rounded-xl bg-surface-container-high/60 border border-primary-container/30 flex items-start gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-container">Quantitative Business Data Analyst</span>
                <span className="text-[9px] font-mono bg-primary-container/15 text-primary-container px-1.5 py-0.5 rounded">
                  Autonomous Verdict
                </span>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-[11px]">
                {metrics.netProfit < 0
                  ? `Warning: Net contribution is negative (-${formatCurrency(Math.abs(metrics.netProfit))}). Blended CAC (${formatCurrency(cac)}) consumes ${metrics.cacToAov}% of AOV. Optimize creative hooks to reduce CAC below ${formatCurrency(Math.round(aov * 0.22))} or bundle products to push AOV past ${formatCurrency(Math.round(cac * 4.2))}.`
                  : rtoRate > 15
                  ? `High RTO Alert: At ${rtoRate}% RTO, you lose ${metrics.rtoCount} delivered parcels/mo. Enforcing UPI discounts and automated WhatsApp address verification can cut RTO to 9%, saving ~${formatCurrency(Math.round(metrics.rtoCount * 0.4 * (currency === 'INR' ? 140 : 3.5)))}/mo in reverse logistics.`
                  : `Unit economics are healthy! ROAS is ${metrics.roas}x with net margin at ${metrics.netMarginPct}%. CAC/AOV ratio is ${metrics.cacToAov}% (healthy threshold < 30%). You are commercially ready to scale monthly ad spend to ${formatCurrency(monthlySpend * 1.5)}.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
