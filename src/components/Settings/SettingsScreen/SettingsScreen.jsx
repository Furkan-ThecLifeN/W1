import React, { useState } from "react";
import styles from "./SettingsScreen.module.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { auth } from "../../../config/firebase-client";

// ✅ Account Settings
import ProfileSettings from "../SettingsSections/ProfileSettings/ProfileSettings";
import AccountTypeSettings from "../SettingsSections/AccountTypeSettings/AccountTypeSettings";
import LoginDeviceHistory from "../SettingsSections/LoginDeviceHistory/LoginDeviceHistory";
/* import TwoFactorAuth from "../SettingsSections/TwoFactorAuth/TwoFactorAuth";
 */ import FreezeAccount from "../SettingsSections/FreezeAccount/FreezeAccount";
import DeleteAccount from "../SettingsSections/DeleteAccount/DeleteAccount";
import SecurityAlerts from "../SettingsSections/SecurityAlerts/SecurityAlerts";
import LogoutAllDevices from "../SettingsSections/LogoutAllDevices/LogoutAllDevices";

// ✅ Kullanıcı Bazlı Ayarlar
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

// ✅ Uygulama Bazlı Ayarlar
import ThemeAppearance from "../SettingsSections/ThemeAppearance/ThemeAppearance";
import Languages from "../SettingsSections/Languages/Languages";
import Licenses from "../SettingsSections/Licenses/Licenses";
import TermsAndConditions from "../SettingsSections/TermsAndConditions/TermsAndConditions";
import AboutApp from "../SettingsSections/AboutApp/AboutApp";
import BugFeedback from "../SettingsSections/BugFeedback/BugFeedback";

// ✅ İçerik Üreticisi Ayarları
import CreatorInsights from "../SettingsSections/CreatorInsights/CreatorInsights";
import Accounts from "../SettingsSections/Accounts/Accounts";
import ContentSchedule from "../SettingsSections/ContentSchedule/ContentSchedule";
import EarningsPayments from "../SettingsSections/EarningsPayments/EarningsPayments";
import CommunityCompliance from "../SettingsSections/CommunityCompliance/CommunityCompliance";
import LiveStreamSettings from "../SettingsSections/LiveStreamSettings/LiveStreamSettings";

const componentMap = {
  "Profile Settings": <ProfileSettings />,
  "Hesap Türü (Bireysel / İşletme)": <AccountTypeSettings />,
  "Giriş ve Cihaz Geçmişi": <LoginDeviceHistory />,
  /* "İki Faktörlü Kimlik Doğrulama (2FA)": <TwoFactorAuth />,
   */ "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma": <FreezeAccount />,
  "Hesabı Kalıcı Olarak Sil": <DeleteAccount />,
  "Hesap Güvenlik Uyarıları": <SecurityAlerts />,
  "Oturumu Tüm Cihazlardan Kapat": <LogoutAllDevices />,
  "Hesap Gizliliği": <PrivacySettings />,
  "Yakın Arkadaşlıklar": <CloseFriends />,
  Bildirimler: <NotificationsSettings />,
  Engellenenler: <BlockedUsers />,
  "Zaman Yönetimi": <TimeManagement />,
  "Hareketler (Beğenmeler, Yorumlar, Etiketler, Zaman Geçirme Süresi)": (
    <ActivityLog />
  ),
  "Gizlenenler / Kısıtlananlar": <HiddenRestricted />,
  "Mesajlar ve Hikaye Yanıtları": <MessagesStoryReplies />,
  "Etiketler ve Bahsetmeler": <TagsMentions />,
  "Gizlenen Sözcükler": <HiddenWords />,
  "Beğenmeleri Gizle": <HideLikes />,
  "İçerik Hassasiyet Filtresi": <ContentSensitivityFilter />,
  "Yorum Kontrolleri": <CommentControls />,
  "Tema ve Görünüm": <ThemeAppearance />,
  Diller: <Languages />,
  Lisanslar: <Licenses />,
  Sözleşme: <TermsAndConditions />,
  "Uygulama Hakkında": <AboutApp />,
  "Hata Bildirimi ve Geri Bildirim Gönder": <BugFeedback />,
  // İçerik Üreticisi Ayarları
  "Account linking": <Accounts />,
  "İstatistikler ve İçgörüler": <CreatorInsights />,
  "Gelir ve Ödemeler": <EarningsPayments />,
  "İçerik Yayın Takvimi": <ContentSchedule />,
  "Topluluk Kuralları Uyumluluğu": <CommunityCompliance />,
  "Canlı Yayın Ayarları": <LiveStreamSettings />,
};

export default function SettingsScreen() {
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();

  const baseSections = {
    "Account Settings": [
      "Profile Settings",
      "Hesap Türü (Bireysel / İşletme)",
      "Giriş ve Cihaz Geçmişi",
      { name: "İki Faktörlü Kimlik Doğrulama (2FA)", isComingSoon: true },
      "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma",
      "Hesabı Kalıcı Olarak Sil",
      { name: "Hesap Güvenlik Uyarıları", isComingSoon: true },
      "Oturumu Tüm Cihazlardan Kapat",
    ],
    "Kullanıcı Bazlı Ayarlar": [
      "Hesap Gizliliği",
      "Yakın Arkadaşlıklar",
      "Bildirimler",
      "Engellenenler",
      "Zaman Yönetimi",
      {
        name: "Hareketler (Beğenmeler, Yorumlar, Etiketler, Zaman Geçirme Süresi)",
        isComingSoon: true,
      },
      { name: "Gizlenenler / Kısıtlananlar", isComingSoon: true },
      "Mesajlar ve Hikaye Yanıtları",
      "Etiketler ve Bahsetmeler",
      { name: "Gizlenen Sözcükler", isComingSoon: true },
      "Beğenmeleri Gizle",
      { name: "İçerik Hassasiyet Filtresi", isComingSoon: true },
      "Yorum Kontrolleri",
    ],
    "Uygulama Bazlı Ayarlar": [
      { name: "Tema ve Görünüm", isComingSoon: true },
      { name: "Diller", isComingSoon: true },
      "Lisanslar",
      "Sözleşme",
      "Uygulama Hakkında",
      "Hata Bildirimi ve Geri Bildirim Gönder",
    ],
  };

  const creatorSections = {
    "İçerik Üreticisi Ayarları": [
      "Account linking",
      { name: "İstatistikler ve İçgörüler", isComingSoon: true },
      { name: "Gelir ve Ödemeler", isComingSoon: true },
      { name: "İçerik Yayın Takvimi", isComingSoon: true },
      { name: "Topluluk Kuralları Uyumluluğu", isComingSoon: true },
      { name: "Canlı Yayın Ayarları", isComingSoon: true },
    ],
  };

  const sections =
    currentUser?.accountType === "business"
      ? { ...baseSections, ...creatorSections }
      : baseSections;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      navigate("/auth");
      console.log("Çıkış işlemi başarılı.");
    } catch (error) {
      console.error("Çıkış sırasında hata oluştu:", error);
    }
  };

  const handleItemClick = (item) => {
    if (item.isComingSoon) {
      return;
    }
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
            placeholder="Ayarlarda ara..."
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
                        <span className={styles.comingSoonTag}>Yakında</span>
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
          Hesaptan Çıkış
        </button>
      </div>

      <div className={styles.rightPanel}>
        {selected && componentMap[selected] ? (
          <div className={styles.detailContent}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{selected}</h2>
              <div className={styles.detailDecorator}></div>
            </div>
            <div className={styles.detailBody}>{componentMap[selected]}</div>
          </div>
        ) : (
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderIllustration}>
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="#0d1117" />
                <path
                  d="M70 80L130 80M70 100L130 100M70 120L130 120"
                  stroke="#00aaff"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className={styles.placeholderTitle}>Bir ayar seçin</h3>
            <p className={styles.placeholderText}>
              Detayları burada görüntüleyin ve düzenleyin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}