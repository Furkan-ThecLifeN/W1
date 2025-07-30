import React, { useState, useEffect, useRef } from "react";
import styles from "./SoundSettings.module.css";
import {
  Mic,
  Headphones,
  SlidersHorizontal,
  Volume2, // Ses çıkışı testi için
  VolumeX, // Ses girişi testi için
  MessageSquareText, // Bas konuş için
  Sparkles, // Yakında/Özel Bağlantılar için
  Settings, // Gelişmiş Ayarlar için
  Radio, // Otomatik ses algılama için
} from "lucide-react";

const SoundSettings = () => {
  const [inputDevice, setInputDevice] = useState("");
  const [outputDevice, setOutputDevice] = useState("");
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [inputVolume, setInputVolume] = useState(70); // Yüzde olarak
  const [outputVolume, setOutputVolume] = useState(85); // Yüzde olarak
  const [voiceActivityMode, setVoiceActivityMode] = useState("auto"); // auto, push_to_talk
  const [inputLevel, setInputLevel] = useState(0); // Mikrofon giriş seviyesi (0-100)
  const [isInputTesting, setIsInputTesting] = useState(false);
  const [isOutputTesting, setIsOutputTesting] = useState(false);

  const audioInputRef = useRef(null); // Mikrofon stream'i için
  const audioOutputRef = useRef(null); // Ses çıkışı testi için

  useEffect(() => {
    // Ses cihazlarını listele
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((device) => device.kind === "audioinput");
        const audioOutputs = devices.filter((device) => device.kind === "audiooutput");

        setInputDevices(audioInputs);
        setOutputDevices(audioOutputs);

        if (audioInputs.length > 0) {
          setInputDevice(audioInputs[0].deviceId);
        }
        if (audioOutputs.length > 0) {
          setOutputDevice(audioOutputs[0].deviceId);
        }
      } catch (error) {
        console.error("Ses cihazları alınırken hata oluştu:", error);
      }
    };

    getAudioDevices();
  }, []);

  // Mikrofon giriş seviyesi takibi
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let scriptProcessor;

    const startMonitoring = async () => {
      if (!inputDevice) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: inputDevice ? { exact: inputDevice } : undefined },
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1); // 2048 buffer size
        scriptProcessor.onaudioprocess = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;
          const level = Math.min(100, (average / 128) * 100); // 0-128 arası değeri 0-100'e ölçekle
          setInputLevel(level);
        };

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        audioInputRef.current = stream; // Akışı sakla
      } catch (error) {
        console.error("Mikrofon akışı başlatılırken hata oluştu:", error);
      }
    };

    const stopMonitoring = () => {
      if (audioInputRef.current) {
        audioInputRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };

    if (isInputTesting) {
      startMonitoring();
    } else {
      stopMonitoring();
      setInputLevel(0); // Test bitince seviyeyi sıfırla
    }

    return () => stopMonitoring(); // Bileşen unmount olduğunda durdur
  }, [inputDevice, isInputTesting]);

  const handleInputDeviceChange = (e) => {
    setInputDevice(e.target.value);
  };

  const handleOutputDeviceChange = (e) => {
    setOutputDevice(e.target.value);
  };

  const handleInputVolumeChange = (e) => {
    setInputVolume(e.target.value);
    // Gerçek uygulamada, bu değeri Web Audio API ile mikrofon kazancına uygulamalısın.
  };

  const handleOutputVolumeChange = (e) => {
    setOutputVolume(e.target.value);
    // Gerçek uygulamada, bu değeri ses çıkış aygıtının genel sesine uygulamalısın.
    if (audioOutputRef.current) {
      audioOutputRef.current.volume = e.target.value / 100;
    }
  };

  const handleInputTest = () => {
    setIsInputTesting(!isInputTesting);
  };

  const handleOutputTest = async () => {
    setIsOutputTesting(true);
    // Basit bir ses çalma testi
    try {
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Örnek bir ses dosyası
      if (outputDevice && audio.setSinkId) {
        await audio.setSinkId(outputDevice); // Seçilen çıkış aygıtına yönlendir
      }
      audio.volume = outputVolume / 100; // Çıkış ses seviyesini uygula
      audioOutputRef.current = audio; // Ses objesini sakla
      audio.play();
      audio.onended = () => {
        setIsOutputTesting(false);
        audioOutputRef.current = null;
      };
    } catch (error) {
      console.error("Ses çıkışı testi başlatılırken hata:", error);
      setIsOutputTesting(false);
    }
  };

  const stopOutputTest = () => {
    if (audioOutputRef.current) {
      audioOutputRef.current.pause();
      audioOutputRef.current = null;
    }
    setIsOutputTesting(false);
  };

  return (
    <div className={styles.audioSettings}>
      <div className={styles.header}>
        <Mic className={styles.headerIcon} />
        <h2 className={styles.title}>Ses Ayarları</h2>
        <p className={styles.description}>
          Mikrofon ve ses çıkış ayarlarınızı buradan yapılandırın.
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* Mikrofon Giriş Aygıtı */}
        <div className={styles.settingGroup}>
          <label htmlFor="input-device-select" className={styles.label}>
            <Mic className={styles.icon} /> Giriş Aygıtı (Mikrofon)
          </label>
          <select
            id="input-device-select"
            className={styles.selectInput}
            value={inputDevice}
            onChange={handleInputDeviceChange}
          >
            {inputDevices.length > 0 ? (
              inputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Mikrofon ${device.deviceId.substring(0, 8)}...`}
                </option>
              ))
            ) : (
              <option value="">Mikrofon bulunamadı</option>
            )}
          </select>
          <div className={styles.volumeControl}>
            <label htmlFor="input-volume">Giriş Sesi</label>
            <input
              type="range"
              id="input-volume"
              min="0"
              max="100"
              value={inputVolume}
              onChange={handleInputVolumeChange}
              className={styles.volumeSlider}
            />
            <span className={styles.volumeValue}>{inputVolume}%</span>
          </div>
          <div className={styles.testSection}>
            <button
              onClick={handleInputTest}
              className={`${styles.testButton} ${isInputTesting ? styles.testingActive : ""}`}
            >
              {isInputTesting ? <VolumeX size={16} /> : <Mic size={16} />}
              {isInputTesting ? "Test Ediliyor..." : "Mikrofonu Test Et"}
            </button>
            <div className={styles.inputLevelMeter}>
              <div
                className={styles.inputLevelBar}
                style={{ width: `${inputLevel}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Ses Çıkış Aygıtı */}
        <div className={styles.settingGroup}>
          <label htmlFor="output-device-select" className={styles.label}>
            <Headphones className={styles.icon} /> Çıkış Aygıtı (Hoparlör/Kulaklık)
          </label>
          <select
            id="output-device-select"
            className={styles.selectInput}
            value={outputDevice}
            onChange={handleOutputDeviceChange}
          >
            {outputDevices.length > 0 ? (
              outputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Hoparlör ${device.deviceId.substring(0, 8)}...`}
                </option>
              ))
            ) : (
              <option value="">Çıkış aygıtı bulunamadı</option>
            )}
          </select>
          <div className={styles.volumeControl}>
            <label htmlFor="output-volume">Çıkış Sesi</label>
            <input
              type="range"
              id="output-volume"
              min="0"
              max="100"
              value={outputVolume}
              onChange={handleOutputVolumeChange}
              className={styles.volumeSlider}
            />
            <span className={styles.volumeValue}>{outputVolume}%</span>
          </div>
          <div className={styles.testSection}>
            <button
              onClick={isOutputTesting ? stopOutputTest : handleOutputTest}
              className={`${styles.testButton} ${isOutputTesting ? styles.testingActive : ""}`}
            >
              {isOutputTesting ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isOutputTesting ? "Durdur" : "Hoparlörü Test Et"}
            </button>
          </div>
        </div>
      </div>

      {/* Ses Aktivasyon Modu */}
      <div className={styles.voiceActivationSection}>
        <h3 className={styles.sectionTitle}>
          <Radio className={styles.sectionIcon} /> Ses Aktivasyon Modu
        </h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="voice-mode"
              value="auto"
              checked={voiceActivityMode === "auto"}
              onChange={() => setVoiceActivityMode("auto")}
            />
            <span>Otomatik Ses Algılama</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="voice-mode"
              value="push_to_talk"
              checked={voiceActivityMode === "push_to_talk"}
              onChange={() => setVoiceActivityMode("push_to_talk")}
            />
            <span>Bas Konuş</span>
            <span className={styles.hotkeyHint}> (Varsayılan: `Sol Alt`)</span>
          </label>
        </div>
        {voiceActivityMode === "auto" && (
          <div className={styles.autoDetectSettings}>
            <label className={styles.label}>
              <SlidersHorizontal className={styles.icon} /> Ses Aktivasyon Eşiği
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={30} // Örnek değer
              className={styles.volumeSlider}
            />
            <p className={styles.settingHint}>
              Bu ayar, mikrofonunuzun ne kadar sessiz sesleri algılayacağını belirler.
            </p>
          </div>
        )}
        {voiceActivityMode === "push_to_talk" && (
          <div className={styles.pushToTalkSettings}>
            <label className={styles.label}>
              <MessageSquareText className={styles.icon} /> Bas Konuş Tuşu
            </label>
            <button className={styles.hotkeyButton}>Tuş Ata</button>
            <p className={styles.settingHint}>
              Konuşmak için basılı tutulması gereken tuşu ayarlayın.
            </p>
          </div>
        )}
      </div>

      {/* Özel Bağlantılar (Yakında) */}
      <div className={styles.specialConnectionsSection}>
        <h3 className={styles.sectionTitle}>
          <Sparkles className={styles.sectionIcon} /> Özel Bağlantılar
        </h3>
        <div className={styles.comingSoonOverlay}>
          <p className={styles.comingSoonText}>Yakında...</p>
        </div>
      </div>

      {/* Gelişmiş Ses Ayarları */}
      <div className={styles.advancedSettingsSection}>
        <h3 className={styles.sectionTitle}>
          <Settings className={styles.sectionIcon} /> Gelişmiş Ses Ayarları
        </h3>
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            <Mic className={styles.icon} /> Gürültü Engelleme
          </label>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="noise-sup" className={styles.checkboxInput} />
            <label htmlFor="noise-sup" className={styles.toggleLabel}></label>
          </div>
        </div>
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            <Headphones className={styles.icon} /> Yankı Engelleme
          </label>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="echo-cancel" className={styles.checkboxInput} />
            <label htmlFor="echo-cancel" className={styles.toggleLabel}></label>
          </div>
        </div>
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            <SlidersHorizontal className={styles.icon} /> Otomatik Kazan Kontrolü
          </label>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="auto-gain" defaultChecked className={styles.checkboxInput} />
            <label htmlFor="auto-gain" className={styles.toggleLabel}></label>
          </div>
        </div>
        <p className={styles.settingHint}>
          Bu ayarlar, ses kalitenizi optimize etmenize yardımcı olur.
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.applyButton}>Ayarları Kaydet</button>
      </div>
    </div>
  );
};

export default SoundSettings;