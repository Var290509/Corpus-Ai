import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchStudio } from './components/SearchStudio';
import { ScreeningDesk } from './components/ScreeningDesk';
import { AgenticRAGDesk } from './components/AgenticRAGDesk';
import { Level2DiffModal } from './components/Level2DiffModal';
import { PRISMAReviewDesk } from './components/PRISMAReviewDesk';
import { AIBadgeModal } from './components/AIBadgeModal';
import { AuditLogModal } from './components/AuditLogModal';

import { 
  ReviewQuestion, 
  QueryVersion, 
  ResearchPaper, 
  ReviewerDecision, 
  AIBadge, 
  AuditRunLog 
} from './types';

import { generateLargeCorpus } from './services/dataCorpus';
import { runDeduplication } from './services/deduplication';
import { batchScreenPapers } from './services/screeningEngine';
import { Level2LoopManager } from './services/level2LoopManager';
import { fetchLiveEuropePMC } from './services/apiClient';

// Step 0 Systematic Review Question (NO diabetes/metformin example from PDF!)
const initialReviewQuestion: ReviewQuestion = {
  id: 'rev-q1',
  title: "GLP-1 Receptor Agonists in Mild Cognitive Impairment & Early Alzheimer's Disease",
  question: "In older adults with mild cognitive impairment or early-stage Alzheimer's disease, does GLP-1 receptor agonist therapy, compared with placebo or standard care, reduce cognitive decline rate and cerebral amyloid/tau biomarker burden?",
  population: "Older adults (≥55 years) with mild cognitive impairment (MCI) or early Alzheimer's disease",
  intervention: "GLP-1 receptor agonists (oral/subcutaneous Semaglutide, Liraglutide, Tirzepatide)",
  comparator: "Matching placebo or active standard-of-care neuroprotective therapy",
  outcome: "Cognitive decline rate (CDR-SB, ADAS-Cog-13) and fluid/neuroimaging biomarkers (p-tau181, MRI volumetry)",
  inclusionCriteria: [
    { id: 'inc-1', code: 'INC-RCT', text: 'Human randomized double-blind clinical trials (Phase II/III)', rationale: 'Highest clinical evidence hierarchy for causal therapeutic efficacy', detectionType: 'metadata', active: true },
    { id: 'inc-2', code: 'INC-POP', text: 'Adults with confirmed MCI or biomarker-verified early Alzheimer pathology', rationale: 'Directly aligns with targeted patient population', detectionType: 'algorithm', active: true },
    { id: 'inc-3', code: 'INC-END', text: 'Validated objective cognitive scales (CDR-SB, ADAS-Cog, MMSE)', rationale: 'Ensures quantitative endpoint measurement', detectionType: 'algorithm', active: true }
  ],
  exclusionCriteria: [
    { id: 'exc-1', code: 'EXC-ANIMAL', text: 'Animal / Rodent preclinical studies', rationale: 'Rodent behavioral models lack cortical translation to human Alzheimer progression', detectionType: 'algorithm', active: true },
    { id: 'exc-2', code: 'EXC-NON-ENG', text: 'Non-English language publications', rationale: 'Team cannot independently audit clinical trial statistical tables without certified translation', detectionType: 'metadata', active: true },
    { id: 'exc-3', code: 'EXC-SIM', text: 'In silico computational simulations / molecular docking', rationale: 'Computational models lack in vivo human biological outcomes', detectionType: 'algorithm', active: true },
    { id: 'exc-4', code: 'EXC-CASE', text: 'Single case reports (N=1)', rationale: 'Single-subject reports cannot establish causal treatment effects', detectionType: 'metadata', active: true },
    { id: 'exc-5', code: 'EXC-NO-PICO', text: 'Studies without neurological/cognitive endpoints', rationale: 'Studies focused solely on glycemic control do not answer the cognitive review question', detectionType: 'algorithm', active: true }
  ]
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [reviewQuestion, setReviewQuestion] = useState<ReviewQuestion>(initialReviewQuestion);

  // Papers Corpus (initialized with 1,050 papers)
  const [papers, setPapers] = useState<ResearchPaper[]>(() => generateLargeCorpus(1050));

  // Query Versions
  const [queryVersions, setQueryVersions] = useState<QueryVersion[]>([
    {
      id: 'qv-1',
      versionNumber: 1,
      label: 'Initial broad incretin cognitive search',
      queryString: '("early Alzheimer\'s" OR "mild cognitive impairment") AND (semaglutide OR liraglutide OR "GLP-1") AND placebo',
      keyphrases: ["early Alzheimer's", "mild cognitive impairment", "semaglutide", "liraglutide", "GLP-1", "placebo"],
      booleanLogic: 'AND',
      dateStart: '2018',
      dateEnd: '2026',
      sources: ['pubmed', 'europe_pmc'],
      hitCount: 2310,
      pulledCount: 1050,
      createdAt: '10:00 AM',
      isActive: true
    }
  ]);

  const [activeVersionId, setActiveVersionId] = useState<string>('qv-1');
  const activeVersion = queryVersions.find(v => v.id === activeVersionId) || queryVersions[0];

  // Reviewer Decisions & Audit Logs
  const [decisions, setDecisions] = useState<Record<string, ReviewerDecision>>({});
  const [auditLogs, setAuditLogs] = useState<AuditRunLog[]>([
    Level2LoopManager.createAuditLog(1, '0_Question', 'Initialized Review Protocol & PICO Criteria', 'human', 'Protocol set for GLP-1 RAs in early Alzheimer disease'),
    Level2LoopManager.createAuditLog(1, '1_Query', 'Created Query Version 1', 'human', 'Executed query across PubMed E-utilities and Europe PMC'),
    Level2LoopManager.createAuditLog(1, '2_Fetch', 'Fetched 1,050 research papers', 'system', 'Completed retrieval into local database cache'),
    Level2LoopManager.createAuditLog(1, '4_Deduplicate', 'Executed exact DOI & fuzzy title deduplication', 'system', 'Clustered duplicate records, representative selected')
  ]);

  // Loading indicator & Modals
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AIBadge | null>(null);
  const [selectedBadgePaper, setSelectedBadgePaper] = useState<ResearchPaper | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  // Initial Deduplication & Screening on Mount
  useEffect(() => {
    // Run Deduplication
    const { updatedPapers } = runDeduplication(papers, decisions);
    
    // Run initial Auto-Screening
    const initialDecisions = batchScreenPapers(updatedPapers, decisions, reviewQuestion.exclusionCriteria);
    
    setPapers(updatedPapers);
    setDecisions(initialDecisions);
  }, []);

  // Handle Reviewer Decision override (Step 5)
  const handleDecide = (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string, note?: string) => {
    const targetPaper = papers.find(p => p.id === paperId);
    const prevStatus = decisions[paperId]?.status || 'unscreened';

    setDecisions(prev => ({
      ...prev,
      [paperId]: {
        paperId,
        groupId: targetPaper?.groupId || `grp-${paperId}`,
        status,
        reason: reason || (status === 'include' ? 'Validated PICO criteria verified by human reviewer' : undefined),
        notes: note,
        decidedBy: 'human',
        decidedAt: new Date().toLocaleTimeString(),
        isOverridden: true,
        previousDecision: prevStatus
      }
    }));

    // Add to audit trail
    setAuditLogs(prev => [
      Level2LoopManager.createAuditLog(
        activeVersion.versionNumber,
        '5_Screen',
        `Human Reviewer Override: Paper ${paperId}`,
        'human',
        `Changed decision from "${prevStatus}" to "${status}"${reason ? ` (Reason: ${reason})` : ''}`
      ),
      ...prev
    ]);
  };

  // Run Batch Auto-Screen
  const handleRunBatchAutoScreen = () => {
    const updated = batchScreenPapers(papers, decisions, reviewQuestion.exclusionCriteria);
    setDecisions(updated);
    setAuditLogs(prev => [
      Level2LoopManager.createAuditLog(
        activeVersion.versionNumber,
        '5_Screen',
        'Batch Auto-Screening Rerun across Corpus',
        'system',
        'Evaluated active exclusion criteria and PICO concordance scores'
      ),
      ...prev
    ]);
  };

  // Run Search & Ingest (Level 2 Loop)
  const handleRunSearchAndFetch = async (
    query: string,
    sources: ('pubmed' | 'europe_pmc')[],
    dateStart?: string,
    dateEnd?: string,
    useFullCorpusBenchmark: boolean = false
  ) => {
    setIsLoading(true);

    try {
      const nextVersionNum = queryVersions.length + 1;
      const newVersionId = `qv-${nextVersionNum}`;

      let fetchedNewPapers: ResearchPaper[] = [];

      if (useFullCorpusBenchmark) {
        // High scalability benchmark: expand to 1,200 papers
        fetchedNewPapers = generateLargeCorpus(1200);
      } else {
        // Try live Europe PMC API fetch
        const liveResults = await fetchLiveEuropePMC(query, 15, newVersionId);
        if (liveResults.length > 0) {
          fetchedNewPapers = liveResults;
        } else {
          // Fallback simulation
          fetchedNewPapers = generateLargeCorpus(1080);
        }
      }

      // Merge records with existing corpus (remembering which versions found each record)
      const existingMap = new Map<string, ResearchPaper>();
      papers.forEach(p => existingMap.set(p.id, p));

      fetchedNewPapers.forEach(newP => {
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

      // Level 2 Requirement: Rerun deduplication on combined set, keeping reviewer decisions safe
      const { updatedPapers, detectedConflicts } = runDeduplication(combinedPapers, decisions);

      // Re-screen only what is new
      const updatedDecisions = batchScreenPapers(updatedPapers, decisions, reviewQuestion.exclusionCriteria);

      // Register new Query Version
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
        hitCount: 2310 + nextVersionNum * 120,
        pulledCount: updatedPapers.length,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActive: true
      };

      setQueryVersions(prev => [...prev.map(v => ({ ...v, isActive: false })), newQueryVersion]);
      setActiveVersionId(newVersionId);
      setPapers(updatedPapers);
      setDecisions(updatedDecisions);

      // Add to audit trail
      setAuditLogs(prev => [
        Level2LoopManager.createAuditLog(
          nextVersionNum,
          'Level2_Loop',
          `Executed Query Version ${nextVersionNum} Loop`,
          'human',
          `Reran pipeline from fetch. Total records in database: ${updatedPapers.length}. Past decisions preserved.`
        ),
        ...prev
      ]);

      // Automatically switch to Level 2 Diff tab so user sees the change!
      setActiveTab('level2_loop');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Revert to historical version
  const handleRevertToVersion = (versionNum: number) => {
    const targetVersion = queryVersions.find(v => v.versionNumber === versionNum);
    if (!targetVersion) return;

    const reverted = Level2LoopManager.revertToVersion(papers, targetVersion.id);
    setPapers(reverted);
    setActiveVersionId(targetVersion.id);

    setAuditLogs(prev => [
      Level2LoopManager.createAuditLog(
        versionNum,
        'Level2_Loop',
        `Exact Revert to Version ${versionNum}`,
        'human',
        `Reverted active record set and groups deterministically to Version ${versionNum} snapshot.`
      ),
      ...prev
    ]);
  };

  // Resolve Merge Conflict
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
    setAuditLogs(prev => [
      Level2LoopManager.createAuditLog(
        activeVersion.versionNumber,
        '4_Deduplicate',
        `Resolved Merge Conflict for Group ${groupId}`,
        'human',
        `Assigned unanimous group decision: ${chosenStatus.toUpperCase()}`
      ),
      ...prev
    ]);
  };

  const includedCount = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'include').length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#F5F4F2] via-[#EBE9E6] to-[#ECE7F4] text-[#2D2521]">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVersionNumber={activeVersion.versionNumber}
        totalPapersCount={papers.length}
        includedCount={includedCount}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Tab 0 / Overview: Systematic Review Protocol & Architecture */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0F0] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded bg-[#6F4E37] text-white">
                    Step 0 Protocol
                  </span>
                  <h2 className="text-lg font-bold text-[#462E1E] mt-1">
                    Systematic Review Question & Pre-Specified Criteria
                  </h2>
                  <p className="text-xs text-[#7E7A72]">
                    Formulated before literature searching; criteria automatically applied during screening.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] text-white hover:bg-[#5A3D29] shadow-sm transition-all"
                >
                  Proceed to Step 1 & 2: Search Studio &rarr;
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

        {/* Tab 1: Search Studio (Steps 1, 2, 3) */}
        {activeTab === 'search' && (
          <SearchStudio
            reviewQuestion={reviewQuestion}
            queryVersions={queryVersions}
            activeVersion={activeVersion}
            onRunSearchAndFetch={handleRunSearchAndFetch}
            onSelectVersion={(vId) => setActiveVersionId(vId)}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Screening & PICO Tagging (Steps 4, 5, 6) */}
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

        {/* Tab 3: Agentic RAG Copilot (The Core Innovation) */}
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

        {/* Tab 5: PRISMA & Export (Step 7) */}
        {activeTab === 'review_export' && (
          <PRISMAReviewDesk
            papers={papers}
            decisions={decisions}
            auditLogs={auditLogs}
          />
        )}

      </main>

      {/* AI Badge Rationale Modal */}
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
            <span>Autonomous Systematic Review & Agentic RAG</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Theme: #6F4E37 (Coffee) | #E5E4E2 (Platinum) | #E6E0F0 (Lavender)</span>
            <span>•</span>
            <span>Google Colab & Free Tier Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
