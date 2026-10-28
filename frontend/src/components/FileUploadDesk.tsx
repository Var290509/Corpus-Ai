import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  FileCode, 
  Layers, 
  Sparkles,
  ArrowRight,
  ClipboardPaste
} from 'lucide-react';
import { ResearchPaper } from '../types';
import { parseUploadedFile, parseRawText } from '../services/fileParser';

interface FileUploadDeskProps {
  onAddPapers: (newPapers: ResearchPaper[]) => void;
  activeVersionId: string;
}

export const FileUploadDesk: React.FC<FileUploadDeskProps> = ({
  onAddPapers,
  activeVersionId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState<{
    filename: string;
    count: number;
    format: string;
  } | null>(null);

  const [pastedText, setPastedText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadStats(null);

    try {
      const allExtracted: ResearchPaper[] = [];
      let lastFilename = '';
      let lastFormat = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await parseUploadedFile(file, activeVersionId);
        allExtracted.push(...res.papers);
        lastFilename = res.filename;
        lastFormat = res.format.toUpperCase();
      }

      if (allExtracted.length > 0) {
        onAddPapers(allExtracted);
        setUploadStats({
          filename: lastFilename,
          count: allExtracted.length,
          format: lastFormat
        });
      }
    } catch (e) {
      console.error('File parsing error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePastedIngest = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    try {
      const papers = parseRawText(pastedText, activeVersionId);
      if (papers.length > 0) {
        onAddPapers(papers);
        setUploadStats({
          filename: 'Pasted Text Abstracts',
          count: papers.length,
          format: 'RAW_TEXT'
        });
        setPastedText('');
        setShowPasteBox(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#6F4E37] text-white">
              Universal File Ingestion
            </span>
            <span className="text-xs text-[#7E7A72]">
              RIS, CSV, JSON, BibTeX & Text
            </span>
          </div>
          <h2 className="text-base font-bold text-[#462E1E] mt-1 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#6F4E37]" />
            <span>Upload Research Papers into Your Project</span>
          </h2>
          <p className="text-xs text-[#5F5C56] mt-0.5">
            Drag and drop your systematic search files. The autonomous agent immediately reads the full text, 
            extracts study metrics ($N$, HR, $p$), assigns explainable AI badges, and runs deduplication.
          </p>
        </div>

        <button
          onClick={() => setShowPasteBox(!showPasteBox)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF9FD] text-[#5A3D29] border border-[#E6E0F0] shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-[#6F4E37]" />
          <span>{showPasteBox ? 'Hide Paste Box' : 'Paste Abstracts'}</span>
        </button>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[#6F4E37] bg-[#E6E0F0]/40'
            : 'border-[#d4c8e4] bg-white/60 hover:bg-white/90 hover:border-[#6F4E37]/50'
        }`}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept=".ris,.csv,.json,.bib,.bibtex,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-[#E6E0F0] flex items-center justify-center text-[#6F4E37] mx-auto mb-3 shadow-inner">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-[#462E1E]">
          {isProcessing ? 'Reading and Analyzing Total Text...' : 'Click to Upload or Drag & Drop Research Files'}
        </h3>

        <p className="text-xs text-[#7E7A72] mt-1 max-w-md mx-auto">
          Supports <strong>.RIS</strong> (from PubMed, Rayyan, EndNote), <strong>.CSV</strong>, <strong>.JSON</strong>, <strong>.BIB</strong>, and <strong>.TXT</strong> files.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5F5C56] font-mono">
          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E4E2]">RIS (Rayyan/EndNote)</span>
          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E4E2]">CSV (Excel/Sheets)</span>
          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E4E2]">BibTeX (LaTeX)</span>
          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E4E2]">JSON</span>
        </div>
      </div>

      {/* Optional Paste Text Box */}
      {showPasteBox && (
        <div className="bg-[#FAF9FD] p-4 rounded-xl border border-[#E6E0F0] space-y-3 animate-fade-in">
          <label className="block text-xs font-semibold text-[#462E1E]">
            Paste Abstract(s) Directly:
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={4}
            placeholder="Paste one or more paper abstracts here (separate multiple papers with blank lines)..."
            className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#2D2521] leading-relaxed resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePastedIngest}
              disabled={!pastedText.trim() || isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] text-white hover:bg-[#5A3D29] shadow-sm disabled:opacity-50"
            >
              Analyze & Ingest Pasted Text
            </button>
          </div>
        </div>
      )}

      {/* Upload Success Banner */}
      {uploadStats && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Successfully parsed and ingested <strong>{uploadStats.count} papers</strong> from <code>{uploadStats.filename}</code> ({uploadStats.format}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700">
            Deep Analysis Ready
          </span>
        </div>
      )}

    </div>
  );
};
