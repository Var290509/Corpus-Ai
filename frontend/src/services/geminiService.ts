import { ExtractedSubtopic } from '../types';
import { getSubtopicClinicalReason } from './fileParser';

export const DEFAULT_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export function getGeminiApiKey(): string {
  try {
    return (
      localStorage.getItem('corpus_gemini_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ''
    );
  } catch {
    return '';
  }
}

export function setGeminiApiKey(key: string): void {
  try {
    localStorage.setItem('corpus_gemini_api_key', key.trim());
  } catch (e) {
    console.warn('Could not store Gemini API key:', e);
  }
}

export interface GeminiSortResult {
  sortedSubtopics: ExtractedSubtopic[];
  aiSummary: string;
  isAiPowered: boolean;
}

/**
 * Calls Google Gemini (gemini-3.5-flash-lite) to prioritize, score, and rank
 * subtopics in order of clinical and systematic review relevance.
 */
export async function sortSubtopicsWithGemini(
  title: string,
  abstract: string,
  subtopics: ExtractedSubtopic[],
  customKey?: string
): Promise<GeminiSortResult> {
  const apiKey = (customKey || getGeminiApiKey()).trim();

  if (!subtopics || subtopics.length === 0) {
    return {
      sortedSubtopics: [],
      aiSummary: 'No subtopics available to sort.',
      isAiPowered: false
    };
  }

  const prompt = `You are an expert biomedical systematic literature review AI.
Given this research study:
Title: "${title}"
Abstract: "${abstract.slice(0, 1500)}"

Analyze the study and evaluate these extracted subtopics:
${JSON.stringify(subtopics.map(s => ({ name: s.name, category: s.category })))}

Your tasks:
1. Ensure the subtopics are strictly accurate, clinically sound, and directly reflect the uploaded research paper.
2. Sort them in order of clinical and systematic review priority:
   - Rank 1: Primary Pathological Condition & Clinical Outcomes
   - Rank 2: Diagnostic Biomarkers & Quantitative Laboratory Parameters
   - Rank 3: Target Patient Population & Demographics
   - Rank 4: Study Design & Methodology
3. Assign each subtopic:
   - "name": Concise, accurate subtopic name
   - "category": "Condition" | "Biomarkers" | "Population" | "Methodology" | "Outcomes"
   - "relevanceScore": integer 60-100 (exact clinical importance to this specific paper)
   - "priority": "High" | "Medium" | "Low"
   - "recommendation": "Include" | "Exclude" | "Maybe" (whether this subtopic warrants inclusion in a systematic review of this study)
   - "reasoning": A UNIQUE, DISTINCT, EASY-TO-UNDERSTAND clinical explanation (1-2 sentences) explaining WHY this priority badge and score was given, and what role this topic plays in the study. DO NOT use generic or repeated phrases. Every single topic MUST receive a different substantive reason.

Return ONLY a valid JSON array of objects with keys:
"name", "category", "priority", "relevanceScore", "recommendation", "reasoning".`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with original subtopics preserving user decisions
          const originalMap = new Map<string, ExtractedSubtopic>();
          subtopics.forEach(s => originalMap.set(s.name.toLowerCase().trim(), s));

          const sortedSubtopics: ExtractedSubtopic[] = parsed.map((item: any, idx: number) => {
            const cleanName = item.name?.trim() || 'Subtopic';
            const original = originalMap.get(cleanName.toLowerCase()) || 
              subtopics.find(s => s.name.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(s.name.toLowerCase()));
            
            const cleanReason = (item.reasoning && item.reasoning.length > 20 && !item.reasoning.includes('clinical and methodological alignment'))
              ? item.reasoning
              : (original?.aiReasoning || getSubtopicClinicalReason(cleanName, item.category || 'Condition', title));

            return {
              id: original?.id || `sub-${idx}-${Date.now()}`,
              name: cleanName,
              category: item.category || original?.category || 'Condition',
              relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 85,
              aiPriority: item.priority || 'Medium',
              recommendation: item.recommendation || 'Include',
              aiReasoning: cleanReason,
              userDecision: original?.userDecision || (item.recommendation === 'Exclude' ? 'excluded' : 'included')
            };
          });

          // Add any missing subtopics that the model may have omitted
          subtopics.forEach(orig => {
            if (!sortedSubtopics.some(s => s.name.toLowerCase().trim() === orig.name.toLowerCase().trim())) {
              sortedSubtopics.push({
                ...orig,
                relevanceScore: 75,
                aiPriority: 'Medium',
                aiReasoning: orig.aiReasoning || getSubtopicClinicalReason(orig.name, orig.category, title),
                userDecision: orig.userDecision || 'neutral'
              });
            }
          });

          return {
            sortedSubtopics,
            aiSummary: `AI ranked ${sortedSubtopics.length} subtopics by clinical relevance, prioritizing primary disease pathology and biomarker endpoints.`,
            isAiPowered: true
          };
        }
      }
    }
    console.warn('[Gemini API] Response not OK, falling back to local heuristic ranking:', response.status);
  } catch (err) {
    console.warn('[Gemini API] Request error, falling back to local heuristic ranking:', err);
  }

  // Fallback: Local Semantic & Clinical Hierarchy Sorter (Offline / Rate-Limit Safe)
  const categoryWeights: Record<string, number> = {
    'Condition': 95,
    'Outcomes': 90,
    'Biomarkers': 85,
    'Population': 75,
    'Methodology': 65,
    'Pharmacology': 80
  };

  const sortedSubtopics: ExtractedSubtopic[] = [...subtopics].sort((a, b) => {
    const scoreA = (a.relevanceScore ?? categoryWeights[a.category] ?? 70);
    const scoreB = (b.relevanceScore ?? categoryWeights[b.category] ?? 70);
    return scoreB - scoreA;
  }).map((s, idx) => ({
    ...s,
    relevanceScore: s.relevanceScore ?? Math.max(50, 96 - idx * 4),
    aiPriority: (idx < 2 ? 'High' : (idx < 4 ? 'Medium' : 'Low')) as any,
    recommendation: s.category === 'Methodology' && s.name.toLowerCase().includes('observational') ? 'Maybe' : 'Include',
    aiReasoning: (s.aiReasoning && !s.aiReasoning.includes('hierarchy') && !s.aiReasoning.includes('clinical and methodological alignment'))
      ? s.aiReasoning
      : getSubtopicClinicalReason(s.name, s.category, title),
    userDecision: s.userDecision || 'neutral'
  }));

  return {
    sortedSubtopics,
    aiSummary: `AI ranked ${sortedSubtopics.length} subtopics by clinical priority (Conditions and Outcomes prioritized).`,
    isAiPowered: false
  };
}
