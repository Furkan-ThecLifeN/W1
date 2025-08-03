import React, { useState } from 'react';
import { FaYoutube, FaTwitch, FaTiktok, FaSpotify, FaKickstarterK } from 'react-icons/fa';
import { AiOutlineDisconnect } from 'react-icons/ai';
import styles from './Accounts.module.css';

const Accounts = () => {
  const [connectedAccounts, setConnectedAccounts] = useState({
    youtube: false,
    twitch: false,
    tiktok: false,
    spotify: false,
    kick: false
  });

  const toggleAccountConnection = (platform) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div className={styles.accounts}>
      <h1 className={styles.pageTitle}>Hesap Bağlama</h1>
      <p className={styles.sectionDescription}>Sosyal medya hesaplarınızı bağlayarak tüm içeriklerinizi tek bir yerden yönetebilirsiniz.</p>
      
      <div className={styles.accountsGrid}>
        {/* YouTube */}
        <div className={styles.accountCard}>
          <div className={styles.accountHeader}>
            <FaYoutube className={styles.accountIcon} style={{color: '#FF0000'}} />
            <h3>YouTube</h3>
          </div>
          <p className={styles.accountDescription}>Videolarınızı yönetin, analizleri görüntüleyin ve yorumlara yanıt verin.</p>
          
          {connectedAccounts.youtube ? (
            <div className={styles.connectedStatus}>
              <span className={styles.connectedText}>Bağlı</span>
              <button 
                className={styles.disconnectButton}
                onClick={() => toggleAccountConnection('youtube')}
              >
                <AiOutlineDisconnect />
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              className={styles.connectButton}
              onClick={() => toggleAccountConnection('youtube')}
            >
              Bağla
            </button>
          )}
        </div>
        
        {/* Twitch */}
        <div className={styles.accountCard}>
          <div className={styles.accountHeader}>
            <FaTwitch className={styles.accountIcon} style={{color: '#9147FF'}} />
            <h3>Twitch</h3>
          </div>
          <p className={styles.accountDescription}>Canlı yayınlarınızı yönetin ve izleyici etkileşimlerini takip edin.</p>
          
          {connectedAccounts.twitch ? (
            <div className={styles.connectedStatus}>
              <span className={styles.connectedText}>Bağlı</span>
              <button 
                className={styles.disconnectButton}
                onClick={() => toggleAccountConnection('twitch')}
              >
                <AiOutlineDisconnect />
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              className={styles.connectButton}
              onClick={() => toggleAccountConnection('twitch')}
            >
              Bağla
            </button>
          )}
        </div>
        
        {/* TikTok */}
        <div className={styles.accountCard}>
          <div className={styles.accountHeader}>
            <FaTiktok className={styles.accountIcon} style={{color: '#fff'}} />
            <h3>TikTok</h3>
          </div>
          <p className={styles.accountDescription}>Kısa videolarınızı yönetin ve etkileşimleri takip edin.</p>
          
          {connectedAccounts.tiktok ? (
            <div className={styles.connectedStatus}>
              <span className={styles.connectedText}>Bağlı</span>
              <button 
                className={styles.disconnectButton}
                onClick={() => toggleAccountConnection('tiktok')}
              >
                <AiOutlineDisconnect />
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              className={styles.connectButton}
              onClick={() => toggleAccountConnection('tiktok')}
            >
              Bağla
            </button>
          )}
        </div>
        
        {/* Spotify */}
        <div className={styles.accountCard}>
          <div className={styles.accountHeader}>
            <FaSpotify className={styles.accountIcon} style={{color: '#1DB954'}} />
            <h3>Spotify</h3>
          </div>
          <p className={styles.accountDescription}>Müzik ve podcast içeriklerinizi yönetin.</p>
          
          {connectedAccounts.spotify ? (
            <div className={styles.connectedStatus}>
              <span className={styles.connectedText}>Bağlı</span>
              <button 
                className={styles.disconnectButton}
                onClick={() => toggleAccountConnection('spotify')}
              >
                <AiOutlineDisconnect />
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              className={styles.connectButton}
              onClick={() => toggleAccountConnection('spotify')}
            >
              Bağla
            </button>
          )}
        </div>
        
        {/* Kick */}
        <div className={styles.accountCard}>
          <div className={styles.accountHeader}>
            <FaKickstarterK className={styles.accountIcon} style={{color: '#53FC18'}} />
            <h3>Kick</h3>
          </div>
          <p className={styles.accountDescription}>Canlı yayın platformunuzu bağlayın ve yönetin.</p>
          
          {connectedAccounts.kick ? (
            <div className={styles.connectedStatus}>
              <span className={styles.connectedText}>Bağlı</span>
              <button 
                className={styles.disconnectButton}
                onClick={() => toggleAccountConnection('kick')}
              >
                <AiOutlineDisconnect />
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              className={styles.connectButton}
              onClick={() => toggleAccountConnection('kick')}
            >
              Bağla
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;