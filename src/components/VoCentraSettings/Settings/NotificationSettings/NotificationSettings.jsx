import React, { useState, useEffect } from 'react';
import styles from './NotificationSettings.module.css';
import {
  BellRing, Bell, MessageSquare, AtSign, Phone, Server, User, Zap, MonitorDot, Mail, MessageCircleMore, Clock
} from 'lucide-react';

const initialNotificationSettings = {
  // Genel Bildirim Ayarları
  general: {
    enableAllNotifications: true,
    playSoundsForNotifications: true,
    showNotificationPreviews: true,
  },
  // Cihaz Bildirimleri / Push Ayarları
  device: {
    enableDesktopNotifications: true,
    enableMobilePushNotifications: true,
    pushNotificationTimeLimit: false,
    pushStartTime: '23:00',
    pushEndTime: '08:00',
  },
  // Tür Bazlı İzin Ayarları
  permissions: {
    messages: true,
    mentions: true,
    calls: true,
    serverAnnouncements: true,
    friendRequests: true,
    goLiveAlerts: true,
  },
  // E-Posta ve SMS Bildirimleri
  emailSms: {
    enableEmailNotifications: true,
    emailUpdates: true,
    emailFriendRequests: true,
    emailSecurityAlerts: true,
    enableSmsNotifications: false, // Varsayılan olarak kapalı
    smsLoginVerification: true,
    smsSecurityAlerts: true,
  },
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState(initialNotificationSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isChanged = JSON.stringify(settings) !== JSON.stringify(initialNotificationSettings);
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

  const handleTimeChange = (settingPath, e) => {
    handleToggleChange(settingPath, e.target.value);
  };

  const handleSaveChanges = () => {
    console.log('Bildirim ayarları kaydedildi:', settings);
    alert('Bildirim ayarlarınız başarıyla kaydedildi!');
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    if (window.confirm('Tüm değişiklikleri varsayılan ayarlara sıfırlamak istediğinizden emin misiniz?')) {
      setSettings(initialNotificationSettings);
      setHasChanges(false);
      alert('Ayarlar varsayılan değerlere sıfırlandı!');
    }
  };

  return (
    <div className={styles.notificationSettingsContainer}>
      <header className={styles.pageHeader}>
        <h1>Bildirim Ayarları</h1>
        <p>Bildirimleri sana en uygun şekilde alman için buradan kontrol edebilirsin.</p>
      </header>

      {/* Genel Bildirim Ayarları */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Bell /> Genel Bildirim Ayarları
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Tüm Bildirimleri Aç/Kapat</h4>
            <p>Uygulama genelinde tüm bildirimleri etkinleştirir veya devre dışı bırakır.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.general.enableAllNotifications}
              onChange={() => handleToggleChange('general.enableAllNotifications', !settings.general.enableAllNotifications)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Sesli Bildirimler</h4>
            <p>Bildirim geldiğinde sesli uyarı verir.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.general.playSoundsForNotifications}
              onChange={() => handleToggleChange('general.playSoundsForNotifications', !settings.general.playSoundsForNotifications)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Bildirim Önizlemeleri</h4>
            <p>Bildirim içeriğinin kısa bir önizlemesini gösterir (hassas bilgiler için kapatabilirsiniz).</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.general.showNotificationPreviews}
              onChange={() => handleToggleChange('general.showNotificationPreviews', !settings.general.showNotificationPreviews)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </section>

      {/* Sunucu Bazlı Bildirim Ayarları (Basit bir örnek, genişletilebilir) */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Server /> Sunucu Bazlı Bildirim Ayarları
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Sunucu Seçimi</h4>
            <p>Belirli bir sunucu için bildirim ayarlarını özelleştirin.</p>
          </div>
          <select className={styles.selectInput} disabled={!settings.general.enableAllNotifications}>
            <option value="">Sunucu Seç...</option>
            <option value="server1">Proje Alpha</option>
            <option value="server2">Oyun Klanı</option>
            <option value="server3">Topluluk Merkezi</option>
          </select>
        </div>
        <div className={styles.infoBox}>
          <h4>Not:</h4>
          <p>Sunucuya özel bildirim ayarları seçildikten sonra burada görünecektir. Örneğin, "Tüm Mesajlar", "Sadece @mention'lar" veya "Sessize Al" seçenekleri.</p>
        </div>
      </section>

      {/* Sessize Alma & Özel Bildirimler */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <MessageCircleMore /> Sessize Alma & Özel Bildirimler
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Belirli Kişileri Sessize Al</h4>
            <p>Seçilen kişilerden gelen bildirimleri tamamen engeller.</p>
          </div>
          <button className={styles.selectInput} disabled={!settings.general.enableAllNotifications}>Kişi Seç / Yönet</button>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Belirli Kanalları Sessize Al</h4>
            <p>Seçilen kanallardan gelen bildirimleri engeller.</p>
          </div>
          <button className={styles.selectInput} disabled={!settings.general.enableAllNotifications}>Kanal Seç / Yönet</button>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Anahtar Kelime Bildirimleri</h4>
            <p>Belirli kelimeler geçtiğinde bildirim al.</p>
          </div>
          <button className={styles.selectInput} disabled={!settings.general.enableAllNotifications}>Anahtar Kelimeleri Yönet</button>
        </div>
      </section>

      {/* Cihaz Bildirimleri / Push Ayarları */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <MonitorDot /> Cihaz Bildirimleri / Push Ayarları
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Masaüstü Bildirimleri</h4>
            <p>Uygulama kapalıyken veya arka plandayken masaüstünde bildirim gösterir.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.device.enableDesktopNotifications}
              onChange={() => handleToggleChange('device.enableDesktopNotifications', !settings.device.enableDesktopNotifications)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Mobil Cihazlara Bildirim Gönder</h4>
            <p>Uygulama dışındayken mobil cihazınıza bildirim gönderir.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.device.enableMobilePushNotifications}
              onChange={() => handleToggleChange('device.enableMobilePushNotifications', !settings.device.enableMobilePushNotifications)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4><Clock size={20} /> Bildirim Gönderme Zaman Sınırı</h4>
            <p>Belirli saatler arasında bildirim gönderilmesini engeller (örn: 23:00 - 08:00).</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.device.pushNotificationTimeLimit}
              onChange={() => handleToggleChange('device.pushNotificationTimeLimit', !settings.device.pushNotificationTimeLimit)}
              disabled={!settings.general.enableAllNotifications || (!settings.device.enableDesktopNotifications && !settings.device.enableMobilePushNotifications)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        {settings.device.pushNotificationTimeLimit && (
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <h4>Zaman Aralığı</h4>
              <p>Bildirimlerin gönderilmeyeceği başlangıç ve bitiş saatleri.</p>
            </div>
            <div className={styles.timeInputGroup}>
              <input
                type="time"
                className={styles.timeInput}
                value={settings.device.pushStartTime}
                onChange={(e) => handleTimeChange('device.pushStartTime', e)}
              />
              <span>-</span>
              <input
                type="time"
                className={styles.timeInput}
                value={settings.device.pushEndTime}
                onChange={(e) => handleTimeChange('device.pushEndTime', e)}
              />
            </div>
          </div>
        )}
      </section>

      {/* E-Posta ve SMS Bildirimleri */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Mail /> E-Posta ve SMS Bildirimleri
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>E-Posta Bildirimlerini Aç</h4>
            <p>Hesabınızla ilgili güncellemeleri ve bildirimleri e-posta ile alın.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.emailSms.enableEmailNotifications}
              onChange={() => handleToggleChange('emailSms.enableEmailNotifications', !settings.emailSms.enableEmailNotifications)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        {settings.emailSms.enableEmailNotifications && (
          <>
            <div className={styles.settingRow}>
              <div className={styles.settingLabel}>
                <h4>Hesap Güncellemeleri</h4>
                <p>Hesap etkinlikleri ve önemli bilgiler.</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={settings.emailSms.emailUpdates}
                  onChange={() => handleToggleChange('emailSms.emailUpdates', !settings.emailSms.emailUpdates)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingLabel}>
                <h4>Arkadaşlık İstekleri</h4>
                <p>Yeni arkadaşlık istekleri hakkında e-posta bildirimi al.</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={settings.emailSms.emailFriendRequests}
                  onChange={() => handleToggleChange('emailSms.emailFriendRequests', !settings.emailSms.emailFriendRequests)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingLabel}>
                <h4>Güvenlik Olayları</h4>
                <p>Şüpheli girişler veya hesap değişiklikleri gibi güvenlik uyarıları.</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={settings.emailSms.emailSecurityAlerts}
                  onChange={() => handleToggleChange('emailSms.emailSecurityAlerts', !settings.emailSms.emailSecurityAlerts)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </>
        )}

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>SMS Bildirimlerini Aç</h4>
            <p>Mobil numaranıza SMS bildirimleri gönderir (opsiyonel).</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.emailSms.enableSmsNotifications}
              onChange={() => handleToggleChange('emailSms.enableSmsNotifications', !settings.emailSms.enableSmsNotifications)}
              disabled={!settings.general.enableAllNotifications}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        {settings.emailSms.enableSmsNotifications && (
          <>
            <div className={styles.settingRow}>
              <div className={styles.settingLabel}>
                <h4>SMS Giriş Doğrulama</h4>
                <p>Giriş denemeleri için SMS ile doğrulama kodu al.</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={settings.emailSms.smsLoginVerification}
                  onChange={() => handleToggleChange('emailSms.smsLoginVerification', !settings.emailSms.smsLoginVerification)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingLabel}>
                <h4>SMS Güvenlik Uyarıları</h4>
                <p>Hesap güvenliğiyle ilgili kritik uyarıları SMS ile al.</p>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={settings.emailSms.smsSecurityAlerts}
                  onChange={() => handleToggleChange('emailSms.smsSecurityAlerts', !settings.emailSms.smsSecurityAlerts)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </>
        )}
      </section>

      {/* İpuçları ve Hatırlatmalar */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <BellRing /> İpuçları ve Hatırlatmalar
        </h2>
        <div className={styles.infoBox}>
          <h4>Önemli Bilgi:</h4>
          <p>Rahatsız Etmeyin modu etkinleştirildiğinde, sadece acil ve öncelikli olarak işaretlenmiş bildirimler size ulaşacaktır.</p>
          <p>Bildirim ayarlarınız, oturum açtığınız tüm cihazlarınıza otomatik olarak senkronize edilir ve uygulanır.</p>
        </div>
      </section>

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

export default NotificationSettings;