import React, { useState } from 'react';
import styles from './ScreenShareSettings.module.css';

const ScreenShareSettings = () => {
  const [shortcut, setShortcut] = useState('Ctrl+Shift+S');
  const [quality, setQuality] = useState('medium');
  const [frameRate, setFrameRate] = useState(30);
  const [audioShare, setAudioShare] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [cursorHighlight, setCursorHighlight] = useState(true);
  const [optimizeForGame, setOptimizeForGame] = useState(false);

  const handleShortcutChange = (e) => {
    if (e.key === 'Escape') return;
    e.preventDefault();
    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    if (e.metaKey) keys.push('Cmd');
    
    // Sadece fonksiyon tuşları ve normal tuşlar için
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      keys.push(e.key);
    }
    
    setShortcut(keys.join('+'));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ekran Paylaşım Ayarları</h1>
        <p className={styles.subtitle}>Paylaşım deneyiminizi kişiselleştirin</p>
      </div>

      <div className={styles.settingsContainer}>
        {/* Kısayol Ayarları */}
        <div className={styles.settingGroup}>
          <h2 className={styles.settingTitle}>Kısayol Tuşları</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3>Ekran Paylaşımını Başlat</h3>
              <p>Ekran paylaşımını hızlıca başlatmak için kısayol tuşu</p>
            </div>
            <div className={styles.shortcutInput} tabIndex="0" onKeyDown={handleShortcutChange}>
              {shortcut}
              <span className={styles.editHint}>Düzenlemek için tıkla</span>
            </div>
          </div>
        </div>

        {/* Kalite Ayarları */}
        <div className={styles.settingGroup}>
          <h2 className={styles.settingTitle}>Paylaşım Kalitesi</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3>Video Kalitesi</h3>
              <p>Daha yüksek kalite daha fazla bant genişliği kullanır</p>
            </div>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input 
                  type="radio" 
                  name="quality" 
                  checked={quality === 'low'} 
                  onChange={() => setQuality('low')} 
                />
                <span>Düşük (720p)</span>
              </label>
              <label className={styles.radioOption}>
                <input 
                  type="radio" 
                  name="quality" 
                  checked={quality === 'medium'} 
                  onChange={() => setQuality('medium')} 
                />
                <span>Orta (1080p)</span>
              </label>
              <label className={styles.radioOption}>
                <input 
                  type="radio" 
                  name="quality" 
                  checked={quality === 'high'} 
                  onChange={() => setQuality('high')} 
                />
                <span>Yüksek (1440p)</span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3>Kare Hızı (FPS)</h3>
              <p>Daha yüksek FPS daha akıcı görüntü sağlar</p>
            </div>
            <div className={styles.sliderContainer}>
              <input 
                type="range" 
                min="15" 
                max="60" 
                step="5" 
                value={frameRate} 
                onChange={(e) => setFrameRate(e.target.value)} 
                className={styles.qualitySlider}
              />
              <span className={styles.sliderValue}>{frameRate} FPS</span>
            </div>
          </div>
        </div>

        {/* Gelişmiş Ayarlar */}
        <div className={styles.settingGroup}>
          <h2 className={styles.settingTitle}>Gelişmiş Ayarlar</h2>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <h3>Sistem Sesini Paylaş</h3>
                <p>Bilgisayarınızdaki sesleri paylaşır</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={audioShare} 
                  onChange={() => setAudioShare(!audioShare)} 
                />
                <span className={styles.slider}></span>
              </label>
            </label>

            <label className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <h3>Önizleme Göster</h3>
                <p>Paylaşım başlamadan önce önizleme penceresi gösterir</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={showPreview} 
                  onChange={() => setShowPreview(!showPreview)} 
                />
                <span className={styles.slider}></span>
              </label>
            </label>

            <label className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <h3>Fare İmleç Vurgusu</h3>
                <p>Fare imlecinin daha görünür olmasını sağlar</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={cursorHighlight} 
                  onChange={() => setCursorHighlight(!cursorHighlight)} 
                />
                <span className={styles.slider}></span>
              </label>
            </label>

            <label className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <h3>Oyun Modu</h3>
                <p>Oyun performansını artırmak için optimize eder</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={optimizeForGame} 
                  onChange={() => setOptimizeForGame(!optimizeForGame)} 
                />
                <span className={styles.slider}></span>
              </label>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.cancelButton}>İptal</button>
        <button className={styles.saveButton}>Ayarları Kaydet</button>
      </div>
    </div>
  );
};

export default ScreenShareSettings;