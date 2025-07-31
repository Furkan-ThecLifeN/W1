import React, { useState } from 'react';
import { FiFilter, FiTrash2, FiAlertTriangle, FiUserX, FiClock, FiCheck, FiSliders } from 'react-icons/fi';
import { BsShieldLock, BsChatSquareText } from 'react-icons/bs';
import styles from './ModerationSettings.module.css';

const ModerationSettings = () => {
  const [activeTab, setActiveTab] = useState('filters');
  const [filterLevel, setFilterLevel] = useState('medium');
  const [customWords, setCustomWords] = useState(['küfür1', 'hakaret2', 'argo3']);
  const [newWord, setNewWord] = useState('');
  const [recentActions, setRecentActions] = useState([
    { id: 1, user: 'Kullanıcı1', action: 'Uyarı', reason: 'Küfürlü dil', date: '10 dakika önce' },
    { id: 2, user: 'Kullanıcı2', action: 'Mesaj Silme', reason: 'Reklam', date: '25 dakika önce' },
    { id: 3, user: 'Kullanıcı3', action: 'Geçici Ban', reason: 'Spam', date: '1 saat önce' }
  ]);

  const addCustomWord = () => {
    if (newWord.trim() && !customWords.includes(newWord.trim())) {
      setCustomWords([...customWords, newWord.trim()]);
      setNewWord('');
    }
  };

  const removeCustomWord = (word) => {
    setCustomWords(customWords.filter(w => w !== word));
  };

  const performAction = (action, userId) => {
    // Moderasyon aksiyonu burada gerçekleştirilebilir
    console.log(`${action} action performed on user ${userId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <BsShieldLock size={28} />
          <span>Moderasyon Paneli</span>
        </h1>
        <p className={styles.subtitle}>Sunucu güvenliği ve içerik filtreleme ayarları</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'filters' ? styles.active : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          <FiFilter size={18} />
          <span>Kelime Filtreleri</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'actions' ? styles.active : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <FiAlertTriangle size={18} />
          <span>Son Moderasyonlar</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'automod' ? styles.active : ''}`}
          onClick={() => setActiveTab('automod')}
        >
          <FiSliders size={18} />
          <span>Otomatik Moderasyon</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'filters' && (
          <div className={styles.filterSection}>
            <div className={styles.settingGroup}>
              <h2 className={styles.sectionTitle}>
                <FiFilter size={22} />
                <span>Küfür ve Argo Filtre Seviyesi</span>
              </h2>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="filterLevel" 
                    checked={filterLevel === 'low'} 
                    onChange={() => setFilterLevel('low')} 
                  />
                  <div className={styles.radioContent}>
                    <span>Hafif</span>
                    <p>Sadece aşırı küfürleri engeller</p>
                  </div>
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="filterLevel" 
                    checked={filterLevel === 'medium'} 
                    onChange={() => setFilterLevel('medium')} 
                  />
                  <div className={styles.radioContent}>
                    <span>Orta</span>
                    <p>Küfürlerin çoğunu ve bazı argo kelimeleri engeller</p>
                  </div>
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="filterLevel" 
                    checked={filterLevel === 'high'} 
                    onChange={() => setFilterLevel('high')} 
                  />
                  <div className={styles.radioContent}>
                    <span>Yüksek</span>
                    <p>Tüm küfürler, argo ve potansiyel olarak rahatsız edici kelimeler</p>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.settingGroup}>
              <h2 className={styles.sectionTitle}>
                <BsChatSquareText size={22} />
                <span>Özel Filtrelenecek Kelimeler</span>
              </h2>
              
              <div className={styles.customWordsContainer}>
                <div className={styles.wordList}>
                  {customWords.map((word, index) => (
                    <div key={index} className={styles.wordItem}>
                      <span>{word}</span>
                      <button 
                        className={styles.removeButton}
                        onClick={() => removeCustomWord(word)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className={styles.addWordForm}>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Yeni kelime ekle..."
                    className={styles.wordInput}
                  />
                  <button 
                    className={styles.addButton}
                    onClick={addCustomWord}
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className={styles.actionsSection}>
            <h2 className={styles.sectionTitle}>
              <FiAlertTriangle size={22} />
              <span>Son Moderasyon İşlemleri</span>
            </h2>
            
            <div className={styles.actionsList}>
              {recentActions.map(action => (
                <div key={action.id} className={styles.actionCard}>
                  <div className={styles.actionHeader}>
                    <span className={styles.user}>{action.user}</span>
                    <span className={`${styles.actionType} ${styles[action.action.replace(/\s+/g, '')]}`}>
                      {action.action}
                    </span>
                  </div>
                  <div className={styles.actionDetails}>
                    <p><strong>Sebep:</strong> {action.reason}</p>
                    <p><strong>Zaman:</strong> {action.date}</p>
                  </div>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.secondaryButton}
                      onClick={() => performAction('undo', action.id)}
                    >
                      <FiClock size={16} />
                      <span>Geri Al</span>
                    </button>
                    <button 
                      className={styles.primaryButton}
                      onClick={() => performAction('confirm', action.id)}
                    >
                      <FiCheck size={16} />
                      <span>Onayla</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automod' && (
          <div className={styles.autoModSection}>
            <h2 className={styles.sectionTitle}>
              <FiSliders size={22} />
              <span>Otomatik Moderasyon Ayarları</span>
            </h2>
            
            <div className={styles.autoModSettings}>
              <div className={styles.toggleGroup}>
                <label className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Spam Engelleme</h3>
                    <p>Aynı mesajın hızlı tekrarını otomatik engeller</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </label>

                <label className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Büyük Harf Engelleme</h3>
                    <p>Aşırı büyük harf kullanımını otomatik engeller</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </label>

                <label className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Link Kontrolü</h3>
                    <p>Şüpheli linkleri otomatik engeller</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </label>

                <label className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Etiket Spam Engelleme</h3>
                    <p>Çoklu kullanıcı etiketlerini otomatik engeller</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </label>
              </div>

              <div className={styles.punishmentSettings}>
                <h3>Otomatik Ceza Ayarları</h3>
                <div className={styles.punishmentOptions}>
                  <div className={styles.punishmentOption}>
                    <label>
                      <input type="radio" name="punishment" defaultChecked />
                      <span>Uyarı Ver</span>
                    </label>
                  </div>
                  <div className={styles.punishmentOption}>
                    <label>
                      <input type="radio" name="punishment" />
                      <span>Mesajı Sil</span>
                    </label>
                  </div>
                  <div className={styles.punishmentOption}>
                    <label>
                      <input type="radio" name="punishment" />
                      <span>Geçici Sustur</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationSettings;