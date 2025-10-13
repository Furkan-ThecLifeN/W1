import React from "react";
import styles from "./MemePostCard.module.css";

const MemePostCard = ({ meme }) => {
  if (!meme || !meme.image) return null;

  return (
    <div className={styles.meme_card_container}>
      <div className={styles.meme_header}>
        <span className={styles.subreddit}>r/{meme.subreddit}</span>
        <span className={styles.upvotes}>👍 {meme.ups}</span>
      </div>

      <img src={meme.image} alt={meme.title} className={styles.meme_image} />

      <div className={styles.meme_info}>
        <h3 className={styles.meme_title}>{meme.title}</h3>
        <p className={styles.meme_author}>by u/{meme.author}</p>
        <a
          href={meme.permalink}
          className={styles.meme_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Reddit
        </a>
      </div>
    </div>
  );
};

export default MemePostCard;