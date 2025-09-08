import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddComponents.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

const AddPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

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
      route: "feelingadd", 
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

  const handleCardClick = (card) => {
    // Tüm kartlar için doğrudan yönlendirme kullanıyoruz
    navigate(`/create/${card.route}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${styles.card} ${hoveredCard === card.id ? styles.cardHover : ""}`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              "--card-color-rgb": card.color
                .slice(1)
                .match(/.{2}/g)
                .map((h) => parseInt(h, 16))
                .join(","),
            }}
            onClick={() => handleCardClick(card)}
          >
            <div
              className={styles.cardBorder}
              style={{ borderColor: card.color }}
            ></div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddPage;
