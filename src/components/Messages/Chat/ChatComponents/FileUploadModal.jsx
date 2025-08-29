// src/components/Chat/ChatComponents/FileUploadModal.jsx

import React, { useState, useRef, useEffect } from "react";
import styles from "../Chat.module.css";
import {
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaVideo,
  FaMusic,
} from "react-icons/fa";
import { MdAddBox } from "react-icons/md";

const FileUploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file, file.name);
        onClose();
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return <FaFileImage />;
    if (mimeType.startsWith("audio/")) return <FaMusic />;
    if (mimeType.startsWith("video/")) return <FaVideo />;
    if (mimeType === "application/pdf") return <FaFilePdf />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FaFileWord />;
    return <FaFileAlt />;
  };

  const getFilePreview = () => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Dosya Gönder</h2>
        <div className={styles.dropzone}>
          {!file ? (
            <div
              className={styles.fileInputContainer}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={styles.fileInputHidden}
              />
              <MdAddBox size={40} color="#666" />
              <p>Dosya Seç</p>
            </div>
          ) : (
            <div className={styles.filePreviewContainer}>
              {file.type.startsWith("image/") ? (
                <img
                  src={getFilePreview()}
                  alt="Dosya önizlemesi"
                  className={styles.imagePreview}
                />
              ) : (
                <div className={styles.fileIconPreview}>
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className={styles.fileDetails}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalButtons}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file}
            className={styles.uploadButton}
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
