import React from "react";
import styles from "../PostAdd.module.css";

const StickerPanel = ({ media, activeMediaIndex, setMedia }) => {
  const stickers = ["😊", "❤️", "🔥", "🌟", "🎉", "🌈", "✨", "👍", "👏", "🙌"];

  const addSticker = (sticker) => {
    if (!media[activeMediaIndex]) return;

    const newMedia = [...media];
    newMedia[activeMediaIndex].stickers = [
      ...newMedia[activeMediaIndex].stickers,
      {
        id: Date.now(),
        emoji: sticker,
        position: { x: 50, y: 50 },
        size: 1.0,
        rotation: 0,
      },
    ];
    setMedia(newMedia);
  };

  return (
    <div className={styles.stickerPanel}>
      {stickers.map((sticker, i) => (
        <button
          key={i}
          className={styles.stickerOption}
          onClick={() => addSticker(sticker)}
        >
          {sticker}
        </button>
      ))}
    </div>
  );
};

export default StickerPanel;