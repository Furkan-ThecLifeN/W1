// components/Settings/NotificationSettings/NotificationSettings.jsx
import React, { useState } from 'react';
import styles from './NotificationSettings.module.css';

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTypes, setNotificationTypes] = useState({
    messages: { enabled: true, sound: 'chime', preview: 'partial' },
    mentions: { enabled: true, sound: 'ping', preview: 'full' },
    calls: { enabled: true, sound: 'ring', preview: 'full' },
    server: { enabled: false, sound: 'default', preview: 'none' }
  });

  const [dndMode, setDndMode] = useState({
    enabled: false,
    schedule: { start: '23:00', end: '08:00', days: [1,2,3,4,5] },
    exceptions: { urgent: true, closeFriends: false }
  });

  const sounds = [
    { id: 'chime', name: 'Nazik Çan', icon: 'bell' },
    { id: 'ping', name: 'Dijital Ping', icon: 'wave-square' },
    { id: 'ring', name: 'Telefon Zili', icon: 'phone' },
    { id: 'default', name: 'Varsayılan', icon: 'volume-up' }
  ];

  const previewOptions = [
    { id: 'full', name: 'Tam Mesaj', icon: 'align-left' },
    { id: 'partial', name: 'Kısmi', icon: 'ellipsis-h' },
    { id: 'none', name: 'Gizli', icon: 'eye-slash' }
  ];

  const days = [
    { id: 0, name: 'Pazar', short: 'Pz' },
    { id: 1, name: 'Pazartesi', short: 'Pt' },
    { id: 2, name: 'Salı', short: 'Sa' },
    { id: 3, name: 'Çarşamba', short: 'Ça' },
    { id: 4, name: 'Perşembe', short: 'Pe' },
    { id: 5, name: 'Cuma', short: 'Cu' },
    { id: 6, name: 'Cumartesi', short: 'Ct' }
  ];

  const toggleNotificationType = (type) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled }
    }));
  };

  const updateNotificationSetting = (type, field, value) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const toggleDndDay = (dayId) => {
    setDndMode(prev => ({
      ...prev,
      schedule: { 
        ...prev.schedule, 
        days: prev.schedule.days.includes(dayId)
          ? prev.schedule.days.filter(d => d !== dayId)
          : [...prev.schedule.days, dayId]
      }
    }));
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <h2 className={styles.bellIcon}>W1</h2>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Bildirim Ayarları</h1>
            <p className={styles.subtitle}>Bildirim tercihlerinizi kişiselleştirin</p>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Global Settings */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Genel Ayarlar</h2>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.sectionDescription}>
              Tüm bildirimleri etkinleştir veya devre dışı bırak
            </p>
          </div>

          {/* Notification Types */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Bildirim Türleri</h2>
            
            {Object.entries(notificationTypes).map(([key, value]) => {
              const labels = {
                messages: { title: 'Özel Mesajlar', desc: 'Size gönderilen direkt mesajlar' },
                mentions: { title: 'Bahsetmeler', desc: 'İsminizin geçtiği mesajlar' },
                calls: { title: 'Sesli Aramalar', desc: 'Gelen çağrı ve katılma istekleri' },
                server: { title: 'Sunucu Bildirimleri', desc: 'Sunucu etkinlikleri ve duyurular' }
              };
              
              return (
                <div key={key} className={styles.notificationType}>
                  <div className={styles.typeHeader}>
                    <div className={styles.typeToggle}>
                      <label className={styles.toggleSmall}>
                        <input
                          type="checkbox"
                          checked={value.enabled && notificationsEnabled}
                          onChange={() => toggleNotificationType(key)}
                          disabled={!notificationsEnabled}
                        />
                        <span className={styles.sliderSmall}></span>
                      </label>
                      <h3 className={styles.typeTitle}>{labels[key].title}</h3>
                    </div>
                    <p className={styles.typeDesc}>{labels[key].desc}</p>
                  </div>
                  
                  {value.enabled && notificationsEnabled && (
                    <div className={styles.typeSettings}>
                      <div className={styles.settingGroup}>
                        <label className={styles.settingLabel}>
                          <i className={`fas fa-${sounds.find(s => s.id === value.sound)?.icon}`}></i> Ses
                        </label>
                        <div className={styles.optionsGrid}>
                          {sounds.map(sound => (
                            <button
                              key={sound.id}
                              type="button"
                              className={`${styles.optionButton} ${value.sound === sound.id ? styles.selected : ''}`}
                              onClick={() => updateNotificationSetting(key, 'sound', sound.id)}
                            >
                              <i className={`fas fa-${sound.icon}`}></i>
                              {sound.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className={styles.settingGroup}>
                        <label className={styles.settingLabel}>
                          <i className={`fas fa-${previewOptions.find(p => p.id === value.preview)?.icon}`}></i> Önizleme
                        </label>
                        <div className={styles.optionsGrid}>
                          {previewOptions.map(option => (
                            <button
                              key={option.id}
                              type="button"
                              className={`${styles.optionButton} ${value.preview === option.id ? styles.selected : ''}`}
                              onClick={() => updateNotificationSetting(key, 'preview', option.id)}
                            >
                              <i className={`fas fa-${option.icon}`}></i>
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Do Not Disturb */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Rahatsız Etmeyen Modu</h2>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  checked={dndMode.enabled}
                  onChange={() => setDndMode(prev => ({ ...prev, enabled: !prev.enabled }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            
            {dndMode.enabled && (
              <div className={styles.dndSettings}>
                <div className={styles.timeRow}>
                  <div className={styles.timeInput}>
                    <label>Başlangıç</label>
                    <input
                      type="time"
                      value={dndMode.schedule.start}
                      onChange={(e) => setDndMode(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div className={styles.timeInput}>
                    <label>Bitiş</label>
                    <input
                      type="time"
                      value={dndMode.schedule.end}
                      onChange={(e) => setDndMode(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div className={styles.daysContainer}>
                  <label>Günler</label>
                  <div className={styles.daysGrid}>
                    {days.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        className={`${styles.dayButton} ${dndMode.schedule.days.includes(day.id) ? styles.selected : ''}`}
                        onClick={() => toggleDndDay(day.id)}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={styles.exceptions}>
                  <h3 className={styles.exceptionsTitle}>İstisnalar</h3>
                  <div className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id="urgentNotifications"
                      checked={dndMode.exceptions.urgent}
                      onChange={() => setDndMode(prev => ({
                        ...prev,
                        exceptions: { ...prev.exceptions, urgent: !prev.exceptions.urgent }
                      }))}
                    />
                    <label htmlFor="urgentNotifications">Acil Bildirimler</label>
                  </div>
                  <div className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id="closeFriends"
                      checked={dndMode.exceptions.closeFriends}
                      onChange={() => setDndMode(prev => ({
                        ...prev,
                        exceptions: { ...prev.exceptions, closeFriends: !prev.exceptions.closeFriends }
                      }))}
                    />
                    <label htmlFor="closeFriends">Yakın Arkadaşlar</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;