import React, { useState } from "react";
import styles from "./TextChannelSettingsModal.module.css";
import { FaTimes, FaTrash, FaCheckCircle, FaExclamationTriangle, FaSave, FaHashtag } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import axios from "axios";
import ConfirmModal from "../../../ConfirmModal/ConfirmModal";

const TextChannelSettingsModal = ({ channel, serverId, onClose }) => {
  const [newName, setNewName] = useState(channel.name);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState({ text: "", type: "" });

  const getAuthHeader = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showStatus = (text, type) => {
    setLocalMessage({ text, type });
    if (type === "success") setTimeout(onClose, 2000);
    else setTimeout(() => setLocalMessage({ text: "", type: "" }), 3000);
  };

  const handleUpdate = async () => {
    if (!newName.trim() || newName === channel.name) return;
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const cid = channel.channelId || channel.id;
      
      await axios.patch(
        `http://localhost:3001/api/servers/${serverId}/channels/${cid}`,
        { name: newName.toLowerCase().replace(/\s+/g, "-") },
        headers
      );
      
      showStatus("Kanal başarıyla güncellendi.", "success");
    } catch (err) {
      showStatus("Güncelleme başarısız.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const cid = channel.channelId || channel.id;
      await axios.delete(
        `http://localhost:3001/api/servers/${serverId}/channels/${cid}`,
        headers
      );
      showStatus("Metin kanalı başarıyla silindi.", "success");
    } catch {
      showStatus("Silme işlemi başarısız.", "error");
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerTitleGroup}>
              <FaHashtag className={styles.headerIcon} />
              <div>
                <h3 className={styles.title}>Kanal Ayarları</h3>
                <p className={styles.subTitle}>#{channel.name} yapılandırmasını yönetin</p>
              </div>
            </div>
            <div className={styles.closeBtnWrapper} onClick={onClose}>
                <FaTimes />
            </div>
          </div>

          <div className={styles.content}>
            {localMessage.text && (
              <div className={`${styles.statusBox} ${localMessage.type === "success" ? styles.success : styles.error}`}>
                {localMessage.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                {localMessage.text}
              </div>
            )}

            <div className={styles.inputSection}>
              <label className={styles.inputLabel}>KANAL ADI</label>
              <div className={styles.inputWrapper}>
                <FaHashtag className={styles.innerHashIcon} />
                <input
                  type="text"
                  className={styles.modernInput}
                  placeholder="kanal-adi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <button
                className={styles.saveButton}
                onClick={handleUpdate}
                disabled={loading || !newName.trim() || newName === channel.name}
              >
                <FaSave /> {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.dangerZone}>
              <div className={styles.dangerHeader}>
                <FaExclamationTriangle className={styles.dangerIcon} />
                <div className={styles.dangerHeaderText}>
                    <h4>Tehlikeli Bölge</h4>
                    <p>Kanalı sildiğinizde tüm geçmiş kalıcı olarak yok olur.</p>
                </div>
              </div>
              <button className={styles.deleteButton} onClick={() => setIsConfirmOpen(true)} disabled={loading}>
                <FaTrash size={14} /> Kanalı Sil
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.closeBtn} onClick={onClose}>İptal</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Kanalı Sil"
        message={`"#${channel.name}" kanalını silmek istediğinden emin misin? Bu işlem geri alınamaz.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        type="danger"
      />
    </>
  );
};

export default TextChannelSettingsModal;