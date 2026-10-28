export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  reviewQuestion: ReviewQuestion;
  papers: ResearchPaper[];
  queryVersions: QueryVersion[];
  decisions: Record<string, ReviewerDecision>;
  auditLogs: AuditRunLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewQuestion {
  id: string;
  title: string;
  question: string;
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
  inclusionCriteria: Criterion[];
  exclusionCriteria: Criterion[];
}

export interface Criterion {
  id: string;
  code: string;
  text: string;
  rationale: string;
  detectionType: 'metadata' | 'algorithm' | 'manual';
  active: boolean;
}

export interface QueryVersion {
  id: string;
  versionNumber: number;
  label: string;
  queryString: string;
  keyphrases: string[];
  booleanLogic: 'AND' | 'OR' | 'CUSTOM';
  dateStart?: string;
  dateEnd?: string;
  sources: ('pubmed' | 'europe_pmc')[];
  hitCount: number;
  pulledCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface PICOSpan {
  id: string;
  type: 'P' | 'I' | 'C' | 'O';
  label: 'Population' | 'Intervention' | 'Comparator' | 'Outcome';
  text: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  isCustom?: boolean;
}

export type BadgeType =
  | 'rct_gold'
  | 'high_power'
  | 'pico_concordance'
  | 'bias_risk'
  | 'biomarker'
  | 'contradiction'
  | 'safety_signal';

export interface AIBadge {
  id: string;
  type: BadgeType;
  label: string;
  variant: 'gold' | 'blue' | 'purple' | 'amber' | 'rose' | 'emerald';
  badgeIcon: string;
  whySnippet: string; // STRICT requirement: explains why the AI gave this badge
  textEvidence: string; // Quote from text
  confidence: number; // 0-1
  category: 'Quality' | 'Sample' | 'Relevance' | 'Risk' | 'Finding';
}

export interface DeepAnalysisResult {
  studyDesign: string;
  sampleSize?: number;
  dosageDuration?: string;
  primaryEffectMetric?: string;
  pValue?: number;
  confidenceInterval?: string;
  endpointSummary: string;
  statisticalRigorScore: number; // 0 - 100
  biasAssessment: {
    riskLevel: 'Low' | 'Moderate' | 'High';
    explanation: string;
  };
  consensusAlignment: 'Supports Consensus' | 'Neutral / Inconclusive' | 'Contradicts Prevailing Data';
  synthesizedKeyFinding: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  journal: string;
  volumePages?: string;
  pmid?: string;
  doi?: string;
  source: 'pubmed' | 'europe_pmc' | 'local_corpus';
  queryVersionIds: string[]; // Set of version IDs that returned this paper
  groupId: string; // Deduplication group id
  isRepresentative: boolean;
  hidden: boolean;
  language?: string;
  publicationTypes?: string[];
  url?: string;
  
  // Enriched AI data
  picoSpans: PICOSpan[];
  aiBadges: AIBadge[];
  deepAnalysis: DeepAnalysisResult;
}

export type DecisionStatus = 'include' | 'exclude' | 'maybe' | 'unscreened';

export interface ReviewerDecision {
  paperId: string; // bound to paper or representative
  groupId: string;
  status: DecisionStatus;
  reason?: string;
  notes?: string;
  decidedBy: 'human' | 'auto_classifier';
  decidedAt: string;
  isOverridden: boolean;
  previousDecision?: DecisionStatus;
  conflictState?: {
    hasConflict: boolean;
    conflictingDecisions: Array<{
      paperId: string;
      status: DecisionStatus;
      reason?: string;
      title: string;
    }>;
  };
}

export interface DuplicateGroup {
  groupId: string;
  representativeId: string;
  memberIds: string[];
  matchConfidence: number; // 1.0 = DOI exact match, 0.7 - 0.99 = fuzzy algorithm
  matchField: 'doi' | 'pmid' | 'fuzzy_title_author_year';
  status: 'confirmed' | 'uncertain' | 'split';
  comparedFields?: {
    titleA: string;
    titleB: string;
    similarityScore: number;
  };
}

export interface DiffReport {
  id: string;
  timestamp: string;
  fromVersion: number;
  toVersion: number;
  addedPapersCount: number;
  removedPapersCount: number;
  newlyMergedGroupsCount: number;
  addedPaperIds: string[];
  removedPaperIds: string[];
  mergedGroups: Array<{
    groupId: string;
    previousGroupIds: string[];
    memberCount: number;
    hasDecisionConflict: boolean;
  }>;
}

export interface AuditRunLog {
  id: string;
  timestamp: string;
  versionNumber: number;
  step: 'Protocol' | 'Query' | 'Fetch' | 'Database' | 'Deduplicate' | 'Screening' | 'PICO' | 'Review' | 'Level2_Loop';
  action: string;
  actor: 'human' | 'system';
  details: string;
}

export interface RAGSynthesisQuery {
  id: string;
  question: string;
  answer: string;
  citedPaperIds: string[];
  evidenceQuotes: Array<{
    paperId: string;
    paperTitle: string;
    quote: string;
    relevanceScore: number;
  }>;
  consensusSummary: {
    totalEvaluated: number;
    supportingCount: number;
    opposingCount: number;
    inconclusiveCount: number;
  };
  timestamp: string;
}
