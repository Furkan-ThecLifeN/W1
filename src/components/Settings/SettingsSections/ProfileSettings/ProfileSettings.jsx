// src/components/SettingsSections/ProfileSettings/ProfileSettings.jsx

import { useState, useEffect, useCallback } from "react";
import {
  FiEdit,
  FiCamera,
  FiUser,
  FiLock,
  FiChevronRight,
  FiCheck,
  FiX,
  FiShield,
} from "react-icons/fi";
import Modal from "react-modal";
import styles from "./ProfileSettings.module.css";
import { addDays } from "date-fns";
import { auth } from "../../../../config/firebase-client";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useUser } from "../../../../context/UserContext";
import { defaultAvatars } from "../../../../data/defaultAvatars";

Modal.setAppElement("#root");

const DURATION_LIMIT_DAYS = 15;

const ProfileSettings = () => {
  const { currentUser, setCurrentUser, loading, defaultUser } = useUser();
  const [profileData, setProfileData] = useState({});
  const [changes, setChanges] = useState({});
  const [lastChangeDates, setLastChangeDates] = useState({});

  const [activeSection, setActiveSection] = useState("general");
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // UserContext'ten gelen verilerle state'leri doldurur
  useEffect(() => {
    if (currentUser) {
      const fullProfile = { ...defaultUser, ...currentUser };
      setProfileData({
        photoURL: fullProfile.photoURL,
        displayName: fullProfile.displayName,
        username: fullProfile.username,
        email: fullProfile.email,
        phone: fullProfile.phone || "",
        bio: fullProfile.bio || "",
        password: "••••••••",
      });
      setLastChangeDates(fullProfile.lastChangeDates || {});
    }
  }, [currentUser, defaultUser]);

  // Bir alanın değiştirilip değiştirilemeyeceğini kontrol eder
  const canChange = useCallback(
    (field) => {
      const lastChange = lastChangeDates[field];
      if (!lastChange) return true;
      const lastChangeDate =
        lastChange.toDate && typeof lastChange.toDate === "function"
          ? lastChange.toDate()
          : new Date(lastChange);
      const today = new Date();
      const expiryDate = addDays(lastChangeDate, DURATION_LIMIT_DAYS);
      return today > expiryDate;
    },
    [lastChangeDates]
  );

  // Değişiklik için kalan süreyi hesaplar
  const getRemainingTime = useCallback(
    (field) => {
      const lastChange = lastChangeDates[field];
      if (!lastChange) return null;
      const lastChangeDate =
        lastChange.toDate && typeof lastChange.toDate === "function"
          ? lastChange.toDate()
          : new Date(lastChange);
      const today = new Date();
      const expiryDate = addDays(lastChangeDate, DURATION_LIMIT_DAYS);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : null;
    },
    [lastChangeDates]
  );
  
  // Modal'dan bir avatar seçildiğinde çalışır
  const handleSelectAvatar = (url) => {
    if (!canChange("photoURL")) {
      setStatusMessage({
        type: "error",
        text: `Profil fotoğrafı, ${getRemainingTime(
          "photoURL"
        )} gün sonra değiştirilebilir.`,
      });
      return;
    }
    setProfileData((prev) => ({ ...prev, photoURL: url }));
    setChanges((prev) => ({ ...prev, photoURL: url }));
    setIsAvatarModalOpen(false);
    setStatusMessage(null);
  };
  
  // Özel URL girildiğinde çalışır
  const handleCustomUrlSave = () => {
     if (!customAvatarUrl || !customAvatarUrl.startsWith('http')) {
        alert("Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalı).");
        return;
     }
     handleSelectAvatar(customAvatarUrl);
     setCustomAvatarUrl("");
  }

  // Düzenleme modunu başlatır
  const startEdit = (field) => {
    if (!canChange(field)) {
      setStatusMessage({
        type: "error",
        text: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } alanı, ${getRemainingTime(field)} gün sonra değiştirilebilir.`,
      });
      return;
    }
    setEditField(field);
    setTempValue(profileData[field]);
    setStatusMessage(null);
    setIsPasswordCorrect(false);
  };

  // Düzenleme modunu iptal eder
  const cancelEdit = () => {
    setEditField(null);
    setTempValue("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsPasswordCorrect(false);
    setStatusMessage(null);
  };
  
  // Tek bir alanın değişikliğini geçici olarak kaydeder
  const handleSave = () => {
    if (!editField) return;
    const currentValue = profileData[editField];
    let finalValue = tempValue;
    if (currentValue === tempValue) {
      cancelEdit();
      return;
    }
    if (editField === "username") {
      finalValue = finalValue.toLowerCase().replace(/[^a-z0-9._]/g, "");
    }
    setChanges((prev) => ({ ...prev, [editField]: finalValue }));
    setProfileData((prev) => ({ ...prev, [editField]: finalValue }));
    cancelEdit();
  };

  // Güvenlik gerektiren işlemler için mevcut şifreyi doğrular
  const handlePasswordVerification = async () => {
    if (!currentUser || !currentPassword) {
      setStatusMessage({ type: "error", text: "Lütfen mevcut şifrenizi girin." });
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      setIsPasswordCorrect(true);
      setStatusMessage(null);
    } catch (error) {
      setStatusMessage({ type: "error", text: "Mevcut şifre hatalı." });
    }
  };

  // Yeni şifre değişikliğini geçici olarak kaydeder
  const handlePasswordChange = () => {
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: "error", text: "Yeni şifreler eşleşmiyor." });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({ type: "error", text: "Yeni şifre en az 6 karakter olmalıdır." });
      return;
    }
    setChanges((prev) => ({ ...prev, password: newPassword }));
    setStatusMessage({
      type: "success",
      text: "Şifre değişikliği sıraya alındı.",
    });
    cancelEdit();
  };
  
  // Tüm bekleyen değişiklikleri backend'e tek bir istek ile gönderir
  const handleFinalSave = async () => {
    if (Object.keys(changes).length === 0) {
      setStatusMessage({ type: "info", text: "Kaydedilecek bir değişiklik yok." });
      return;
    }
    setIsSaving(true);
    setStatusMessage({ type: "info", text: "Değişiklikler kaydediliyor..." });

    try {
      const idToken = await auth.currentUser.getIdToken();
      // HATA DÜZELTMESİ: Metod "PATCH" olarak güncellendi.
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/profile/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(changes),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Sunucudan geçerli bir yanıt alınamadı." }));
        throw new Error(errorData.error || `HTTP Hata Kodu: ${res.status}`);
      }

      const data = await res.json();
      setCurrentUser({ ...currentUser, ...data.profile });
      setChanges({});
      setLastChangeDates(data.profile.lastChangeDates || {});
      setStatusMessage({ type: "success", text: data.message });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: `Profil güncellenirken bir hata oluştu: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: "general", label: "Genel", icon: <FiUser /> },
    { id: "security", label: "Güvenlik", icon: <FiLock /> },
  ];

  if (loading || !currentUser) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Profil verileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Hesap Ayarları</h3>
        <ul className={styles.sidebarNav}>
          {sections.map((section) => (
            <li key={section.id}>
              <button
                className={`${styles.sidebarButton} ${
                  activeSection === section.id ? styles.active : ""
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className={styles.sidebarIcon}>{section.icon}</span>
                <span className={styles.sidebarLabel}>{section.label}</span>
                <FiChevronRight className={styles.sidebarArrow} />
              </button>
            </li>
          ))}
        </ul>
        <button
          className={styles.saveAllButton}
          onClick={handleFinalSave}
          disabled={Object.keys(changes).length === 0 || isSaving}
        >
          {isSaving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
        </button>
        {statusMessage && (
          <p className={`${styles.statusMessage} ${styles[statusMessage.type]}`}>
            {statusMessage.text}
          </p>
        )}
      </nav>
      <main className={styles.content}>
        <header className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img
              src={profileData.photoURL}
              alt="Profile"
              className={styles.avatar}
            />
            <button
              className={styles.avatarEdit}
              onClick={() => setIsAvatarModalOpen(true)}
              aria-label="Profil fotoğrafını düzenle"
            >
              <FiCamera />
            </button>
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.displayName}>{profileData.displayName}</h1>
            <p className={styles.username}>@{profileData.username}</p>
            <p className={styles.bio}>{profileData.bio || "Henüz bio eklenmemiş."}</p>
          </div>
        </header>

        <section className={styles.formSection}>
          {activeSection === "general" && (
            <>
              {["displayName", "username", "bio"].map((field) => (
                <div className={styles.formGroup} key={field}>
                  <label className={styles.formLabel}>
                    {field === "displayName" && "Görünen Ad"}
                    {field === "username" && "Kullanıcı Adı"}
                    {field === "bio" && "Biyografi"}
                  </label>
                  {editField === field ? (
                    <div className={styles.editContainer}>
                      {field === "username" && <div className={styles.inputPrefix}>@</div>}
                      {field === "bio" ? (
                        <textarea value={tempValue} onChange={(e) => setTempValue(e.target.value)} className={styles.formTextarea} rows="4" autoFocus/>
                      ) : (
                        <input type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className={`${styles.formInput} ${field === "username" ? styles.withPrefix : ""}`} autoFocus />
                      )}
                      <div className={styles.editActions}>
                        <button type="button" className={styles.cancelButton} onClick={cancelEdit}><FiX /></button>
                        <button type="button" className={styles.saveButton} onClick={handleSave}><FiCheck /></button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.viewContainer}>
                      <p className={styles.fieldValue}>
                        {field === "username" ? `@${profileData[field]}` : profileData[field] || (field === "bio" && "Henüz bio eklenmemiş.") || ""}
                      </p>
                      <div className={styles.statusContainer}>
                        {getRemainingTime(field) && (<span className={styles.cooldownTag}>{getRemainingTime(field)} gün kaldı</span>)}
                        <button className={styles.editButton} onClick={() => startEdit(field)} disabled={!canChange(field)}><FiEdit /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeSection === "security" && (
            <>
              {["email", "phone", "password"].map((field) => (
                <div className={styles.formGroup} key={field}>
                  <label className={styles.formLabel}>
                    {field === "email" && "E-posta"}
                    {field === "phone" && "Telefon Numarası"}
                    {field === "password" && "Şifre"}
                  </label>
                  {editField === field ? (
                    <div className={styles.securityFlow}>
                      <div className={styles.securityHeader}>
                        <FiShield className={styles.securityIcon} />
                        <h3>{field === "email" && "E-postayı Değiştir"}{field === "phone" && "Telefon Numarasını Değiştir"}{field === "password" && "Şifreyi Değiştir"}</h3>
                      </div>
                      {!isPasswordCorrect ? (
                        <>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Mevcut Şifre</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={styles.formInput} placeholder="Mevcut şifrenizi girin" autoFocus />
                          </div>
                          <div className={styles.buttonGroup}>
                            <button className={styles.secondaryButton} onClick={cancelEdit}>İptal</button>
                            <button className={styles.primaryButton} onClick={handlePasswordVerification} disabled={!currentPassword}>Şifreyi Doğrula</button>
                          </div>
                        </>
                      ) : (
                        <>
                          {field !== "password" && (<div className={styles.formGroup}><label className={styles.formLabel}>{field === "email" ? "Yeni E-posta" : "Yeni Telefon Numarası"}</label><input type={field === "email" ? "email" : "tel"} value={tempValue} onChange={(e) => setTempValue(e.target.value)} className={styles.formInput} placeholder={`Yeni ${field === "email" ? "e-posta adresinizi" : "telefon numaranızı"} girin`} autoFocus /></div>)}
                          {field === "password" && (<><div className={styles.formGroup}><label className={styles.formLabel}>Yeni Şifre</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={styles.formInput} placeholder="Yeni şifrenizi girin" autoFocus /></div><div className={styles.formGroup}><label className={styles.formLabel}>Yeni Şifre (Tekrar)</label><input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={styles.formInput} placeholder="Yeni şifrenizi doğrulayın" /></div></>)}
                          <div className={styles.buttonGroup}>
                            <button className={styles.secondaryButton} onClick={cancelEdit}>İptal</button>
                            <button className={styles.primaryButton} onClick={field === "password" ? handlePasswordChange : handleSave} disabled={field === "password" ? (!newPassword || newPassword !== confirmNewPassword || newPassword.length < 6) : !tempValue}>{field === "password" ? "Şifreyi Değiştir" : "Değişikliği Kaydet"}</button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={styles.viewContainer}>
                      <p className={styles.fieldValue}>{field === "password" ? "••••••••" : profileData[field] || "Belirtilmemiş"}</p>
                      <div className={styles.statusContainer}>
                        {getRemainingTime(field) && (<span className={styles.cooldownTag}>{getRemainingTime(field)} gün kaldı</span>)}
                        <button className={styles.editButton} onClick={() => startEdit(field)} disabled={!canChange(field)}><FiEdit /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </section>
      </main>

      <Modal isOpen={isAvatarModalOpen} onRequestClose={() => setIsAvatarModalOpen(false)} className={styles.modal} overlayClassName={styles.overlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>Profil Fotoğrafını Değiştir</h3>
          <p className={styles.modalText}>Varsayılan avatarlardan birini seçin veya kendi URL'nizi girin.</p>
          <div className={styles.avatarGrid}>
            {defaultAvatars.map((avatar) => (
              <img key={avatar.id} src={avatar.url} alt={`Avatar ${avatar.id}`} className={styles.avatarOption} onClick={() => handleSelectAvatar(avatar.url)}/>
            ))}
          </div>
          <div className={styles.customUrlSection}>
            <input type="text" value={customAvatarUrl} onChange={(e) => setCustomAvatarUrl(e.target.value)} placeholder="https://..." className={styles.formInput}/>
            <button className={styles.primaryButton} onClick={handleCustomUrlSave}>URL'yi Kaydet</button>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.secondaryButton} onClick={() => setIsAvatarModalOpen(false)}>Kapat</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileSettings;
