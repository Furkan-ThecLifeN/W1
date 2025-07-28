// components/Settings/ThemeSettings/ThemeSettings.jsx
import React, { useState } from 'react';
import styles from './ThemeSettings.module.css';

const ThemeSettings = () => {
  // Temel tema ayarları
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState('#00aaff');
  const [uiScale, setUiScale] = useState(100);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [fontFamily, setFontFamily] = useState('var(--font-main)');
  const [messageDensity, setMessageDensity] = useState('comfortable');
  const [transparencyEffects, setTransparencyEffects] = useState(true);

  // Özel tema seçenekleri
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [customCSS, setCustomCSS] = useState('');

  // Önceden tanımlanmış temalar
  const presetThemes = [
    { id: 'default', name: 'Varsayılan', colors: ['#00aaff', '#131621'] },
    { id: 'midnight', name: 'Gece Yarısı', colors: ['#7b2cbf', '#0a0a12'] },
    { id: 'sunset', name: 'Gün Batımı', colors: ['#ff7b25', '#1a1a2e'] },
    { id: 'ocean', name: 'Okyanus', colors: ['#00b4d8', '#001d3d'] },
    { id: 'forest', name: 'Orman', colors: ['#2a9d8f', '#1e2a32'] },
  ];

  const fontOptions = [
    { value: 'var(--font-main)', label: 'Varsayılan (Open Sans)' },
    { value: "'Inter', sans-serif", label: 'Inter' },
    { value: "'Roboto', sans-serif", label: 'Roboto' },
    { value: "'Poppins', sans-serif", label: 'Poppins' },
    { value: "'Fira Code', monospace", label: 'Fira Code (Monospace)' },
  ];

  const densityOptions = [
    { value: 'compact', label: 'Sıkışık' },
    { value: 'comfortable', label: 'Rahat' },
    { value: 'spacious', label: 'Geniş' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Tema ayarları kaydedildi');
    // API çağrısı veya state güncelleme işlemleri
  };

  const handleThemePresetSelect = (theme) => {
    setSelectedTheme(theme.id);
    setThemeColor(theme.colors[0]);
    // Diğer tema özelliklerini de güncelleyebilirsiniz
  };

  return (
    <form onSubmit={handleSubmit} className={styles.themeSettingsForm}>
      {/* Tema Seçimi Bölümü */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className={`fas fa-palette ${styles.sectionIcon}`}></i>
          Tema Seçimi
        </h3>
        
        <div className={styles.themePresets}>
          {presetThemes.map((theme) => (
            <div
              key={theme.id}
              className={`${styles.themePreset} ${selectedTheme === theme.id ? styles.selected : ''}`}
              onClick={() => handleThemePresetSelect(theme)}
            >
              <div 
                className={styles.themePreview}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                }}
              >
                <div className={styles.themePreviewContent}>
                  <div className={styles.themePreviewText}>Aa</div>
                  <div className={styles.themePreviewIcons}>
                    <i className="fas fa-comment"></i>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
              </div>
              <span className={styles.themeName}>{theme.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Renk Özelleştirme Bölümü */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className={`fas fa-sliders-h ${styles.sectionIcon}`}></i>
          Renk Özelleştirme
        </h3>
        
        <div className={styles.colorCustomization}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ana Tema Rengi</label>
            <div className={styles.colorPickerWrapper}>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{themeColor}</span>
              <div 
                className={styles.colorPreview} 
                style={{ backgroundColor: themeColor }}
              ></div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Arkaplan Yoğunluğu</label>
            <div className={styles.rangeSlider}>
              <input
                type="range"
                min="0"
                max="100"
                value="85"
                className={styles.slider}
              />
              <div className={styles.rangeLabels}>
                <span>Saydam</span>
                <span>Opak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Görünüm Ayarları Bölümü */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className={`fas fa-desktop ${styles.sectionIcon}`}></i>
          Görünüm Ayarları
        </h3>
        
        <div className={styles.appearanceSettings}>
          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Koyu Tema</span>
                <span className={styles.toggleDescription}>
                  Arayüzü koyu renk temasına geçirir
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Şeffaf Efektler</span>
                <span className={styles.toggleDescription}>
                  Pencere ve menülerde şeffaflık efektlerini etkinleştirir
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={transparencyEffects}
                  onChange={() => setTransparencyEffects(!transparencyEffects)}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Animasyonlar</span>
                <span className={styles.toggleDescription}>
                  Arayüz animasyonlarını etkinleştirir
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={() => setAnimationsEnabled(!animationsEnabled)}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Yazı Tipi</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className={styles.selectInput}
              style={{ fontFamily: fontFamily }}
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Arayüz Ölçeklendirme: {uiScale}%</label>
            <div className={styles.rangeSlider}>
              <input
                type="range"
                min="80"
                max="150"
                value={uiScale}
                onChange={(e) => setUiScale(e.target.value)}
                className={styles.slider}
              />
              <div className={styles.rangeLabels}>
                <span>Küçük</span>
                <span>Büyük</span>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mesaj Yoğunluğu</label>
            <div className={styles.radioGroup}>
              {densityOptions.map((option) => (
                <label key={option.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="messageDensity"
                    checked={messageDensity === option.value}
                    onChange={() => setMessageDensity(option.value)}
                  />
                  <span className={styles.radioCustom}></span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Özel CSS Bölümü */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className={`fas fa-code ${styles.sectionIcon}`}></i>
          Özel CSS
        </h3>
        
        <div className={styles.customCSS}>
          <p className={styles.sectionDescription}>
            Kendi CSS kurallarınızı ekleyerek arayüzü tamamen özelleştirin.
          </p>
          <textarea
            value={customCSS}
            onChange={(e) => setCustomCSS(e.target.value)}
            className={styles.cssEditor}
            placeholder="/* Özel CSS kurallarınızı buraya yazın */"
          ></textarea>
        </div>
      </div>

      {/* Kaydetme Butonları */}
      <div className={styles.formActions}>
        <button type="button" className={styles.resetButton}>
          Varsayılana Sıfırla
        </button>
        <button type="submit" className={styles.saveButton}>
          Ayarları Kaydet
        </button>
      </div>
    </form>
  );
};

export default ThemeSettings;