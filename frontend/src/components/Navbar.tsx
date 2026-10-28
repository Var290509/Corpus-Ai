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
    { id: 'overview', label: 'Protocol', icon: Compass },
    { id: 'search', label: 'Search & Upload', icon: Search },
    { id: 'recommender', label: 'AI Recommender (Scopus/WoS/IEEE)', icon: Sparkles, isSpecial: true },
    { id: 'screening', label: 'Screening & Badges', icon: CheckSquare },
    { id: 'agentic_rag', label: 'Agentic RAG Copilot', icon: Cpu },
    { id: 'level2_loop', label: 'Level 2 Diff', icon: GitBranch },
    { id: 'review_export', label: 'PRISMA Synthesis', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#180E08]/85 border-b border-[#E6E0F0]/15 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo, Brand & Projects Back Button */}
          <div className="flex items-center space-x-3">
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="p-1.5 rounded-xl bg-[#2B1B12] hover:bg-[#3B2518] text-[#E5E4E2] border border-[#E6E0F0]/20 transition-all flex items-center space-x-1 text-xs font-semibold mr-1 cursor-pointer"
                title="Return to Reviews Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reviews</span>
              </button>
            )}

            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center shadow-md border border-[#E6E0F0]/25 text-white font-bold font-mono">
                C
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm tracking-tight text-[#FAF9F8]">
                    CORPUS <span className="text-[#E6E0F0] font-light">AI</span>
                  </span>
                  {projectName && (
                    <span className="max-w-[130px] md:max-w-[170px] truncate text-xs font-medium text-[#C5BFB8] border-l border-[#E6E0F0]/20 pl-2">
                      {projectName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#120A05] p-1 rounded-2xl border border-[#E6E0F0]/15">
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#E5E4E2] text-[#160E08] font-semibold shadow-sm'
                      : tab.isSpecial
                      ? 'text-[#E6E0F0] hover:text-white hover:bg-[#2B1B12]'
                      : 'text-[#B8B3AC] hover:text-[#FAF9F8] hover:bg-[#2B1B12]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#160E08]' : tab.isSpecial ? 'text-amber-300' : 'text-[#C5BFB8]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Metrics & Actions */}
          <div className="flex items-center space-x-3">
            {/* Review Members Avatar Cluster */}
            {members.length > 0 && (
              <button
                onClick={onOpenMembers}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#24160E] border border-[#E6E0F0]/20 text-[#E5E4E2] hover:bg-[#341F14] transition-all cursor-pointer"
                title="View Review Team Members"
              >
                <Users className="w-3.5 h-3.5 text-[#E6E0F0]" />
                <span className="text-xs font-medium">{members.length} member{members.length > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Cloud Status Pill */}
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#1F140D] border border-emerald-500/30 text-emerald-300 text-[11px]">
              <Cloud className="w-3 h-3" />
              <span>Firestore Sync</span>
            </div>

            {/* Total Papers Count Badge */}
            <div className="flex items-center space-x-2 text-xs bg-[#24160E] px-3 py-1.5 rounded-xl border border-[#E6E0F0]/15">
              <span className="text-[#A59E98]">Papers:</span>
              <span className="font-bold text-[#FAF9F8]">{totalPapersCount}</span>
              <span className="text-[#8E8680]">|</span>
              <span className="text-emerald-400 font-semibold">{includedCount} incl</span>
            </div>

            {/* Audit Log Trigger */}
            <button
              onClick={onOpenAuditLog}
              className="p-2 rounded-xl text-[#B8B3AC] hover:text-[#FAF9F8] hover:bg-[#2B1B12] transition-colors"
              title="Audit Run Log"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
