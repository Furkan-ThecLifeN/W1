import React, { useState } from "react";
import styles from "./CreateChannelModal.module.css"; 
import { FaTimes, FaHashtag, FaVolumeUp, FaExclamationCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import axios from "axios";

const CreateChannelModal = ({ onClose, serverId, type, onCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      // Backend portun 3001 ise burası doğru. Değilse düzelt.
      const res = await axios.post(
        `http://localhost:3001/api/servers/${serverId}/channels`,
        { name: name, type: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onCreated) onCreated(res.data.channel);
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Kanal oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const Icon = type === "text" ? FaHashtag : FaVolumeUp;
  const titleText = type === "text" ? "Metin Kanalı" : "Ses Kanalı";
  const subText = type === "text" 
    ? "# genel-sohbet gibi bir isim ver." 
    : "Sesli sohbet odana havalı bir isim ver.";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{titleText}</h3>
            <p className={styles.subTitle}>{subText}</p>
          </div>
          <FaTimes className={styles.closeBtn} onClick={onClose} />
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>KANAL ADI</label>
              
              <div className={styles.inputWrapper}>
                <Icon className={styles.icon} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    // Discord tarzı: boşluk yok, küçük harf
                    let val = e.target.value.toLowerCase();
                    if(type === "text") val = val.replace(/\s+/g, '-');
                    setName(val);
                  }} 
                  placeholder={type === "text" ? "yeni-kanal" : "Sohbet Odası"}
                  maxLength={25}
                  autoFocus
                  className={styles.input}
                />
              </div>

              {error && (
                <div className={styles.error}>
                  <FaExclamationCircle /> {error}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Vazgeç
          </button>
          <button 
            type="submit" 
            disabled={loading || !name} 
            className={styles.createBtn}
            onClick={handleSubmit}
          >
            {loading ? "Oluşturuluyor..." : "Oluştur"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateChannelModal;