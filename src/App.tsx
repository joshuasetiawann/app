import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppStateProvider } from './state/AppState';
import { AuthStateProvider, useAuthState } from './state/AuthState';
import { AppShell } from './components/layout/AppShell';

const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const FoodPage = lazy(() => import('./pages/FoodPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const PlacesPage = lazy(() => import('./pages/PlacesPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const FilesPage = lazy(() => import('./pages/FilesPage'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const TimezonePage = lazy(() => import('./pages/TimezonePage'));
const CountdownPage = lazy(() => import('./pages/CountdownPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const NotifPage = lazy(() => import('./pages/NotifPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ThemePage = lazy(() => import('./pages/ThemePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const StatesPage = lazy(() => import('./pages/StatesPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const PairingPage = lazy(() => import('./pages/PairingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AppBoot({ error }: { error?: string }) {
  const auth = useAuthState();
  if (error) {
    return (
      <main className="kk-app-boot">
        <section className="kk-boot-card kk-boot-error" role="alert">
          <div aria-hidden="true" style={{ fontSize: 42 }}>☁️</div>
          <h1>The connection is not ready.</h1>
          <p>{error}</p>
          <button type="button" onClick={() => void auth.refresh()}>Try again</button>
        </section>
      </main>
    );
  }
  return (
    <main className="kk-app-boot" aria-label="Memuat KisahKita" aria-busy="true">
      <section className="kk-boot-card">
        <div className="kk-boot-head"><div className="kk-brand-mark"><span>♥</span><i /></div><div><strong>KisahKita</strong><small>Preparing your shared space…</small></div></div>
        <div className="kk-skeleton kk-skeleton-title" />
        <div className="kk-skeleton kk-skeleton-line" />
        <div className="kk-skeleton kk-skeleton-line short" />
        <div className="kk-skeleton-panels"><div className="kk-skeleton kk-skeleton-panel" /><div className="kk-skeleton kk-skeleton-panel" /></div>
      </section>
    </main>
  );
}

function PageSkeleton() {
  return (
    <div style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }} aria-label="Memuat halaman" aria-busy="true">
      <div className="kk-skeleton kk-skeleton-title" />
      <div className="kk-skeleton kk-skeleton-line" />
      <div className="kk-skeleton kk-skeleton-line short" />
      <div className="kk-skeleton-panels"><div className="kk-skeleton kk-skeleton-panel" /><div className="kk-skeleton kk-skeleton-panel" /></div>
    </div>
  );
}

function PublicOnly({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  if (auth.status === 'loading') return <AppBoot />;
  if (auth.status === 'error') return <AppBoot error={auth.bootError} />;
  if (auth.status === 'authenticated' && !auth.recovery) {
    return <Navigate to={auth.isPaired ? '/' : '/pair'} replace />;
  }
  return children;
}

function SignedInOnly({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  const location = useLocation();
  if (auth.status === 'loading') return <AppBoot />;
  if (auth.status === 'error') return <AppBoot error={auth.bootError} />;
  if (auth.status !== 'authenticated') return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
}

function PairedOnly({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  const location = useLocation();
  if (auth.status === 'loading') return <AppBoot />;
  if (auth.status === 'error') return <AppBoot error={auth.bootError} />;
  if (auth.status !== 'authenticated') return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  if (!auth.isPaired) return <Navigate to="/pair" replace />;
  return children;
}

function LegacyOnboardRedirect() {
  const auth = useAuthState();
  if (auth.status === 'loading') return <AppBoot />;
  if (auth.status === 'error') return <AppBoot error={auth.bootError} />;
  return <Navigate to={auth.status === 'authenticated' ? '/pair' : '/auth'} replace />;
}

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<AppBoot />}>
      <Routes>
        <Route path="/auth" element={<PublicOnly><AuthPage /></PublicOnly>} />
        <Route path="/pair" element={<SignedInOnly><PairingPage /></SignedInOnly>} />
        <Route path="/onboard" element={<LegacyOnboardRedirect />} />

        <Route element={<PairedOnly><AppStateProvider><AppShell /></AppStateProvider></PairedOnly>}>
          <Route path="/" element={<Page><HomePage /></Page>} />
          <Route path="/chat" element={<Page><ChatPage /></Page>} />
          <Route path="/gallery" element={<Page><GalleryPage /></Page>} />
          <Route path="/food" element={<Page><FoodPage /></Page>} />
          <Route path="/schedule" element={<Page><SchedulePage /></Page>} />
          <Route path="/memories" element={<Page><MemoriesPage /></Page>} />
          <Route path="/story" element={<Page><StoryPage /></Page>} />
          <Route path="/places" element={<Page><PlacesPage /></Page>} />
          <Route path="/trips" element={<Page><TripsPage /></Page>} />
          <Route path="/files" element={<Page><FilesPage /></Page>} />
          <Route path="/location" element={<Page><LocationPage /></Page>} />
          <Route path="/timezone" element={<Page><TimezonePage /></Page>} />
          <Route path="/countdown" element={<Page><CountdownPage /></Page>} />
          <Route path="/notes" element={<Page><NotesPage /></Page>} />
          <Route path="/stats" element={<Page><StatsPage /></Page>} />
          <Route path="/notif" element={<Page><NotifPage /></Page>} />
          <Route path="/profile" element={<Page><ProfilePage /></Page>} />
          <Route path="/settings" element={<Page><SettingsPage /></Page>} />
          <Route path="/theme" element={<Page><ThemePage /></Page>} />
          <Route path="/privacy" element={<Page><PrivacyPage /></Page>} />
          <Route path="/states" element={<Page><StatesPage /></Page>} />
          <Route path="*" element={<Page><NotFoundPage /></Page>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthStateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthStateProvider>
  );
}
