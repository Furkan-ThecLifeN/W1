import React, { useState } from 'react';
import { 
  FiYoutube, 
  FiMusic, 
  FiFilm, 
  FiLink, 
  FiCheck, 
  FiX,
  FiSettings,
  FiUser,
  FiGlobe
} from 'react-icons/fi';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import styles from './IntegrationSettings.module.css';

const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState({
    youtube: {
      connected: false,
      account: null,
      settings: {
        showActivity: true,
        displayOnProfile: true
      }
    },
    spotify: {
      connected: false,
      account: null,
      settings: {
        showActivity: true,
        displayOnProfile: true,
        showCurrentlyPlaying: true
      }
    },
    netflix: {
      connected: false,
      account: null,
      settings: {
        showActivity: false,
        displayOnProfile: false
      }
    }
  });

  const [activePlatform, setActivePlatform] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');

  const handleConnect = (platform) => {
    setConnectionStatus('connecting');
    setActivePlatform(platform);
    
    // Simulate API connection
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          connected: true,
          account: {
            name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} User`,
            email: `user@${platform}.com`,
            avatar: platform.charAt(0).toUpperCase()
          }
        }
      }));
      setConnectionStatus('connected');
      setTimeout(() => setConnectionStatus('idle'), 2000);
    }, 1500);
  };

  const handleDisconnect = (platform) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: false,
        account: null
      }
    }));
  };

  const toggleSetting = (platform, setting) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        settings: {
          ...prev[platform].settings,
          [setting]: !prev[platform].settings[setting]
        }
      }
    }));
  };

  const IntegrationCard = ({ platform, icon, color }) => {
    const integration = integrations[platform];
    
    return (
      <div className={styles.integrationCard}>
        <div className={styles.cardHeader} style={{ backgroundColor: color }}>
          {icon}
          <span className={styles.platformName}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
          <div className={styles.connectionStatus}>
            {integration.connected ? (
              <span className={styles.connected}>Bağlı</span>
            ) : (
              <span className={styles.disconnected}>Bağlı Değil</span>
            )}
          </div>
        </div>
        
        <div className={styles.cardBody}>
          {integration.connected ? (
            <>
              <div className={styles.accountInfo}>
                <div className={styles.avatar} style={{ backgroundColor: color }}>
                  {integration.account.avatar}
                </div>
                <div className={styles.accountDetails}>
                  <span className={styles.accountName}>{integration.account.name}</span>
                  <span className={styles.accountEmail}>{integration.account.email}</span>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4 className={styles.settingsTitle}>Ayarlar</h4>
                {Object.entries(integration.settings).map(([key, value]) => (
                  <div key={key} className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </label>
                    <button 
                      className={`${styles.toggleButton} ${value ? styles.active : ''}`}
                      onClick={() => toggleSetting(platform, key)}
                    >
                      {value ? <BsToggleOn /> : <BsToggleOff />}
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                className={styles.disconnectButton}
                onClick={() => handleDisconnect(platform)}
              >
                <FiX /> Bağlantıyı Kes
              </button>
            </>
          ) : (
            <div className={styles.connectSection}>
              <p className={styles.connectDescription}>
                {platform === 'youtube' && 'YouTube izleme geçmişinizi paylaşın ve favori kanallarınızı gösterin'}
                {platform === 'spotify' && 'Dinlediğiniz müzikleri gösterin ve müzik zevkinizi paylaşın'}
                {platform === 'netflix' && 'İzlediğiniz film ve dizileri paylaşın'}
              </p>
              <button 
                className={styles.connectButton}
                onClick={() => handleConnect(platform)}
                disabled={connectionStatus === 'connecting' && activePlatform === platform}
              >
                {connectionStatus === 'connecting' && activePlatform === platform ? (
                  'Bağlanıyor...'
                ) : (
                  <>
                    <FiLink /> {platform === 'youtube' ? 'YouTube' : platform === 'spotify' ? 'Spotify' : 'Netflix'} ile Bağlan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FiGlobe className={styles.headerIcon} />
          <h2>Entegrasyonlar</h2>
        </div>
        <p className={styles.headerDescription}>
          Hesaplarınızı bağlayarak deneyiminizi kişiselleştirin
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.integrationsGrid}>
          <IntegrationCard 
            platform="youtube" 
            icon={<FiYoutube className={styles.platformIcon} />} 
            color="var(--busy)"
          />
          <IntegrationCard 
            platform="spotify" 
            icon={<FiMusic className={styles.platformIcon} />} 
            color="var(--online)"
          />
          <IntegrationCard 
            platform="netflix" 
            icon={<FiFilm className={styles.platformIcon} />} 
            color="var(--special-background07)"
          />
        </div>

        <div className={styles.advancedSection}>
          <div className={styles.sectionHeader}>
            <FiSettings className={styles.sectionIcon} />
            <h3>Gelişmiş Ayarlar</h3>
          </div>
          
          <div className={styles.advancedSettings}>
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                Tüm entegrasyon aktivitelerini göster
              </label>
              <button className={`${styles.toggleButton} ${true ? styles.active : ''}`}>
                <BsToggleOn />
              </button>
            </div>
            
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                Bağlantı isteklerini onayla
              </label>
              <button className={`${styles.toggleButton} ${false ? styles.active : ''}`}>
                <BsToggleOff />
              </button>
            </div>
            
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                Aktivite geçmişini temizle
              </label>
              <button className={styles.actionButton}>
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;