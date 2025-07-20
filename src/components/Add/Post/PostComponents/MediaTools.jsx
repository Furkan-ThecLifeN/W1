import React, { useState } from "react";
import styles from "../PostAdd.module.css";
import { IoMdColorFilter } from "react-icons/io";
import { RiQuillPenLine, RiEmojiStickerLine } from "react-icons/ri";
import { BsTextParagraph, BsSliders } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import FilterPanel from "./FilterPanel";
import StickerPanel from "./StickerPanel";
import TextEditPanel from "./TextEditPanel";
import AdjustPanel from "./AdjustPanel";

const MediaTools = ({ media, activeMediaIndex, setMedia }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);

  const addTextElement = () => {
    if (!media[activeMediaIndex]) return;

    const newMedia = [...media];
    newMedia[activeMediaIndex].texts = [
      ...newMedia[activeMediaIndex].texts,
      {
        id: Date.now(),
        content: "Metin ekle",
        position: { x: 50, y: 50 },
        color: "#ffffff",
        size: 16,
        font: "Arial",
        rotation: 0,
      },
    ];
    setMedia(newMedia);
  };

  return (
    <>
      <div className={styles.mediaTools}>
        <button
          className={`${styles.toolButton} ${
            activeTool === "filter" ? styles.active : ""
          }`}
          onClick={() => setActiveTool(activeTool === "filter" ? null : "filter")}
        >
          <IoMdColorFilter size={20} />
          <span>Filtreler</span>
        </button>
        <button
          className={`${styles.toolButton} ${
            activeTool === "sticker" ? styles.active : ""
          }`}
          onClick={() => setActiveTool(activeTool === "sticker" ? null : "sticker")}
        >
          <RiEmojiStickerLine size={20} />
          <span>Çıkartma</span>
        </button>
        <button
          className={`${styles.toolButton} ${
            activeTool === "text" ? styles.active : ""
          }`}
          onClick={() => {
            addTextElement();
            setActiveTool("text");
          }}
        >
          <BsTextParagraph size={20} />
          <span>Metin</span>
        </button>
        <button
          className={`${styles.toolButton} ${
            activeTool === "draw" ? styles.active : ""
          }`}
          onClick={() => {
            setDrawingMode(!drawingMode);
            setActiveTool(activeTool === "draw" ? null : "draw");
          }}
        >
          <FiEdit2 size={20} />
          <span>Çizim</span>
        </button>
        <button
          className={`${styles.toolButton} ${
            activeTool === "adjust" ? styles.active : ""
          }`}
          onClick={() => setActiveTool(activeTool === "adjust" ? null : "adjust")}
        >
          <BsSliders size={20} />
          <span>Ayarlar</span>
        </button>
      </div>

      {activeTool && (
        <div className={styles.toolPanel}>
          {activeTool === "filter" && (
            <FilterPanel 
              media={media}
              activeMediaIndex={activeMediaIndex}
              setMedia={setMedia}
            />
          )}
          {activeTool === "sticker" && (
            <StickerPanel 
              media={media}
              activeMediaIndex={activeMediaIndex}
              setMedia={setMedia}
            />
          )}
          {activeTool === "text" && media[activeMediaIndex]?.texts.length > 0 && (
            <TextEditPanel 
              media={media}
              activeMediaIndex={activeMediaIndex}
              setMedia={setMedia}
            />
          )}
          {activeTool === "adjust" && (
            <AdjustPanel 
              media={media}
              activeMediaIndex={activeMediaIndex}
              setMedia={setMedia}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MediaTools;