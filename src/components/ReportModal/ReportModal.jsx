// components/ReportModal/ReportModal.jsx
import React, { useState } from "react";
import styles from "./ReportModal.module.css";
import { createReportRemote, defaultGetAuthToken } from "../actions/api";

// Simgeler için react-icons'u kullanıyoruz
import { FiX, FiSend } from "react-icons/fi";

const ReportModal = ({ postId, reportedUserId, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Lütfen şikayet metnini boş bırakmayın.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await defaultGetAuthToken();
      await createReportRemote({ postId, reportedUserId, reason, token });
      setSuccess(true);
    } catch (e) {
      console.error("Rapor gönderme hatası:", e);
      setError("Şikayet gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={`${styles.modalContent} ${styles.successContent}`}>
          <h3>✅ Şikayet Gönderildi</h3>
          <p>Şikayetiniz başarıyla iletildi. İlginiz için teşekkür ederiz.</p>
          <button onClick={onClose} className={styles.closeButton}>
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h3>Şikayet Et</h3>
          <button onClick={onClose} className={styles.closeIcon}>
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
            placeholder="Lütfen şikayetinizin sebebini açıklayın (maks. 500 karakter)."
            className={styles.textarea}
          />
          {error && <p className={styles.errorText}>{error}</p>}
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
};

export default ReportModal;