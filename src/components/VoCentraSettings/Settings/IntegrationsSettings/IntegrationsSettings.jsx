import React, { useState } from 'react';
import { FaRobot, FaMusic, FaGamepad, FaTools, FaChartLine, FaShieldAlt, FaPlus, FaTimes, FaCheck, FaServer } from 'react-icons/fa';
import { BsStars, BsFillLightningFill } from 'react-icons/bs';
import { IoMdTrendingUp } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import styles from './IntegrationsSettings.module.css';

const IntegrationsSettings = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [showServerModal, setShowServerModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  // Kategoriler
  const categories = [
    { id: 'all', name: 'Tümü', icon: <BsStars /> },
    { id: 'popular', name: 'Popüler', icon: <IoMdTrendingUp /> },
    { id: 'music', name: 'Müzik', icon: <FaMusic /> },
    { id: 'games', name: 'Oyunlar', icon: <FaGamepad /> },
    { id: 'moderation', name: 'Moderasyon', icon: <FaShieldAlt /> },
    { id: 'utility', name: 'Araçlar', icon: <FaTools /> },
    { id: 'productivity', name: 'Verimlilik', icon: <FaChartLine /> },
    { id: 'premium', name: 'Premium', icon: <BsFillLightningFill /> }
  ];

  // Örnek bot verileri
  const bots = [
    {
      id: 1,
      name: 'Müzik Master',
      description: 'Yüksek kaliteli müzik botu ile sunucunuzda kesintisiz müzik keyfi',
      category: 'music',
      icon: '🎵',
      premium: false,
      rating: 4.8,
      servers: 12500,
      tags: ['müzik', 'playlist', 'radyo']
    },
    {
      id: 2,
      name: 'ModGuard',
      description: 'Gelişmiş moderasyon araçları ile sunucunuzu güvende tutun',
      category: 'moderation',
      icon: '🛡️',
      premium: false,
      rating: 4.9,
      servers: 8700,
      tags: ['moderasyon', 'güvenlik', 'log']
    },
    {
      id: 3,
      name: 'GameHub',
      description: '50+ oyun ile sunucunuzu eğlence merkezine çevirin',
      category: 'games',
      icon: '🎮',
      premium: true,
      rating: 4.7,
      servers: 6200,
      tags: ['oyun', 'eğlence', 'quiz']
    },
    {
      id: 4,
      name: 'Productivity+',
      description: 'Takım verimliliğini artıran profesyonel araçlar',
      category: 'productivity',
      icon: '📊',
      premium: true,
      rating: 4.6,
      servers: 4300,
      tags: ['verimlilik', 'takım', 'organizasyon']
    }
  ];

  // Kullanıcının sunucuları (örnek veri)
  const userServers = [
    { id: 1, name: 'Geliştirici Topluluğu', icon: '👨‍💻', hasPermission: true },
    { id: 2, name: 'Oyun Severler', icon: '🎮', hasPermission: true },
    { id: 3, name: 'Müzik Kulübü', icon: '🎵', hasPermission: false },
    { id: 4, name: 'Sanat Topluluğu', icon: '🎨', hasPermission: true }
  ];

  // Filtrelenmiş botlar
  const filteredBots = bots.filter(bot => {
    const matchesCategory = activeCategory === 'all' || bot.category === activeCategory;
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         bot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sunucu seçme modalını aç
  const openAddBotModal = (bot) => {
    setSelectedBot(bot);
    setShowServerModal(true);
  };

  // Bot ekleme fonksiyonu
  const addBotToServer = () => {
    if (selectedServer) {
      console.log(`${selectedBot.name} botu ${selectedServer.name} sunucusuna eklendi`);
      // Burada gerçek bot ekleme işlemi yapılacak
      setShowServerModal(false);
      setSelectedServer(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Ana İçerik */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FaRobot className={styles.titleIcon} />
          <span>Bot Entegrasyonları</span>
        </h1>
        <p className={styles.subtitle}>Sunucunuzu geliştirmek için harika botlar keşfedin</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <RiSearchLine className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Bot ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryTab} ${activeCategory === category.id ? styles.active : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.botGrid}>
        {filteredBots.length > 0 ? (
          filteredBots.map(bot => (
            <div key={bot.id} className={styles.botCard}>
              <div className={styles.botHeader}>
                <div className={styles.botIcon}>{bot.icon}</div>
                <div className={styles.botInfo}>
                  <h3>{bot.name}</h3>
                  <div className={styles.botMeta}>
                    <span className={styles.rating}>⭐ {bot.rating}</span>
                    <span className={styles.servers}>📊 {bot.servers.toLocaleString()} sunucu</span>
                  </div>
                </div>
                {bot.premium && <span className={styles.premiumBadge}>PREMIUM</span>}
              </div>
              
              <div className={styles.botDescription}>
                <p>{bot.description}</p>
              </div>
              
              <div className={styles.botTags}>
                {bot.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>#{tag}</span>
                ))}
              </div>
              
              <button 
                className={styles.addButton}
                onClick={() => openAddBotModal(bot)}
              >
                <FaPlus />
                <span>Sunucuya Ekle</span>
              </button>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>Aradığınız kriterlere uygun bot bulunamadı</p>
          </div>
        )}
      </div>

      {/* Sunucu Seçim Modalı */}
      {showServerModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{selectedBot?.name} - Sunucu Seçin</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowServerModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.serverList}>
              {userServers.map(server => (
                <div 
                  key={server.id}
                  className={`${styles.serverItem} ${selectedServer?.id === server.id ? styles.selected : ''}`}
                  onClick={() => server.hasPermission && setSelectedServer(server)}
                >
                  <div className={styles.serverIcon}>{server.icon}</div>
                  <div className={styles.serverName}>{server.name}</div>
                  {server.hasPermission ? (
                    selectedServer?.id === server.id ? (
                      <FaCheck className={styles.checkIcon} />
                    ) : null
                  ) : (
                    <span className={styles.noPermission}>Yetkiniz Yok</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowServerModal(false)}
              >
                İptal
              </button>
              <button 
                className={styles.confirmButton}
                onClick={addBotToServer}
                disabled={!selectedServer}
              >
                <FaServer />
                <span>Sunucuya Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;