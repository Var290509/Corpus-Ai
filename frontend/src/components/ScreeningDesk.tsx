import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';
import { ResearchPaper, ReviewerDecision, AIBadge, Criterion } from '../types';
import { PaperCard } from './PaperCard';

interface ScreeningDeskProps {
  papers: ResearchPaper[];
  decisions: Record<string, ReviewerDecision>;
  onDecide: (paperId: string, status: 'include' | 'exclude' | 'maybe', reason?: string, note?: string) => void;
  onInspectBadge: (badge: AIBadge, paper: ResearchPaper) => void;
  onDiscoverSimilar?: (paper: ResearchPaper) => void;
  onRunBatchAutoScreen: () => void;
  activeCriteria: Criterion[];
}

export const ScreeningDesk: React.FC<ScreeningDeskProps> = ({
  papers,
  decisions,
  onDecide,
  onInspectBadge,
  onDiscoverSimilar,
  onRunBatchAutoScreen,
  activeCriteria
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'include' | 'exclude' | 'maybe' | 'unscreened'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter papers (only show representative records; duplicates are safely grouped and hidden)
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Must be representative
      if (!paper.isRepresentative) return false;

      // Status filter
      const dec = decisions[paper.id]?.status || 'unscreened';
      if (statusFilter !== 'all' && dec !== statusFilter) return false;

      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = 
          paper.title.toLowerCase().includes(q) ||
          paper.abstract.toLowerCase().includes(q) ||
          paper.authors.some(a => a.toLowerCase().includes(q)) ||
          paper.journal.toLowerCase().includes(q) ||
          (paper.extractedTopics && paper.extractedTopics.some(t => t.toLowerCase().includes(q))) ||
          (paper.pmid && paper.pmid.includes(q)) ||
          (paper.doi && paper.doi.toLowerCase().includes(q));
        if (!textMatch) return false;
      }

      return true;
    });
  }, [papers, decisions, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / pageSize));
  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPapers.slice(start, start + pageSize);
  }, [filteredPapers, currentPage, pageSize]);

  // Summary counts
  const totalRepresentative = papers.filter(p => p.isRepresentative).length;
  const includedCount = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'include').length;
  const excludedCount = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'exclude').length;
  const maybeCount = papers.filter(p => p.isRepresentative && decisions[p.id]?.status === 'maybe').length;
  const unscreenedCount = papers.filter(p => p.isRepresentative && (!decisions[p.id] || decisions[p.id]?.status === 'unscreened')).length;

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Controls & Metrics Bar */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-[#D4C4E2] space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#201035] flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#2E1945]" />
              <span>Deduplication, Screening & PICO Tagging</span>
            </h2>
            <p className="text-xs text-[#7E7A72] mt-0.5">
              Review records, inspect analyzed subtopics, override automated decisions, and verify PICO spans.
            </p>
          </div>

          {/* Batch Auto-Screen Button */}
          <button
            onClick={onRunBatchAutoScreen}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2E1945] text-white hover:bg-[#2B1544] shadow-md shadow-[#2E1945]/20 transition-all shrink-0"
          >
            <Bot className="w-4 h-4 text-[#D4C4E2]" />
            <span>Auto-Screen All via Protocol Rules</span>
          </button>
        </div>

        {/* Status Count Tally Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D4C4E2]">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-[#2E1945] text-white shadow-xs'
                : 'bg-white/80 text-[#5F5C56] hover:bg-white border border-[#FAF5FF]'
            }`}
          >
            All Screenable ({totalRepresentative})
          </button>

          <button
            onClick={() => { setStatusFilter('include'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              statusFilter === 'include'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/80 text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Included ({includedCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('exclude'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              statusFilter === 'exclude'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white/80 text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Excluded ({excludedCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('maybe'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              statusFilter === 'maybe'
                ? 'bg-[#8169A3] text-white shadow-xs'
                : 'bg-white/80 text-[#8169A3] hover:bg-[#FAF9FD] border border-[#d4c8e4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8169A3]" />
            <span>Maybe ({maybeCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('unscreened'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              statusFilter === 'unscreened'
                ? 'bg-[#5F5C56] text-white shadow-xs'
                : 'bg-white/80 text-[#7E7A72] hover:bg-white border border-[#FAF5FF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B8B5AE]" />
            <span>Unscreened ({unscreenedCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7E7A72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search across title, abstract, authors, subtopics, DOI or PMID..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2521] placeholder-[#9B978F]"
            />
          </div>
        </div>

      </div>

      {/* Showing Count & Pagination Header */}
      <div className="flex items-center justify-between text-xs text-[#7E7A72]">
        <span>
          Showing <strong>{filteredPapers.length}</strong> matching studies (Page {currentPage} of {totalPages})
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white border border-[#FAF5FF] disabled:opacity-40 text-[#201035] hover:bg-[#FAF9FD]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs font-semibold px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white border border-[#FAF5FF] disabled:opacity-40 text-[#201035] hover:bg-[#FAF9FD]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Papers Stream */}
      <div className="space-y-4">
        {paginatedPapers.map((paper) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            decision={decisions[paper.id]}
            onDecide={onDecide}
            onInspectBadge={onInspectBadge}
            onDiscoverSimilar={onDiscoverSimilar}
          />
        ))}

        {paginatedPapers.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center border border-[#D4C4E2]">
            <Layers className="w-10 h-10 text-[#2E1945]/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#201035]">
              {papers.length === 0 ? 'No Research Papers Ingested Yet' : 'No research papers match the current filters'}
            </p>
            <p className="text-xs text-[#7E7A72] mt-1 max-w-md mx-auto">
              {papers.length === 0
                ? 'Navigate to the "Search & Upload" tab to upload your research files (RIS, CSV, BibTeX) or run a live literature search.'
                : 'Try resetting the status filters or search query above.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#FAF5FF] text-xs text-[#201035] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-[#5F5C56]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#FAF5FF] text-xs text-[#201035] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};
