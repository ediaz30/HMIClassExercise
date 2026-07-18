import { PatientComment } from "./types";

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  description: string;
  primaryCapability: string;
  capabilities: string[];
  statusColor: string;
}

export const AGENTS_METADATA: AgentMetadata[] = [
  {
    id: "feedback",
    name: "Patient Feedback Insight Agent",
    role: "Dr. Anya Sharma",
    specialty: "Linguistic Analyst",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuByE4bcPjXnfdiqixbb3uDK8G9LD6ATBm6iimxnqXWIuE64jebYMfMt0x-nXzRev9QfgUbCsSdxbop4fI8n6FFKPk9BXWv36j7aintU-gKXRI8o9voOShAPv_sE9TWw9Xg2e841wYPEZEj5W0ACZc9nY_ogAe48tHFvHLdeT4-GCZh4NQ-UWf1fM9p_DDtOK8Sc_MsyxU2ZrCN3VYa7uUHloUqFYlSHjbHbWnc2aNCZRBSJ9-LaSl0y",
    description: "Natural Language Processing expert specializing in extracting sentiment and key themes from unstructured patient survey data.",
    primaryCapability: "Linguistic & Sentiment Audit",
    capabilities: [
      "Dynamic theme classification (9 standard domains)",
      "Linguistic sentiment modeling (Positive, Negative, Mixed, Neutral)",
      "Unstructured comment logic extraction",
      "Identification of specific operational process failures",
      "Accessibility, equity, and linguistic bias risk flags"
    ],
    statusColor: "bg-teal-500"
  },
  {
    id: "monitoring",
    name: "Patient Experience Monitoring Agent",
    role: "Dr. Kwame Asante",
    specialty: "Experience Strategist",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGBbU_qHxsJmo4TKoELlQvTtELZCywHGSX57Xf8n8VJ_Vt1HoNSgGbdEvEEV6y8SlZe62A_eZzX7Ams3uqbjnCrMoAVV06JYrHNgIqvqmgB5d-1fAflimDun63Z4JvRtTvdmoOM6pb7nOr-htgPqsQspwzRURgyAcvk3RMPMSqleIGsV-Co5iunh1vBQQ4Sdz_KF54a6QQT5xo91DWRwdv-T18YKCcfajrZrCsm3CS75-OBY9zTvz5",
    description: "Real-time monitoring of facility performance metrics and HCAHPS compliance tracking across hospital departments.",
    primaryCapability: "HCAHPS & Experience Strategy",
    capabilities: [
      "HCAHPS criteria compliance review",
      "Department-level performance metric auditing",
      "Secondary theme mapping for complex compound issues",
      "Equity & accessibility review for older adults & disabled",
      "Organizational risk tiering (Low, Moderate, High)"
    ],
    statusColor: "bg-blue-500"
  },
  {
    id: "triage",
    name: "Complaint Triage Agent",
    role: "Sarah Jenkins",
    specialty: "Crisis Coordinator",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7aiiIK2ksWpIbUj66X87zkp2hr34jtdDFUbcn7yo_CUuVAz2P1Ih-rRfkr3FljxXB4-6u6v6UF13QORpqrO-f3P1ZkDmdhdAY7P6MJWICesRVFHJqbAoRXYb-fzM9257p1fh5YJ8_iKjF2OoeR2MZIPpQH6lXR00HbmpSfQoGv8CpHLPEFVnzLXw1e8yqfgVoixrzlB2rkRUmnpE53_LtZWqoUVlcrJMdH5yURPJFKUXn-22Km7Tf",
    description: "Automated prioritization and routing of critical patient concerns to the appropriate department heads for immediate action.",
    primaryCapability: "Risk Priority & Routing",
    capabilities: [
      "Four-level severity grading (Low to Critical)",
      "Strict legal, clinical, and patient safety risk tagging",
      "Automated clinical routing (Compliance, Risk Mgmt, Billing, Nursing)",
      "Escalation speed determination (Routine, Priority, Immediate)",
      "Mandatory human review checkpoint gating"
    ],
    statusColor: "bg-rose-500"
  },
  {
    id: "analytics",
    name: "Healthcare Analytics Agent",
    role: "David Miller",
    specialty: "Senior Data Analyst",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA5TMOc5aacR7AM5su4VW_RHWWTNF01c2P1zOPHscX1ff43e0zgkgzNkd88x4qW-GjnTEfoEMj98QWEsTlstSeGka8oWtZbOgtkETMyBprFGpYQW36N0CZlce4nq2RJaYCa9QuVSVY3HMe9Qu1JJ8Fq3kLsYhJbUPa7vpgBDdGxxYVClTVw0ktSCZcnizPoJxyBvvlR6yLlg3CpGcKNDNOCTnRS3TwZ6EXQaYb4K-kEtAkfsP02i49",
    description: "Advanced statistical modeling and predictive forecasting for patient volume and resource allocation needs.",
    primaryCapability: "Executive Synthesis & KPIs",
    capabilities: [
      "Macro data aggregation across entire service line counts",
      "Satisfaction by persona and visit channel modeling",
      "Topic distribution & word frequency keyword matrix",
      "Hidden operational failure point detection",
      "Short-term and long-term strategic action recommendations"
    ],
    statusColor: "bg-purple-500"
  }
];

export const DEFAULT_PATIENT_COMMENTS: PatientComment[] = [
  {
    id: "c1",
    comment: "The doctor was extremely thorough and kind, but I had to wait for almost 2 hours in the waiting room before being seen. The receptionist didn't give any updates and seemed very annoyed when I asked. Also, as a senior citizen, standing for that long because there weren't enough chairs was very painful.",
    originalComment: "The doctor was extremely thorough and kind, but I had to wait for almost 2 hours in the waiting room before being seen. The receptionist didn't give any updates and seemed very annoyed when I asked. Also, as a senior citizen, standing for that long because there weren't enough chairs was very painful.",
    serviceLine: "Geriatrics",
    visitType: "In-Person",
    rating: 2,
    originalName: "Albert Jenkins (DOB: 04/12/1948)",
    isDeIdentified: true
  },
  {
    id: "c2",
    comment: "I received a bill for $450 for a routine physical that was supposed to be 100% covered by my insurance. When I tried to call the billing department, I was put on hold for 45 minutes, and then the line just disconnected. This is the third time this month I've had billing issues here.",
    originalComment: "I received a bill for $450 for a routine physical that was supposed to be 100% covered by my insurance. When I tried to call the billing department, I was put on hold for 45 minutes, and then the line just disconnected. This is the third time this month I've had billing issues here.",
    serviceLine: "Billing Dept",
    visitType: "Administrative",
    rating: 1,
    originalName: "Mary Thompson (Acct: #99281-X)",
    isDeIdentified: true
  },
  {
    id: "c3",
    comment: "The new patient portal is completely unusable. I tried to schedule my follow-up appointment, but the website kept crashing. As a blind patient, the screen reader compatibility is nonexistent—the buttons aren't labeled, and I couldn't navigate the menu at all. I had to ask my neighbor to help me, which violated my privacy.",
    originalComment: "The new patient portal is completely unusable. I tried to schedule my follow-up appointment, but the website kept crashing. As a blind patient, the screen reader compatibility is nonexistent—the buttons aren't labeled, and I couldn't navigate the menu at all. I had to ask my neighbor to help me, which violated my privacy.",
    serviceLine: "General Clinic",
    visitType: "Telehealth",
    rating: 1,
    originalName: "Sarah Wilkes (Email: sarah.w@gmail.com)",
    isDeIdentified: true
  },
  {
    id: "c4",
    comment: "The discharge instructions were incredibly confusing. The nurse gave me three different handouts with conflicting medication dosages for my heart condition. I ended up taking double my blood pressure medication and felt extremely dizzy, almost fainting. Luckily my daughter noticed the mistake and called the clinic.",
    originalComment: "The discharge instructions were incredibly confusing. The nurse gave me three different handouts with conflicting medication dosages for my heart condition. I ended up taking double my blood pressure medication and felt extremely dizzy, almost fainting. Luckily my daughter noticed the mistake and called the clinic.",
    serviceLine: "Cardiology",
    visitType: "In-Person",
    rating: 1,
    originalName: "Eleanor Vance (MRN: 8827-019)",
    isDeIdentified: true
  },
  {
    id: "c5",
    comment: "My mother has limited English proficiency, and during her oncology visit, there was no medical interpreter available. The doctor just spoke louder in English and asked me (her teenage son) to translate complex cancer treatment options. This was incredibly stressful and I am not sure I translated the medical terms correctly. She deserves safe, equitable care.",
    originalComment: "My mother has limited English proficiency, and during her oncology visit, there was no medical interpreter available. The doctor just spoke louder in English and asked me (her teenage son) to translate complex cancer treatment options. This was incredibly stressful and I am not sure I translated the medical terms correctly. She deserves safe, equitable care.",
    serviceLine: "Oncology",
    visitType: "In-Person",
    rating: 2,
    originalName: "Maria Garcia (Phone: 555-0192)",
    isDeIdentified: true
  },
  {
    id: "c6",
    comment: "The medical care itself was outstanding—Dr. Patel literally saved my life! But the scheduling system is a nightmare. I was booked for a 10:00 AM slot, but they said my appointment was at 9:00 AM and tried to charge me a $50 no-show fee. After showing my email confirmation, they reluctantly let me in but treated me like a criminal.",
    originalComment: "The medical care itself was outstanding—Dr. Patel literally saved my life! But the scheduling system is a nightmare. I was booked for a 10:00 AM slot, but they said my appointment was at 9:00 AM and tried to charge me a $50 no-show fee. After showing my email confirmation, they reluctantly let me in but treated me like a criminal.",
    serviceLine: "Cardiology",
    visitType: "In-Person",
    rating: 3,
    originalName: "Joseph Chang (MRN: 2991-A)",
    isDeIdentified: true
  }
];
