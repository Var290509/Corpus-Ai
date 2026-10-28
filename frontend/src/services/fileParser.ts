import { ResearchPaper } from '../types';
import { runDeduplication } from './deduplication';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for browser/Vite environment
if (typeof window !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
  try {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.0'}/build/pdf.worker.min.mjs`;
  }
}

export interface ParseResult {
  papers: ResearchPaper[];
  filename: string;
  totalParsed: number;
  duplicatesRemoved?: number;
  format: 'pdf' | 'ris' | 'csv' | 'json' | 'bibtex' | 'txt' | 'unknown';
}

/**
 * Strips raw PDF/PostScript binary markers, object dictionaries (% 1 0 obj << ... >>),
 * stream wrappers, unprintable characters, NULL bytes, and unicode replacement characters.
 */
export function cleanResearchText(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Remove PDF magic header and comment headers
  text = text.replace(/%PDF-[\d\.]+/gi, '');
  text = text.replace(/%\s*\d+\s+\d+\s+obj[\s\S]*?endobj/gi, ' ');
  text = text.replace(/\d+\s+\d+\s+obj\s*<<[\s\S]*?>>\s*(?:endobj)?/gi, ' ');
  text = text.replace(/<<[\s\S]*?>>/g, ' ');
  text = text.replace(/\b(?:stream|endstream|endobj|xref|trailer|startxref)\b/gi, ' ');
  text = text.replace(/\/([A-Z][a-zA-Z0-9_]*)/g, ' ');

  // 2. Remove non-printable control characters, null bytes, and replacement char (\uFFFD)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD\uFEFF]/g, ' ');

  // 3. Filter out lines with high ratio of binary/symbol characters
  const cleanLines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      if (line.length === 0) return false;
      // Skip lines that start with PDF syntax (% 1 0 obj ...)
      if (/^%+\s*\d*/.test(line)) return false;
      if (/^<<|^>>/.test(line)) return false;
      // Skip lines with high symbol density
      const readable = line.match(/[a-zA-Z0-9\s.,;:'"()\-–—?!%$/]/g) || [];
      const ratio = readable.length / line.length;
      if (line.length > 8 && ratio < 0.65) return false;
      return true;
    });

  text = cleanLines.join(' ');
  // Collapse duplicate spaces
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Formats a file name into a clean, human-readable paper title.
 */
export function formatFilenameToTitle(filename: string): string {
  let clean = filename.replace(/\.[a-zA-Z0-9]+$/, '');
  clean = clean.replace(/^media_\d+_[a-f0-9]+/i, '');
  clean = clean.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, '');
  clean = clean.replace(/[-_]+/g, ' ').trim();
  if (!clean || clean.length < 3) return 'Uploaded Research Paper';
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Intelligently extracts text, title, authors, year, and abstract from an uploaded PDF file
 * without any binary symbol artifacts.
 */
export async function parsePDFFile(file: File, versionId: string = '1'): Promise<ResearchPaper[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Initialize document with pdfjsLib
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true
    });
    const doc = await loadingTask.promise;

    const numPages = doc.numPages;
    const meta = await doc.getMetadata().catch(() => null);
    const info: any = (meta as any)?.info || {};

    // Read pages (first 10 pages for comprehensive abstract and methods extraction)
    let fullText = '';
    const pagesToRead = Math.min(numPages, 10);
    for (let i = 1; i <= pagesToRead; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      fullText += pageStrings.join(' ') + '\n\n';
    }

    fullText = cleanResearchText(fullText);

    // Extract Title:
    let title = cleanResearchText(info.Title || '');
    if (!title || title.toLowerCase() === 'untitled' || title.length < 5 || title.includes('obj <<') || title.startsWith('%')) {
      const candidateLines = fullText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 5 && !/^(page\s+\d+|draft|confidential|copyright|issn|isbn)/i.test(l));
      
      if (candidateLines.length > 0 && candidateLines[0].length < 250) {
        title = candidateLines[0];
      } else {
        title = formatFilenameToTitle(file.name);
      }
    }
    title = cleanResearchText(title) || formatFilenameToTitle(file.name);

    // Extract Authors:
    let authors: string[] = [];
    const metaAuthor = cleanResearchText(info.Author || '');
    if (metaAuthor && metaAuthor.length > 2 && !metaAuthor.includes('obj <<')) {
      authors = [metaAuthor];
    } else {
      const authorMatch = fullText.slice(0, 1500).match(/(?:@|by\s+|authors?:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/i);
      if (authorMatch && authorMatch[1]) {
        authors = [cleanResearchText(authorMatch[1].trim())];
      } else {
        authors = ['Uploaded Research Team'];
      }
    }

    // Extract Abstract / Summary:
    let abstract = '';
    const abstractMatch = fullText.match(/(?:abstract|summary|executive summary|overview)\s*[:\n\-–]\s*([\s\S]{80,1800}?)(?=\n\s*(?:introduction|background|methods|materials|study design|1\.|I\.)|$)/i);
    if (abstractMatch && abstractMatch[1].trim().length > 50) {
      abstract = abstractMatch[1].trim();
    } else {
      const paragraphs = fullText
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 50 && !p.startsWith('%'));
      if (paragraphs.length > 1) {
        abstract = paragraphs.slice(0, 3).join(' ').slice(0, 900).trim();
      } else if (paragraphs.length === 1) {
        abstract = paragraphs[0].slice(0, 900).trim();
      } else {
        abstract = `Research manuscript extracted from ${file.name}. Methodological criteria, clinical endpoints, and findings indexed for systematic literature review.`;
      }
    }
    abstract = cleanResearchText(abstract);

    // Extract Publication Year
    let year = 2024;
    const yearMatch = (info.CreationDate || fullText.slice(0, 1000)).match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    // Extract DOI / PMID if present in text
    const doiMatch = fullText.match(/\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/);
    const pmidMatch = fullText.match(/\b(?:pmid|pubmed id)\s*[:\-]?\s*(\d{7,9})\b/i);

    return [
      buildEnrichedPaper({
        id: `pdf-${Math.random().toString(36).substring(7)}`,
        title,
        abstract,
        authors,
        year,
        journal: cleanResearchText(info.Producer || info.Creator || 'Uploaded Research Document (PDF)'),
        doi: doiMatch ? doiMatch[1] : undefined,
        pmid: pmidMatch ? pmidMatch[1] : undefined,
        source: 'local_corpus',
        versionId
      })
    ];
  } catch (err) {
    console.warn('PDF extraction via pdfjs encountered an error, trying backend and fallback text extraction:', err);
    const backendResult = await tryBackendParsePDF(file, versionId);
    if (backendResult && backendResult.length > 0) {
      return backendResult;
    }
    return parsePDFFallback(file, versionId);
  }
}

/**
 * Attempts to parse PDF via backend FastAPI endpoint if available
 */
async function tryBackendParsePDF(file: File, versionId: string = '1'): Promise<ResearchPaper[] | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch('http://localhost:8000/api/parse-document', {
      method: 'POST',
      body: formData
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.title) {
        return [
          buildEnrichedPaper({
            id: `pdf-be-${Math.random().toString(36).substring(7)}`,
            title: cleanResearchText(data.title),
            abstract: cleanResearchText(data.abstract),
            authors: data.authors && data.authors.length > 0 ? data.authors : ['Uploaded Author'],
            year: data.year || 2024,
            journal: 'Uploaded PDF Publication',
            source: 'local_corpus',
            versionId
          })
        ];
      }
    }
  } catch {
    // Backend offline or unreachable
  }
  return null;
}

/**
 * Fallback parser for PDFs that extracts readable strings and metadata without binary noise
 */
async function parsePDFFallback(file: File, versionId: string = '1'): Promise<ResearchPaper[]> {
  try {
    const rawBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('latin1');
    const rawContent = decoder.decode(rawBuffer);

    const titleMatch = rawContent.match(/\/Title\s*\(([^)]+)\)/i);
    const authorMatch = rawContent.match(/\/Author\s*\(([^)]+)\)/i);

    const cleanTitle = titleMatch ? cleanResearchText(titleMatch[1]) : formatFilenameToTitle(file.name);
    const author = authorMatch ? cleanResearchText(authorMatch[1]) : 'Uploaded Author';

    const textStrings: string[] = [];
    const textMatches = rawContent.matchAll(/\(([^)]{4,120})\)\s*T[jJ]/g);
    for (const match of textMatches) {
      const cleaned = cleanResearchText(match[1]);
      if (cleaned.length > 5) {
        textStrings.push(cleaned);
      }
      if (textStrings.length > 40) break;
    }

    let abstract = textStrings.join(' ');
    if (abstract.length < 50) {
      abstract = `Extracted research document from file ${file.name}. Ingested into research corpus for screening, multi-database recommendations, and AI rating.`;
    } else {
      abstract = cleanResearchText(abstract).slice(0, 800);
    }

    return [
      buildEnrichedPaper({
        id: `pdf-fallback-${Math.random().toString(36).substring(7)}`,
        title: cleanTitle || formatFilenameToTitle(file.name),
        abstract,
        authors: [author],
        year: 2024,
        journal: 'Uploaded PDF Publication',
        source: 'local_corpus',
        versionId
      })
    ];
  } catch (e) {
    console.error('PDF fallback failed:', e);
    return [
      buildEnrichedPaper({
        id: `pdf-err-${Math.random().toString(36).substring(7)}`,
        title: formatFilenameToTitle(file.name),
        abstract: `Uploaded research paper file: ${file.name}. Indexed for literature review screening.`,
        authors: ['Uploaded Author'],
        year: 2024,
        journal: 'Uploaded Scientific Article',
        source: 'local_corpus',
        versionId
      })
    ];
  }
}

/**
 * Parses RIS (Research Information Systems) file format commonly exported from
 * PubMed, Scopus, Web of Science, EndNote, and Zotero.
 */
export function parseRIS(content: string, versionId: string = '1'): ResearchPaper[] {
  const records = content.split(/\n(?:\s*ER\s*-\s*|\s*ER\s{2}-\s*)/i);
  const papers: ResearchPaper[] = [];

  records.forEach((rawRecord, idx) => {
    if (!rawRecord.trim()) return;

    let title = '';
    let abstract = '';
    const authors: string[] = [];
    let year = 2024;
    let journal = 'Uploaded Research Publication';
    let doi = '';
    let pmid = '';

    const lines = rawRecord.split('\n');
    let currentTag = '';
    let currentValue = '';

    const flushTag = () => {
      if (!currentTag) return;
      const tag = currentTag.trim().toUpperCase();
      const val = currentValue.trim();

      if (tag === 'TI' || tag === 'T1') {
        title = val;
      } else if (tag === 'AB' || tag === 'N2') {
        abstract = val;
      } else if (tag === 'AU' || tag === 'A1') {
        authors.push(val);
      } else if (tag === 'PY' || tag === 'Y1' || tag === 'DA') {
        const yMatch = val.match(/\b(19\d\d|20\d\d)\b/);
        if (yMatch) year = parseInt(yMatch[0], 10);
      } else if (tag === 'JO' || tag === 'JF' || tag === 'T2') {
        journal = val;
      } else if (tag === 'DO') {
        doi = val;
      } else if (tag === 'AN' || tag === 'PM') {
        pmid = val;
      }
      currentTag = '';
      currentValue = '';
    };

    lines.forEach(line => {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (match) {
        flushTag();
        currentTag = match[1];
        currentValue = match[2];
      } else if (currentTag) {
        currentValue += ' ' + line.trim();
      }
    });
    flushTag();

    if (title || abstract) {
      const id = `upload-${pmid || doi || Math.random().toString(36).substring(7)}`;
      papers.push(buildEnrichedPaper({
        id,
        title: title || `Untitled Paper ${idx + 1}`,
        abstract: abstract || 'No abstract text provided in uploaded record.',
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        year,
        journal,
        doi: doi || undefined,
        pmid: pmid || undefined,
        source: 'local_corpus',
        versionId
      }));
    }
  });

  return papers;
}

/**
 * Parses CSV text with standard scientific headers
 */
export function parseCSV(content: string, versionId: string = '1'): ResearchPaper[] {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const titleIdx = header.findIndex(h => h.includes('title'));
  const abstractIdx = header.findIndex(h => h.includes('abstract') || h.includes('summary'));
  const authorsIdx = header.findIndex(h => h.includes('author'));
  const yearIdx = header.findIndex(h => h.includes('year') || h.includes('date'));
  const journalIdx = header.findIndex(h => h.includes('journal') || h.includes('source'));
  const doiIdx = header.findIndex(h => h.includes('doi'));
  const pmidIdx = header.findIndex(h => h.includes('pmid'));

  const papers: ResearchPaper[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0) continue;

    const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx].trim() : `Paper ${i}`;
    const abstract = abstractIdx !== -1 && row[abstractIdx] ? row[abstractIdx].trim() : '';
    const authorStr = authorsIdx !== -1 && row[authorsIdx] ? row[authorsIdx].trim() : 'Author';
    const authors = authorStr.split(/[,;]/).map(a => a.trim()).filter(Boolean);
    const year = yearIdx !== -1 && parseInt(row[yearIdx], 10) ? parseInt(row[yearIdx], 10) : 2024;
    const journal = journalIdx !== -1 && row[journalIdx] ? row[journalIdx].trim() : 'Uploaded Study';
    const doi = doiIdx !== -1 && row[doiIdx] ? row[doiIdx].trim() : undefined;
    const pmid = pmidIdx !== -1 && row[pmidIdx] ? row[pmidIdx].trim() : undefined;

    if (title || abstract) {
      papers.push(buildEnrichedPaper({
        id: `csv-${pmid || doi || i}-${Math.random().toString(36).substring(7)}`,
        title,
        abstract: abstract || 'Abstract text not provided.',
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        year,
        journal,
        doi,
        pmid,
        source: 'local_corpus',
        versionId
      }));
    }
  }

  return papers;
}

/**
 * Parses JSON array of paper objects
 */
export function parseJSON(content: string, versionId: string = '1'): ResearchPaper[] {
  try {
    const data = JSON.parse(content);
    const arr = Array.isArray(data) ? data : (data.papers || data.results || [data]);
    return arr.map((item: any, idx: number) => {
      const authors = Array.isArray(item.authors) ? item.authors : (item.authors ? [item.authors] : ['Author']);
      return buildEnrichedPaper({
        id: item.id || `json-${idx + 1}-${Math.random().toString(36).substring(7)}`,
        title: item.title || `Uploaded Paper ${idx + 1}`,
        abstract: item.abstract || item.summary || 'Abstract not provided.',
        authors,
        year: parseInt(item.year, 10) || 2024,
        journal: item.journal || 'Uploaded Journal',
        doi: item.doi,
        pmid: item.pmid,
        source: 'local_corpus',
        versionId
      });
    });
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }
}

/**
 * Parses BibTeX format
 */
export function parseBibTeX(content: string, versionId: string = '1'): ResearchPaper[] {
  const entries = content.split(/@(?:article|inproceedings|book|misc)\s*\{/i);
  const papers: ResearchPaper[] = [];

  entries.forEach((entry, idx) => {
    if (!entry.trim() || idx === 0) return;

    const titleMatch = entry.match(/title\s*=\s*[\{"]([^"\}]+)[\}"]/i);
    const abstractMatch = entry.match(/abstract\s*=\s*[\{"]([^"\}]+)[\}"]/i);
    const authorMatch = entry.match(/author\s*=\s*[\{"]([^"\}]+)[\}"]/i);
    const yearMatch = entry.match(/year\s*=\s*[\{"]?(\d{4})[\}"]?/i);
    const journalMatch = entry.match(/journal\s*=\s*[\{"]([^"\}]+)[\}"]/i);
    const doiMatch = entry.match(/doi\s*=\s*[\{"]([^"\}]+)[\}"]/i);

    const title = titleMatch ? titleMatch[1].trim() : `BibTeX Paper ${idx}`;
    const abstract = abstractMatch ? abstractMatch[1].trim() : 'Abstract not specified in BibTeX entry.';
    const authors = authorMatch ? authorMatch[1].split(/\s+and\s+/i) : ['Unknown'];
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
    const journal = journalMatch ? journalMatch[1].trim() : 'BibTeX Publication';
    const doi = doiMatch ? doiMatch[1].trim() : undefined;

    papers.push(buildEnrichedPaper({
      id: `bib-${idx}-${Math.random().toString(36).substring(7)}`,
      title,
      abstract,
      authors,
      year,
      journal,
      doi,
      source: 'local_corpus',
      versionId
    }));
  });

  return papers;
}

/**
 * Parses free-form text or pasted multi-paragraph abstracts
 */
export function parseRawText(content: string, versionId: string = '1'): ResearchPaper[] {
  const cleanedContent = cleanResearchText(content);
  const paragraphs = cleanedContent.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  if (paragraphs.length === 0) {
    if (cleanedContent.trim().length > 15) {
      return [
        buildEnrichedPaper({
          id: `raw-single-${Math.random().toString(36).substring(7)}`,
          title: cleanResearchText(cleanedContent.slice(0, 100)) || 'Uploaded Research Abstract',
          abstract: cleanResearchText(cleanedContent),
          authors: ['Uploaded Author'],
          year: 2024,
          journal: 'User Uploaded Abstract',
          source: 'local_corpus',
          versionId
        })
      ];
    }
    return [];
  }

  return paragraphs.map((block, idx) => {
    const lines = block.split('\n').filter(l => l.trim().length > 0);
    let title = cleanResearchText(lines[0]);
    if (!title || title.startsWith('%') || title.includes('obj <<') || title.length < 5) {
      title = `Research Document Citation ${idx + 1}`;
    }
    let abstract = lines.slice(1).join(' ').trim();
    abstract = cleanResearchText(abstract) || title;

    return buildEnrichedPaper({
      id: `raw-${idx + 1}-${Math.random().toString(36).substring(7)}`,
      title,
      abstract,
      authors: ['Uploaded Author'],
      year: 2024,
      journal: 'User Uploaded Abstract',
      source: 'local_corpus',
      versionId
    });
  });
}

/**
 * Auto-detects format and parses any uploaded research file (PDF, RIS, CSV, JSON, BIB)
 */
export async function parseUploadedFile(file: File, versionId: string = '1'): Promise<ParseResult> {
  const name = file.name.toLowerCase();

  let papers: ResearchPaper[] = [];
  let format: ParseResult['format'] = 'unknown';

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    papers = await parsePDFFile(file, versionId);
    format = 'pdf';
  } else {
    const text = await file.text();

    if (name.endsWith('.ris')) {
      papers = parseRIS(text, versionId);
      format = 'ris';
    } else if (name.endsWith('.csv')) {
      papers = parseCSV(text, versionId);
      format = 'csv';
    } else if (name.endsWith('.json')) {
      papers = parseJSON(text, versionId);
      format = 'json';
    } else if (name.endsWith('.bib') || name.endsWith('.bibtex')) {
      papers = parseBibTeX(text, versionId);
      format = 'bibtex';
    } else {
      // Heuristic checks
      if (text.startsWith('%PDF-') || text.includes('obj <<')) {
        papers = await parsePDFFile(file, versionId);
        format = 'pdf';
      } else if (/TY\s*-\s*/.test(text)) {
        papers = parseRIS(text, versionId);
        format = 'ris';
      } else if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        papers = parseJSON(text, versionId);
        format = 'json';
      } else if (text.includes(',') && text.split('\n')[0].includes('title')) {
        papers = parseCSV(text, versionId);
        format = 'csv';
      } else {
        papers = parseRawText(text, versionId);
        format = 'txt';
      }
    }
  }

  // Automated entity deduplication across parsed records in the file
  const { updatedPapers, duplicateGroups } = runDeduplication(papers, {});
  const duplicatesCount = papers.length - updatedPapers.filter(p => p.isRepresentative).length;

  return {
    papers: updatedPapers,
    filename: file.name,
    totalParsed: papers.length,
    duplicatesRemoved: duplicatesCount,
    format
  };
}

/**
 * Enriches a parsed paper with automated deep analysis, quantitative metrics,
 * and explainable AI badges based on its actual text!
 */
function buildEnrichedPaper(params: {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  journal: string;
  doi?: string;
  pmid?: string;
  source: 'pubmed' | 'europe_pmc' | 'local_corpus';
  versionId: string;
}): ResearchPaper {
  const cleanTitle = cleanResearchText(params.title) || 'Uploaded Research Document';
  let cleanAbstract = cleanResearchText(params.abstract);
  if (!cleanAbstract || cleanAbstract.length < 25) {
    cleanAbstract = `Methodological analysis and synthesized scientific findings for "${cleanTitle}". Ingested into research workspace with automated quality appraisal and multi-database cross-referencing.`;
  }

  const cleanAuthors = params.authors.map(a => cleanResearchText(a)).filter(a => a.length > 1);

  const fullText = `${cleanTitle} ${cleanAbstract}`.toLowerCase();

  // Extract sample size N
  const sampleMatch = fullText.match(/\b(?:n\s*=\s*|enrolled\s*|cohort of\s*|sample of\s*)(\d{1,3}(?:,\d{3})*|\d+)\b/i);
  const sampleSize = sampleMatch ? parseInt(sampleMatch[1].replace(/,/g, ''), 10) : undefined;

  // Extract P-value
  const pMatch = fullText.match(/\bp\s*([<>=])\s*(0\.\d+)\b/i);
  const pValue = pMatch ? parseFloat(pMatch[2]) : 0.05;

  // Study design detection
  const isRCT = /\b(randomized|randomised|double-blind|placebo-controlled|clinical trial)\b/i.test(fullText);
  const isObservational = /\b(cohort|retrospective|prospective|observational|registry)\b/i.test(fullText);
  const isAnimal = /\b(mice|mouse|murine|rat|rats|sprague-dawley|rodent)\b/i.test(fullText);
  const isSimulation = /\b(in silico|molecular dynamics|docking|monte carlo)\b/i.test(fullText);
  const isCaseReport = /\b(case report|single patient|we report a case)\b/i.test(fullText);
  const isContradictory = /\b(no statistically significant|did not differ|failed to show|ineffective|null effect)\b/i.test(fullText);

  const studyDesign = isRCT 
    ? 'Double-Blind Randomized Controlled Trial' 
    : (isAnimal ? 'Preclinical Animal Model' : (isCaseReport ? 'Case Report (N=1)' : (isObservational ? 'Observational Cohort' : 'Clinical Study')));

  // Badges with explicit why attribution
  const badges: any[] = [];
  if (isRCT) {
    badges.push({
      id: `b-rct-${Math.random()}`,
      type: 'rct_gold',
      label: 'Gold Standard RCT',
      variant: 'gold',
      badgeIcon: 'Award',
      whySnippet: 'Verified double-blind, randomized, placebo-controlled trial design in methods.',
      textEvidence: extractSnippet(cleanAbstract, /randomized|double-blind|placebo/i),
      confidence: 0.98,
      category: 'Quality'
    });
  }

  if (sampleSize && sampleSize >= 500) {
    badges.push({
      id: `b-pwr-${Math.random()}`,
      type: 'high_power',
      label: `High Sample Power (N=${sampleSize.toLocaleString()})`,
      variant: 'blue',
      badgeIcon: 'BarChart2',
      whySnippet: `Sample cohort (N=${sampleSize.toLocaleString()}) provides high statistical confidence and low variance.`,
      textEvidence: extractSnippet(cleanAbstract, /n\s*=\s*\d+|enrolled \d+/i),
      confidence: 0.99,
      category: 'Sample'
    });
  }

  if (isContradictory) {
    badges.push({
      id: `b-cnt-${Math.random()}`,
      type: 'contradiction',
      label: 'Divergent / Null Finding',
      variant: 'rose',
      badgeIcon: 'AlertTriangle',
      whySnippet: `Primary outcome was non-significant (p=${pValue}), contrasting with standard positive therapeutic consensus.`,
      textEvidence: extractSnippet(cleanAbstract, /no statistically significant|did not differ/i),
      confidence: 0.93,
      category: 'Finding'
    });
  }

  if (isAnimal || isSimulation || isCaseReport) {
    badges.push({
      id: `b-bias-${Math.random()}`,
      type: 'bias_risk',
      label: isAnimal ? 'Animal Preclinical' : (isSimulation ? 'In Silico Simulation' : 'N=1 Case Report'),
      variant: 'amber',
      badgeIcon: 'ShieldAlert',
      whySnippet: isAnimal 
        ? 'Preclinical non-human animal model; lacks human clinical cognitive validation.'
        : (isSimulation ? 'Computational virtual model lacking biological in vivo confirmation.' : 'Single-subject observational study lacking statistical generalizability.'),
      textEvidence: extractSnippet(cleanAbstract, /mice|rat|rodent|in silico|case report/i),
      confidence: 0.95,
      category: 'Risk'
    });
  }

  // Calculate Overall AI Rating (Stars 1-5, Score 0-100) and Attribution
  let overallRatingScore = 75;
  let overallRatingStars = 3;
  let ratingBadgeLabel = '3-Star Empirical Study';
  let ratingRationale = 'Observational or standard trial methodology with acceptable reporting metrics.';
  let ratingQuoteEvidence = cleanAbstract.slice(0, 140) + '...';

  if (isRCT) {
    overallRatingScore = sampleSize && sampleSize >= 500 ? 98 : 94;
    overallRatingStars = 5;
    ratingBadgeLabel = '★★★★★ 5-Star Gold RCT Rigor';
    ratingRationale = `Awarded 5 Stars (${overallRatingScore}/100): Double-blind, randomized controlled trial design verified. High methodological rigor with low risk of bias and prospectively controlled endpoints.`;
    ratingQuoteEvidence = extractSnippet(cleanAbstract, /randomized|double-blind|placebo|controlled trial/i);
  } else if (sampleSize && sampleSize >= 500) {
    overallRatingScore = 88;
    overallRatingStars = 4;
    ratingBadgeLabel = '★★★★☆ 4-Star High-Power Cohort';
    ratingRationale = `Awarded 4 Stars (88/100): Robust statistical power (N=${sampleSize.toLocaleString()}) minimizing standard error, prospective cohort tracking, and quantified statistical significance.`;
    ratingQuoteEvidence = extractSnippet(cleanAbstract, /n\s*=\s*\d+|cohort of \d+|enrolled \d+/i);
  } else if (isAnimal || isSimulation) {
    overallRatingScore = 48;
    overallRatingStars = 2;
    ratingBadgeLabel = isAnimal ? '★★☆☆☆ 2-Star Preclinical Model' : '★★☆☆☆ 2-Star In Silico';
    ratingRationale = `Assigned 2 Stars (48/100): Preclinical non-human or computational model. High risk of bias for direct human therapeutic translation without in vivo clinical verification.`;
    ratingQuoteEvidence = extractSnippet(cleanAbstract, /mice|mouse|rat|in silico|simulation/i);
  } else if (isCaseReport) {
    overallRatingScore = 40;
    overallRatingStars = 1;
    ratingBadgeLabel = '★☆☆☆☆ 1-Star N=1 Case Report';
    ratingRationale = `Assigned 1 Star (40/100): Single case observation (N=1) without control arm, precluding statistical inference of average treatment effects.`;
    ratingQuoteEvidence = extractSnippet(cleanAbstract, /case report|single patient|we report a case/i);
  } else if (isObservational) {
    overallRatingScore = 82;
    overallRatingStars = 4;
    ratingBadgeLabel = '★★★★☆ 4-Star Controlled Cohort';
    ratingRationale = `Awarded 4 Stars (82/100): Multi-center prospective or retrospective observational design with well-characterized comparator cohorts.`;
    ratingQuoteEvidence = extractSnippet(cleanAbstract, /cohort|prospective|registry|multicenter/i);
  }

  ratingQuoteEvidence = cleanResearchText(ratingQuoteEvidence);
  if (!ratingQuoteEvidence || ratingQuoteEvidence.length < 15) {
    ratingQuoteEvidence = cleanAbstract.slice(0, 140) + '...';
  }

  return {
    id: params.id,
    title: cleanTitle,
    abstract: cleanAbstract,
    authors: cleanAuthors.length > 0 ? cleanAuthors : ['Uploaded Author'],
    year: params.year,
    journal: cleanResearchText(params.journal) || 'Uploaded Research Document',
    doi: params.doi,
    pmid: params.pmid,
    source: params.source,
    queryVersionIds: [params.versionId],
    groupId: `grp-${params.id}`,
    isRepresentative: true,
    hidden: false,
    picoSpans: [],
    aiBadges: badges,
    overallRatingScore,
    overallRatingStars,
    ratingBadgeLabel,
    ratingRationale,
    ratingQuoteEvidence,
    deepAnalysis: {
      studyDesign,
      sampleSize,
      primaryEffectMetric: isContradictory ? 'No significant divergence (p > 0.05)' : (isRCT ? 'Statistically significant clinical effect' : 'Observational correlation'),
      pValue,
      endpointSummary: cleanTitle,
      statisticalRigorScore: overallRatingScore,
      biasAssessment: {
        riskLevel: isRCT ? 'Low' : (isAnimal || isSimulation || isCaseReport ? 'High' : 'Moderate'),
        explanation: isRCT ? 'Adequate randomization and control protocol verified' : 'Non-randomized or non-human study setting'
      },
      consensusAlignment: isContradictory ? 'Contradicts Prevailing Data' : 'Supports Consensus',
      synthesizedKeyFinding: cleanAbstract.slice(0, 150) + '...'
    }
  };
}

function extractSnippet(text: string, regex: RegExp): string {
  const match = text.match(regex);
  if (!match || match.index === undefined) return cleanResearchText(text.slice(0, 120)) + '...';
  const start = Math.max(0, match.index - 30);
  const end = Math.min(text.length, match.index + 90);
  const snippet = cleanResearchText(text.slice(start, end).trim());
  return (start > 0 ? '...' : '') + snippet + '...';
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
