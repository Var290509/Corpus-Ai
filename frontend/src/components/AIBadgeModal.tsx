import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl glass-panel-elevated rounded-2xl border border-[#E6E0F0] shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[#E6E0F0] flex items-center justify-between bg-gradient-to-r from-white/90 to-[#FAF9FD]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#6F4E37] flex items-center justify-center text-[#E6E0F0] shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-base text-[#462E1E]">{badge.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E6E0F0] text-[#5A3D29] border border-[#d4c8e4]">
                  {badge.category} Category
                </span>
              </div>
              <p className="text-xs text-[#7E7A72]">
                Autonomous Evidence Verification & Citation Audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E7A72] hover:text-[#462E1E] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Target Paper Info */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#E5E4E2] text-xs">
            <span className="text-[10px] uppercase font-mono font-semibold text-[#6F4E37] tracking-wider block mb-1">
              Associated Research Study
            </span>
            <div className="font-medium text-[#462E1E] line-clamp-2">
              {paper.title}
            </div>
            <div className="text-[11px] text-[#7E7A72] mt-1 flex items-center space-x-2">
              <span>{paper.authors[0] || 'Unknown'} et al.</span>
              <span>•</span>
              <span>{paper.journal} ({paper.year})</span>
              {paper.doi && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[#6F4E37]">{paper.doi}</span>
                </>
              )}
            </div>
          </div>

          {/* Strict Rationale: Why the AI Gave This Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#462E1E] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Explicit AI Attribution Rationale</span>
              </span>
              <span className="text-[11px] font-mono text-[#7E7A72]">
                Confidence: <strong>{Math.round(badge.confidence * 100)}%</strong>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FD] border border-[#E6E0F0] text-xs text-[#462E1E] leading-relaxed">
              {badge.whySnippet}
            </div>
          </div>

          {/* Text Evidence Snippet */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#462E1E] flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-[#6F4E37]" />
              <span>Direct Abstract Text Evidence Quote</span>
            </span>

            <blockquote className="p-4 rounded-xl bg-white/90 border-l-4 border-[#6F4E37] border-y border-r border-[#E5E4E2] text-xs text-[#5A3D29] italic leading-relaxed">
              "{badge.textEvidence}"
            </blockquote>
          </div>

          {/* Deep Quantitative Metrics Extracted from this paper */}
          {paper.deepAnalysis && (
            <div className="space-y-2 pt-2 border-t border-[#E6E0F0]">
              <span className="text-xs font-semibold text-[#462E1E]">
                Autonomous Deep Data Extraction
              </span>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FAF9FD] border border-[#E6E0F0]">
                  <span className="text-[10px] text-[#7E7A72] block">Extracted Study Design</span>
                  <span className="font-medium text-[#462E1E]">{paper.deepAnalysis.studyDesign}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF9FD] border border-[#E6E0F0]">
                  <span className="text-[10px] text-[#7E7A72] block">Verified Sample Power</span>
                  <span className="font-medium text-[#462E1E]">
                    {paper.deepAnalysis.sampleSize ? `N = ${paper.deepAnalysis.sampleSize.toLocaleString()}` : 'Not Specified'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF9FD] border border-[#E6E0F0]">
                  <span className="text-[10px] text-[#7E7A72] block">Primary Effect Metric</span>
                  <span className="font-medium text-[#6F4E37]">{paper.deepAnalysis.primaryEffectMetric || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF9FD] border border-[#E6E0F0]">
                  <span className="text-[10px] text-[#7E7A72] block">Risk of Bias Level</span>
                  <span className={`font-medium ${
                    paper.deepAnalysis.biasAssessment.riskLevel === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {paper.deepAnalysis.biasAssessment.riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white/70 border-t border-[#E6E0F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#6F4E37] text-white hover:bg-[#5A3D29] shadow-sm transition-all"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
