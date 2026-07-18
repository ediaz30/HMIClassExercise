export enum AgentState {
  Idle = "Idle",
  Selected = "Selected",
  Processing = "Processing",
  Completed = "Completed",
  Error = "Error"
}

export interface PatientComment {
  id: string;
  comment: string;
  serviceLine: string;
  visitType: string;
  rating: number; // 1-5
  originalComment?: string; // before de-identification
  originalName?: string; // before de-identification
  isDeIdentified: boolean;
}

export interface FeedbackResult {
  theme: string;
  sentiment: string;
  reasoning: string;
  operationalIssue: string;
  riskOrBiasConcern: string;
  recommendedAction: string;
}

export interface MonitoringResult {
  theme: string;
  sentiment: string;
  reasoning: string;
  operationalIssue: string;
  equityOrAccessibilityConcern: string;
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk";
  managerialRecommendation: string;
  executiveSummary: string;
}

export interface TriageResult {
  complaintCategory: string;
  secondaryCategories: string[];
  severityLevel: "LEVEL 1 – Low" | "LEVEL 2 – Moderate" | "LEVEL 3 – High" | "LEVEL 4 – Critical";
  severityJustification: string;
  riskFlags: string[];
  recommendedDepartment: string;
  escalationPriority: "Routine" | "Priority" | "Immediate";
  humanReviewStatus: "AI Review Only" | "Human Review Recommended" | "Human Review Required";
  executiveSummary: string;
}

export interface AnalyticsResult {
  overview: {
    totalComments: number;
    avgSatisfaction: number;
    avgCommunication: number;
    followUpComplianceRate: number;
    serviceLinesCount: number;
  };
  satisfaction: {
    satisfactionByServiceLine: { name: string; score: number; count: number }[];
    sentimentDistribution: { name: string; value: number }[];
    satisfactionByVisitType: { type: string; score: number }[];
    satisfactionByPersona: { persona: string; score: number }[];
  };
  nlp: {
    topThemes: { name: string; value: number }[];
    keywords: { word: string; count: number }[];
    themeDistribution: { name: string; value: number }[];
  };
  problems: {
    bottlenecks: { title: string; desc: string; rate: string }[];
    technologyFailures: { system: string; issue: string; severity: string }[];
  };
  equity: {
    barriers: { category: string; findings: string; action: string }[];
  };
  risks: {
    hallucinationTraps: { text: string; rating: string }[];
    complianceExposure: { standard: string; status: string; details: string; action: string }[];
    humanReviewQueueCount: number;
  };
  opportunities: { name: string; purpose: string; impact: string }[];
  recommendations: {
    priorities: string[];
    quickWins: string[];
    longTermOpportunities: string[];
  };
}

export interface AnalysisRow {
  id: string;
  comment: string;
  serviceLine: string;
  visitType: string;
  rating: number;
  feedback?: FeedbackResult;
  monitoring?: MonitoringResult;
  triage?: TriageResult;
}

export interface HumanDecision {
  commentId: string;
  agentId: "feedback" | "monitoring" | "triage";
  actionTaken: "Approved" | "De-escalated" | "Under Review";
  timestamp: string;
  reviewedBy: string;
}
