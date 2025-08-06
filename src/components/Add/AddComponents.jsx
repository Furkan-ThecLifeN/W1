import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddComponents.module.css";

const AddPage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      title: "Story",
      icon: "📸",
      description: "24 saatlik hikaye paylaş",
      color: "#f59e0b",
      route: "story",
    },

    {
      id: 2,
      title: "Feeds",
      icon: "📰",
      description: "Haber akışına içerik ekle",
      color: "#ec4899",
      route: "feedadd",
    },
    {
      id: 3,
      title: "Feeling",
      icon: "😊",
      description: "Duygularını ifade et",
      color: "#10b981",
      route: "feeling",
    },
    {
      id: 4,
      title: "Post",
      icon: "✏️",
      description: "Yeni bir gönderi paylaş",
      color: "#6366f1",
      route: "post",
    },

    {
      id: 5,
      title: "Live Stream",
      icon: "🔴",
      description: "Canlı yayın başlat",
      color: "#ef4444",
      route: "livestream",
    },
    {
      id: 6,
      title: "Taslaklar",
      icon: "📂",
      description: "Kaydedilmiş içerikler",
      color: "#8b5cf6",
      route: "drafts",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 data-text="İçerik Ekle">İçerik Ekle</h1>
      </div>

      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={styles.card}
            onClick={() => navigate(`/create/${card.route}`)}
            style={{ "--card-color": card.color }}
          >
            <div className={styles.cardBorder}></div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <div className={styles.cardGlow}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddPage;
