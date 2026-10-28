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
  const [keyphraseInput, setKeyphraseInput] = useState('');
  const [dateStart, setDateStart] = useState('2018');
  const [dateEnd, setDateEnd] = useState('2026');
  const [usePubMed, setUsePubMed] = useState(true);
  const [useEuropePMC, setUseEuropePMC] = useState(true);
  
  const [isCheckingHits, setIsCheckingHits] = useState(false);
  const [estimatedHits, setEstimatedHits] = useState<{ pubmed: number; europePMC: number } | null>(null);

  const handleCheckHits = async () => {
    if (!keyphraseInput.trim()) return;
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
    <div className="space-y-6 text-left">
      
      {/* Search Studio Header */}
      <div className="glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 bg-[#1F140D]/85">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3B2518] text-[#E6E0F0] border border-[#E6E0F0]/20">
                Article Acquisition & Query Studio
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAF9F8] mt-1">
              Add Research Articles to Review Corpus
            </h2>
            <p className="text-xs text-[#A59E98] mt-0.5">
              Upload local citation files (RIS, CSV, BibTeX, PDF) or pull live peer-reviewed records from PubMed and Europe PMC.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#160E08] border border-[#E6E0F0]/15">
              <span className="text-[#8E8680] block text-[10px]">Active Query Version</span>
              <span className="font-bold text-[#FAF9F8]">Version {activeVersion.versionNumber}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#160E08] border border-[#E6E0F0]/15">
              <span className="text-[#8E8680] block text-[10px]">Total Articles in Version</span>
              <span className="font-bold text-[#E6E0F0]">{activeVersion.pulledCount} Papers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E6E0F0]/15 pb-2">
        <button
          onClick={() => setActiveMode('upload')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-[#E5E4E2] text-[#160E08] shadow-md font-bold'
              : 'bg-[#24160E] text-[#B8B3AC] hover:bg-[#341F14] hover:text-[#FAF9F8] border border-[#E6E0F0]/15'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Research Papers (RIS / CSV / BibTeX)</span>
        </button>

        <button
          onClick={() => setActiveMode('search')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'search'
              ? 'bg-[#E5E4E2] text-[#160E08] shadow-md font-bold'
              : 'bg-[#24160E] text-[#B8B3AC] hover:bg-[#341F14] hover:text-[#FAF9F8] border border-[#E6E0F0]/15'
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
          <div className="lg:col-span-2 glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0]/15 bg-[#1F140D]/90 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#FAF9F8] flex items-center space-x-2">
                  <Search className="w-4 h-4 text-[#E6E0F0]" />
                  <span>Multi-Database Search Query</span>
                </h3>
                <p className="text-xs text-[#A59E98] mt-0.5">
                  Construct Boolean queries, inspect live hits across PubMed and Europe PMC, and create query versions.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#3B2518] text-[#E6E0F0] text-xs font-mono font-medium border border-[#E6E0F0]/20">
                Target: Version {queryVersions.length + 1}
              </span>
            </div>

            {/* Query String Input */}
            <div>
              <label className="block text-xs font-medium text-[#FAF9F8] mb-1.5">
                Boolean Query Expression (AND, OR, NOT, Quotes)
              </label>
              <textarea
                value={keyphraseInput}
                onChange={(e) => setKeyphraseInput(e.target.value)}
                rows={3}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#FAF9F8] leading-relaxed resize-none focus:ring-1 focus:ring-[#E6E0F0]"
                placeholder='("targeted intervention" OR "clinical therapy") AND ("target cohort" OR "demographic") AND randomized'
              />
            </div>

            {/* Search Parameters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Range */}
              <div>
                <label className="block text-[11px] font-medium text-[#A59E98] mb-1">Publication Years</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full glass-input rounded-xl px-2.5 py-1.5 text-xs text-center text-[#FAF9F8]"
                    placeholder="2018"
                  />
                  <span className="text-[#8E8680] text-xs">to</span>
                  <input
                    type="text"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full glass-input rounded-xl px-2.5 py-1.5 text-xs text-center text-[#FAF9F8]"
                    placeholder="2026"
                  />
                </div>
              </div>

              {/* Sources Toggle */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[#A59E98] mb-1">Target Live Literature APIs</label>
                <div className="flex items-center space-x-3 pt-1">
                  <label className="flex items-center space-x-1.5 text-xs text-[#FAF9F8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePubMed}
                      onChange={(e) => setUsePubMed(e.target.checked)}
                      className="rounded text-[#E6E0F0] focus:ring-[#E6E0F0]"
                    />
                    <span>PubMed (NCBI E-utilities)</span>
                  </label>

                  <label className="flex items-center space-x-1.5 text-xs text-[#FAF9F8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEuropePMC}
                      onChange={(e) => setUseEuropePMC(e.target.checked)}
                      className="rounded text-[#E6E0F0] focus:ring-[#E6E0F0]"
                    />
                    <span>Europe PMC REST API</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions: Dry-Run Estimation vs Pull */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E0F0]/15">
              <button
                onClick={handleCheckHits}
                disabled={isCheckingHits || !keyphraseInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2B1B12] hover:bg-[#3B2518] text-[#FAF9F8] border border-[#E6E0F0]/25 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#E6E0F0]" />
                <span>{isCheckingHits ? 'Querying Indexes...' : 'Inspect Live Hits'}</span>
              </button>

              <button
                onClick={() => handleExecutePull(false)}
                disabled={isLoading || !keyphraseInput.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E5E4E2] hover:bg-white text-[#160E08] shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>{isLoading ? 'Executing Search Pipeline...' : 'Fetch Live Articles'}</span>
              </button>
            </div>

            {/* Hits Result Pill */}
            {estimatedHits && (
              <div className="p-3.5 rounded-xl bg-[#160E08] border border-[#E6E0F0]/15 flex items-center justify-between text-xs">
                <span className="text-[#C5BFB8]">Found indexed candidate articles:</span>
                <div className="flex items-center space-x-3 font-semibold">
                  <span className="text-sky-300">PubMed: {estimatedHits.pubmed.toLocaleString()}</span>
                  <span className="text-amber-300">Europe PMC: {estimatedHits.europePMC.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Query Version History */}
          <div className="glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 bg-[#1F140D]/80 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0F0]/15 pb-2">
              <span className="text-xs font-bold text-[#FAF9F8] flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E6E0F0]" />
                <span>Query Version Timeline</span>
              </span>
              <span className="text-[10px] font-mono text-[#8E8680]">
                {queryVersions.length} Recorded
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {queryVersions.map((qv) => {
                const isSelected = qv.id === activeVersion.id;
                return (
                  <div
                    key={qv.id}
                    onClick={() => onSelectVersion(qv.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#2D1B12] border-[#E6E0F0]/40 shadow-sm'
                        : 'bg-[#180E08] border-[#E6E0F0]/10 hover:border-[#E6E0F0]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#FAF9F8]">
                        Version {qv.versionNumber}: {qv.label}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-[11px] text-[#A59E98] truncate">
                      {qv.queryString || 'Uploaded Citation Corpus'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8E8680] mt-2 pt-1.5 border-t border-[#E6E0F0]/10">
                      <span>{qv.pulledCount} articles stored</span>
                      <span>{qv.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
