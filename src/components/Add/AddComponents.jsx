import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddComponents.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { PiVideoFill } from "react-icons/pi";
import { FaFeatherAlt } from "react-icons/fa";
import { BsImageFill } from "react-icons/bs";
import { SiStreamlabs } from "react-icons/si";
import { MdFolderCopy } from "react-icons/md";
import { TbNumber24Small } from "react-icons/tb";
import Footer from "../Footer/Footer";

const AddPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [user, setUser] = useState(null);
  const [activeSoonId, setActiveSoonId] = useState(null); // tıklama sonrası badge gösterimi
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, [auth]);

  const cards = [
    {
      id: 1,
      title: "Story",
      icon: <TbNumber24Small />,
      description: "24 saatlik hikaye paylaş",
      route: "story",
      comingSoon: true,
    },
    {
      id: 2,
      title: "Feeds",
      icon: <PiVideoFill />,
      description: "Haber akışına içerik ekle",
      route: "feedadd",
    },
    {
      id: 3,
      title: "Feeling",
      icon: <FaFeatherAlt />,
      description: "Duygularını ifade et",
      route: "feelingadd",
    },
    {
      id: 4,
      title: "Post",
      icon: <BsImageFill />,
      description: "Yeni bir gönderi paylaş",
      route: "post",
    },
    {
      id: 5,
      title: "Live Stream",
      icon: <SiStreamlabs />,
      description: "Canlı yayın başlat",
      route: "livestream",
      comingSoon: true,
    },
    {
      id: 6,
      title: "Taslaklar",
      icon: <MdFolderCopy />,
      description: "Kaydedilmiş içerikler",
      route: "drafts",
      comingSoon: true,
    },
  ];

  const handleCardClick = (card) => {
    if (card.comingSoon) {
      setActiveSoonId(card.id);
      setTimeout(() => setActiveSoonId(null), 1600);
      return;
    }
    navigate(`/create/${card.route}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${styles.card} ${
              hoveredCard === card.id ? styles.cardHover : ""
            } ${card.comingSoon ? styles.disabledCard : ""} ${
              activeSoonId === card.id ? styles.soonActive : ""
            }`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(card)}
          >
            <div className={styles.cardBorder} />
            <div className={styles.cardGlow} />
            <div className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <div className={styles.icon}>{card.icon}</div>
              </div>

              <h3>{card.title}</h3>
              <p>{card.description}</p>

              {card.comingSoon && (
                <span
                  className={`${styles.comingSoon} ${
                    activeSoonId === card.id ? styles.comingSoonActive : ""
                  }`}
                >
                  Yakında
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddPage;
