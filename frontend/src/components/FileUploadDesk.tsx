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
import { parseUploadedFile, parseRawText, parseUploadedFilesBatch } from '../services/fileParser';

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
    duplicateFilesSkipped?: number;
    format: string;
  } | null>(null);

  const [pastedText, setPastedText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadStats(null);

    try {
      const fileArray = Array.from(files);
      const res = await parseUploadedFilesBatch(fileArray, [], activeVersionId);

      if (res.papers.length > 0) {
        onAddPapers(res.papers);
        setUploadStats({
          filename: res.processedFileNames.slice(0, 2).join(', ') + (res.processedFileNames.length > 2 ? ` (+${res.processedFileNames.length - 2} more)` : ''),
          count: res.papers.length,
          duplicatesRemoved: res.duplicateDataRemoved,
          duplicateFilesSkipped: res.duplicateFilesSkipped,
          format: 'MULTI-MODAL / OCR'
        });
      } else if (res.duplicateFilesSkipped > 0) {
        alert('All uploaded files were identified as duplicate files and skipped.');
      }
    } catch (e) {
      console.error(e);
      alert('Error parsing uploaded files. Please verify format.');
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
        className={`glass-panel-elevated rounded-2xl p-8 sm:p-12 border-2 border-dashed transition-all text-center relative overflow-hidden bg-[#0B1630]/90 ${
          isDragging 
            ? 'border-[#E0E5E7] bg-[#192440]/95 scale-[1.01]' 
            : 'border-[#E0E5E7]/30 hover:border-[#E0E5E7]/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.ris,.csv,.json,.bib,.bibtex,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title="Drop or select research paper files or images"
        />

        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center mx-auto text-white shadow-xl">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#F9F8FD]">
              Drop your citation files, PDFs, or research posters/images here
            </h3>
            <p className="text-xs text-[#F9F8FD]/80 mt-1 leading-relaxed">
              Accepts <strong>.PDF</strong>, <strong>Pictures/Posters (.PNG, .JPG, .WEBP)</strong> via deep OCR, <strong>.RIS</strong> (Scopus/WoS/PubMed), <strong>.CSV</strong>, <strong>.BIB</strong>, or <strong>.JSON</strong>.
            </p>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-[#F9F8FD] text-[#0A1225] shadow-md">
            <span>Browse Research Files on Computer</span>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-[#060D1E]/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-8 h-8 border-2 border-[#E0E5E7] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#F9F8FD]">Deduplicating & Computing AI Ratings with Evidence...</span>
          </div>
        )}
      </div>

      {/* Upload Confirmation Stats */}
      {uploadStats && (
        <div className="p-4 rounded-2xl bg-emerald-950/85 border border-emerald-600/60 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <span className="font-bold text-[#F9F8FD]">
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
      <div className="glass-panel rounded-2xl p-5 border border-[#E0E5E7]/20 bg-[#0B1630]/85 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <ClipboardPaste className="w-5 h-5 text-[#E0E5E7]" />
          <div>
            <h4 className="text-xs font-bold text-[#F9F8FD]">Have raw text or copied RIS entries?</h4>
            <p className="text-[11px] text-[#F9F8FD]/70">Paste citations directly without saving a file.</p>
          </div>
        </div>

        <button
          onClick={() => setShowPasteBox(!showPasteBox)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#192440] hover:bg-[#223154] text-[#F9F8FD] border border-[#E0E5E7]/25 transition-all cursor-pointer"
        >
          {showPasteBox ? 'Hide Paste Box' : 'Open Paste Box'}
        </button>
      </div>

      {showPasteBox && (
        <div className="glass-panel-elevated rounded-2xl p-5 border border-[#E0E5E7]/25 bg-[#0B1630]/95 space-y-3 animate-fade-in">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={5}
            placeholder="Paste raw RIS (e.g. TY  - JOUR ... ER  - ) or Title / Abstract blocks..."
            className="w-full glass-input rounded-xl p-3 text-xs font-mono text-[#F9F8FD] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim() || isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F9F8FD] text-[#0A1225] hover:bg-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              Parse Pasted Citations
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
