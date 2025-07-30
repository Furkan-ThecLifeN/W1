import React, { useState, useEffect } from "react";
import styles from "./StatusActivity.module.css";
import {
  Activity,
  CalendarDays,
  CircleDotDashed,
  Edit,
  Eraser,
  ListPlus,
  Trash2,
  User,
  Clock,
  Settings,
  Gamepad,
  PlusCircle,
  Eye,
  Volume2,
  XCircle,
} from "lucide-react";

const initialSettings = {
  // Genel Durum ve Aktivite Ayarları
  displayActivityStatus: true,
  currentStatus: "Online", // Mevcut genel durum: Online, Idle, Busy, DoNotDisturb
  timedStatus: {
    // Zamanlanmış durum için
    enabled: false,
    duration: "",
    unit: "minutes",
    type: "", // Hangi durumun zamanlandığı (Idle, Busy, DoNotDisturb)
  },
  // Özel Durum Ayarları
  customStatus: {
    enabled: false,
    text: "",
    emoji: "",
  },
  // Oyun Algılama Ayarları
  gameDetection: {
    autoDetectGames: true,
    hideSmallGames: false,
  },
  // Kayıtlı Oyunlar (manuel eklenenler ve algılananlar)
  registeredGames: [
    { id: "game-1", name: "Valorant", autoDetected: true, visible: true },
    {
      id: "game-2",
      name: "Cyberpunk 2077",
      autoDetected: false,
      visible: true,
    },
    {
      id: "app-1",
      name: "Visual Studio Code",
      autoDetected: false,
      visible: true,
    }, // Örnek uygulama
  ],
  // Kullanıcı Tarafından Oluşturulan Etkinlikler
  userActivities: [
    {
      id: "event-1",
      name: "Haftalık Toplantı",
      server: "Proje Alpha Sunucusu",
      role: "Yönetici",
      date: "2025-08-01",
      time: "14:00",
    },
    {
      id: "event-2",
      name: "Oyun Gecesi",
      server: "Oyun Klanı Sunucusu",
      role: "Üye",
      date: "2025-08-03",
      time: "21:00",
    },
  ],
};

const StatusActivity = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [newGameName, setNewGameName] = useState(""); // Still present in initialSettings, but not used in JSX anymore for these sections
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    server: "",
    role: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    // Ayarlarda değişiklik olup olmadığını kontrol et
    const isChanged =
      JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasChanges(isChanged);
  }, [settings]);

  // Genel ayarları ve iç içe geçmiş objeleri güncellemek için yardımcı fonksiyon
  const handleSettingChange = (settingPath, value) => {
    setSettings((prevSettings) => {
      const update = (obj, path, val) => {
        const parts = path.split(".");
        let current = { ...obj };
        let temp = current;
        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] }; // Derin kopyalama
          temp = temp[parts[i]];
        }
        temp[parts[parts.length - 1]] = val;
        return current;
      };
      return update(prevSettings, settingPath, value);
    });
  };

  // Metin input'ları için özel handle
  const handleTextInputChange = (settingPath, e) => {
    handleSettingChange(settingPath, e.target.value);
  };

  // Temel Durum Ayarları
  const handleStatusChange = (status) => {
    handleSettingChange("currentStatus", status);
    if (status === "Online") {
      handleSettingChange("timedStatus.enabled", false);
      handleSettingChange("timedStatus.duration", "");
      handleSettingChange("timedStatus.unit", "minutes");
      handleSettingChange("timedStatus.type", "");
    } else {
      handleSettingChange("timedStatus.type", status);
    }
  };

  const handleTimedStatusDurationChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
      handleSettingChange("timedStatus.duration", value);
    }
  };

  const handleTimedStatusUnitChange = (e) => {
    handleSettingChange("timedStatus.unit", e.target.value);
  };

  const handleSetTimedStatus = () => {
    const { timedStatus, currentStatus } = settings;
    if (timedStatus.duration && currentStatus !== "Online") {
      alert(
        `${currentStatus} durumu ${timedStatus.duration} ${timedStatus.unit} boyunca ayarlandı!`
      );
      // Burada aslında backend'e API çağrısı yapılabilir
      handleSettingChange("timedStatus.enabled", true);
    } else if (currentStatus === "Online") {
      alert("Çevrimiçi durumu zamanlanamaz.");
    } else {
      alert("Lütfen bir süre girin.");
    }
  };

  // Kullanıcı Etkinlikleri
  const handleNewActivityChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (
      newActivity.name &&
      newActivity.server &&
      newActivity.date &&
      newActivity.time
    ) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        userActivities: [
          ...prevSettings.userActivities,
          { id: `event-${Date.now()}`, ...newActivity },
        ],
      }));
      setNewActivity({ name: "", server: "", role: "", date: "", time: "" });
      setIsCreatingActivity(false);
      alert("Etkinlik başarıyla oluşturuldu!");
    } else {
      alert("Lütfen tüm zorunlu alanları doldurun.");
    }
  };

  const handleEditActivity = (id) => {
    // Gerçek bir uygulamada burada bir modal açıp aktivite detaylarını doldururduk
    const activityToEdit = settings.userActivities.find((act) => act.id === id);
    alert(
      `Etkinliği Düzenle: ${activityToEdit.name} (Bu kısım geliştirilecek)`
    );
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        userActivities: prevSettings.userActivities.filter(
          (act) => act.id !== id
        ),
      }));
      alert("Etkinlik silindi.");
    }
  };

  // Sayfa Kaydet/Sıfırla
  const handleSaveChanges = () => {
    console.log("Ayarlar kaydedildi:", settings);
    alert("Ayarlarınız başarıyla kaydedildi!");
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    if (
      window.confirm(
        "Tüm değişiklikleri varsayılan ayarlara sıfırlamak istediğinizden emin misiniz?"
      )
    ) {
      setSettings(initialSettings);
      setNewGameName(""); // Still reset this even if not directly used in JSX
      setIsCreatingActivity(false);
      setNewActivity({ name: "", server: "", role: "", date: "", time: "" });
      setHasChanges(false);
      alert("Ayarlar varsayılan değerlere sıfırlandı!");
    }
  };

  return (
    <div className={styles.statusActivityContainer}>
      {/* Üst Başlık Alanı */}
      <header className={styles.pageHeader}>
        <CircleDotDashed className={styles.headerIcon} />
        <h1>Durum ve Etkinlik Yönetimi</h1>
        <p>
          Kişisel durumunuzu ayarlayın, ne oynadığınızı gösterin ve yaklaşan
          etkinliklerinizi kolayca planlayın.
        </p>
      </header>

      {/* Genel Durum Ayarları */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <User /> Durum Ayarları
        </h2>
        <div className={styles.statusOptions}>
          <button
            className={`${styles.statusButton} ${
              settings.currentStatus === "Online" ? styles.selectedStatus : ""
            }`}
            onClick={() => handleStatusChange("Online")}
          >
            <span
              className={`${styles.statusIndicator} ${styles.statusOnline}`}
            ></span>
            Çevrimiçi
          </button>
          <button
            className={`${styles.statusButton} ${
              settings.currentStatus === "Idle" ? styles.selectedStatus : ""
            }`}
            onClick={() => handleStatusChange("Idle")}
          >
            <span
              className={`${styles.statusIndicator} ${styles.statusIdle}`}
            ></span>
            Boşta
          </button>
          <button
            className={`${styles.statusButton} ${
              settings.currentStatus === "Busy" ? styles.selectedStatus : ""
            }`}
            onClick={() => handleStatusChange("Busy")}
          >
            <span
              className={`${styles.statusIndicator} ${styles.statusBusy}`}
            ></span>
            Meşgul
          </button>
          <button
            className={`${styles.statusButton} ${
              settings.currentStatus === "DoNotDisturb"
                ? styles.selectedStatus
                : ""
            }`}
            onClick={() => handleStatusChange("DoNotDisturb")}
          >
            <span
              className={`${styles.statusIndicator} ${styles.statusDoNotDisturb}`}
            ></span>
            Rahatsız Etmeyin
          </button>
        </div>

        {settings.currentStatus !== "Online" && (
          <div className={styles.timingSection}>
            <div className={styles.settingLabel}>
              <h4>
                <Clock size={20} /> Bu durumu ne kadar sürdürmek istersiniz?
              </h4>
              <p>Seçilen durumun ne kadar süre aktif kalacağını belirleyin.</p>
            </div>
            <div className={styles.timingInputGroup}>
              <input
                type="number"
                id="durationInput"
                className={styles.timingInput}
                value={settings.timedStatus.duration}
                onChange={handleTimedStatusDurationChange}
                placeholder="Süre"
                min="1"
              />
              <select
                className={styles.timingInput}
                value={settings.timedStatus.unit}
                onChange={handleTimedStatusUnitChange}
              >
                <option value="minutes">Dakika</option>
                <option value="hours">Saat</option>
                <option value="days">Gün</option>
              </select>
              <button
                className={styles.applyButton}
                onClick={handleSetTimedStatus}
              >
                Ayarla
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Özel Durum Ayarı */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Settings /> Özel Durum Ayarı
        </h2>
        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <h4>Özel Durum Ayarla</h4>
            <p>
              Oyun oynamasan bile ne yaptığını belirten kısa bir mesaj göster.
            </p>
          </div>
          <label className={styles.modernToggleSwitch}>
            <input
              type="checkbox"
              checked={settings.customStatus.enabled}
              onChange={() =>
                handleSettingChange(
                  "customStatus.enabled",
                  !settings.customStatus.enabled
                )
              }
              disabled={!settings.displayActivityStatus}
            />
            <span className={styles.modernSlider}></span>
          </label>
        </div>
        {settings.customStatus.enabled && settings.displayActivityStatus && (
          <div className={styles.customStatusInputGroup}>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Örn: Ders Çalışıyor, Film İzliyor..."
              value={settings.customStatus.text}
              onChange={(e) => handleTextInputChange("customStatus.text", e)}
              maxLength={128}
            />
            <input
              type="text"
              className={styles.emojiInput}
              placeholder="😎"
              value={settings.customStatus.emoji}
              onChange={(e) => handleTextInputChange("customStatus.emoji", e)}
              maxLength={2}
            />
          </div>
        )}
      </section>

      {/* Etkinliklerim */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Activity /> Etkinliklerim
        </h2>

        {!isCreatingActivity && (
          <button
            className={styles.createActivityButton}
            onClick={() => setIsCreatingActivity(true)}
          >
            <ListPlus /> Yeni Etkinlik Oluştur
          </button>
        )}

        {isCreatingActivity && (
          <form
            onSubmit={handleAddActivity}
            className={styles.createActivityForm}
          >
            <div className={styles.formGroup}>
              <label htmlFor="activityName" className={styles.formLabel}>
                Etkinlik Adı:
              </label>
              <input
                type="text"
                id="activityName"
                name="name"
                className={styles.formInput}
                value={newActivity.name}
                onChange={handleNewActivityChange}
                placeholder="Etkinlik adını girin"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="activityServer" className={styles.formLabel}>
                Sunucu:
              </label>
              <input
                type="text"
                id="activityServer"
                name="server"
                className={styles.formInput}
                value={newActivity.server}
                onChange={handleNewActivityChange}
                placeholder="Etkinliğin yapılacağı sunucu"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="activityRole" className={styles.formLabel}>
                Rol (İsteğe Bağlı):
              </label>
              <input
                type="text"
                id="activityRole"
                name="role"
                className={styles.formInput}
                value={newActivity.role}
                onChange={handleNewActivityChange}
                placeholder="Etkinlik için özel rol (örn: Yönetici, Üye)"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="activityDate" className={styles.formLabel}>
                Tarih:
              </label>
              <input
                type="date"
                id="activityDate"
                name="date"
                className={styles.formInput}
                value={newActivity.date}
                onChange={handleNewActivityChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="activityTime" className={styles.formLabel}>
                Saat:
              </label>
              <input
                type="time"
                id="activityTime"
                name="time"
                className={styles.formInput}
                value={newActivity.time}
                onChange={handleNewActivityChange}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              <ListPlus /> Etkinlik Oluştur
            </button>
            <button
              type="button"
              className={`${styles.submitButton} ${styles.cancelButton}`}
              onClick={() => setIsCreatingActivity(false)}
            >
              <Eraser /> İptal Et
            </button>
          </form>
        )}

        {settings.userActivities.length > 0 ? (
          <div className={styles.activityGrid}>
            {settings.userActivities.map((activity) => (
              <div key={activity.id} className={styles.activityCard}>
                <h3>
                  <CalendarDays size={20} /> {activity.name}
                </h3>
                <p className={styles.activityDetail}>
                  <strong>Sunucu:</strong> {activity.server}
                </p>
                {activity.role && (
                  <p className={styles.activityDetail}>
                    <strong>Rol:</strong> {activity.role}
                  </p>
                )}
                <p className={styles.activityDetail}>
                  <strong>Tarih:</strong> {activity.date}
                </p>
                <p className={styles.activityDetail}>
                  <strong>Saat:</strong> {activity.time}
                </p>
                <div className={styles.activityActions}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleEditActivity(activity.id)}
                  >
                    <Edit size={16} /> Düzenle
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteActivity(activity.id)}
                  >
                    <Trash2 size={16} /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isCreatingActivity && (
            <p className={styles.noItemsMessage}>
              Henüz bir etkinliğiniz yok. Yeni bir tane oluşturabilirsiniz!
            </p>
          )
        )}
      </section>

      {/* Kaydet & Sıfırla Butonları */}
      {hasChanges && (
        <div className={styles.floatingSaveIndicator}>
          <span>**Kaydedilmemiş Değişiklikler Var!**</span>
          <div>
            <button
              className={styles.resetChangesButton}
              onClick={handleResetChanges}
            >
              Sıfırla
            </button>
            <button className={styles.saveButton} onClick={handleSaveChanges}>
              Ayarları Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusActivity;
