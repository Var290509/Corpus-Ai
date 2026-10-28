import React, { useState } from 'react';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  Quote, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  PieChart, 
  BarChart, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ResearchPaper, RAGSynthesisQuery } from '../types';
import { AgenticRAGSynthesizer } from '../services/agenticRAG';

interface AgenticRAGDeskProps {
  papers: ResearchPaper[];
}

export const AgenticRAGDesk: React.FC<AgenticRAGDeskProps> = ({ papers }) => {
  const [inputText, setInputText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [queriesHistory, setQueriesHistory] = useState<RAGSynthesisQuery[]>([]);

  // Default suggested research prompts for judges & reviewers
  const suggestedQueries = [
    "What are the safety and tolerability signals regarding gastrointestinal adverse events?",
    "Which trials showed divergent or null cognitive effects and what were their methodological limitations?",
    "Synthesize the biological impact on CSF p-tau181 and hippocampal MRI volumetry.",
    "Compare effect sizes between oral semaglutide and subcutaneous liraglutide."
  ];

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    setInputText('');

    try {
      const synthesizer = new AgenticRAGSynthesizer(papers);
      const result = await synthesizer.answerResearchQuery(queryText);
      setQueriesHistory(prev => [result, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner: The Innovation Showcase */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#6F4E37] text-[#E6E0F0]">
                Innovative Feature (Beyond Rayyan AI)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                Agentic RAG Active
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#462E1E] mt-1.5 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#6F4E37]" />
              <span>Autonomous Deep Analysis & Agentic RAG Copilot</span>
            </h2>
            <p className="text-xs text-[#5F5C56] mt-1 max-w-2xl leading-relaxed">
              Unlike Rayyan (which only screens surface-level titles and abstracts), Corpus AI performs 
              <strong> deep data analysis across the total text</strong>. It extracts quantitative sample powers ($N$), hazard ratios, 
              detects cross-study contradictions, and synthesizes evidence matrices across {papers.length.toLocaleString()} research papers.
            </p>
          </div>

          {/* Quick Corpus Metrics Pill */}
          <div className="flex items-center space-x-3 bg-white/70 p-3 rounded-xl border border-[#E6E0F0] text-xs">
            <div className="text-center px-2">
              <span className="text-[10px] text-[#7E7A72] block font-mono">Total Corpus</span>
              <span className="font-bold text-[#462E1E] text-sm">{papers.length.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-[#E5E4E2]" />
            <div className="text-center px-2">
              <span className="text-[10px] text-[#7E7A72] block font-mono">RCTs Indexed</span>
              <span className="font-bold text-[#6F4E37] text-sm">
                {papers.filter(p => p.aiBadges?.some(b => b.type === 'rct_gold')).length}
              </span>
            </div>
            <div className="h-6 w-px bg-[#E5E4E2]" />
            <div className="text-center px-2">
              <span className="text-[10px] text-[#7E7A72] block font-mono">Divergent Studies</span>
              <span className="font-bold text-rose-600 text-sm">
                {papers.filter(p => p.aiBadges?.some(b => b.type === 'contradiction')).length}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Query Chips */}
        <div className="mt-4 pt-3 border-t border-[#E6E0F0]">
          <span className="text-[11px] font-mono text-[#7E7A72] uppercase block mb-2">
            Click to run sample multi-hop synthesis queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleRunQuery(q)}
                disabled={isSynthesizing}
                className="text-left px-3 py-1.5 rounded-xl text-xs bg-white/80 hover:bg-[#FAF9FD] text-[#462E1E] border border-[#E6E0F0] hover:border-[#6F4E37] shadow-2xs transition-all flex items-center space-x-1.5 group"
              >
                <Sparkles className="w-3 h-3 text-[#6F4E37] group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-md">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[#E6E0F0]">
        <div className="flex items-center space-x-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunQuery(inputText);
              }
            }}
            placeholder="Ask the Autonomous Agent to synthesize anything across the entire research corpus... (Press Enter to query)"
            rows={2}
            className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-[#2D2521] placeholder-[#9B978F] resize-none focus:ring-1 focus:ring-[#6F4E37]"
          />
          <button
            onClick={() => handleRunQuery(inputText)}
            disabled={!inputText.trim() || isSynthesizing}
            className="h-12 px-5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3D29] text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-[#6F4E37]/20 transition-all disabled:opacity-50"
          >
            <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Synthesis Results Stream */}
      <div className="space-y-6">
        {queriesHistory.map((queryResult) => (
          <div 
            key={queryResult.id} 
            className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-5 animate-fade-in shadow-glass"
          >
            {/* Header: Question & Consensus Breakdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E6E0F0] gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#7E7A72]">Research Query</span>
                <h3 className="text-base font-semibold text-[#462E1E] mt-0.5">
                  "{queryResult.question}"
                </h3>
              </div>

              {/* Consensus Meter */}
              <div className="flex items-center space-x-3 bg-white/80 px-3.5 py-1.5 rounded-xl border border-[#E6E0F0] text-xs">
                <span className="text-[10px] uppercase font-mono text-[#7E7A72]">Consensus:</span>
                <span className="text-emerald-700 font-semibold flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {queryResult.consensusSummary.supportingCount} Supporting
                </span>
                <span className="text-rose-600 font-semibold flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {queryResult.consensusSummary.opposingCount} Divergent
                </span>
              </div>
            </div>

            {/* Synthesized Answer (Markdown styled) */}
            <div className="text-xs text-[#2D2521] leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-xl border border-[#E5E4E2]">
              {queryResult.answer}
            </div>

            {/* Extracted Evidence Quotes with Citations */}
            <div>
              <span className="text-xs font-semibold text-[#462E1E] flex items-center space-x-1.5 mb-2.5">
                <Quote className="w-3.5 h-3.5 text-[#6F4E37]" />
                <span>Extracted Multi-Hop Evidence Passages ({queryResult.evidenceQuotes.length} Citations)</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queryResult.evidenceQuotes.map((ev, idx) => (
                  <div key={idx} className="bg-white/90 p-3 rounded-xl border border-[#E6E0F0] text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#6F4E37] truncate max-w-[200px]" title={ev.paperTitle}>
                        {ev.paperTitle}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E6E0F0] text-[#5A3D29]">
                        Match: {ev.relevanceScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5A3D29] italic leading-snug">
                      "{ev.quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

        {queriesHistory.length === 0 && (
          <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-[#d4c8e4]">
            <Cpu className="w-10 h-10 text-[#6F4E37]/50 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#462E1E]">Autonomous Synthesizer Ready</h4>
            <p className="text-xs text-[#7E7A72] max-w-md mx-auto mt-1">
              Select one of the sample prompt chips above or type a research question to analyze the active {papers.length.toLocaleString()} research records.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
