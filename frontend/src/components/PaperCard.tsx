import React, { useState } from 'react';
import { 
  Check, 
  X, 
  HelpCircle, 
  Award, 
  ExternalLink, 
  Tag, 
  Layers, 
  Sparkles, 
  Info,
  ChevronDown,
  UserCheck,
  Bot
} from 'lucide-react';
import { ResearchPaper, ReviewerDecision, AIBadge, PICOSpan } from '../types';

interface PaperCardProps {
  paper: ResearchPaper;
  decision?: ReviewerDecision;
  onDecide: (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string, note?: string) => void;
  onInspectBadge: (badge: AIBadge, paper: ResearchPaper) => void;
  onEditPICO?: (paperId: string) => void;
  duplicateGroupMembersCount?: number;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  decision,
  onDecide,
  onInspectBadge,
  onEditPICO,
  duplicateGroupMembersCount = 1
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExclusionReason, setSelectedExclusionReason] = useState<string>(
    decision?.reason || 'EXC-ANIMAL: Animal / Preclinical Model'
  );
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const status = decision?.status || 'unscreened';

  const exclusionOptions = [
    { code: 'EXC-ANIMAL', label: 'Animal / Rodent Preclinical Model' },
    { code: 'EXC-NON-ENG', label: 'Non-English Text' },
    { code: 'EXC-SIM', label: 'In Silico / Computational Simulation' },
    { code: 'EXC-CASE', label: 'Single Case Report (N=1)' },
    { code: 'EXC-NO-PICO', label: 'Irrelevant Population or Endpoints' },
    { code: 'EXC-REVIEW', label: 'Narrative Review / Editorial' },
  ];

  // Helper to render abstract with PICO highlighted spans
  const renderAbstractWithSpans = () => {
    if (!paper.picoSpans || paper.picoSpans.length === 0) {
      return <span>{paper.abstract}</span>;
    }

    // Sort spans by startIndex
    const sorted = [...paper.picoSpans].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((span, idx) => {
      // Unhighlighted text before span
      if (span.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{paper.abstract.slice(lastIndex, span.startIndex)}</span>
        );
      }

      // Span badge style
      let spanClass = "pico-p";
      if (span.type === 'I') spanClass = "pico-i";
      if (span.type === 'C') spanClass = "pico-c";
      if (span.type === 'O') spanClass = "pico-o";

      elements.push(
        <mark
          key={`span-${idx}`}
          className={`${spanClass} px-1 py-0.5 rounded text-xs cursor-pointer inline-flex items-center group relative font-medium`}
          title={`PICO [${span.label}]: ${span.text}`}
        >
          <span className="text-[9px] font-mono font-bold mr-1 opacity-70">[{span.type}]</span>
          <span>{span.text}</span>
        </mark>
      );

      lastIndex = span.endIndex;
    });

    if (lastIndex < paper.abstract.length) {
      elements.push(
        <span key="text-end">{paper.abstract.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all text-left relative ${
      status === 'include'
        ? 'border-emerald-500/50 bg-emerald-50/20'
        : status === 'exclude'
        ? 'border-rose-400/40 bg-rose-50/15 opacity-80'
        : status === 'maybe'
        ? 'border-lavender-400/50 bg-lavender-50/20'
        : 'border-[#E5E4E2]'
    }`}>
      
      {/* Top Meta Line: Status, Duplicate Indicator, Year, Journal */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          
          {/* Decision Status Pill */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 ${
            status === 'include'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : status === 'exclude'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : status === 'maybe'
              ? 'bg-[#E6E0F0] text-[#5A3D29] border border-[#d4c8e4]'
              : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}>
            <span>{status}</span>
            {decision?.isOverridden && (
              <span title="Human Overridden Decision" className="ml-1 text-[9px] text-[#6F4E37] font-bold">
                (Human)
              </span>
            )}
          </span>

          {/* Duplicate Group Pill */}
          {duplicateGroupMembersCount > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-[#FAF9FD] text-[#5A3D29] border border-[#E6E0F0] text-[10px] flex items-center space-x-1 font-mono">
              <Layers className="w-3 h-3 text-[#6F4E37]" />
              <span>Group ({duplicateGroupMembersCount} merged)</span>
            </span>
          )}

          {/* Source Tag */}
          <span className="text-[10px] uppercase font-mono text-[#7E7A72]">
            {paper.source}
          </span>
        </div>

        {/* Journal and Year */}
        <div className="text-xs text-[#7E7A72] flex items-center space-x-2">
          <span className="font-medium text-[#462E1E]">{paper.journal}</span>
          <span>•</span>
          <span>{paper.year}</span>
        </div>
      </div>

      {/* Paper Title */}
      <h4 className="text-sm font-semibold text-[#2D2521] leading-snug hover:text-[#6F4E37] transition-colors">
        {paper.title}
      </h4>

      {/* Authors & Identifiers */}
      <div className="text-xs text-[#7E7A72] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[#6F4E37] hover:underline flex items-center space-x-0.5 text-[11px]"
          >
            <span>doi:{paper.doi}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        )}
        {paper.pmid && (
          <span className="font-mono text-[11px] text-[#5F5C56]">
            PMID:{paper.pmid}
          </span>
        )}
      </div>

      {/* AI Badges Row (Core Feature: Hover / Click to see why AI gave the badge) */}
      {paper.aiBadges && paper.aiBadges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-[#7E7A72] uppercase mr-1 flex items-center">
            <Sparkles className="w-3 h-3 text-[#6F4E37] mr-0.5" />
            AI Badges:
          </span>

          {paper.aiBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => onInspectBadge(badge, paper)}
              className="group/badge px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center space-x-1.5 bg-white/90 hover:bg-[#FAF9FD] border border-[#E6E0F0] text-[#462E1E] hover:border-[#6F4E37] shadow-xs"
              title="Click to inspect exact AI rationale & textual evidence"
            >
              <Award className="w-3 h-3 text-[#6F4E37] group-hover/badge:scale-110 transition-transform" />
              <span>{badge.label}</span>
              <Info className="w-2.5 h-2.5 text-[#B8B5AE] group-hover/badge:text-[#6F4E37]" />
            </button>
          ))}
        </div>
      )}

      {/* Abstract with PICO Span Highlighting */}
      <div className="mt-3 text-xs text-[#5F5C56] leading-relaxed">
        <div className={`relative ${isExpanded ? '' : 'line-clamp-3'}`}>
          {renderAbstractWithSpans()}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-[#6F4E37] hover:underline font-medium mt-1 inline-block"
        >
          {isExpanded ? 'Show less' : 'Expand full abstract & PICO tags...'}
        </button>
      </div>

      {/* Deep Analysis Quantitative Metrics Bar */}
      {paper.deepAnalysis && (
        <div className="mt-3.5 pt-3 border-t border-[#E6E0F0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-white/60 p-2 rounded-lg border border-[#E5E4E2]">
            <span className="text-[9px] text-[#7E7A72] block uppercase font-mono">Sample Size</span>
            <span className="font-semibold text-[#462E1E]">
              {paper.deepAnalysis.sampleSize ? `N=${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'N/A'}
            </span>
          </div>

          <div className="bg-white/60 p-2 rounded-lg border border-[#E5E4E2]">
            <span className="text-[9px] text-[#7E7A72] block uppercase font-mono">Primary Effect</span>
            <span className="font-semibold text-[#6F4E37] truncate block" title={paper.deepAnalysis.primaryEffectMetric}>
              {paper.deepAnalysis.primaryEffectMetric || 'Stabilization'}
            </span>
          </div>

          <div className="bg-white/60 p-2 rounded-lg border border-[#E5E4E2]">
            <span className="text-[9px] text-[#7E7A72] block uppercase font-mono">Rigor Score</span>
            <span className="font-semibold text-[#462E1E]">
              {paper.deepAnalysis.statisticalRigorScore}/100
            </span>
          </div>

          <div className="bg-white/60 p-2 rounded-lg border border-[#E5E4E2]">
            <span className="text-[9px] text-[#7E7A72] block uppercase font-mono">Consensus State</span>
            <span className={`font-semibold truncate block ${
              paper.deepAnalysis.consensusAlignment === 'Contradicts Prevailing Data'
                ? 'text-rose-600'
                : 'text-emerald-700'
            }`}>
              {paper.deepAnalysis.consensusAlignment}
            </span>
          </div>
        </div>
      )}

      {/* Decision Reason (if Excluded) */}
      {status === 'exclude' && decision?.reason && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-center justify-between">
          <span><strong>Exclusion Reason:</strong> {decision.reason}</span>
        </div>
      )}

      {/* Screening Action Bar (Step 5 Human-in-the-Loop Controls) */}
      <div className="mt-4 pt-3 border-t border-[#E6E0F0] flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[#7E7A72] flex items-center space-x-1.5">
          {decision?.decidedBy === 'human' ? (
            <span className="flex items-center text-[#6F4E37] font-medium">
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Reviewed by Human
            </span>
          ) : (
            <span className="flex items-center text-[#7E7A72]">
              <Bot className="w-3.5 h-3.5 mr-1" />
              Auto-Classified
            </span>
          )}
        </div>

        {/* 3-way Triage Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Include Button */}
          <button
            onClick={() => onDecide(paper.id, 'include')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
              status === 'include'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Include</span>
          </button>

          {/* Exclude with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReasonDropdown(!showReasonDropdown)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                status === 'exclude'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Exclude</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showReasonDropdown && (
              <div className="absolute right-0 bottom-full mb-1.5 w-64 glass-panel-elevated rounded-xl border border-[#E6E0F0] shadow-xl p-2 z-30 text-xs">
                <span className="text-[10px] font-mono text-[#7E7A72] px-2 py-1 block">
                  Select Required Exclusion Reason:
                </span>
                {exclusionOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onDecide(paper.id, 'exclude', `${opt.code}: ${opt.label}`);
                      setShowReasonDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors block text-[11px]"
                  >
                    <span className="font-mono font-bold mr-1 text-[#6F4E37]">{opt.code}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maybe Button */}
          <button
            onClick={() => onDecide(paper.id, 'maybe', 'Needs full-text review for dosage and clinical outcomes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
              status === 'maybe'
                ? 'bg-[#6F4E37] text-white shadow-sm'
                : 'bg-white hover:bg-[#FAF9FD] text-[#5A3D29] border border-[#E6E0F0]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Maybe</span>
          </button>
        </div>
      </div>

    </div>
  );
};
