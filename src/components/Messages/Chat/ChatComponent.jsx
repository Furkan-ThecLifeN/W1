import React, { useRef } from "react";
import styles from "./ChatComponent.module.css";
import StoryBar from "../../StoryBar/StoryBar";

const ChatComponent = () => {
  const storyRef = useRef(null);

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
        {/* <div className={styles.storyArea} ref={storyRef}>
          <StoryBar currentUser={currentUser} />
        </div> */}
      </div>

      <div className={styles.messageArea}>
        <div className={styles.placeholder}>
          <p>Ready to connect ? Pick a conversation and start engaging.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
