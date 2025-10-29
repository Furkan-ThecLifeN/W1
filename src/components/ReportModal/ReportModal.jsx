import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./ReportModal.module.css";
import { createReportRemote, defaultGetAuthToken } from "../actions/api";
import { FiX, FiSend } from "react-icons/fi";
import { FaThumbsUp } from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider"; // 1. ADIM: useAuth'u import et

const ReportModal = ({ postId, reportedUserId, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  
  const { currentUser } = useAuth(); // 2. ADIM: currentUser'ı al

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- 3. ADIM: GİRİŞ KONTROLÜ EKLENDİ ---
    if (!currentUser) {
      setError("Rapor göndermek için giriş yapmalısınız.");
      return;
    }
    // --- DEĞİŞİKLİK SONU ---

    if (!reason.trim()) {
      setError("Lütfen rapor metnini boş bırakmayın."); // Hata mesajını Türkçeleştirdim
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await defaultGetAuthToken();
      await createReportRemote({ postId, reportedUserId, reason, token });
      setSuccess(true);
    } catch (e) {
      console.error("Report sending error:", e);
      setError("Raporunuz gönderilirken bir hata oluştu. Lütfen tekrar deneyin."); // Hata mesajını Türkçeleştirdim
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    const handleAnimationEnd = () => {
      if (isClosing) {
        onClose();
      }
    };

    if (modalElement) {
      modalElement.addEventListener("animationend", handleAnimationEnd);
    }
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("animationend", handleAnimationEnd);
      }
    };
  }, [isClosing, onClose]);

  return ReactDOM.createPortal(
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div
        ref={modalRef}
        className={`${styles.modalContent} ${isClosing ? styles.closing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className={styles.successContent}>
            <h3>
              <FaThumbsUp />
              Rapor Gönderildi
            </h3>
            <p>Raporunuz başarıyla gönderildi. Geri bildiriminiz için teşekkür ederiz.</p>
            <button onClick={onClose} className={styles.closeButton}>
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3>Rapor Et</h3>
              <button onClick={handleClose} className={styles.closeIcon}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <textarea
                maxLength={500}
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setError(null);
                }}
                placeholder="Lütfen rapor etme nedeninizi açıklayın (maks. 500 karakter)."
                className={styles.textarea}
              />
              {error && <p className={styles.errorText}>{error}</p>}
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`${styles.button} ${styles.cancelButton}`}
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.submitButton}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Gönderiliyor...</span>
                  ) : (
                    <>
                      <FiSend />
                      <span>Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;