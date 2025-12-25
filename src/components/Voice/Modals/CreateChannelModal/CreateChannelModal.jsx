import React, { useState } from "react";
import styles from "./CreateChannelModal.module.css";
import {
  FaTimes,
  FaHashtag,
  FaVolumeUp,
  FaExclamationCircle,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import axios from "axios";

const CreateChannelModal = ({ onClose, serverId, type, onCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!name.trim() || loading) return;

  setLoading(true);
  try {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();

    const res = await axios.post(
      `http://localhost:3001/api/servers/${serverId}/channels`,
      { name: name.trim(), type },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Backend'den gelen gerçek veriyi sidebar'a bildir
    if (res.data?.channel) {
      onCreated?.(res.data.channel); 
    }
    onClose();
  } catch (err) {
    setError(err.response?.data?.error || "Kanal oluşturulamadı.");
  } finally {
    setLoading(false);
  }
};
  const Icon = type === "text" ? FaHashtag : FaVolumeUp;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              {type === "text" ? "Metin Kanalı" : "Ses Kanalı"}
            </h3>
            <p className={styles.subTitle}>
              {type === "text"
                ? "# genel-sohbet gibi bir isim ver."
                : "Sesli sohbet odana havalı bir isim ver."}
            </p>
          </div>

          <FaTimes className={styles.closeBtn} onClick={onClose} />
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>KANAL ADI</label>

              <div className={styles.inputWrapper}>
                <Icon className={styles.icon} />
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => {
                    let val = e.target.value.toLowerCase();
                    if (type === "text") val = val.replace(/\s+/g, "-");
                    setName(val);
                  }}
                  placeholder={type === "text" ? "yeni-kanal" : "Sohbet Odası"}
                  maxLength={25}
                  autoFocus
                />
              </div>

              {error && (
                <div className={styles.error}>
                  <FaExclamationCircle /> {error}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={loading}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className={styles.createBtn}
                disabled={loading || !name.trim()}
              >
                {loading ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
