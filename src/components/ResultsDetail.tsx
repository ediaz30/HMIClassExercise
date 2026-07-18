import React, { useState } from "react";
import { AnalysisRow } from "../types";
import { AGENTS_METADATA } from "../data";
import { Search, Filter, ShieldCheck, Lock, CheckSquare, Sparkles, AlertTriangle, User, HelpCircle, Table, Grid } from "lucide-react";

interface ResultsDetailProps {
  results: AnalysisRow[];
  selectedAgents: string[];
}

export default function ResultsDetail({ results, selectedAgents }: ResultsDetailProps) {
  const [activeTab, setActiveTab] = useState(selectedAgents[0] || "feedback");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTheme, setFilterTheme] = useState("all");

  const activeAgent = AGENTS_METADATA.find(a => a.id === activeTab);

  // Filtered comments based on query and filters
  const filteredRows = results.filter(row => {
    const textMatches = row.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        row.serviceLine.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Dynamic theme matching depending on active agent
    let themeMatches = true;
    if (filterTheme !== "all") {
      if (activeTab === "feedback") {
        themeMatches = row.feedback?.theme === filterTheme;
      } else if (activeTab === "monitoring") {
        themeMatches = row.monitoring?.theme === filterTheme;
      } else if (activeTab === "triage") {
        themeMatches = row.triage?.complaintCategory === filterTheme;
      }
    }
    
    return textMatches && themeMatches;
  });

  // Extract all distinct themes for filter dropdowns
  const availableThemes = Array.from(new Set(results.map(row => {
    if (activeTab === "feedback") return row.feedback?.theme;
    if (activeTab === "monitoring") return row.monitoring?.theme;
    if (activeTab === "triage") return row.triage?.complaintCategory;
    return null;
  }).filter(Boolean)));

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "Positive":
        return <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-100">Positive</span>;
      case "Negative":
        return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100">Negative</span>;
      case "Mixed":
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100">Mixed</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">Neutral</span>;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "LEVEL 4 – Critical":
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">CRITICAL</span>;
      case "LEVEL 3 – High":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">HIGH</span>;
      case "LEVEL 2 – Moderate":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">MODERATE</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">LOW</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="agent-results-dashboard">
      {/* Agent Selector Ribbon */}
      <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar bg-slate-50/50 p-1.5 rounded-xl border border-slate-150 flex-wrap gap-1.5">
        {AGENTS_METADATA.filter(a => selectedAgents.includes(a.id) || a.id === "feedback").map((agent) => (
          <button
            key={agent.id}
            type="button"
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === agent.id
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => {
              setActiveTab(agent.id);
              setFilterTheme("all");
            }}
          >
            <span className={`w-2 h-2 rounded-full ${agent.statusColor}`} />
            {agent.role} &bull; {agent.id.toUpperCase()}_UNIT
          </button>
        ))}
      </div>

      {activeAgent && (
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex items-start gap-4 bg-secondary/[0.01]">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <img referrerPolicy="no-referrer" src={activeAgent.avatar} alt={activeAgent.role} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Analytical Workspace
            </h4>
            <h3 className="font-display font-semibold text-sm text-slate-900 mt-0.5">
              {activeAgent.name} &bull; {activeAgent.role}
            </h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Applying specialized prompts: {activeAgent.description} Gated for secure HIPAA de-identified data.
            </p>
          </div>
        </div>
      )}

      {/* Query Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-grow max-w-xl">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search comments or departments..."
              className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Theme filter */}
          <div className="relative min-w-[150px]">
            <select
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-secondary focus:border-secondary appearance-none cursor-pointer"
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
            >
              <option value="all">All Themes</option>
              {availableThemes.map((theme, i) => (
                <option key={i} value={theme || ""}>{theme}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Workspace table (Tab Specific schemas) */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-100">
        {/* TAB 1: PATIENT FEEDBACK INSIGHT AGENT (Table of comments & linguistic analysis) */}
        {activeTab === "feedback" && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-600 min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Patient Ref</th>
                  <th className="px-5 py-3">Clinic Dept</th>
                  <th className="px-5 py-3">Primary Theme</th>
                  <th className="px-5 py-3 text-center">Sentiment</th>
                  <th className="px-5 py-3">Operational Breakdowns</th>
                  <th className="px-5 py-3">Safety / Equity Concern</th>
                  <th className="px-5 py-3">Recommended Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Patient Ref */}
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        {row.id === "c1" ? " Albert Jenkins (DOB: 1948)" : row.id === "c2" ? " Mary Thompson (ACCT)" : " Anonymous Patient"}
                      </span>
                    </td>
                    {/* Dept */}
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.serviceLine}</td>
                    {/* Theme */}
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-medium border border-slate-150">
                        {row.feedback?.theme || "N/A"}
                      </span>
                    </td>
                    {/* Sentiment */}
                    <td className="px-5 py-4 text-center">{getSentimentBadge(row.feedback?.sentiment)}</td>
                    {/* Operational Issue */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-slate-700">
                      <div className="font-semibold text-slate-800">Operational Breakdown:</div>
                      {row.feedback?.operationalIssue || "No major breakdown registered."}
                    </td>
                    {/* Bias / Risk Concern */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-rose-700">
                      <div className="font-semibold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Security & Bias Concerns:
                      </div>
                      {row.feedback?.riskOrBiasConcern || "No major biases flagged."}
                    </td>
                    {/* Action */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-slate-600 italic">
                      <div className="font-semibold text-slate-800 not-italic">Managerial Guideline:</div>
                      {row.feedback?.recommendedAction || "Process standard updates."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PATIENT EXPERIENCE MONITORING AGENT (HCAHPS & Strategy view) */}
        {activeTab === "monitoring" && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-600 min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Patient Code</th>
                  <th className="px-5 py-3">Domain Theme</th>
                  <th className="px-5 py-3">HCAHPS Risk Tier</th>
                  <th className="px-5 py-3">Accessibility Barriers</th>
                  <th className="px-5 py-3">Operational Analysis</th>
                  <th className="px-5 py-3">Action Plan</th>
                  <th className="px-5 py-3">Brief Executive Brief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Code */}
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        {row.id === "c1" ? " Albert Jenkins (DOB: 1948)" : row.id === "c3" ? " Sarah Wilkes (EMAIL)" : " Anonymous Patient"}
                      </span>
                    </td>
                    {/* Domain Theme */}
                    <td className="px-5 py-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                        {row.monitoring?.theme || "N/A"}
                      </span>
                    </td>
                    {/* Risk Tier */}
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        row.monitoring?.riskLevel === "High Risk"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : row.monitoring?.riskLevel === "Moderate Risk"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {row.monitoring?.riskLevel || "MODERATE"}
                      </span>
                    </td>
                    {/* Accessibility Gaps */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-slate-600">
                      <div className="font-semibold text-slate-800">Accessibility Assessment:</div>
                      {row.monitoring?.equityOrAccessibilityConcern || "None flagged."}
                    </td>
                    {/* Operational Issues */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-slate-600">
                      <div className="font-semibold text-slate-800">Target Bottleneck:</div>
                      {row.monitoring?.operationalIssue || "None flagged."}
                    </td>
                    {/* Strategy recommendation */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-emerald-700">
                      <div className="font-semibold text-emerald-800">Operational Corrective:</div>
                      {row.monitoring?.managerialRecommendation || "None required."}
                    </td>
                    {/* Executive brief */}
                    <td className="px-5 py-4 max-w-xs text-xs leading-relaxed text-slate-500 italic">
                      {row.monitoring?.executiveSummary || "None compiled."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: COMPLAINT TRIAGE AGENT (Escalation & Safety view) */}
        {activeTab === "triage" && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-600 min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Patient Code</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Severity Level</th>
                  <th className="px-5 py-3">Risk Flags</th>
                  <th className="px-5 py-3">Dispatch Department</th>
                  <th className="px-5 py-3">SLA Priority</th>
                  <th className="px-5 py-3">Gatekeeper Action</th>
                  <th className="px-5 py-3">Brief Executive Brief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Code */}
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        {row.id === "c4" ? " Eleanor Vance (MRN: CARD)" : row.id === "c5" ? " Maria Garcia (Phone: REDACTED)" : " Anonymous Patient"}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {row.triage?.complaintCategory || "N/A"}
                    </td>
                    {/* Severity */}
                    <td className="px-5 py-4">{getSeverityBadge(row.triage?.severityLevel)}</td>
                    {/* Risk Flags */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.triage?.riskFlags.map((flag, i) => (
                          <span key={i} className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 font-mono px-1 rounded font-semibold">
                            {flag}
                          </span>
                        )) || <span className="text-slate-400 font-mono">None</span>}
                      </div>
                    </td>
                    {/* Recommended Dept */}
                    <td className="px-5 py-4 font-semibold text-secondary">
                      {row.triage?.recommendedDepartment || "N/A"}
                    </td>
                    {/* SLA Priority */}
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        row.triage?.escalationPriority === "Immediate"
                          ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                          : row.triage?.escalationPriority === "Priority"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {row.triage?.escalationPriority || "ROUTINE"}
                      </span>
                    </td>
                    {/* Human Review check */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${
                        row.triage?.humanReviewStatus === "Human Review Required"
                          ? "bg-rose-50 text-rose-700 border border-rose-150"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {row.triage?.humanReviewStatus || "N/A"}
                      </span>
                    </td>
                    {/* Executive brief */}
                    <td className="px-5 py-4 max-w-xs text-xs text-slate-500 italic">
                      {row.triage?.executiveSummary || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
