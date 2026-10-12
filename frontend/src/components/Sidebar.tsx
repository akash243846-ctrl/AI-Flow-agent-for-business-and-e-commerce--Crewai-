import { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Clock,
  Database,
  X,
  Layers,
  AlertTriangle
} from 'lucide-react';
import type { Task } from '../types';

interface SidebarProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isCreatingNew: boolean;
  onSelectTask: (id: string) => void;
  onStartNew: () => void;
  onDeleteTask: (id: string) => Promise<void>;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  searchFilter: string;
  onSearchChange: (val: string) => void;
}

export function Sidebar({
  tasks,
  selectedTaskId,
  isCreatingNew,
  onSelectTask,
  onStartNew,
  onDeleteTask,
  isMobileOpen,
  onCloseMobile,
  searchFilter,
  onSearchChange,
}: SidebarProps) {
  const [taskPendingDelete, setTaskPendingDelete] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) =>
    t.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-[#07090E] border-r border-white/[0.08] z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Mobile Close */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-slate-200 tracking-tight">Workflow Engine</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Launch Action */}
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              onStartNew();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200 group active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Launch New Workflow</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="px-4 py-2">
          <div className="flex items-center bg-[#0D121F] border border-white/[0.08] focus-within:border-cyan-500/50 rounded-xl px-3 py-2 text-slate-400 transition-colors">
            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Filter history..."
              value={searchFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full font-mono"
            />
            {searchFilter ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[10px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-400">
                {filteredTasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Workflows History List */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Recent Workflows</span>
            <span>{tasks.length} total</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-white/[0.06] rounded-xl my-2">
              No workflows found.
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isActive = !isCreatingNew && selectedTaskId === t.id;
              const isCompleted = t.status === 'COMPLETED';
              const isRunning = t.status === 'RUNNING';
              const isFailed = t.status === 'FAILED';
              const isConfirmingDelete = taskPendingDelete === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (!isConfirmingDelete) {
                      onSelectTask(t.id);
                      onCloseMobile();
                    }
                  }}
                  className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#141C2E] border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                      : 'bg-[#0D121F]/60 hover:bg-[#0D121F] border-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  {isConfirmingDelete ? (
                    <div className="flex items-center justify-between gap-2 p-1 text-xs animate-fade-in">
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete this workflow?</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onDeleteTask(t.id);
                            setTaskPendingDelete(null);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-[10px] font-semibold transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskPendingDelete(null);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed flex-1">
                          {t.query}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase border ${
                              isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : isRunning
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                                : isFailed
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            }`}
                          >
                            {isCompleted ? 'SUCCESS' : t.status}
                          </span>

                          <button
                            type="button"
                            title="Delete workflow"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskPendingDelete(t.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {t.elapsed_seconds ? `${t.elapsed_seconds}s` : 'Multi-Agent'}
                        </span>
                        {t.csv_filename ? (
                          <span className="flex items-center gap-1 text-cyan-400/90 truncate max-w-[120px]">
                            <Database className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.csv_filename}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Gemini Flash</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0D14] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span>SQLite Embedded</span>
          </div>
          <span className="text-slate-600">FastAPI Core</span>
        </div>
      </aside>
    </>
  );
}
