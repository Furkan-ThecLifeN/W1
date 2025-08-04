import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaStop, FaVideo, FaMicrophoneAlt, FaDesktop, FaKey, FaCommentDots } from 'react-icons/fa';
import styles from './LiveStreamSettings.module.css';

const LiveStreamSettings = () => {
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Mikrofon seviyesi testi için
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            const updateMicLevel = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                setMicLevel(average * 100 / 255);
              }
              requestAnimationFrame(updateMicLevel);
            };
            updateMicLevel();
          }
        })
        .catch(err => {
          console.error("Kamera veya mikrofon erişim hatası:", err);
          setCameraActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setMicLevel(0);
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      }
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cameraActive]);

  const toggleLiveStatus = () => {
    setIsLive(!isLive);
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header & Status */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Yayın Kontrol Paneli</h1>
        <div className={styles.statusSection}>
          <div className={`${styles.statusIndicator} ${isLive ? styles.online : ''}`}></div>
          <span className={styles.statusText}>{isLive ? 'Canlı Yayın Başladı' : 'Yayın Hazır'}</span>
          <button onClick={toggleLiveStatus} className={`${styles.goLiveButton} ${isLive ? styles.stop : ''}`}>
            {isLive ? <FaStop /> : <FaPlay />} {isLive ? 'Yayını Bitir' : 'Yayına Başla'}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className={styles.mainContent}>
        {/* Sol Kolon - Ayarlar */}
        <div className={styles.settingsColumn}>
          {/* Kamera ve Mikrofon Kartı */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaVideo className={styles.icon} />
              <h3>Kamera & Mikrofon</h3>
              <div className={styles.cardActions}>
                <span className={styles.actionLabel}>{cameraActive ? 'Açık' : 'Kapalı'}</span>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" checked={cameraActive} onChange={toggleCamera} />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            <div className={`${styles.videoPreviewContainer} ${cameraActive ? styles.activeBorder : ''}`}>
              {cameraActive ? (
                <video ref={videoRef} autoPlay muted playsInline className={styles.videoElement} />
              ) : (
                <div className={styles.previewPlaceholder}>Kamera Kapalı</div>
              )}
            </div>
            <div className={styles.micControl}>
              <FaMicrophoneAlt className={styles.micIcon} />
              <div className={styles.micLevelBar}>
                <div style={{ width: `${micLevel}%` }} className={styles.micBarFill}></div>
              </div>
              <span className={styles.micLevelText}>{Math.round(micLevel)}%</span>
            </div>
          </div>
          
          {/* Yayın Ayarları Kartı */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaKey className={styles.icon} />
              <h3>Yayın Bilgileri</h3>
            </div>
            <div className={styles.inputGroup}>
              <label>Yayın Anahtarı</label>
              <div className={styles.inputWithButton}>
                <input type="text" readOnly value="****************" />
                <button className={styles.copyButton}>Kopyala</button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Yayın URL'si</label>
              <input type="text" readOnly value="rtmp://server.com/live" />
            </div>
          </div>
        </div>
        
        {/* Sağ Kolon - Sohbet Paneli */}
        <div className={styles.chatColumn}>
          <div className={styles.chatCard}>
            <div className={styles.cardHeader}>
              <FaCommentDots className={styles.icon} />
              <h3>Canlı Sohbet</h3>
            </div>
            <div className={styles.chatWindow}>
              {/* Sohbet mesajları buraya gelecek */}
              <div className={styles.chatMessage}>
                <span className={styles.username}>Kullanıcı1:</span> Merhaba millet!
              </div>
              <div className={styles.chatMessage}>
                <span className={styles.username}>Moderator:</span> Hoş geldiniz, keyifli yayınlar!
              </div>
            </div>
            <div className={styles.chatInputContainer}>
              <input type="text" placeholder="Mesaj yazın..." />
              <button>Gönder</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveStreamSettings;