import React, { useState } from 'react';
import { 
  Search, 
  Upload,
  Plus, 
  DownloadCloud, 
  Database, 
  Layers, 
  Calendar, 
  Filter, 
  Sparkles, 
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { QueryVersion, ReviewQuestion, ResearchPaper } from '../types';
import { searchPubMedHitCount, searchEuropePMCHitCount } from '../services/apiClient';
import { FileUploadDesk } from './FileUploadDesk';

interface SearchStudioProps {
  reviewQuestion: ReviewQuestion;
  queryVersions: QueryVersion[];
  activeVersion: QueryVersion;
  onRunSearchAndFetch: (
    query: string, 
    sources: ('pubmed' | 'europe_pmc')[], 
    dateStart?: string, 
    dateEnd?: string,
    useFullCorpusBenchmark?: boolean
  ) => Promise<void>;
  onSelectVersion: (versionId: string) => void;
  onAddPapers: (papers: ResearchPaper[]) => void;
  isLoading: boolean;
}

export const SearchStudio: React.FC<SearchStudioProps> = ({
  reviewQuestion,
  queryVersions,
  activeVersion,
  onRunSearchAndFetch,
  onSelectVersion,
  onAddPapers,
  isLoading
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'search'>('upload');
  const [keyphraseInput, setKeyphraseInput] = useState(
    reviewQuestion.intervention 
      ? `"${reviewQuestion.population}" AND "${reviewQuestion.intervention}"`
      : ''
  );
  const [dateStart, setDateStart] = useState('2018');
  const [dateEnd, setDateEnd] = useState('2026');
  const [usePubMed, setUsePubMed] = useState(true);
  const [useEuropePMC, setUseEuropePMC] = useState(true);
  
  const [isCheckingHits, setIsCheckingHits] = useState(false);
  const [estimatedHits, setEstimatedHits] = useState<{ pubmed: number; europePMC: number } | null>({
    pubmed: 1420,
    europePMC: 890
  });

  const handleCheckHits = async () => {
    setIsCheckingHits(true);
    try {
      const pmHits = usePubMed ? await searchPubMedHitCount(keyphraseInput) : 0;
      const epmcHits = useEuropePMC ? await searchEuropePMCHitCount(keyphraseInput) : 0;
      setEstimatedHits({ pubmed: pmHits, europePMC: epmcHits });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingHits(false);
    }
  };

  const handleExecutePull = async (loadBenchmark: boolean = false) => {
    const sources: ('pubmed' | 'europe_pmc')[] = [];
    if (usePubMed) sources.push('pubmed');
    if (useEuropePMC) sources.push('europe_pmc');

    await onRunSearchAndFetch(keyphraseInput, sources, dateStart, dateEnd, loadBenchmark);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Review Question Summary */}
      <div className="glass-panel rounded-2xl p-5 border border-[#E6E0F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#6F4E37] text-white">
                Protocol
              </span>
              <h2 className="text-sm font-semibold text-[#462E1E]">Active Systematic Review Protocol</h2>
            </div>
            <p className="text-xs text-[#5F5C56] mt-1 max-w-3xl leading-relaxed">
              <strong>Question:</strong> {reviewQuestion.question}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white/70 border border-[#E6E0F0] text-[#462E1E]">
              <strong>P:</strong> {reviewQuestion.population}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/70 border border-[#E6E0F0] text-[#6F4E37]">
              <strong>I:</strong> {reviewQuestion.intervention}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/70 border border-[#E6E0F0] text-[#7E7A72]">
              <strong>C:</strong> {reviewQuestion.comparator}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/70 border border-[#E6E0F0] text-[#5A3D29]">
              <strong>O:</strong> {reviewQuestion.outcome}
            </span>
          </div>
        </div>
      </div>

      {/* Ingestion Mode Selector (Upload Files vs Live Search) */}
      <div className="flex items-center space-x-2 border-b border-[#E6E0F0] pb-2">
        <button
          onClick={() => setActiveMode('upload')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeMode === 'upload'
              ? 'bg-[#6F4E37] text-white shadow-sm'
              : 'bg-white/70 text-[#5F5C56] hover:bg-white border border-[#E5E4E2]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Research Papers (RIS / CSV / BibTeX)</span>
        </button>

        <button
          onClick={() => setActiveMode('search')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeMode === 'search'
              ? 'bg-[#6F4E37] text-white shadow-sm'
              : 'bg-white/70 text-[#5F5C56] hover:bg-white border border-[#E5E4E2]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Live API Search (PubMed & Europe PMC)</span>
        </button>
      </div>

      {activeMode === 'upload' ? (
        <FileUploadDesk onAddPapers={onAddPapers} activeVersionId={activeVersion.id} />
      ) : (
        /* Main Search Builder Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Query Builder & Fetcher */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#462E1E] flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#6F4E37]" />
                <span>Multi-Database Search Query</span>
              </h3>
              <p className="text-xs text-[#7E7A72] mt-0.5">
                Construct Boolean queries, inspect live hits across PubMed and Europe PMC, and create query versions.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-[#E6E0F0] text-[#5A3D29] text-xs font-mono font-medium border border-[#d4c8e4]">
              Target: Version {queryVersions.length + 1}
            </span>
          </div>

          {/* Query String Input */}
          <div>
            <label className="block text-xs font-medium text-[#462E1E] mb-1.5">
              Boolean Query Expression (AND, OR, NOT, Quotes)
            </label>
            <textarea
              value={keyphraseInput}
              onChange={(e) => setKeyphraseInput(e.target.value)}
              rows={3}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#2D2521] leading-relaxed resize-none focus:ring-1 focus:ring-[#6F4E37]"
              placeholder='e.g., ("targeted therapy" OR "intervention") AND ("condition" OR "disease") AND placebo'
            />
          </div>

          {/* Search Parameters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date Range */}
            <div>
              <label className="block text-[11px] font-medium text-[#5F5C56] mb-1">Publication Years</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full glass-input rounded-xl px-2.5 py-1.5 text-xs text-center"
                  placeholder="2018"
                />
                <span className="text-[#B8B5AE] text-xs">to</span>
                <input
                  type="text"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full glass-input rounded-xl px-2.5 py-1.5 text-xs text-center"
                  placeholder="2026"
                />
              </div>
            </div>

            {/* Sources Toggle */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#5F5C56] mb-1">Target Live Literature APIs</label>
              <div className="flex items-center space-x-3 pt-1">
                <label className="flex items-center space-x-1.5 text-xs text-[#462E1E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePubMed}
                    onChange={(e) => setUsePubMed(e.target.checked)}
                    className="rounded text-[#6F4E37] focus:ring-[#6F4E37]"
                  />
                  <span>PubMed (NCBI E-utilities)</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-[#462E1E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useEuropePMC}
                    onChange={(e) => setUseEuropePMC(e.target.checked)}
                    className="rounded text-[#6F4E37] focus:ring-[#6F4E37]"
                  />
                  <span>Europe PMC REST</span>
                </label>
              </div>
            </div>
          </div>

          {/* Hit Counts Box */}
          <div className="bg-[#FAF9FD] rounded-xl p-3.5 border border-[#E6E0F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#462E1E] flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-[#6F4E37]" />
                <span>Live Pre-Search Hit Count</span>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-xs text-[#5F5C56]">
                <span>PubMed hits: <strong className="text-[#6F4E37]">{estimatedHits ? estimatedHits.pubmed.toLocaleString() : '...'}</strong></span>
                <span>Europe PMC hits: <strong className="text-[#6F4E37]">{estimatedHits ? estimatedHits.europePMC.toLocaleString() : '...'}</strong></span>
              </div>
            </div>

            <button
              onClick={handleCheckHits}
              disabled={isCheckingHits}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-[#6F4E37] border border-[#E6E0F0] hover:bg-[#FAF9FD] shadow-sm transition-all"
            >
              {isCheckingHits ? 'Checking APIs...' : 'Refresh Hit Counts'}
            </button>
          </div>

          {/* Action Button: Live Ingest */}
          <div className="pt-2 flex items-center">
            <button
              onClick={() => handleExecutePull(false)}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all"
            >
              <DownloadCloud className="w-4 h-4 text-[#E6E0F0]" />
              <span>{isLoading ? 'Executing Fetch & Deduplication...' : 'Pull Live Search Results & Ingest'}</span>
            </button>
          </div>

          <div className="text-[11px] text-[#7E7A72] flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Meets NCBI EFetch requirements (email attribution & respectful batch querying).</span>
          </div>
        </div>

        {/* Right Column: Query Version History (Database Provenance & Immutability) */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#462E1E] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#6F4E37]" />
                <span>Query Versions (Level 2)</span>
              </h3>
              <span className="text-[11px] text-[#7E7A72]">
                {queryVersions.length} versions
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {queryVersions.map((qv) => {
                const isSelected = qv.id === activeVersion.id;
                return (
                  <div
                    key={qv.id}
                    onClick={() => onSelectVersion(qv.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#6F4E37] shadow-sm'
                        : 'bg-white/60 hover:bg-white border-[#E5E4E2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#462E1E]">
                        Version {qv.versionNumber}
                      </span>
                      <span className="text-[10px] text-[#7E7A72] font-mono">
                        {qv.createdAt}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5F5C56] line-clamp-2 font-mono bg-[#FAF9FD] p-1.5 rounded border border-[#E6E0F0]">
                      {qv.queryString}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#7E7A72]">
                      <span>Pulled: <strong className="text-[#6F4E37]">{qv.pulledCount.toLocaleString()}</strong></span>
                      <span className="text-[10px] bg-[#E6E0F0] text-[#5A3D29] px-2 py-0.5 rounded-full font-medium">
                        {isSelected ? 'Active' : 'Reopen'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E6E0F0] text-[11px] text-[#7E7A72] flex items-start space-x-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#6F4E37] shrink-0 mt-0.5" />
            <span>
              <strong>Database Immutability Rule:</strong> Nothing is ever deleted. Old versions remain preserved and can be inspected anytime.
            </span>
          </div>

        </div>
      </div>
    )}

  </div>
);
};
