import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppState';
import { AppShell } from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GalleryPage from './pages/GalleryPage';
import FoodPage from './pages/FoodPage';
import SchedulePage from './pages/SchedulePage';
import MemoriesPage from './pages/MemoriesPage';
import StoryPage from './pages/StoryPage';
import PlacesPage from './pages/PlacesPage';
import TripsPage from './pages/TripsPage';
import FilesPage from './pages/FilesPage';
import LocationPage from './pages/LocationPage';
import TimezonePage from './pages/TimezonePage';
import CountdownPage from './pages/CountdownPage';
import NotesPage from './pages/NotesPage';
import StatsPage from './pages/StatsPage';
import NotifPage from './pages/NotifPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ThemePage from './pages/ThemePage';
import PrivacyPage from './pages/PrivacyPage';
import StatesPage from './pages/StatesPage';
import OnboardPage from './pages/OnboardPage';

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/places" element={<PlacesPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/timezone" element={<TimezonePage />} />
            <Route path="/countdown" element={<CountdownPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/notif" element={<NotifPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/theme" element={<ThemePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/states" element={<StatesPage />} />
            <Route path="/onboard" element={<OnboardPage />} />
            <Route path="/auth" element={<OnboardPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
