import React, { useState } from "react";
import {
  FiSearch,
  FiChevronRight,
  FiUser,
  FiLock,
  FiSettings,
  FiLogOut,
  FiHelpCircle,
  FiArrowLeft,
} from "react-icons/fi";
import styles from "./MobileSettings.module.css";

// ✅ All Components
import ProfileSettings from "../SettingsSections/ProfileSettings/ProfileSettings";
import AccountTypeSettings from "../SettingsSections/AccountTypeSettings/AccountTypeSettings";
import LoginDeviceHistory from "../SettingsSections/LoginDeviceHistory/LoginDeviceHistory";
import TwoFactorAuth from "../SettingsSections/TwoFactorAuth/TwoFactorAuth";
import FreezeAccount from "../SettingsSections/FreezeAccount/FreezeAccount";
import DeleteAccount from "../SettingsSections/DeleteAccount/DeleteAccount";
import SecurityAlerts from "../SettingsSections/SecurityAlerts/SecurityAlerts";
import LogoutAllDevices from "../SettingsSections/LogoutAllDevices/LogoutAllDevices";
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
import ThemeAppearance from "../SettingsSections/ThemeAppearance/ThemeAppearance";
import LanguageTranslations from "../SettingsSections/LanguageTranslations/LanguageTranslations";
import Licenses from "../SettingsSections/Licenses/Licenses";
import TermsAndConditions from "../SettingsSections/TermsAndConditions/TermsAndConditions";
import AboutApp from "../SettingsSections/AboutApp/AboutApp";
import BugFeedback from "../SettingsSections/BugFeedback/BugFeedback";

const componentMap = {
  "Profil Ayarları": <ProfileSettings />,
  "Hesap Türü (Bireysel / İşletme)": <AccountTypeSettings />,
  "Giriş ve Cihaz Geçmişi": <LoginDeviceHistory />,
  "İki Faktörlü Kimlik Doğrulama (2FA)": <TwoFactorAuth />,
  "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma": <FreezeAccount />,
  "Hesabı Kalıcı Olarak Sil": <DeleteAccount />,
  "Hesap Güvenlik Uyarıları": <SecurityAlerts />,
  "Oturumu Tüm Cihazlardan Kapat": <LogoutAllDevices />,
  "Hesap Gizliliği": <PrivacySettings />,
  "Yakın Arkadaşlıklar": <CloseFriends />,
  "Bildirimler": <NotificationsSettings />,
  "Engellenenler": <BlockedUsers />,
  "Zaman Yönetimi": <TimeManagement />,
  "Hareketler": <ActivityLog />,
  "Gizlenenler / Kısıtlananlar": <HiddenRestricted />,
  "Mesajlar ve Hikaye Yanıtları": <MessagesStoryReplies />,
  "Etiketler ve Bahsetmeler": <TagsMentions />,
  "Gizlenen Sözcükler": <HiddenWords />,
  "Beğenmeleri Gizle": <HideLikes />,
  "İçerik Hassasiyet Filtresi": <ContentSensitivityFilter />,
  "Yorum Kontrolleri": <CommentControls />,
  "Tema ve Görünüm": <ThemeAppearance />,
  "Dil ve Çeviriler": <LanguageTranslations />,
  "Lisanslar": <Licenses />,
  "Sözleşme": <TermsAndConditions />,
  "Uygulama Hakkında": <AboutApp />,
  "Hata Bildirimi ve Geri Bildirim Gönder": <BugFeedback />,
};

const categories = {
  account: {
    title: "Hesap Ayarları",
    icon: <FiUser />,
    color: "#6366f1",
    items: [
      "Profil Ayarları",
      "Hesap Türü (Bireysel / İşletme)",
      "Giriş ve Cihaz Geçmişi",
      "İki Faktörlü Kimlik Doğrulama (2FA)",
      "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma",
      "Hesabı Kalıcı Olarak Sil",
      "Hesap Güvenlik Uyarıları",
      "Oturumu Tüm Cihazlardan Kapat",
    ],
  },
  user: {
    title: "Kullanıcı Ayarları",
    icon: <FiLock />,
    color: "#10b981",
    items: [
      "Hesap Gizliliği",
      "Yakın Arkadaşlıklar",
      "Bildirimler",
      "Engellenenler",
      "Zaman Yönetimi",
      "Hareketler",
      "Gizlenenler / Kısıtlananlar",
      "Mesajlar ve Hikaye Yanıtları",
      "Etiketler ve Bahsetmeler",
      "Gizlenen Sözcükler",
      "Beğenmeleri Gizle",
      "İçerik Hassasiyet Filtresi",
      "Yorum Kontrolleri",
    ],
  },
  app: {
    title: "Uygulama Ayarları",
    icon: <FiSettings />,
    color: "#f59e0b",
    items: [
      "Tema ve Görünüm",
      "Dil ve Çeviriler",
      "Lisanslar",
      "Sözleşme",
      "Uygulama Hakkında",
      "Hata Bildirimi ve Geri Bildirim Gönder",
    ],
  },
};

export default function MobileSettings() {
  const [activeCategory, setActiveCategory] = useState("account");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSetting, setSelectedSetting] = useState(null);

  const filteredItems = categories[activeCategory].items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {!selectedSetting ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.appTitle}>Settings</h1>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.categoryTabs}>
            {Object.keys(categories).map((key) => (
              <button
                key={key}
                className={`${styles.categoryTab} ${
                  activeCategory === key ? styles.active : ""
                }`}
                onClick={() => setActiveCategory(key)}
                style={{ "--active-color": categories[key].color }}
              >
                <div className={styles.categoryIcon}>
                  {React.cloneElement(categories[key].icon, {
                    className: `${styles.icon} ${
                      activeCategory === key ? styles.iconActive : ""
                    }`,
                  })}
                </div>
                <span>{categories[key].title}</span>
              </button>
            ))}
          </div>

          <div className={styles.settingsCard}>
            <div
              className={styles.cardHeader}
              style={{ backgroundColor: categories[activeCategory].color }}
            >
              <h2>{categories[activeCategory].title}</h2>
            </div>

            <div className={styles.cardBody}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className={styles.settingItem}
                    onClick={() => setSelectedSetting(item)}
                  >
                    <div className={styles.settingText}>
                      <h3>{item}</h3>
                      <p>{item} ayarlarını yönet</p>
                    </div>
                    <FiChevronRight className={styles.chevron} />
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Sonuç bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          <button className={styles.logoutButton}>
            <FiLogOut />
            <span>Çıkış Yap</span>
          </button>

          <div className={styles.decorativeCircle}></div>
          <div className={styles.decorativeLine}></div>
        </>
      ) : (
        <div className={styles.componentScreen}>
          <div className={styles.backHeader}>
            <button
              onClick={() => setSelectedSetting(null)}
              className={styles.backButton}
            >
              <FiArrowLeft /> Geri
            </button>
            <h2 className={styles.mobileComponent_Title}>{selectedSetting}</h2>
          </div>
          <div className={styles.dynamicComponent}>
            {componentMap[selectedSetting] || (
              <p>Bu ayar mobilde desteklenmiyor.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
