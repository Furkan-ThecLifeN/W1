// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import Toast from './Toast';
import { UserProvider } from './context/UserContext';

// Sayfa bileşenleriniz
import SplashScreen from "./components/SplashScreen/SplashScreen";
import Home from "./pages/home/HomePage";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage";
import Notifications from "./pages/Notification/NotificationPage";
import Messages from "./pages/MessagePage/MessagesPage";
import Discover from "./pages/Discover/Discover";
import SavedPage from "./pages/SavedPage/SavedPage";
import ProfilePage from "./pages/Account/ProfilePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import StoryAddPage from "./pages/AddPage/AddPage";
import VoCentra from "./pages/VocentraPage/VocentraPage";
import VocentraServerPage from "./pages/VocentraServerPage/VocentraServerPage";
import VoCentraSettingsPage from "./pages/VoCentraSettingsPage/VoCentraSettingsPage";
import PostAdd from "./components/Add/Post/PostAdd";
import FeedsAdd from "./components/Add/Feeds/FeedsAdd";
import StoryAdd from "./components/Add/Stories/StoriesAdd";
import FeelingAdd from "./components/Add/Feelings/FeelingsAdd";
import LiveStreamAdd from "./components/Add/LiveStream/LiveStream";
import DraftsAdd from "./components/Add/Drafts/Drafts";
import UserProfile from './pages/UserProfilePage/UserProfilePage';


// 🔒 Korumalı rota
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// 🔄 Auth sayfalarına giriş yapılmışken erişimi engelleme
const AuthRedirect = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// 📌 Tüm route’lar
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthRedirect><AuthPage /></AuthRedirect>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/vocentra" element={<ProtectedRoute><VoCentra /></ProtectedRoute>} />
      <Route path="/server/:serverName" element={<ProtectedRoute><VocentraServerPage /></ProtectedRoute>} />
      <Route path="/vosettings" element={<ProtectedRoute><VoCentraSettingsPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<UserProfile />} />
      <Route path="/create" element={<ProtectedRoute><StoryAddPage /></ProtectedRoute>} />
      <Route path="/create/post" element={<ProtectedRoute><PostAdd /></ProtectedRoute>} />
      <Route path="/create/feedadd" element={<ProtectedRoute><FeedsAdd /></ProtectedRoute>} />
      <Route path="/create/story" element={<ProtectedRoute><StoryAdd /></ProtectedRoute>} />
      <Route path="/create/feeling" element={<ProtectedRoute><FeelingAdd /></ProtectedRoute>} />
      <Route path="/create/livestream" element={<ProtectedRoute><LiveStreamAdd /></ProtectedRoute>} />
      <Route path="/create/drafts" element={<ProtectedRoute><DraftsAdd /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

// 🛠 Provider’ları en dışta sarmaladık
const App = () => (
  <UserProvider>
    <AuthProvider>
      <Toast />
      <AppContent />
    </AuthProvider>
  </UserProvider>
);

export default App;
