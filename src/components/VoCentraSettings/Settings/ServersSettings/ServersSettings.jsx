import React, { useState } from 'react';
import { FiSettings, FiBell, FiPlus, FiSearch, FiUsers, FiShield, FiHash } from 'react-icons/fi';
import { BsRocket, BsCalendarEvent, BsMegaphone } from 'react-icons/bs';
import { RiServerLine, RiAdminLine } from 'react-icons/ri';
import styles from './ServersSettings.module.css';

const ServersSettings = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    all: true,
    mentions: true,
    none: false
  });

  // Örnek sunucu verileri
  const servers = {
    owned: [
      { id: 1, name: 'Geliştirici Topluluğu', members: 245, icon: '👨‍💻', unread: 3, isActive: true },
      { id: 2, name: 'Oyun Severler', members: 189, icon: '🎮', unread: 0, isActive: false }
    ],
    admin: [
      { id: 3, name: 'Tasarım Stüdyosu', members: 87, icon: '🎨', unread: 5, isActive: false },
      { id: 4, name: 'Müzik Kulübü', members: 112, icon: '🎵', unread: 0, isActive: false }
    ],
    member: [
      { id: 5, name: 'Yazılım Geliştirme', members: 532, icon: '💻', unread: 0, isActive: false },
      { id: 6, name: 'Sanat Topluluğu', members: 156, icon: '🖌️', unread: 12, isActive: false },
      { id: 7, name: 'Film Tartışma', members: 89, icon: '🎬', unread: 0, isActive: false }
    ]
  };

  const [activeServer, setActiveServer] = useState(servers.owned[0]);

  const handleNotificationChange = (type) => {
    setNotificationSettings({
      all: type === 'all',
      mentions: type === 'mentions',
      none: type === 'none'
    });
  };

  const filteredServers = {
    owned: servers.owned.filter(server => 
      server.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    admin: servers.admin.filter(server => 
      server.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    member: servers.member.filter(server => 
      server.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  return (
    <div className={styles.container}>
      {/* Sol Sidebar - Sunucu Listesi */}
      <div className={styles.serversSidebar}>
        <div className={styles.serversList}>
          <div className={styles.createServer}>
            <button className={styles.createButton}>
              <FiPlus size={24} />
            </button>
            <span>Sunucu Oluştur</span>
          </div>
          
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Sunucu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'owned' ? styles.active : ''}`}
              onClick={() => setActiveTab('owned')}
            >
              <RiServerLine size={18} />
              <span>Benim Sunucularım</span>
              <span className={styles.badge}>{servers.owned.length}</span>
            </button>
            
            <button 
              className={`${styles.tabButton} ${activeTab === 'admin' ? styles.active : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <RiAdminLine size={18} />
              <span>Yöneticisi Olduklarım</span>
              <span className={styles.badge}>{servers.admin.length}</span>
            </button>
            
            <button 
              className={`${styles.tabButton} ${activeTab === 'member' ? styles.active : ''}`}
              onClick={() => setActiveTab('member')}
            >
              <FiUsers size={18} />
              <span>Üyesi Olduklarım</span>
              <span className={styles.badge}>{servers.member.length}</span>
            </button>
          </div>

          <div className={styles.serverList}>
            {filteredServers[activeTab].map(server => (
              <div 
                key={server.id}
                className={`${styles.serverItem} ${server.isActive ? styles.activeServer : ''}`}
                onClick={() => setActiveServer(server)}
              >
                <div className={styles.serverIcon}>
                  {server.icon}
                  {server.unread > 0 && (
                    <span className={styles.unreadBadge}>{server.unread}</span>
                  )}
                </div>
                <div className={styles.serverInfo}>
                  <h3>{server.name}</h3>
                  <p>{server.members} üye</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ana İçerik - Sunucu Detayları */}
      <div className={styles.mainContent}>
        {activeServer && (
          <>
            <div className={styles.serverHeader}>
              <div className={styles.serverTitle}>
                <div className={styles.serverTitleIcon}>{activeServer.icon}</div>
                <h1>{activeServer.name}</h1>
              </div>
              
              <div className={styles.serverActions}>
                <button className={styles.actionButton}>
                  <FiBell size={20} />
                </button>
                <button className={styles.actionButton}>
                  <FiSettings size={20} />
                </button>
              </div>
            </div>

            <div className={styles.contentTabs}>
              <button className={`${styles.contentTab} ${styles.active}`}>
                <FiHash size={18} />
                <span>Kanallar</span>
              </button>
              <button className={styles.contentTab}>
                <BsMegaphone size={18} />
                <span>Duyurular</span>
              </button>
              <button className={styles.contentTab}>
                <BsCalendarEvent size={18} />
                <span>Etkinlikler</span>
              </button>
              <button className={styles.contentTab}>
                <BsRocket size={18} />
                <span>Sunucu Boost</span>
              </button>
            </div>

            <div className={styles.serverContent}>
              <div className={styles.serverSettings}>
                <h2 className={styles.sectionTitle}>
                  <FiSettings size={20} />
                  <span>Sunucu Ayarları</span>
                </h2>
                
                <div className={styles.settingGroup}>
                  <h3>Bildirim Ayarları</h3>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioOption}>
                      <input 
                        type="radio" 
                        name="notifications" 
                        checked={notificationSettings.all} 
                        onChange={() => handleNotificationChange('all')} 
                      />
                      <span>Tüm Bildirimler</span>
                    </label>
                    <label className={styles.radioOption}>
                      <input 
                        type="radio" 
                        name="notifications" 
                        checked={notificationSettings.mentions} 
                        onChange={() => handleNotificationChange('mentions')} 
                      />
                      <span>Sadece Bahisler</span>
                    </label>
                    <label className={styles.radioOption}>
                      <input 
                        type="radio" 
                        name="notifications" 
                        checked={notificationSettings.none} 
                        onChange={() => handleNotificationChange('none')} 
                      />
                      <span>Hiçbiri</span>
                    </label>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <h3>Sunucu İstatistikleri</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Üye Sayısı</span>
                      <span className={styles.statValue}>{activeServer.members}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Aktif Üyeler</span>
                      <span className={styles.statValue}>{Math.floor(activeServer.members * 0.3)}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Oluşturulma</span>
                      <span className={styles.statValue}>12.05.2023</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Boost Seviyesi</span>
                      <span className={styles.statValue}>1</span>
                    </div>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <h3>Hızlı Eylemler</h3>
                  <div className={styles.actionButtons}>
                    <button className={styles.secondaryButton}>
                      <BsMegaphone size={16} />
                      <span>Duyuru Yap</span>
                    </button>
                    <button className={styles.secondaryButton}>
                      <BsCalendarEvent size={16} />
                      <span>Etkinlik Oluştur</span>
                    </button>
                    <button className={styles.secondaryButton}>
                      <FiUsers size={16} />
                      <span>Üye Davet Et</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.serverActivity}>
                <h2 className={styles.sectionTitle}>
                  <BsCalendarEvent size={20} />
                  <span>Yaklaşan Etkinlikler</span>
                </h2>
                
                <div className={styles.eventsList}>
                  <div className={styles.eventCard}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>15</span>
                      <span className={styles.eventMonth}>Haz</span>
                    </div>
                    <div className={styles.eventInfo}>
                      <h3>Haftalık Toplantı</h3>
                      <p>16:00 - 17:30</p>
                      <span className={styles.eventParticipants}>24 katılımcı</span>
                    </div>
                  </div>
                  
                  <div className={styles.eventCard}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>20</span>
                      <span className={styles.eventMonth}>Haz</span>
                    </div>
                    <div className={styles.eventInfo}>
                      <h3>Oyun Gecesi</h3>
                      <p>20:00 - 23:00</p>
                      <span className={styles.eventParticipants}>42 katılımcı</span>
                    </div>
                  </div>
                </div>

                <button className={styles.createEventButton}>
                  <BsCalendarEvent size={16} />
                  <span>Yeni Etkinlik Oluştur</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServersSettings;