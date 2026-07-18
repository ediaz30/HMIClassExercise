import React from "react";
import { AGENTS_METADATA } from "../data";
import { AgentState } from "../types";
import { RefreshCw, Play, Pause, Ban, Terminal, Shield, CheckCircle2, AlertCircle } from "lucide-react";

interface ProcessingOverlayProps {
  selectedAgents: string[];
  agentStates: Record<string, AgentState>;
  agentProgress: Record<string, number>;
  agentStatusLogs: Record<string, string>;
  onCancelAgent: (id: string) => void;
  onRerunAgent: (id: string) => void;
  onNavigateToResults: () => void;
}

export default function ProcessingOverlay({
  selectedAgents,
  agentStates,
  agentProgress,
  agentStatusLogs,
  onCancelAgent,
  onRerunAgent,
  onNavigateToResults
}: ProcessingOverlayProps) {
  const activeSelected = AGENTS_METADATA.filter(a => selectedAgents.includes(a.id));
  const allCompleted = activeSelected.every(a => agentStates[a.id] === AgentState.Completed);

  return (
    <div className="flex flex-col gap-6" id="processing-screen">
      <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 animate-glow">
            <Terminal className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">
              Parallel Multi-Agent Synthesis Console
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Executing secure analytical workflows across isolated clinical containers
            </p>
          </div>
        </div>
        <div>
          {allCompleted ? (
            <button
              type="button"
              className="bg-secondary text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 animate-bounce"
              onClick={onNavigateToResults}
            >
              <CheckCircle2 className="w-4 h-4" />
              View Clinical Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
              <span>Analyzing Comments In Parallel...</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of active processing units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSelected.map((agent) => {
          const state = agentStates[agent.id] || AgentState.Idle;
          const progress = agentProgress[agent.id] || 0;
          const activeLog = agentStatusLogs[agent.id] || "Waiting in scheduler...";
          const isProcessing = state === AgentState.Processing;
          const isCompleted = state === AgentState.Completed;
          const isError = state === AgentState.Error;

          return (
            <div
              key={agent.id}
              className={`glass-card rounded-xl p-5 border flex flex-col gap-4 relative transition-all duration-300 ${
                isProcessing ? "border-secondary/20 bg-secondary/5 ring-1 ring-secondary/5" : "border-slate-100"
              }`}
            >
              {/* Header status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.statusColor} ${isProcessing ? "animate-ping" : ""}`} />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {agent.id.toUpperCase()}_CORE_NODE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <button
                      type="button"
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50"
                      title="Cancel Agent Run"
                      onClick={() => onCancelAgent(agent.id)}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {(isCompleted || isError) && (
                    <button
                      type="button"
                      className="text-secondary hover:text-blue-700 font-semibold text-[11px] flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded-md transition-all"
                      onClick={() => onRerunAgent(agent.id)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Rerun
                    </button>
                  )}
                </div>
              </div>

              {/* Agent info */}
              <div className="flex items-center gap-4">
                <div className={`relative w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 ${isProcessing ? "ring-2 ring-secondary animate-glow" : ""}`}>
                  <img
                    referrerPolicy="no-referrer"
                    src={agent.avatar}
                    alt={agent.role}
                    className="w-full h-full object-cover"
                  />
                  {isCompleted && (
                    <div className="absolute inset-0 bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {agent.name}
                  </h4>
                  <p className="text-slate-500 text-xs font-mono">{agent.role}</p>
                </div>
                <div className="text-right font-mono text-sm font-bold text-slate-800">
                  {progress}%
                </div>
              </div>

              {/* Console log of current active pipeline */}
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-[10px] text-slate-300 shadow-inner flex flex-col gap-2 min-h-[90px]">
                <div className="flex justify-between items-center text-slate-500 border-b border-slate-900 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    STATUS: {state.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    HIPAA_VALIDATED
                  </span>
                </div>
                <div className="text-emerald-400 font-semibold mt-1 leading-relaxed min-h-[30px]">
                  &gt; {activeLog}
                </div>
              </div>

              {/* Segmented Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500" : isError ? "bg-rose-500" : "bg-secondary"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Completion checks */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>Task queue: SECURE</span>
                {isCompleted && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Output Compiled
                  </span>
                )}
                {isProcessing && <span>Estimated: {Math.max(1, Math.round((100 - progress) / 20))}s</span>}
                {isError && (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Agent Failed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
