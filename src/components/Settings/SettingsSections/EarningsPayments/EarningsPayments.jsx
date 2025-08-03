import React, { useState } from 'react';
import { FiArrowUpRight, FiArrowDownRight, FiRefreshCw, FiFilter, FiChevronRight } from 'react-icons/fi';
import { FaBitcoin, FaEthereum, FaCcStripe, FaPaypal } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './EarningsPayments.module.css';

const EarningsPayments = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  // Örnek veriler
  const financialData = {
    balance: 42890,
    income: 18650,
    expenses: 8760,
    tax: 3240,
    transactions: [
      { id: 1, date: '15 Haz', description: 'YouTube Üyelik', amount: 2450, type: 'income', platform: 'Stripe', status: 'completed' },
      { id: 2, date: '14 Haz', description: 'Reklam Geliri', amount: 1820, type: 'income', platform: 'AdSense', status: 'completed' },
      { id: 3, date: '13 Haz', description: 'Vergi Kesintisi', amount: 1550, type: 'expense', platform: 'Banka', status: 'completed' },
      { id: 4, date: '12 Haz', description: 'Ekipman Alımı', amount: 3200, type: 'expense', platform: 'Kredi Kartı', status: 'pending' }
    ],
    incomeSources: [
      { name: 'Üyelikler', value: 65, color: '#00C4FF' },
      { name: 'Reklam', value: 20, color: '#00DBDE' },
      { name: 'Sponsorluk', value: 10, color: '#FC00FF' }
    ],
    monthlyTrend: [
      { name: 'Oca', income: 12000, expenses: 6500 },
      { name: 'Şub', income: 19000, expenses: 8700 },
      { name: 'Mar', income: 15000, expenses: 9200 },
      { name: 'Nis', income: 18000, expenses: 7500 },
      { name: 'May', income: 21000, expenses: 8200 },
      { name: 'Haz', income: 18650, expenses: 8760 }
    ]
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Stripe': <FaCcStripe className={styles.platformIcon} />,
      'PayPal': <FaPaypal className={styles.platformIcon} />,
      'AdSense': <div className={`${styles.platformIcon} ${styles.adsenseIcon}`}>Ad</div>,
      'Banka': <div className={`${styles.platformIcon} ${styles.bankIcon}`}>₺</div>,
      'Kredi Kartı': <div className={`${styles.platformIcon} ${styles.creditCardIcon}`}>••••</div>
    };
    return icons[platform] || <div className={styles.platformIcon}>?</div>;
  };

  return (
    <div className={styles.neoContainer}>
      {/* Başlık ve Kontroller */}
      <div className={styles.neoHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.neoTitle}>
            <span className={styles.titleGradient}>NEO</span>FINANCE
          </h1>
          <p className={styles.neoSubtitle}>Finansal hareketlerinizin holografik dashboard'u</p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.timeRangeSelector}>
            {['day', 'week', 'month', 'year'].map(range => (
              <button
                key={range}
                className={`${styles.rangeButton} ${timeRange === range ? styles.active : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          <motion.button
            className={styles.refreshButton}
            onClick={handleRefresh}
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <FiRefreshCw />
          </motion.button>
        </div>
      </div>
      
      {/* Ana İstatistik Kartları - Mobilde yığılacak */}
      <div className={styles.statsGrid}>
        {[
          { 
            title: 'Net Bakiye', 
            value: financialData.balance, 
            trend: '12.5%', 
            isPositive: true,
            chart: (
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={financialData.monthlyTrend}>
                  <Area type="monotone" dataKey="income" stroke="#00C4FF" fill="rgba(0, 196, 255, 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            )
          },
          { 
            title: 'Toplam Gelir', 
            value: financialData.income, 
            trend: '8.3%', 
            isPositive: true,
            chart: (
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie
                    data={financialData.incomeSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {financialData.incomeSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )
          },
          { 
            title: 'Toplam Gider', 
            value: financialData.expenses, 
            trend: '5.1%', 
            isPositive: false,
            chart: (
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Vergi', value: 40, color: '#FF9F1C' },
                      { name: 'Ekipman', value: 30, color: '#FF206E' },
                      { name: 'Yazılım', value: 15, color: '#0FB8B1' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { color: '#FF9F1C' },
                      { color: '#FF206E' },
                      { color: '#0FB8B1' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )
          }
        ].map((stat, index) => (
          <motion.div 
            key={index}
            className={styles.statCard}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={styles.statHeader}>
              <h3>{stat.title}</h3>
              <div className={`${styles.statTrend} ${stat.isPositive ? styles.positive : styles.negative}`}>
                {stat.isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />} {stat.trend}
              </div>
            </div>
            <p className={styles.statValue}>₺{stat.value.toLocaleString('tr-TR')}</p>
            <div className={styles.statChart}>
              {stat.chart}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Tab Navigasyon - Mobilde yatay kaydırma */}
      <div className={styles.tabNavContainer}>
        <div className={styles.tabNav}>
          {['overview', 'income', 'expenses', 'tax', 'reports'].map(tab => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* İçerik Alanı - Mobilde alt alta */}
      <div className={styles.contentGrid}>
        {/* Son İşlemler */}
        <div className={styles.recentTransactions}>
          <div className={styles.sectionHeader}>
            <h3>Son İşlemler</h3>
            <button className={styles.filterButton}>
              <FiFilter /> <span className={styles.filterText}>Filtrele</span>
            </button>
          </div>
          
          <div className={styles.transactionsList}>
            {financialData.transactions.map(transaction => (
              <motion.div
                key={transaction.id}
                className={styles.transactionCard}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={styles.transactionIcon}>
                  {getPlatformIcon(transaction.platform)}
                </div>
                
                <div className={styles.transactionDetails}>
                  <h4>{transaction.description}</h4>
                  <p>{transaction.date} • {transaction.platform}</p>
                </div>
                
                <div className={`${styles.transactionAmount} ${
                  transaction.type === 'income' ? styles.income : styles.expense
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString('tr-TR')}
                </div>
                
                <button className={styles.detailButton}>
                  <FiChevronRight />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Aylık Trend Grafiği */}
        <div className={styles.trendChart}>
          <div className={styles.sectionHeader}>
            <h3>Aylık Finansal Trend</h3>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#00C4FF' }}></div>
                <span>Gelir</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#FF206E' }}></div>
                <span>Gider</span>
              </div>
            </div>
          </div>
          
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={financialData.monthlyTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C4FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C4FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF206E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF206E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="income" stroke="#00C4FF" fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#FF206E" fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPayments;