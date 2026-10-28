import { ResearchPaper } from '../types';

/**
 * Returns an empty corpus so the workspace is completely clean.
 * Research papers are loaded exclusively via user file uploads (RIS, CSV, JSON, BibTeX, Text)
 * or live API queries from PubMed and Europe PMC.
 */
export function generateLargeCorpus(_targetCount: number = 0): ResearchPaper[] {
  return [];
}
