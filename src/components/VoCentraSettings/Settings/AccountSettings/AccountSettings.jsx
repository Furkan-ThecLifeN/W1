// components/AccountSettings.jsx
import React, { useState } from 'react';
import styles from './AccountSettings.module.css';

const AccountSettings = () => {
  const [userData, setUserData] = useState({
    username: 'VoCentraUser',
    email: 'user@vocentra.com',
    phone: '+90 555 123 4567',
    password: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    backupCodes: ['3X7P9K', 'Q2R5T8', 'L4M6N9', 'V1W3Y5', 'Z7X9C0'],
  });

  const [activeSection, setActiveSection] = useState('general');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBackupCodes = () => {
    const codes = Array(5).fill().map(() => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    });
    setUserData(prev => ({ ...prev, backupCodes: codes }));
  };

  return (
    <div className={styles.accountContainer}>
      <div className={styles.accountHeader}>
        <h2 className={styles.accountTitle}>Hesap Ayarları</h2>
        <p className={styles.accountSubtitle}>Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
      </div>

      <div className={styles.accountContent}>
        <div className={styles.accountSidebar}>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'general' ? styles.active : ''}`}
            onClick={() => setActiveSection('general')}
          >
            <i className={`fas fa-user ${styles.sidebarIcon}`}></i>
            Genel Bilgiler
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'security' ? styles.active : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <i className={`fas fa-shield-alt ${styles.sidebarIcon}`}></i>
            Güvenlik
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'sessions' ? styles.active : ''}`}
            onClick={() => setActiveSection('sessions')}
          >
            <i className={`fas fa-desktop ${styles.sidebarIcon}`}></i>
            Aktif Oturumlar
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'connections' ? styles.active : ''}`}
            onClick={() => setActiveSection('connections')}
          >
            <i className={`fas fa-link ${styles.sidebarIcon}`}></i>
            Bağlantılar
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'danger' ? styles.active : ''}`}
            onClick={() => setActiveSection('danger')}
          >
            <i className={`fas fa-exclamation-triangle ${styles.sidebarIcon}`}></i>
            Tehlikeli Bölge
          </button>
        </div>

        <div className={styles.accountMain}>
          {activeSection === 'general' && (
            <div className={styles.sectionContent}>
              <h3 className={styles.sectionTitle}>Profil Bilgileri</h3>
              
              <div className={styles.avatarSection}>
                <div className={styles.avatarContainer}>
                  <div 
                    className={styles.avatarPreview}
                    style={{ backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}
                  >
                    {!avatarPreview && <i className="fas fa-user"></i>}
                  </div>
                  <div className={styles.avatarControls}>
                    <label className={styles.avatarUpload}>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} />
                      Avatarı Değiştir
                    </label>
                    <button className={styles.avatarRemove}>
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kullanıcı Adı</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <p className={styles.formHint}>
                  Bu, VoCentra'da görünen adınızdır. 3-32 karakter arasında olmalıdır.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>E-posta Adresi</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <p className={styles.formHint}>
                  E-posta adresinizi değiştirmek için lütfen hesabınızı doğrulayın.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Telefon Numarası</label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <p className={styles.formHint}>
                  İki faktörlü kimlik doğrulama için kullanılır.
                </p>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton}>
                  İptal
                </button>
                <button type="button" className={styles.saveButton}>
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className={styles.sectionContent}>
              <h3 className={styles.sectionTitle}>Hesap Güvenliği</h3>
              
              <div className={styles.securityCard}>
                <div className={styles.securityInfo}>
                  <h4 className={styles.securityTitle}>İki Faktörlü Kimlik Doğrulama</h4>
                  <p className={styles.securityDescription}>
                    Ek bir güvenlik katmanı için hesabınıza giriş yaparken kimlik doğrulama uygulamanızı kullanın.
                  </p>
                </div>
                <div className={styles.securityToggle}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={userData.twoFactorEnabled}
                      onChange={() => setUserData(prev => ({
                        ...prev,
                        twoFactorEnabled: !prev.twoFactorEnabled
                      }))}
                    />
                    <span className={`${styles.slider} ${styles.round}`}></span>
                  </label>
                  <span className={styles.toggleStatus}>
                    {userData.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {userData.twoFactorEnabled && (
                <div className={styles.twoFactorSection}>
                  <div className={styles.backupCodes}>
                    <h4 className={styles.backupTitle}>Yedekleme Kodları</h4>
                    <p className={styles.backupDescription}>
                      Kimlik doğrulayıcı uygulamanıza erişiminiz yoksa bu kodları kullanın. Her kod yalnızca bir kez kullanılabilir.
                    </p>
                    
                    <div className={styles.codeGrid}>
                      {userData.backupCodes.map((code, index) => (
                        <div key={index} className={styles.codeItem}>
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className={styles.generateButton}
                      onClick={generateBackupCodes}
                    >
                      Yeni Kodlar Oluştur
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.passwordSection}>
                <h4 className={styles.passwordTitle}>Şifre Değiştir</h4>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mevcut Şifre</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Yeni Şifre</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBar}></div>
                    <div className={styles.strengthText}>Zayıf</div>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton}>
                    İptal
                  </button>
                  <button type="button" className={styles.saveButton}>
                    Şifreyi Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diğer bölümler için benzer yapılar eklenebilir */}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;