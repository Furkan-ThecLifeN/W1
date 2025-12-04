import React, { useState } from "react";
import styles from "./SettingsScreen.module.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { auth } from "../../../config/firebase-client";

// Account Settings
import ProfileSettings from "../SettingsSections/ProfileSettings/ProfileSettings";
import AccountTypeSettings from "../SettingsSections/AccountTypeSettings/AccountTypeSettings";
import LoginDeviceHistory from "../SettingsSections/LoginDeviceHistory/LoginDeviceHistory";
import FreezeAccount from "../SettingsSections/FreezeAccount/FreezeAccount";
import DeleteAccount from "../SettingsSections/DeleteAccount/DeleteAccount";
import SecurityAlerts from "../SettingsSections/SecurityAlerts/SecurityAlerts";
import LogoutAllDevices from "../SettingsSections/LogoutAllDevices/LogoutAllDevices";

// User-Based Settings
import PrivacySettings from "../SettingsSections/PrivacySettings/PrivacySettings";
import CloseFriends from "../SettingsSections/CloseFriends/CloseFriends";
import NotificationsSettings from "../SettingsSections/NotificationsSettings/NotificationsSettings";
import BlockedUsers from "../SettingsSections/BlockedUsers/BlockedUsers";
import TimeManagement from "../SettingsSections/TimeManagement/TimeManagement";
import ActivityLog from "../SettingsSections/ActivityLog/ActivityLog";
import HiddenRestricted from "../SettingsSections/HiddenRestricted/HiddenRestricted";
import MessagesStoryReplies from "../SettingsSections/MessagesStoryReplies/MessagesStoryReplies";
import TagsMentions from "../SettingsSections/TagsMentions/TagsMentions";
import HiddenWords from "../SettingsSections/HiddenWords/HiddenWords";
import HideLikes from "../SettingsSections/HideLikes/HideLikes";
import ContentSensitivityFilter from "../SettingsSections/ContentSensitivityFilter/ContentSensitivityFilter";
import CommentControls from "../SettingsSections/CommentControls/CommentControls";

// App Settings
import ThemeAppearance from "../SettingsSections/ThemeAppearance/ThemeAppearance";
import Languages from "../SettingsSections/Languages/Languages";
import Licenses from "../SettingsSections/Licenses/Licenses";
import TermsAndConditions from "../SettingsSections/TermsAndConditions/TermsAndConditions";
import AboutApp from "../SettingsSections/AboutApp/AboutApp";
import BugFeedback from "../SettingsSections/BugFeedback/BugFeedback";

// Creator Settings
import CreatorInsights from "../SettingsSections/CreatorInsights/CreatorInsights";
import Accounts from "../SettingsSections/Accounts/Accounts";
import ContentSchedule from "../SettingsSections/ContentSchedule/ContentSchedule";
import EarningsPayments from "../SettingsSections/EarningsPayments/EarningsPayments";
import CommunityCompliance from "../SettingsSections/CommunityCompliance/CommunityCompliance";
import LiveStreamSettings from "../SettingsSections/LiveStreamSettings/LiveStreamSettings";
import Footer from "../../Footer/Footer";

// COMPONENT MAP  
// "Uygulama Hakkında" → REMOVED  
// "Updates" → ADDED  
const componentMap = {
  "Profile Settings": <ProfileSettings />,
  "Account Type (Personal / Business)": <AccountTypeSettings />,
  "Login & Device History": <LoginDeviceHistory />,
  "Freeze / Temporarily Disable Account": <FreezeAccount />,
  "Delete Account Permanently": <DeleteAccount />,
  "Security Alerts": <SecurityAlerts />,
  "Logout From All Devices": <LogoutAllDevices />,
  "Privacy Settings": <PrivacySettings />,
  "Close Friends": <CloseFriends />,
  Notifications: <NotificationsSettings />,
  "Blocked Users": <BlockedUsers />,
  "Time Management": <TimeManagement />,
  Activity: <ActivityLog />,
  "Hidden / Restricted": <HiddenRestricted />,
  "Messages & Story Replies": <MessagesStoryReplies />,
  "Tags & Mentions": <TagsMentions />,
  "Hidden Words": <HiddenWords />,
  "Hide Likes": <HideLikes />,
  "Content Sensitivity Filter": <ContentSensitivityFilter />,
  "Comment Controls": <CommentControls />,
  "Theme & Appearance": <ThemeAppearance />,
  Languages: <Languages />,
  Licenses: <Licenses />,
  Terms: <TermsAndConditions />,

  // UPDATED HERE
  Updates: <AboutApp />,

  "Bug Report & Feedback": <BugFeedback />,
  "Account Linking": <Accounts />,
  "Creator Insights": <CreatorInsights />,
  "Earnings & Payments": <EarningsPayments />,
  "Content Schedule": <ContentSchedule />,
  "Community Compliance": <CommunityCompliance />,
  "Live Stream Settings": <LiveStreamSettings />,
};

export default function SettingsScreen() {
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();

  // BASE SECTIONS UPDATED  
  // "Uygulama Hakkında" → REMOVED  
  // "Updates" → ADDED ENGLISH  
  const baseSections = {
    "Account Settings": [
      "Profile Settings",
      "Account Type (Personal / Business)",
      "Login & Device History",
      "Freeze / Temporarily Disable Account",
      "Delete Account Permanently",
      "Logout From All Devices",
    ],
    "User Settings": [
      "Privacy Settings",
      "Close Friends",
      "Blocked Users",
      "Messages & Story Replies",
    ],
    "App Settings": [
      "Licenses",
      "Terms",
      "Updates", // NEW
      "Bug Report & Feedback",
    ],
  };

  const sections = baseSections;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      navigate("/auth");
      console.log("Logout successful.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleItemClick = (item) => {
    if (item.isComingSoon) return;
    setSelected(item.name || item);
  };

  const filteredSections = Object.entries(sections)
    .map(([section, items]) => {
      const filteredItems = items.filter((item) => {
        const itemName = typeof item === "string" ? item : item.name;
        return itemName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      return [section, filteredItems];
    })
    .filter(([_, items]) => items.length > 0);

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.leftPanel}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search settings..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className={styles.searchIcon} viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>

        <div className={styles.settingsList}>
          {filteredSections.map(([section, items]) => (
            <div key={section} className={styles.settingsSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.titleDecorator}>//</span> {section}
              </h3>

              <div className={styles.sectionItems}>
                {items.map((item) => {
                  const itemName = typeof item === "string" ? item : item.name;
                  const isComingSoon = item.isComingSoon;

                  return (
                    <button
                      key={itemName}
                      className={`${styles.settingsButton} ${
                        selected === itemName ? styles.active : ""
                      } ${isComingSoon ? styles.comingSoon : ""}`}
                      onClick={() => handleItemClick(item)}
                      disabled={isComingSoon}
                    >
                      <span className={styles.buttonIcon}>
                        <svg viewBox="0 0 24 24">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </span>

                      <span className={styles.buttonText}>{itemName}</span>

                      {isComingSoon && (
                        <span className={styles.comingSoonTag}>Coming Soon</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <svg className={styles.logoutIcon} viewBox="0 0 24 24">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
          Logout
        </button>
      </div>

      <div className={styles.rightPanel}>
        {selected && componentMap[selected] ? (
          <div className={styles.detailContent}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{selected}</h2>
              <div className={styles.detailDecorator}></div>
            </div>
            <div className={styles.detailBody}>
              {componentMap[selected]}
            </div>
          </div>
        ) : (
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderIllustration}>W1</div>
            <h3 className={styles.placeholderTitle}>Select a setting</h3>
            <p className={styles.placeholderText}>
              View and edit details here.
            </p>
          </div>
        )}

        <div className={styles.footerWrapper}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
