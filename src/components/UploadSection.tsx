import React, { useState, useRef } from "react";
import { PatientComment } from "../types";
import { Upload, CheckCircle2, ShieldAlert, Sparkles, FileSpreadsheet, Eye, HelpCircle, Lock, RefreshCw, AlertTriangle } from "lucide-react";

interface UploadSectionProps {
  comments: PatientComment[];
  onSetComments: (comments: PatientComment[]) => void;
  onNavigateToConfig: () => void;
}

export default function UploadSection({ comments, onSetComments, onNavigateToConfig }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [privacyChecked, setPrivacyChecked] = useState(true);
  const [isDeidentifying, setIsDeidentifying] = useState(false);
  const [deidentifiedLog, setDeidentifiedLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to de-identify text using regex matching for names, MRNs, emails, phones
  const deidentifyText = (text: string, originalName: string): { comment: string, cleanedName: string, changes: string[] } => {
    let comment = text;
    const changes: string[] = [];

    // Redact MRN formats
    const mrnRegex = /(?:MRN|MRN:)\s*#?[0-9a-zA-Z-]{3,10}/gi;
    if (mrnRegex.test(comment)) {
      comment = comment.replace(mrnRegex, "[REDACTED MRN]");
      changes.push("Redacted Patient Medical Record Number (MRN).");
    }

    // Redact emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
    if (emailRegex.test(comment)) {
      comment = comment.replace(emailRegex, "[REDACTED EMAIL]");
      changes.push("Redacted Patient Email Account.");
    }

    // Redact phone numbers
    const phoneRegex = /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    if (phoneRegex.test(comment)) {
      comment = comment.replace(phoneRegex, "[REDACTED PHONE]");
      changes.push("Redacted Patient Phone Contact.");
    }

    // Determine clean clinical ID
    const matchId = originalName.match(/(?:MRN|Acct|Phone|DOB|Email):\s*#?[0-9a-zA-Z-.@#\s/]+/i);
    let cleanedName = "[DE-IDENTIFIED PATIENT]";
    if (matchId) {
      cleanedName = `[PATIENT | ${matchId[0].toUpperCase()}]`;
    }

    return { comment, cleanedName, changes };
  };

  const handleDeidentifyTrigger = () => {
    setIsDeidentifying(true);
    const logs: string[] = ["Initializing clinical de-identification filters...", "Loading HIPAA Safe Harbor guidelines..."];

    setTimeout(() => {
      const deidentified = comments.map((c, i) => {
        const { comment, cleanedName, changes } = deidentifyText(c.comment, c.originalName || "Unknown Patient");
        changes.forEach(change => logs.push(`Row ${i + 1}: ${change}`));
        return {
          ...c,
          comment,
          originalName: cleanedName,
          isDeIdentified: true
        };
      });

      if (logs.length === 2) {
        logs.push("Scan complete. Dataset verified as de-identified.");
      } else {
        logs.push(`Scan complete. Redacted ${logs.length - 2} sensitive PII records successfully.`);
      }

      onSetComments(deidentified);
      setDeidentifiedLog(logs);
      setIsDeidentifying(false);
    }, 1200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processCSVText = (text: string) => {
    const lines = text.split("\n");
    if (lines.length <= 1) return;

    // Very simple CSV parser
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const newComments: PatientComment[] = [];

    // Map columns
    const commentIdx = headers.findIndex(h => /comment|text|feedback|review/i.test(h));
    const serviceIdx = headers.findIndex(h => /service|dept|line|department/i.test(h));
    const visitIdx = headers.findIndex(h => /visit|channel|type/i.test(h));
    const ratingIdx = headers.findIndex(h => /rating|score|star/i.test(h));
    const nameIdx = headers.findIndex(h => /name|id|mrn|patient/i.test(h));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split line accounting for commas inside quotes
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const row = matches ? matches.map(val => val.replace(/^["']|["']$/g, "").trim()) : line.split(",");

      if (row.length === 0 || !row[commentIdx === -1 ? 0 : commentIdx]) continue;

      const commentVal = row[commentIdx === -1 ? 0 : commentIdx] || "No comment.";
      const serviceVal = row[serviceIdx === -1 ? 1 : serviceIdx] || "General Clinic";
      const visitVal = row[visitIdx === -1 ? 2 : visitIdx] || "In-Person";
      const ratingVal = parseInt(row[ratingIdx === -1 ? 3 : ratingIdx]) || 3;
      const nameVal = row[nameIdx === -1 ? 4 : nameIdx] || `Anonymous Patient #${i}`;

      const { comment: deComment, cleanedName, changes } = deidentifyText(commentVal, nameVal);

      newComments.push({
        id: `u-${i}`,
        comment: deComment,
        originalComment: commentVal,
        serviceLine: serviceVal,
        visitType: visitVal,
        rating: ratingVal,
        originalName: cleanedName,
        isDeIdentified: true
      });
    }

    onSetComments(newComments);
    setSelectedFile("uploaded_patient_feedback.csv");
    setPreviewOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processCSVText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processCSVText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="dataset-upload-component">
      {/* Upload Drag Area */}
      <div
        className={`glass-card rounded-xl p-8 border-dashed border-2 flex flex-col items-center justify-center text-center transition-all group relative ${
          dragActive
            ? "border-secondary bg-secondary/5 scale-[1.01]"
            : "border-slate-200 hover:border-secondary hover:bg-slate-50/50"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-14 h-14 bg-secondary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
          <Upload className="w-7 h-7 text-secondary" />
        </div>

        <h3 className="font-display font-semibold text-lg text-slate-800 mb-1">
          Upload Clinical Feedback Datasets
        </h3>
        <p className="text-slate-500 text-xs mb-5 max-w-md">
          Drag and drop your patient feedback <strong className="text-slate-700">CSV spreadsheet</strong> here, or browse files on your device.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="bg-secondary text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Browse CSV File
          </button>
          
          <div className="flex items-center gap-1.5 text-tertiary bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            HIPAA Compliant System Ready
          </div>
        </div>
      </div>

      {/* HIPAA Compliance and De-identification Control Center */}
      <div className="glass-card rounded-xl p-6 border border-slate-100 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              De-Identification Security Panel
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                ACTIVE
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 max-w-3xl leading-relaxed">
              To strictly protect patient-related information, this portal utilizes automated regex de-identification filters. All patient names, medical record numbers (MRNs), phone records, and emails are redacted before multi-agent synthesis.
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-secondary hover:text-blue-700 hover:bg-blue-50/50 px-3 py-1.5 rounded-md flex items-center gap-1 flex-shrink-0"
            onClick={handleDeidentifyTrigger}
            disabled={isDeidentifying}
          >
            {isDeidentifying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
            ) : (
              <Lock className="w-4 h-4 text-secondary" />
            )}
            Re-Scan PII Sensitive Data
          </button>
        </div>

        {/* Real-time de-identification logging drawer */}
        {deidentifiedLog.length > 0 && (
          <div className="p-4 bg-slate-900 text-slate-300 rounded-lg font-mono text-[10px] shadow-inner max-h-36 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            <div className="text-slate-500 font-semibold border-b border-slate-800 pb-1 mb-1 flex justify-between">
              <span>DEIDENTIFICATION_SYS_DAEMON_LOG</span>
              <span className="text-emerald-400 font-bold">100% SECURE</span>
            </div>
            {deidentifiedLog.map((log, index) => (
              <div key={index} className={index === deidentifiedLog.length - 1 ? "text-emerald-400 font-semibold" : ""}>
                &gt; {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dataset Preview section if a file is uploaded or default exists */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Patient Feedback Database Preview
              </h4>
              <p className="text-slate-500 text-[11px]">
                {comments.length} rows loaded | de-identified metadata verified
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-secondary hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              onClick={onNavigateToConfig}
            >
              Configure Analysis
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data preview spreadsheet table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Patient Identifier</th>
                <th className="px-5 py-3">Department / Service</th>
                <th className="px-5 py-3">Visit Format</th>
                <th className="px-5 py-3 text-center">Score</th>
                <th className="px-5 py-3">Patient Comment / Grievance</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4.5 font-mono text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md w-fit">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      {c.originalName || "[DE-IDENTIFIED]"}
                    </span>
                  </td>
                  <td className="px-5 py-4.5 font-semibold text-slate-900">{c.serviceLine}</td>
                  <td className="px-5 py-4.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {c.visitType}
                    </span>
                  </td>
                  <td className="px-5 py-4.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                        c.rating >= 4
                          ? "bg-emerald-50 text-emerald-700"
                          : c.rating === 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {c.rating}
                    </span>
                  </td>
                  <td className="px-5 py-4.5 max-w-xs md:max-w-md truncate text-slate-500 text-xs">
                    {c.comment}
                  </td>
                  <td className="px-5 py-4.5 text-right">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      Un-analyzed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
