import React from "react";
import { Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import Home from "./pages/home/HomePage";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage";
import VerificationPage from "./pages/AuthPage/VerificationPage";
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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verification" element={<VerificationPage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/vocentra" element={<VoCentra />} />
      <Route path="/server/:serverName" element={<VocentraServerPage />} />
      <Route path="/vosettings" element={<VoCentraSettingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/create" element={<StoryAddPage />} />
      <Route path="/create/post" element={<PostAdd />} />
      <Route path="/create/feedadd" element={<FeedsAdd />} />
      <Route path="/create/story" element={<StoryAdd />} />
      <Route path="/create/feeling" element={<FeelingAdd />} />
      <Route path="/create/livestream" element={<LiveStreamAdd />} />
      <Route path="/create/drafts" element={<DraftsAdd />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

export default App;
