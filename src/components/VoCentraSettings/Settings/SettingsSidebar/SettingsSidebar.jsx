// components/SettingsSidebar.jsx
import React from "react";
import styles from "./SettingsSidebar.module.css";

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    // GENEL
    {
      id: "theme",
      icon: "fa-palette",
      label: "Tema ve Görünüm",
      category: "Genel",
    },
    {
      id: "notifications",
      icon: "fa-bell",
      label: "Bildirimler",
      category: "Genel",
    },
    {
      id: "statusSettings",
      icon: "fa-user-circle",
      label: "Durum ve Etkinlik",
      category: "Genel",
    },

    // SES & GÖRÜNTÜ
    {
      id: "audio",
      icon: "fa-volume-up",
      label: "Ses Ayarları",
      category: "Ses & Görüntü",
    },
    {
      id: "video",
      icon: "fa-video",
      label: "Kamera Ayarları",
      category: "Ses & Görüntü",
    },
    {
      id: "voiceActivity",
      icon: "fa-wave-square",
      label: "Ses Aktivite Görünümü",
      category: "Ses & Görüntü",
    },
    // ETKİNLİKLER & AKTİVİTELER
    {
      id: "richPresence",
      icon: "fa-gamepad",
      label: "Oyun/Aktivite Durumu",
      category: "Etkinlikler",
    },
    {
      id: "nowPlaying",
      icon: "fa-play-circle",
      label: "Bağlantılar",
      category: "Etkinlikler",
    },
    // YAYINCI MODU
    {
      id: "liveStream",
      icon: "fa-broadcast-tower",
      label: "Yayıncı Modu",
      category: "Yayın",
    },
    {
      id: "screenShare",
      icon: "fa-desktop",
      label: "Ekran Paylaşımı",
      category: "Yayın",
    },

    // YÖNETİM
    {
      id: "serverManagement",
      icon: "fa-server",
      label: "Sunucularım",
      category: "Yönetim",
      role: "moderator",
    },
    {
      id: "serverRoles",
      icon: "fa-users-cog",
      label: "Yetkiler ve Roller",
      category: "Yönetim",
      role: "moderator",
    },
    {
      id: "moderation",
      icon: "fa-user-shield",
      label: "Moderasyon Paneli",
      category: "Yönetim",
      role: "moderator",
    },

    // GELİŞMİŞ
    {
      id: "integrations",
      icon: "fa-puzzle-piece",
      label: "Entegrasyonlar",
      category: "Gelişmiş",
    },
    {
      id: "developer",
      icon: "fa-code",
      label: "Geliştirici Seçenekleri",
      category: "Gelişmiş",
      role: "developer",
    },
    {
      id: "advanced",
      icon: "fa-cogs",
      label: "Gelişmiş Ayarlar",
      category: "Gelişmiş",
      role: "admin",
    },
  ];

  const categories = [...new Set(tabs.map((tab) => tab.category))]; // Benzersiz kategoriler

  // Kullanıcının rolleri (örnek veri)
  const userRoles = ["all", "premium", "moderator"];

  const filteredTabs = tabs.filter(
    (tab) => tab.role === "all" || userRoles.includes(tab.role)
  );

  const userTabs = filteredTabs.filter(
    (tab) => !["moderator", "admin"].includes(tab.role)
  );

  const adminTabs = filteredTabs.filter((tab) =>
    ["moderator", "admin"].includes(tab.role)
  );

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>AYARLAR</h3>
      </div>

      <div className={styles.sidebarSections}>
        {categories.map((category) => (
          <div key={category} className={styles.section}>
            <h4 className={styles.sectionTitle}>{category}</h4>
            <div className={styles.sectionItems}>
              {tabs
                .filter(
                  (tab) =>
                    tab.category === category &&
                    (tab.role === undefined || userRoles.includes(tab.role))
                )
                .map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tabButton} ${
                      activeTab === tab.id ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`fas ${tab.icon} ${styles.tabIcon}`} />
                    <span className={styles.tabLabel}>{tab.label}</span>
                    {tab.id === "streamer" && (
                      <span className={styles.badge}>Yeni</span>
                    )}
                    {tab.role === "admin" && (
                      <span className={styles.badgePro}>PRO</span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı bilgisi */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}></div>
          <div className={styles.userInfo}>
            <span className={styles.username}>KullanıcıAdı</span>
            <span className={styles.userStatus}>Çevrimiçi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
