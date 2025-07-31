import React, { useState } from 'react';
import { FiLink, FiX, FiChevronRight, FiCheck, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { FaYoutube, FaSpotify } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import styles from './IntegrationSettings.module.css';

const IntegrationSettings = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, service: 'youtube', username: 'kullanici123', connected: true },
    { id: 2, service: 'spotify', username: 'muziksever', connected: true },
  ]);

  const availableServices = [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: <FaYoutube className={styles.youtubeIcon} />, 
      color: '#FF0000',
      description: 'YouTube hesabınızı bağlayarak izleme geçmişinizi paylaşabilirsiniz'
    },
    { 
      id: 'spotify', 
      name: 'Spotify', 
      icon: <FaSpotify className={styles.spotifyIcon} />, 
      color: '#1DB954',
      description: 'Spotify hesabınızı bağlayarak dinlediğiniz müzikleri paylaşabilirsiniz'
    },
  ];

  const handleConnect = (serviceId) => {
    const newAccount = {
      id: Date.now(),
      service: serviceId,
      username: `user_${Math.floor(Math.random() * 1000)}`,
      connected: true
    };
    setConnectedAccounts([...connectedAccounts, newAccount]);
    setActiveModal(null);
  };

  const handleDisconnect = (accountId) => {
    setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Hesap Bağlantıları</h1>
          <p className={styles.subtitle}>Favori servislerinizi bağlayarak deneyiminizi kişiselleştirin</p>
        </div>
        <div className={styles.headerDecoration}></div>
      </div>

      <div className={styles.content}>
        <section className={styles.connectedSection}>
          <h2 className={styles.sectionTitle}>
            <FiLink className={styles.sectionIcon} />
            Bağlı Hesaplar
          </h2>
          
          {connectedAccounts.length > 0 ? (
            <div className={styles.accountsList}>
              {connectedAccounts.map(account => {
                const service = availableServices.find(s => s.id === account.service);
                return (
                  <div key={account.id} className={styles.accountCard}>
                    <div className={styles.accountBadge} style={{ backgroundColor: service.color }}>
                      {service.icon}
                    </div>
                    <div className={styles.accountInfo}>
                      <h3 className={styles.accountName}>{service.name}</h3>
                      <p className={styles.accountUser}>@{account.username}</p>
                    </div>
                    <button 
                      className={styles.disconnectButton}
                      onClick={() => handleDisconnect(account.id)}
                      aria-label="Bağlantıyı kes"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FiLink className={styles.emptyIcon} />
              <p>Henüz bağlı hesap bulunmamaktadır</p>
            </div>
          )}
        </section>

        <section className={styles.servicesSection}>
          <h2 className={styles.sectionTitle}>
            <FiLink className={styles.sectionIcon} />
            Bağlanabilir Servisler
          </h2>
          
          <div className={styles.servicesGrid}>
            {availableServices.map(service => (
              <div 
                key={service.id} 
                className={styles.serviceCard}
                onClick={() => setActiveModal(service.id)}
              >
                <div className={styles.serviceIconContainer}>
                  {service.icon}
                </div>
                <div className={styles.serviceInfo}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                </div>
                <FiChevronRight className={styles.chevronIcon} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bağlantı Modalı */}
      {activeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              className={styles.closeButton}
              onClick={() => setActiveModal(null)}
              aria-label="Kapat"
            >
              <IoMdClose />
            </button>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalServiceIcon}>
                {availableServices.find(s => s.id === activeModal)?.icon}
              </div>
              <h3 className={styles.modalTitle}>
                {availableServices.find(s => s.id === activeModal)?.name} Bağlantısı
              </h3>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.modalDescription}>
                {availableServices.find(s => s.id === activeModal)?.description}
              </p>

              <div className={styles.permissionsBox}>
                <h4 className={styles.permissionsTitle}>İzinler</h4>
                <ul className={styles.permissionsList}>
                  <li className={styles.permissionItem}>
                    <FiCheck className={styles.permissionIcon} />
                    <span>Profil bilgilerinizi görüntüleme</span>
                  </li>
                  <li className={styles.permissionItem}>
                    <FiCheck className={styles.permissionIcon} />
                    <span>Temel hesap bilgileri</span>
                  </li>
                  <li className={styles.permissionItem}>
                    <FiCheck className={styles.permissionIcon} />
                    <span>Bağlantı durumunuzu gösterme</span>
                  </li>
                </ul>
              </div>

              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setActiveModal(null)}
                >
                  İptal
                </button>
                <button 
                  className={styles.connectButton}
                  onClick={() => handleConnect(activeModal)}
                >
                  <FiExternalLink className={styles.connectIcon} />
                  {availableServices.find(s => s.id === activeModal)?.name} ile Bağlan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;