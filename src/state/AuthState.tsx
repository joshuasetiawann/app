import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  authMode,
  continueDemo,
  createCoupleSpace,
  joinCoupleSpace,
  refreshCoupleInvite,
  resetPassword,
  restoreAuth,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  subscribeToAccountData,
  subscribeToAuthChanges,
  updateAccountProfile,
  updateCoupleDriveFolder,
  updatePassword,
  type AccountProfile,
  type AuthMode,
  type AuthSnapshot,
  type CoupleSpace,
  type ProfilePatch,
  type SignUpOutcome,
} from '../services/authService';

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'error';

interface AuthStateApi {
  status: AuthStatus;
  mode: AuthMode;
  profile: AccountProfile | null;
  couple: CoupleSpace | null;
  partner: AccountProfile | null;
  isPaired: boolean;
  recovery: boolean;
  bootError: string;
  refresh: () => Promise<void>;
  signUpAccount: (email: string, password: string, name: string) => Promise<SignUpOutcome>;
  signInAccount: (email: string, password: string) => Promise<AuthSnapshot>;
  signInWithGoogleAccount: () => Promise<AuthSnapshot | null>;
  signOutAccount: () => Promise<void>;
  requestPasswordReset: (email: string, newPassword?: string) => Promise<void>;
  completePasswordRecovery: (password: string) => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthSnapshot>;
  createSpace: (spaceName: string, startedAt: string) => Promise<AuthSnapshot>;
  joinSpace: (code: string) => Promise<AuthSnapshot>;
  renewInvite: () => Promise<AuthSnapshot>;
  saveDriveFolder: (folderId: string) => Promise<AuthSnapshot>;
  enterDemo: () => Promise<AuthSnapshot>;
}

const AuthStateContext = createContext<AuthStateApi | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi gangguan. Coba lagi.';
}

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [snapshot, setSnapshot] = useState<AuthSnapshot | null>(null);
  const [bootError, setBootError] = useState('');
  const [recovery, setRecovery] = useState(() => new URLSearchParams(window.location.search).get('mode') === 'reset');

  const commit = useCallback((next: AuthSnapshot | null) => {
    setSnapshot(next);
    setBootError('');
    setStatus(next ? 'authenticated' : 'anonymous');
  }, []);

  const refresh = useCallback(async () => {
    try {
      commit(await restoreAuth());
    } catch (error) {
      setSnapshot(null);
      setBootError(errorMessage(error));
      setStatus('error');
    }
  }, [commit]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const next = await restoreAuth();
        if (active) commit(next);
      } catch (error) {
        if (!active) return;
        setBootError(errorMessage(error));
        setStatus('error');
      }
    };
    void load();
    const unsubscribe = subscribeToAuthChanges((isRecovery) => {
      if (isRecovery) setRecovery(true);
      void load();
    });
    const onFocus = () => void load();
    const onMobileRecovery = () => {
      setRecovery(true);
      void load();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('kk-auth-recovery', onMobileRecovery);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('kk-auth-recovery', onMobileRecovery);
    };
  }, [commit]);

  useEffect(() => {
    if (status !== 'authenticated' || !snapshot?.couple || snapshot.partner) return;
    const timer = window.setInterval(() => void refresh(), 5_000);
    return () => window.clearInterval(timer);
  }, [refresh, snapshot?.couple, snapshot?.partner, status]);

  const activeProfileId = snapshot?.profile?.id;
  const activeCoupleId = snapshot?.couple?.id ?? null;
  useEffect(() => {
    if (status !== 'authenticated' || !activeProfileId) return;
    return subscribeToAccountData(activeProfileId, activeCoupleId, () => {
      void refresh();
    });
  }, [activeCoupleId, activeProfileId, refresh, status]);

  const value = useMemo<AuthStateApi>(() => ({
    status,
    mode: authMode,
    profile: snapshot?.profile ?? null,
    couple: snapshot?.couple ?? null,
    partner: snapshot?.partner ?? null,
    isPaired: !!snapshot?.couple && !!snapshot.partner,
    recovery,
    bootError,
    refresh,
    signUpAccount: async (email, password, name) => {
      const outcome = await signUp(email, password, name);
      if (outcome.snapshot) commit(outcome.snapshot);
      return outcome;
    },
    signInAccount: async (email, password) => {
      const next = await signIn(email, password);
      if (!next) throw new Error('Sesi belum tersedia. Coba masuk lagi.');
      commit(next);
      return next;
    },
    signInWithGoogleAccount: async () => {
      const next = await signInWithGoogle();
      if (next) commit(next);
      return next;
    },
    signOutAccount: async () => {
      await signOut();
      commit(null);
    },
    requestPasswordReset: resetPassword,
    completePasswordRecovery: async (password) => {
      await updatePassword(password);
      setRecovery(false);
      await refresh();
    },
    updateProfile: async (patch) => {
      const next = await updateAccountProfile(patch);
      if (!next) throw new Error('Profil belum dapat dimuat.');
      commit(next);
      return next;
    },
    createSpace: async (spaceName, startedAt) => {
      const next = await createCoupleSpace(spaceName, startedAt);
      commit(next);
      return next;
    },
    joinSpace: async (code) => {
      const next = await joinCoupleSpace(code);
      commit(next);
      return next;
    },
    renewInvite: async () => {
      const next = await refreshCoupleInvite();
      commit(next);
      return next;
    },
    saveDriveFolder: async (folderId) => {
      const next = await updateCoupleDriveFolder(folderId);
      commit(next);
      return next;
    },
    enterDemo: async () => {
      const next = await continueDemo();
      commit(next);
      return next;
    },
  }), [bootError, commit, recovery, refresh, snapshot, status]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components -- provider and its hook intentionally share one context module.
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuthState must be used within AuthStateProvider');
  return context;
}
