/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PatientComment, AgentState, AnalysisRow, AnalyticsResult, HumanDecision } from "./types";
import { DEFAULT_PATIENT_COMMENTS, AGENTS_METADATA, AgentMetadata } from "./data";
import AgentRooms from "./components/AgentRooms";
import UploadSection from "./components/UploadSection";
import AgentConfigs from "./components/AgentConfigs";
import ProcessingOverlay from "./components/ProcessingOverlay";
import CombinedDashboard from "./components/CombinedDashboard";
import ResultsDetail from "./components/ResultsDetail";
import { Circle, ShieldAlert, Sparkles, AlertCircle, FileSpreadsheet, Lock, Activity, LayoutDashboard, Database, HelpCircle, Bot, AlertTriangle } from "lucide-react";

export default function App() {
  // Application screens: "offices" | "upload_preview" | "config" | "processing" | "combined_dashboard" | "results_detail"
  const [currentScreen, setCurrentScreen] = useState<"offices" | "config" | "processing" | "combined_dashboard" | "results_detail">("offices");

  // Core Data State
  const [comments, setComments] = useState<PatientComment[]>(DEFAULT_PATIENT_COMMENTS);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["feedback", "monitoring", "triage", "analytics"]);
  const [decisions, setDecisions] = useState<HumanDecision[]>([]);

  // Agent Progress and State Managers
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({
    feedback: AgentState.Idle,
    monitoring: AgentState.Idle,
    triage: AgentState.Idle,
    analytics: AgentState.Idle
  });
  const [agentProgress, setAgentProgress] = useState<Record<string, number>>({
    feedback: 0,
    monitoring: 0,
    triage: 0,
    analytics: 0
  });
  const [agentStatusLogs, setAgentStatusLogs] = useState<Record<string, string>>({
    feedback: "Idle.",
    monitoring: "Idle.",
    triage: "Idle.",
    analytics: "Idle."
  });

  // Compiled Analysis Results
  const [results, setResults] = useState<AnalysisRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);

  // Modal inspection target
  const [inspectAgent, setInspectAgent] = useState<AgentMetadata | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // Sync selection checkboxes with states
  useEffect(() => {
    const updatedStates = { ...agentStates };
    AGENTS_METADATA.forEach(agent => {
      if (selectedAgents.includes(agent.id)) {
        if (updatedStates[agent.id] === AgentState.Idle) {
          updatedStates[agent.id] = AgentState.Selected;
        }
      } else {
        updatedStates[agent.id] = AgentState.Idle;
      }
    });
    setAgentStates(updatedStates);
  }, [selectedAgents]);

  const toggleAgent = (id: string) => {
    // If the analysis is running or results exist, we reset state when toggling
    if (selectedAgents.includes(id)) {
      setSelectedAgents(selectedAgents.filter(a => a !== id));
    } else {
      setSelectedAgents([...selectedAgents, id]);
    }
  };

  const clearSelection = () => {
    setSelectedAgents([]);
  };

  // Human Review Decision Logging
  const addDecision = (
    commentId: string,
    agentId: "feedback" | "monitoring" | "triage",
    action: "Approved" | "De-escalated" | "Under Review"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const newDecision: HumanDecision = {
      commentId,
      agentId,
      actionTaken: action,
      timestamp,
      reviewedBy: "Clinician Auditor (reviewely@gmail.com)"
    };
    setDecisions([newDecision, ...decisions.filter(d => d.commentId !== commentId)]);
  };

  // Progressive analysis processing simulator
  const handleStartAnalysis = async (runOptions: any) => {
    setCurrentScreen("processing");
    
    // Set selected agents to processing
    const processedStates = { ...agentStates };
    selectedAgents.forEach(id => {
      processedStates[id] = AgentState.Processing;
      agentProgress[id] = 0;
    });
    setAgentStates(processedStates);

    // Parallel progress simulators with unique step logs matching exact agent roles
    const progressIntervals: Record<string, NodeJS.Timeout> = {};
    const stepsFeedback = [
      "Reading clinical de-identified comment logs...",
      "Executing NLP Tokenizer & lemmatizer matrices...",
      "Tagging primary theme criteria (9 healthcare domains)...",
      "Analyzing linguistic sentiment parameters...",
      "Evaluating de-identified billing or safety bias concern...",
      "Drafting clinical quality improvement recommendations...",
      "Consolidating results..."
    ];
    const stepsMonitoring = [
      "Ingesting aggregated comment metrics...",
      "Scanning secondary HCAHPS theme guidelines...",
      "Cross-referencing geriatric and physical accessibility concerns...",
      "Calculating compliance threat ratings (Low/Mod/High)...",
      "Writing executive managerial briefing outlines...",
      "Validating output schema..."
    ];
    const stepsTriage = [
      "Running safety & triage parsing scripts...",
      "Evaluating severity classifications (Level 1-4)...",
      "Mapping patient safety and operational compliance risk codes...",
      "Determining recommended escalation routing clinic...",
      "Enforcing clinical human review validation checkpoints...",
      "Publishing secure de-identified triage logs..."
    ];
    const stepsAnalytics = [
      "Aggregating macro clinic records...",
      "Plotting satisfaction trends by department...",
      "Processing keyword word-cloud densities...",
      "Mapping operational bottleneck indices...",
      "Compiling short-term clinical quick wins...",
      "Compiling long-term AI-agent opportunity frameworks..."
    ];

    selectedAgents.forEach(id => {
      let currentStepIndex = 0;
      progressIntervals[id] = setInterval(() => {
        setAgentProgress(prev => {
          const currentProgress = prev[id] || 0;
          if (currentProgress >= 95) {
            clearInterval(progressIntervals[id]);
            return 95;
          }

          // Progress increments smoothly
          const increment = Math.floor(Math.random() * 8) + 4;
          const nextProgress = Math.min(95, currentProgress + increment);

          // Update logs sequentially
          let steps = stepsFeedback;
          if (id === "monitoring") steps = stepsMonitoring;
          if (id === "triage") steps = stepsTriage;
          if (id === "analytics") steps = stepsAnalytics;

          const stepIdx = Math.min(steps.length - 1, Math.floor((nextProgress / 100) * steps.length));
          setAgentStatusLogs(logs => ({
            ...logs,
            [id]: steps[stepIdx]
          }));

          return {
            ...prev,
            [id]: nextProgress
          };
        });
      }, 350);
    });

    // Fire off the full-stack server-side REST API request
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments,
          agents: selectedAgents
        })
      });

      const data = await response.json();

      if (data.success) {
        // Complete progress bars beautifully
        setTimeout(() => {
          selectedAgents.forEach(id => {
            clearInterval(progressIntervals[id]);
            setAgentProgress(prev => ({ ...prev, [id]: 100 }));
            setAgentStatusLogs(logs => ({ ...logs, [id]: "Task complete. Output compiled." }));
            setAgentStates(prev => ({ ...prev, [id]: AgentState.Completed }));
          });

          // Store results and analytics
          setResults(data.results);
          if (data.analytics) {
            setAnalytics(data.analytics);
          }

          // Go straight to combined dashboard
          setTimeout(() => {
            setCurrentScreen("combined_dashboard");
          }, 800);

        }, 1200);
      } else {
        throw new Error("Analysis failed on server.");
      }

    } catch (err) {
      console.error(err);
      selectedAgents.forEach(id => {
        clearInterval(progressIntervals[id]);
        setAgentStates(prev => ({ ...prev, [id]: AgentState.Error }));
        setAgentStatusLogs(logs => ({ ...logs, [id]: "Error: Workspace container connection lost." }));
      });
    }
  };

  const handleCancelAgent = (id: string) => {
    setAgentStates(prev => ({ ...prev, [id]: AgentState.Selected }));
    setAgentProgress(prev => ({ ...prev, [id]: 0 }));
    setAgentStatusLogs(prev => ({ ...prev, [id]: "Analysis cancelled by human supervisor." }));
  };

  const handleRerunAgent = (id: string) => {
    handleStartAnalysis({});
  };

  return (
    <div className="bg-surface font-sans text-slate-800 min-h-screen pb-24 selection:bg-secondary/10 relative">
      
      {/* Top Navigation Bar with modern Clinical Branding */}
      <header className="fixed top-0 w-full z-50 glass-nav border-b border-slate-100 h-20">
        <div className="flex justify-between items-center px-6 md:px-8 h-full w-full max-w-[1440px] mx-auto">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentScreen("offices")}>
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg animate-glow">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight block">
                  HealAI Portal
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary font-mono block">
                  Clinical Workspace
                </span>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="hidden md:flex items-center gap-5">
              <button
                type="button"
                className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                  currentScreen === "offices"
                    ? "bg-secondary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setCurrentScreen("offices")}
              >
                Virtual Offices
              </button>
              
              <button
                type="button"
                className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentScreen === "combined_dashboard"
                    ? "bg-secondary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                disabled={results.length === 0}
                onClick={() => setCurrentScreen("combined_dashboard")}
              >
                Executive Summary
              </button>

              <button
                type="button"
                className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentScreen === "results_detail"
                    ? "bg-secondary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                disabled={results.length === 0}
                onClick={() => setCurrentScreen("results_detail")}
              >
                Agent Workspaces
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {results.length > 0 && (
              <div className="flex items-center gap-1.5 text-tertiary bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>HIPAA Safe Harbor Gated</span>
              </div>
            )}
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary/20 cursor-pointer shadow-sm">
              <img
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                alt="Executive Auditor"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2JJmKP0SSIyh8N3KqXzQ79crcEgEsLIuw1lea5DS8HpZk3HsuxWbEfpRgL-luLwdppNgJV_GhcHrB480n8QPg9jjaaXkqB3oo0lvovTreV48vJ9OlQp87R0a2zQ8xuzvQgfhcOlim0QRPXKB7HFyDLhQHUOIbH5y7hGnHYBBzpBg-5S-XauZdPVHPxvNWEy7wyvXaggKxcXK3I7hyghzyAzjwVx9QdSP1qfv_YdMDiYqtE4WHpzSC"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="pt-32 px-6 md:px-8 max-w-[1440px] mx-auto flex flex-col gap-8">
        
        {/* Banner Section */}
        {currentScreen === "offices" && (
          <section className="mb-2">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Clinical Multi-Agent Portal
            </h1>
            <p className="text-slate-500 text-sm max-w-3xl leading-relaxed mt-1.5">
              Secure administrative dashboard for HCAHPS compliance, linguistic feedback audits, and instant complaint triage routing. Toggle active medical-agent workspaces below to initiate parallel reviews.
            </p>
          </section>
        )}

        {/* Dynamic Screens */}
        {currentScreen === "offices" && (
          <>
            {/* Upload Section */}
            <UploadSection
              comments={comments}
              onSetComments={setComments}
              onNavigateToConfig={() => setCurrentScreen("config")}
            />

            {/* Header info */}
            <div className="flex justify-between items-end border-b border-slate-100 pb-3 mt-4">
              <div>
                <h2 className="font-display font-semibold text-lg text-slate-900">
                  Specialized AI Offices
                </h2>
                <p className="text-slate-500 text-xs">
                  Each virtual office contains an active, isolated healthcare AI model. Click any card to select.
                </p>
              </div>
            </div>

            {/* 4 Agent Rooms */}
            <AgentRooms
              selectedAgents={selectedAgents}
              toggleAgent={toggleAgent}
              agentStates={agentStates}
              agentProgress={agentProgress}
              agentStatusLogs={agentStatusLogs}
              onInspectCapabilities={setInspectAgent}
            />
          </>
        )}

        {currentScreen === "config" && (
          <AgentConfigs
            selectedAgents={selectedAgents}
            toggleAgent={toggleAgent}
            onNavigateBack={() => setCurrentScreen("offices")}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {currentScreen === "processing" && (
          <ProcessingOverlay
            selectedAgents={selectedAgents}
            agentStates={agentStates}
            agentProgress={agentProgress}
            agentStatusLogs={agentStatusLogs}
            onCancelAgent={handleCancelAgent}
            onRerunAgent={handleRerunAgent}
            onNavigateToResults={() => setCurrentScreen("combined_dashboard")}
          />
        )}

        {currentScreen === "combined_dashboard" && analytics && (
          <CombinedDashboard
            analytics={analytics}
            results={results}
            decisions={decisions}
            onAddDecision={addDecision}
            onNavigateToTab={setCurrentScreen}
          />
        )}

        {currentScreen === "results_detail" && results.length > 0 && (
          <ResultsDetail
            results={results}
            selectedAgents={selectedAgents}
          />
        )}

      </main>

      {/* Floating Action control bar for offices screen (Mockup matching) */}
      {currentScreen === "offices" && selectedAgents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-40 px-4">
          <div className="glass-card rounded-full px-6 py-3.5 flex items-center justify-between border border-secondary/15 shadow-2xl animate-glow bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold text-sm border border-secondary/20 shadow-inner">
                {selectedAgents.length}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-slate-800">
                  Allocated Workspaces
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Ready for secure HIPAA run
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                onClick={clearSelection}
              >
                Clear Selection
              </button>
              <button
                type="button"
                className="bg-secondary text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                onClick={() => setCurrentScreen("config")}
              >
                Configure Run Options
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Capability inspection dialog */}
      {inspectAgent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-glow">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                <Bot className="w-5 h-5 text-secondary" />
                Workspace Capability Review
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold font-mono"
                onClick={() => setInspectAgent(null)}
              >
                [CLOSE]
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <img
                  referrerPolicy="no-referrer"
                  src={inspectAgent.avatar}
                  alt={inspectAgent.role}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{inspectAgent.name}</h4>
                <p className="text-xs font-mono text-secondary">{inspectAgent.role} &bull; {inspectAgent.specialty}</p>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  {inspectAgent.description}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Programmed Operational Checklist
              </p>
              <ul className="flex flex-col gap-2">
                {inspectAgent.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
              <button
                type="button"
                className="bg-secondary text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (!selectedAgents.includes(inspectAgent.id)) {
                    setSelectedAgents([...selectedAgents, inspectAgent.id]);
                  }
                  setInspectAgent(null);
                }}
              >
                Allocate Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional warning banner for Authorized de-identified prototyping */}
      <footer className="mt-16 py-6 border-t border-slate-100 text-center text-slate-400 text-[11px] leading-relaxed max-w-xl mx-auto px-6">
        <p className="font-semibold text-slate-500 flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          Prototyping & Security Disclosure
        </p>
        <p className="mt-1">
          This portal functions exclusively on de-identified, synthetic, or authorized patient comments in full compliance with HHS Safe Harbor guidelines. The agents assist decision-making but do not make clinical diagnoses, treatment decisions, or final compliance determinations.
        </p>
      </footer>

    </div>
  );
}

// Inline fallback SVG component to prevent standard import issues
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}

function HealthAndSafety(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}
