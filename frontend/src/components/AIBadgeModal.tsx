import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Award, 
  BarChart2, 
  Target, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  CheckCircle2, 
  FileText,
  Quote,
  Sparkles
} from 'lucide-react';
import { AIBadge, ResearchPaper } from '../types';
import gsap from 'gsap';

interface AIBadgeModalProps {
  badge: AIBadge | null;
  paper: ResearchPaper | null;
  onClose: () => void;
}

export const AIBadgeModal: React.FC<AIBadgeModalProps> = ({
  badge,
  paper,
  onClose
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        ref={modalRef}
        className="w-full max-w-xl bg-[#1E130B] border border-[#E6E0F0]/25 rounded-2xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[#E6E0F0]/15 flex items-center justify-between bg-[#28180F]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center text-white shadow-md">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-[#FAF9F8]">{badge.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3B2518] text-[#E6E0F0] border border-[#E6E0F0]/20">
                  {badge.category} Category
                </span>
              </div>
              <p className="text-xs text-[#A59E98]">
                Autonomous Evidence Verification & Citation Audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A59E98] hover:text-[#FAF9F8] hover:bg-[#3B2518] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Target Paper Info */}
          <div className="bg-[#150D07] p-3.5 rounded-xl border border-[#E6E0F0]/15 text-xs">
            <span className="text-[10px] uppercase font-mono font-semibold text-[#E6E0F0] tracking-wider block mb-1">
              Associated Research Study
            </span>
            <div className="font-semibold text-[#FAF9F8] line-clamp-2">
              {paper.title}
            </div>
            <div className="text-[11px] text-[#A59E98] mt-1 flex items-center space-x-2">
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

          {/* Strict Rationale: Why the AI Gave This Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FAF9F8] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Explicit AI Attribution Rationale</span>
              </span>
              <span className="text-[11px] font-mono text-[#A59E98]">
                Confidence: <strong className="text-emerald-400">{Math.round(badge.confidence * 100)}%</strong>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#28180F] border border-[#E6E0F0]/15 text-xs text-[#FAF9F8] leading-relaxed">
              {badge.whySnippet}
            </div>
          </div>

          {/* Text Evidence Snippet */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#FAF9F8] flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-[#E6E0F0]" />
              <span>Direct Abstract Text Evidence Quote</span>
            </span>

            <blockquote className="p-4 rounded-xl bg-[#150D07] border-l-4 border-[#E6E0F0] border-y border-r border-[#E6E0F0]/15 text-xs text-[#C5BFB8] italic leading-relaxed">
              "{badge.textEvidence}"
            </blockquote>
          </div>

          {/* Deep Quantitative Metrics Extracted from this paper */}
          {paper.deepAnalysis && (
            <div className="space-y-2 pt-2 border-t border-[#E6E0F0]/15">
              <span className="text-xs font-semibold text-[#FAF9F8]">
                Autonomous Deep Data Extraction
              </span>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#28180F] border border-[#E6E0F0]/15">
                  <span className="text-[10px] text-[#A59E98] block">Extracted Study Design</span>
                  <span className="font-semibold text-[#FAF9F8]">{paper.deepAnalysis.studyDesign}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#28180F] border border-[#E6E0F0]/15">
                  <span className="text-[10px] text-[#A59E98] block">Verified Sample Power</span>
                  <span className="font-semibold text-[#FAF9F8]">
                    {paper.deepAnalysis.sampleSize ? `N = ${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'Not Specified'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#28180F] border border-[#E6E0F0]/15">
                  <span className="text-[10px] text-[#A59E98] block">Primary Effect Metric</span>
                  <span className="font-semibold text-[#E6E0F0]">{paper.deepAnalysis.primaryEffectMetric || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#28180F] border border-[#E6E0F0]/15">
                  <span className="text-[10px] text-[#A59E98] block">Risk of Bias Level</span>
                  <span className={`font-semibold ${
                    paper.deepAnalysis.biasAssessment.riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {paper.deepAnalysis.biasAssessment.riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#150D07] border-t border-[#E6E0F0]/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E5E4E2] text-[#160E08] hover:bg-white transition-all cursor-pointer shadow-md"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
