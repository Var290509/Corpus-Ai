import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  Firestore,
  serverTimestamp 
} from 'firebase/firestore';
import { Project, User } from '../types';

// Default Google Cloud Firestore (Firebase Free Tier Spark) configuration
// Can be customized via environment variables or runtime settings modal
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCorpusAIFreeTierSpark2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "corpus-ai-free-tier.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "corpus-ai-free-tier",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "corpus-ai-free-tier.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103948572619",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103948572619:web:9c8a7b6d5e4f3a2b1c"
};

class FirestoreService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isConnected = false;
  private syncListeners: Map<string, () => void> = new Map();

  constructor() {
    this.init();
  }

  public init(customConfig?: typeof DEFAULT_FIREBASE_CONFIG) {
    try {
      const storedConfig = localStorage.getItem('corpus_firebase_config');
      const config = customConfig || (storedConfig ? JSON.parse(storedConfig) : DEFAULT_FIREBASE_CONFIG);

      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }

      this.db = getFirestore(this.app);
      this.isConnected = true;
      console.log('⚡ Google Cloud Firestore (Firebase Spark Free Tier) initialized successfully.');
    } catch (err) {
      console.warn('⚡ Firestore initialized in offline-first mode with local persistence fallback:', err);
      this.isConnected = false;
    }
  }

  public getStatus(): { isConnected: boolean; tier: string } {
    return {
      isConnected: this.isConnected,
      tier: 'Google Cloud Firestore Free Spark Tier (1 GiB / 50k reads/day)'
    };
  }

  public updateConfig(config: typeof DEFAULT_FIREBASE_CONFIG) {
    localStorage.setItem('corpus_firebase_config', JSON.stringify(config));
    this.init(config);
  }

  // --- Projects Operations ---

  public async saveProject(project: Project): Promise<boolean> {
    try {
      // Always persist to local cache first
      this.saveLocalProject(project);

      if (this.db) {
        const projectRef = doc(this.db, 'projects', project.id);
        await setDoc(projectRef, {
          ...project,
          lastSyncedAt: new Date().toISOString(),
          serverUpdated: serverTimestamp()
        }, { merge: true });
        console.log(`[Firestore] Synced project "${project.name}" (${project.id}) to Cloud Firestore.`);
        return true;
      }
    } catch (error) {
      console.warn('[Firestore] Cloud sync skipped, cached locally:', error);
    }
    return false;
  }

  public async getProject(projectId: string): Promise<Project | null> {
    try {
      if (this.db) {
        const docRef = doc(this.db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as Project;
        }
      }
    } catch (error) {
      console.warn('[Firestore] Error fetching from Cloud Firestore, falling back to local cache:', error);
    }
    return this.getLocalProject(projectId);
  }

  public async loadAllProjects(): Promise<Project[]> {
    const localProjects = this.loadLocalProjects();
    try {
      if (this.db) {
        const querySnapshot = await getDocs(collection(this.db, 'projects'));
        if (!querySnapshot.empty) {
          const cloudProjects: Project[] = [];
          querySnapshot.forEach((d) => {
            cloudProjects.push(d.data() as Project);
          });
          // Merge with local projects
          const merged = new Map<string, Project>();
          localProjects.forEach(p => merged.set(p.id, p));
          cloudProjects.forEach(p => merged.set(p.id, p));
          const allProjects = Array.from(merged.values());
          localStorage.setItem('corpus_ai_projects', JSON.stringify(allProjects));
          return allProjects;
        }
      }
    } catch (error) {
      console.warn('[Firestore] Could not load cloud projects, using local cache:', error);
    }
    return localProjects;
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    try {
      this.deleteLocalProject(projectId);
      if (this.db) {
        const projectRef = doc(this.db, 'projects', projectId);
        await deleteDoc(projectRef);
        console.log(`[Firestore] Deleted project ${projectId} from Cloud Firestore.`);
        return true;
      }
    } catch (error) {
      console.warn('[Firestore] Error deleting from Cloud Firestore:', error);
    }
    return false;
  }

  public subscribeToProject(projectId: string, callback: (project: Project) => void): () => void {
    if (!this.db) return () => {};

    try {
      const docRef = doc(this.db, 'projects', projectId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as Project);
        }
      });

      this.syncListeners.set(projectId, unsubscribe);
      return unsubscribe;
    } catch (err) {
      console.warn('[Firestore] Realtime subscription error:', err);
      return () => {};
    }
  }

  // --- Local Persistence Helpers (Offline-First Guarantee) ---

  private saveLocalProject(project: Project) {
    try {
      const projects = this.loadLocalProjects();
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.unshift(project);
      }
      localStorage.setItem('corpus_ai_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving project to localStorage:', e);
    }
  }

  private getLocalProject(projectId: string): Project | null {
    const projects = this.loadLocalProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  private loadLocalProjects(): Project[] {
    try {
      const data = localStorage.getItem('corpus_ai_projects');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private deleteLocalProject(projectId: string) {
    try {
      const projects = this.loadLocalProjects().filter(p => p.id !== projectId);
      localStorage.setItem('corpus_ai_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error deleting project from localStorage:', e);
    }
  }
}

export const firestoreService = new FirestoreService();
