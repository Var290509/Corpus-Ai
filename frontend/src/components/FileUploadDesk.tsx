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
      console.error(e);
      alert('Error parsing citation file. Please verify format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    try {
      const papers = parseRawText(pastedText, activeVersionId);
      if (papers.length > 0) {
        onAddPapers(papers);
        setUploadStats({
          filename: 'Pasted Citations',
          count: papers.length,
          format: 'RAW / RIS'
        });
        setPastedText('');
        setShowPasteBox(false);
      } else {
        alert('Could not find citations in pasted text.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Universal Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`glass-panel-elevated rounded-2xl p-8 sm:p-12 border-2 border-dashed transition-all text-center relative overflow-hidden bg-[#1F140D]/90 ${
          isDragging 
            ? 'border-[#E6E0F0] bg-[#2E1C12]/90 scale-[1.01]' 
            : 'border-[#E6E0F0]/25 hover:border-[#E6E0F0]/40'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".ris,.csv,.json,.bib,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title="Drop or select research paper files"
        />

        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center mx-auto text-white shadow-xl">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#FAF9F8]">
              Drop your citation or paper files here
            </h3>
            <p className="text-xs text-[#A59E98] mt-1 leading-relaxed">
              Accepts <strong>.RIS</strong> (Rayyan/EndNote/Zotero), <strong>.CSV</strong>, <strong>.BIB</strong> (BibTeX), <strong>.JSON</strong>, or raw text.
            </p>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-[#E5E4E2] text-[#160E08] shadow-md">
            <span>Browse Citation Files on Computer</span>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-[#0E0704]/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-8 h-8 border-2 border-[#E6E0F0] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#FAF9F8]">Extracting & Enriching Papers with AI Badges...</span>
          </div>
        )}
      </div>

      {/* Upload Confirmation Stats */}
      {uploadStats && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <span className="font-bold text-[#FAF9F8]">
                Successfully imported {uploadStats.count} research papers!
              </span>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Source: {uploadStats.filename} • Format: {uploadStats.format} • Extracted PICO spans & deep rigor metrics
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-200 font-mono font-bold text-xs border border-emerald-700">
            +{uploadStats.count} Ready to Screen
          </span>
        </div>
      )}

      {/* Quick Paste Alternative */}
      <div className="glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 bg-[#1F140D]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <ClipboardPaste className="w-5 h-5 text-[#E6E0F0]" />
          <div>
            <h4 className="text-xs font-bold text-[#FAF9F8]">Have raw text or copied RIS entries?</h4>
            <p className="text-[11px] text-[#A59E98]">Paste citations directly without saving a file.</p>
          </div>
        </div>

        <button
          onClick={() => setShowPasteBox(!showPasteBox)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2B1B12] hover:bg-[#3B2518] text-[#E5E4E2] border border-[#E6E0F0]/20 transition-all cursor-pointer"
        >
          {showPasteBox ? 'Hide Paste Box' : 'Open Paste Box'}
        </button>
      </div>

      {showPasteBox && (
        <div className="glass-panel-elevated rounded-2xl p-5 border border-[#E6E0F0]/20 bg-[#1F140D]/95 space-y-3 animate-fade-in">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={5}
            placeholder="Paste raw RIS (e.g. TY  - JOUR ... ER  - ) or Title / Abstract blocks..."
            className="w-full glass-input rounded-xl p-3 text-xs font-mono text-[#FAF9F8] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim() || isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E5E4E2] text-[#160E08] hover:bg-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              Parse Pasted Citations
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
