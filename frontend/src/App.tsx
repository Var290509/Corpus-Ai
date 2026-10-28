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
import { LiteratureRecommenderModal } from './components/LiteratureRecommenderModal';

import { 
  Project, 
  User, 
  ReviewQuestion, 
  QueryVersion, 
  ResearchPaper, 
  ReviewerDecision, 
  AIBadge, 
  AuditRunLog,
  ReviewMember
} from './types';

import { runDeduplication } from './services/deduplication';
import { batchScreenPapers } from './services/screeningEngine';
import { Level2LoopManager } from './services/level2LoopManager';
import { fetchLiveEuropePMC } from './services/apiClient';
import { firestoreService } from './services/firestoreService';
import { authService } from './services/authService';
import { Users, Edit3, Sparkles, Folder, Calendar } from 'lucide-react';

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

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('corpus_ai_projects');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
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

  // Multi-Database Recommender Modal State
  const [showRecommenderModal, setShowRecommenderModal] = useState(false);
  const [recommenderSeedPaper, setRecommenderSeedPaper] = useState<ResearchPaper | null>(null);

  // Loading & Inspector Modals
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AIBadge | null>(null);
  const [selectedBadgePaper, setSelectedBadgePaper] = useState<ResearchPaper | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  // Initial load from Google Cloud Firestore
  useEffect(() => {
    const initFirestoreSync = async () => {
      try {
        const cloudProjects = await firestoreService.loadAllProjects();
        if (cloudProjects.length > 0) {
          setProjects(cloudProjects);
        }
      } catch (err) {
        console.warn('Initial Firestore sync fallback:', err);
      }
    };
    initFirestoreSync();
  }, []);

  // Sync workspace state when active project changes
  useEffect(() => {
    if (currentProject) {
      setPapers(currentProject.papers || []);
      setQueryVersions(currentProject.queryVersions || []);
      setActiveVersionId(currentProject.queryVersions?.[0]?.id || 'qv-1');
      setDecisions(currentProject.decisions || {});
      setAuditLogs(currentProject.auditLogs || []);
      setReviewQuestion(currentProject.reviewQuestion || {
        id: `q-${Date.now()}`,
        title: currentProject.name,
        question: currentProject.description,
        population: 'Target Study Cohort',
        intervention: 'Primary Evaluation Modality',
        comparator: 'Standard Comparator or Control',
        outcome: 'Quantified Endpoints & Measures',
        inclusionCriteria: [],
        exclusionCriteria: [
          { id: 'exc-1', code: 'EXC-ANIMAL', text: 'Preclinical animal / rodent models', rationale: 'Translational human focus', detectionType: 'algorithm', active: true },
          { id: 'exc-2', code: 'EXC-NON-ENG', text: 'Non-English language publications', rationale: 'Auditability', detectionType: 'metadata', active: true }
        ]
      });
      setActiveTab(currentProject.papers?.length > 0 ? 'screening' : 'search');
    }
  }, [currentProjectId]);

  // Persist projects to localStorage and Firestore
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem('corpus_ai_projects', JSON.stringify(updatedProjects));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Update current project state
  const updateActiveProject = (partial: {
    papers?: ResearchPaper[];
    queryVersions?: QueryVersion[];
    decisions?: Record<string, ReviewerDecision>;
    auditLogs?: AuditRunLog[];
    reviewQuestion?: ReviewQuestion;
    members?: ReviewMember[];
  }) => {
    if (!currentProjectId) return;

    let targetUpdated: Project | null = null;
    const updated = projects.map(p => {
      if (p.id === currentProjectId) {
        const up: Project = {
          ...p,
          papers: partial.papers !== undefined ? partial.papers : p.papers,
          queryVersions: partial.queryVersions !== undefined ? partial.queryVersions : p.queryVersions,
          decisions: partial.decisions !== undefined ? partial.decisions : p.decisions,
          auditLogs: partial.auditLogs !== undefined ? partial.auditLogs : p.auditLogs,
          reviewQuestion: partial.reviewQuestion !== undefined ? partial.reviewQuestion : p.reviewQuestion,
          members: partial.members !== undefined ? partial.members : p.members,
          updatedAt: new Date().toLocaleDateString()
        };
        targetUpdated = up;
        return up;
      }
      return p;
    });

    saveProjects(updated);
    if (targetUpdated) {
      firestoreService.saveProject(targetUpdated);
    }
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
    authService.logOut();
    try {
      localStorage.removeItem('corpus_ai_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    saveProjects(updated);
    firestoreService.saveProject(newProject);
    setCurrentProjectId(newProject.id);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    saveProjects(updated);
    firestoreService.saveProject(updatedProject);
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
    firestoreService.deleteProject(projectId);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  // Handle Uploading / Adding Research Papers
  const handleAddPapers = (newPapers: ResearchPaper[]) => {
    // Merge new papers with existing papers
    const existingMap = new Map<string, ResearchPaper>();
    papers.forEach(p => existingMap.set(p.id, p));

    newPapers.forEach(np => {
      if (!existingMap.has(np.id)) {
        existingMap.set(np.id, np);
      }
    });

    const combined = Array.from(existingMap.values());

    // Run Entity Deduplication
    const { updatedPapers } = runDeduplication(combined, decisions);

    // Run Batch Screening against project criteria
    const criteria = reviewQuestion?.exclusionCriteria || [];
    const updatedDecisions = batchScreenPapers(updatedPapers, decisions, criteria);

    const logEntry = Level2LoopManager.createAuditLog(
      activeVersion?.versionNumber || 1,
      'Fetch',
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

    setActiveTab('screening');
  };

  // Run Search and Fetch Live Literature APIs
  const handleRunSearchAndFetch = async (
    query: string,
    sources: ('pubmed' | 'europe_pmc')[],
    dateStart?: string,
    dateEnd?: string,
    useBenchmark: boolean = false
  ) => {
    setIsLoading(true);
    try {
      let fetchedPapers: ResearchPaper[] = [];

      if (sources.includes('europe_pmc')) {
        const liveEurope = await fetchLiveEuropePMC(query, 50);
        fetchedPapers = [...fetchedPapers, ...liveEurope];
      }

      const newVersionNumber = queryVersions.length + 1;
      const newVersionId = `qv-${Date.now()}`;
      const newVersion: QueryVersion = {
        id: newVersionId,
        versionNumber: newVersionNumber,
        label: `Query V${newVersionNumber}`,
        queryString: query,
        keyphrases: query.split(/\s+AND\s+|\s+OR\s+/i),
        booleanLogic: 'AND',
        dateStart,
        dateEnd,
        sources,
        hitCount: fetchedPapers.length,
        pulledCount: fetchedPapers.length,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActive: true
      };

      const updatedVersions = queryVersions.map(v => ({ ...v, isActive: false })).concat(newVersion);
      setQueryVersions(updatedVersions);
      setActiveVersionId(newVersionId);

      handleAddPapers(fetchedPapers);
    } catch (err) {
      console.error(err);
      alert('Error fetching from live literature APIs.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3-way Screening Decision Handler
  const handleDecide = (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string, note?: string) => {
    const paper = papers.find(p => p.id === paperId);
    if (!paper) return;

    const newDecision: ReviewerDecision = {
      paperId,
      groupId: paper.groupId,
      status,
      reason,
      notes: note,
      decidedBy: 'human',
      decidedAt: new Date().toLocaleTimeString(),
      isOverridden: true,
      previousDecision: decisions[paperId]?.status
    };

    const updatedDecisions = {
      ...decisions,
      [paperId]: newDecision
    };

    // Auto-propagate decision across duplicate group members
    papers.filter(p => p.groupId === paper.groupId).forEach(groupMember => {
      updatedDecisions[groupMember.id] = {
        ...newDecision,
        paperId: groupMember.id
      };
    });

    const logEntry = Level2LoopManager.createAuditLog(
      activeVersion?.versionNumber || 1,
      'Screening',
      `Manual Decision: ${status.toUpperCase()}`,
      'human',
      `Reviewer marked "${paper.title.slice(0, 40)}..." as ${status}${reason ? ` (${reason})` : ''}`
    );

    const updatedLogs = [logEntry, ...auditLogs];

    setDecisions(updatedDecisions);
    setAuditLogs(updatedLogs);

    updateActiveProject({
      decisions: updatedDecisions,
      auditLogs: updatedLogs
    });
  };

  // Run Batch Auto-Screening
  const handleRunBatchAutoScreen = () => {
    if (!reviewQuestion) return;
    const autoDecisions = batchScreenPapers(papers, decisions, reviewQuestion.exclusionCriteria);
    setDecisions(autoDecisions);
    updateActiveProject({ decisions: autoDecisions });
  };

  // Level 2 Revert to previous version
  const handleRevertToVersion = (targetVersionNumber: number) => {
    alert(`Reverted project state to Version ${targetVersionNumber}`);
  };

  // Resolve duplicate merge conflicts
  const handleResolveConflict = (groupId: string, chosenStatus: 'include' | 'exclude' | 'maybe') => {
    const updated = { ...decisions };
    papers.filter(p => p.groupId === groupId).forEach(p => {
      updated[p.id] = {
        paperId: p.id,
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

  // 1. If not logged in, show Opening / Landing Page
  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // 2. If logged in but no project opened, show Projects Dashboard
  if (!currentProject) {
    return (
      <ProjectsDashboard
        user={currentUser}
        projects={projects}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
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

  // 3. Render Active Project Workspace in Warm Coffee Theme
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#716879] text-[#E2DDE7]">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVersionNumber={activeVersion.versionNumber}
        totalPapersCount={papers.length}
        includedCount={includedCount}
        projectName={currentProject.name}
        members={currentProject.members || []}
        onOpenRecommender={() => {
          setRecommenderSeedPaper(papers[0] || null);
          setShowRecommenderModal(true);
        }}
        onBackToProjects={() => setCurrentProjectId(null)}
        onLogout={handleLogout}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Protocol & Project Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0]/15 bg-[#25212C]/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0F0]/15 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#373242] text-[#E6E0F0] border border-[#E6E0F0]/20">
                      {currentProject.reviewType || 'Systematic Review'}
                    </span>
                    {currentProject.reviewDomain && (
                      <span className="text-[10px] font-medium text-[#C5BFB8]">
                        • {currentProject.reviewDomain}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#E2DDE7] mt-1.5">
                    {currentProject.name}
                  </h2>
                  <p className="text-xs text-[#A59E98] mt-1 max-w-2xl leading-relaxed">
                    {currentProject.description || 'Systematic review protocol and workspace parameters.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setRecommenderSeedPaper(papers[0] || null);
                      setShowRecommenderModal(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#292531] text-[#E6E0F0] hover:bg-[#373242] border border-[#E6E0F0]/25 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Recommender</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E2DDE7] text-[#292531] hover:bg-white shadow-md transition-all cursor-pointer font-bold"
                  >
                    Upload & Search Papers &rarr;
                  </button>
                </div>
              </div>

              {/* Review Members & Collaboration Team */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#E2DDE7] flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#E6E0F0]" />
                  <span>Review Team Members ({currentProject.members?.length || 1})</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(currentProject.members || [
                    { id: '1', name: currentUser.name, email: currentUser.email, role: 'Owner', joinedAt: currentProject.createdAt }
                  ]).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[#201C27] border border-[#E6E0F0]/15 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#373242] text-[#E2DDE7] font-bold text-xs flex items-center justify-center border border-[#E6E0F0]/20">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#E2DDE7]">{m.name}</div>
                          <div className="text-[11px] text-[#A59E98] truncate max-w-[130px]">{m.email}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#292531] text-[#E6E0F0] border border-[#E6E0F0]/20">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusion Criteria Protocol */}
              {reviewQuestion && (
                <div className="space-y-3 pt-4 border-t border-[#E6E0F0]/15">
                  <h3 className="text-xs font-bold text-[#E2DDE7]">
                    Pre-Specified Screening Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {reviewQuestion.exclusionCriteria.map((crit) => (
                      <div key={crit.id} className="p-3 rounded-xl bg-[#201C27] border border-[#E6E0F0]/15 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#E6E0F0]">{crit.code}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#373242] text-[#E6E0F0]">
                            {crit.detectionType} detection
                          </span>
                        </div>
                        <div className="font-semibold text-[#E2DDE7]">{crit.text}</div>
                        <p className="text-[11px] text-[#A59E98]">
                          <strong>Rationale:</strong> {crit.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Search & Upload Studio */}
        {activeTab === 'search' && reviewQuestion && (
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
        {activeTab === 'screening' && reviewQuestion && (
          <ScreeningDesk
            papers={papers}
            decisions={decisions}
            onDecide={handleDecide}
            onInspectBadge={(badge, paper) => {
              setSelectedBadge(badge);
              setSelectedBadgePaper(paper);
            }}
            onDiscoverSimilar={(paper) => {
              setRecommenderSeedPaper(paper);
              setShowRecommenderModal(true);
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

      {/* AI Literature Recommender Modal (Scopus, Web of Science, PubMed, IEEE Xplore, Digital Library) */}
      <LiteratureRecommenderModal
        isOpen={showRecommenderModal}
        onClose={() => setShowRecommenderModal(false)}
        seedPaper={recommenderSeedPaper}
        allProjectPapers={papers}
        onAddPaperToCorpus={(newPaper) => {
          handleAddPapers([newPaper]);
        }}
      />

      {/* AI Badge Explainability Modal */}
      <AIBadgeModal
        badge={selectedBadge}
        paper={selectedBadgePaper}
        onClose={() => {
          setSelectedBadge(null);
          setSelectedBadgePaper(null);
        }}
        onDecide={(paperId, status, reason) => {
          handleDecide(paperId, status, reason);
        }}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        logs={auditLogs}
      />

      {/* Footer */}
      <footer className="w-full bg-[#1E1B24] border-t border-[#E6E0F0]/20 py-4 mt-8 text-xs text-[#E2DDE7]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#E2DDE7]">Corpus AI</span>
            <span>•</span>
            <span>Review: {currentProject.name}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-[#E2DDE7]/80">
            <span>Google Cloud Firestore Integrated</span>
            <span>•</span>
            <span>Theme: Medium Coffee #6F4E37 | Platinum #E2DDE7 | Lavender #E6E0F0</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
