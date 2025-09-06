import React, { useState } from 'react';
import styles from './FeedsAdd.module.css';
import { FiArrowLeft, FiSend, FiCheck, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider';
import { useUser } from '../../../context/UserContext';
import { motion } from 'framer-motion';
import { auth } from '../../../config/firebase-client'; // ✅ Firebase auth objesini import edin

const FeedsAdd = ({ onClose }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [description, setDescription] = useState('');
  const [ownershipAccepted, setOwnershipAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useAuth();

  const handleShare = async () => {
    // Önceki kontroller
    if (!mediaUrl.trim() || !description.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      showToast('Tüm alanlar zorunludur.', 'error');
      return;
    }

    if (!mediaUrl.includes('youtube.com/shorts/') && !mediaUrl.includes('youtu.be/')) {
      setError('Geçerli bir YouTube Shorts linki girin.');
      showToast('Geçersiz YouTube Shorts linki.', 'error');
      return;
    }

    if (!ownershipAccepted) {
      setError('Lütfen sahiplik beyanını onaylayın.');
      showToast('Paylaşım için sahiplik onayı zorunludur.', 'error');
      return;
    }
    
    // ✅ Token'ı yalnızca geçerli bir kullanıcı olduğunda almaya çalış
    if (!auth.currentUser) {
      setError('Lütfen önce giriş yapın.');
      showToast('İşlem için giriş yapmalısınız.', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Kullanıcının kimlik doğrulama token'ını (JWT) alın
      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/feeds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ Doğru token'ı Authorization başlığına ekleyin
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          content: description,
          mediaUrl: mediaUrl,
          ownershipAccepted: ownershipAccepted
        }),
      });

      if (!response.ok) {
        // Hata yanıtını doğru bir şekilde işleyin
        const errorText = await response.text();
        let errorMessage = 'Feeds paylaşılırken bir hata oluştu.';
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            // Eğer yanıt JSON değilse, doğrudan metin olarak hata mesajını kullan
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data.message);

      setSuccess(true);
      setMediaUrl('');
      setDescription('');
      setOwnershipAccepted(false);
      showToast('Feeds başarıyla paylaşıldı!', 'success');

      setTimeout(() => {
        if (typeof onClose === 'function') onClose();
        else navigate('/home');
      }, 1500);

    } catch (err) {
      console.error('Feeds paylaşım hatası:', err);
      setError(err.message || 'Feeds paylaşılırken bir hata oluştu.');
      showToast('Paylaşım başarısız!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') onClose();
    else navigate('/home');
  };

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modalContainer}
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '100vh' }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className={styles.modalHeader}>
          <button className={styles.backButton} onClick={handleClose}>
            <FiArrowLeft size={24} />
          </button>
          <h2 className={styles.modalTitle}>Yeni Feeds Paylaş</h2>
        </div>

        <div className={styles.formContent}>
          <div className={styles.inputGroup}>
            <label htmlFor="mediaUrl">YouTube Shorts Linki</label>
            <input
              type="text"
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video hakkında bir şeyler yazın..."
              rows="4"
              className={styles.textareaField}
            />
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="ownershipAccepted"
              checked={ownershipAccepted}
              onChange={(e) => setOwnershipAccepted(e.target.checked)}
              className={styles.checkboxField}
            />
            <label htmlFor="ownershipAccepted">Bu içeriğin sahibi olduğumu beyan ederim.</label>
          </div>
          {error && <p className={styles.errorMessage}><FiX /> {error}</p>}
          {success && <p className={styles.successMessage}><FiCheck /> Başarıyla paylaşıldı!</p>}
        </div>

        <div className={styles.modalFooter}>
          <motion.button
            className={styles.shareButton}
            onClick={handleShare}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Paylaşılıyor...' : <><FiSend size={18} /> Paylaş</>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedsAdd;