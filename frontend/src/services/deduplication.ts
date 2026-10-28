import { ResearchPaper, DuplicateGroup, ReviewerDecision } from '../types';

/**
 * Clean and normalize title text for resilient fuzzy comparison
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract 3-gram character shingles for fast Jaccard similarity
 */
function getTrigrams(str: string): Set<string> {
  const trigrams = new Set<string>();
  const padded = `__${str}__`;
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

/**
 * Calculate Jaccard Similarity between two strings
 */
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeTitle(str1);
  const norm2 = normalizeTitle(str2);
  if (norm1 === norm2) return 1.0;
  
  const set1 = getTrigrams(norm1);
  const set2 = getTrigrams(norm2);
  
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let intersection = 0;
  set1.forEach(item => {
    if (set2.has(item)) intersection++;
  });
  
  const union = set1.size + set2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Extract first author surname
 */
function getFirstAuthorSurname(authors: string[]): string {
  if (!authors || authors.length === 0) return '';
  const first = authors[0];
  return first.split(',')[0].trim().toLowerCase();
}

/**
 * Deduplicate a list of papers and group them
 */
export function runDeduplication(
  papers: ResearchPaper[],
  existingDecisions: Record<string, ReviewerDecision> = {}
): {
  updatedPapers: ResearchPaper[];
  duplicateGroups: DuplicateGroup[];
  detectedConflicts: Array<{
    groupId: string;
    conflictingDecisions: Array<{ paperId: string; status: string; title: string }>;
  }>;
} {
  const updatedPapers = [...papers];
  const duplicateGroups: DuplicateGroup[] = [];
  const detectedConflicts: Array<{
    groupId: string;
    conflictingDecisions: Array<{ paperId: string; status: string; title: string }>;
  }> = [];

  // Group maps
  const doiMap = new Map<string, string[]>(); // normalized DOI -> paper IDs
  const pmidMap = new Map<string, string[]>(); // PMID -> paper IDs

  // Pass 1: Build exact match indexes
  updatedPapers.forEach((paper) => {
    if (paper.doi) {
      const cleanDoi = paper.doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim();
      if (!doiMap.has(cleanDoi)) doiMap.set(cleanDoi, []);
      doiMap.get(cleanDoi)!.push(paper.id);
    }
    if (paper.pmid) {
      const cleanPmid = paper.pmid.trim();
      if (!pmidMap.has(cleanPmid)) pmidMap.set(cleanPmid, []);
      pmidMap.get(cleanPmid)!.push(paper.id);
    }
  });

  const processedIds = new Set<string>();

  // Helper to establish or merge duplicate group
  const createGroup = (
    memberIds: string[], 
    confidence: number, 
    matchField: 'doi' | 'pmid' | 'fuzzy_title_author_year',
    comparedFields?: any
  ) => {
    if (memberIds.length <= 1) return;
    
    // Choose representative (prefer record with DOI + PMID + longer abstract)
    const members = memberIds.map(id => updatedPapers.find(p => p.id === id)!).filter(Boolean);
    members.sort((a, b) => {
      let scoreA = (a.doi ? 2 : 0) + (a.pmid ? 2 : 0) + (a.abstract.length / 500);
      let scoreB = (b.doi ? 2 : 0) + (b.pmid ? 2 : 0) + (b.abstract.length / 500);
      return scoreB - scoreA;
    });

    const representative = members[0];
    const groupId = `grp-dup-${representative.id}`;

    // Mark representative and hidden members
    members.forEach((m, idx) => {
      m.groupId = groupId;
      m.isRepresentative = (idx === 0);
      m.hidden = (idx > 0);
      processedIds.add(m.id);
    });

    // Check for decision conflicts across members (e.g. Paper A was Included, Paper B was Excluded)
    const decisions = members.map(m => existingDecisions[m.id]).filter(Boolean);
    const uniqueStatuses = new Set(decisions.map(d => d.status));
    
    if (uniqueStatuses.size > 1 && !uniqueStatuses.has('unscreened')) {
      detectedConflicts.push({
        groupId,
        conflictingDecisions: members.map(m => ({
          paperId: m.id,
          status: existingDecisions[m.id]?.status || 'unscreened',
          title: m.title
        }))
      });
    }

    duplicateGroups.push({
      groupId,
      representativeId: representative.id,
      memberIds: members.map(m => m.id),
      matchConfidence: confidence,
      matchField,
      status: confidence >= 0.90 ? 'confirmed' : 'uncertain',
      comparedFields
    });
  };

  // Process exact DOI matches
  doiMap.forEach((ids) => {
    if (ids.length > 1) {
      createGroup(ids, 1.0, 'doi');
    }
  });

  // Process exact PMID matches
  pmidMap.forEach((ids) => {
    if (ids.length > 1) {
      const unassigned = ids.filter(id => !processedIds.has(id));
      if (unassigned.length > 1) {
        createGroup(unassigned, 1.0, 'pmid');
      }
    }
  });

  // Pass 2: Fuzzy matching for remaining records (O(N^2) restricted with smart year and prefix blocking)
  const remainingPapers = updatedPapers.filter(p => !processedIds.has(p.id));

  for (let i = 0; i < remainingPapers.length; i++) {
    const p1 = remainingPapers[i];
    if (processedIds.has(p1.id)) continue;

    const matchedCluster: string[] = [p1.id];
    let bestSimilarity = 0;
    let bestFields = undefined;

    for (let j = i + 1; j < remainingPapers.length; j++) {
      const p2 = remainingPapers[j];
      if (processedIds.has(p2.id)) continue;

      // Year match within 1 year (pre-print vs publication)
      const yearDiff = Math.abs(p1.year - p2.year);
      if (yearDiff > 1) continue;

      // First author check
      const auth1 = getFirstAuthorSurname(p1.authors);
      const auth2 = getFirstAuthorSurname(p2.authors);
      const authorMatch = (auth1 && auth2 && auth1 === auth2);

      // Title Jaccard similarity
      const similarity = calculateJaccardSimilarity(p1.title, p2.title);

      if (similarity >= 0.88 || (similarity >= 0.78 && authorMatch)) {
        matchedCluster.push(p2.id);
        bestSimilarity = Math.max(bestSimilarity, similarity);
        bestFields = {
          titleA: p1.title,
          titleB: p2.title,
          similarityScore: similarity
        };
      }
    }

    if (matchedCluster.length > 1) {
      createGroup(matchedCluster, bestSimilarity, 'fuzzy_title_author_year', bestFields);
    }
  }

  return {
    updatedPapers,
    duplicateGroups,
    detectedConflicts
  };
}
