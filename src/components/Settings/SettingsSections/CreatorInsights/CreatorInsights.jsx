import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FiUser, FiMail, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { BsGraphUp, BsThreeDotsVertical } from 'react-icons/bs';
import styles from './CreatorInsights.module.css';

// Chart.js'in gerekli bileşenlerini kaydedin.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const CreatorInsights = () => {
  // Mock verileri burada oluşturuldu
  const performanceData = {
    labels: ['1. Gün', '5. Gün', '10. Gün', '15. Gün', '20. Gün', '25. Gün', '30. Gün'],
    datasets: [
      {
        label: 'Görüntülenme',
        data: [1200, 1900, 3000, 5000, 4000, 6000, 5700],
        borderColor: '#00c8ffff',
        backgroundColor: 'rgba(129, 140, 248, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Etkileşim',
        data: [50, 120, 250, 400, 350, 500, 480],
        borderColor: '#0dfd00ff',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ],
  };

  const interactionData = {
    labels: ['Beğenme', 'Yorum', 'Paylaşım', 'Kaydetme'],
    datasets: [
      {
        data: [450, 180, 90, 75],
        backgroundColor: ['#ff0000ff', '#ddff00ff', '#00bbffff', '#ec4899'],
        borderColor: '#1f2937',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Genel Panel</h1>

      {/* İstatistik Kartları */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.card1}`}>
          <div className={styles.statIcon}>
            <FiUser />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statInfoH3}>Toplam Takipçi</h3>
            <p className={styles.statInfoP}>24.5K</p>
            <span className={`${styles.statInfoSpan} ${styles.positive}`}>+12% son 30 gün</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.card2}`}>
          <div className={styles.statIcon}>
            <FiMail />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statInfoH3}>Etkileşim Oranı</h3>
            <p className={styles.statInfoP}>8.2%</p>
            <span className={`${styles.statInfoSpan} ${styles.positive}`}>+2.1% son 30 gün</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.card3}`}>
          <div className={styles.statIcon}>
            <FiBarChart2 />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statInfoH3}>Yeni Aboneler</h3>
            <p className={styles.statInfoP}>1.2K</p>
            <span className={`${styles.statInfoSpan} ${styles.positive}`}>+320 son 30 gün</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.card4}`}>
          <div className={styles.statIcon}>
            <BsGraphUp />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statInfoH3}>Ort. Görüntülenme</h3>
            <p className={styles.statInfoP}>5.7K</p>
            <span className={`${styles.statInfoSpan} ${styles.negative}`}>-1.2% son 30 gün</span>
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className={styles.chartsRow}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartContainerH3}>Son 30 Gün Performansı</h3>
          <Line data={performanceData} />
        </div>
        
        <div className={styles.chartContainer}>
          <h3 className={styles.chartContainerH3}>Etkileşim Dağılımı</h3>
          <Bar data={interactionData} />
        </div>
      </div>
    </div>
  );
};

export default CreatorInsights;