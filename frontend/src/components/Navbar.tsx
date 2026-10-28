import React from 'react';
import { 
  Compass, 
  Search, 
  CheckSquare, 
  Cpu, 
  GitBranch, 
  Download, 
  Activity,
  Sparkles,
  ArrowLeft,
  Folder,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeVersionNumber: number;
  totalPapersCount: number;
  includedCount: number;
  projectName?: string;
  onBackToProjects?: () => void;
  onLogout?: () => void;
  onOpenAuditLog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeVersionNumber,
  totalPapersCount,
  includedCount,
  projectName,
  onBackToProjects,
  onLogout,
  onOpenAuditLog
}) => {
  const tabs = [
    { id: 'overview', label: 'Protocol & PICO', icon: Compass },
    { id: 'search', label: 'Search & Upload', icon: Search },
    { id: 'screening', label: 'Screening & Badges', icon: CheckSquare },
    { id: 'agentic_rag', label: 'Agentic RAG Copilot', icon: Cpu, isSpecial: true },
    { id: 'level2_loop', label: 'Level 2 Loop Diff', icon: GitBranch },
    { id: 'review_export', label: 'PRISMA & Export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#E6E0F0] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo, Brand & Projects Back Button */}
          <div className="flex items-center space-x-3">
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-[#5A3D29] border border-[#E6E0F0] transition-all flex items-center space-x-1 text-xs font-semibold mr-1"
                title="Return to Projects Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Projects</span>
              </button>
            )}

            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#8A5F40] flex items-center justify-center shadow-md shadow-[#6F4E37]/20 border border-[#E6E0F0]">
                <span className="text-[#E6E0F0] font-bold text-lg font-mono">C</span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-base tracking-tight text-[#462E1E]">Corpus AI</span>
                  {projectName && (
                    <span className="max-w-[140px] md:max-w-[180px] truncate text-xs font-medium text-[#7E7A72] border-l border-[#d4c8e4] pl-2">
                      {projectName}
                    </span>
                  )}
                </div>
              </div>
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
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

          {/* Quick Metrics, Run Log & Logout */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-white/70 border border-[#E6E0F0] text-xs text-[#5F5C56]">
              <span>Corpus: <strong className="text-[#462E1E]">{totalPapersCount.toLocaleString()}</strong></span>
              <span className="text-[#B8B5AE]">|</span>
              <span>Included: <strong className="text-[#6F4E37]">{includedCount}</strong></span>
            </div>

            <button
              onClick={onOpenAuditLog}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 hover:bg-white text-[#5A3D29] border border-[#E6E0F0] shadow-sm transition-all"
              title="Inspect Audit Run Log"
            >
              <Activity className="w-3.5 h-3.5 text-[#6F4E37]" />
              <span className="hidden sm:inline">Log</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-[#7E7A72] hover:text-rose-600 border border-[#E6E0F0] transition-all"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
