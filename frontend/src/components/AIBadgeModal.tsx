import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Award, 
  BarChart2, 
  Target, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Quote, 
  Sparkles,
  Star
} from 'lucide-react';
import { AIBadge, ResearchPaper } from '../types';
import gsap from 'gsap';

interface AIBadgeModalProps {
  badge: AIBadge | null;
  paper: ResearchPaper | null;
  onClose: () => void;
  onDecide?: (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string) => void;
}

export const AIBadgeModal: React.FC<AIBadgeModalProps> = ({
  badge,
  paper,
  onClose,
  onDecide
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.94, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [badge]);

  if (!badge || !paper) return null;

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'rct_gold': return Award;
      case 'high_power': return BarChart2;
      case 'pico_concordance': return Target;
      case 'contradiction': return AlertTriangle;
      case 'safety_signal': return ShieldAlert;
      default: return Sparkles;
    }
  };

  const Icon = getBadgeIcon(badge.type);
  const ratingScore = paper.overallRatingScore ?? paper.deepAnalysis?.statisticalRigorScore ?? 85;
  const ratingStars = paper.overallRatingStars ?? (ratingScore >= 90 ? 5 : ratingScore >= 80 ? 4 : ratingScore >= 65 ? 3 : 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        ref={modalRef}
        className="w-full max-w-xl bg-[#2D2836] border border-[#E6E0F0]/30 rounded-2xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[#E6E0F0]/20 flex items-center justify-between bg-[#442E20]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center text-white shadow-md">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-[#E2DDE7]">{badge.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#383242] text-[#E6E0F0] border border-[#E6E0F0]/25">
                  {badge.category} Category
                </span>
              </div>
              <p className="text-xs text-[#E2DDE7]/80">
                Autonomous Evidence Verification & Quality Audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E2DDE7] hover:text-white hover:bg-[#383242] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Target Paper Info */}
          <div className="bg-[#1E1B24] p-3.5 rounded-xl border border-[#E6E0F0]/20 text-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#E6E0F0] tracking-wider block mb-1">
              Associated Research Study
            </span>
            <div className="font-bold text-[#E2DDE7] line-clamp-2">
              {paper.title}
            </div>
            <div className="text-[11px] text-[#E2DDE7]/70 mt-1 flex items-center space-x-2">
              <span>{paper.authors[0] || 'Unknown'} et al.</span>
              <span>•</span>
              <span>{paper.journal} ({paper.year})</span>
              {paper.doi && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[#E6E0F0]">{paper.doi}</span>
                </>
              )}
            </div>
          </div>

          {/* AI Quality Rating Score & Stars */}
          <div className="p-4 rounded-xl bg-[#383242] border border-amber-400/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Overall AI Rating: {ratingStars} / 5 Stars ({ratingScore} / 100 Rigor Score)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E1B24] text-amber-200 border border-amber-400/30">
                {paper.ratingBadgeLabel || 'Empirical Assessment'}
              </span>
            </div>

            <p className="text-[#E2DDE7] leading-relaxed">
              <strong>Why This Rating Was Assigned:</strong> {paper.ratingRationale || badge.whySnippet}
            </p>
          </div>

          {/* Strict Rationale: Why the AI Gave This Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E2DDE7] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Explicit Badge Rationale</span>
              </span>
              <span className="text-[11px] font-mono text-[#E2DDE7]/80">
                Confidence: <strong className="text-emerald-300">{Math.round(badge.confidence * 100)}%</strong>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1E1B24] border border-[#E6E0F0]/20 text-xs text-[#E2DDE7] leading-relaxed">
              {badge.whySnippet}
            </div>
          </div>

          {/* Text Evidence Snippet */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#E2DDE7] flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-[#E6E0F0]" />
              <span>Verbatim Abstract Text Evidence Quote</span>
            </span>

            <blockquote className="p-4 rounded-xl bg-[#20140D] border-l-4 border-amber-400 border-y border-r border-[#E6E0F0]/15 text-xs text-[#E2DDE7] italic leading-relaxed">
              "{badge.textEvidence}"
            </blockquote>
          </div>

          {/* Deep Quantitative Metrics Extracted from this paper */}
          {paper.deepAnalysis && (
            <div className="space-y-2 pt-2 border-t border-[#E6E0F0]/20">
              <span className="text-xs font-bold text-[#E2DDE7]">
                Extracted Study Parameters
              </span>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#1E1B24] border border-[#E6E0F0]/20">
                  <span className="text-[10px] text-[#E2DDE7]/70 block">Extracted Study Design</span>
                  <span className="font-bold text-[#E2DDE7]">{paper.deepAnalysis.studyDesign}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E1B24] border border-[#E6E0F0]/20">
                  <span className="text-[10px] text-[#E2DDE7]/70 block">Verified Sample Power</span>
                  <span className="font-bold text-[#E2DDE7]">
                    {paper.deepAnalysis.sampleSize ? `N = ${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'Not Specified'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E1B24] border border-[#E6E0F0]/20">
                  <span className="text-[10px] text-[#E2DDE7]/70 block">Primary Effect Metric</span>
                  <span className="font-bold text-[#E6E0F0]">{paper.deepAnalysis.primaryEffectMetric || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E1B24] border border-[#E6E0F0]/20">
                  <span className="text-[10px] text-[#E2DDE7]/70 block">Risk of Bias Level</span>
                  <span className={`font-bold ${
                    paper.deepAnalysis.biasAssessment.riskLevel === 'Low' ? 'text-emerald-300' : 'text-amber-300'
                  }`}>
                    {paper.deepAnalysis.biasAssessment.riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Topics & AI Screening Recommendation */}
          {(paper.extractedTopics || paper.aiScreeningRecommendation) && (
            <div className="space-y-3 pt-3 border-t border-[#E6E0F0]/20">
              {/* Screening Recommendation */}
              {paper.aiScreeningRecommendation && (
                <div className="p-3.5 rounded-xl bg-[#1E1B24] border border-[#E6E0F0]/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#E2DDE7]/70">
                      Autonomous Screening Recommendation:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${
                      paper.aiScreeningRecommendation === 'Included'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : (paper.aiScreeningRecommendation === 'Excluded'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/50')
                    }`}>
                      {paper.aiScreeningRecommendation}
                    </span>
                  </div>
                  <p className="text-[#E2DDE7] text-[11px] leading-relaxed">
                    <strong>Criteria Analysis:</strong> {paper.aiScreeningReason || 'Evaluated against systematic review population, intervention, and design criteria.'}
                  </p>
                </div>
              )}

              {/* Analyzed Subtopics from Full PDF */}
              <div className="space-y-2 pt-2 border-t border-[#E6E0F0]/15">
                <span className="text-xs font-bold text-[#E2DDE7] block">
                  Analyzed Subtopics in this Paper ({paper.extractedSubtopics?.length || paper.extractedTopics?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paper.extractedSubtopics && paper.extractedSubtopics.length > 0 ? (
                    paper.extractedSubtopics.map((sub, idx) => {
                      const badgeStyle = 
                        sub.category === 'Condition'
                          ? 'bg-rose-950/70 text-rose-200 border-rose-500/40'
                          : (sub.category === 'Biomarkers'
                              ? 'bg-cyan-950/70 text-cyan-200 border-cyan-500/40'
                              : (sub.category === 'Population'
                                  ? 'bg-amber-950/70 text-amber-200 border-amber-500/40'
                                  : (sub.category === 'Methodology'
                                      ? 'bg-indigo-950/70 text-indigo-200 border-indigo-500/40'
                                      : 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40')));
                      return (
                        <span 
                          key={idx} 
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center space-x-1 ${badgeStyle}`}
                        >
                          <span className="font-bold opacity-75 font-mono">[{sub.category.toUpperCase()}]</span>
                          <span>{sub.name}</span>
                        </span>
                      );
                    })
                  ) : (
                    paper.extractedTopics && paper.extractedTopics.map((top, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#383242] border border-[#E6E0F0]/25 text-[#E2DDE7]"
                      >
                        #{top}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Multilingual Translation Details */}
              {paper.isTranslated && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 space-y-1">
                  <span className="font-bold flex items-center space-x-1">
                    <span>🌐 Multilingual Scientific Translation Applied</span>
                  </span>
                  <p className="text-[11px] text-purple-300/90 leading-relaxed">
                    Original manuscript written in <strong>{paper.originalLanguage?.toUpperCase() || 'non-English'}</strong>. Translated to academic English with strict preservation of chemical entities, gene symbols, and Latin medical terminology.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer with Screening Decision Action Buttons */}
        <div className="p-4 bg-[#1E1B24] border-t border-[#E6E0F0]/20 flex flex-wrap items-center justify-between gap-3">
          {onDecide && paper ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#E2DDE7] hidden sm:inline">Screening Action:</span>
              <button
                onClick={() => {
                  onDecide(paper.id, 'include', 'Matches review criteria & target subtopics');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md"
              >
                ✓ Include Paper
              </button>
              <button
                onClick={() => {
                  onDecide(paper.id, 'exclude', 'Ineligible Study Design or Endpoints');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md"
              >
                ✕ Exclude Paper
              </button>
              <button
                onClick={() => {
                  onDecide(paper.id, 'maybe', 'Hold for secondary consensus review');
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#383242] hover:bg-[#463E53] text-[#E6E0F0] border border-[#E6E0F0]/30 transition-all cursor-pointer"
              >
                ? Maybe
              </button>
            </div>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E2DDE7] text-[#25212C] hover:bg-white transition-all cursor-pointer shadow-md"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
