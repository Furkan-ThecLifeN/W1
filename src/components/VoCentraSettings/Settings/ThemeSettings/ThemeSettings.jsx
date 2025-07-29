// components/Settings/ThemeSelector/ThemeSelector.jsx
import React, { useState } from "react";
import styles from "./ThemeSettings.module.css";

const ThemeSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState("default");

  // Tema özellikleri
  const themes = [
    {
      id: "default",
      name: "Varsayılan",
      colors: {
        primary: "#00aaff",
        background: "#131621",
        userCard: "#1a1a2e",
        messageCard: "#1e1e2d",
        voiceActive: "#00aaff",
        text: "#ffffff",
      },
      preview: {
        userStatus: "online",
        messageCount: 3,
        voiceActive: true,
      },
    },
    {
      id: "midnight",
      name: "Gece Yarısı",
      colors: {
        primary: "#7b2cbf",
        background: "#0a0a12",
        userCard: "#16162a",
        messageCard: "#1a1a2e",
        voiceActive: "#9d4edd",
        text: "#f8f9fa",
      },
      preview: {
        userStatus: "idle",
        messageCount: 3,
        voiceActive: false,
      },
    },
    {
      id: "sunset",
      name: "Gün Batımı",
      colors: {
        primary: "#ff7b25",
        background: "#1a1a2e",
        userCard: "#242442",
        messageCard: "#2a2a4a",
        voiceActive: "#ff9e5e",
        text: "#ffffff",
      },
      preview: {
        userStatus: "busy",
        messageCount: 3,
        voiceActive: true,
      },
    },
    {
      id: "ocean",
      name: "Okyanus",
      colors: {
        primary: "#00b4d8",
        background: "#001d3d",
        userCard: "#003566",
        messageCard: "#003f7d",
        voiceActive: "#48cae4",
        text: "#ffffff",
      },
      preview: {
        userStatus: "online",
        messageCount: 3,
        voiceActive: true,
      },
    },
    {
      id: "forest",
      name: "Orman",
      colors: {
        primary: "#2a9d8f",
        background: "#1e2a32",
        userCard: "#2a3a45",
        messageCard: "#344955",
        voiceActive: "#4cc9b8",
        text: "#ffffff",
      },
      preview: {
        userStatus: "invisible",
        messageCount: 3,
        voiceActive: false,
      },
    },
    // 🆕 Yeni temalar:
    {
      id: "rose",
      name: "Gül Rüyası",
      colors: {
        primary: "#ff4d6d",
        background: "#2b2024",
        userCard: "#3e2c33",
        messageCard: "#4b303c",
        voiceActive: "#ff85a1",
        text: "#ffeef1",
      },
      preview: {
        userStatus: "busy",
        messageCount: 3,
        voiceActive: true,
      },
    },
    {
      id: "aurora",
      name: "Aurora",
      colors: {
        primary: "#8efeff",
        background: "#1b1f3a",
        userCard: "#2c2e4a",
        messageCard: "#3b3e5a",
        voiceActive: "#00fff5",
        text: "#e0f7fa",
      },
      preview: {
        userStatus: "idle",
        messageCount: 3,
        voiceActive: false,
      },
    },
    {
      id: "sandstorm",
      name: "Kum Fırtınası",
      colors: {
        primary: "#e0a96d",
        background: "#3a2c27",
        userCard: "#4a3932",
        messageCard: "#5c4334",
        voiceActive: "#f4c58e",
        text: "#fffaf0",
      },
      preview: {
        userStatus: "online",
        messageCount: 3,
        voiceActive: true,
      },
    },
    {
      id: "neon",
      name: "Neon Işıklar",
      colors: {
        primary: "#39ff14",
        background: "#0f0f0f",
        userCard: "#1c1c1c",
        messageCard: "#2a2a2a",
        voiceActive: "#76ff03",
        text: "#e0ffe0",
      },
      preview: {
        userStatus: "online",
        messageCount: 3,
        voiceActive: true,
      },
    },
  ];

  const statusColors = {
    online: "var(--color-green)",
    idle: "var(--idle)",
    busy: "var(--busy)",
    invisible: "#6b7280",
  };

  const userProfiles = [
    {
      username: "Merve Yılmaz",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      username: "Ahmet Demir",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      username: "Zeynep Aydın",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      username: "Emir Kaya",
      avatar: "https://randomuser.me/api/portraits/men/17.jpg",
    },
    {
      username: "Hande Kurt",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    },
  ];

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    // Burada tema değişikliğini uygulayabilirsiniz
    console.log("Selected theme:", themeId);
  };

  return (
    <div className={styles.themeSelector}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tema Seçimi</h2>
      </div>

      <div className={styles.themesGrid}>
        {themes.map((theme, index) => {
          const profile = userProfiles[index % userProfiles.length]; // Profilleri sırayla eşleştir
          return (
            <div
              key={theme.id}
              className={`${styles.themeCard} ${
                selectedTheme === theme.id ? styles.selected : ""
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div
                className={styles.themePreview}
                style={{ backgroundColor: theme.colors.background }}
              >
                {/* Kullanıcı kartı önizlemesi */}
                <div
                  className={styles.userCardPreview}
                  style={{ backgroundColor: theme.colors.userCard }}
                >
                  <div
                    className={styles.userAvatar}
                    style={{
                      backgroundImage: `url(${profile.avatar})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div className={styles.userInfo}>
                    <span
                      className={styles.username}
                      style={{ color: theme.colors.text }}
                    >
                      {profile.username}
                    </span>
                    <div className={styles.userStatusWrapper}>
                      <div
                        className={styles.userStatus}
                        style={{
                          backgroundColor:
                            statusColors[theme.preview.userStatus],
                          borderColor: theme.colors.background,
                        }}
                      ></div>
                      <span
                        className={styles.statusText}
                        style={{ color: theme.colors.text }}
                      >
                        {theme.preview.userStatus === "online" && "Çevrimiçi"}
                        {theme.preview.userStatus === "idle" && "Boşta"}
                        {theme.preview.userStatus === "busy" && "Meşgul"}
                        {theme.preview.userStatus === "invisible" && "Görünmez"}
                      </span>
                    </div>
                  </div>
                  {theme.preview.voiceActive && (
                    <div
                      className={styles.voiceIndicator}
                      style={{ backgroundColor: theme.colors.voiceActive }}
                    >
                      <i className="fas fa-microphone"></i>
                    </div>
                  )}
                </div>

                {/* Mesaj kartı önizlemesi */}
                <div className={styles.messagesPreview}>
                  {[...Array(theme.preview.messageCount)].map((_, i) => (
                    <div
                      key={i}
                      className={styles.messageCard}
                      style={{
                        backgroundColor: theme.colors.messageCard,
                        borderLeftColor: theme.colors.primary,
                      }}
                    >
                      <div className={styles.messageContent}>
                        <div
                          className={styles.messageText}
                          style={{ color: theme.colors.text }}
                        >
                          Örnek mesaj içeriği...
                        </div>
                        <div
                          className={styles.messageTime}
                          style={{ color: theme.colors.text, opacity: 0.7 }}
                        >
                          12:34
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tema renk paleti */}
                <div className={styles.colorPalette}>
                  {Object.values(theme.colors).map((color, i) => (
                    <div
                      key={i}
                      className={styles.colorSwatch}
                      style={{ backgroundColor: color }}
                      title={color}
                    ></div>
                  ))}
                </div>
              </div>

              <div className={styles.themeInfo}>
                <h3 className={styles.themeName}>{theme.name}</h3>
                <div className={styles.themeColors}>
                  <span>{theme.colors.primary}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.applyButton}>Temayı Uygula</button>
      </div>
    </div>
  );
};

export default ThemeSettings;
