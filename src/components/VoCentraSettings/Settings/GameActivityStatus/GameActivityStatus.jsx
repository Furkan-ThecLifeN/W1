import React, { useState, useEffect } from 'react';
import styles from './GameActivityStatus.module.css';
import { Gamepad, PlusCircle, Eye, Settings, XCircle } from 'lucide-react';

const initialActivitySettings = {
  displayActivityStatus: true,
  customStatus: {
    enabled: false,
    text: '',
    emoji: '',
  },
  registeredGames: [
    { id: '1', name: 'Valorant', autoDetect: true, visible: true },
    { id: '2', name: 'Cyberpunk 2077', autoDetect: false, visible: true },
  ],
  gameDetection: {
    autoDetectGames: true,
    hideSmallGames: false,
  },
};

const GameActivityStatus = () => {
  const [settings, setSettings] = useState(initialActivitySettings);
  const [newGameName, setNewGameName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isChanged = JSON.stringify(settings) !== JSON.stringify(initialActivitySettings);
    setHasChanges(isChanged);
  }, [settings]);

  const handleToggleChange = (settingPath, value) => {
    setSettings(prevSettings => {
      const update = (obj, path, val) => {
        const parts = path.split('.');
        let current = { ...obj };
        let temp = current;
        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }
        temp[parts[parts.length - 1]] = val;
        return current;
      };
      return update(prevSettings, settingPath, value);
    });
  };

  const handleTextChange = (settingPath, e) => {
    handleToggleChange(settingPath, e.target.value);
  };

  const handleAddGame = () => {
    if (newGameName.trim()) {
      setSettings(prevSettings => ({
        ...prevSettings,
        registeredGames: [
          ...prevSettings.registeredGames,
          { id: Date.now().toString(), name: newGameName.trim(), autoDetect: false, visible: true },
        ],
      }));
      setNewGameName('');
    }
  };

  const handleRemoveGame = (id) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      registeredGames: prevSettings.registeredGames.filter(game => game.id !== id),
    }));
  };

  const handleGameVisibilityToggle = (id) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      registeredGames: prevSettings.registeredGames.map(game =>
        game.id === id ? { ...game, visible: !game.visible } : game
      ),
    }));
  };

  const handleSaveChanges = () => {
    console.log('Oyun/Aktivite Durumu ayarları kaydedildi:', settings);
    alert('Ayarlarınız başarıyla kaydedildi!');
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    if (window.confirm('Tüm değişiklikleri varsayılan ayarlara sıfırlamak istediğinizden emin misiniz?')) {
      setSettings(initialActivitySettings);
      setNewGameName('');
      setHasChanges(false);
      alert('Ayarlar varsayılan değerlere sıfırlandı!');
    }
  };

  return (
    <div className={styles.gameActivityContainer}>
      {/* Üst Başlık Alanı */}
      <header className={styles.pageHeader}>
        <h1>Oyun & Aktivite Durumu</h1>
        <p>Hangi oyunu oynadığını veya ne yaptığını arkadaşlarınla paylaş.</p>
      </header>

      {/* Genel Durum Ayarları */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Eye /> Genel Durum Ayarları
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Aktivite Durumunu Görüntüle</h4>
            <p>Çevrimdışı ve gizli modda olsan bile oynamakta olduğun oyunu veya aktifliğini göster.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.displayActivityStatus}
              onChange={() => handleToggleChange('displayActivityStatus', !settings.displayActivityStatus)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </section>

      {/* Özel Durum Ayarı */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Settings /> Özel Durum Ayarı
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Özel Durum Ayarla</h4>
            <p>Oyun oynamasan bile ne yaptığını belirten kısa bir mesaj göster.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.customStatus.enabled}
              onChange={() => handleToggleChange('customStatus.enabled', !settings.customStatus.enabled)}
              disabled={!settings.displayActivityStatus}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        {settings.customStatus.enabled && settings.displayActivityStatus && (
          <div className={styles.customStatusInputGroup}>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Örn: Ders Çalışıyor, Film İzliyor..."
              value={settings.customStatus.text}
              onChange={(e) => handleTextChange('customStatus.text', e)}
              maxLength={128}
            />
            <input
              type="text"
              className={styles.emojiInput}
              placeholder="😎"
              value={settings.customStatus.emoji}
              onChange={(e) => handleTextChange('customStatus.emoji', e)}
              maxLength={2}
            />
          </div>
        )}
      </section>

      {/* Oyun Algılama Ayarları */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Gamepad /> Oyun Algılama Ayarları
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Oyunları Otomatik Algıla</h4>
            <p>Uygulama açtığın oyunları otomatik olarak algılar ve durumunda gösterir.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.gameDetection.autoDetectGames}
              onChange={() => handleToggleChange('gameDetection.autoDetectGames', !settings.gameDetection.autoDetectGames)}
              disabled={!settings.displayActivityStatus}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Küçük Oyunları Gizle</h4>
            <p>Algılanan, ancak çok kısa süre oynadığın veya arka planda çalışan küçük uygulamaları gizle.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.gameDetection.hideSmallGames}
              onChange={() => handleToggleChange('gameDetection.hideSmallGames', !settings.gameDetection.hideSmallGames)}
              disabled={!settings.displayActivityStatus || !settings.gameDetection.autoDetectGames}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </section>

      {/* Kayıtlı Oyunlar ve Uygulamalar */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <PlusCircle /> Kayıtlı Oyunlar & Uygulamalar
        </h2>
        <div className={styles.gameList}>
          {settings.registeredGames.length === 0 ? (
            <p className={styles.noGamesMessage}>Henüz kayıtlı bir oyun veya uygulama yok.</p>
          ) : (
            settings.registeredGames.map(game => (
              <div key={game.id} className={styles.gameItem}>
                <span className={styles.gameName}>{game.name}</span>
                <div className={styles.gameActions}>
                  <button
                    className={`${styles.gameActionButton} ${game.visible ? styles.visible : styles.hidden}`}
                    onClick={() => handleGameVisibilityToggle(game.id)}
                    title={game.visible ? 'Durumda Gizle' : 'Durumda Göster'}
                    disabled={!settings.displayActivityStatus}
                  >
                    {game.visible ? <Eye size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    className={styles.gameActionButton}
                    onClick={() => handleRemoveGame(game.id)}
                    title="Oyunu Kaldır"
                    disabled={!settings.displayActivityStatus}
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={styles.addGameInputGroup}>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Elle oyun ekle (örn: Photoshop)"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            disabled={!settings.displayActivityStatus}
          />
          <button className={styles.addButton} onClick={handleAddGame} disabled={!settings.displayActivityStatus || !newGameName.trim()}>
            <PlusCircle size={20} /> Ekle
          </button>
        </div>
        <div className={styles.infoBox}>
          <h4>İpucu:</h4>
          <p>Oyunun otomatik algılanmıyorsa veya profilinde belirli bir uygulamayı göstermek istiyorsan, adını buraya yazıp ekleyebilirsin.</p>
        </div>
      </section>

      {/* Kaydet & Sıfırla Butonları */}
      {hasChanges && (
        <div className={styles.floatingSaveIndicator}>
          <span>**Kaydedilmemiş Değişiklikler Var!**</span>
          <div>
            <button className={styles.resetChangesButton} onClick={handleResetChanges}>
              Sıfırla
            </button>
            <button className={styles.saveButton} onClick={handleSaveChanges}>
              Ayarları Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameActivityStatus;