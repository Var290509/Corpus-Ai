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
  LogOut,
  Cloud,
  Users
} from 'lucide-react';
import { ReviewMember } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeVersionNumber: number;
  totalPapersCount: number;
  includedCount: number;
  projectName?: string;
  members?: ReviewMember[];
  onOpenMembers?: () => void;
  onOpenRecommender?: () => void;
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
  members = [],
  onOpenMembers,
  onOpenRecommender,
  onBackToProjects,
  onLogout,
  onOpenAuditLog
}) => {
  const tabs = [
    { id: 'overview', label: 'Protocol', tooltip: 'Protocol & Systematic Review Setup', icon: Compass },
    { id: 'search', label: 'Search & Upload', tooltip: 'Search & Literature Upload', icon: Search },
    { id: 'recommender', label: 'AI Recommender', tooltip: 'AI Recommender (Scopus, Web of Science, PubMed, IEEE)', icon: Sparkles, isSpecial: true },
    { id: 'screening', label: 'Screening', tooltip: 'Screening & Systematic Review Desk', icon: CheckSquare },
    { id: 'agentic_rag', label: 'RAG Copilot', tooltip: 'Agentic RAG Systematic Review Copilot', icon: Cpu },
    { id: 'level2_loop', label: 'Level 2 Diff', tooltip: 'Level 2 Differential Loop Analysis', icon: GitBranch },
    { id: 'review_export', label: 'PRISMA', tooltip: 'PRISMA 2020 Flow & Synthesis Export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A1225]/95 border-b border-[#F9F8FD]/10 backdrop-blur-md shadow-sm">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Logo, Brand & Projects Back Button */}
          <div className="flex items-center space-x-3 shrink-0">
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="px-2.5 py-1.5 rounded-xl bg-[#192440] hover:bg-[#223154] text-[#F9F8FD] border border-[#F9F8FD]/15 hover:border-[#F9F8FD]/30 transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                title="Return to Reviews Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E0E5E7]" />
                <span className="hidden sm:inline">Reviews</span>
              </button>
            )}

            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#192440] to-[#2B3B60] flex items-center justify-center shadow-sm border border-[#E0E5E7]/25 text-white font-extrabold font-mono text-sm">
                C
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight text-[#F9F8FD] shrink-0">
                  CORPUS <span className="text-[#E0E5E7] font-light">AI</span>
                </span>
                {projectName && (
                  <span 
                    title={`Current Systematic Review Project: ${projectName}`}
                    className="hidden md:inline-flex items-center space-x-1.5 text-xs font-medium text-[#F9F8FD] bg-[#060D1E]/80 border border-[#E0E5E7]/15 px-2.5 py-1 rounded-xl shrink-0 max-w-[180px] truncate shadow-sm"
                  >
                    <span className="text-[10px] text-[#F9F8FD]/60 uppercase font-mono">Review:</span>
                    <strong className="truncate font-semibold text-[#E7DCC1]">{projectName}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Tab Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#060D1E]/90 p-1 rounded-xl border border-[#F9F8FD]/10 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  title={tab.tooltip}
                  onClick={() => {
                    if (tab.id === 'recommender' && onOpenRecommender) {
                      onOpenRecommender();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#F9F8FD] text-[#0A1225] shadow-md'
                      : tab.isSpecial
                      ? 'text-amber-300 hover:text-white hover:bg-[#192440]'
                      : 'text-[#F9F8FD]/75 hover:text-white hover:bg-[#192440]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0A1225]' : tab.isSpecial ? 'text-amber-300' : 'text-[#F9F8FD]/80'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Metrics & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {/* Review Members */}
            {members.length > 0 && (
              <button
                onClick={onOpenMembers}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#192440] hover:bg-[#223154] border border-[#F9F8FD]/15 text-[#F9F8FD] transition-all cursor-pointer text-xs font-medium shadow-sm"
                title="View Review Team Members"
              >
                <Users className="w-3.5 h-3.5 text-[#E0E5E7]" />
                <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
              </button>
            )}

            {/* Cloud Status Pill */}
            <div 
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#060D1E]/90 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium shadow-sm"
              title="Real-time Firestore cloud synchronization active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Sync</span>
            </div>

            {/* Total Papers Count Badge */}
            <div 
              className="flex items-center space-x-2 text-xs bg-[#060D1E]/90 px-3 py-1.5 rounded-xl border border-[#F9F8FD]/10 shadow-sm"
              title="Total papers ingested and included count"
            >
              <span className="text-[#F9F8FD]/60 font-medium">Papers:</span>
              <span className="font-bold text-[#F9F8FD]">{totalPapersCount}</span>
              <span className="text-[#F9F8FD]/30">|</span>
              <span className="text-emerald-300 font-bold">{includedCount} incl</span>
            </div>

            {/* Audit Log Trigger */}
            <button
              onClick={onOpenAuditLog}
              className="p-2 rounded-xl text-[#F9F8FD]/80 hover:text-white hover:bg-[#192440] border border-transparent hover:border-[#F9F8FD]/15 transition-all cursor-pointer shadow-sm"
              title="Audit Run Log & Provenance"
            >
              <Activity className="w-4 h-4 text-[#E0E5E7]" />
            </button>

            {/* Sign Out Button (if onLogout provided) */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-[#F9F8FD]/60 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile/Tablet Horizontal Tab Strip */}
      <div className="lg:hidden flex items-center overflow-x-auto no-scrollbar space-x-1 px-3 py-1.5 border-t border-[#F9F8FD]/10 bg-[#060D1E]/90">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'recommender' && onOpenRecommender) {
                  onOpenRecommender();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#F9F8FD] text-[#0A1225] shadow-sm'
                  : tab.isSpecial
                  ? 'text-amber-300 hover:bg-[#192440]'
                  : 'text-[#F9F8FD]/70 hover:text-white hover:bg-[#192440]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
