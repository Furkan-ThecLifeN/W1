import React, { useState } from 'react';
import styles from './TagsMentions.module.css';

const dummyData = [
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/150?img=32',
    name: 'BlueNova',
    message: 'mentioned you in a post.',
  },
  {
    id: 2,
    avatar: 'https://i.pravatar.cc/150?img=25',
    name: 'CyberCat',
    message: 'tagged you in a comment.',
  },
];

const TagsMentions = () => {
  const [activeTab, setActiveTab] = useState('tags');

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tags & Mentions</h1>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${activeTab === 'tags' ? styles.active : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            Tags
          </button>
          <button
            className={`${styles.toggleBtn} ${activeTab === 'mentions' ? styles.active : ''}`}
            onClick={() => setActiveTab('mentions')}
          >
            Mentions
          </button>
        </div>
      </div>

      <div className={styles.cardList}>
        {dummyData.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.avatar} className={styles.avatar} />
            <div className={styles.info}>
              <span className={styles.username}>{item.name}</span>
              <span className={styles.message}>{item.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsMentions;
