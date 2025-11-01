import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Toast from "./Toast";
import { UserProvider } from "./context/UserContext";
import { useUserStatus } from "./hooks/useUserStatus"; // Kullanıcı aktiflik hook’u

// Sayfa bileşenleriniz
import SplashScreen from "./components/SplashScreen/SplashScreen";
import Home from "./pages/home/HomePage";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage";
import Notifications from "./pages/Notification/NotificationPage";
import Messages from "./pages/MessagePage/MessagesPage";
import Discover from "./pages/Discover/Discover";
import DataDiscover from "./pages/DataTestPage/DataTestPage";
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
import UserProfile from "./pages/UserProfilePage/UserProfilePage";
import PostDetailPage from "./pages/PostDetailPage/PostDetailPage";
import MobileSearchPage from "./pages/MobileSearchPage/MobileSearchPage";
import AboutUs from "./pages/AboutUs/AboutUs";
import Contact from "./pages/Contact/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy/CookiePolicy";
import Terms from "./pages/Terms/Terms";
import HelpCenter from "./pages/HelpCenter/HelpCenter";
import Welcome from "./pages/Welcome/Welcome";


const AppContent = () => {
  const [isSplashing, setIsSplashing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 6000); // 6 saniye splash
    return () => clearTimeout(timer);
  }, []);

  if (isSplashing) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Tüm sayfalar herkese açık */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/data-discover" element={<DataDiscover />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/vocentra" element={<VoCentra />} />
      <Route path="/search" element={<MobileSearchPage />} />
      <Route path="/server/:serverName" element={<VocentraServerPage />} />
      <Route path="/vosettings" element={<VoCentraSettingsPage />} />
      <Route path="/account" element={<ProfilePage />} />
      <Route path="/profile/:username" element={<UserProfile />} />
      <Route path="/create" element={<StoryAddPage />} />
      <Route path="/create/post" element={<PostAdd />} />
      <Route path="/create/feedadd" element={<FeedsAdd />} />
      <Route path="/create/story" element={<StoryAdd />} />
      <Route path="/create/feelingadd" element={<FeelingAdd />} />
      <Route path="/create/livestream" element={<LiveStreamAdd />} />
      <Route path="/create/drafts" element={<DraftsAdd />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/welcome" element={<Welcome />} />


      <Route path="/post/:postId" element={<PostDetailPage />} />
      <Route path="/feeling/:feelingId" element={<PostDetailPage />} />
      <Route path="/feed/:feedId" element={<PostDetailPage />} />

      {/* Varsayılan yönlendirme */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

const App = () => {
  useUserStatus(); // Kullanıcı aktifliğini Firestore'da takip et

  return (
    <UserProvider>
      <AuthProvider>
        <Toast />
        <AppContent />
      </AuthProvider>
    </UserProvider>
  );
};

export default App;
