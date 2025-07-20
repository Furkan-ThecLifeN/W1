import React from "react";
import styles from "../PostAdd.module.css";

const TextEditPanel = ({ media, activeMediaIndex, setMedia }) => {
  return (
    <div className={styles.textEditPanel}>
      <h4>Metin Öğeleri</h4>
      {media[activeMediaIndex].texts.map((text, i) => (
        <div key={text.id} className={styles.textEditItem}>
          <input
            type="text"
            value={text.content}
            onChange={(e) => {
              const newMedia = [...media];
              newMedia[activeMediaIndex].texts[i].content = e.target.value;
              setMedia(newMedia);
            }}
            className={styles.textEditInput}
          />
          <input
            type="color"
            value={text.color}
            onChange={(e) => {
              const newMedia = [...media];
              newMedia[activeMediaIndex].texts[i].color = e.target.value;
              setMedia(newMedia);
            }}
            className={styles.textColorInput}
          />
        </div>
      ))}
    </div>
  );
};

export default TextEditPanel;