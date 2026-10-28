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
  ClipboardPaste,
  Star
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
    duplicatesRemoved: number;
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
      let totalDupesRemoved = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await parseUploadedFile(file, activeVersionId);
        allExtracted.push(...res.papers);
        lastFilename = res.filename;
        lastFormat = res.format.toUpperCase();
        totalDupesRemoved += res.duplicatesRemoved || 0;
      }

      if (allExtracted.length > 0) {
        onAddPapers(allExtracted);
        setUploadStats({
          filename: lastFilename,
          count: allExtracted.length,
          duplicatesRemoved: totalDupesRemoved,
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
          duplicatesRemoved: 0,
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
        className={`glass-panel-elevated rounded-2xl p-8 sm:p-12 border-2 border-dashed transition-all text-center relative overflow-hidden bg-[#362419]/90 ${
          isDragging 
            ? 'border-[#E6E0F0] bg-[#4A3324]/95 scale-[1.01]' 
            : 'border-[#E6E0F0]/30 hover:border-[#E6E0F0]/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.ris,.csv,.json,.bib,.bibtex,.txt"
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
            <p className="text-xs text-[#E5E4E2]/80 mt-1 leading-relaxed">
              Accepts <strong>.PDF</strong>, <strong>.RIS</strong> (EndNote/Zotero/Scopus), <strong>.CSV</strong>, <strong>.BIB</strong> (BibTeX), <strong>.JSON</strong>, or raw text.
            </p>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] shadow-md">
            <span>Browse Citation Files on Computer</span>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-[#271911]/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-8 h-8 border-2 border-[#E6E0F0] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#FAF9F8]">Deduplicating & Computing AI Ratings with Evidence...</span>
          </div>
        )}
      </div>

      {/* Upload Confirmation Stats */}
      {uploadStats && (
        <div className="p-4 rounded-2xl bg-emerald-950/85 border border-emerald-600/60 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <span className="font-bold text-[#FAF9F8]">
                Successfully imported {uploadStats.count} research papers!
              </span>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Source: {uploadStats.filename} • Format: {uploadStats.format} • {uploadStats.duplicatesRemoved} duplicates removed • AI ratings & citations computed
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-200 font-mono font-bold text-xs border border-emerald-700">
            +{uploadStats.count} Ready
          </span>
        </div>
      )}

      {/* Quick Paste Alternative */}
      <div className="glass-panel rounded-2xl p-5 border border-[#E6E0F0]/20 bg-[#362419]/85 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <ClipboardPaste className="w-5 h-5 text-[#E6E0F0]" />
          <div>
            <h4 className="text-xs font-bold text-[#FAF9F8]">Have raw text or copied RIS entries?</h4>
            <p className="text-[11px] text-[#E5E4E2]/70">Paste citations directly without saving a file.</p>
          </div>
        </div>

        <button
          onClick={() => setShowPasteBox(!showPasteBox)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4A3324] hover:bg-[#5C3F2D] text-[#FAF9F8] border border-[#E6E0F0]/25 transition-all cursor-pointer"
        >
          {showPasteBox ? 'Hide Paste Box' : 'Open Paste Box'}
        </button>
      </div>

      {showPasteBox && (
        <div className="glass-panel-elevated rounded-2xl p-5 border border-[#E6E0F0]/25 bg-[#362419]/95 space-y-3 animate-fade-in">
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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              Parse Pasted Citations
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
