import React from "react";
import styles from "../PostAdd.module.css";

const MediaPreview = ({ media, activeMediaIndex }) => {
  const getImageStyle = () => {
    if (!media[activeMediaIndex]) return {};
    
    const adjustments = media[activeMediaIndex].adjustments;
    return {
      filter: `
        brightness(${100 + adjustments.brightness}%)
        contrast(${100 + adjustments.contrast}%)
        saturate(${100 + adjustments.saturation}%)
        hue-rotate(${adjustments.temperature}deg)
      `,
    };
  };

  return (
    <div className={styles.mediaContainer}>
      <div
        className={`${styles.mediaWrapper} ${
          media[activeMediaIndex]?.filter?.class || ""
        }`}
        style={getImageStyle()}
      >
        {media[activeMediaIndex]?.type === "image" ? (
          <img
            src={media[activeMediaIndex].preview}
            alt="Post media"
            className={styles.mediaPreview}
          />
        ) : (
          <video
            src={media[activeMediaIndex].preview}
            className={styles.mediaPreview}
            controls
          />
        )}

        {media[activeMediaIndex]?.stickers.map((sticker, i) => (
          <div
            key={sticker.id}
            className={styles.sticker}
            style={{
              left: `${sticker.position.x}%`,
              top: `${sticker.position.y}%`,
              transform: `scale(${sticker.size}) rotate(${sticker.rotation}deg)`,
            }}
          >
            {sticker.emoji}
          </div>
        ))}

        {media[activeMediaIndex]?.texts.map((text, i) => (
          <div
            key={text.id}
            className={styles.textElement}
            style={{
              left: `${text.position.x}%`,
              top: `${text.position.y}%`,
              color: text.color,
              fontSize: `${text.size}px`,
              fontFamily: text.font,
              transform: `rotate(${text.rotation}deg)`,
            }}
          >
            {text.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;