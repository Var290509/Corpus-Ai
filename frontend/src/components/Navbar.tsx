import React from 'react';
import { 
  Compass, 
  Search, 
  CheckSquare, 
  Cpu, 
  GitBranch, 
  Download, 
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeVersionNumber: number;
  totalPapersCount: number;
  includedCount: number;
  onOpenAuditLog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeVersionNumber,
  totalPapersCount,
  includedCount,
  onOpenAuditLog
}) => {
  const tabs = [
    { id: 'overview', label: 'Pipeline & PICO', icon: Compass },
    { id: 'search', label: 'Search & Query V' + activeVersionNumber, icon: Search },
    { id: 'screening', label: 'Screening & Badges', icon: CheckSquare },
    { id: 'agentic_rag', label: 'Agentic RAG Copilot', icon: Cpu, isSpecial: true },
    { id: 'level2_loop', label: 'Level 2 Loop Diff', icon: GitBranch },
    { id: 'review_export', label: 'PRISMA & Export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#E6E0F0] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#8A5F40] flex items-center justify-center shadow-md shadow-[#6F4E37]/20 border border-[#E6E0F0]">
              <span className="text-[#E6E0F0] font-bold text-xl font-mono">C</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-[#462E1E]">Corpus AI</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E6E0F0] text-[#5A3D29] border border-[#d4c8e4]">
                  v2.4 Agentic
                </span>
              </div>
              <p className="text-[11px] text-[#7E7A72] tracking-wide -mt-0.5">
                Autonomous Systematic Literature Review
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#E5E4E2]/40 p-1 rounded-2xl border border-[#E6E0F0]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#6F4E37] text-white shadow-sm shadow-[#6F4E37]/30'
                      : 'text-[#5F5C56] hover:text-[#462E1E] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6E0F0]' : 'text-[#7E7A72]'}`} />
                  <span>{tab.label}</span>
                  {tab.isSpecial && (
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Metrics & Audit Log Trigger */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-white/70 border border-[#E6E0F0] text-xs text-[#5F5C56]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Corpus: <strong className="text-[#462E1E]">{totalPapersCount.toLocaleString()}</strong> papers</span>
              <span className="text-[#B8B5AE]">|</span>
              <span>Included: <strong className="text-[#6F4E37]">{includedCount}</strong></span>
            </div>

            <button
              onClick={onOpenAuditLog}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 hover:bg-white text-[#5A3D29] border border-[#E6E0F0] shadow-sm transition-all"
              title="Inspect Audit Run Log"
            >
              <Activity className="w-3.5 h-3.5 text-[#6F4E37]" />
              <span className="hidden sm:inline">Run Log</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
