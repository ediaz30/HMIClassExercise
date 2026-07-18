import React, { useState } from "react";
import { AGENTS_METADATA } from "../data";
import { Sparkles, CheckSquare, Settings2, Sliders, ShieldAlert, ArrowLeft, Play } from "lucide-react";

interface AgentConfigsProps {
  selectedAgents: string[];
  toggleAgent: (id: string) => void;
  onNavigateBack: () => void;
  onStartAnalysis: (config: any) => void;
}

export default function AgentConfigs({
  selectedAgents,
  toggleAgent,
  onNavigateBack,
  onStartAnalysis
}: AgentConfigsProps) {
  // Config state
  const [strictCompliance, setStrictCompliance] = useState(true);
  const [priorityTier, setPriorityTier] = useState<"standard" | "high" | "stat">("high");
  const [targetRouting, setTargetRouting] = useState(true);
  const [includeAnalyticsReport, setIncludeAnalyticsReport] = useState(true);

  const handleStartTrigger = () => {
    onStartAnalysis({
      strictCompliance,
      priorityTier,
      targetRouting,
      includeAnalyticsReport
    });
  };

  return (
    <div className="flex flex-col gap-6" id="agent-config-screen">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button
          type="button"
          className="text-slate-500 hover:text-slate-800 font-semibold text-xs flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          onClick={onNavigateBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Offices
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-secondary text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-colors flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            onClick={handleStartTrigger}
            disabled={selectedAgents.length === 0}
          >
            <Play className="w-4 h-4 fill-current" />
            Start Simultaneous Multi-Agent Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core parameters panel */}
        <div className="glass-card rounded-xl p-6 border border-slate-100 flex flex-col gap-6 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Settings2 className="w-5 h-5 text-secondary" />
            <h3 className="font-display font-semibold text-sm text-slate-900">
              Analysis Run Options
            </h3>
          </div>

          {/* Strictness config */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex justify-between items-center">
              Strict HIPAA Compliance Check
              <input
                type="checkbox"
                checked={strictCompliance}
                onChange={(e) => setStrictCompliance(e.target.checked)}
                className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Force automatic de-identification and trigger alarms on unredacted medical numbers or billing identifiers.
            </p>
          </div>

          {/* Routing parameters */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex justify-between items-center">
              Target Incident Routing
              <input
                type="checkbox"
                checked={targetRouting}
                onChange={(e) => setTargetRouting(e.target.checked)}
                className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Instruct the Complaint Triage Agent to allocate specific clinics (e.g. Risk Mgmt, Compliance) with priority tiers.
            </p>
          </div>

          {/* Analytics report */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex justify-between items-center">
              Consolidated Analytics Dashboard
              <input
                type="checkbox"
                checked={includeAnalyticsReport}
                onChange={(e) => setIncludeAnalyticsReport(e.target.checked)}
                className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Compile macro executive summary dashboard with charts showing satisfaction ratings by department.
            </p>
          </div>

          {/* SLA tiers */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-secondary" />
              Agent Allocation Priority
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {["standard", "high", "stat"].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  className={`py-1.5 rounded text-[10px] font-bold uppercase border tracking-wider transition-colors ${
                    priorityTier === tier
                      ? "bg-secondary border-secondary text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                  onClick={() => setPriorityTier(tier as any)}
                >
                  {tier}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              STAT increases computing priority and accelerates de-identification scans.
            </p>
          </div>
        </div>

        {/* Selected Agents checkouts */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            Active Workspace Configuration
            <span className="bg-secondary/10 text-secondary text-[11px] font-bold px-2 py-0.5 rounded-full">
              {selectedAgents.length} Agents Configured
            </span>
          </h4>

          {AGENTS_METADATA.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);

            return (
              <div
                key={agent.id}
                className={`glass-card rounded-xl p-5 border transition-all flex gap-4 ${
                  isSelected ? "border-slate-200" : "opacity-55 hover:opacity-80 border-slate-100"
                }`}
              >
                {/* Checkbox trigger */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAgent(agent.id)}
                  className="w-5 h-5 text-secondary rounded border-slate-300 focus:ring-secondary mt-1 flex-shrink-0 cursor-pointer"
                />

                <div className="flex-grow flex flex-col gap-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-slate-900 leading-snug">
                        {agent.name}
                      </h3>
                      <p className="text-secondary font-mono text-[11px]">
                        {agent.role} &bull; {agent.specialty}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                      {agent.primaryCapability}
                    </span>
                  </div>

                  {/* Specific task instructions from attached text files */}
                  <div className="bg-slate-50/70 rounded-lg p-3.5 border border-slate-100 mt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Primary Prompt Directives (HIPAA Gated)
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      {agent.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
