import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import useAuthStore from './stores/useAuthStore';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PairingPage from './pages/auth/PairingPage';

// Module Pages
import HomePage from './pages/dashboard/HomePage';
import LettersPage from './pages/capsule-mail/LettersPage';
import ComposeLetterPage from './pages/capsule-mail/ComposeLetterPage';
import ViewLetterPage from './pages/capsule-mail/ViewLetterPage';
import TimelinePage from './pages/our-story/TimelinePage';
import MoodPage from './pages/daily-mood/MoodPage';
import SurprisesPage from './pages/surprises/SurprisesPage';
import MemoriesPage from './pages/memories/MemoriesPage';
import PlacesPage from './pages/places/PlacesPage';
import PlaylistPage from './pages/songs/PlaylistPage';
import CalendarPage from './pages/calendar/CalendarPage';
import ChatPage from './pages/chat/ChatPage';
import SettingsPage from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pair" element={<PairingPage />} />

          {/* Protected Main Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/capsule-mail" element={<LettersPage />} />
            <Route path="/capsule-mail/compose" element={<ComposeLetterPage />} />
            <Route path="/capsule-mail/:id" element={<ViewLetterPage />} />
            <Route path="/our-story" element={<TimelinePage />} />
            <Route path="/daily-mood" element={<MoodPage />} />
            <Route path="/surprises" element={<SurprisesPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/places" element={<PlacesPage />} />
            <Route path="/songs" element={<PlaylistPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
