import React, { useState } from "react";
import styles from "./CommentControls.module.css";

const CommentControls = () => {
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [autoModeration, setAutoModeration] = useState(false);
  const [highlightMentions, setHighlightMentions] = useState(true);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Comment Controls</h2>
      <p className={styles.description}>
        Manage how comments appear and control filters for a safer community experience.
      </p>

      <div className={styles.controlGroup}>
        <div className={styles.controlText}>
          <h4>Profanity Filter</h4>
          <p>Automatically hide offensive or inappropriate language.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={profanityFilter}
            onChange={() => setProfanityFilter(!profanityFilter)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.controlGroup}>
        <div className={styles.controlText}>
          <h4>Auto Moderation</h4>
          <p>Automatically review and moderate comments based on community guidelines.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={autoModeration}
            onChange={() => setAutoModeration(!autoModeration)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.controlGroup}>
        <div className={styles.controlText}>
          <h4>Highlight Mentions</h4>
          <p>Visually emphasize comments that mention you or your content.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={highlightMentions}
            onChange={() => setHighlightMentions(!highlightMentions)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default CommentControls;
