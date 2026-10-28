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
  onDiscoverSimilar?: (paper: ResearchPaper) => void;
  onEditPICO?: (paperId: string) => void;
  duplicateGroupMembersCount?: number;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  decision,
  onDecide,
  onInspectBadge,
  onDiscoverSimilar,
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

    const sorted = [...paper.picoSpans].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((span, idx) => {
      if (span.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{paper.abstract.slice(lastIndex, span.startIndex)}</span>
        );
      }

      let spanStyle = "bg-blue-950/60 text-blue-200 border-blue-700/50";
      if (span.type === 'I') spanStyle = "bg-purple-950/60 text-purple-200 border-purple-700/50";
      if (span.type === 'C') spanStyle = "bg-amber-950/60 text-amber-200 border-amber-700/50";
      if (span.type === 'O') spanStyle = "bg-emerald-950/60 text-emerald-200 border-emerald-700/50";

      elements.push(
        <mark
          key={`span-${idx}`}
          className={`${spanStyle} px-1.5 py-0.5 rounded text-xs border inline-flex items-center font-medium my-0.5`}
          title={`PICO [${span.label}]: ${span.text}`}
        >
          <span className="text-[9px] font-mono font-bold mr-1 opacity-80">[{span.type}]</span>
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
        ? 'border-emerald-500/50 bg-[#162719]/80'
        : status === 'exclude'
        ? 'border-rose-500/40 bg-[#291313]/70 opacity-80'
        : status === 'maybe'
        ? 'border-indigo-400/50 bg-[#1E1929]/75'
        : 'border-[#E6E0F0]/15'
    }`}>
      
      {/* Top Meta Line: Status, Duplicate Indicator, Year, Journal */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          
          {/* Decision Status Pill */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 ${
            status === 'include'
              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50'
              : status === 'exclude'
              ? 'bg-rose-900/80 text-rose-300 border border-rose-600/50'
              : status === 'maybe'
              ? 'bg-[#3B2518] text-[#E6E0F0] border border-[#E6E0F0]/30'
              : 'bg-[#24160E] text-[#B8B3AC] border border-[#E6E0F0]/15'
          }`}>
            <span>{status}</span>
            {decision?.isOverridden && (
              <span title="Human Overridden Decision" className="ml-1 text-[9px] text-amber-300 font-bold">
                (Human)
              </span>
            )}
          </span>

          {/* Duplicate Group Pill */}
          {duplicateGroupMembersCount > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-[#24160E] text-[#E6E0F0] border border-[#E6E0F0]/25 text-[10px] flex items-center space-x-1 font-mono">
              <Layers className="w-3 h-3 text-[#E5E4E2]" />
              <span>Group ({duplicateGroupMembersCount} merged)</span>
            </span>
          )}

          {/* Source Tag */}
          <span className="text-[10px] uppercase font-mono text-[#8E8680]">
            {paper.source}
          </span>
        </div>

        {/* Journal and Year */}
        <div className="text-xs text-[#A59E98] flex items-center space-x-2">
          <span className="font-medium text-[#FAF9F8]">{paper.journal}</span>
          <span>•</span>
          <span>{paper.year}</span>
        </div>
      </div>

      {/* Paper Title */}
      <h4 className="text-sm font-semibold text-[#FAF9F8] leading-snug hover:text-white transition-colors">
        {paper.title}
      </h4>

      {/* Authors & Identifiers */}
      <div className="text-xs text-[#A59E98] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[#E6E0F0] hover:underline flex items-center space-x-0.5 text-[11px]"
          >
            <span>doi:{paper.doi}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        )}
        {paper.pmid && (
          <span className="font-mono text-[11px] text-[#8E8680]">
            PMID:{paper.pmid}
          </span>
        )}
      </div>

      {/* AI Badges Row & Recommender Button */}
      <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
        {paper.aiBadges && paper.aiBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-[#8E8680] uppercase mr-1 flex items-center">
              <Sparkles className="w-3 h-3 text-[#E6E0F0] mr-0.5" />
              Badges:
            </span>

            {paper.aiBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => onInspectBadge(badge, paper)}
                className="group/badge px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center space-x-1.5 bg-[#2B1B12] hover:bg-[#3B2518] border border-[#E6E0F0]/20 text-[#FAF9F8] hover:border-[#E6E0F0]/50 shadow-sm cursor-pointer"
                title="Click to inspect exact AI rationale & textual evidence"
              >
                <Award className="w-3 h-3 text-[#E6E0F0] group-hover/badge:scale-110 transition-transform" />
                <span>{badge.label}</span>
                <Info className="w-2.5 h-2.5 text-[#8E8680] group-hover/badge:text-[#FAF9F8]" />
              </button>
            ))}
          </div>
        )}

        {/* Multi-Database Discovery Trigger */}
        {onDiscoverSimilar && (
          <button
            onClick={() => onDiscoverSimilar(paper)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#2B1B12] text-[#E6E0F0] border border-[#E6E0F0]/25 hover:bg-[#3B2518] hover:text-white transition-all flex items-center space-x-1 cursor-pointer"
            title="Scan Scopus, Web of Science, PubMed, IEEE Xplore & Digital Library for similar literature"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Discover Similar (Scopus/WoS/IEEE)</span>
          </button>
        )}
      </div>

      {/* Abstract with PICO Span Highlighting */}
      <div className="mt-3 text-xs text-[#C5BFB8] leading-relaxed">
        <div className={`relative ${isExpanded ? '' : 'line-clamp-3'}`}>
          {renderAbstractWithSpans()}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-[#E6E0F0] hover:underline font-medium mt-1 inline-block cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'Expand full abstract & highlights...'}
        </button>
      </div>

      {/* Deep Analysis Quantitative Metrics Bar */}
      {paper.deepAnalysis && (
        <div className="mt-3.5 pt-3 border-t border-[#E6E0F0]/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-[#180E08]/80 p-2 rounded-lg border border-[#E6E0F0]/10">
            <span className="text-[9px] text-[#8E8680] block uppercase font-mono">Sample Size</span>
            <span className="font-semibold text-[#FAF9F8]">
              {paper.deepAnalysis.sampleSize ? `N=${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#180E08]/80 p-2 rounded-lg border border-[#E6E0F0]/10">
            <span className="text-[9px] text-[#8E8680] block uppercase font-mono">Primary Effect</span>
            <span className="font-semibold text-[#E6E0F0] truncate block" title={paper.deepAnalysis.primaryEffectMetric}>
              {paper.deepAnalysis.primaryEffectMetric || 'Stabilization'}
            </span>
          </div>

          <div className="bg-[#180E08]/80 p-2 rounded-lg border border-[#E6E0F0]/10">
            <span className="text-[9px] text-[#8E8680] block uppercase font-mono">Rigor Score</span>
            <span className="font-semibold text-[#FAF9F8]">
              {paper.deepAnalysis.statisticalRigorScore}/100
            </span>
          </div>

          <div className="bg-[#180E08]/80 p-2 rounded-lg border border-[#E6E0F0]/10">
            <span className="text-[9px] text-[#8E8680] block uppercase font-mono">Consensus State</span>
            <span className={`font-semibold truncate block ${
              paper.deepAnalysis.consensusAlignment === 'Contradicts Prevailing Data'
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}>
              {paper.deepAnalysis.consensusAlignment}
            </span>
          </div>
        </div>
      )}

      {/* Decision Reason (if Excluded) */}
      {status === 'exclude' && decision?.reason && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-[11px] text-rose-300 flex items-center justify-between">
          <span><strong>Exclusion Reason:</strong> {decision.reason}</span>
        </div>
      )}

      {/* Screening Action Bar */}
      <div className="mt-4 pt-3 border-t border-[#E6E0F0]/15 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[#8E8680] flex items-center space-x-1.5">
          {decision?.decidedBy === 'human' ? (
            <span className="flex items-center text-[#E6E0F0] font-medium">
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Reviewed by Human
            </span>
          ) : (
            <span className="flex items-center text-[#8E8680]">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              status === 'include'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#24160E] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Include</span>
          </button>

          {/* Exclude with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReasonDropdown(!showReasonDropdown)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                status === 'exclude'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-[#24160E] hover:bg-rose-950/60 text-rose-300 border border-rose-600/40'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Exclude</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showReasonDropdown && (
              <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-[#1E130B] border border-[#E6E0F0]/25 rounded-xl shadow-xl p-2 z-30 text-xs">
                <span className="text-[10px] font-mono text-[#8E8680] px-2 py-1 block">
                  Select Required Exclusion Reason:
                </span>
                {exclusionOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onDecide(paper.id, 'exclude', `${opt.code}: ${opt.label}`);
                      setShowReasonDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/70 hover:text-rose-200 transition-colors block text-[11px]"
                  >
                    <span className="font-mono font-bold mr-1 text-[#E6E0F0]">{opt.code}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maybe Button */}
          <button
            onClick={() => onDecide(paper.id, 'maybe', 'Needs full-text review for dosage and clinical outcomes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              status === 'maybe'
                ? 'bg-[#3B2518] text-[#E6E0F0] border border-[#E6E0F0]/40 shadow-md'
                : 'bg-[#24160E] hover:bg-[#341F14] text-[#B8B3AC] border border-[#E6E0F0]/20'
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
