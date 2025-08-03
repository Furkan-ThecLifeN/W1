import React, { useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiFilter, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { FaRegHandshake, FaRegComments, FaRegUser } from 'react-icons/fa';
import { RiShieldCheckLine, RiFeedbackLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CommunityCompliance.module.css';

const CommunityCompliance = () => {
  const [activeTab, setActiveTab] = useState('warnings');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Örnek veriler
  const complianceData = {
    stats: {
      totalWarnings: 12,
      activeWarnings: 3,
      resolvedIssues: 9,
      complianceScore: 87
    },
    warnings: [
      {
        id: 1,
        type: 'Uygunsuz İçerik',
        user: 'kullanici123',
        date: '15 Haz 2023',
        status: 'active',
        severity: 'high',
        rule: 'Kural 4.2: Nefret söylemi yasaktır'
      },
      {
        id: 2,
        type: 'Spam',
        user: 'reklamci99',
        date: '14 Haz 2023',
        status: 'resolved',
        severity: 'medium',
        rule: 'Kural 3.1: Tekrarlayan spam gönderimler'
      },
      {
        id: 3,
        type: 'Kişisel Saldırı',
        user: 'tartismaci42',
        date: '12 Haz 2023',
        status: 'active',
        severity: 'high',
        rule: 'Kural 2.3: Diğer kullanıcılara saygısızlık'
      },
      {
        id: 4,
        type: 'Telif Hakkı',
        user: 'paylasimci55',
        date: '10 Haz 2023',
        status: 'pending',
        severity: 'medium',
        rule: 'Kural 5.4: Telif hakkı ihlali'
      }
    ],
    rules: [
      { id: 1, category: 'Davranış', title: 'Saygılı İletişim', description: 'Diğer kullanıcılara karşı saygılı olun' },
      { id: 2, category: 'İçerik', title: 'Uygunsuz Materyal', description: 'Yetişkinlere yönelik içerik paylaşmayın' },
      { id: 3, category: 'Ticaret', title: 'İzinsiz Reklam', description: 'Yönetici onayı olmadan reklam yapmayın' },
      { id: 4, category: 'Güvenlik', title: 'Kişisel Bilgi', description: 'Başkalarının kişisel bilgilerini paylaşmayın' }
    ]
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className={`${styles.statusBadge} ${styles.active}`}><FiAlertTriangle /> Aktif</span>;
      case 'resolved':
        return <span className={`${styles.statusBadge} ${styles.resolved}`}><FiCheckCircle /> Çözüldü</span>;
      case 'pending':
        return <span className={`${styles.statusBadge} ${styles.pending}`}><FiClock /> Beklemede</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <div className={`${styles.severityIcon} ${styles.high}`}></div>;
      case 'medium':
        return <div className={`${styles.severityIcon} ${styles.medium}`}></div>;
      case 'low':
        return <div className={`${styles.severityIcon} ${styles.low}`}></div>;
      default:
        return <div className={styles.severityIcon}></div>;
    }
  };

  const filteredWarnings = selectedFilter === 'all' 
    ? complianceData.warnings 
    : complianceData.warnings.filter(warning => warning.status === selectedFilter);

  return (
    <div className={styles.container}>
      {/* Başlık ve Kontroller */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <RiShieldCheckLine className={styles.titleIcon} />
            Topluluk Kuralları Uyumluluğu
          </h1>
          <p className={styles.pageSubtitle}>Topluluk standartlarını koruma ve ihlal yönetimi</p>
        </div>
        
        <div className={styles.headerControls}>
          <button 
            className={styles.refreshButton}
            onClick={handleRefresh}
          >
            <motion.span
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1 }}
            >
              <FiRefreshCw />
            </motion.span>
          </button>
          
          <button className={styles.settingsButton}>
            <FiSettings />
          </button>
        </div>
      </div>
      
      {/* İstatistik Kartları */}
      <div className={styles.statsGrid}>
        <motion.div 
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIcon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.statInfo}>
            <h3>Toplam Uyarı</h3>
            <p>{complianceData.stats.totalWarnings}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIcon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.statInfo}>
            <h3>Aktif Uyarılar</h3>
            <p>{complianceData.stats.activeWarnings}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.statInfo}>
            <h3>Çözülenler</h3>
            <p>{complianceData.stats.resolvedIssues}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIcon}>
            <RiShieldCheckLine />
          </div>
          <div className={styles.statInfo}>
            <h3>Uyum Skoru</h3>
            <p>{complianceData.stats.complianceScore}%</p>
          </div>
        </motion.div>
      </div>
      
      {/* Tab Navigasyon */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'warnings' ? styles.active : ''}`}
          onClick={() => setActiveTab('warnings')}
        >
          <FiAlertTriangle className={styles.tabIcon} />
          Uyarılar
        </button>
        
        <button 
          className={`${styles.tabButton} ${activeTab === 'rules' ? styles.active : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <RiShieldCheckLine className={styles.tabIcon} />
          Kurallar
        </button>
        
        <button 
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaRegUser className={styles.tabIcon} />
          Riskli Kullanıcılar
        </button>
        
        <button 
          className={`${styles.tabButton} ${activeTab === 'appeals' ? styles.active : ''}`}
          onClick={() => setActiveTab('appeals')}
        >
          <RiFeedbackLine className={styles.tabIcon} />
          İtirazlar
        </button>
      </div>
      
      {/* İçerik Alanı */}
      <div className={styles.contentArea}>
        {activeTab === 'warnings' && (
          <div className={styles.warningsSection}>
            <div className={styles.sectionHeader}>
              <h2>Son İhlaller</h2>
              
              <div className={styles.filters}>
                <button 
                  className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  Tümü
                </button>
                
                <button 
                  className={`${styles.filterButton} ${selectedFilter === 'active' ? styles.active : ''}`}
                  onClick={() => setSelectedFilter('active')}
                >
                  Aktif
                </button>
                
                <button 
                  className={`${styles.filterButton} ${selectedFilter === 'resolved' ? styles.active : ''}`}
                  onClick={() => setSelectedFilter('resolved')}
                >
                  Çözülenler
                </button>
                
                <button 
                  className={`${styles.filterButton} ${selectedFilter === 'pending' ? styles.active : ''}`}
                  onClick={() => setSelectedFilter('pending')}
                >
                  Beklemede
                </button>
              </div>
            </div>
            
            <div className={styles.warningsList}>
              {filteredWarnings.map(warning => (
                <motion.div
                  key={warning.id}
                  className={styles.warningCard}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className={styles.warningHeader}>
                    <div className={styles.warningType}>
                      {getSeverityIcon(warning.severity)}
                      <h3>{warning.type}</h3>
                    </div>
                    {getStatusBadge(warning.status)}
                  </div>
                  
                  <div className={styles.warningDetails}>
                    <div className={styles.warningMeta}>
                      <p><strong>Kullanıcı:</strong> {warning.user}</p>
                      <p><strong>Tarih:</strong> {warning.date}</p>
                    </div>
                    
                    <div className={styles.warningRule}>
                      <p><strong>İhlal Edilen Kural:</strong></p>
                      <p>{warning.rule}</p>
                    </div>
                  </div>
                  
                  <div className={styles.warningActions}>
                    <button className={styles.actionButton}>Detaylar</button>
                    <button className={styles.actionButton}>İşlem Yap</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'rules' && (
          <div className={styles.rulesSection}>
            <div className={styles.sectionHeader}>
              <h2>Topluluk Kuralları</h2>
              <div className={styles.searchBox}>
                <input type="text" placeholder="Kural ara..." />
                <button className={styles.searchButton}>
                  <FiFilter />
                </button>
              </div>
            </div>
            
            <div className={styles.rulesGrid}>
              {complianceData.rules.map(rule => (
                <motion.div
                  key={rule.id}
                  className={styles.ruleCard}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={styles.ruleHeader}>
                    <span className={styles.ruleCategory}>{rule.category}</span>
                    <h3>{rule.title}</h3>
                  </div>
                  
                  <p className={styles.ruleDescription}>{rule.description}</p>
                  
                  <div className={styles.ruleFooter}>
                    <button className={styles.ruleButton}>Detaylar</button>
                    <button className={styles.ruleButton}>İhlal Bildir</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className={styles.comingSoon}>
            <h2>Riskli Kullanıcı Analizi Yakında</h2>
            <p>Bu özellik yakın gelecekte eklenecektir.</p>
          </div>
        )}
        
        {activeTab === 'appeals' && (
          <div className={styles.comingSoon}>
            <h2>İtiraz Yönetimi Yakında</h2>
            <p>Bu özellik yakın gelecekte eklenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityCompliance;