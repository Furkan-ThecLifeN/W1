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
      new: false
    },
    {
      id: "notifications",
      icon: "fa-bell",
      label: "Bildirimler",
      category: "Genel",
      new: true
    },
    {
      id: "statusSettings",
      icon: "fa-user-circle",
      label: "Durum ve Etkinlik",
      category: "Genel",
      new: false
    },

    // SES & GÖRÜNTÜ
    {
      id: "audio",
      icon: "fa-volume-up",
      label: "Ses Ayarları",
      category: "Ses & Görüntü",
      new: false
    },
    {
      id: "video",
      icon: "fa-video",
      label: "Kamera Ayarları",
      category: "Ses & Görüntü",
      new: false
    },
    {
      id: "voiceActivity",
      icon: "fa-wave-square",
      label: "Ses Aktivite Görünümü",
      category: "Ses & Görüntü",
      new: true
    },
    
    // ETKİNLİKLER
    {
      id: "richPresence",
      icon: "fa-gamepad",
      label: "Oyun/Aktivite Durumu",
      category: "Etkinlikler",
      new: false
    },
    {
      id: "nowPlaying",
      icon: "fa-play-circle",
      label: "Bağlantılar",
      category: "Etkinlikler",
      new: false
    },
    
    // YAYIN
    {
      id: "liveStream",
      icon: "fa-broadcast-tower",
      label: "Yayıncı Modu",
      category: "Yayın",
      new: false,
      pro: true
    },
    {
      id: "screenShare",
      icon: "fa-desktop",
      label: "Ekran Paylaşımı",
      category: "Yayın",
      new: false
    },

    // YÖNETİM
    {
      id: "serverManagement",
      icon: "fa-server",
      label: "Sunucularım",
      category: "Yönetim",
      role: "moderator",
      new: false
    },
    {
      id: "moderation",
      icon: "fa-user-shield",
      label: "Moderasyon Paneli",
      category: "Yönetim",
      role: "moderator",
      new: false
    },

    // GELİŞMİŞ
    {
      id: "integrations",
      icon: "fa-puzzle-piece",
      label: "Entegrasyonlar",
      category: "Gelişmiş",
      new: false
    },
    {
      id: "developer",
      icon: "fa-code",
      label: "Geliştirici Seçenekleri",
      category: "Gelişmiş",
      role: "developer",
      new: false
    },
    {
      id: "advanced",
      icon: "fa-cogs",
      label: "Gelişmiş Ayarlar",
      category: "Gelişmiş",
      role: "admin",
      new: false
    },
  ];

  const categories = [...new Set(tabs.map((tab) => tab.category))];
  const userRoles = ["all", "premium", "moderator"];

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>AYARLAR</h3>
      </div>

      <div className={styles.sidebarSections}>
        {categories.map((category) => {
          const categoryTabs = tabs.filter(
            (tab) => 
              tab.category === category &&
              (!tab.role || userRoles.includes(tab.role))
          );
          
          if (categoryTabs.length === 0) return null;

          return (
            <div key={category} className={styles.section}>
              <h4 className={styles.sectionTitle}>{category}</h4>
              <div className={styles.sectionItems}>
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tabButton} ${
                      activeTab === tab.id ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className={styles.tabContent}>
                      <i className={`fas ${tab.icon} ${styles.tabIcon}`} />
                      <span className={styles.tabLabel}>{tab.label}</span>
                    </div>
                    <div className={styles.tabBadges}>
                      {tab.new && <span className={styles.newBadge}>YENİ</span>}
                      {tab.pro && <span className={styles.proBadge}>PRO</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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