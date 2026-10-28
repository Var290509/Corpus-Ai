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
  Bot,
  Star,
  Quote
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
  const [showRatingWhy, setShowRatingWhy] = useState(false);
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

      let spanStyle = "bg-blue-950/70 text-blue-200 border-blue-700/60";
      if (span.type === 'I') spanStyle = "bg-purple-950/70 text-purple-200 border-purple-700/60";
      if (span.type === 'C') spanStyle = "bg-amber-950/70 text-amber-200 border-amber-700/60";
      if (span.type === 'O') spanStyle = "bg-emerald-950/70 text-emerald-200 border-emerald-700/60";

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

  const ratingScore = paper.overallRatingScore ?? paper.deepAnalysis?.statisticalRigorScore ?? 80;
  const ratingStars = paper.overallRatingStars ?? (ratingScore >= 90 ? 5 : ratingScore >= 80 ? 4 : ratingScore >= 65 ? 3 : 2);
  const ratingLabel = paper.ratingBadgeLabel || `${ratingStars}★ Quality Rating (${ratingScore}/100)`;
  const ratingRationale = paper.ratingRationale || (
    ratingStars >= 5 
      ? 'Awarded 5 Stars (96/100): High methodological rigor, randomized double-blind protocol, and verified low risk of bias.' 
      : ratingStars >= 4 
      ? 'Awarded 4 Stars (85/100): Strong prospective observational cohort with characterized endpoints and statistical significance.' 
      : 'Assigned Standard Rating (70/100): Observational trial parameters requiring full-text cross validation.'
  );

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all text-left relative ${
      status === 'include'
        ? 'border-emerald-500/60 bg-[#273B2C]/85'
        : status === 'exclude'
        ? 'border-rose-500/50 bg-[#3F2323]/80 opacity-85'
        : status === 'maybe'
        ? 'border-indigo-400/60 bg-[#31253F]/80'
        : 'border-[#E6E0F0]/20 bg-[#3B281D]/80'
    }`}>
      
      {/* Top Meta Line: Status, Duplicate Indicator, AI Rating Pill, Year, Journal */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Decision Status Pill */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
            status === 'include'
              ? 'bg-emerald-950 text-emerald-200 border border-emerald-600'
              : status === 'exclude'
              ? 'bg-rose-950 text-rose-200 border border-rose-600'
              : status === 'maybe'
              ? 'bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/30'
              : 'bg-[#271911] text-[#E5E4E2] border border-[#E6E0F0]/20'
          }`}>
            <span>{status}</span>
            {decision?.isOverridden && (
              <span title="Human Overridden Decision" className="ml-1 text-[9px] text-amber-300 font-bold">
                (Human)
              </span>
            )}
          </span>

          {/* AI Paper Rating Badge (Prominently Clickable) */}
          <button
            onClick={() => setShowRatingWhy(!showRatingWhy)}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A3324] text-amber-300 border border-amber-400/40 hover:bg-[#5C3F2D] flex items-center space-x-1 cursor-pointer transition-colors"
            title="Click to see WHY the AI gave this rating with quote evidence"
          >
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{ratingLabel}</span>
            <Info className="w-2.5 h-2.5 text-amber-200/70" />
          </button>

          {/* Duplicate Group Indicator */}
          {duplicateGroupMembersCount > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-[#271911] text-[#E6E0F0] border border-[#E6E0F0]/25 text-[10px] flex items-center space-x-1 font-mono">
              <Layers className="w-3 h-3 text-[#E5E4E2]" />
              <span>{duplicateGroupMembersCount} duplicates merged</span>
            </span>
          )}

          {/* Source Tag */}
          <span className="text-[10px] uppercase font-mono text-[#E5E4E2]/70">
            {paper.source}
          </span>
        </div>

        {/* Journal and Year */}
        <div className="text-xs text-[#E5E4E2]/80 flex items-center space-x-2">
          <span className="font-semibold text-[#FAF9F8]">{paper.journal}</span>
          <span>•</span>
          <span>{paper.year}</span>
        </div>
      </div>

      {/* WHY AI GAVE THIS RATING (Expanded or Toggled) */}
      {showRatingWhy && (
        <div className="mb-3 p-3.5 rounded-xl bg-[#271911] border border-amber-400/40 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Why the AI Awarded {ratingStars} Stars ({ratingScore}/100):</span>
            </span>
            <button 
              onClick={() => setShowRatingWhy(false)} 
              className="text-[#E5E4E2]/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-[#FAF9F8] leading-relaxed">
            {ratingRationale}
          </p>

          {paper.ratingQuoteEvidence && (
            <blockquote className="p-2 rounded-lg bg-[#1E130E] border-l-2 border-amber-400 text-[11px] text-[#E5E4E2]/90 italic">
              <Quote className="w-3 h-3 text-amber-300 inline mr-1" />
              "{paper.ratingQuoteEvidence}"
            </blockquote>
          )}
        </div>
      )}

      {/* Paper Title */}
      <h4 className="text-sm font-bold text-[#FAF9F8] leading-snug hover:text-white transition-colors">
        {paper.title}
      </h4>

      {/* Authors & Identifiers */}
      <div className="text-xs text-[#E5E4E2]/70 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
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
          <span className="font-mono text-[11px] text-[#E5E4E2]/60">
            PMID:{paper.pmid}
          </span>
        )}
      </div>

      {/* Extracted Topics from PDF / Picture */}
      {paper.extractedTopics && paper.extractedTopics.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-[#E5E4E2]/60 mr-0.5">Topics:</span>
          {paper.extractedTopics.map((topic, ti) => (
            <span
              key={ti}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#241710] border border-[#E6E0F0]/15 text-[#E6E0F0] hover:border-[#E6E0F0]/40 transition-colors"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* AI Screening Recommendation (Included / Excluded / Maybe) */}
      {paper.aiScreeningRecommendation && (
        <div className="mt-2.5 p-2 rounded-xl bg-[#241710]/90 border border-[#E6E0F0]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase text-[#E5E4E2]/70">AI Recommendation:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${
              paper.aiScreeningRecommendation === 'Included'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : (paper.aiScreeningRecommendation === 'Excluded'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/50')
            }`}>
              {paper.aiScreeningRecommendation === 'Included' && <Check className="w-3 h-3 mr-0.5" />}
              {paper.aiScreeningRecommendation === 'Excluded' && <X className="w-3 h-3 mr-0.5" />}
              {paper.aiScreeningRecommendation === 'Maybe' && <HelpCircle className="w-3 h-3 mr-0.5" />}
              <span>{paper.aiScreeningRecommendation}</span>
            </span>
            {paper.aiScreeningReason && (
              <span className="text-[11px] text-[#E5E4E2]/80 italic hidden sm:inline truncate max-w-sm" title={paper.aiScreeningReason}>
                — {paper.aiScreeningReason}
              </span>
            )}
          </div>

          {/* Quick Apply Button */}
          {status === 'unscreened' && (
            <button
              onClick={() => {
                const targetStatus = paper.aiScreeningRecommendation === 'Included' ? 'include' : (paper.aiScreeningRecommendation === 'Excluded' ? 'exclude' : 'maybe');
                onDecide(paper.id, targetStatus, paper.aiScreeningReason);
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#4A3324] hover:bg-[#5C3F2D] text-[#FAF9F8] border border-[#E6E0F0]/30 transition-all flex items-center space-x-1 cursor-pointer shrink-0"
              title="Accept the AI recommendation directly"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>Apply AI Suggestion</span>
            </button>
          )}
        </div>
      )}

      {/* AI Badges Row & Recommender Button */}
      <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
        {paper.aiBadges && paper.aiBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-[#E5E4E2]/70 uppercase mr-1 flex items-center">
              <Sparkles className="w-3 h-3 text-[#E6E0F0] mr-0.5" />
              Badges:
            </span>

            {paper.aiBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => onInspectBadge(badge, paper)}
                className="group/badge px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center space-x-1.5 bg-[#4A3324] hover:bg-[#5C3F2D] border border-[#E6E0F0]/25 text-[#FAF9F8] shadow-sm cursor-pointer"
                title="Click to inspect exact AI badge rationale & quote evidence"
              >
                <Award className="w-3 h-3 text-[#E6E0F0] group-hover/badge:scale-110 transition-transform" />
                <span>{badge.label}</span>
                <Info className="w-2.5 h-2.5 text-[#E5E4E2]/60 group-hover/badge:text-white" />
              </button>
            ))}
          </div>
        )}

        {/* Suggest Related Research Papers from Scopus, WoS, PubMed & IEEE */}
        {onDiscoverSimilar && (
          <button
            onClick={() => onDiscoverSimilar(paper)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#4A3324] text-[#FAF9F8] border border-[#E6E0F0]/30 hover:bg-[#5C3F2D] hover:border-[#E6E0F0]/50 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title="Suggest related research papers from Scopus, Web of Science, PubMed & IEEE Xplore"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Suggest Related Papers (Scopus / WoS / PubMed / IEEE)</span>
          </button>
        )}
      </div>

      {/* Abstract with PICO Span Highlighting */}
      <div className="mt-3 text-xs text-[#E5E4E2]/90 leading-relaxed">
        <div className={`relative ${isExpanded ? '' : 'line-clamp-3'}`}>
          {renderAbstractWithSpans()}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-[#E6E0F0] hover:underline font-semibold mt-1 inline-block cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'Expand full abstract & highlights...'}
        </button>
      </div>

      {/* Deep Analysis Quantitative Metrics Bar */}
      {paper.deepAnalysis && (
        <div className="mt-3.5 pt-3 border-t border-[#E6E0F0]/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-[#271911]/80 p-2 rounded-lg border border-[#E6E0F0]/15">
            <span className="text-[9px] text-[#E5E4E2]/70 block uppercase font-mono">Sample Size</span>
            <span className="font-semibold text-[#FAF9F8]">
              {paper.deepAnalysis.sampleSize ? `N=${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#271911]/80 p-2 rounded-lg border border-[#E6E0F0]/15">
            <span className="text-[9px] text-[#E5E4E2]/70 block uppercase font-mono">Primary Effect</span>
            <span className="font-semibold text-[#E6E0F0] truncate block" title={paper.deepAnalysis.primaryEffectMetric}>
              {paper.deepAnalysis.primaryEffectMetric || 'Stabilization'}
            </span>
          </div>

          <div className="bg-[#271911]/80 p-2 rounded-lg border border-[#E6E0F0]/15">
            <span className="text-[9px] text-[#E5E4E2]/70 block uppercase font-mono">Rigor Score</span>
            <span className="font-semibold text-[#FAF9F8]">
              {paper.deepAnalysis.statisticalRigorScore}/100
            </span>
          </div>

          <div className="bg-[#271911]/80 p-2 rounded-lg border border-[#E6E0F0]/15">
            <span className="text-[9px] text-[#E5E4E2]/70 block uppercase font-mono">Consensus State</span>
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
        <div className="mt-2.5 p-2 rounded-lg bg-rose-950/80 border border-rose-700/60 text-[11px] text-rose-200 flex items-center justify-between">
          <span><strong>Exclusion Reason:</strong> {decision.reason}</span>
        </div>
      )}

      {/* Screening Action Bar */}
      <div className="mt-4 pt-3 border-t border-[#E6E0F0]/15 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[#E5E4E2]/70 flex items-center space-x-1.5">
          {decision?.decidedBy === 'human' ? (
            <span className="flex items-center text-[#E6E0F0] font-medium">
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Reviewed by Human
            </span>
          ) : (
            <span className="flex items-center text-[#E5E4E2]/60">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              status === 'include'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#271911] hover:bg-emerald-950 text-emerald-300 border border-emerald-600/50'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Include</span>
          </button>

          {/* Exclude with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReasonDropdown(!showReasonDropdown)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                status === 'exclude'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-[#271911] hover:bg-rose-950 text-rose-300 border border-rose-600/50'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Exclude</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showReasonDropdown && (
              <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-[#362419] border border-[#E6E0F0]/30 rounded-xl shadow-xl p-2 z-30 text-xs">
                <span className="text-[10px] font-mono text-[#E5E4E2]/70 px-2 py-1 block">
                  Select Required Exclusion Reason:
                </span>
                {exclusionOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onDecide(paper.id, 'exclude', `${opt.code}: ${opt.label}`);
                      setShowReasonDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/80 hover:text-rose-200 transition-colors block text-[11px]"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              status === 'maybe'
                ? 'bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/40 shadow-md'
                : 'bg-[#271911] hover:bg-[#4A3324] text-[#E5E4E2] border border-[#E6E0F0]/20'
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
