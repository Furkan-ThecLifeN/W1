import React, { useState } from 'react';
import { 
  FiMic, 
  FiHeadphones, 
  FiVideo, 
  FiSettings, 
  FiUser, 
  FiMessageSquare,
  FiLock,
  FiUnlock,
  FiClock,
  FiKey,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiVolume2,
  FiSliders,
  FiMonitor,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiPlus
} from 'react-icons/fi';
import { 
  FaYoutube, 
  FaTwitch, 
  FaDiscord,
  FaRegBell,
  FaBellSlash
} from 'react-icons/fa';
import { 
  BsGearFill, 
  BsPaletteFill, 
  BsKeyboardFill,
  BsChatLeftTextFill
} from 'react-icons/bs';
import { 
  RiLiveFill,
  RiVipCrownFill,
  RiVipDiamondFill,
  RiVipLine
} from 'react-icons/ri';
import styles from './LiveStreamSettings.module.css';

const LiveStreamSettings = () => {
  // Genel Ayarlar
  const [settings, setSettings] = useState({
    // Giriş Videosu Ayarları
    introVideo: {
      enabled: true,
      duration: 240, // 4 dakika
      videoUrl: '',
      fadeDuration: 5
    },
    
    // Kısayol Ayarları
    shortcuts: {
      startStream: 'Ctrl+Alt+L',
      toggleMic: 'Ctrl+Alt+M',
      toggleCamera: 'Ctrl+Alt+C',
      toggleChat: 'Ctrl+Alt+H'
    },
    
    // Ses Ayarları
    audio: {
      inputDevice: 'default',
      outputDevice: 'default',
      inputVolume: 80,
      outputVolume: 70,
      noiseSuppression: true,
      echoCancellation: true,
      monitoring: false
    },
    
    // Görüntü Ayarları
    video: {
      resolution: '1080p',
      fps: 60,
      bitrate: 6000,
      encoder: 'x264',
      canvasSize: '1920x1080',
      outputSize: '1920x1080'
    },
    
    // Chat Ayarları
    chat: {
      slowMode: false,
      slowModeInterval: 5,
      subscriberOnly: false,
      followerOnly: false,
      emotesOnly: false,
      blockLinks: true,
      capsFilter: true,
      symbolFilter: false,
      blacklist: []
    },
    
    // Kullanıcı Rol Ayarları
    roles: {
      subscribers: {
        color: '#FF0000',
        badges: true,
        priority: 1,
        specialEffects: true
      },
      followers: {
        color: '#00AAFF',
        badges: true,
        priority: 2
      },
      vip: {
        color: '#FFD700',
        badges: true,
        priority: 0,
        specialEffects: true
      },
      regulars: {
        color: '#00FF00',
        badges: false,
        priority: 3
      },
      newViewers: {
        color: '#CCCCCC',
        badges: false,
        priority: 4
      }
    },
    
    // Moderasyon Ayarları
    moderation: {
      autoMod: true,
      bannedWords: [],
      timeoutDuration: 300,
      maxMessageLength: 200,
      duplicateMessageFilter: true
    },
    
    // Bildirim Ayarları
    notifications: {
      newFollower: true,
      newSubscriber: true,
      donation: true,
      raid: true,
      host: true,
      sound: true,
      volume: 50
    },
    
    // Gelişmiş Ayarlar
    advanced: {
      reconnect: true,
      networkOptimization: true,
      dynamicBitrate: true,
      lowLatencyMode: false,
      enableHardwareAcceleration: true
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [expandedSections, setExpandedSections] = useState({
    intro: true,
    shortcuts: true,
    audio: true,
    video: true,
    chat: false,
    roles: false,
    moderation: false,
    notifications: false,
    advanced: false
  });

  const inputDevices = [
    { id: 'default', name: 'Varsayılan Mikrofon' },
    { id: 'usb', name: 'USB Mikrofon (Blue Yeti)' },
    { id: 'headset', name: 'Kulaklık Mikrofonu' }
  ];

  const outputDevices = [
    { id: 'default', name: 'Varsayılan Hoparlör' },
    { id: 'headphones', name: 'Kulaklık' },
    { id: 'monitor', name: 'Monitör Hoparlörü' }
  ];

  const resolutions = [
    '4320p (8K)',
    '2160p (4K)',
    '1440p (QHD)',
    '1080p (Full HD)',
    '720p (HD)',
    '480p (SD)'
  ];

  const fpsOptions = [24, 30, 48, 50, 60, 120];

  const encoders = [
    'x264 (CPU)',
    'NVENC (NVIDIA)',
    'AMF (AMD)',
    'QuickSync (Intel)',
    'Apple VT'
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (path, value) => {
    const [category, subCategory] = path.split('.');
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: value
      }
    }));
  };

  const handleNestedChange = (path, value) => {
    const [category, subCategory, nested] = path.split('.');
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [nested]: value
        }
      }
    }));
  };

  const handleShortcutChange = (shortcutType) => {
    const key = `shortcuts.${shortcutType}`;
    handleChange(key, '...');
    setTimeout(() => {
      const newShortcut = `Ctrl+Alt+${shortcutType.toUpperCase().charAt(0)}`;
      handleChange(key, newShortcut);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <RiLiveFill className={styles.headerIcon} />
          <h1>Canlı Yayın Ayarları</h1>
          <p>Yayın deneyiminizi kişiselleştirmek için tüm ayarları buradan yapılandırın</p>
        </div>
        <div className={styles.headerDecoration}></div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.sidebar}>
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FiSettings className={styles.sidebarIcon} />
            <span>Genel Ayarlar</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'audio' ? styles.active : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            <FiMic className={styles.sidebarIcon} />
            <span>Ses Ayarları</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'video' ? styles.active : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <FiVideo className={styles.sidebarIcon} />
            <span>Görüntü Ayarları</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'chat' ? styles.active : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <BsChatLeftTextFill className={styles.sidebarIcon} />
            <span>Chat Ayarları</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'roles' ? styles.active : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <FiUsers className={styles.sidebarIcon} />
            <span>Kullanıcı Rolleri</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'moderation' ? styles.active : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <FiLock className={styles.sidebarIcon} />
            <span>Moderasyon</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'notifications' ? styles.active : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaRegBell className={styles.sidebarIcon} />
            <span>Bildirimler</span>
          </button>
          
          <button 
            className={`${styles.sidebarButton} ${activeTab === 'advanced' ? styles.active : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <BsGearFill className={styles.sidebarIcon} />
            <span>Gelişmiş</span>
          </button>
        </div>

        <div className={styles.mainContent}>
          {/* Genel Ayarlar */}
          {activeTab === 'general' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('intro')}>
                <h2>
                  <FiVideo className={styles.sectionIcon} />
                  Giriş Videosu Ayarları
                </h2>
                {expandedSections.intro ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.intro && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Giriş Videosu Etkin</label>
                      <p>Yayına başlamadan önce 4 dakikalık giriş videosu oynat</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.introVideo.enabled}
                          onChange={(e) => handleChange('introVideo.enabled', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  {settings.introVideo.enabled && (
                    <>
                      <div className={styles.settingRow}>
                        <div className={styles.settingLabel}>
                          <label>Video URL</label>
                          <p>Giriş videosunun bulunduğu URL adresi</p>
                        </div>
                        <div className={styles.settingControl}>
                          <input
                            type="text"
                            value={settings.introVideo.videoUrl}
                            onChange={(e) => handleChange('introVideo.videoUrl', e.target.value)}
                            className={styles.textInput}
                            placeholder="https://example.com/intro.mp4"
                          />
                        </div>
                      </div>
                      
                      <div className={styles.settingRow}>
                        <div className={styles.settingLabel}>
                          <label>Video Süresi (saniye)</label>
                          <p>Giriş videosunun toplam süresi</p>
                        </div>
                        <div className={styles.settingControl}>
                          <input
                            type="number"
                            value={settings.introVideo.duration}
                            onChange={(e) => handleChange('introVideo.duration', parseInt(e.target.value))}
                            className={styles.numberInput}
                            min="10"
                            max="600"
                          />
                        </div>
                      </div>
                      
                      <div className={styles.settingRow}>
                        <div className={styles.settingLabel}>
                          <label>Geçiş Süresi (saniye)</label>
                          <p>Giriş videosundan canlı yayına geçiş süresi</p>
                        </div>
                        <div className={styles.settingControl}>
                          <input
                            type="number"
                            value={settings.introVideo.fadeDuration}
                            onChange={(e) => handleChange('introVideo.fadeDuration', parseInt(e.target.value))}
                            className={styles.numberInput}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className={styles.sectionHeader} onClick={() => toggleSection('shortcuts')}>
                <h2>
                  <BsKeyboardFill className={styles.sectionIcon} />
                  Kısayol Tuşları
                </h2>
                {expandedSections.shortcuts ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.shortcuts && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yayın Başlat/Durdur</label>
                      <p>Canlı yayını başlatmak veya durdurmak için kısayol</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div 
                        className={styles.shortcutInput}
                        onClick={() => handleShortcutChange('startStream')}
                      >
                        {settings.shortcuts.startStream}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Mikrofon Aç/Kapat</label>
                      <p>Mikrofonu sessize almak veya açmak için kısayol</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div 
                        className={styles.shortcutInput}
                        onClick={() => handleShortcutChange('toggleMic')}
                      >
                        {settings.shortcuts.toggleMic}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Kamera Aç/Kapat</label>
                      <p>Kamerayı kapatmak veya açmak için kısayol</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div 
                        className={styles.shortcutInput}
                        onClick={() => handleShortcutChange('toggleCamera')}
                      >
                        {settings.shortcuts.toggleCamera}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Chat Gizle/Göster</label>
                      <p>Chat panelini gizlemek veya göstermek için kısayol</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div 
                        className={styles.shortcutInput}
                        onClick={() => handleShortcutChange('toggleChat')}
                      >
                        {settings.shortcuts.toggleChat}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Ses Ayarları */}
          {activeTab === 'audio' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('audio')}>
                <h2>
                  <FiMic className={styles.sectionIcon} />
                  Ses Ayarları
                </h2>
                {expandedSections.audio ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.audio && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Giriş Aygıtı</label>
                      <p>Kullanılacak mikrofon veya ses giriş aygıtı</p>
                    </div>
                    <div className={styles.settingControl}>
                      <select
                        value={settings.audio.inputDevice}
                        onChange={(e) => handleChange('audio.inputDevice', e.target.value)}
                        className={styles.selectInput}
                      >
                        {inputDevices.map(device => (
                          <option key={device.id} value={device.id}>{device.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Çıkış Aygıtı</label>
                      <p>Kullanılacak hoparlör veya ses çıkış aygıtı</p>
                    </div>
                    <div className={styles.settingControl}>
                      <select
                        value={settings.audio.outputDevice}
                        onChange={(e) => handleChange('audio.outputDevice', e.target.value)}
                        className={styles.selectInput}
                      >
                        {outputDevices.map(device => (
                          <option key={device.id} value={device.id}>{device.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Mikrofon Seviyesi</label>
                      <p>Mikrofon giriş ses seviyesi</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div className={styles.sliderContainer}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.audio.inputVolume}
                          onChange={(e) => handleChange('audio.inputVolume', parseInt(e.target.value))}
                          className={styles.slider}
                        />
                        <span className={styles.sliderValue}>{settings.audio.inputVolume}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Hoparlör Seviyesi</label>
                      <p>Sistem ses çıkış seviyesi</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div className={styles.sliderContainer}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.audio.outputVolume}
                          onChange={(e) => handleChange('audio.outputVolume', parseInt(e.target.value))}
                          className={styles.slider}
                        />
                        <span className={styles.sliderValue}>{settings.audio.outputVolume}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Gürültü Engelleme</label>
                      <p>Arka plan gürültüsünü otomatik olarak filtrele</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.audio.noiseSuppression}
                          onChange={(e) => handleChange('audio.noiseSuppression', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yankı Giderme</label>
                      <p>Olası yankıları otomatik olarak giderir</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.audio.echoCancellation}
                          onChange={(e) => handleChange('audio.echoCancellation', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Ses Monitörü</label>
                      <p>Mikrofon sesinizi kulaklıktan dinleyin</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.audio.monitoring}
                          onChange={(e) => handleChange('audio.monitoring', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Görüntü Ayarları */}
          {activeTab === 'video' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('video')}>
                <h2>
                  <FiVideo className={styles.sectionIcon} />
                  Görüntü Ayarları
                </h2>
                {expandedSections.video ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.video && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Çözünürlük</label>
                      <p>Yayın çıktı çözünürlüğü</p>
                    </div>
                    <div className={styles.settingControl}>
                      <select
                        value={settings.video.resolution}
                        onChange={(e) => handleChange('video.resolution', e.target.value)}
                        className={styles.selectInput}
                      >
                        {resolutions.map(res => (
                          <option key={res} value={res}>{res}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Kare Hızı (FPS)</label>
                      <p>Saniyedeki kare sayısı</p>
                    </div>
                    <div className={styles.settingControl}>
                      <select
                        value={settings.video.fps}
                        onChange={(e) => handleChange('video.fps', parseInt(e.target.value))}
                        className={styles.selectInput}
                      >
                        {fpsOptions.map(fps => (
                          <option key={fps} value={fps}>{fps} FPS</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Bitrate (kbps)</label>
                      <p>Yayın kalitesini belirler (daha yüksek = daha iyi kalite)</p>
                    </div>
                    <div className={styles.settingControl}>
                      <input
                        type="number"
                        value={settings.video.bitrate}
                        onChange={(e) => handleChange('video.bitrate', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="1000"
                        max="20000"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Encoder</label>
                      <p>Görüntü sıkıştırma yöntemi</p>
                    </div>
                    <div className={styles.settingControl}>
                      <select
                        value={settings.video.encoder}
                        onChange={(e) => handleChange('video.encoder', e.target.value)}
                        className={styles.selectInput}
                      >
                        {encoders.map(enc => (
                          <option key={enc} value={enc}>{enc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Tuval Boyutu</label>
                      <p>Yayın tuvalinin boyutları</p>
                    </div>
                    <div className={styles.settingControl}>
                      <input
                        type="text"
                        value={settings.video.canvasSize}
                        onChange={(e) => handleChange('video.canvasSize', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Çıktı Boyutu</label>
                      <p>Yayın çıktı boyutları</p>
                    </div>
                    <div className={styles.settingControl}>
                      <input
                        type="text"
                        value={settings.video.outputSize}
                        onChange={(e) => handleChange('video.outputSize', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Chat Ayarları */}
          {activeTab === 'chat' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('chat')}>
                <h2>
                  <BsChatLeftTextFill className={styles.sectionIcon} />
                  Chat Ayarları
                </h2>
                {expandedSections.chat ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.chat && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yavaş Mod</label>
                      <p>Kullanıcıların belirli aralıklarla mesaj göndermesine izin verir</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.slowMode}
                          onChange={(e) => handleChange('chat.slowMode', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  {settings.chat.slowMode && (
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Yavaş Mod Aralığı (saniye)</label>
                        <p>Kullanıcıların mesaj gönderme aralığı</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="number"
                          value={settings.chat.slowModeInterval}
                          onChange={(e) => handleChange('chat.slowModeInterval', parseInt(e.target.value))}
                          className={styles.numberInput}
                          min="1"
                          max="60"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Sadece Aboneler</label>
                      <p>Sadece kanal abonelerinin chat'e yazmasına izin ver</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.subscriberOnly}
                          onChange={(e) => handleChange('chat.subscriberOnly', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Sadece Takipçiler</label>
                      <p>Sadece kanalı takip edenlerin chat'e yazmasına izin ver</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.followerOnly}
                          onChange={(e) => handleChange('chat.followerOnly', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Sadece Emoteler</label>
                      <p>Kullanıcıların sadece emote göndermesine izin ver</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.emotesOnly}
                          onChange={(e) => handleChange('chat.emotesOnly', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Link Engelle</label>
                      <p>Chat'te link paylaşımını engeller</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.blockLinks}
                          onChange={(e) => handleChange('chat.blockLinks', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Büyük Harf Filtresi</label>
                      <p>Çok fazla büyük harf içeren mesajları engeller</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.capsFilter}
                          onChange={(e) => handleChange('chat.capsFilter', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Sembol Filtresi</label>
                      <p>Çok fazla sembol içeren mesajları engeller</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.chat.symbolFilter}
                          onChange={(e) => handleChange('chat.symbolFilter', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Kullanıcı Rolleri */}
          {activeTab === 'roles' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('roles')}>
                <h2>
                  <FiUsers className={styles.sectionIcon} />
                  Kullanıcı Rolleri
                </h2>
                {expandedSections.roles ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.roles && (
                <div className={styles.sectionContent}>
                  {/* Aboneler */}
                  <div className={styles.roleSection}>
                    <div className={styles.roleHeader}>
                      <RiVipCrownFill className={styles.roleIcon} style={{ color: settings.roles.subscribers.color }} />
                      <h3>Aboneler</h3>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Renk</label>
                        <p>Chat'te görünecek isim rengi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="color"
                          value={settings.roles.subscribers.color}
                          onChange={(e) => handleNestedChange('roles.subscribers.color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Rozetler</label>
                        <p>Kullanıcı adlarının yanında rozet göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.subscribers.badges}
                            onChange={(e) => handleNestedChange('roles.subscribers.badges', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Özel Efektler</label>
                        <p>Chat mesajlarında özel efektler göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.subscribers.specialEffects}
                            onChange={(e) => handleNestedChange('roles.subscribers.specialEffects', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Öncelik</label>
                        <p>Chat'te mesajlarının görünme önceliği</p>
                      </div>
                      <div className={styles.settingControl}>
                        <select
                          value={settings.roles.subscribers.priority}
                          onChange={(e) => handleNestedChange('roles.subscribers.priority', parseInt(e.target.value))}
                          className={styles.selectInput}
                        >
                          <option value="0">Yüksek</option>
                          <option value="1">Orta</option>
                          <option value="2">Düşük</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Takipçiler */}
                  <div className={styles.roleSection}>
                    <div className={styles.roleHeader}>
                      <RiVipDiamondFill className={styles.roleIcon} style={{ color: settings.roles.followers.color }} />
                      <h3>Takipçiler</h3>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Renk</label>
                        <p>Chat'te görünecek isim rengi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="color"
                          value={settings.roles.followers.color}
                          onChange={(e) => handleNestedChange('roles.followers.color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Rozetler</label>
                        <p>Kullanıcı adlarının yanında rozet göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.followers.badges}
                            onChange={(e) => handleNestedChange('roles.followers.badges', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Öncelik</label>
                        <p>Chat'te mesajlarının görünme önceliği</p>
                      </div>
                      <div className={styles.settingControl}>
                        <select
                          value={settings.roles.followers.priority}
                          onChange={(e) => handleNestedChange('roles.followers.priority', parseInt(e.target.value))}
                          className={styles.selectInput}
                        >
                          <option value="0">Yüksek</option>
                          <option value="1">Orta</option>
                          <option value="2">Düşük</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* VIP Kullanıcılar */}
                  <div className={styles.roleSection}>
                    <div className={styles.roleHeader}>
                      <RiVipLine className={styles.roleIcon} style={{ color: settings.roles.vip.color }} />
                      <h3>VIP Kullanıcılar</h3>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Renk</label>
                        <p>Chat'te görünecek isim rengi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="color"
                          value={settings.roles.vip.color}
                          onChange={(e) => handleNestedChange('roles.vip.color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Rozetler</label>
                        <p>Kullanıcı adlarının yanında rozet göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.vip.badges}
                            onChange={(e) => handleNestedChange('roles.vip.badges', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Özel Efektler</label>
                        <p>Chat mesajlarında özel efektler göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.vip.specialEffects}
                            onChange={(e) => handleNestedChange('roles.vip.specialEffects', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Öncelik</label>
                        <p>Chat'te mesajlarının görünme önceliği</p>
                      </div>
                      <div className={styles.settingControl}>
                        <select
                          value={settings.roles.vip.priority}
                          onChange={(e) => handleNestedChange('roles.vip.priority', parseInt(e.target.value))}
                          className={styles.selectInput}
                        >
                          <option value="0">Yüksek</option>
                          <option value="1">Orta</option>
                          <option value="2">Düşük</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Normal Kullanıcılar */}
                  <div className={styles.roleSection}>
                    <div className={styles.roleHeader}>
                      <FiUser className={styles.roleIcon} style={{ color: settings.roles.regulars.color }} />
                      <h3>Normal Kullanıcılar</h3>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Renk</label>
                        <p>Chat'te görünecek isim rengi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="color"
                          value={settings.roles.regulars.color}
                          onChange={(e) => handleNestedChange('roles.regulars.color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Rozetler</label>
                        <p>Kullanıcı adlarının yanında rozet göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.regulars.badges}
                            onChange={(e) => handleNestedChange('roles.regulars.badges', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Öncelik</label>
                        <p>Chat'te mesajlarının görünme önceliği</p>
                      </div>
                      <div className={styles.settingControl}>
                        <select
                          value={settings.roles.regulars.priority}
                          onChange={(e) => handleNestedChange('roles.regulars.priority', parseInt(e.target.value))}
                          className={styles.selectInput}
                        >
                          <option value="0">Yüksek</option>
                          <option value="1">Orta</option>
                          <option value="2">Düşük</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Yeni Gelenler */}
                  <div className={styles.roleSection}>
                    <div className={styles.roleHeader}>
                      <FiEye className={styles.roleIcon} style={{ color: settings.roles.newViewers.color }} />
                      <h3>Yeni Gelenler</h3>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Renk</label>
                        <p>Chat'te görünecek isim rengi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <input
                          type="color"
                          value={settings.roles.newViewers.color}
                          onChange={(e) => handleNestedChange('roles.newViewers.color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Rozetler</label>
                        <p>Kullanıcı adlarının yanında rozet göster</p>
                      </div>
                      <div className={styles.settingControl}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings.roles.newViewers.badges}
                            onChange={(e) => handleNestedChange('roles.newViewers.badges', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Öncelik</label>
                        <p>Chat'te mesajlarının görünme önceliği</p>
                      </div>
                      <div className={styles.settingControl}>
                        <select
                          value={settings.roles.newViewers.priority}
                          onChange={(e) => handleNestedChange('roles.newViewers.priority', parseInt(e.target.value))}
                          className={styles.selectInput}
                        >
                          <option value="0">Yüksek</option>
                          <option value="1">Orta</option>
                          <option value="2">Düşük</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Moderasyon */}
          {activeTab === 'moderation' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('moderation')}>
                <h2>
                  <FiLock className={styles.sectionIcon} />
                  Moderasyon
                </h2>
                {expandedSections.moderation ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.moderation && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Otomatik Moderasyon</label>
                      <p>Uygunsuz içeriği otomatik olarak filtrele</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.moderation.autoMod}
                          onChange={(e) => handleChange('moderation.autoMod', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Timeout Süresi (saniye)</label>
                      <p>Uygunsuz davranışlarda uygulanacak timeout süresi</p>
                    </div>
                    <div className={styles.settingControl}>
                      <input
                        type="number"
                        value={settings.moderation.timeoutDuration}
                        onChange={(e) => handleChange('moderation.timeoutDuration', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="10"
                        max="86400"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Maksimum Mesaj Uzunluğu</label>
                      <p>Bir mesajın maksimum karakter uzunluğu</p>
                    </div>
                    <div className={styles.settingControl}>
                      <input
                        type="number"
                        value={settings.moderation.maxMessageLength}
                        onChange={(e) => handleChange('moderation.maxMessageLength', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="10"
                        max="500"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Tekrar Eden Mesaj Filtresi</label>
                      <p>Aynı mesajın tekrar gönderilmesini engeller</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.moderation.duplicateMessageFilter}
                          onChange={(e) => handleChange('moderation.duplicateMessageFilter', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yasaklı Kelimeler</label>
                      <p>Chat'te yasaklı olan kelimeler listesi</p>
                    </div>
                    <div className={styles.settingControl}>
                      <div className={styles.bannedWordsContainer}>
                        {settings.moderation.bannedWords.map((word, index) => (
                          <div key={index} className={styles.bannedWord}>
                            <span>{word}</span>
                            <button 
                              className={styles.removeWordButton}
                              onClick={() => {
                                const newWords = [...settings.moderation.bannedWords];
                                newWords.splice(index, 1);
                                handleChange('moderation.bannedWords', newWords);
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                        <div className={styles.addWordContainer}>
                          <input
                            type="text"
                            placeholder="Yeni yasaklı kelime ekle"
                            className={styles.addWordInput}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                handleChange('moderation.bannedWords', [
                                  ...settings.moderation.bannedWords,
                                  e.target.value.trim()
                                ]);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button className={styles.addWordButton}>
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bildirimler */}
          {activeTab === 'notifications' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('notifications')}>
                <h2>
                  <FaRegBell className={styles.sectionIcon} />
                  Bildirimler
                </h2>
                {expandedSections.notifications ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.notifications && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yeni Takipçi Bildirimi</label>
                      <p>Yeni takipçiler için bildirim göster</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.newFollower}
                          onChange={(e) => handleChange('notifications.newFollower', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Yeni Abone Bildirimi</label>
                      <p>Yeni aboneler için bildirim göster</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.newSubscriber}
                          onChange={(e) => handleChange('notifications.newSubscriber', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Bağış Bildirimi</label>
                      <p>Bağışlar için bildirim göster</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.donation}
                          onChange={(e) => handleChange('notifications.donation', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Raid Bildirimi</label>
                      <p>Raidler için bildirim göster</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.raid}
                          onChange={(e) => handleChange('notifications.raid', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Host Bildirimi</label>
                      <p>Hostlar için bildirim göster</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.host}
                          onChange={(e) => handleChange('notifications.host', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Sesli Bildirim</label>
                      <p>Bildirimler için ses efekti çal</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.sound}
                          onChange={(e) => handleChange('notifications.sound', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  {settings.notifications.sound && (
                    <div className={styles.settingRow}>
                      <div className={styles.settingLabel}>
                        <label>Ses Seviyesi</label>
                        <p>Bildirim seslerinin seviyesi</p>
                      </div>
                      <div className={styles.settingControl}>
                        <div className={styles.sliderContainer}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.notifications.volume}
                            onChange={(e) => handleChange('notifications.volume', parseInt(e.target.value))}
                            className={styles.slider}
                          />
                          <span className={styles.sliderValue}>{settings.notifications.volume}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Gelişmiş Ayarlar */}
          {activeTab === 'advanced' && (
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('advanced')}>
                <h2>
                  <BsGearFill className={styles.sectionIcon} />
                  Gelişmiş Ayarlar
                </h2>
                {expandedSections.advanced ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSections.advanced && (
                <div className={styles.sectionContent}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Otomatik Yeniden Bağlanma</label>
                      <p>Bağlantı kesildiğinde otomatik olarak yeniden bağlan</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.advanced.reconnect}
                          onChange={(e) => handleChange('advanced.reconnect', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Ağ Optimizasyonu</label>
                      <p>Yayın kalitesini ağ durumuna göre otomatik ayarla</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.advanced.networkOptimization}
                          onChange={(e) => handleChange('advanced.networkOptimization', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Dinamik Bitrate</label>
                      <p>Ağ durumuna göre bitrate'i otomatik ayarla</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.advanced.dynamicBitrate}
                          onChange={(e) => handleChange('advanced.dynamicBitrate', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Düşük Gecikme Modu</label>
                      <p>Daha düşük gecikme için yayın kalitesinden ödün ver</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.advanced.lowLatencyMode}
                          onChange={(e) => handleChange('advanced.lowLatencyMode', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>
                      <label>Donanım Hızlandırma</label>
                      <p>GPU kullanarak yayın performansını artır</p>
                    </div>
                    <div className={styles.settingControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={settings.advanced.enableHardwareAcceleration}
                          onChange={(e) => handleChange('advanced.enableHardwareAcceleration', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamSettings;