// src/components/SettingsSections/ProfileSettings/ProfileSettings.jsx

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiEdit,
  FiCamera,
  FiUser,
  FiLock,
  FiUsers,
  FiChevronRight,
  FiCheck,
  FiX,
  FiShield,
  FiPlus,
} from "react-icons/fi";
import Modal from "react-modal";
import styles from "./ProfileSettings.module.css";
import Resizer from "react-image-file-resizer";
import { addDays } from "date-fns";

// Firebase servislerini firebase-client.js'den import edin
import { auth } from "../../../../config/firebase-client";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import { useUser } from "../../../../context/UserContext";

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

  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: "Ahmet Yılmaz", username: "ahmet_yilmaz", isMember: true },
    { id: 2, name: "Mehmet Kaya", username: "mehmet.kaya", isMember: false },
  ]);

  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Firestore'dan değil, UserContext'ten verileri al
  useEffect(() => {
    if (currentUser) {
      const fullProfile = { ...defaultUser, ...currentUser };
      setProfileData({
        profileImage: fullProfile.photoURL,
        displayName: fullProfile.displayName,
        username: fullProfile.username,
        email: fullProfile.email,
        phone: fullProfile.phone || "",
        bio: fullProfile.bio || "",
        familyGroup: fullProfile.familySystem || null,
        password: "••••••••",
      });
      // lastChangeDates verisini de UserContext'ten al
      setLastChangeDates(fullProfile.lastChangeDates || {});
    }
  }, [currentUser, defaultUser]);

  // Bir alanın değiştirilip değiştirilemeyeceğini kontrol eder
  const canChange = useCallback((field) => {
    const lastChange = lastChangeDates[field];
    if (!lastChange) return true;

    // Firebase'den gelen Timestamp objesi veya string olarak gelen tarihi işler
    const lastChangeDate = (lastChange.toDate && typeof lastChange.toDate === 'function')
      ? lastChange.toDate()
      : new Date(lastChange);
    
    const today = new Date();
    const expiryDate = addDays(lastChangeDate, DURATION_LIMIT_DAYS);
    return today > expiryDate;
  }, [lastChangeDates]);

  const getRemainingTime = useCallback((field) => {
    const lastChange = lastChangeDates[field];
    if (!lastChange) return null;

    const lastChangeDate = (lastChange.toDate && typeof lastChange.toDate === 'function')
      ? lastChange.toDate()
      : new Date(lastChange);
    
    const today = new Date();
    const expiryDate = addDays(lastChangeDate, DURATION_LIMIT_DAYS);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  }, [lastChangeDates]);

  const triggerImageUpload = () => fileInputRef.current.click();

  const handleImageUpload = (e) => {
    if (!canChange("photoURL")) {
      setStatusMessage({
        type: "error",
        text: `Profil fotoğrafı, ${getRemainingTime("photoURL")} gün sonra değiştirilebilir.`,
      });
      return;
    }
    const file = e.target.files[0];
    if (file) {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        "JPEG",
        80,
        0,
        (uri) => {
          setProfileData((prev) => ({ ...prev, profileImage: uri }));
          setChanges((prev) => ({ ...prev, photoURL: uri }));
        },
        "base64"
      );
    }
  };

  const startEdit = (field) => {
    if (!canChange(field)) {
      setStatusMessage({
        type: "error",
        text: `${field.charAt(0).toUpperCase() + field.slice(1)} alanı, ${getRemainingTime(field)} gün sonra değiştirilebilir.`,
      });
      return;
    }
    setEditField(field);
    setTempValue(profileData[field]);
    setStatusMessage(null);
    setIsPasswordCorrect(false); // Yeni bir düzenleme başlatıldığında şifre doğrulama durumunu sıfırla
  };

  const cancelEdit = () => {
    setEditField(null);
    setTempValue("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsPasswordCorrect(false);
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!editField) return;

    const currentValue = profileData[editField];
    let finalValue = tempValue;

    if (currentValue === tempValue) {
      const newChanges = { ...changes };
      delete newChanges[editField];
      setChanges(newChanges);
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
      console.error("Şifre doğrulama hatası:", error);
      setStatusMessage({
        type: "error",
        text: "Mevcut şifre hatalı. Lütfen tekrar deneyin.",
      });
    }
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: "error", text: "Yeni şifreler eşleşmiyor." });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({
        type: "error",
        text: "Yeni şifre en az 6 karakter olmalıdır."
      });
      return;
    }
    // Şifre değişikliğini `changes` state'ine ekle
    setChanges((prev) => ({ ...prev, password: newPassword }));
    setStatusMessage({
      type: "success",
      text: "Şifre değişikliği sıraya alındı. 'Tüm Değişiklikleri Kaydet'e tıklayın.",
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
    setStatusMessage({ type: "info", text: "Tüm değişiklikler kaydediliyor..." });

    try {
      const idToken = await auth.currentUser.getIdToken();

      // Değişiklikleri backend'e gönderme
      const res = await fetch(`${API_URL}/api/auth/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(changes),
      });

      // API yanıtının başarılı olup olmadığını kontrol et
      if (!res.ok) {
        // Hata durumunda, sunucunun JSON dönüp dönmediğini kontrol etmeden hata mesajı al
        const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen bir hata oluştu.' }));
        throw new Error(errorData.error || `HTTP Hata Kodu: ${res.status}`);
      }

      // Başarılı yanıtta JSON'ı al
      const data = await res.json();
      
      // Backend'den gelen güncel kullanıcı verileriyle UserContext'i güncelle
      const updatedUser = {
        ...auth.currentUser,
        ...data.profile, // Backend'den gelen güncel Firestore verileri
      };
      
      setCurrentUser(updatedUser);

      // Başarılı bir kayıttan sonra geçici state'leri sıfırla
      setChanges({});
      setLastChangeDates(data.profile.lastChangeDates || {}); // Backend'den gelen yeni tarihleri kaydet
      setStatusMessage({ type: "success", text: data.message });

    } catch (error) {
      console.error("Profil kaydetme hatası:", error);
      setStatusMessage({ type: "error", text: `Profil güncellenirken bir hata oluştu: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleFamilyMember = (id) => {
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, isMember: !member.isMember } : member
      )
    );
  };
  
  const sections = [
    { id: "general", label: "General", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    {
      id: "family",
      label: "Family",
      icon: <FiUsers />,
      disabled: false, // Değiştirildi: Family modalının çalışması için
      tag: "Yakında",
    },
  ];

  if (loading || !currentUser) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Account Settings</h3>
        </div>
        <ul className={styles.sidebarNav}>
          {sections.map((section) => (
            <li key={section.id}>
              <button
                className={`${styles.sidebarButton} ${activeSection === section.id ? styles.active : ""} ${section.disabled ? styles.disabled : ""}`}
                onClick={() => !section.disabled && setActiveSection(section.id)}
              >
                <span className={styles.sidebarIcon}>{section.icon}</span>
                <span className={styles.sidebarLabel}>{section.label}</span>
                {section.tag && (
                  <span className={styles.comingSoonTag}>{section.tag}</span>
                )}
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
          {isSaving ? "Saving..." : "Save All Changes"}
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
              src={profileData.profileImage}
              alt="Profile"
              className={styles.avatar}
            />
            <button
              className={styles.avatarEdit}
              onClick={triggerImageUpload}
              aria-label="Edit profile picture"
            >
              <FiCamera />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className={styles.fileInput}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.displayName}>{profileData.displayName}</h1>
            <p className={styles.username}>@{profileData.username}</p>
            <p className={styles.bio}>{profileData.bio || "No bio yet"}</p>
          </div>
        </header>

        <section className={styles.formSection}>
          {activeSection === "general" && (
            <>
              {["displayName", "username", "bio"].map((field) => (
                <div className={styles.formGroup} key={field}>
                  <label className={styles.formLabel}>
                    {field === "displayName" && "Display Name"}
                    {field === "username" && "Username"}
                    {field === "bio" && "Bio"}
                  </label>
                  {editField === field ? (
                    <div className={styles.editContainer}>
                      {field === "username" && (
                        <div className={styles.inputPrefix}>@</div>
                      )}
                      {field === "bio" ? (
                        <textarea
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className={styles.formTextarea}
                          rows="4"
                          autoFocus
                        />
                      ) : (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className={`${styles.formInput} ${field === "username" ? styles.withPrefix : ""}`}
                          autoFocus
                        />
                      )}
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={cancelEdit}
                          aria-label="Cancel edit"
                        >
                          <FiX />
                        </button>
                        <button
                          type="button"
                          className={styles.saveButton}
                          onClick={handleSave}
                          aria-label="Save field"
                        >
                          <FiCheck />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.viewContainer}>
                      <p className={styles.fieldValue}>
                        {field === "username"
                          ? `@${profileData[field]}`
                          : profileData[field] ||
                            (field === "bio" && "No bio yet") ||
                            ""}
                      </p>
                      <div className={styles.statusContainer}>
                        {getRemainingTime(field) && (
                          <span className={styles.cooldownTag}>
                            {getRemainingTime(field)} days left
                          </span>
                        )}
                        <button
                          className={styles.editButton}
                          onClick={() => startEdit(field)}
                          disabled={!canChange(field)}
                          aria-label={`Edit ${field}`}
                        >
                          <FiEdit />
                        </button>
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
                    {field === "email" && "Email"}
                    {field === "phone" && "Phone Number"}
                    {field === "password" && "Password"}
                  </label>
                  {editField === field ? (
                    <div className={styles.securityFlow}>
                      <div className={styles.securityHeader}>
                        <FiShield className={styles.securityIcon} />
                        <h3>
                          {field === "email" && "Change Email"}
                          {field === "phone" && "Change Phone Number"}
                          {field === "password" && "Change Password"}
                        </h3>
                      </div>
                      
                      {!isPasswordCorrect && (
                        <>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Current Password</label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className={styles.formInput}
                              placeholder="Enter your current password"
                              autoFocus
                            />
                          </div>
                          <div className={styles.buttonGroup}>
                            <button
                              className={styles.secondaryButton}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.primaryButton}
                              onClick={handlePasswordVerification}
                              disabled={!currentPassword}
                            >
                              <FiCheck /> Confirm Current Password
                            </button>
                          </div>
                        </>
                      )}
                      
                      {isPasswordCorrect && (
                        <>
                          {field !== "password" && (
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>{field === "email" ? "New Email" : "New Phone Number"}</label>
                              <input
                                type={field === "email" ? "email" : "tel"}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className={styles.formInput}
                                placeholder={`Enter your new ${field === "email" ? "email address" : "phone number"}`}
                                autoFocus
                              />
                            </div>
                          )}
                          {field === "password" && (
                            <>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>New Password</label>
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className={styles.formInput}
                                  placeholder="Enter your new password"
                                  autoFocus
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirm New Password</label>
                                <input
                                  type="password"
                                  value={confirmNewPassword}
                                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                                  className={styles.formInput}
                                  placeholder="Confirm your new password"
                                />
                              </div>
                            </>
                          )}
                          <div className={styles.buttonGroup}>
                            <button
                              className={styles.secondaryButton}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.primaryButton}
                              onClick={
                                field === "password" ? handlePasswordChange : handleSave
                              }
                              disabled={
                                field === "password"
                                  ? !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6
                                  : !tempValue
                              }
                            >
                              {field === "password" ? "Change Password" : "Save Change"}
                            </button>
                          </div>
                        </>
                      )}
                      {statusMessage && (
                        <p
                          className={`${styles.statusMessage} ${styles[statusMessage.type]}`}
                        >
                          {statusMessage.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.viewContainer}>
                      <p className={styles.fieldValue}>
                        {field === "email"
                          ? profileData.email
                          : field === "phone"
                          ? profileData.phone
                          : "••••••••"}
                      </p>
                      <div className={styles.statusContainer}>
                        {getRemainingTime(field) && (
                          <span className={styles.cooldownTag}>
                            {getRemainingTime(field)} days left
                          </span>
                        )}
                        <button
                          className={styles.editButton}
                          onClick={() => startEdit(field)}
                          disabled={!canChange(field)}
                          aria-label={`Edit ${field}`}
                        >
                          <FiEdit />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeSection === "family" && (
            <div className={styles.formGroup}>
              <div className={styles.membersSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Family Members</h3>
                  <button
                    className={styles.addButton}
                    onClick={() => setIsFamilyModalOpen(true)}
                  >
                    <FiPlus /> Add Member
                  </button>
                </div>
                <div className={styles.membersList}>
                  <div className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {profileData.displayName.charAt(0)}
                    </div>
                    <div className={styles.memberInfo}>
                      <h4 className={styles.memberName}>{profileData.displayName}</h4>
                      <p className={styles.memberRole}>Owner</p>
                    </div>
                  </div>
                  {familyMembers.filter((m) => m.isMember).map((member) => (
                    <div key={member.id} className={styles.memberCard}>
                      <div className={styles.memberAvatar}>
                        {member.name.charAt(0)}
                      </div>
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberName}>{member.name}</h4>
                        <p className={styles.memberRole}>Member</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Modal
        isOpen={isFamilyModalOpen}
        onRequestClose={() => setIsFamilyModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <FiUsers className={styles.modalIcon} />
            <h3>Add Family Members</h3>
          </div>
          <p className={styles.modalText}>
            Select from people you follow to add to your family group
          </p>
          <div className={styles.followedUsers}>
            {familyMembers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
                <div className={styles.userInfo}>
                  <h4 className={styles.userName}>{user.name}</h4>
                  <p className={styles.userHandle}>@{user.username}</p>
                </div>
                <button
                  className={`${styles.userToggle} ${
                    user.isMember ? styles.isMember : ""
                  }`}
                  onClick={() => toggleFamilyMember(user.id)}
                >
                  {user.isMember ? "Remove" : "Add"}
                </button>
              </div>
            ))}
          </div>
          <div className={styles.modalActions}>
            <button
              className={styles.secondaryButton}
              onClick={() => setIsFamilyModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => setIsFamilyModalOpen(false)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileSettings;