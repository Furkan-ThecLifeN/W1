import React from "react";
import styles from "../PostAdd.module.css";

const AdjustPanel = ({ media, activeMediaIndex, setMedia }) => {
  const handleAdjustmentChange = (property, value) => {
    if (!media[activeMediaIndex]) return;

    const newMedia = [...media];
    newMedia[activeMediaIndex].adjustments[property] = parseInt(value);
    setMedia(newMedia);
  };

  return (
    <div className={styles.adjustPanel}>
      <div className={styles.adjustOption}>
        <label>Parlaklık: {media[activeMediaIndex]?.adjustments.brightness}</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={media[activeMediaIndex]?.adjustments.brightness || 0}
          onChange={(e) => handleAdjustmentChange("brightness", e.target.value)}
        />
      </div>
      <div className={styles.adjustOption}>
        <label>Kontrast: {media[activeMediaIndex]?.adjustments.contrast}</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={media[activeMediaIndex]?.adjustments.contrast || 0}
          onChange={(e) => handleAdjustmentChange("contrast", e.target.value)}
        />
      </div>
      <div className={styles.adjustOption}>
        <label>Doygunluk: {media[activeMediaIndex]?.adjustments.saturation}</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={media[activeMediaIndex]?.adjustments.saturation || 0}
          onChange={(e) => handleAdjustmentChange("saturation", e.target.value)}
        />
      </div>
      <div className={styles.adjustOption}>
        <label>Sıcaklık: {media[activeMediaIndex]?.adjustments.temperature}</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={media[activeMediaIndex]?.adjustments.temperature || 0}
          onChange={(e) => handleAdjustmentChange("temperature", e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdjustPanel;