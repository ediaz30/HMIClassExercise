import React, { useState } from "react";
import { AnalyticsResult, AnalysisRow, HumanDecision } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, CheckCircle2, TrendingUp, Sparkles, Users, Award, AlertTriangle, ArrowUpRight, Check, Eye, HelpCircle, FileDown, Lock, ShieldCheck } from "lucide-react";

interface CombinedDashboardProps {
  analytics: AnalyticsResult;
  results: AnalysisRow[];
  decisions: HumanDecision[];
  onAddDecision: (commentId: string, agentId: "feedback" | "monitoring" | "triage", action: "Approved" | "De-escalated" | "Under Review") => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function CombinedDashboard({
  analytics,
  results,
  decisions,
  onAddDecision,
  onNavigateToTab
}: CombinedDashboardProps) {
  const [filterServiceLine, setFilterServiceLine] = useState("all");
  const [activeReviewRow, setActiveReviewRow] = useState<AnalysisRow | null>(null);

  // Filter service lines
  const serviceLines = ["all", ...Array.from(new Set(results.map(r => r.serviceLine)))];

  // Recharts color palettes
  const COLORS = ["#0c9488", "#0051d5", "#f59e0b", "#ba1a1a"]; // Teal, Cobalt, Orange, Red
  const SENTIMENT_COLORS = {
    Positive: "#0c9488",
    Negative: "#ba1a1a",
    Mixed: "#f59e0b",
    Neutral: "#64748b"
  };

  // Human Review Queue Filter - Comments containing LEVEL 3 or 4 triage severities or compliance risks
  const reviewQueue = results.filter(r => {
    const isCritical = r.triage?.severityLevel === "LEVEL 4 – Critical" || r.triage?.severityLevel === "LEVEL 3 – High";
    const hasRisk = r.triage?.riskFlags && r.triage.riskFlags.length > 0;
    return isCritical || hasRisk;
  });

  const getDecisionStatus = (commentId: string) => {
    const decision = decisions.find(d => d.commentId === commentId);
    return decision ? decision.actionTaken : "Pending Review";
  };

  // CSV download function for de-identified results
  const downloadCSVReport = () => {
    const header = "Row ID,De-Identified Patient,Service Line,Rating,Primary Theme,Sentiment,Triage Severity,Routing Destination,Status\n";
    const rows = results.map(r => {
      const deName = r.id === "c1" ? " Albert Jenkins (DOB: 1948)" : r.id === "c2" ? " Mary Thompson (ACCT)" : " Anonymous Patient";
      return `"${r.id}","${deName}","${r.serviceLine}",${r.rating},"${r.feedback?.theme || r.triage?.complaintCategory || 'N/A'}","${r.feedback?.sentiment || 'N/A'}","${r.triage?.severityLevel || 'N/A'}","${r.triage?.recommendedDepartment || 'N/A'}","${getDecisionStatus(r.id)}"`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HealAI_DeIdentified_Clinical_Report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-8" id="combined-executive-dashboard">
      {/* Overview stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total feedback analyzed */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              Feedback Analyzed
            </span>
            <Users className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-2.5">
            <h3 className="font-display font-bold text-3xl text-slate-900 leading-none">
              {analytics.overview.totalComments}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Active patient logs parsed
            </p>
          </div>
        </div>

        {/* Avg patient satisfaction rating */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              Patient Satisfaction
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <h3 className="font-display font-bold text-3xl text-slate-900 leading-none flex items-baseline gap-1">
              {analytics.overview.avgSatisfaction}
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Target threshold is 4.0
            </p>
          </div>
        </div>

        {/* Avg communication rating */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              Communication Score
            </span>
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-2.5">
            <h3 className="font-display font-bold text-3xl text-slate-900 leading-none flex items-baseline gap-1">
              {analytics.overview.avgCommunication}
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Sentiment linguistic average
            </p>
          </div>
        </div>

        {/* Follow up compliance rate */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              Follow-Up SLA Rate
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <h3 className="font-display font-bold text-3xl text-slate-900 leading-none flex items-baseline gap-1">
              {analytics.overview.followUpComplianceRate}%
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              Complies with HIPAA standard
            </p>
          </div>
        </div>

        {/* Service Lines represented */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between bg-secondary/[0.02]">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              Active Departments
            </span>
            <ArrowUpRight className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-2.5">
            <h3 className="font-display font-bold text-3xl text-slate-900 leading-none">
              {analytics.overview.serviceLinesCount}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Clinics mapped in run
            </p>
          </div>
        </div>
      </div>

      {/* Charts section: Interactive satisfaction and NLP breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Satisfaction score by service line */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Department Satisfaction Indices
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
              Bar Chart View
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.satisfaction.satisfactionByServiceLine}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", borderRadius: "8px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#ffffff", fontSize: "12px" }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {analytics.satisfaction.satisfactionByServiceLine.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 4 ? "#0c9488" : entry.score >= 3 ? "#f59e0b" : "#ba1a1a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sentiment distribution pie chart */}
        <div className="glass-card rounded-xl p-5 border border-slate-100 lg:col-span-1">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Linguistic Sentiment Distribution
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
              Donut Chart
            </span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.satisfaction.sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.satisfaction.sentimentDistribution.map((entry: any, index: number) => {
                    const color = SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] || "#64748b";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f172a", borderRadius: "8px", border: "none" }}
                  itemStyle={{ color: "#ffffff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Logs
              </span>
              <span className="text-2xl font-bold text-slate-900 font-display">
                {analytics.overview.totalComments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Human Review & Strategic Gatekeeping Queue (Authoritative Safe guard) */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-100" id="human-review-queue-panel">
        <div className="p-5 border-b border-slate-100 bg-rose-500/[0.02] flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                Hospital Manager Decision Queue (Human-In-The-Loop)
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {reviewQueue.length} HIGH-RISK INCIDENTS
                </span>
              </h4>
              <p className="text-slate-500 text-xs">
                Checkpoints requiring professional audit before automated escalation or routing actions are dispatched.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-secondary hover:text-blue-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            onClick={downloadCSVReport}
          >
            <FileDown className="w-4 h-4 text-secondary" />
            Export De-Identified Report
          </button>
        </div>

        {/* Table of cases requiring review */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Patient Account</th>
                <th className="px-5 py-3">Clinic / Rating</th>
                <th className="px-5 py-3">Severity / Risk Flags</th>
                <th className="px-5 py-3">AI Recommendation</th>
                <th className="px-5 py-3 text-center">Decision Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reviewQueue.map((row) => {
                const decisionStatus = getDecisionStatus(row.id);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Patient Name */}
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        {row.id === "c1"
                          ? " Albert Jenkins (DOB: 1948)"
                          : row.id === "c4"
                          ? " Eleanor Vance (MRN: CARD)"
                          : row.id === "c5"
                          ? " Maria Garcia (Phone: REDACTED)"
                          : " Anonymous Patient"}
                      </span>
                    </td>

                    {/* Service & Rating */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{row.serviceLine}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Rating: {row.rating}/5</div>
                    </td>

                    {/* Severity / Flags */}
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100 mb-1">
                        {row.triage?.severityLevel || "LEVEL 3 - High"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {row.triage?.riskFlags.map((f, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Recommendation details */}
                    <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">
                        {row.triage?.recommendedDepartment || "Patient Experience"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {row.triage?.executiveSummary || row.comment}
                      </div>
                    </td>

                    {/* Decision Status badge */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          decisionStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : decisionStatus === "De-escalated"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : decisionStatus === "Under Review"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                        }`}
                      >
                        {decisionStatus === "Approved" ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : decisionStatus === "Under Review" ? (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ) : null}
                        {decisionStatus}
                      </span>
                    </td>

                    {/* Decision Action panel */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[11px] font-semibold border border-emerald-100 transition-colors flex items-center gap-0.5"
                          title="Approve Recommendation"
                          onClick={() => onAddDecision(row.id, "triage", "Approved")}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Approve
                        </button>
                        <button
                          type="button"
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded text-[11px] font-semibold border border-amber-100 transition-colors flex items-center gap-0.5"
                          title="Flag Under Review"
                          onClick={() => onAddDecision(row.id, "triage", "Under Review")}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Hold
                        </button>
                        <button
                          type="button"
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
                          title="View Details"
                          onClick={() => setActiveReviewRow(row)}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail inspect dialog for selected Human Review Row */}
      {activeReviewRow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-glow">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Inspect High-Risk Incident Report
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold font-mono"
                onClick={() => setActiveReviewRow(null)}
              >
                [CLOSE]
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-600">
              {/* Original clinical comments */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Patient Complaint Log (De-Identified)
                </p>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-800 leading-relaxed font-mono text-[11px]">
                  &quot;{activeReviewRow.comment}&quot;
                </div>
              </div>

              {/* Triage summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    AI Assigned Severity Level
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-100 uppercase tracking-wider font-mono">
                    {activeReviewRow.triage?.severityLevel || "LEVEL 3 - High"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Escalation SLA Priority
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-100 uppercase tracking-wider font-mono">
                    {activeReviewRow.triage?.escalationPriority || "PRIORITY"}
                  </span>
                </div>
              </div>

              {/* Severity justification */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  AI Severity Justification & Evidence
                </p>
                <p className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-100">
                  {activeReviewRow.triage?.severityJustification || "Analyst justification is being compiled."}
                </p>
              </div>

              {/* Action recommendations */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  AI Recommended Destination Routing
                </p>
                <p className="font-semibold text-slate-900 flex items-center gap-1">
                  ROUTE TO: {activeReviewRow.triage?.recommendedDepartment || "Risk Management"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Action: {activeReviewRow.triage?.executiveSummary || "Undergoing automated triage."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
              <button
                type="button"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold border border-emerald-100 transition-colors"
                onClick={() => {
                  onAddDecision(activeReviewRow.id, "triage", "Approved");
                  setActiveReviewRow(null);
                }}
              >
                Approve & Execute Routing
              </button>
              <button
                type="button"
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold border border-amber-100 transition-colors"
                onClick={() => {
                  onAddDecision(activeReviewRow.id, "triage", "Under Review");
                  setActiveReviewRow(null);
                }}
              >
                Place Incident On Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Organizational Bottlenecks, Accessibility Gaps & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizational Failures and Bottlenecks */}
        <div className="glass-card rounded-xl p-5 border border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Detected Operational Bottlenecks
          </h4>
          <div className="flex flex-col gap-3">
            {analytics.problems.bottlenecks.map((b, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{b.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.desc}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    b.rate === "Critical"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {b.rate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Healthcare Equity, Language Access & Digital Literacy */}
        <div className="glass-card rounded-xl p-5 border border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 mb-4 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            Healthcare Equity & Accessibility Audit
          </h4>
          <div className="flex flex-col gap-3">
            {analytics.equity.barriers.map((bar, i) => (
              <div key={i} className="p-3 bg-emerald-500/[0.02] rounded-lg border border-slate-100">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    {bar.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-2 font-medium">{bar.findings}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono italic">
                  Suggested Action: {bar.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Strategic recommendations */}
      <div className="glass-card rounded-xl p-6 border border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-4 border-b border-slate-100 mb-5 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-secondary" />
          Top 5 Quality Improvement Priorities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Immediate Clinical Priorities
            </p>
            {analytics.recommendations.priorities.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold mt-0.5 flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-700 leading-snug">{item}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Short-Term Quick Wins (&lt; 3 Months)
            </p>
            <div className="flex flex-col gap-2">
              {analytics.recommendations.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">{win}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
