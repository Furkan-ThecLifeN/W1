// src/components/Chat/ChatComponents/FileUploadModal.jsx

import React, { useState, useRef, useEffect } from 'react';
import styles from "../Chat.module.css";
import { FaFileImage, FaFilePdf, FaFileWord, FaFileAlt, FaVideo, FaMusic } from 'react-icons/fa';
import { MdAddBox } from 'react-icons/md';

const FileUploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [expiration, setExpiration] = useState(24);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Modal açıldığında focusu dosya seçme alanına yönlendir
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file, file.name, expiration);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FaFileImage />;
    if (mimeType.startsWith('audio/')) return <FaMusic />;
    if (mimeType.startsWith('video/')) return <FaVideo />;
    if (mimeType === 'application/pdf') return <FaFilePdf />;
    if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return <FaFileWord />;
    return <FaFileAlt />;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Gönderim Paneli</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>

        <div className={styles.modalBody}>
          {!file ? (
            <label className={styles.fileInputLabel}>
              <input 
                type="file" 
                onChange={handleFileChange} 
                className={styles.hiddenFileInput} 
                ref={fileInputRef} 
              />
              <span className={styles.fileInputPlaceholder}>
                <MdAddBox size={48} />
                <p>Dosya veya Fotoğraf Seç</p>
              </span>
            </label>
          ) : (
            <div className={styles.filePreviewContainer}>
              {file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Seçilen dosya ön izleme" 
                  className={styles.imagePreview} 
                />
              ) : (
                <div className={styles.fileIconPreview}>
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className={styles.fileDetails}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.expirationOptions}>
          <p>Dosya Görüntüleme Süresi:</p>
          {[1, 3, 6, 24].map((hours) => (
            <label key={hours} className={styles.radioLabel}>
              <input 
                type="radio" 
                name="expiration" 
                value={hours} 
                checked={expiration === hours} 
                onChange={() => setExpiration(hours)} 
                className={styles.radioInput} 
              />
              <span className={styles.radioCustom}></span>
              {hours} Saat
            </label>
          ))}
        </div>

        <div className={styles.modalButtons}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>İptal</button>
          <button type="button" onClick={handleUpload} disabled={!file} className={styles.uploadButton}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;