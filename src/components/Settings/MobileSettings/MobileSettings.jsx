import React, { useState } from "react";
import {
  FiSearch,
  FiChevronRight,
  FiLogOut,
  FiArrowLeft,
} from "react-icons/fi";
import styles from "./MobileSettings.module.css";

import ProfileSettings from "../SettingsSections/ProfileSettings/ProfileSettings";
import AccountTypeSettings from "../SettingsSections/AccountTypeSettings/AccountTypeSettings";
import LoginDeviceHistory from "../SettingsSections/LoginDeviceHistory/LoginDeviceHistory";
import FreezeAccount from "../SettingsSections/FreezeAccount/FreezeAccount";
import DeleteAccount from "../SettingsSections/DeleteAccount/DeleteAccount";
import LogoutAllDevices from "../SettingsSections/LogoutAllDevices/LogoutAllDevices";
import PrivacySettings from "../SettingsSections/PrivacySettings/PrivacySettings";
import CloseFriends from "../SettingsSections/CloseFriends/CloseFriends";
import BlockedUsers from "../SettingsSections/BlockedUsers/BlockedUsers";
import MessagesStoryReplies from "../SettingsSections/MessagesStoryReplies/MessagesStoryReplies";
import Licenses from "../SettingsSections/Licenses/Licenses";
import TermsAndConditions from "../SettingsSections/TermsAndConditions/TermsAndConditions";
import AboutApp from "../SettingsSections/AboutApp/AboutApp";
import BugFeedback from "../SettingsSections/BugFeedback/BugFeedback";

const componentMap = {
  "Profil Ayarları": <ProfileSettings />,
  "Hesap Türü (Bireysel / İşletme)": <AccountTypeSettings />,
  "Giriş ve Cihaz Geçmişi": <LoginDeviceHistory />,
  "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma": <FreezeAccount />,
  "Hesabı Kalıcı Olarak Sil": <DeleteAccount />,
  "Oturumu Tüm Cihazlardan Kapat": <LogoutAllDevices />,
  "Hesap Gizliliği": <PrivacySettings />,
  "Yakın Arkadaşlıklar": <CloseFriends />,
  "Engellenenler": <BlockedUsers />,
  "Mesajlar ve Hikaye Yanıtları": <MessagesStoryReplies />,
  "Lisanslar": <Licenses />,
  "Sözleşme": <TermsAndConditions />,
  "Uygulama Hakkında": <AboutApp />,
  "Hata Bildirimi ve Geri Bildirim Gönder": <BugFeedback />,
};

const allSettings = [
  "Profil Ayarları",
  "Hesap Türü (Bireysel / İşletme)",
  "Giriş ve Cihaz Geçmişi",
  "Hesap Dondurma / Geçici Olarak Devre Dışı Bırakma",
  "Hesabı Kalıcı Olarak Sil",
  "Oturumu Tüm Cihazlardan Kapat",
  "Hesap Gizliliği",
  "Yakın Arkadaşlıklar",
  "Engellenenler",
  "Mesajlar ve Hikaye Yanıtları",
  "Lisanslar",
  "Sözleşme",
  "Uygulama Hakkında",
  "Hata Bildirimi ve Geri Bildirim Gönder",
];

export default function MobileSettings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSetting, setSelectedSetting] = useState(null);

  const filteredItems = allSettings.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {!selectedSetting ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.appTitle}>W1</h1>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Ayarlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2>Settings</h2>
            </div>

            <div className={styles.scrollArea}>
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
                  <p>"{searchQuery}" için sonuç bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          <button className={styles.logoutButton}>
            <FiLogOut />
            <span>Çıkış Yap</span>
          </button>
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
              <p>Bu ayar için bir bileşen bulunamadı.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
