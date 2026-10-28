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
    <header className="sticky top-0 z-40 w-full bg-[#352318]/90 border-b border-[#E6E0F0]/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo, Brand & Projects Back Button */}
          <div className="flex items-center space-x-3">
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="p-1.5 rounded-xl bg-[#4A3324] hover:bg-[#5C3F2D] text-[#FAF9F8] border border-[#E6E0F0]/25 transition-all flex items-center space-x-1 text-xs font-bold mr-1 cursor-pointer"
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center shadow-md border border-[#E6E0F0]/30 text-white font-bold font-mono">
                C
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm tracking-tight text-[#FAF9F8] shrink-0">
                    CORPUS <span className="text-[#E6E0F0] font-light">AI</span>
                  </span>
                  {projectName && (
                    <span 
                      title={`Current Systematic Review Project: ${projectName}`}
                      className="hidden md:inline-flex items-center space-x-1 text-[11px] font-medium text-[#FAF9F8] bg-[#3B261A] border border-[#E6E0F0]/25 px-2 py-0.5 rounded-lg shrink-0 max-w-[140px] truncate"
                    >
                      <span className="text-[10px] opacity-70">Review:</span>
                      <strong className="truncate">{projectName}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#271911] p-1 rounded-2xl border border-[#E6E0F0]/20">
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#E5E4E2] text-[#2C1E16] shadow-sm'
                      : tab.isSpecial
                      ? 'text-amber-300 hover:text-white hover:bg-[#4A3324]'
                      : 'text-[#E5E4E2]/80 hover:text-white hover:bg-[#4A3324]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2C1E16]' : tab.isSpecial ? 'text-amber-300' : 'text-[#E5E4E2]'}`} />
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
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#4A3324] border border-[#E6E0F0]/25 text-[#FAF9F8] hover:bg-[#5C3F2D] transition-all cursor-pointer"
                title="View Review Team Members"
              >
                <Users className="w-3.5 h-3.5 text-[#E6E0F0]" />
                <span className="text-xs font-medium">{members.length} member{members.length > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Cloud Status Pill */}
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#4A3324] border border-emerald-400/40 text-emerald-200 text-[11px]">
              <Cloud className="w-3 h-3" />
              <span>Firestore Sync</span>
            </div>

            {/* Total Papers Count Badge */}
            <div className="flex items-center space-x-2 text-xs bg-[#271911] px-3 py-1.5 rounded-xl border border-[#E6E0F0]/20">
              <span className="text-[#E5E4E2]/70">Papers:</span>
              <span className="font-bold text-[#FAF9F8]">{totalPapersCount}</span>
              <span className="text-[#E5E4E2]/40">|</span>
              <span className="text-emerald-300 font-bold">{includedCount} incl</span>
            </div>

            {/* Audit Log Trigger */}
            <button
              onClick={onOpenAuditLog}
              className="p-2 rounded-xl text-[#E5E4E2] hover:text-white hover:bg-[#4A3324] transition-colors cursor-pointer"
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
