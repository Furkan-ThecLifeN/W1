import React from "react";
import { FiVideo } from "react-icons/fi";
import styles from "../PostAdd.module.css";

const FilterPanel = ({ media, activeMediaIndex, setMedia }) => {
  const filters = [
    { name: "Orijinal", class: "" },
    { name: "Clarendon", class: styles.filterClarendon },
    { name: "Gingham", class: styles.filterGingham },
    { name: "Moon", class: styles.filterMoon },
    { name: "Lark", class: styles.filterLark },
    { name: "Reyes", class: styles.filterReyes },
  ];

  const applyFilter = (filter) => {
    if (!media[activeMediaIndex]) return;

    const newMedia = [...media];
    newMedia[activeMediaIndex].filter = filter;
    setMedia(newMedia);
  };

  return (
    <div className={styles.filterPanel}>
      {filters.map((filter, i) => (
        <div
          key={i}
          className={`${styles.filterOption} ${
            media[activeMediaIndex]?.filter?.name === filter.name ? styles.active : ""
          }`}
          onClick={() => applyFilter(filter)}
        >
          <div className={`${styles.filterPreview} ${filter.class}`}>
            {media[activeMediaIndex]?.type === "image" ? (
              <img
                src={media[activeMediaIndex].preview}
                alt={filter.name}
                className={styles.filterPreviewImage}
              />
            ) : (
              <div className={styles.filterPreviewVideo}>
                <FiVideo size={24} />
              </div>
            )}
          </div>
          <span>{filter.name}</span>
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;