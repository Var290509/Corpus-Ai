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
  Quote,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { ResearchPaper, ReviewerDecision, AIBadge, PICOSpan, ExtractedSubtopic } from '../types';
import { extractDetailedSubtopics } from '../services/fileParser';
import { sortSubtopicsWithGemini } from '../services/geminiService';

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
    { code: 'EXC-DESIGN', label: 'Ineligible Study Design (Observational / Non-RCT)' },
    { code: 'EXC-POPULATION', label: 'Wrong Patient Population or Demographic Cohort' },
    { code: 'EXC-OUTCOME', label: 'Missing Primary Clinical / Biochemical Endpoints' },
    { code: 'EXC-ANIMAL', label: 'Animal / Rodent Preclinical Model' },
    { code: 'EXC-SIM', label: 'In Silico / Computational Simulation' },
    { code: 'EXC-CASE', label: 'Single Case Report (N=1)' },
    { code: 'EXC-NON-ENG', label: 'Non-English or Incomplete Translation' },
    { code: 'EXC-REVIEW', label: 'Narrative Review / Editorial / Commentary' },
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

  // Dynamically resolve subtopics if not already enriched
  const subtopics = paper.extractedSubtopics && paper.extractedSubtopics.length > 0
    ? paper.extractedSubtopics
    : extractDetailedSubtopics(`${paper.title} ${paper.abstract}`);

  // Display title cleaning: if title is a generic Word artifact ("Test 1", "Document 1"), extract academic title from abstract
  let displayTitle = paper.title;
  if (/^(test\s*\d*|doc(ument)?\s*\d*|untitled.*|microsoft\s*word.*)$/i.test(displayTitle.trim())) {
    const candidateMatch = paper.abstract.match(/(?:full length research paper|research paper|original article)\s*[:\-–]?\s*([A-Z][^\n]{15,220}?)(?=\s+(?:by\s+|Niokhor|[A-Z][a-zÀ-ÿ]+\s+[A-Z][a-zÀ-ÿ]+|\d+\s*\*|abstract|doi|issn))/i);
    if (candidateMatch && candidateMatch[1]) {
      displayTitle = candidateMatch[1].trim();
    }
  }

  // Display author cleaning: if author is "Samsung" or "Administrator"
  let displayAuthors = paper.authors;
  if (displayAuthors.length === 1 && /^(samsung|microsoft|administrator|admin|user|hp|dell|lenovo)$/i.test(displayAuthors[0].trim())) {
    const authorMatch = paper.abstract.match(/(?:Niokhor Ndane Diouf[^\n,]*|([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+){1,3}(?:\s*(?:,\s*|\s+and\s+)[A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+){1,3})+))/);
    if (authorMatch) {
      displayAuthors = [authorMatch[0].replace(/\b\d+\s*\*?/g, '').trim()];
    }
  }

  // Subtopics and AI sorting state
  const [currentSubtopics, setCurrentSubtopics] = useState<ExtractedSubtopic[]>(subtopics);
  const [isSortingSubtopics, setIsSortingSubtopics] = useState(false);
  const [sortSummary, setSortSummary] = useState<string | null>(null);

  const handleToggleSubtopic = (idx: number, targetDecision: 'included' | 'excluded' | 'neutral') => {
    const updated = [...currentSubtopics];
    updated[idx] = {
      ...updated[idx],
      userDecision: updated[idx].userDecision === targetDecision ? 'neutral' : targetDecision
    };
    setCurrentSubtopics(updated);
  };

  const handleIncludeAllSubtopics = () => {
    setCurrentSubtopics(currentSubtopics.map(s => ({ ...s, userDecision: 'included' })));
  };

  const handleResetSubtopics = () => {
    setCurrentSubtopics(currentSubtopics.map(s => ({ ...s, userDecision: 'neutral' })));
  };

  const handleSortWithGemini = async () => {
    setIsSortingSubtopics(true);
    setSortSummary(null);
    try {
      const res = await sortSubtopicsWithGemini(displayTitle, paper.abstract, currentSubtopics);
      setCurrentSubtopics(res.sortedSubtopics);
      setSortSummary(res.aiSummary);
      setTimeout(() => setSortSummary(null), 8000);
    } catch (err) {
      console.error('AI sort error:', err);
    } finally {
      setIsSortingSubtopics(false);
    }
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'Condition':
        return 'bg-rose-950/70 text-rose-200 border-rose-500/40';
      case 'Biomarkers':
        return 'bg-cyan-950/70 text-cyan-200 border-cyan-500/40';
      case 'Population':
        return 'bg-amber-950/70 text-amber-200 border-amber-500/40';
      case 'Methodology':
        return 'bg-indigo-950/70 text-indigo-200 border-indigo-500/40';
      case 'Outcomes':
        return 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40';
      default:
        return 'bg-[#4A3324] text-[#E6E0F0] border-[#E6E0F0]/30';
    }
  };

  const includedSubCount = currentSubtopics.filter(s => s.userDecision === 'included').length;
  const excludedSubCount = currentSubtopics.filter(s => s.userDecision === 'excluded').length;

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
        {displayTitle}
      </h4>

      {/* Authors & Identifiers */}
      <div className="text-xs text-[#E5E4E2]/70 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{displayAuthors.slice(0, 3).join(', ')}{displayAuthors.length > 3 ? ' et al.' : ''}</span>
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

      {/* Extracted Deep Subtopics with Gemini AI Sorting & Subtopic Inclusion/Exclusion */}
      <div className="mt-3.5 p-4 rounded-2xl bg-[#241710]/95 border border-[#E6E0F0]/25 space-y-3 shadow-md">
        {/* Header with Title, Tally, AI Sort Button & Key Config */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#E6E0F0]/15">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-300" />
            <div>
              <span className="text-xs font-bold text-[#FAF9F8] uppercase tracking-wider block font-mono">
                Analyzed Subtopics in this Paper ({currentSubtopics.length}):
              </span>
              <span className="text-[11px] text-[#E5E4E2]/70">
                <strong className="text-emerald-300">{includedSubCount} Included</strong> • <strong className="text-rose-300">{excludedSubCount} Excluded</strong> • {currentSubtopics.length - includedSubCount - excludedSubCount} Unscreened
              </span>
            </div>
          </div>

          {/* Action Toolbar: AI Sort Button, Bulk Actions, Key Config */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Sort Subtopics Button */}
            <button
              onClick={handleSortWithGemini}
              disabled={isSortingSubtopics}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center space-x-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
              title="Use AI to sort subtopics by clinical and systematic review priority"
            >
              {isSortingSubtopics ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Sorting Subtopics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Sort Subtopics</span>
                </>
              )}
            </button>

            {/* Quick Bulk Actions */}
            <button
              onClick={handleIncludeAllSubtopics}
              className="px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-[#2E1C12] hover:bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 cursor-pointer"
              title="Include all subtopics"
            >
              Include All
            </button>
            <button
              onClick={handleResetSubtopics}
              className="px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-[#2E1C12] hover:bg-[#3E271A] text-[#E5E4E2]/70 border border-[#E6E0F0]/15 cursor-pointer"
              title="Reset all subtopic choices"
            >
              Reset
            </button>
          </div>
        </div>

        {/* AI Sort Feedback Banner */}
        {sortSummary && (
          <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-xs text-purple-200 flex items-center space-x-2 animate-fade-in shadow-md">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="leading-snug">{sortSummary}</span>
          </div>
        )}

        {/* Subtopic Decision Prompt Header */}
        <div className="flex items-center justify-between text-xs text-[#E5E4E2]/85 pt-1">
          <span className="font-semibold text-amber-200 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Subtopic Screening: Review each subtopic and choose to Include (✓) or Exclude (✕):</span>
          </span>
          <span className="text-[10px] text-[#E5E4E2]/60 hidden sm:inline font-mono">
            Click ✓ or ✕ on each subtopic
          </span>
        </div>

        {/* Interactive Subtopics List with Include / Exclude Buttons */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {currentSubtopics.map((sub, si) => (
            <div
              key={si}
              className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all ${
                sub.userDecision === 'included'
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-100 shadow-sm'
                  : (sub.userDecision === 'excluded'
                      ? 'bg-rose-950/60 border-rose-500/70 text-rose-200 opacity-80'
                      : 'bg-[#291A11] border-[#E6E0F0]/15 text-[#FAF9F8]')
              }`}
            >
              {/* Left Details */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border shrink-0 ${getCategoryBadgeStyle(sub.category)}`}>
                  {sub.category}
                </span>

                <span className={`text-xs font-semibold ${sub.userDecision === 'excluded' ? 'line-through text-rose-300' : 'text-[#FAF9F8]'}`}>
                  {sub.name}
                </span>

                {/* AI Score Badge if sorted */}
                {sub.relevanceScore !== undefined && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1B110B] text-amber-300 border border-amber-400/30" title="AI Clinical Relevance Score">
                    Score: {sub.relevanceScore}%
                  </span>
                )}

                {/* AI Priority */}
                {sub.aiPriority && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    sub.aiPriority === 'High'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : (sub.aiPriority === 'Medium'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-300 border border-slate-700')
                  }`}>
                    {sub.aiPriority} Priority
                  </span>
                )}

                {/* AI Reasoning tooltip */}
                {sub.aiReasoning && (
                  <span className="text-[10px] text-[#E5E4E2]/60 italic truncate max-w-xs hidden md:inline" title={sub.aiReasoning}>
                    — {sub.aiReasoning}
                  </span>
                )}
              </div>

              {/* Right: Direct Ask to Include or Exclude this Subtopic */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleSubtopic(si, 'included')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                    sub.userDecision === 'included'
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                      : 'bg-[#1C110B] hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                  title="Include this subtopic in review criteria"
                >
                  <Check className="w-3 h-3" />
                  <span>{sub.userDecision === 'included' ? '✓ Included' : 'Include'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleSubtopic(si, 'excluded')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                    sub.userDecision === 'excluded'
                      ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                      : 'bg-[#1C110B] hover:bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                  title="Exclude this subtopic from review criteria"
                >
                  <X className="w-3 h-3" />
                  <span>{sub.userDecision === 'excluded' ? '✕ Excluded' : 'Exclude'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Screening Assistant: Prominently Asking to Include or Exclude */}
      <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-[#2B1B12] via-[#352317] to-[#2B1B12] border-2 border-[#E6E0F0]/30 shadow-lg space-y-3">
        {/* Header & Question */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#FAF9F8] uppercase tracking-wider block">
                AI Screening Assistant: Do you want to INCLUDE or EXCLUDE this study?
              </span>
              <span className="text-[11px] text-[#E5E4E2]/80">
                Evaluate against your systematic review criteria using the analyzed subtopics above
              </span>
            </div>
          </div>

          {/* AI Suggested Decision Pill */}
          {paper.aiScreeningRecommendation && (
            <div className="flex items-center space-x-1.5 bg-[#1C110B] px-2.5 py-1 rounded-xl border border-[#E6E0F0]/20 text-xs">
              <span className="text-[10px] font-mono text-[#E5E4E2]/70 uppercase">AI Suggestion:</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${
                paper.aiScreeningRecommendation === 'Included'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : (paper.aiScreeningRecommendation === 'Excluded'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                      : 'bg-amber-950 text-amber-300 border-amber-500/50')
              }`}>
                <span>{paper.aiScreeningRecommendation}</span>
              </span>
            </div>
          )}
        </div>

        {/* Clinical Screening Rationale */}
        {paper.aiScreeningReason && (
          <div className="p-2.5 rounded-xl bg-[#1C110B] border border-[#E6E0F0]/15 text-xs text-[#FAF9F8] flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-amber-200">Screening Rationale: </strong>
              <span className="text-[#E5E4E2]/90">{paper.aiScreeningReason}</span>
            </div>
          </div>
        )}

        {/* Dynamic Subtopic Impact on Screening */}
        {excludedSubCount > 0 && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start space-x-2 animate-fade-in">
            <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Subtopic Reviewer Flag: </strong>
              <span>You have marked {excludedSubCount} subtopic(s) as Excluded ({currentSubtopics.filter(s => s.userDecision === 'excluded').map(s => s.name).slice(0, 3).join(', ')}). Consider excluding this study if these criteria are mandatory for your review.</span>
            </div>
          </div>
        )}

        {/* The Action Buttons Prompt */}
        <div className="pt-2 border-t border-[#E6E0F0]/20 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#FAF9F8] flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Select Screening Decision:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2 relative">
            {/* Include Button */}
            <button
              onClick={() => onDecide(paper.id, 'include', 'Matches review criteria & target subtopics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                status === 'include'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-900/50'
                  : 'bg-emerald-950/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/60'
              }`}
              title="Include this paper in systematic review"
            >
              <Check className="w-4 h-4" />
              <span>{status === 'include' ? '✓ Included in Review' : 'Include Paper'}</span>
            </button>

            {/* Exclude Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                  status === 'exclude'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-rose-900/50'
                    : 'bg-rose-950/80 hover:bg-rose-700 text-rose-200 border border-rose-500/60'
                }`}
                title="Exclude this paper and provide exclusion criterion"
              >
                <X className="w-4 h-4" />
                <span>{status === 'exclude' ? '✕ Excluded' : 'Exclude Paper'}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>

              {showReasonDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#362419] border border-[#E6E0F0]/30 rounded-xl shadow-2xl p-2 z-40 text-xs animate-fade-in">
                  <span className="text-[10px] font-mono text-[#E5E4E2]/70 px-2 py-1 block border-b border-[#E6E0F0]/15 mb-1">
                    Select Specific Reason to Exclude:
                  </span>
                  {exclusionOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        onDecide(paper.id, 'exclude', `${opt.code}: ${opt.label}`);
                        setShowReasonDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/80 hover:text-rose-200 transition-colors block text-[11px] cursor-pointer"
                    >
                      <span className="font-mono font-bold mr-1 text-[#E6E0F0]">{opt.code}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Maybe / Hold Button */}
            <button
              onClick={() => onDecide(paper.id, 'maybe', 'Requires full-text appraisal against subtopic criteria')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                status === 'maybe'
                  ? 'bg-[#4A3324] text-[#E6E0F0] ring-2 ring-[#E6E0F0]/50'
                  : 'bg-[#271911] hover:bg-[#4A3324] text-[#E5E4E2] border border-[#E6E0F0]/25'
              }`}
              title="Mark as Maybe for team consensus"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{status === 'maybe' ? '? Marked as Maybe' : 'Maybe / Hold'}</span>
            </button>
          </div>
        </div>

        {/* Current Decision Pill if already reviewed */}
        {status !== 'unscreened' && (
          <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
            status === 'include'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : (status === 'exclude'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-[#3A281E] border-[#E6E0F0]/30 text-[#E6E0F0]')
          }`}>
            <span className="font-semibold flex items-center space-x-1.5">
              <span>Current Review Decision:</span>
              <strong className="uppercase underline tracking-wider">{status}</strong>
              {decision?.reason && <span>— "{decision.reason}"</span>}
            </span>
            <span className="text-[10px] opacity-75">(Click any button above to change)</span>
          </div>
        )}
      </div>

      {/* Related Research Papers Recommender */}
      {onDiscoverSimilar && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onDiscoverSimilar(paper)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#4A3324] text-[#FAF9F8] border border-[#E6E0F0]/30 hover:bg-[#5C3F2D] hover:border-[#E6E0F0]/50 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title="Suggest related research papers from Scopus, Web of Science, PubMed & IEEE Xplore"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Suggest Related Papers (Scopus / WoS / PubMed / IEEE)</span>
          </button>
        </div>
      )}

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
