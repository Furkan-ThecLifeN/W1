import React, { useState, useRef } from 'react';
import styles from './FeedsAdd.module.css';
import { FiMusic, FiX, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineSpeed, MdOutlineTimer } from 'react-icons/md';
import { RiQuillPenLine } from 'react-icons/ri';

const FeedsAdd = ({ onClose }) => {
  const [caption, setCaption] = useState('');
  const [video, setVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('effects');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    setVideo({
      file,
      preview: videoUrl,
    });

    // Video süresini al
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.onloadedmetadata = () => {
      setDuration(Math.round(videoElement.duration));
    };
  };

  const handlePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    if (videoRef.current) {
      videoRef.current.playbackRate = speeds[nextIndex];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      caption,
      video,
      isMuted,
      playbackSpeed,
      duration
    });
    onClose();
  };

  return (
    <div className={styles.feedAddContainer}>
      {/* Header */}
      <div className={styles.feedHeader}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoMdClose size={24} />
        </button>
        <h2 className={styles.formTitle}>Yeni Feed Oluştur</h2>
        <button
          className={`${styles.postButton} ${video ? styles.active : ''}`}
          onClick={handleSubmit}
          disabled={!video}
        >
          <FiSend size={18} />
          <span>Paylaş</span>
        </button>
      </div>

      <div className={styles.feedContent}>
        {/* Video Editör Alanı */}
        <div className={styles.videoEditor}>
          {video ? (
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                src={video.preview}
                className={styles.videoPreview}
                autoPlay
                loop
                muted={isMuted}
              />
              
              {/* Video Kontrolleri */}
              <div className={styles.videoControls}>
                <button 
                  className={styles.controlButton}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                <button 
                  className={styles.controlButton}
                  onClick={handlePlaybackSpeed}
                >
                  <MdOutlineSpeed size={20} />
                  <span>{playbackSpeed}x</span>
                </button>
                <div className={styles.videoDuration}>
                  <MdOutlineTimer size={16} />
                  <span>{duration}s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.uploadArea}>
              <div className={styles.uploadPrompt}>
                <div className={styles.uploadIcon}>
                  <RiQuillPenLine size={48} />
                </div>
                <p>Dikey video yükleyin (9:16 oran)</p>
                <button
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current.click()}
                >
                  Video Seç
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sağ Panel - Ayarlar ve Düzenleme */}
        <div className={styles.settingsPanel}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'effects' ? styles.active : ''}`}
              onClick={() => setActiveTab('effects')}
            >
              Efektler
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'audio' ? styles.active : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              Ses
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'text' ? styles.active : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Metin
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'effects' && (
              <div className={styles.effectsGrid}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={styles.effectThumbnail}>
                    <div className={styles.effectPreview}></div>
                    <span>Efekt {i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'audio' && (
              <div className={styles.audioSection}>
                <div className={styles.audioSearch}>
                  <input
                    type="text"
                    placeholder="Şarkı veya efekt ara..."
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.audioList}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.audioItem}>
                      <div className={styles.audioIcon}>
                        <FiMusic size={20} />
                      </div>
                      <div className={styles.audioInfo}>
                        <h4>Popüler Şarkı {i + 1}</h4>
                        <p>Sanatçı Adı</p>
                      </div>
                      <div className={styles.audioDuration}>0:30</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className={styles.textOptions}>
                <div className={styles.textStyles}>
                  {['Klasik', 'Modern', 'Vurgulu', 'Şık', 'Eğlenceli'].map((style, i) => (
                    <button key={i} className={styles.textStyleButton}>
                      {style}
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.captionInput}
                  placeholder="Metin ekle..."
                  rows="3"
                />
                <div className={styles.textColorPicker}>
                  {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color, i) => (
                    <button
                      key={i}
                      className={styles.colorOption}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alt Kısım - Açıklama ve Ayarlar */}
      <div className={styles.bottomSection}>
        <div className={styles.captionArea}>
          <textarea
            className={styles.captionInput}
            placeholder="Açıklama ekle..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="2"
          />
          <div className={styles.charCounter}>{caption.length}/150</div>
        </div>

        <div className={styles.advancedSettings}>
          <div className={styles.settingOption}>
            <input type="checkbox" id="allowComments" defaultChecked />
            <label htmlFor="allowComments">Yorumlara izin ver</label>
          </div>
          <div className={styles.settingOption}>
            <input type="checkbox" id="saveToGallery" defaultChecked />
            <label htmlFor="saveToGallery">Galeriye kaydet</label>
          </div>
        </div>
      </div>

      {/* Arkaplan efektleri */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientCircle}></div>
      </div>
    </div>
  );
};

export default FeedsAdd;