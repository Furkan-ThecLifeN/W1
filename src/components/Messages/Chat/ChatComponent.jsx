import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./ChatComponent.module.css";
import StoryBar from "../../StoryBar/StoryBar";

const ChatComponent = () => {
  const storyRef = useRef(null);

  const scrollLeft = () => {
    storyRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    storyRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const currentUser = {
    id: 1,
    name: "You",
    img: "https://randomuser.me/api/portraits/men/10.jpg",
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.logoArea}>
        <h1 className={styles.logoText}>W1</h1>
      </div>

      <div className={styles.storyAreaWrapper}>
        <button
          className={styles.scrollButton + " " + styles.left}
          onClick={scrollLeft}
        >
          <FaChevronLeft />
        </button>

        <div className={styles.storyArea} ref={storyRef}>
          <StoryBar currentUser={currentUser} />{" "}
        </div>

        <button
          className={styles.scrollButton + " " + styles.right}
          onClick={scrollRight}
        >
          <FaChevronRight />
        </button>
      </div>

      <div className={styles.messageArea}>
        <div className={styles.placeholder}>
          <p>Henüz bir sohbet seçilmedi</p>
          <p>Lütfen bir sohbete tıklayın</p>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
