import React, { useState } from 'react';
import styles from './KeyboardShortcuts.module.css';

const KeyboardShortcuts = () => {
  const [activeCategory, setActiveCategory] = useState('genel');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = {
    genel: 'Genel Kontroller',
    sohbet: 'Sohbet',
    ses: 'Sesli Sohbet',
    yayın: 'Canlı Yayın',
    gezinme: 'Gezinme',
    moderasyon: 'Moderasyon'
  };

  const shortcuts = {
    genel: [
      { keys: ['Ctrl', 'K'], description: 'Hızlı geçiş menüsünü aç' },
      { keys: ['Ctrl', 'Alt', 'N'], description: 'Yeni sunucu oluştur' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Yeni grup oluştur' },
      { keys: ['Ctrl', ','], description: 'Kullanıcı ayarlarını aç' }
    ],
    sohbet: [
      { keys: ['Esc'], description: 'Mesaj yazmayı iptal et' },
      { keys: ['Ctrl', 'Enter'], description: 'Mesajı gönder (satır atlamadan)' },
      { keys: ['Shift', 'Enter'], description: 'Mesajda yeni satır ekle' },
      { keys: ['Ctrl', 'Shift', 'M'], description: 'Özel mesaj gönder' }
    ],
    ses: [
      { keys: ['Ctrl', 'Shift', 'H'], description: 'Sesli sohbete katıl' },
      { keys: ['Ctrl', 'Shift', 'L'], description: 'Sesli sohbetten ayrıl' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Mikrofonu kapat/aç' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Kulaklığı kapat/aç' }
    ],
    yayın: [
      { keys: ['Ctrl', 'Shift', 'Y'], description: 'Canlı yayına başlat' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Ekran paylaşımı başlat' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Yayını duraklat' },
      { keys: ['Ctrl', 'Shift', 'O'], description: 'Yayın ayarlarını aç' }
    ],
    gezinme: [
      { keys: ['Alt', '↑'], description: 'Önceki kanala git' },
      { keys: ['Alt', '↓'], description: 'Sonraki kanala git' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Son görüntülenen kanala git' },
      { keys: ['Ctrl', 'Alt', '↑'], description: 'Ses seviyesini artır' },
      { keys: ['Ctrl', 'Alt', '↓'], description: 'Ses seviyesini azalt' }
    ],
    moderasyon: [
      { keys: ['Ctrl', 'Shift', 'K'], description: 'Kullanıcıyı sustur' },
      { keys: ['Ctrl', 'Shift', 'B'], description: 'Kullanıcıyı yasakla' },
      { keys: ['Ctrl', 'Shift', 'A'], description: 'Yönetici yetkisi ver' },
      { keys: ['Ctrl', 'Shift', 'R'], description: 'Mesajı rapor et' }
    ]
  };

  const filteredShortcuts = Object.keys(shortcuts).reduce((acc, category) => {
    const filtered = shortcuts[category].filter(shortcut => 
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Klavye Kısayolları</h2>
        <p>Uygulamada hızlı geçiş yapmak için kullanabileceğiniz tüm kısayollar</p>
      </div>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Kısayol ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className={styles.searchIcon} viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>
      
      <div className={styles.categoryTabs}>
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            className={`${styles.tab} ${activeCategory === category ? styles.active : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {categories[category]}
          </button>
        ))}
      </div>
      
      <div className={styles.shortcutList}>
        {searchTerm ? (
          Object.keys(filteredShortcuts).length > 0 ? (
            Object.keys(filteredShortcuts).map((category) => (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{categories[category]}</h3>
                {filteredShortcuts[category].map((shortcut, index) => (
                  <div key={index} className={styles.shortcutItem}>
                    <div className={styles.keys}>
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd>{key}</kbd>
                          {i < shortcut.keys.length - 1 && <span>+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className={styles.description}>{shortcut.description}</div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <svg viewBox="0 0 24 24" className={styles.noResultsIcon}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
              </svg>
              <p>Eşleşen kısayol bulunamadı</p>
            </div>
          )
        ) : (
          shortcuts[activeCategory].map((shortcut, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    <kbd>{key}</kbd>
                    {i < shortcut.keys.length - 1 && <span>+</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className={styles.description}>{shortcut.description}</div>
            </div>
          ))
        )}
      </div>
      
      <div className={styles.footer}>
        <button className={styles.customizeButton}>
          <svg viewBox="0 0 24 24" className={styles.gearIcon}>
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Kısayolları Özelleştir
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;