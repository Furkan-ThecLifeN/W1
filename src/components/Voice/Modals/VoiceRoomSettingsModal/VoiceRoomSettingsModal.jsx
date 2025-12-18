import React, { useState } from "react";
import styles from "../../ChannelSidebar/ChannelSidebar.module.css";

const VoiceRoomSettingsModal = ({ channel, onClose, onLock, onRename }) => {
  const [name, setName] = useState(channel.name);

  return (
    <div className={styles.createChannelOverlay} onClick={onClose}>
      <div className={styles.createChannelModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalHeader}>Oda Ayarları</h3>

        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>ODA İSMİ</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              className={styles.modalInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className={styles.btnCreate} onClick={() => onRename(name)}>
              Kaydet
            </button>
          </div>
        </div>

        <div className={styles.settingGroup} style={{ marginTop: "20px", borderTop: "1px solid #444", paddingTop: "15px" }}>
          <label className={styles.settingLabel}>GİZLİLİK</label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#ccc" }}>Odayı Kilitle (Sadece ben girebilirim)</span>
            <button
              className={channel.locked ? styles.btnCancel : styles.btnCreate}
              onClick={() => onLock(!channel.locked)}
              style={{ width: "100px" }}
            >
              {channel.locked ? "KİLİDİ AÇ" : "KİLİTLE"}
            </button>
          </div>
        </div>

        <button className={styles.closeBtn} style={{ marginTop: "20px", width: "100%" }} onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
};

export default VoiceRoomSettingsModal;