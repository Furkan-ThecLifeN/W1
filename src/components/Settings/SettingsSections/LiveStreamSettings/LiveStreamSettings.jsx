import React, { useState } from 'react';
import styles from './LiveStreamSettings.module.css';
import { FiSettings, FiVideo, FiMic, FiShare2, FiMessageSquare, FiUser, FiLock } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { TbArrowsLeftRight } from 'react-icons/tb';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const LiveStreamSettings = () => {
  const [activeTab, setActiveTab] = useState('stream');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [quality, setQuality] = useState('1080p');
  const [bitrate, setBitrate] = useState(5000);
  const [latency, setLatency] = useState('normal');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBitrateChange = (event, newValue) => {
    setBitrate(newValue);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <FaYoutube className={styles.logo} />
          <h2>Canlı Yayın Ayarları</h2>
        </div>
        
        <div className={styles.menu}>
          <div 
            className={`${styles.menuItem} ${activeTab === 'stream' ? styles.active : ''}`}
            onClick={() => handleTabChange('stream')}
          >
            <FiVideo className={styles.menuIcon} />
            <span>Yayın Ayarları</span>
          </div>
          
          <div 
            className={`${styles.menuItem} ${activeTab === 'audio' ? styles.active : ''}`}
            onClick={() => handleTabChange('audio')}
          >
            <FiMic className={styles.menuIcon} />
            <span>Ses Ayarları</span>
          </div>
          
          <div 
            className={`${styles.menuItem} ${activeTab === 'video' ? styles.active : ''}`}
            onClick={() => handleTabChange('video')}
          >
            <FiVideo className={styles.menuIcon} />
            <span>Video Ayarları</span>
          </div>
          
          <div 
            className={`${styles.menuItem} ${activeTab === 'screen' ? styles.active : ''}`}
            onClick={() => handleTabChange('screen')}
          >
            <FiShare2 className={styles.menuIcon} />
            <span>Ekran Paylaşımı</span>
          </div>
          
          <div 
            className={`${styles.menuItem} ${activeTab === 'chat' ? styles.active : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            <FiMessageSquare className={styles.menuIcon} />
            <span>Sohbet Kontrolleri</span>
          </div>
          
          <div 
            className={`${styles.menuItem} ${activeTab === 'privacy' ? styles.active : ''}`}
            onClick={() => handleTabChange('privacy')}
          >
            <FiLock className={styles.menuIcon} />
            <span>Gizlilik Ayarları</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>
            {activeTab === 'stream' && 'Yayın Ayarları'}
            {activeTab === 'audio' && 'Ses Ayarları'}
            {activeTab === 'video' && 'Video Ayarları'}
            {activeTab === 'screen' && 'Ekran Paylaşımı'}
            {activeTab === 'chat' && 'Sohbet Kontrolleri'}
            {activeTab === 'privacy' && 'Gizlilik Ayarları'}
          </h1>
          
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary}>
              <FiSettings />
              Gelişmiş Ayarlar
            </button>
            <button className={styles.btnPrimary}>
              Yayını Başlat
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className={styles.settingsGrid}>
          {/* Video Settings Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3>Video Ayarları</h3>
              <FiVideo />
            </div>
            
            <div className={styles.formGroup}>
              <label>Video Kaynağı</label>
              <FormControl fullWidth size="small">
                <InputLabel id="video-source-label">Kamera</InputLabel>
                <Select
                  labelId="video-source-label"
                  value="webcam"
                  className={styles.select}
                >
                  <MenuItem value="webcam">Web Kamerası</MenuItem>
                  <MenuItem value="capture">Yakalama Kartı</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.formGroup}>
              <label>Çözünürlük</label>
              <FormControl fullWidth size="small">
                <InputLabel id="resolution-label">Çözünürlük</InputLabel>
                <Select
                  labelId="resolution-label"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className={styles.select}
                >
                  <MenuItem value="720p">720p (HD)</MenuItem>
                  <MenuItem value="1080p">1080p (Full HD)</MenuItem>
                  <MenuItem value="1440p">1440p (2K)</MenuItem>
                  <MenuItem value="2160p">2160p (4K)</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.formGroup}>
              <label>Bitrate (kbps)</label>
              <Slider
                value={bitrate}
                onChange={handleBitrateChange}
                aria-labelledby="bitrate-slider"
                min={1000}
                max={10000}
                step={500}
                valueLabelDisplay="auto"
                className={styles.slider}
              />
            </div>
            
            <div className={styles.toggleGroup}>
              <span>Video Aktif</span>
              <Switch
                checked={videoEnabled}
                onChange={() => setVideoEnabled(!videoEnabled)}
                color="primary"
              />
            </div>
          </div>

          {/* Audio Settings Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3>Ses Ayarları</h3>
              <FiMic />
            </div>
            
            <div className={styles.formGroup}>
              <label>Ses Girişi</label>
              <FormControl fullWidth size="small">
                <InputLabel id="audio-input-label">Mikrofon</InputLabel>
                <Select
                  labelId="audio-input-label"
                  value="microphone"
                  className={styles.select}
                >
                  <MenuItem value="microphone">Dahili Mikrofon</MenuItem>
                  <MenuItem value="external">Harici Mikrofon</MenuItem>
                  <MenuItem value="interface">Ses Arayüzü</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.formGroup}>
              <label>Ses Çıkışı</label>
              <FormControl fullWidth size="small">
                <InputLabel id="audio-output-label">Hoparlör</InputLabel>
                <Select
                  labelId="audio-output-label"
                  value="speakers"
                  className={styles.select}
                >
                  <MenuItem value="speakers">Dahili Hoparlör</MenuItem>
                  <MenuItem value="headphones">Kulaklık</MenuItem>
                  <MenuItem value="monitor">Monitör</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.toggleGroup}>
              <span>Ses Aktif</span>
              <Switch
                checked={audioEnabled}
                onChange={() => setAudioEnabled(!audioEnabled)}
                color="primary"
              />
            </div>
          </div>

          {/* Screen Share Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3>Ekran Paylaşımı</h3>
              <FiShare2 />
            </div>
            
            <div className={styles.formGroup}>
              <label>Paylaşım Kaynağı</label>
              <FormControl fullWidth size="small">
                <InputLabel id="share-source-label">Ekran</InputLabel>
                <Select
                  labelId="share-source-label"
                  value="fullscreen"
                  className={styles.select}
                >
                  <MenuItem value="fullscreen">Tam Ekran</MenuItem>
                  <MenuItem value="window">Uygulama Penceresi</MenuItem>
                  <MenuItem value="browser">Tarayıcı Sekmesi</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.formGroup}>
              <label>Çerçeve Hızı (FPS)</label>
              <FormControl fullWidth size="small">
                <InputLabel id="fps-label">FPS</InputLabel>
                <Select
                  labelId="fps-label"
                  value="30"
                  className={styles.select}
                >
                  <MenuItem value="24">24 FPS</MenuItem>
                  <MenuItem value="30">30 FPS</MenuItem>
                  <MenuItem value="60">60 FPS</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.toggleGroup}>
              <span>Ekran Paylaşımı Aktif</span>
              <Switch
                checked={screenShareEnabled}
                onChange={() => setScreenShareEnabled(!screenShareEnabled)}
                color="primary"
              />
            </div>
          </div>

          {/* Chat Settings Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3>Sohbet Kontrolleri</h3>
              <FiMessageSquare />
            </div>
            
            <div className={styles.formGroup}>
              <label>Sohbet Modu</label>
              <FormControl fullWidth size="small">
                <InputLabel id="chat-mode-label">Mod</InputLabel>
                <Select
                  labelId="chat-mode-label"
                  value="enabled"
                  className={styles.select}
                >
                  <MenuItem value="enabled">Aktif</MenuItem>
                  <MenuItem value="subscribers">Sadece Aboneler</MenuItem>
                  <MenuItem value="followers">Sadece Takipçiler</MenuItem>
                  <MenuItem value="disabled">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.formGroup}>
              <label>Gecikme Modu</label>
              <FormControl fullWidth size="small">
                <InputLabel id="latency-label">Gecikme</InputLabel>
                <Select
                  labelId="latency-label"
                  value={latency}
                  onChange={(e) => setLatency(e.target.value)}
                  className={styles.select}
                >
                  <MenuItem value="low">Düşük (2-5sn)</MenuItem>
                  <MenuItem value="normal">Normal (5-15sn)</MenuItem>
                  <MenuItem value="high">Yüksek (15-60sn)</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className={styles.toggleGroup}>
              <span>Sohbet Aktif</span>
              <Switch
                checked={chatEnabled}
                onChange={() => setChatEnabled(!chatEnabled)}
                color="primary"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${styles.settingsCard} ${styles.previewSection}`}>
            <div className={styles.cardHeader}>
              <h3>Yayın Önizleme</h3>
              <FiVideo />
            </div>
            
            <div className={styles.previewContainer}>
              <div className={styles.videoPreview}>
                {videoEnabled ? (
                  <div className={styles.videoPlaceholder}>
                    <span>Video Önizleme</span>
                  </div>
                ) : (
                  <div className={styles.videoDisabled}>
                    <FiVideo size={48} />
                    <span>Video Kapalı</span>
                  </div>
                )}
              </div>
              
              <div className={styles.previewControls}>
                <button className={styles.previewBtn}>
                  <FiMic size={18} />
                  <span>Mikrofon Testi</span>
                </button>
                <button className={styles.previewBtn}>
                  <TbArrowsLeftRight size={18} />
                  <span>Kaynak Değiştir</span>
                </button>
                <button className={styles.previewBtn}>
                  <IoMdNotificationsOutline size={18} />
                  <span>Bildirimleri Test Et</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stream Info Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3>Yayın Bilgileri</h3>
              <FiUser />
            </div>
            
            <div className={styles.formGroup}>
              <label>Yayın Başlığı</label>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Yayın başlığınızı girin"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Yayın Açıklaması</label>
              <textarea
                className={`${styles.formControl} ${styles.textarea}`}
                rows="3"
                placeholder="Yayın açıklamanızı girin"
              ></textarea>
            </div>
            
            <div className={styles.formGroup}>
              <label>Kategori</label>
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">Kategori Seçin</InputLabel>
                <Select
                  labelId="category-label"
                  value="gaming"
                  className={styles.select}
                >
                  <MenuItem value="gaming">Oyun</MenuItem>
                  <MenuItem value="music">Müzik</MenuItem>
                  <MenuItem value="education">Eğitim</MenuItem>
                  <MenuItem value="talk">Sohbet</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamSettings;