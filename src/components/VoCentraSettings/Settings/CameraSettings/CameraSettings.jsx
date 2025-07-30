import React, { useState, useEffect, useRef } from "react";
import styles from "./CameraSettings.module.css";
// Lucide React ikonları import ediliyor.
// Kurulum: npm install lucide-react
import {
  Camera,
  Video,
  Expand,
  SlidersHorizontal,
  Eye,
  EyeOff,
  VideoOff,
  Sparkles,
} from "lucide-react";

const CameraSettings = () => {
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [resolution, setResolution] = useState("1280x720");
  const [frameRate, setFrameRate] = useState("30");
  const [mirrorVideo, setMirrorVideo] = useState(false);
  const [hideVideoPreview, setHideVideoPreview] = useState(false);
  const [backgroundEffect, setBackgroundEffect] = useState("none"); // none, blur, virtual
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Medya akışını saklamak için

  // Dummy virtual backgrounds for demonstration
  const virtualBackgrounds = [
    { id: "office", name: "Modern Ofis", image: "https://picsum.photos/id/16/200/150" },
    { id: "nature", name: "Doğa Manzarası", image: "https://picsum.photos/id/1018/200/150" },
    { id: "space", name: "Uzay Boşluğu", image: "https://picsum.photos/id/1025/200/150" },
  ];

  useEffect(() => {
    // Mevcut kameraları listele
    const getCameraDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        setCameraDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedCamera(videoInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Kamera cihazları alınırken hata oluştu:", error);
      }
    };

    getCameraDevices();
  }, []);

  useEffect(() => {
    // Seçilen kamera değiştiğinde veya ayarlar güncellendiğinde önizlemeyi başlat
    const startVideoStream = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (selectedCamera) {
        try {
          const [width, height] = resolution.split("x").map(Number);
          const constraints = {
            video: {
              deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
              width: { ideal: width },
              height: { ideal: height },
              frameRate: { ideal: parseInt(frameRate) },
            },
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoRef.current.srcObject = stream;
          streamRef.current = stream; // Akışı sakla
        } catch (error) {
          console.error("Video akışı başlatılırken hata oluştu:", error);
          // Kullanıcıya hata mesajı gösterebilirsin
        }
      }
    };

    startVideoStream();

    // Bileşen unmount olduğunda veya bağımlılıklar değiştiğinde akışı durdur
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCamera, resolution, frameRate]);

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };

  const handleResolutionChange = (e) => {
    setResolution(e.target.value);
  };

  const handleFrameRateChange = (e) => {
    setFrameRate(e.target.value);
  };

  const handleMirrorVideoToggle = () => {
    setMirrorVideo(!mirrorVideo);
  };

  const handleHideVideoPreviewToggle = () => {
    setHideVideoPreview(!hideVideoPreview);
  };

  const handleBackgroundEffectChange = (e) => {
    setBackgroundEffect(e.target.value);
  };

  return (
    <div className={styles.cameraSettings}>
      <div className={styles.header}>
        <Camera className={styles.headerIcon} />
        <h2 className={styles.title}>Kamera Ayarları</h2>
        <p className={styles.description}>
          Video ve kamera ile ilgili tercihlerinizi buradan yönetin.
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* Kamera Seçimi */}
        <div className={styles.settingGroup}>
          <label htmlFor="camera-select" className={styles.label}>
            <Video className={styles.icon} /> Kamera Cihazı
          </label>
          <select
            id="camera-select"
            className={styles.selectInput}
            value={selectedCamera}
            onChange={handleCameraChange}
          >
            {cameraDevices.length > 0 ? (
              cameraDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Kamera ${device.deviceId.substring(0, 8)}...`}
                </option>
              ))
            ) : (
              <option value="">Kamera bulunamadı</option>
            )}
          </select>
        </div>

        {/* Video Çözünürlüğü */}
        <div className={styles.settingGroup}>
          <label htmlFor="resolution-select" className={styles.label}>
            <Expand className={styles.icon} /> Video Çözünürlüğü
          </label>
          <select
            id="resolution-select"
            className={styles.selectInput}
            value={resolution}
            onChange={handleResolutionChange}
          >
            <option value="1920x1080">1080p (Full HD)</option>
            <option value="1280x720">720p (HD)</option>
            <option value="640x480">480p (SD)</option>
          </select>
        </div>

        {/* Kare Hızı */}
        <div className={styles.settingGroup}>
          <label htmlFor="framerate-select" className={styles.label}>
            <SlidersHorizontal className={styles.icon} /> Kare Hızı (FPS)
          </label>
          <select
            id="framerate-select"
            className={styles.selectInput}
            value={frameRate}
            onChange={handleFrameRateChange}
          >
            <option value="60">60 FPS</option>
            <option value="30">30 FPS</option>
            <option value="15">15 FPS</option>
          </select>
        </div>

        {/* Video Aynalama */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            <Video className={styles.icon} /> Videoyu Aynala
          </label>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              id="mirror-video"
              checked={mirrorVideo}
              onChange={handleMirrorVideoToggle}
              className={styles.checkboxInput}
            />
            <label htmlFor="mirror-video" className={styles.toggleLabel}></label>
          </div>
        </div>

        {/* Video Önizlemesini Gizle */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            {hideVideoPreview ? <EyeOff className={styles.icon} /> : <Eye className={styles.icon} />}{" "}
            Video Önizlemesini Gizle
          </label>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              id="hide-preview"
              checked={hideVideoPreview}
              onChange={handleHideVideoPreviewToggle}
              className={styles.checkboxInput}
            />
            <label htmlFor="hide-preview" className={styles.toggleLabel}></label>
          </div>
        </div>
      </div>

      {/* Video Önizlemesi ve Arka Plan Efektleri */}
      <div className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>
          <Eye className={styles.sectionIcon} /> Video Önizlemesi
        </h3>
        <div
          className={`${styles.videoContainer} ${
            hideVideoPreview ? styles.hiddenPreview : ""
          }`}
        >
          {selectedCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`${styles.videoPreview} ${mirrorVideo ? styles.mirrored : ""}`}
            ></video>
          ) : (
            <div className={styles.noCameraMessage}>
              <VideoOff size={48} /> {/* Lucide ikonlar için size prop'u */}
              <p>Kamera bulunamadı veya erişilemiyor.</p>
              <p>Lütfen kamera bağlantılarınızı kontrol edin ve izin verin.</p>
            </div>
          )}
          {backgroundEffect === "blur" && (
            <div className={styles.blurOverlay}></div>
          )}
          {backgroundEffect === "virtual" && (
            <img
              src={
                virtualBackgrounds.find((bg) => bg.id === "office")?.image || ""
              } // Örnek olarak ilkini göster
              alt="Virtual Background"
              className={styles.virtualBackgroundOverlay}
            />
          )}
        </div>

        <h3 className={styles.sectionTitle}>
          <Sparkles className={styles.sectionIcon} /> Arka Plan Efektleri
        </h3>
        <div className={styles.backgroundEffects}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="background-effect"
              value="none"
              checked={backgroundEffect === "none"}
              onChange={handleBackgroundEffectChange}
            />
            <span>Yok</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="background-effect"
              value="blur"
              checked={backgroundEffect === "blur"}
              onChange={handleBackgroundEffectChange}
            />
            <span>Arka Planı Bulanıklaştır</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="background-effect"
              value="virtual"
              checked={backgroundEffect === "virtual"}
              onChange={handleBackgroundEffectChange}
            />
            <span>Sanal Arka Plan</span>
          </label>
        </div>
        {backgroundEffect === "virtual" && (
          <div className={styles.virtualBackgroundSelector}>
            {virtualBackgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`${styles.virtualBgOption} ${
                  selectedCamera === bg.id ? styles.selectedBg : ""
                }`}
                onClick={() => setSelectedCamera(bg.id)} // Normalde arka plan seçimi farklı olur, bu sadece örnek
              >
                <img src={bg.image} alt={bg.name} />
                <span>{bg.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.applyButton}>Ayarları Kaydet</button>
      </div>
    </div>
  );
};

export default CameraSettings;