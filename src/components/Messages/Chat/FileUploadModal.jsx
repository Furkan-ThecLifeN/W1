// src/components/Chat/FileUploadModal.jsx
import React, { useState } from 'react';
import styles from "./Chat.module.css";

const FileUploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [expiration, setExpiration] = useState(24); // Varsayılan 24 saat

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file, file.name, expiration); // fileName'i de gönderiyoruz
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Dosya/Fotoğraf Gönder</h3>
        <input type="file" onChange={handleFileChange} className={styles.fileInput} />
        
        <div className={styles.expirationOptions}>
          <p>Süre:</p>
          <label><input type="radio" name="expiration" value="1" checked={expiration === 1} onChange={() => setExpiration(1)} /> 1 Saat</label>
          <label><input type="radio" name="expiration" value="3" checked={expiration === 3} onChange={() => setExpiration(3)} /> 3 Saat</label>
          <label><input type="radio" name="expiration" value="6" checked={expiration === 6} onChange={() => setExpiration(6)} /> 6 Saat</label>
          <label><input type="radio" name="expiration" value="24" checked={expiration === 24} onChange={() => setExpiration(24)} /> 1 Gün</label>
        </div>

        <div className={styles.modalButtons}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>İptal</button>
          <button type="button" onClick={handleUpload} disabled={!file} className={styles.uploadButton}>Gönder</button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;