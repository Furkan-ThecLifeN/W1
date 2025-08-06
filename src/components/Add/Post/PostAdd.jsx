import React, { useState } from "react";
import {
  ArrowLeft,
  Share,
  Image,
  Filter,
  Crop,
  ChevronLeft,
  ChevronRight,
  Settings,
  Smile,
  Globe,
  Tag,
} from "lucide-react";
import styles from "./PostAdd.module.css";

const filters = [
  { name: "Orijinal", class: styles.filterOriginal },
  { name: "Aura", class: styles.filterAura },
  { name: "Neon", class: styles.filterNeon },
  { name: "Glitch", class: styles.filterGlitch },
  { name: "Matrix", class: styles.filterMatrix },
];

const PostAdd = () => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedEditTab, setSelectedEditTab] = useState("filters");
  const [selectedFilter, setSelectedFilter] = useState("Orijinal");
  const [caption, setCaption] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedMedia(files.map((file) => URL.createObjectURL(file)));
    setActiveMediaIndex(0);
  };

  const renderMedia = () => {
    if (selectedMedia.length === 0) {
      return (
        <label htmlFor="media-upload" className={styles.dropzone}>
          <div className={styles.dropzoneText}>
            <Image size={48} />
            <p>Görsel veya video yüklemek için tıkla</p>
          </div>
          <input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </label>
      );
    }

    const currentMedia = selectedMedia[activeMediaIndex];
    const isVideo =
      currentMedia &&
      (currentMedia.includes(".mp4") || currentMedia.includes(".mov"));

    return (
      <div className={styles.mediaFrame}>
        <div className={`${styles.mediaWrapper} ${styles[selectedFilter]}`}>
          {isVideo ? (
            <video
              src={currentMedia}
              className={styles.media}
              controls
              autoPlay
              muted
            />
          ) : (
            <img
              src={currentMedia}
              alt="Post preview"
              className={styles.media}
            />
          )}
        </div>
        {selectedMedia.length > 1 && (
          <div className={styles.carouselControls}>
            <button
              className={`${styles.navButton} ${
                activeMediaIndex === 0 ? styles.disabled : ""
              }`}
              onClick={() => setActiveMediaIndex((prev) => prev - 1)}
              disabled={activeMediaIndex === 0}
            >
              <ChevronLeft />
            </button>
            <div className={styles.paginationDots}>
              {selectedMedia.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.dot} ${
                    index === activeMediaIndex ? styles.active : ""
                  }`}
                />
              ))}
            </div>
            <button
              className={`${styles.navButton} ${
                activeMediaIndex === selectedMedia.length - 1
                  ? styles.disabled
                  : ""
              }`}
              onClick={() => setActiveMediaIndex((prev) => prev + 1)}
              disabled={activeMediaIndex === selectedMedia.length - 1}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.header}>
          <button className={styles.iconBtn}>
            <ArrowLeft />
          </button>
          <h1 className={styles.title}>Yeni Gönderi</h1>
          <button className={styles.actionBtn}>
            Paylaş <Share size={18} />
          </button>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.mediaSection}>{renderMedia()}</section>

          <section className={styles.detailsSection}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabBtn} ${
                  selectedEditTab === "filters" ? styles.active : ""
                }`}
                onClick={() => setSelectedEditTab("filters")}
              >
                <Filter size={20} /> Filtreler
              </button>
              <button
                className={`${styles.tabBtn} ${
                  selectedEditTab === "crop" ? styles.active : ""
                }`}
                onClick={() => setSelectedEditTab("crop")}
              >
                <Crop size={20} /> Kırp
              </button>
              <button
                className={`${styles.tabBtn} ${
                  selectedEditTab === "cover" ? styles.active : ""
                }`}
                onClick={() => setSelectedEditTab("cover")}
                disabled={
                  !selectedMedia[activeMediaIndex] ||
                  !selectedMedia[activeMediaIndex].includes(".mp4")
                }
              >
                <Image size={20} /> Kapak
              </button>
            </div>

            {selectedEditTab === "filters" && (
              <div className={styles.filterOptions}>
                {filters.map((f) => (
                  <div
                    key={f.name}
                    className={styles.filterItem}
                    onClick={() => setSelectedFilter(f.name)}
                  >
                    <div
                      className={`${styles.filterPreview} ${styles[f.name]}`}
                    ></div>
                    <span
                      className={
                        selectedFilter === f.name ? styles.activeText : ""
                      }
                    >
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.captionArea}>
              <textarea
                className={styles.captionInput}
                placeholder="Bir açıklama yaz..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className={styles.captionTools}>
                <button className={styles.captionToolBtn}>
                  <Smile size={18} />
                </button>
                <button className={styles.captionToolBtn}>
                  <Tag size={18} />
                </button>
              </div>
            </div>

            <div className={styles.accordionGroup}>
              <div
                className={styles.accordionItem}
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              >
                <span className={styles.accordionHeader}>
                  <Settings size={18} /> Gelişmiş Ayarlar
                </span>
                <ChevronRight
                  size={18}
                  className={isAdvancedOpen ? styles.rotated : ""}
                />
              </div>
              {isAdvancedOpen && (
                <div className={styles.accordionContent}>
                  <div className={styles.advancedOption}>
                    <Globe size={18} />
                    <span>Konum Ekle</span>
                  </div>
                  <div className={styles.advancedOption}>
                    <Image size={18} />
                    <span>Alternatif Metin (Alt Text)</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PostAdd;
