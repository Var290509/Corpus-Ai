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

  // Universal research synthesis queries
  const suggestedQueries = [
    "Synthesize the primary clinical endpoints and statistical significance across all studies.",
    "Which studies report divergent, inconclusive, or conflicting findings?",
    "Summarize safety signals, adverse event profiles, and treatment discontinuation rates.",
    "Compare sample size power and risk-of-bias across all randomized clinical trials."
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
      
      {/* Top Banner: The Autonomous Synthesis Showcase */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#D4C4E2]/20 relative overflow-hidden bg-[#13091F]/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#24143D] text-[#D4C4E2] border border-[#D4C4E2]/20">
                Autonomous Deep Synthesis
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                Agentic RAG Active
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#FAF5FF] mt-1.5 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-300" />
              <span>Autonomous Deep Analysis & Agentic RAG Copilot</span>
            </h2>
            <p className="text-xs text-[#FAF5FF]/80 mt-1 max-w-2xl leading-relaxed">
              Corpus AI performs <strong>deep automated evidence synthesis across the complete text</strong>. It extracts quantitative sample powers ($N$), hazard ratios, detects cross-study contradictions, and synthesizes evidence matrices across {papers.length.toLocaleString()} research papers.
            </p>
          </div>

          {/* Quick Corpus Metrics Pill */}
          <div className="flex items-center space-x-3 bg-[#13091F]/90 p-3 rounded-xl border border-[#D4C4E2]/20 text-xs">
            <div className="text-center px-2">
              <span className="text-[10px] text-[#FAF5FF]/70 block font-mono">Total Corpus</span>
              <span className="font-bold text-[#FAF5FF] text-sm">{papers.length.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-[#D4C4E2]/20" />
            <div className="text-center px-2">
              <span className="text-[10px] text-[#FAF5FF]/70 block font-mono">RCTs Indexed</span>
              <span className="font-bold text-amber-300 text-sm">
                {papers.filter(p => p.aiBadges?.some(b => b.type === 'rct_gold')).length}
              </span>
            </div>
            <div className="h-6 w-px bg-[#D4C4E2]/20" />
            <div className="text-center px-2">
              <span className="text-[10px] text-[#FAF5FF]/70 block font-mono">Divergent Studies</span>
              <span className="font-bold text-rose-400 text-sm">
                {papers.filter(p => p.aiBadges?.some(b => b.type === 'contradiction')).length}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Query Chips */}
        <div className="mt-4 pt-3 border-t border-[#D4C4E2]/15">
          <span className="text-[11px] font-mono text-[#FAF5FF]/70 uppercase block mb-2">
            Click to run sample multi-hop synthesis queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleRunQuery(q)}
                disabled={isSynthesizing}
                className="text-left px-3 py-1.5 rounded-xl text-xs bg-[#13091F] hover:bg-[#24143D] text-[#FAF5FF] border border-[#D4C4E2]/20 hover:border-[#D4C4E2]/40 shadow-sm transition-all flex items-center space-x-1.5 group cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-md">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D4C4E2]/20 bg-[#13091F]/90">
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
            className="flex-1 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF5FF] placeholder-[#FAF5FF]/50 bg-[#13091F] border border-[#D4C4E2]/20 resize-none focus:outline-none focus:ring-1 focus:ring-[#D4C4E2]/50"
          />
          <button
            onClick={() => handleRunQuery(inputText)}
            disabled={!inputText.trim() || isSynthesizing}
            className="h-12 px-5 rounded-xl bg-[#FAF5FF] hover:bg-white text-[#13091F] text-xs font-bold flex items-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize'}</span>
            <Send className="w-3.5 h-3.5 text-[#13091F]" />
          </button>
        </div>
      </div>

      {/* Synthesis Results Stream */}
      <div className="space-y-6">
        {queriesHistory.map((queryResult) => (
          <div 
            key={queryResult.id} 
            className="glass-panel-elevated rounded-2xl p-6 border border-[#D4C4E2]/20 space-y-5 animate-fade-in shadow-xl bg-[#13091F]/95"
          >
            {/* Header: Question & Consensus Breakdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D4C4E2]/15 gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#FAF5FF]/60">Research Query</span>
                <h3 className="text-base font-semibold text-[#FAF5FF] mt-0.5">
                  "{queryResult.question}"
                </h3>
              </div>

              {/* Consensus Meter */}
              <div className="flex items-center space-x-3 bg-[#13091F] px-3.5 py-1.5 rounded-xl border border-[#D4C4E2]/20 text-xs">
                <span className="text-[10px] uppercase font-mono text-[#FAF5FF]/60">Consensus:</span>
                <span className="text-emerald-400 font-semibold flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {queryResult.consensusSummary.supportingCount} Supporting
                </span>
                <span className="text-rose-400 font-semibold flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {queryResult.consensusSummary.opposingCount} Divergent
                </span>
              </div>
            </div>

            {/* Synthesized Answer (Markdown styled) */}
            <div className="text-xs text-[#FAF5FF] leading-relaxed whitespace-pre-line bg-[#13091F] p-4 rounded-xl border border-[#D4C4E2]/15">
              {queryResult.answer}
            </div>

            {/* Extracted Evidence Quotes with Citations */}
            <div>
              <span className="text-xs font-semibold text-[#FAF5FF] flex items-center space-x-1.5 mb-2.5">
                <Quote className="w-3.5 h-3.5 text-amber-300" />
                <span>Extracted Multi-Hop Evidence Passages ({queryResult.evidenceQuotes.length} Citations)</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queryResult.evidenceQuotes.map((ev, idx) => (
                  <div key={idx} className="bg-[#13091F] p-3 rounded-xl border border-[#D4C4E2]/15 text-xs space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-amber-300 truncate max-w-[200px]" title={ev.paperTitle}>
                        {ev.paperTitle}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#24143D] text-[#D4C4E2] border border-[#D4C4E2]/20">
                        Match: {ev.relevanceScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#FAF5FF]/90 italic leading-snug">
                      "{ev.quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

        {queriesHistory.length === 0 && (
          <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-[#D4C4E2]/25 bg-[#13091F]/50">
            <Cpu className="w-10 h-10 text-amber-300/60 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#FAF5FF]">Autonomous Synthesizer Ready</h4>
            <p className="text-xs text-[#FAF5FF]/70 max-w-md mx-auto mt-1">
              Select one of the sample prompt chips above or type a research question to analyze the active {papers.length.toLocaleString()} research records.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
