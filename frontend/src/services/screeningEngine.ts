import { ResearchPaper, ReviewerDecision, Criterion } from '../types';

export interface ScreeningResult {
  paperId: string;
  recommendedStatus: 'include' | 'exclude' | 'maybe';
  primaryExclusionCode?: string;
  reason?: string;
  detectedCriteria: Array<{
    code: string;
    text: string;
    detectionMethod: string;
    matchedSnippet?: string;
  }>;
  relevanceScore: number; // 0 to 100
}

/**
 * Evaluates a single research paper against systematic criteria
 */
export function evaluatePaperForScreening(
  paper: ResearchPaper,
  activeExclusionCriteria: Criterion[]
): ScreeningResult {
  const detectedCriteria: Array<{
    code: string;
    text: string;
    detectionMethod: string;
    matchedSnippet?: string;
  }> = [];

  const textToScan = `${paper.title} ${paper.abstract}`.toLowerCase();

  // 1. Check Non-English Language
  if (paper.language && paper.language !== 'eng' && paper.language !== 'en') {
    detectedCriteria.push({
      code: 'EXC-NON-ENG',
      text: 'Non-English publication',
      detectionMethod: 'Metadata field language verification',
      matchedSnippet: `Language tag: "${paper.language}"`
    });
  } else {
    // Foreign language character / French / German regex heuristic
    const foreignIndicators = /\b(hintergrund|méthodes|ergebnisse|schlußfolgerung|résultats|objectif)\b/i;
    const match = textToScan.match(foreignIndicators);
    if (match) {
      detectedCriteria.push({
        code: 'EXC-NON-ENG',
        text: 'Non-English language content detected in abstract',
        detectionMethod: 'Linguistic morphology heuristic',
        matchedSnippet: `Found foreign marker: "${match[0]}"`
      });
    }
  }

  // 2. Check Animal Preclinical Studies
  const animalRegex = /\b(mice|mouse|murine|sprague-dawley|wistar rat|rodent|rats|c57bl\/6|drosophila|zebrafish)\b/i;
  const animalMatch = textToScan.match(animalRegex);
  if (animalMatch) {
    detectedCriteria.push({
      code: 'EXC-ANIMAL',
      text: 'Animal model / preclinical rodent study',
      detectionMethod: 'Zoological taxonomy and strain keyword detection',
      matchedSnippet: `Matched keyword: "${animalMatch[0]}"`
    });
  }

  // 3. Check In Silico / Computational Simulation
  const simRegex = /\b(in silico|molecular dynamics|virtual screening|docking simulation|monte carlo|density functional theory|qsar)\b/i;
  const simMatch = textToScan.match(simRegex);
  if (simMatch) {
    detectedCriteria.push({
      code: 'EXC-SIM',
      text: 'Computational simulation or molecular docking lacking clinical data',
      detectionMethod: 'Biocomputational method parser',
      matchedSnippet: `Matched phrase: "${simMatch[0]}"`
    });
  }

  // 4. Check Single Case Report
  const caseRegex = /\b(case report|case presentation|single patient report|we report a case of)\b/i;
  const caseMatch = textToScan.match(caseRegex);
  const isCasePubType = paper.publicationTypes?.some(pt => pt.toLowerCase().includes('case report'));
  if (caseMatch || isCasePubType) {
    detectedCriteria.push({
      code: 'EXC-CASE',
      text: 'Single-subject case report (N=1 lacking statistical inference)',
      detectionMethod: isCasePubType ? 'Publication type metadata' : 'Abstract semantic regex',
      matchedSnippet: isCasePubType ? 'Publication type: Case Report' : `Found: "${caseMatch?.[0]}"`
    });
  }

  // Calculate Semantic Relevance Score
  let relevanceScore = 50;
  const isHumanClinical = !animalMatch && !simMatch && !caseMatch;
  const hasIntervention = /\b(trial|treated|treatment|intervention|therapy|administered|dose|group|placebo)\b/i.test(textToScan);
  const hasOutcome = /\b(endpoint|outcome|efficacy|safety|significant|progression|score|survival|rate)\b/i.test(textToScan);
  const isRCT = /\b(randomized|randomised|double-blind|placebo-controlled|clinical trial|control group)\b/i.test(textToScan);

  if (isHumanClinical) relevanceScore += 20;
  if (hasIntervention) relevanceScore += 15;
  if (hasOutcome) relevanceScore += 15;
  if (isRCT) relevanceScore += 15;
  if (detectedCriteria.length > 0) relevanceScore = Math.max(5, relevanceScore - 40);

  // Determine recommendation
  let recommendedStatus: 'include' | 'exclude' | 'maybe' = 'maybe';
  let primaryExclusionCode: string | undefined = undefined;
  let reason: string | undefined = undefined;

  if (detectedCriteria.length > 0) {
    recommendedStatus = 'exclude';
    primaryExclusionCode = detectedCriteria[0].code;
    reason = detectedCriteria[0].text;
  } else if (relevanceScore >= 75 && isRCT) {
    recommendedStatus = 'include';
    reason = 'Meets all PICO criteria: randomized double-blind trial in target cognitive population.';
  } else if (relevanceScore >= 60) {
    recommendedStatus = 'maybe';
    reason = 'Relevant population and therapy detected; requires manual reviewer evaluation of dosage and endpoints.';
  } else {
    recommendedStatus = 'exclude';
    primaryExclusionCode = 'EXC-LOW-REL';
    reason = 'Insufficient PICO alignment with target cognitive endpoints.';
  }

  return {
    paperId: paper.id,
    recommendedStatus,
    primaryExclusionCode,
    reason,
    detectedCriteria,
    relevanceScore: Math.min(100, Math.max(0, relevanceScore))
  };
}

/**
 * Batch screens all papers, respecting existing human decisions
 */
export function batchScreenPapers(
  papers: ResearchPaper[],
  existingDecisions: Record<string, ReviewerDecision>,
  activeExclusionCriteria: Criterion[]
): Record<string, ReviewerDecision> {
  const updatedDecisions = { ...existingDecisions };

  papers.forEach(paper => {
    // If paper was already reviewed by a human, DO NOT overwrite!
    if (updatedDecisions[paper.id]?.isOverridden && updatedDecisions[paper.id]?.decidedBy === 'human') {
      return;
    }

    const result = evaluatePaperForScreening(paper, activeExclusionCriteria);

    updatedDecisions[paper.id] = {
      paperId: paper.id,
      groupId: paper.groupId,
      status: result.recommendedStatus,
      reason: result.reason,
      decidedBy: 'auto_classifier',
      decidedAt: new Date().toISOString(),
      isOverridden: false
    };
  });

  return updatedDecisions;
}
