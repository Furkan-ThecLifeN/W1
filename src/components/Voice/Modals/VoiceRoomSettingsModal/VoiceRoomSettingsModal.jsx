import React, { useState, useEffect } from "react";
import styles from "./VoiceRoomSettingsModal.module.css";
import { 
  FaTimes, FaTrash, FaCheckCircle, 
  FaExclamationTriangle, FaLock, FaUnlock, 
  FaSave, FaVolumeUp 
} from "react-icons/fa";
import ConfirmModal from "../../../ConfirmModal/ConfirmModal";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useServerStore } from "../../../../Store/useServerStore"; // Store bağlantısı eklendi

const VoiceRoomSettingsModal = ({ channel, serverId, onClose, onDeleted }) => {
  // Store'dan güncelleme fonksiyonunu alıyoruz
  const { updateServerChannel } = useServerStore();
  
  const [newName, setNewName] = useState(channel.name);
  // Kanal verisi değiştiğinde state'i güncel tutuyoruz
  const [isLocked, setIsLocked] = useState(channel.locked || false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState({ text: "", type: "" });

  // Kanal prop olarak değişirse (başka bir yönetici kilitlerse vb.) yerel state'i güncelle
  useEffect(() => {
    setIsLocked(channel.locked || false);
    setNewName(channel.name);
  }, [channel]);

  const getAuthHeader = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showStatus = (text, type) => {
    setLocalMessage({ text, type });
    // Başarılı ise 1.5 saniye sonra kapat, hata ise mesajı 3 saniye göster
    if (type === "success") setTimeout(onClose, 1500);
    else setTimeout(() => setLocalMessage({ text: "", type: "" }), 3000);
  };

  const handleUpdate = async (updateData) => {
    if (loading) return;
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const cid = channel.channelId || channel.id;
      
      const response = await axios.patch(
        `http://localhost:3001/api/servers/${serverId}/channels/${cid}`,
        updateData,
        headers
      );
      
      // ✅ KRİTİK ADIM: Sayfa yenilenmeden Sidebar'ın güncellenmesi için store'u güncelliyoruz
      // Backend'den dönen güncel kanal verisini store'a yolluyoruz
      if (response.data.channel) {
        updateServerChannel(serverId, response.data.channel);
      }

      showStatus("Ayarlar kaydedildi.", "success");
    } catch (err) {
      console.error("[Modal Update Error]:", err);
      showStatus(err.response?.data?.error || "Ayarlar kaydedilemedi.", "error");
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
      
      onDeleted?.(cid);
      showStatus("Ses kanalı silindi.", "success");
    } catch (err) {
      showStatus("Kanal silinemedi.", "error");
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className={styles.createChannelOverlay} onClick={onClose}>
        <div className={styles.createChannelModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.headerTitleGroup}>
              <FaVolumeUp className={styles.headerIcon} />
              <div>
                <h3>Kanal Ayarları</h3>
                <p>"{channel.name}" ses odasını düzenle.</p>
              </div>
            </div>
            <div className={styles.closeBtnWrapper} onClick={onClose}>
                <FaTimes />
            </div>
          </div>

          <div className={styles.modalBody}>
            {localMessage.text && (
              <div className={`${styles.statusBox} ${localMessage.type === "success" ? styles.success : styles.error}`}>
                {localMessage.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                {localMessage.text}
              </div>
            )}

            {/* İSİM GÜNCELLEME */}
            <div className={styles.inputSection}>
              <label className={styles.inputLabel}>ODA ADI</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.modernInput}
                  value={newName}
                  placeholder="Kanal adı girin..."
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <button
                className={styles.saveButton}
                onClick={() => handleUpdate({ name: newName })}
                disabled={loading || newName === channel.name || !newName.trim()}
              >
                <FaSave /> {loading ? "İşleniyor..." : "İsmi Güncelle"}
              </button>
            </div>

            <div className={styles.separator} />

            {/* KİLİTLEME ALANI */}
            <div className={`${styles.statusCard} ${isLocked ? styles.lockedCard : styles.unlockedCard}`}>
                <div className={styles.cardInfo}>
                    <div className={styles.cardHeader}>
                        {isLocked ? <FaLock /> : <FaUnlock />}
                        <span>{isLocked ? "Oda Kilitli" : "Oda Herkese Açık"}</span>
                    </div>
                    <p>
                      {isLocked 
                        ? "Şu an sadece yönetici yetkisi olanlar bu odaya katılabilir." 
                        : "Şu an sunucudaki tüm üyeler bu odaya katılabilir."}
                    </p>
                </div>
                <button 
                  className={`${styles.actionBtn} ${isLocked ? styles.unlockBtn : styles.lockBtn}`} 
                  disabled={loading}
                  onClick={() => {
                    const newState = !isLocked;
                    setIsLocked(newState); // UI'da anlık değişim
                    handleUpdate({ locked: newState }); // DB'ye kalıcı kayıt
                  }}
                >
                  {isLocked ? "Kilidi Kaldır" : "Odayı Kilitle"}
                </button>
            </div>

            <div className={styles.dangerZone}>
              <div className={styles.dangerHeader}>
                <FaExclamationTriangle className={styles.dangerIcon} />
                <div className={styles.dangerHeaderText}>
                    <h4>Ses Kanalını Sil</h4>
                    <p>Bu işlem geri alınamaz.</p>
                </div>
              </div>
              <button className={styles.deleteButton} onClick={() => setIsConfirmOpen(true)} disabled={loading}>
                <FaTrash size={14} /> Kanalı Sil
              </button>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.closeBtn} onClick={onClose}>İptal</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Kanalı Sil"
        message={`"${channel.name}" ses kanalını silmek istediğinden emin misin?`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        type="danger"
      />
    </>
  );
};

export default VoiceRoomSettingsModal;