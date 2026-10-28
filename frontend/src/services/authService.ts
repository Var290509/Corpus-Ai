import { User } from '../types';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // stored credentials
  createdAt: string;
}

const STORAGE_KEY = 'corpus_registered_accounts';
const SESSION_KEY = 'corpus_active_session';

// Pre-seeded verified accounts for testing & demonstrations
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'usr-demo-1',
    name: 'Dr. Lead Investigator',
    email: 'demo@corpus.ai',
    passwordHash: 'Password123!',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-demo-2',
    name: 'Clinical Researcher',
    email: 'researcher@corpus.ai',
    passwordHash: 'Corpus2026!',
    createdAt: new Date().toISOString()
  }
];

class AuthService {
  private getAccounts(): StoredUserAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  private saveAccounts(accounts: StoredUserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save user accounts:', e);
    }
  }

  /**
   * Registers a new user with email and password
   */
  public signUp(name: string, email: string, password: string): { user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const accounts = this.getAccounts();
    const existing = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { error: 'An account with this email already exists. Please switch to Log In.' };
    }

    const newAccount: StoredUserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: password, // stored locally
      createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    const user: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  }

  /**
   * Logs in a user, strictly verifying the password!
   */
  public logIn(email: string, password: string): { user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { error: 'Please enter your email address.' };
    }

    if (!password) {
      return { error: 'Please enter your password.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { 
        error: `No registered account found for "${cleanEmail}". Please click "Sign Up" below to create your account.` 
      };
    }

    // STRICT PASSWORD VERIFICATION
    if (account.passwordHash !== password) {
      return { 
        error: 'Incorrect password entered. Please enter the password you registered with.' 
      };
    }

    const user: User = {
      id: account.id,
      name: account.name,
      email: account.email
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  }

  /**
   * Retrieves currently logged in session, if any
   */
  public getSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears active session on logout
   */
  public logOut(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const authService = new AuthService();
