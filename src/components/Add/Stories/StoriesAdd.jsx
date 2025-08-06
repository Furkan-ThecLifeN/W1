import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  X,
  Camera,
  Image,
  Type,
  Smile,
  Music,
  Timer,
  Palette,
  Send,
  Trash2,
  Brush,
  Video,
  Circle,
} from "lucide-react";
import styles from "./StoriesAdd.module.css";

const StoriesAdd = ({ onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [stickers, setStickers] = useState([]); // Placeholder for stickers
  const [currentFilter, setCurrentFilter] = useState("none");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const storyCanvasRef = useRef(null);

  const filters = [
    { name: "none", label: "Normal" },
    { name: "clarendon", label: "Clarendon" },
    { name: "gingham", label: "Gingham" },
    { name: "moon", label: "Moon" },
    { name: "lark", label: "Lark" },
  ];

  // Medya Yükleme İşleyicisi
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const mediaUrl = URL.createObjectURL(file);
      setSelectedMedia({
        url: mediaUrl,
        type: file.type.startsWith("image") ? "image" : "video",
      });
      setIsCameraActive(false);
      stopCamera();
    }
  };

  // Metin Ekleme İşleyicisi
  const handleAddText = () => {
    if (!selectedMedia && !isCameraActive) return;
    const newText = {
      id: Date.now(),
      content: "Hikayene metin ekle",
      x: 50, // Orta kısım
      y: 50, // Orta kısım
      color: "#ffffff",
      fontSize: 24,
    };
    setTextElements([...textElements, newText]);
    setActiveTool("text");
  };

  // Araç Buton Tıklama İşleyicisi
  const handleToolClick = (tool) => {
    if (tool === activeTool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      if (tool === "gallery") {
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }, 0);
      } else if (tool === "camera") {
        setIsCameraActive(true);
        setSelectedMedia(null);
        startCamera();
      }
    }
  };

  // Kamera Başlatma
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Kamera hatası: ", err);
      setIsCameraActive(false);
      // Kullanıcıya hata mesajı gösterebilirsiniz
    }
  };

  // Kamera Durdurma
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  // Fotoğraf Çekme
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.png", { type: "image/png" });
        const mediaUrl = URL.createObjectURL(file);
        setSelectedMedia({
          url: mediaUrl,
          type: "image",
        });
        stopCamera();
      }, "image/png");
    }
  };

  // Hikaye Paylaşma İşleyicisi
  const handlePostStory = () => {
    if (!selectedMedia) return;

    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setShowSuccessModal(true);
      // Temizleme işlemleri
      setSelectedMedia(null);
      setTextElements([]);
      setStickers([]);
      setCurrentFilter("none");
      setActiveTool(null);
      stopCamera();

      setTimeout(() => {
        setShowSuccessModal(false);
        onClose(); // Modalı kapat ve ana ekrana dön
      }, 2000); // Başarı mesajı 2 saniye sonra kaybolur
    }, 1500); // Ağ isteğini simüle et
  };

  // Medyayı Temizleme İşleyicisi
  const handleDiscardMedia = () => {
    setSelectedMedia(null);
    setTextElements([]);
    setStickers([]);
    setCurrentFilter("none");
    setActiveTool(null);
    stopCamera();
  };

  // Sürükleme İşlevselliği için useEffect
  useEffect(() => {
    const handleDrag = (e, id, type) => {
      e.preventDefault();
      const element = type === 'text' ? textElements.find(t => t.id === id) : stickers.find(s => s.id === id);
      if (!element) return;

      const storyCanvasRect = storyCanvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - element.x * storyCanvasRect.width / 100;
      const offsetY = e.clientY - element.y * storyCanvasRect.height / 100;

      const onMouseMove = (moveEvent) => {
        let newX = ((moveEvent.clientX - offsetX) / storyCanvasRect.width) * 100;
        let newY = ((moveEvent.clientY - offsetY) / storyCanvasRect.height) * 100;

        // Sınırları kontrol et
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        if (type === 'text') {
          setTextElements(prev =>
            prev.map(t => (t.id === id ? { ...t, x: newX, y: newY } : t))
          );
        } else {
          setStickers(prev =>
            prev.map(s => (s.id === id ? { ...s, x: newX, y: newY } : s))
          );
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    // Metin elementleri için sürükleme
    const textElementsDivs = document.querySelectorAll(`.${styles.textElement}`);
    textElementsDivs.forEach(div => {
      const id = parseInt(div.dataset.id);
      div.onmousedown = (e) => handleDrag(e, id, 'text');
      div.ontouchstart = (e) => handleDrag(e.touches[0], id, 'text');
    });

    // Çıkartma elementleri için sürükleme (eğer olsaydı)
    const stickerElementsDivs = document.querySelectorAll(`.${styles.sticker}`);
    stickerElementsDivs.forEach(div => {
      const id = parseInt(div.dataset.id);
      div.onmousedown = (e) => handleDrag(e, id, 'sticker');
      div.ontouchstart = (e) => handleDrag(e.touches[0], id, 'sticker');
    });

    return () => {
      // Temizleme
      textElementsDivs.forEach(div => {
        div.onmousedown = null;
        div.ontouchstart = null;
      });
      stickerElementsDivs.forEach(div => {
        div.onmousedown = null;
        div.ontouchstart = null;
      });
    };
  }, [textElements, stickers, selectedMedia]); // Bağımlılıklar güncellendiğinde yeniden çalıştır

  return (
    <div className={styles.container}>
      {/* Başarı Modalı */}
      {showSuccessModal && (
        <div className={`${styles.successModal}`}>
          <p className="text-xl font-bold text-white">Hikaye başarıyla paylaşıldı!</p>
        </div>
      )}

      {/* Üst Bar */}
      <div className={styles.topBar}>
        <button className={styles.iconButton} onClick={onClose} aria-label="Geri Dön">
          <ArrowLeft size={24} />
        </button>
        <h2 className={styles.title}>Yeni Hikaye Oluştur</h2>
        <button className={styles.iconButton} onClick={onClose} aria-label="Kapat">
          <X size={24} />
        </button>
      </div>

      {/* Hikaye Tuvali */}
      <div className={styles.storyCanvas} ref={storyCanvasRef}>
        {isCameraActive ? (
          <div className={styles.cameraView}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={styles.cameraVideo}
            />
            <button className={styles.captureButton} onClick={capturePhoto} aria-label="Fotoğraf Çek">
              {/* İçindeki beyaz daire CSS ile yapıldı */}
            </button>
          </div>
        ) : selectedMedia ? (
          <div className={`${styles.mediaLayer} ${styles[currentFilter]}`}>
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Hikaye içeriği"
                className={styles.media}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className={styles.media}
              />
            )}

            {/* Metin Elementleri */}
            {textElements.map((text) => (
              <div
                key={text.id}
                data-id={text.id}
                className={styles.textElement}
                style={{
                  left: `${text.x}%`,
                  top: `${text.y}%`,
                  color: text.color,
                  fontSize: `${text.fontSize}px`,
                  transform: 'translate(-50%, -50%)', // Merkezleme için
                }}
                contentEditable={true} // Metni doğrudan düzenlenebilir yap
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  setTextElements(prev =>
                    prev.map(t => (t.id === text.id ? { ...t, content: e.target.innerText } : t))
                  );
                }}
              >
                {text.content}
              </div>
            ))}

            {/* Çıkartmalar (Placeholder) */}
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                data-id={sticker.id}
                className={styles.sticker}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
                }}
              >
                {sticker.emoji}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.uploadPrompt}>
            <Camera className={styles.cameraIcon} />
            <p className="text-lg">Bir fotoğraf veya video çekin</p>
            <button
              className={styles.uploadButton}
              onClick={() => handleToolClick("gallery")}
            >
              Galeriden Seç
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              accept="image/*, video/*"
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {/* Kayan Araç Paneli */}
      {(selectedMedia || isCameraActive) && (
        <div className={styles.floatingToolPanel}>
          <ToolButton
            icon={<Type size={20} />}
            label="Metin"
            active={activeTool === "text"}
            onClick={handleAddText}
          />
          <ToolButton
            icon={<Smile size={20} />}
            label="Emoji"
            active={activeTool === "emoji"}
            onClick={() => handleToolClick("emoji")}
          />
          <ToolButton
            icon={<Music size={20} />}
            label="Müzik"
            active={activeTool === "music"}
            onClick={() => handleToolClick("music")}
          />
          <ToolButton
            icon={<Brush size={20} />}
            label="Çizim"
            active={activeTool === "brush"}
            onClick={() => handleToolClick("brush")}
          />
          <ToolButton
            icon={<Timer size={20} />}
            label="Zamanlayıcı"
            active={activeTool === "timer"}
            onClick={() => handleToolClick("timer")}
          />
          <ToolButton
            icon={<Palette size={20} />}
            label="Filtreler"
            active={activeTool === "filters"}
            onClick={() => handleToolClick("filters")}
          />
        </div>
      )}

      {/* Aktif Araç Paneli (Filtreler) */}
      {activeTool === "filters" && (selectedMedia || isCameraActive) && (
        <div className={styles.filterPanel}>
          <h3>Filtreler</h3>
          <div className={styles.filterGrid}>
            {filters.map((filter) => (
              <button
                key={filter.name}
                className={`${styles.filterOption} ${
                  currentFilter === filter.name ? styles.activeFilter : ""
                }`}
                onClick={() => setCurrentFilter(filter.name)}
              >
                <div
                  className={`${styles.filterPreview} ${styles[filter.name]}`}
                >
                  {selectedMedia && selectedMedia.type === "image" ? (
                    <img src={selectedMedia.url} alt={filter.label} />
                  ) : (
                    <div className={styles.filterPlaceholder} />
                  )}
                </div>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alt Menü */}
      <div className={styles.bottomMenu}>
        <button
          className={styles.discardButton}
          onClick={handleDiscardMedia}
          disabled={!selectedMedia && !isCameraActive}
        >
          <Trash2 size={20} />
          <span>At</span>
        </button>

        <button
          className={styles.postButton}
          onClick={handlePostStory}
          disabled={!selectedMedia || isPosting}
        >
          {isPosting ? (
            <>
              <svg className={`${styles.spinner} h-5 w-5`} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Paylaşılıyor...
            </>
          ) : (
            <>
              <Send size={20} />
              <span>Paylaş</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Araç Buton Bileşeni
const ToolButton = ({ icon, label, active, onClick, disabled = false }) => {
  return (
    <button
      className={`${styles.toolButton} ${active ? styles.activeTool : ""} ${
        disabled ? styles.disabledTool : ""
      }`}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
    >
      {icon}
      {/* Tooltip burada kullanılmıyor, ancak CSS'te tanımlı */}
    </button>
  );
};

export default StoriesAdd;
