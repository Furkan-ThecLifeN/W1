import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthProvider';
import Toast from './Toast';

// Sayfa bileşenleriniz
import SplashScreen from "./components/SplashScreen/SplashScreen";
import Home from "./pages/home/HomePage";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage";
// import VerificationPage from "./pages/AuthPage/VerificationPage"; // Bu satırı kaldırıyoruz!
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

// Kimlik doğrulama gerektiren rotaları korumak için bir bileşen
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>; // Veya daha gelişmiş bir yükleme göstergesi/splash screen
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />; // Kullanıcı yoksa /auth'a yönlendir
  }

  // Artık burada emailVerified kontrolü yok
  // if (!currentUser.emailVerified) {
  //   return <Navigate to="/verification" replace />;
  // }

  return children; // Her şey yolundaysa istenen bileşeni render et
};

// Kimlik doğrulama sayfalarına (login/register) erişimi yönetmek için bileşen
const AuthRedirect = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>; // Veya daha gelişmiş bir yükleme göstergesi
  }

  if (currentUser) {
    // Artık burada emailVerified kontrolü yok
    // if (!currentUser.emailVerified) {
    //   return <Navigate to="/verification" replace />;
    // }
    return <Navigate to="/home" replace />; // Giriş yapmışsa home'a yönlendir
  }

  return children; // Kullanıcı giriş yapmamışsa asıl bileşeni render et
};

// Uygulama rotalarını içeren ana bileşen
const AppContent = () => {
  return (
    <Routes>
      {/* Halka Açık Rotalar */}
      <Route path="/" element={<SplashScreen />} />

      {/* Kimlik Doğrulama Rotaları - Giriş yapmışsa yönlendir */}
      <Route path="/auth" element={<AuthRedirect><AuthPage /></AuthRedirect>} />
      {/* <Route path="/verification" element={<AuthRedirect><VerificationPage /></AuthRedirect>} /> */}
      {/* Yukarıdaki satırı kaldırdık */}

      {/* Korumalı Rotalar - Kimlik Doğrulama Gerektirir (Email Doğrulaması Yok) */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/vocentra" element={<ProtectedRoute><VoCentra /></ProtectedRoute>} />
      <Route path="/server/:serverName" element={<ProtectedRoute><VocentraServerPage /></ProtectedRoute>} />
      <Route path="/vosettings" element={<ProtectedRoute><VoCentraSettingsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><StoryAddPage /></ProtectedRoute>} />
      <Route path="/create/post" element={<ProtectedRoute><PostAdd /></ProtectedRoute>} />
      <Route path="/create/feedadd" element={<ProtectedRoute><FeedsAdd /></ProtectedRoute>} />
      <Route path="/create/story" element={<ProtectedRoute><StoryAdd /></ProtectedRoute>} />
      <Route path="/create/feeling" element={<ProtectedRoute><FeelingAdd /></ProtectedRoute>} />
      <Route path="/create/livestream" element={<ProtectedRoute><LiveStreamAdd /></ProtectedRoute>} />
      <Route path="/create/drafts" element={<ProtectedRoute><DraftsAdd /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Eşleşmeyen tüm yollar için varsayılan yönlendirme */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

// AuthProvider ve Toast'ı içeren ana uygulama bileşeni
const App = () => (
  <AuthProvider>
    <Toast />
    <AppContent />
  </AuthProvider>
);

export default App;
