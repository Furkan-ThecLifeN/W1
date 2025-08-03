import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiCalendar, FiMessageSquare, FiSettings, FiLink2, FiUser, FiMail } from 'react-icons/fi';
import { RiDashboardLine, RiLiveLine } from 'react-icons/ri';
import { BsGraphUp, BsThreeDotsVertical } from 'react-icons/bs';
import { AiOutlineDisconnect } from 'react-icons/ai';
import { FaYoutube, FaTwitch, FaTiktok, FaSpotify } from 'react-icons/fa';
import { FaKickstarterK } from "react-icons/fa";
import { Line, Bar } from 'react-chartjs-2';
import styles from './ContentCreatorPanel.module.css';

const ContentCreatorPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectedAccounts, setConnectedAccounts] = useState({
    youtube: false,
    twitch: false,
    tiktok: false,
    spotify: false,
    kick: false
  });

  // Grafik verileri
  const performanceData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
    datasets: [
      {
        label: 'Takipçi Artışı',
        data: [120, 190, 130, 170, 150, 160, 180, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420],
        borderColor: '#00dbde',
        backgroundColor: 'rgba(0, 219, 222, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const interactionData = {
    labels: ['Like', 'Yorum', 'Paylaşım', 'DM', 'Abonelik'],
    datasets: [
      {
        label: 'Etkileşimler',
        data: [120, 90, 60, 45, 30],
        backgroundColor: [
          'rgba(0, 219, 222, 0.8)',
          'rgba(252, 0, 255, 0.8)',
          'rgba(0, 170, 255, 0.8)',
          'rgba(113, 201, 248, 0.8)',
          'rgba(168, 225, 255, 0.8)'
        ],
        borderColor: [
          'rgba(0, 219, 222, 1)',
          'rgba(252, 0, 255, 1)',
          'rgba(0, 170, 255, 1)',
          'rgba(113, 201, 248, 1)',
          'rgba(168, 225, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const scheduledPosts = [
    { id: 1, platform: 'Instagram', content: 'Yeni ürün tanıtımı', date: '2023-06-15 14:00' },
    { id: 2, platform: 'Twitter', content: 'Haftalık güncelleme duyurusu', date: '2023-06-16 09:30' },
    { id: 3, platform: 'YouTube', content: 'Yeni eğitim videosu', date: '2023-06-18 18:00' }
  ];

  const recentMessages = [
    { id: 1, platform: 'Instagram', user: 'kullanici1', message: 'Ürün ne zaman gelecek?', date: '2 saat önce', read: false },
    { id: 2, platform: 'Twitter', user: 'kullanici2', message: 'Harika içerikler!', date: '5 saat önce', read: true },
    { id: 3, platform: 'YouTube', user: 'kullanici3', message: 'Yeni videoyu beğendim', date: '1 gün önce', read: true }
  ];

  const toggleAccountConnection = (platform) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logoArea}>
          <h2>İçerik Üretici Paneli</h2>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <RiDashboardLine className={styles.navIcon} />
            <span>Genel Panel</span>
          </button>
          
          <button 
            className={`${styles.navButton} ${activeTab === 'accounts' ? styles.active : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <FiLink2 className={styles.navIcon} />
            <span>Hesap Bağlama</span>
          </button>
          
          <button 
            className={`${styles.navButton} ${activeTab === 'live' ? styles.active : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <RiLiveLine className={styles.navIcon} />
            <span>Canlı Yayın</span>
          </button>
        </nav>
        
        <div className={styles.userArea}>
          <div className={styles.userAvatar}></div>
          <div className={styles.userInfo}>
            <h4>Kullanıcı Adı</h4>
            <p>@kullaniciadi</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <div className={styles.dashboard}>
            <h1 className={styles.pageTitle}>Genel Panel</h1>
            
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard} style={{background: 'var(--special-background02)'}}>
                <div className={styles.statIcon}>
                  <FiUser />
                </div>
                <div className={styles.statInfo}>
                  <h3>Toplam Takipçi</h3>
                  <p>24.5K</p>
                  <span className={styles.positive}>+12% son 30 gün</span>
                </div>
              </div>
              
              <div className={styles.statCard} style={{background: 'var(--special-background03)'}}>
                <div className={styles.statIcon}>
                  <FiMail />
                </div>
                <div className={styles.statInfo}>
                  <h3>Etkileşim Oranı</h3>
                  <p>8.2%</p>
                  <span className={styles.positive}>+2.1% son 30 gün</span>
                </div>
              </div>
              
              <div className={styles.statCard} style={{background: 'var(--special-background05)'}}>
                <div className={styles.statIcon}>
                  <FiBarChart2 />
                </div>
                <div className={styles.statInfo}>
                  <h3>Yeni Aboneler</h3>
                  <p>1.2K</p>
                  <span className={styles.positive}>+320 son 30 gün</span>
                </div>
              </div>
              
              <div className={styles.statCard} style={{background: 'var(--special-background07)'}}>
                <div className={styles.statIcon}>
                  <BsGraphUp />
                </div>
                <div className={styles.statInfo}>
                  <h3>Ort. Görüntülenme</h3>
                  <p>5.7K</p>
                  <span className={styles.negative}>-1.2% son 30 gün</span>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className={styles.chartsRow}>
              <div className={styles.chartContainer}>
                <h3>Son 30 Gün Performansı</h3>
                <Line 
                  data={performanceData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
              
              <div className={styles.chartContainer}>
                <h3>Etkileşim Dağılımı</h3>
                <Bar 
                  data={interactionData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
            
            {/* Scheduled Posts */}
            <div className={styles.scheduledPosts}>
              <div className={styles.sectionHeader}>
                <h3>Yaklaşan Yayınlar</h3>
                <button className={styles.viewAll}>Tümünü Gör</button>
              </div>
              
              <div className={styles.postsList}>
                {scheduledPosts.map(post => (
                  <div key={post.id} className={styles.postItem}>
                    <div className={styles.postDate}>
                      <FiCalendar />
                      <span>{post.date}</span>
                    </div>
                    <div className={styles.postContent}>
                      <span className={styles.postPlatform}>{post.platform}</span>
                      <p>{post.content}</p>
                    </div>
                    <button className={styles.postActions}>
                      <BsThreeDotsVertical />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'accounts' && (
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
                  <FaTiktok className={styles.accountIcon} style={{color: '#000000'}} />
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
                  <FaKickstarterK  className={styles.accountIcon} style={{color: '#53FC18'}} />
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
        )}
        
        
        {activeTab === 'live' && (
          <div className={styles.live}>
            <h1 className={styles.pageTitle}>Canlı Yayın Paneli</h1>
            <p className={styles.sectionDescription}>Canlı yayınlarınızı planlayın ve yönetin.</p>
            
            <div className={styles.liveContainer}>
              <div className={styles.liveSetup}>
                <div className={styles.livePreview}></div>
                <div className={styles.liveControls}>
                  <button className={styles.controlButton}>Yayın Başlat</button>
                  <button className={styles.controlButton}>Planla</button>
                  <button className={styles.controlButton}>Ayarlar</button>
                </div>
              </div>
              
              <div className={styles.liveStats}>
                <div className={styles.statItem}>
                  <h4>Son Yayın</h4>
                  <p>1.2K Görüntülenme</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Ort. İzleyici</h4>
                  <p>320</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Yeni Takipçi</h4>
                  <p>+45</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCreatorPanel;