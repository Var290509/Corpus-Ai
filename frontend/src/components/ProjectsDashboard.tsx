import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Folder, 
  FileText, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Trash2, 
  LogOut,
  Upload,
  CheckCircle2,
  Sparkles,
  Users,
  X,
  Edit3,
  ChevronRight,
  Shield,
  Cloud,
  UserPlus,
  Star,
  Award,
  Check
} from 'lucide-react';
import { Project, User, ReviewMember, ResearchPaper } from '../types';
import { firestoreService } from '../services/firestoreService';
import { parseUploadedFile } from '../services/fileParser';
import gsap from 'gsap';

interface ProjectsDashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onLogout: () => void;
}

// Standard Systematic & Literature Review Types
const STANDARD_REVIEW_TYPES = [
  'Not applicable',
  'Systematic review',
  'Literature review',
  'Umbrella review',
  'Scoping review',
  'Rapid review',
  'Qualitative review',
  'State of the art review',
  'Mixed study review',
  'Meta-analysis'
];
const RAYYAN_REVIEW_TYPES = STANDARD_REVIEW_TYPES;

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  user,
  projects,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onLogout
}) => {
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Edit Project Modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('Literature review');
  const [editDomain, setEditDomain] = useState('Biomedical');

  // Manage Members Modal state
  const [managingMembersProject, setManagingMembersProject] = useState<Project | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Reviewer' | 'Collaborator' | 'Viewer'>('Reviewer');

  // Create form states
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewType, setReviewType] = useState('Literature review');
  const [reviewDomain, setReviewDomain] = useState('Biomedical');
  const [description, setDescription] = useState('');
  
  // Uploaded articles during creation (Step 2)
  const [uploadedArticles, setUploadedArticles] = useState<ResearchPaper[]>([]);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Members during creation (Step 3)
  const [membersList, setMembersList] = useState<ReviewMember[]>([
    {
      id: `mem-${Date.now()}`,
      name: user.name || 'Current User',
      email: user.email || 'user@corpus.ai',
      role: 'Owner',
      joinedAt: new Date().toLocaleDateString()
    }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Reviewer' | 'Collaborator' | 'Viewer'>('Reviewer');

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const createModalRef = useRef<HTMLDivElement>(null);

  // GSAP animation on cards load
  useEffect(() => {
    if (cardsContainerRef.current) {
      gsap.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [projects.length]);

  // GSAP animation when opening create modal
  useEffect(() => {
    if (showCreateModal && createModalRef.current) {
      gsap.fromTo(
        createModalRef.current,
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [showCreateModal]);

  // File upload handler inside Step 2 of creation modal
  const handleStep2FileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatusMsg(null);

    try {
      const allParsed: ResearchPaper[] = [];
      let totalDupes = 0;
      let lastFileName = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        lastFileName = file.name;
        const res = await parseUploadedFile(file, 'qv-init');
        allParsed.push(...res.papers);
        totalDupes += res.duplicatesRemoved || 0;
      }

      setUploadedArticles(prev => [...prev, ...allParsed]);
      setUploadStatusMsg(`✓ Uploaded "${lastFileName}": Extracted ${allParsed.length} articles (${totalDupes} duplicates removed) with AI ratings assigned!`);
    } catch (err) {
      console.error(err);
      alert('Error parsing uploaded file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Add Member during creation
  const handleAddInviteMember = () => {
    if (!inviteEmail.trim()) return;
    const newMember: ReviewMember = {
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      joinedAt: new Date().toLocaleDateString()
    };
    setMembersList([...membersList, newMember]);
    setInviteEmail('');
  };

  // Handle Final Create
  const handleFinalCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reviewTitle.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: reviewTitle.trim(),
      description: description.trim() || 'Systematic literature review workspace',
      reviewType: reviewType || 'Literature review',
      reviewDomain: reviewDomain || 'Biomedical',
      members: membersList,
      papers: uploadedArticles, // Loaded directly from uploaded file!
      queryVersions: [
        {
          id: `qv-${Date.now()}`,
          versionNumber: 1,
          label: 'Initial Uploaded Articles',
          queryString: '',
          keyphrases: [],
          booleanLogic: 'AND',
          sources: ['pubmed', 'europe_pmc'],
          hitCount: uploadedArticles.length,
          pulledCount: uploadedArticles.length,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isActive: true
        }
      ],
      decisions: {},
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          versionNumber: 1,
          step: 'Protocol',
          action: 'Created New Review Workspace',
          actor: 'human',
          details: `Initialized review "${reviewTitle}" with ${uploadedArticles.length} ingested papers.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };

    onCreateProject(newProject);
    firestoreService.saveProject(newProject);

    // Reset form
    setShowCreateModal(false);
    setCreateStep(1);
    setReviewTitle('');
    setReviewType('Literature review');
    setReviewDomain('Biomedical');
    setDescription('');
    setUploadedArticles([]);
    setUploadStatusMsg(null);
  };

  // Open Edit Modal
  const openEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setEditTitle(proj.name);
    setEditDescription(proj.description || '');
    setEditType(proj.reviewType || 'Literature review');
    setEditDomain(proj.reviewDomain || 'Biomedical');
  };

  // Save Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editTitle.trim()) return;

    const updated: Project = {
      ...editingProject,
      name: editTitle.trim(),
      description: editDescription.trim(),
      reviewType: editType,
      reviewDomain: editDomain,
      updatedAt: new Date().toLocaleDateString()
    };

    if (onUpdateProject) {
      onUpdateProject(updated);
    }
    firestoreService.saveProject(updated);
    setEditingProject(null);
  };

  // Open Members Modal
  const openMembersModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setManagingMembersProject(proj);
  };

  // Add Member in Managing Modal
  const handleAddMemberToProject = () => {
    if (!managingMembersProject || !newMemberEmail.trim()) return;
    const newMember: ReviewMember = {
      id: `mem-${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail.trim(),
      role: newMemberRole,
      joinedAt: new Date().toLocaleDateString()
    };

    const updatedMembers = [...(managingMembersProject.members || []), newMember];
    const updated: Project = {
      ...managingMembersProject,
      members: updatedMembers,
      updatedAt: new Date().toLocaleDateString()
    };

    if (onUpdateProject) {
      onUpdateProject(updated);
    }
    firestoreService.saveProject(updated);
    setManagingMembersProject(updated);
    setNewMemberEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-radial from-[#4A3324] via-[#352318] to-[#241710] text-[#FAF9F8]">
      
      {/* Top Navbar */}
      <header className="border-b border-[#E6E0F0]/20 bg-[#352318]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#FAF9F8]">
                CORPUS <span className="text-[#E6E0F0] font-light">AI</span>
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/25">
                Reviews
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#4A3324] border border-emerald-400/40 text-emerald-200 text-xs">
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Cloud Firestore: Spark Free Tier Active</span>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-[#FAF9F8]">{user.name}</div>
              <div className="text-[11px] text-[#E5E4E2]/70">{user.email}</div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-[#E5E4E2] hover:text-white hover:bg-[#4A3324] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#E6E0F0]/25">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4A3324] border border-[#E6E0F0]/25 text-[#E6E0F0] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E5E4E2]" />
              <span>Systematic Literature Review & Multi-Index Recommender</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF9F8] tracking-tight">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#E5E4E2]/90 leading-relaxed">
              Upload citation files (.ris, .csv, .bib, .json), automatically deduplicate records, explore explainable AI ratings with text evidence, and discover related literature from Scopus, Web of Science, PubMed, and IEEE Xplore.
            </p>
          </div>

          <button
            onClick={() => {
              setCreateStep(1);
              setShowCreateModal(true);
            }}
            className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#E5E4E2] to-[#E6E0F0] text-[#2C1E16] hover:brightness-105 shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Review</span>
          </button>
        </div>

        {/* Reviews Grid Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-[#E6E0F0]" />
            <h2 className="text-sm font-bold text-[#FAF9F8]">Active Systematic Reviews</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A3324] text-[#E6E0F0] font-semibold border border-[#E6E0F0]/20">
              {projects.length}
            </span>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const includedCount = Object.values(proj.decisions || {}).filter(d => d.status === 'include').length;
            const members = proj.members || [
              { id: '1', name: user.name, email: user.email, role: 'Owner', joinedAt: proj.createdAt }
            ];

            return (
              <div
                key={proj.id}
                className="glass-card rounded-2xl p-5 border border-[#E6E0F0]/20 flex flex-col justify-between hover:border-[#E6E0F0]/50 transition-all group text-left"
              >
                <div className="space-y-3">
                  {/* Top Bar: Review Type & Action Buttons */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/25">
                      {proj.reviewType || 'Literature review'}
                    </span>

                    <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      {/* Edit Details Button */}
                      <button
                        onClick={(e) => openEditModal(proj, e)}
                        className="p-1.5 rounded-lg text-[#E5E4E2] hover:text-white hover:bg-[#4A3324] transition-colors cursor-pointer"
                        title="Edit Review Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Manage Members Button */}
                      <button
                        onClick={(e) => openMembersModal(proj, e)}
                        className="p-1.5 rounded-lg text-[#E5E4E2] hover:text-white hover:bg-[#4A3324] transition-colors cursor-pointer"
                        title="Review Team Members"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Project */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${proj.name}"?`)) {
                            onDeleteProject(proj.id);
                            firestoreService.deleteProject(proj.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-[#FAF9F8] group-hover:text-white transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-[#E5E4E2]/80 mt-1 line-clamp-2">
                      {proj.description || 'Systematic literature review workspace.'}
                    </p>
                  </div>

                  {/* Domain Tag */}
                  {proj.reviewDomain && (
                    <div className="text-[11px] text-[#E5E4E2]/70 flex items-center space-x-1">
                      <span className="font-medium text-[#FAF9F8]">Domain:</span>
                      <span className="text-[#E6E0F0]">{proj.reviewDomain}</span>
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E0F0]/15 text-xs">
                    <div className="p-2 rounded-xl bg-[#2C1E16] border border-[#E6E0F0]/15">
                      <span className="text-[10px] text-[#E5E4E2]/70 block">Papers Uploaded</span>
                      <span className="font-bold text-[#FAF9F8]">{proj.papers?.length || 0}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#2C1E16] border border-[#E6E0F0]/15">
                      <span className="text-[10px] text-[#E5E4E2]/70 block">Included Studies</span>
                      <span className="font-bold text-emerald-300">{includedCount}</span>
                    </div>
                  </div>

                  {/* Review Team Members Display */}
                  <div className="pt-2">
                    <span className="text-[10px] font-semibold text-[#E5E4E2]/70 block mb-1">
                      Review Members ({members.length})
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {members.slice(0, 3).map((m, i) => (
                        <div
                          key={m.id || i}
                          className="w-6 h-6 rounded-full bg-[#4A3324] border border-[#E6E0F0]/35 flex items-center justify-center text-[10px] font-bold text-[#FAF9F8]"
                          title={`${m.name} (${m.role})`}
                        >
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <span className="text-[10px] text-[#E5E4E2]/70">
                          +{members.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-3 border-t border-[#E6E0F0]/15 flex items-center justify-between">
                  <span className="text-[10px] text-[#E5E4E2]/60">
                    Updated {proj.updatedAt}
                  </span>

                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-[#E6E0F0] hover:text-white group-hover:translate-x-1 transition-all cursor-pointer"
                  >
                    <span>Open Review Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="col-span-full glass-panel rounded-2xl p-12 text-center border border-dashed border-[#E6E0F0]/30">
              <Folder className="w-12 h-12 text-[#E6E0F0]/50 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#FAF9F8]">No Systematic Reviews Yet</h3>
              <p className="text-xs text-[#E5E4E2]/80 mt-1 max-w-sm mx-auto">
                Click "Create New Review" to set up your review title, domain, and upload articles.
              </p>
              <button
                onClick={() => {
                  setCreateStep(1);
                  setShowCreateModal(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Review</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* CREATE NEW REVIEW MODAL (Exact match to Image 2 with exact review types & Image 3 upload) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            ref={createModalRef}
            className="w-full max-w-2xl bg-[#362419] border border-[#E6E0F0]/30 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header matching Image 2 */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0F0]/20">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#4A3324] border border-[#E6E0F0]/25 flex items-center justify-center text-[#E6E0F0]">
                  <Folder className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#FAF9F8]">Create new review</h3>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#E5E4E2] hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper matching Image 2 */}
            <div className="flex items-center justify-between border-b border-[#E6E0F0]/20 pb-4">
              <button 
                onClick={() => setCreateStep(1)}
                className={`flex items-center space-x-2 pb-1 transition-all cursor-pointer ${
                  createStep === 1 
                    ? 'border-b-2 border-indigo-300 text-indigo-200 font-bold' 
                    : 'text-[#E5E4E2]/70 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                  createStep === 1 ? 'bg-indigo-600 text-white' : 'bg-[#4A3324] text-[#E5E4E2]'
                }`}>
                  1
                </span>
                <span className="text-xs">Add review info</span>
              </button>

              <ChevronRight className="w-4 h-4 text-[#E5E4E2]/40" />

              <button 
                onClick={() => setCreateStep(2)}
                className={`flex items-center space-x-2 pb-1 transition-all cursor-pointer ${
                  createStep === 2 
                    ? 'border-b-2 border-indigo-300 text-indigo-200 font-bold' 
                    : 'text-[#E5E4E2]/70 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                  createStep === 2 ? 'bg-indigo-600 text-white' : 'bg-[#4A3324] text-[#E5E4E2]'
                }`}>
                  2
                </span>
                <span className="text-xs">Upload articles</span>
              </button>

              <ChevronRight className="w-4 h-4 text-[#E5E4E2]/40" />

              <button 
                onClick={() => setCreateStep(3)}
                className={`flex items-center space-x-2 pb-1 transition-all cursor-pointer ${
                  createStep === 3 
                    ? 'border-b-2 border-indigo-300 text-indigo-200 font-bold' 
                    : 'text-[#E5E4E2]/70 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                  createStep === 3 ? 'bg-indigo-600 text-white' : 'bg-[#4A3324] text-[#E5E4E2]'
                }`}>
                  3
                </span>
                <span className="text-xs">Invite members</span>
              </button>
            </div>

            {/* STEP 1: Add review info (Exact review types from Image 2) */}
            {createStep === 1 && (
              <div className="space-y-4">
                {/* Review title * */}
                <div>
                  <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                    Review title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review title has to be unique"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-[#FAF9F8] placeholder-[#C5BFB8]/60"
                    required
                  />
                </div>

                {/* Review type * and Review domain * */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                      Review type <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={reviewType}
                      onChange={(e) => setReviewType(e.target.value)}
                      className="w-full bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#E6E0F0]"
                    >
                      {RAYYAN_REVIEW_TYPES.map(type => (
                        <option key={type} value={type} className="bg-[#271911] text-[#FAF9F8]">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                      Review domain <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={reviewDomain}
                      onChange={(e) => setReviewDomain(e.target.value)}
                      className="w-full bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#E6E0F0]"
                    >
                      <option value="Biomedical">Biomedical</option>
                      <option value="Clinical Medicine">Clinical Medicine</option>
                      <option value="Computer Science & Artificial Intelligence">Computer Science & Artificial Intelligence</option>
                      <option value="Engineering & Technology">Engineering & Technology</option>
                      <option value="Social & Behavioral Sciences">Social & Behavioral Sciences</option>
                      <option value="Pharmacology">Pharmacology</option>
                      <option value="Environmental Sciences">Environmental Sciences</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your review!"
                    rows={4}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-[#FAF9F8] placeholder-[#C5BFB8]/60 resize-none"
                  />
                </div>

                {/* Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E6E0F0]/20">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#E5E4E2] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!reviewTitle.trim()) {
                        alert('Please enter a review title.');
                        return;
                      }
                      setCreateStep(2);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <span>Next: Upload articles</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Upload articles (Interactive file uploader, deduplication & AI ratings) */}
            {createStep === 2 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#E6E0F0]/35 rounded-2xl p-6 text-center bg-[#271911]/80 relative hover:border-[#E6E0F0]/60 transition-all">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.ris,.csv,.json,.bib,.bibtex,.txt"
                    onChange={(e) => handleStep2FileUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Drop or select research paper files"
                  />

                  <div className="space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center mx-auto text-white shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF9F8]">Upload Research Articles</h4>
                      <p className="text-xs text-[#E5E4E2]/80 mt-1 max-w-md mx-auto">
                        Drag and drop <strong>.PDF</strong>, <strong>.RIS</strong>, <strong>.CSV</strong>, <strong>.BIB</strong>, or <strong>.JSON</strong> files. Any duplicates are automatically removed and AI ratings are computed with textual evidence!
                      </p>
                    </div>

                    <div className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] shadow-sm">
                      <span>Browse Files</span>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-[#271911]/90 backdrop-blur-sm flex items-center justify-center space-x-2 z-20">
                      <div className="w-6 h-6 border-2 border-[#E6E0F0] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-[#FAF9F8]">Deduplicating & Computing AI Ratings...</span>
                    </div>
                  )}
                </div>

                {/* Upload Status Message */}
                {uploadStatusMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>{uploadStatusMsg}</span>
                  </div>
                )}

                {/* Preview of Uploaded Articles with Ratings */}
                {uploadedArticles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#FAF9F8] block">
                      Uploaded Articles ({uploadedArticles.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {uploadedArticles.map((art, idx) => (
                        <div key={art.id || idx} className="p-2.5 rounded-xl bg-[#241710] border border-[#E6E0F0]/15 text-xs flex items-center justify-between gap-2">
                          <div className="truncate flex-1">
                            <span className="font-semibold text-[#FAF9F8] block truncate">{art.title}</span>
                            <span className="text-[10px] text-[#E5E4E2]/70">{art.journal} • {art.year}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/20 shrink-0">
                            {art.ratingBadgeLabel || `${art.overallRatingScore || 85}/100`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E6E0F0]/20">
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#E5E4E2] hover:text-white cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateStep(3)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <span>Next: Invite members</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Invite members */}
            {createStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#FAF9F8]">
                    Invite Team Members to this Review:
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter collaborator email..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-[#FAF9F8]"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Reviewer">Reviewer</option>
                      <option value="Collaborator">Collaborator</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddInviteMember}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/35 hover:bg-[#5C3F2D] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* List of members */}
                  <div className="space-y-2 pt-2">
                    {membersList.map((m) => (
                      <div 
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#271911] border border-[#E6E0F0]/20 text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#4A3324] text-[#FAF9F8] font-bold text-xs flex items-center justify-center">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-[#FAF9F8]">{m.name}</span>
                            <span className="text-[11px] text-[#E5E4E2]/70 ml-2">({m.email})</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#352318] text-[#E6E0F0] border border-[#E6E0F0]/25">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E6E0F0]/20">
                  <button
                    type="button"
                    onClick={() => setCreateStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#E5E4E2] hover:text-white cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalCreate()}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E5E4E2] to-[#E6E0F0] text-[#2C1E16] hover:brightness-105 flex items-center space-x-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create Review & Open Workspace ({uploadedArticles.length} papers)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="w-full max-w-xl bg-[#362419] border border-[#E6E0F0]/30 rounded-2xl shadow-2xl p-6 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0F0]/20">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#E6E0F0]" />
                <h3 className="text-base font-bold text-[#FAF9F8]">Edit Review Details</h3>
              </div>
              <button 
                onClick={() => setEditingProject(null)}
                className="text-[#E5E4E2] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                  Review Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-[#FAF9F8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                    Review Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-3 py-2 text-xs"
                  >
                    {RAYYAN_REVIEW_TYPES.map(type => (
                      <option key={type} value={type} className="bg-[#271911] text-[#FAF9F8]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                    Review Domain
                  </label>
                  <select
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="w-full bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Biomedical">Biomedical</option>
                    <option value="Clinical Medicine">Clinical Medicine</option>
                    <option value="Computer Science & Artificial Intelligence">Computer Science & Artificial Intelligence</option>
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Social & Behavioral Sciences">Social & Behavioral Sciences</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Environmental Sciences">Environmental Sciences</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FAF9F8] mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-[#FAF9F8] resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-[#E6E0F0]/20">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#E5E4E2] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS MODAL */}
      {managingMembersProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="w-full max-w-lg bg-[#362419] border border-[#E6E0F0]/30 rounded-2xl shadow-2xl p-6 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0F0]/20">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#E6E0F0]" />
                <h3 className="text-base font-bold text-[#FAF9F8]">
                  Review Members • {managingMembersProject.name}
                </h3>
              </div>
              <button 
                onClick={() => setManagingMembersProject(null)}
                className="text-[#E5E4E2] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invite New Member */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#FAF9F8]">
                Add Reviewer / Collaborator:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-[#FAF9F8]"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="bg-[#271911] border border-[#E6E0F0]/30 text-[#FAF9F8] rounded-xl px-2.5 py-2 text-xs"
                >
                  <option value="Reviewer">Reviewer</option>
                  <option value="Collaborator">Collaborator</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMemberToProject}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white flex items-center space-x-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              </div>
            </div>

            {/* Existing Members */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-[#E5E4E2]/70 block">
                Current Members ({managingMembersProject.members?.length || 1}):
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {(managingMembersProject.members || [
                  { id: '1', name: user.name, email: user.email, role: 'Owner', joinedAt: managingMembersProject.createdAt }
                ]).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#271911] border border-[#E6E0F0]/20 text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#4A3324] text-[#FAF9F8] font-bold text-xs flex items-center justify-center">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-[#FAF9F8]">{m.name}</span>
                        <span className="text-[11px] text-[#E5E4E2]/70 ml-2">({m.email})</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#352318] text-[#E6E0F0] border border-[#E6E0F0]/25">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-[#E6E0F0]/20">
              <button
                type="button"
                onClick={() => setManagingMembersProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E5E4E2] text-[#2C1E16] hover:bg-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
