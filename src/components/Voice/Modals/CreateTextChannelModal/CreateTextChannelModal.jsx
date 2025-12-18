import React, { useState } from "react";
import styles from "../../ChannelSidebar/ChannelSidebar.module.css";

const CreateTextChannelModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  return (
    <div className={styles.createChannelOverlay} onClick={onClose}>
      <div className={styles.createChannelModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalHeader}>Geçici Kanal Oluştur</h3>
        <p style={{ color: "#bbb", fontSize: "0.85rem", marginBottom: "15px", textAlign: "center", lineHeight: "1.4" }}>
          ⚠️ Bu kanal <b>RAM</b> üzerinde tutulur.<br />
          Sayfa yenilendiğinde veya sunucu kapandığında <b>tamamen silinir</b>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name) onCreate(name);
          }}
        >
          <input
            className={styles.modalInput}
            placeholder="#kanal-ismi"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            autoFocus
          />
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className={styles.btnCreate}>
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTextChannelModal;