import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiSun, 
  FiMoon, 
  FiStar, 
  FiCheck, 
  FiDroplet,
  FiLayers,
  FiImage
} from 'react-icons/fi';

import styles from './ThemeAppearance.module.css';

const mainThemes = [
  { name: 'light', icon: <FiSun />, label: 'Light Theme' },
  { name: 'dark', icon: <FiMoon />, label: 'Dark Theme' },
  { name: 'special', icon: <FiStar />, label: 'Special Themes' }
];

const colorThemes = [
  { name: 'blue', value: '#00AAFF' },
  { name: 'emerald', value: '#10B981' },
  { name: 'rose', value: '#F43F5E' },
  { name: 'amber', value: '#F59E0B' },
  { name: 'violet', value: '#8B5CF6' },
  { name: 'cyan', value: '#06B6D4' },
  { name: 'fuchsia', value: '#D946EF' },
  { name: 'teal', value: '#14B8A6' },
  { name: 'lime', value: '#84CC16' },
  { name: 'indigo', value: '#6366F1' },
  { name: 'pink', value: '#EC4899' },
  { name: 'orange', value: '#F97316' }
];

const specialThemes = [
  { name: 'oceanBreeze', label: 'Ocean Breeze', gradient: 'var(--special-background)', textColor: '#0b0b0b' },
  { name: 'deepSpace', label: 'Deep Space', gradient: 'var(--special-background02)', textColor: '#ffffff' },
  { name: 'metalGray', label: 'Metal Gray', gradient: 'var(--special-background03)', textColor: '#ffffff' },
  { name: 'pinkDream', label: 'Pink Dream', gradient: 'var(--special-background04)', textColor: '#0b0b0b' },
  { name: 'blueHorizon', label: 'Blue Horizon', gradient: 'var(--special-background05)', textColor: '#ffffff' },
  { name: 'purpleHaze', label: 'Purple Haze', gradient: 'var(--special-background06)', textColor: '#ffffff' },
  { name: 'royalPurple', label: 'Royal Purple', gradient: 'var(--special-background07)', textColor: '#ffffff' },
  { name: 'lightFog', label: 'Light Fog', gradient: 'var(--special-background08)', textColor: '#0b0b0b' }
];

const ThemeCard = React.memo(({ theme, active, onClick }) => {
  return (
    <button
      type="button"
      className={`${styles.themeCard} ${active ? styles.active : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={theme.label}
    >
      <div className={`${styles.themePreview} ${styles[theme.name]}`}>
        <div className={styles.themeHeader}></div>
        <div className={styles.themeContent}>
          <div className={styles.themeRow}></div>
          <div className={styles.themeRow}></div>
          <div className={styles.themeRow}></div>
        </div>
      </div>
      <div className={styles.themeInfo}>
        <span className={styles.themeIcon}>{theme.icon}</span>
        <span>{theme.label}</span>
        {active && (
          <span className={styles.activeBadge}>
            <FiCheck />
          </span>
        )}
      </div>
    </button>
  );
});

const SpecialThemeCard = React.memo(({ theme, active, onClick }) => {
  return (
    <button
      type="button"
      className={`${styles.specialCard} ${active ? styles.active : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={theme.label}
      style={{ background: theme.gradient, color: theme.textColor }}
    >
      <div className={styles.specialPreview}>
        <div className={styles.specialHeader}></div>
        <div className={styles.specialContent}>
          <div className={styles.specialRow}></div>
          <div className={styles.specialRow}></div>
        </div>
      </div>
      <div className={styles.specialLabel}>
        {theme.label}
        {active && (
          <span className={styles.activeBadge}>
            <FiCheck />
          </span>
        )}
      </div>
    </button>
  );
});

const ColorCard = React.memo(({ color, active, onClick, isMobile }) => {
  const displayName = useMemo(() => 
    isMobile ? '' : color.name.charAt(0).toUpperCase() + color.name.slice(1),
  [color.name, isMobile]);

  return (
    <button
      type="button"
      className={`${styles.colorCard} ${active ? styles.active : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={color.name}
    >
      <div className={styles.colorPreview} style={{ backgroundColor: color.value }}>
        {active && (
          <span className={styles.colorCheck}>
            <FiCheck />
          </span>
        )}
      </div>
      <div className={styles.colorInfo}>
        <span className={styles.colorName}>{displayName}</span>
      </div>
    </button>
  );
});

const ThemeAppearance = () => {
  const [activeTheme, setActiveTheme] = useState('dark');
  const [activeColor, setActiveColor] = useState('#00AAFF');
  const [activeSpecialTheme, setActiveSpecialTheme] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Handle resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset special theme if main theme changes away from 'special'
  useEffect(() => {
    if (activeTheme !== 'special') {
      setActiveSpecialTheme(null);
    }
  }, [activeTheme]);

  // Apply theme styles to document root
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === 'light') {
      root.style.setProperty('--background-primary', '#FFFFFF');
      root.style.setProperty('--background-secondary', '#F3F4F6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--theme-bg', '#FFFFFF');
    } else if (activeTheme === 'dark') {
      root.style.setProperty('--background-primary', '#0b0b0b');
      root.style.setProperty('--background-secondary', '#1a1a1a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#ccc');
      root.style.setProperty('--border-color', '#2d2d2d');
      root.style.setProperty('--theme-bg', '#0b0b0b');
    } else if (activeTheme === 'special' && activeSpecialTheme) {
      root.style.setProperty('--background-primary', activeSpecialTheme.gradient);
      root.style.setProperty('--background-secondary', 'rgba(0,0,0,0.3)');
      root.style.setProperty('--text-primary', activeSpecialTheme.textColor);
      root.style.setProperty('--text-secondary', activeSpecialTheme.textColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)');
      root.style.setProperty('--border-color', activeSpecialTheme.textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
      root.style.setProperty('--theme-bg', activeSpecialTheme.gradient);
    }
    root.style.setProperty('--theme-color', activeColor);
  }, [activeTheme, activeColor, activeSpecialTheme]);

  const onSelectMainTheme = useCallback((themeName) => {
    setActiveTheme(themeName);
  }, []);

  const onSelectSpecialTheme = useCallback((theme) => {
    setActiveSpecialTheme(theme);
  }, []);

  const onSelectColor = useCallback((color) => {
    setActiveColor(color);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Theme & Appearance</h1>
        <p className={styles.subtitle}>Customize your application's visual style</p>
      </header>

      {/* Main Themes */}
      <section className={styles.section} aria-label="Main Themes">
        <h2 className={styles.sectionTitle}>
          <FiLayers className={styles.sectionIcon} />
          Main Themes
        </h2>
        <div className={styles.themeGrid}>
          {mainThemes.map((theme) => (
            <ThemeCard 
              key={theme.name} 
              theme={theme} 
              active={activeTheme === theme.name} 
              onClick={() => onSelectMainTheme(theme.name)} 
            />
          ))}
        </div>
      </section>

      {/* Special Themes */}
      {activeTheme === 'special' && (
        <section className={styles.section} aria-label="Special Gradient Themes">
          <h2 className={styles.sectionTitle}>
            <FiImage className={styles.sectionIcon} />
            Special Gradient Themes
          </h2>
          <div className={styles.specialGrid}>
            {specialThemes.map((theme) => (
              <SpecialThemeCard 
                key={theme.name} 
                theme={theme} 
                active={activeSpecialTheme?.name === theme.name} 
                onClick={() => onSelectSpecialTheme(theme)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Color Themes */}
      <section className={styles.section} aria-label="Accent Colors">
        <h2 className={styles.sectionTitle}>
          <FiDroplet className={styles.sectionIcon} />
          Accent Colors
        </h2>
        <div className={styles.colorGrid}>
          {colorThemes.map((color) => (
            <ColorCard 
              key={color.name} 
              color={color} 
              active={activeColor === color.value} 
              onClick={() => onSelectColor(color.value)} 
              isMobile={isMobile} 
            />
          ))}
        </div>
      </section>

      {/* Live Preview */}
      <section className={styles.section} aria-label="Live Preview">
        <h2 className={styles.sectionTitle}>Live Preview</h2>
        <div className={styles.previewContainer}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <h3>Sample Component</h3>
              <button 
                type="button"
                className={styles.previewButton}
                style={{ backgroundColor: activeColor }}
              >
                Action
              </button>
            </div>
            <div className={styles.previewContent}>
              <p>This is how UI elements will appear with your selected theme.</p>
              <div 
                className={styles.previewAlert}
                style={{ borderLeftColor: activeColor }}
              >
                <strong>Note:</strong> This is an example notification.
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Status:</span>
                <span className={styles.previewValue}>Active</span>
              </div>
            </div>
            <div className={styles.previewFooter}>
              <span>Footer section</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeAppearance;
