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
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default App;
