import React from 'react';
import { 
  HelpCircle, 
  Search, 
  DownloadCloud, 
  Database, 
  Layers, 
  CheckCircle2, 
  Tag, 
  FileCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface PICOFlowchartProps {
  currentStepIndex: number;
  onSelectStep: (tabId: string) => void;
}

export const PICOFlowchart: React.FC<PICOFlowchartProps> = ({
  currentStepIndex,
  onSelectStep
}) => {
  const steps = [
    { num: '0', title: '0. Question', sub: 'PICO, criteria', tab: 'overview', icon: HelpCircle },
    { num: '1', title: '1. Query', sub: 'keyphrases, dates', tab: 'search', icon: Search },
    { num: '2', title: '2. Fetch', sub: 'APIs; pick searches', tab: 'search', icon: DownloadCloud },
    { num: '3', title: '3. Database', sub: 'nothing deleted', tab: 'search', icon: Database },
    { num: '4', title: '4. Deduplicate', sub: 'hide; confirm pairs', tab: 'screening', icon: Layers },
    { num: '5', title: '5. Screen', sub: '3-way, with reason', tab: 'screening', icon: CheckCircle2 },
    { num: '6', title: '6. PICO', sub: 'P, I, C, O tags', tab: 'screening', icon: Tag },
    { num: '7', title: '7. Review', sub: 'review, export', tab: 'review_export', icon: FileCheck },
  ];

  return (
    <div className="w-full glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] relative overflow-hidden shadow-glass">
      
      {/* Background soft glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#E6E0F0]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#6F4E37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#462E1E] flex items-center space-x-2">
            <span>Mini-Rayyan Architecture: Steps 0 to 7 + Level 2 Loop</span>
          </h2>
          <p className="text-xs text-[#7E7A72] mt-0.5">
            Full end-to-end systematic literature review pipeline with automated screening and reviewer overrides.
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs text-[#6F4E37] bg-[#E6E0F0]/60 px-3 py-1.5 rounded-xl border border-[#d4c8e4]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span className="font-medium">Level 2 Loop Active (Persistent Decisions)</span>
        </div>
      </div>

      {/* Grid of Step Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.num}
              onClick={() => onSelectStep(step.tab)}
              className={`cursor-pointer rounded-xl p-3 border transition-all text-left group ${
                isCurrent
                  ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/20 scale-102'
                  : 'bg-white/80 hover:bg-white text-[#462E1E] border-[#E5E4E2] hover:border-[#6F4E37]/40 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isCurrent ? 'bg-white/20 text-[#E6E0F0]' : 'bg-[#E6E0F0] text-[#5A3D29]'
                }`}>
                  {step.num}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#E6E0F0]' : 'text-[#8A5F40] group-hover:scale-110 transition-transform'}`} />
              </div>

              <div className="font-semibold text-xs truncate">
                {step.title.split('. ')[1]}
              </div>
              <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-white/80' : 'text-[#7E7A72]'}`}>
                {step.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level 2 Loop Indicator Banner */}
      <div className="mt-4 pt-3 border-t border-[#E6E0F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A3D29]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6F4E37]" />
          <span className="font-mono font-medium">Level 2 Accent Loop:</span>
          <span className="text-[#7E7A72]">
            Query edited &rarr; creates new version &rarr; reruns steps 2 to 6 &rarr; keeps earlier reviewer decisions safe.
          </span>
        </div>
        <button 
          onClick={() => onSelectStep('level2_loop')}
          className="mt-2 sm:mt-0 flex items-center space-x-1 text-xs text-[#6F4E37] hover:underline font-medium"
        >
          <span>Inspect Version Diffs</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
