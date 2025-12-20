import React, { useState } from "react";
import styles from "./TextChannelSettingsModal.module.css";
import { FaTimes, FaEdit, FaTrash, FaHashtag } from "react-icons/fa";

const TextChannelSettingsModal = ({ channel, onClose, onRename, onDelete }) => {
  const [name, setName] = useState(channel.name);

  const handleRename = () => {
    if (name.trim() && name !== channel.name) {
      onRename(name.trim());
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bölümü */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Kanal Ayarları</h3>
            <p className={styles.subTitle}>Metin kanalı ismini ve yönetimini düzenle.</p>
          </div>
          <FaTimes className={styles.closeBtnIcon} onClick={onClose} />
        </div>

        <div className={styles.content}>
          {/* Kanal İsmi Grubu */}
          <div className={styles.settingGroup}>
            <label className={styles.label}>KANAL ADI</label>
            <div className={styles.inputActionRow}>
              <div className={styles.inputWrapper}>
                <FaHashtag className={styles.icon} />
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => {
                    // Metin kanalı formatı: küçük harf ve boşluk yerine tire
                    const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                    setName(val);
                  }}
                  placeholder="kanal-adi"
                />
              </div>
              <button className={styles.saveBtn} onClick={handleRename}>
                Kaydet
              </button>
            </div>
          </div>

          {/* Tehlikeli Bölge (Kanal Silme) */}
          <div className={styles.dangerZone}>
             <div className={styles.dangerText}>Kanalı Kalıcı Olarak Sil</div>
             <button 
                className={styles.deleteBtn}
                onClick={() => { if(window.confirm("Bu metin kanalını silmek istediğine emin misin?")) onDelete(); }}
             >
                <FaTrash size={12} /> Sil
             </button>
          </div>
        </div>

        {/* Footer Bölümü */}
        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextChannelSettingsModal;