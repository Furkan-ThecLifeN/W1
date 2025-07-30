// components/AudioActivityView/AudioActivityView.js (veya .jsx)

import React, { useState } from 'react';
import styles from './AudioActivityView.module.css';
import { Palette, User, Volume2 } from 'lucide-react'; 

const AudioActivityView = () => {
  const [selectedTheme, setSelectedTheme] = useState('var(--special-background)');
  const [userName] = useState('Deniz Akın');
  const [userStatus] = useState('Online');

  const themeOptions = [
    { name: 'Ana Başlık', gradient: 'var(--special-background)' },
    { name: 'Gökyüzü Mavisi', gradient: 'var(--special-background02)' },
    { name: 'Kömür Gri', gradient: 'var(--special-background03)' },
    { name: 'Şafak Pembesi', gradient: 'var(--special-background04)' },
    { name: 'Okyanus Esintisi', gradient: 'var(--special-background05)' },
    { name: 'Mor Rüyalar', gradient: 'var(--special-background06)' },
    { name: 'Gündoğumu', gradient: 'var(--special-background07)' },
    { name: 'Bulut Beyazı', gradient: 'var(--special-background08)' },
  ];

  const handleThemeSelect = (gradient) => {
    setSelectedTheme(gradient);
  };

  const handleApplySettings = () => {
    console.log('Ayarlar kaydedildi!');
    console.log('Seçilen Tema:', selectedTheme);
    alert('Ayarlarınız başarıyla kaydedildi!');
  };

  return (
    <div className={styles.audioActivityView}>
      <div className={styles.header}>
        <Volume2 className={styles.headerIcon} />
        <h1 className={styles.title}>Ses Aktivite Görünümü Ayarları</h1>
        <p className={styles.description}>
          Sesli sohbet sırasında kendi kartınızın diğer kullanıcılara nasıl görüneceğini özelleştirin.
        </p>
      </div>

      <div className={styles.themeSelectionSection}>
        <h2 className={styles.sectionTitle}>
          <Palette /> Kullanıcı Kartı Teması Seçimi
        </h2>
        <div className={styles.themeGrid}>
          {themeOptions.map((theme, index) => (
            <div
              key={index}
              className={`${styles.themeOption} ${selectedTheme === theme.gradient ? styles.selectedTheme : ''}`}
              onClick={() => handleThemeSelect(theme.gradient)}
            >
              <div
                className={styles.themePreviewBox}
                style={{ background: theme.gradient }}
              ></div>
              <span>{theme.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.userCardPreviewSection}>
        <h2 className={styles.sectionTitle}>
          <User /> Kullanıcı Kartı Önizlemesi
        </h2>
        <div
          className={styles.userCardContainer}
          style={{ '--user-card-theme': selectedTheme }}
        >
          <div className={styles.userAvatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userStatus}>
              <span className={`${styles.statusIcon} ${styles[`status${userStatus}`]}`}></span>
              {userStatus}
            </div>
          </div>
        </div>
        <p className={styles.description} style={{ marginTop: '20px' }}>
          Yukarıdaki kart, seçtiğiniz tema ile birlikte diğer kullanıcılara nasıl görüneceğinizin bir önizlemesidir.
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.applyButton} onClick={handleApplySettings}>
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
};

export default AudioActivityView;