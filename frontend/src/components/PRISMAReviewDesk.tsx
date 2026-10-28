import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  Layers, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Filter,
  Activity,
  ArrowDown
} from 'lucide-react';
import { ResearchPaper, ReviewerDecision, AuditRunLog } from '../types';

interface PRISMAReviewDeskProps {
  papers: ResearchPaper[];
  decisions: Record<string, ReviewerDecision>;
  auditLogs: AuditRunLog[];
}

export const PRISMAReviewDesk: React.FC<PRISMAReviewDeskProps> = ({
  papers,
  decisions,
  auditLogs
}) => {
  const [activeExportFormat, setActiveExportFormat] = useState<'csv' | 'json' | 'ris'>('csv');

  // PRISMA Counts
  const totalIdentified = papers.length;
  const duplicateRecordsHidden = papers.filter(p => !p.isRepresentative).length;
  const screenedCount = papers.filter(p => p.isRepresentative).length;
  
  const includedPapers = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'include');
  const excludedPapers = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'exclude');
  const maybePapers = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'maybe');

  // Exclusion Reason Breakdown
  const exclusionReasonsCount: Record<string, number> = {};
  excludedPapers.forEach(p => {
    const reason = decisions[p.id]?.reason || 'Unspecified';
    const code = reason.split(':')[0].trim();
    exclusionReasonsCount[code] = (exclusionReasonsCount[code] || 0) + 1;
  });

  const exportData = (format: 'csv' | 'json' | 'ris') => {
    const dataToExport = includedPapers.length > 0 ? includedPapers : papers.filter(p => p.isRepresentative);

    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Authors', 'Year', 'Journal', 'DOI', 'PMID', 'Decision', 'Sample Size', 'Effect Metric', 'AI Badges'];
      const rows = dataToExport.map(p => [
        `"${p.id}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.authors.join('; ').replace(/"/g, '""')}"`,
        p.year,
        `"${p.journal.replace(/"/g, '""')}"`,
        `"${p.doi || ''}"`,
        `"${p.pmid || ''}"`,
        `"${decisions[p.id]?.status || 'unscreened'}"`,
        `"${p.deepAnalysis?.sampleSize || ''}"`,
        `"${p.deepAnalysis?.primaryEffectMetric || ''}"`,
        `"${(p.aiBadges || []).map(b => b.label).join(', ')}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `corpus_ai_systematic_review_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
      const link = document.createElement("a");
      link.setAttribute("href", jsonString);
      link.setAttribute("download", `corpus_ai_records_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'ris') {
      let ris = "";
      dataToExport.forEach(p => {
        ris += "TY  - JOUR\n";
        ris += `TI  - ${p.title}\n`;
        p.authors.forEach(a => { ris += `AU  - ${a}\n`; });
        ris += `PY  - ${p.year}\n`;
        ris += `JO  - ${p.journal}\n`;
        if (p.doi) ris += `DO  - ${p.doi}\n`;
        if (p.pmid) ris += `AN  - ${p.pmid}\n`;
        ris += `AB  - ${p.abstract}\n`;
        ris += "ER  - \n\n";
      });
      const risUri = "data:text/plain;charset=utf-8," + encodeURIComponent(ris);
      const link = document.createElement("a");
      link.setAttribute("href", risUri);
      link.setAttribute("download", `corpus_ai_citations_${Date.now()}.ris`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#6F4E37] text-white">
              PRISMA 2020
            </span>
            <span className="text-xs font-mono text-[#7E7A72]">Synthesis Reporting</span>
          </div>
          <h2 className="text-base font-bold text-[#462E1E] mt-1 flex items-center space-x-2">
            <Download className="w-4 h-4 text-[#6F4E37]" />
            <span>PRISMA Flow Diagram & Synthesis Export Center</span>
          </h2>
          <p className="text-xs text-[#5F5C56] mt-0.5">
            Transparent reporting of identification, deduplication, screening exclusion reasons, and included synthesis cohort.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportData('csv')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportData('ris')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF9FD] text-[#5A3D29] border border-[#E6E0F0] transition-all"
            title="Standard RIS format for EndNote, Zotero, and Mendeley"
          >
            <FileText className="w-3.5 h-3.5 text-[#6F4E37]" />
            <span>RIS Citations</span>
          </button>

          <button
            onClick={() => exportData('json')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF9FD] text-[#5A3D29] border border-[#E6E0F0] transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-[#6F4E37]" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* PRISMA 2020 Flow Diagram Cards */}
      <div className="glass-panel rounded-2xl p-6 border border-[#E6E0F0] space-y-4">
        <h3 className="text-sm font-semibold text-[#462E1E] flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#6F4E37]" />
          <span>PRISMA 2020 Systematic Review Flow</span>
        </h3>

        <div className="flex flex-col items-center space-y-3 max-w-xl mx-auto">
          
          {/* Phase 1: Identification */}
          <div className="w-full bg-white p-4 rounded-xl border border-[#E8D8CE] text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#6F4E37]">Identification</span>
            <div className="text-sm font-bold text-[#462E1E] mt-0.5">
              Records identified from databases (n = {totalIdentified.toLocaleString()})
            </div>
            <div className="text-[11px] text-[#7E7A72] mt-0.5">
              PubMed (E-utilities) & Europe PMC REST APIs
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-[#6F4E37]" />

          {/* Phase 2: Deduplication */}
          <div className="w-full bg-white p-4 rounded-xl border border-[#E8D8CE] text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#6F4E37]">Deduplication</span>
            <div className="text-sm font-bold text-[#462E1E] mt-0.5">
              Duplicate records marked & hidden (n = {duplicateRecordsHidden.toLocaleString()})
            </div>
            <div className="text-[11px] text-[#7E7A72] mt-0.5">
              Exact DOI/PMID matches & fuzzy title/author clustering (never deleted)
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-[#6F4E37]" />

          {/* Phase 3: Screening */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#E8D8CE] text-center shadow-2xs">
              <span className="text-[10px] uppercase font-mono font-bold text-[#6F4E37]">Screening</span>
              <div className="text-sm font-bold text-[#462E1E] mt-0.5">
                Records screened (n = {screenedCount.toLocaleString()})
              </div>
              <div className="text-[11px] text-[#7E7A72] mt-0.5">
                Automated regex/metadata + human review
              </div>
            </div>

            {/* Excluded by Reason Box */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 text-left shadow-2xs">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-800">Records Excluded (n = {excludedPapers.length.toLocaleString()})</span>
              <div className="mt-1 space-y-0.5 text-[11px] text-rose-900">
                {Object.entries(exclusionReasonsCount).map(([code, count]) => (
                  <div key={code} className="flex justify-between">
                    <span>• {code}:</span>
                    <strong className="font-mono">{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-[#6F4E37]" />

          {/* Phase 4: Included */}
          <div className="w-full bg-emerald-50/80 p-4 rounded-xl border border-emerald-300 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-800">Included Synthesis Cohort</span>
            <div className="text-base font-bold text-emerald-900 mt-0.5">
              Studies included in qualitative & quantitative synthesis (n = {includedPapers.length.toLocaleString()})
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Gold standard RCTs & prospectively verified clinical cohorts
            </div>
          </div>

        </div>
      </div>

      {/* Audit Run Log Section */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#462E1E] flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#6F4E37]" />
            <span>Audit Trail & Provenance Run Log</span>
          </h3>
          <span className="text-xs font-mono text-[#7E7A72]">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2.5 rounded-lg bg-white/70 border border-[#E8D8CE] flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2.5">
                <span className="text-[#7E7A72]">{log.timestamp}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#E6E0F0] text-[#5A3D29] font-semibold">
                  {log.step}
                </span>
                <span className="text-[#462E1E] font-medium">{log.action}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                log.actor === 'human' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
              }`}>
                {log.actor}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
