import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProjectsDashboard } from './components/ProjectsDashboard';
import { Navbar } from './components/Navbar';
import { SearchStudio } from './components/SearchStudio';
import { ScreeningDesk } from './components/ScreeningDesk';
import { AgenticRAGDesk } from './components/AgenticRAGDesk';
import { Level2DiffModal } from './components/Level2DiffModal';
import { PRISMAReviewDesk } from './components/PRISMAReviewDesk';
import { AIBadgeModal } from './components/AIBadgeModal';
import { AuditLogModal } from './components/AuditLogModal';

import { 
  Project, 
  User, 
  ReviewQuestion, 
  QueryVersion, 
  ResearchPaper, 
  ReviewerDecision, 
  AIBadge, 
  AuditRunLog 
} from './types';

import { runDeduplication } from './services/deduplication';
import { batchScreenPapers } from './services/screeningEngine';
import { Level2LoopManager } from './services/level2LoopManager';
import { fetchLiveEuropePMC } from './services/apiClient';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('corpus_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Projects State (Defaults to empty; NO pre-seeded sample example)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('corpus_ai_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Active Project Reference
  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  // Active Workspace State
  const [activeTab, setActiveTab] = useState<string>('search');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [queryVersions, setQueryVersions] = useState<QueryVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>('');
  const [decisions, setDecisions] = useState<Record<string, ReviewerDecision>>({});
  const [auditLogs, setAuditLogs] = useState<AuditRunLog[]>([]);
  const [reviewQuestion, setReviewQuestion] = useState<ReviewQuestion | null>(null);

  // Loading & Modal States
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AIBadge | null>(null);
  const [selectedBadgePaper, setSelectedBadgePaper] = useState<ResearchPaper | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  // Sync workspace state when active project changes
  useEffect(() => {
    if (currentProject) {
      setPapers(currentProject.papers || []);
      setQueryVersions(currentProject.queryVersions || []);
      setActiveVersionId(currentProject.queryVersions?.[0]?.id || 'qv-1');
      setDecisions(currentProject.decisions || {});
      setAuditLogs(currentProject.auditLogs || []);
      setReviewQuestion(currentProject.reviewQuestion);
      setActiveTab(currentProject.papers?.length > 0 ? 'screening' : 'search');
    }
  }, [currentProjectId]);

  // Persist projects to localStorage whenever updated
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem('corpus_ai_projects', JSON.stringify(updatedProjects));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Update current project state in projects list
  const updateActiveProject = (partial: {
    papers?: ResearchPaper[];
    queryVersions?: QueryVersion[];
    decisions?: Record<string, ReviewerDecision>;
    auditLogs?: AuditRunLog[];
    reviewQuestion?: ReviewQuestion;
  }) => {
    if (!currentProjectId) return;

    const updated = projects.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          papers: partial.papers !== undefined ? partial.papers : p.papers,
          queryVersions: partial.queryVersions !== undefined ? partial.queryVersions : p.queryVersions,
          decisions: partial.decisions !== undefined ? partial.decisions : p.decisions,
          auditLogs: partial.auditLogs !== undefined ? partial.auditLogs : p.auditLogs,
          reviewQuestion: partial.reviewQuestion !== undefined ? partial.reviewQuestion : p.reviewQuestion,
          updatedAt: new Date().toLocaleDateString()
        };
      }
      return p;
    });

    saveProjects(updated);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('corpus_ai_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentProjectId(null);
    try {
      localStorage.removeItem('corpus_ai_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    saveProjects(updated);
    setCurrentProjectId(newProject.id);
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  // Handle Uploading / Adding Research Papers
  const handleAddPapers = (newPapers: ResearchPaper[]) => {
    if (!reviewQuestion) return;

    // Merge new papers with existing papers
    const existingMap = new Map<string, ResearchPaper>();
    papers.forEach(p => existingMap.set(p.id, p));

    newPapers.forEach(np => {
      if (!existingMap.has(np.id)) {
        existingMap.set(np.id, np);
      }
    });

    const combined = Array.from(existingMap.values());

    // Step 4: Run Deduplication
    const { updatedPapers } = runDeduplication(combined, decisions);

    // Step 5: Run Batch Screening against project criteria
    const updatedDecisions = batchScreenPapers(updatedPapers, decisions, reviewQuestion.exclusionCriteria);

    const logEntry = Level2LoopManager.createAuditLog(
      activeVersion?.versionNumber || 1,
      '2_Fetch',
      `Ingested ${newPapers.length} Research Papers`,
      'human',
      `Uploaded and analyzed ${newPapers.length} research records. Total project papers: ${updatedPapers.length}.`
    );

    const updatedLogs = [logEntry, ...auditLogs];

    setPapers(updatedPapers);
    setDecisions(updatedDecisions);
    setAuditLogs(updatedLogs);

    updateActiveProject({
      papers: updatedPapers,
      decisions: updatedDecisions,
      auditLogs: updatedLogs
    });
  };

  // Step 5 Human Override
  const handleDecide = (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string, note?: string) => {
    const targetPaper = papers.find(p => p.id === paperId);
    const prevStatus = decisions[paperId]?.status || 'unscreened';

    const newDecisions = {
      ...decisions,
      [paperId]: {
        paperId,
        groupId: targetPaper?.groupId || `grp-${paperId}`,
        status,
        reason: reason || (status === 'include' ? 'Validated PICO criteria verified by human reviewer' : undefined),
        notes: note,
        decidedBy: 'human' as const,
        decidedAt: new Date().toLocaleTimeString(),
        isOverridden: true,
        previousDecision: prevStatus
      }
    };

    const newLog = Level2LoopManager.createAuditLog(
      activeVersion?.versionNumber || 1,
      '5_Screen',
      `Reviewer Override on Paper ${paperId}`,
      'human',
      `Changed status from "${prevStatus}" to "${status}"${reason ? ` (${reason})` : ''}`
    );

    const updatedLogs = [newLog, ...auditLogs];

    setDecisions(newDecisions);
    setAuditLogs(updatedLogs);

    updateActiveProject({
      decisions: newDecisions,
      auditLogs: updatedLogs
    });
  };

  // Batch Auto-Screen
  const handleRunBatchAutoScreen = () => {
    if (!reviewQuestion) return;
    const updated = batchScreenPapers(papers, decisions, reviewQuestion.exclusionCriteria);
    setDecisions(updated);
    updateActiveProject({ decisions: updated });
  };

  // Search and Fetch (Level 2 Loop)
  const handleRunSearchAndFetch = async (
    query: string,
    sources: ('pubmed' | 'europe_pmc')[],
    dateStart?: string,
    dateEnd?: string
  ) => {
    if (!reviewQuestion) return;
    setIsLoading(true);

    try {
      const nextVersionNum = queryVersions.length + 1;
      const newVersionId = `qv-${nextVersionNum}`;

      // Fetch live records from Europe PMC
      const liveResults = await fetchLiveEuropePMC(query, 25, newVersionId);

      const existingMap = new Map<string, ResearchPaper>();
      papers.forEach(p => existingMap.set(p.id, p));

      liveResults.forEach(newP => {
        if (existingMap.has(newP.id)) {
          const existing = existingMap.get(newP.id)!;
          if (!existing.queryVersionIds.includes(newVersionId)) {
            existing.queryVersionIds.push(newVersionId);
          }
        } else {
          newP.queryVersionIds = [newVersionId];
          existingMap.set(newP.id, newP);
        }
      });

      const combinedPapers = Array.from(existingMap.values());
      const { updatedPapers } = runDeduplication(combinedPapers, decisions);
      const updatedDecisions = batchScreenPapers(updatedPapers, decisions, reviewQuestion.exclusionCriteria);

      const newQueryVersion: QueryVersion = {
        id: newVersionId,
        versionNumber: nextVersionNum,
        label: `Query Iteration ${nextVersionNum}`,
        queryString: query,
        keyphrases: query.split(/\s+AND\s+|\s+OR\s+/i),
        booleanLogic: 'CUSTOM',
        dateStart,
        dateEnd,
        sources,
        hitCount: liveResults.length * 45,
        pulledCount: updatedPapers.length,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActive: true
      };

      const updatedVersions = [...queryVersions.map(v => ({ ...v, isActive: false })), newQueryVersion];
      const newLog = Level2LoopManager.createAuditLog(
        nextVersionNum,
        'Level2_Loop',
        `Executed Query Version ${nextVersionNum}`,
        'human',
        `Retrieved live records. Total project papers: ${updatedPapers.length}. Previous human decisions kept.`
      );
      const updatedLogs = [newLog, ...auditLogs];

      setQueryVersions(updatedVersions);
      setActiveVersionId(newVersionId);
      setPapers(updatedPapers);
      setDecisions(updatedDecisions);
      setAuditLogs(updatedLogs);

      updateActiveProject({
        papers: updatedPapers,
        queryVersions: updatedVersions,
        decisions: updatedDecisions,
        auditLogs: updatedLogs
      });

      setActiveTab('screening');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToVersion = (versionNum: number) => {
    const targetVersion = queryVersions.find(v => v.versionNumber === versionNum);
    if (!targetVersion) return;

    const reverted = Level2LoopManager.revertToVersion(papers, targetVersion.id);
    setPapers(reverted);
    setActiveVersionId(targetVersion.id);
    updateActiveProject({ papers: reverted });
  };

  const handleResolveConflict = (groupId: string, chosenStatus: 'include' | 'exclude' | 'maybe') => {
    const groupMembers = papers.filter(p => p.groupId === groupId);
    const updated = { ...decisions };
    groupMembers.forEach(m => {
      updated[m.id] = {
        paperId: m.id,
        groupId,
        status: chosenStatus,
        reason: 'Resolved duplicate group merge conflict by human reviewer',
        decidedBy: 'human',
        decidedAt: new Date().toLocaleTimeString(),
        isOverridden: true
      };
    });
    setDecisions(updated);
    updateActiveProject({ decisions: updated });
  };

  // 1. If not logged in, show Opening / Landing Page with Sign In & Sign Up
  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // 2. If logged in but no project is opened, show Projects Dashboard
  if (!currentProject || !reviewQuestion) {
    return (
      <ProjectsDashboard
        user={currentUser}
        projects={projects}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onLogout={handleLogout}
      />
    );
  }

  const activeVersion = queryVersions.find(v => v.id === activeVersionId) || queryVersions[0] || {
    id: 'qv-1',
    versionNumber: 1,
    label: 'Version 1',
    queryString: '',
    keyphrases: [],
    booleanLogic: 'AND' as const,
    sources: ['pubmed' as const, 'europe_pmc' as const],
    hitCount: 0,
    pulledCount: papers.length,
    createdAt: 'Initial',
    isActive: true
  };

  const includedCount = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'include').length;

  // 3. Render Active Project Workspace
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#F5F4F2] via-[#EBE9E6] to-[#ECE7F4] text-[#2D2521]">
      
      {/* Navigation Bar with Back to Projects & User Info */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVersionNumber={activeVersion.versionNumber}
        totalPapersCount={papers.length}
        includedCount={includedCount}
        projectName={currentProject.name}
        onBackToProjects={() => setCurrentProjectId(null)}
        onLogout={handleLogout}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Tab 0: Protocol & PICO Framework */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0F0] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded bg-[#6F4E37] text-white">
                    Step 0 Protocol
                  </span>
                  <h2 className="text-lg font-bold text-[#462E1E] mt-1">
                    {reviewQuestion.title || 'Systematic Review Protocol'}
                  </h2>
                  <p className="text-xs text-[#7E7A72]">
                    Question: {reviewQuestion.question}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] text-white hover:bg-[#5A3D29] shadow-sm transition-all"
                >
                  Upload & Search Papers &rarr;
                </button>
              </div>

              {/* PICO Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/80 p-4 rounded-xl border border-[#E5E4E2] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6F4E37] font-bold">Population (P)</span>
                  <div className="text-xs font-semibold text-[#462E1E]">{reviewQuestion.population}</div>
                </div>
                <div className="bg-white/80 p-4 rounded-xl border border-[#E5E4E2] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#8169A3] font-bold">Intervention (I)</span>
                  <div className="text-xs font-semibold text-[#462E1E]">{reviewQuestion.intervention}</div>
                </div>
                <div className="bg-white/80 p-4 rounded-xl border border-[#E5E4E2] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#7E7A72] font-bold">Comparator (C)</span>
                  <div className="text-xs font-semibold text-[#462E1E]">{reviewQuestion.comparator}</div>
                </div>
                <div className="bg-white/80 p-4 rounded-xl border border-[#E5E4E2] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#5A3D29] font-bold">Outcome (O)</span>
                  <div className="text-xs font-semibold text-[#462E1E]">{reviewQuestion.outcome}</div>
                </div>
              </div>

              {/* Exclusion Criteria Table */}
              <div className="space-y-3 pt-3 border-t border-[#E6E0F0]">
                <h3 className="text-sm font-semibold text-[#462E1E]">
                  Pre-Specified Exclusion Criteria (Applied in Step 5 Screening)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {reviewQuestion.exclusionCriteria.map((crit) => (
                    <div key={crit.id} className="p-3 rounded-xl bg-white/70 border border-[#E5E4E2] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#6F4E37]">{crit.code}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E6E0F0] text-[#5A3D29]">
                          {crit.detectionType} detection
                        </span>
                      </div>
                      <div className="font-semibold text-[#462E1E]">{crit.text}</div>
                      <p className="text-[11px] text-[#7E7A72]">
                        <strong>Rationale:</strong> {crit.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Search & Upload Studio */}
        {activeTab === 'search' && (
          <SearchStudio
            reviewQuestion={reviewQuestion}
            queryVersions={queryVersions}
            activeVersion={activeVersion}
            onRunSearchAndFetch={handleRunSearchAndFetch}
            onSelectVersion={(vId) => setActiveVersionId(vId)}
            onAddPapers={handleAddPapers}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Screening & Badges */}
        {activeTab === 'screening' && (
          <ScreeningDesk
            papers={papers}
            decisions={decisions}
            onDecide={handleDecide}
            onInspectBadge={(badge, paper) => {
              setSelectedBadge(badge);
              setSelectedBadgePaper(paper);
            }}
            onRunBatchAutoScreen={handleRunBatchAutoScreen}
            activeCriteria={reviewQuestion.exclusionCriteria}
          />
        )}

        {/* Tab 3: Agentic RAG Copilot */}
        {activeTab === 'agentic_rag' && (
          <AgenticRAGDesk papers={papers} />
        )}

        {/* Tab 4: Level 2 Diff & Loop Engine */}
        {activeTab === 'level2_loop' && (
          <Level2DiffModal
            queryVersions={queryVersions}
            allPapers={papers}
            activeDecisions={decisions}
            onRevertToVersion={handleRevertToVersion}
            onResolveConflict={handleResolveConflict}
          />
        )}

        {/* Tab 5: PRISMA & Export */}
        {activeTab === 'review_export' && (
          <PRISMAReviewDesk
            papers={papers}
            decisions={decisions}
            auditLogs={auditLogs}
          />
        )}

      </main>

      {/* AI Badge Explainability Modal */}
      <AIBadgeModal
        badge={selectedBadge}
        paper={selectedBadgePaper}
        onClose={() => {
          setSelectedBadge(null);
          setSelectedBadgePaper(null);
        }}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        logs={auditLogs}
      />

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-[#E6E0F0] py-4 mt-8 text-xs text-[#7E7A72]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#462E1E]">Corpus AI</span>
            <span>•</span>
            <span>Project: {currentProject.name}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Theme: #6F4E37 | #E5E4E2 | #E6E0F0</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
