import React, { useState } from 'react';
import styles from './AddComponents.module.css'; 
import Post from './Post/PostAdd';
import FeedForm from './Feeds/FeedsAdd';
import FeelingForm from './Feelings/Feelings';
import StoryForm from './Stories/StoriesAdd';
import LiveStreamForm from './LiveStream/LiveStream';
import DraftsForm from './Drafts/Drafts'; // ✅ Yeni bileşeni içe aktar

const AddPage = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: 1,
      title: "Post",
      icon: "✏️",
      description: "Yeni bir gönderi paylaş",
      gradient: "var(--special-background05)",
      component: <Post onClose={() => setActiveComponent(null)} />
    },
    {
      id: 2,
      title: "Feeds",
      icon: "📰",
      description: "Haber akışına içerik ekle",
      gradient: "var(--special-background06)",
      component: <FeedForm onClose={() => setActiveComponent(null)} />
    },
    {
      id: 3,
      title: "Feeling",
      icon: "😊",
      description: "Duygularını ifade et",
      gradient: "var(--special-background04)",
      component: <FeelingForm onClose={() => setActiveComponent(null)} />
    },
    {
      id: 4,
      title: "Story",
      icon: "📸",
      description: "24 saatlik hikaye paylaş",
      gradient: "var(--special-background07)",
      component: <StoryForm onClose={() => setActiveComponent(null)} />
    },
    {
      id: 5,
      title: "Live Stream",
      icon: "🔴",
      description: "Canlı yayın başlat",
      gradient: "var(--special-background)",
      component: <LiveStreamForm onClose={() => setActiveComponent(null)} />
    },
    {
      id: 6,
      title: "Taslaklar",
      icon: "📂",
      description: "Kaydedilmiş ama paylaşılmamış içeriklere göz at",
      gradient: "var(--special-background08)",
      component: <DraftsForm onClose={() => setActiveComponent(null)} />
    }
  ];

  return (
    <div className={styles.addContainer}>
      {!activeComponent ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>İçerik Ekle</h1>
            <p className={styles.subtitle}>Paylaşmak istediğin içerik türünü seç</p>
          </div>
          
          <div className={styles.cardsGrid}>
            {cards.map((card) => (
              <div 
                key={card.id}
                className={`${styles.card} ${hoveredCard === card.id ? styles.hovered : ''}`}
                onClick={() => setActiveComponent(card.component)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ 
                  background: card.gradient,
                  '--card-glow': card.gradient
                }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardIcon}>{card.icon}</div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </div>
                <div className={styles.cardGlow}></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.formContainer}>
          {activeComponent}
        </div>
      )}
    </div>
  );
};

export default AddPage;
