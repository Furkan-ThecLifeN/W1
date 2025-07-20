import React from "react";
import styles from "../PostAdd.module.css";
import { FiImage, FiVideo, FiLayers, FiX } from "react-icons/fi";
import MediaTools from "./MediaTools";
import MediaPreview from "./MediaPreview";

const MediaEditor = ({
  media,
  setMedia,
  activeMediaIndex,
  setActiveMediaIndex,
  fileInputRef,
  handleMediaUpload,
}) => {
  const removeMedia = (index) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
    if (activeMediaIndex >= newMedia.length) {
      setActiveMediaIndex(Math.max(0, newMedia.length - 1));
    }
  };

  return (
    <div className={styles.mediaEditor}>
      {media.length > 0 ? (
        <>
          <MediaPreview
            media={media}
            activeMediaIndex={activeMediaIndex}
          />

          <MediaTools
            media={media}
            setMedia={setMedia}
            activeMediaIndex={activeMediaIndex}
          />

          <div className={styles.mediaThumbnails}>
            {media.map((item, index) => (
              <div
                key={index}
                className={`${styles.mediaThumbnail} ${
                  index === activeMediaIndex ? styles.active : ""
                }`}
                onClick={() => setActiveMediaIndex(index)}
              >
                {item.type === "image" ? (
                  <img
                    src={item.preview}
                    alt={`Thumbnail ${index}`}
                    className={styles.thumbnailImage}
                  />
                ) : (
                  <div className={styles.thumbnailVideo}>
                    <FiVideo size={16} />
                  </div>
                )}
                <button
                  className={styles.removeThumbnail}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
            <div
              className={styles.addMoreMedia}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiLayers size={24} />
            </div>
          </div>
        </>
      ) : (
        <div className={styles.mediaUploadArea}>
          <div className={styles.uploadPrompt}>
            <FiImage size={48} className={styles.uploadIcon} />
            <FiVideo size={48} className={styles.uploadIcon} />
            <p>Fotoğraf veya video eklemek için tıkla</p>
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Dosya Seç
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              multiple
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaEditor;
