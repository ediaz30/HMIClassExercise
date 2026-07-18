import React, { useState } from "react";
import { AGENTS_METADATA, AgentMetadata } from "../data";
import { AgentState } from "../types";
import { Check, ShieldAlert, Sparkles, HelpCircle, Eye } from "lucide-react";

interface AgentRoomsProps {
  selectedAgents: string[];
  toggleAgent: (id: string) => void;
  agentStates: Record<string, AgentState>;
  agentProgress: Record<string, number>;
  agentStatusLogs: Record<string, string>;
  onInspectCapabilities?: (agent: AgentMetadata) => void;
}

export default function AgentRooms({
  selectedAgents,
  toggleAgent,
  agentStates,
  agentProgress,
  agentStatusLogs,
  onInspectCapabilities
}: AgentRoomsProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const getStatusBadge = (id: string) => {
    const state = agentStates[id] || AgentState.Idle;
    switch (state) {
      case AgentState.Selected:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Selected
          </span>
        );
      case AgentState.Processing:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
            Analyzing...
          </span>
        );
      case AgentState.Completed:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case AgentState.Error:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Idle
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="agent-network-grid">
      {AGENTS_METADATA.map((agent) => {
        const isSelected = selectedAgents.includes(agent.id);
        const state = agentStates[agent.id] || AgentState.Idle;
        const isProcessing = state === AgentState.Processing;
        const progress = agentProgress[agent.id] || 0;
        const activeLog = agentStatusLogs[agent.id] || "Awaiting task queue...";

        return (
          <div
            key={agent.id}
            id={`agent-room-${agent.id}`}
            className={`glass-card rounded-xl overflow-hidden flex flex-col transition-all duration-300 relative border cursor-pointer ${
              isSelected ? "border-secondary ring-2 ring-secondary/10" : "border-slate-100 hover:border-slate-300 hover:shadow-lg"
            }`}
            onClick={(e) => {
              // Ignore if clicking capabilities button specifically
              if ((e.target as HTMLElement).closest(".btn-capabilities")) return;
              toggleAgent(agent.id);
            }}
            onMouseEnter={() => setHoveredRoom(agent.id)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Top selection corner tag */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              {getStatusBadge(agent.id)}
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-secondary border-secondary text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Room workspace header layout */}
            <div className="p-6 flex gap-5 md:gap-6 flex-col md:flex-row items-center md:items-start text-center md:text-left">
              {/* Avatar section with active work-state animations */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-28 h-28 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                    isProcessing
                      ? "ring-4 ring-secondary animate-glow scale-105"
                      : "ring-2 ring-slate-100"
                  }`}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={agent.avatar}
                    alt={agent.role}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      isProcessing ? "scale-110 brightness-110" : ""
                    }`}
                  />
                </div>

                {/* Ambient glow ripples when actively modeling */}
                {isProcessing && (
                  <div className="absolute -inset-1.5 bg-secondary/10 rounded-xl animate-ping opacity-75 -z-10" />
                )}
              </div>

              {/* Identity & Function detail */}
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {agent.specialty}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3 text-secondary" />
                      {agent.primaryCapability}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-slate-900 leading-snug">
                    {agent.name}
                  </h3>
                  <p className="text-secondary font-medium text-xs font-mono tracking-tight mb-2.5">
                    {agent.role}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                    {agent.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Parallel real-time analyzer console (visible when active) */}
            {isProcessing && (
              <div className="mx-6 mb-4 p-3 rounded-lg bg-slate-900/95 font-mono text-[10px] text-slate-300 shadow-inner flex flex-col gap-1.5 animate-pulse">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    CON_GATEWAY_NODE_{agent.id.toUpperCase()}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="text-emerald-400 font-semibold truncate">
                  &gt; {activeLog}
                </div>
                <div className="text-[9px] text-slate-500 flex items-center justify-between">
                  <span>HIPAA Compliance: SECURE</span>
                  <span>Est: {Math.max(1, Math.round((100 - progress) / 20))}s remaining</span>
                </div>
                {/* Micro progress bar inside the terminal */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-secondary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Static Capability Footer bar */}
            <div className="px-6 py-3.5 bg-slate-50 mt-auto flex justify-between items-center border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span>ID:</span>
                <span className="text-slate-600 font-semibold">{agent.id.toUpperCase()}_RM</span>
              </span>
              <button
                type="button"
                className="btn-capabilities text-xs font-semibold text-secondary hover:text-blue-700 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-blue-50/50"
                onClick={() => onInspectCapabilities && onInspectCapabilities(agent)}
              >
                <Eye className="w-3.5 h-3.5" />
                View Capabilities
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
