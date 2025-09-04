import React, { useState } from 'react';
import styles from './FeedsAdd.module.css';
import { FiArrowLeft, FiSend, FiCheck, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../config/firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthProvider';
import { useUser } from '../../../context/UserContext';
import { motion } from 'framer-motion';

const FeedsAdd = ({ onClose }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useAuth();

  const handleShare = async () => {
    // Giriş alanları boş mu kontrol et
    if (!mediaUrl.trim() || !description.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      showToast('Tüm alanlar zorunludur.', 'error');
      return;
    }

    // Basit YouTube Shorts URL doğrulaması
    if (!mediaUrl.includes('youtube.com/shorts/') && !mediaUrl.includes('youtu.be/')) {
        setError('Lütfen geçerli bir YouTube Shorts linki girin.');
        showToast('Geçersiz YouTube Shorts linki.', 'error');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const ownerId = currentUser.uid;

      await addDoc(collection(db, 'globalFeeds'), {
        ownerId: ownerId,
        mediaUrl: mediaUrl,
        description: description,
        createdAt: serverTimestamp(),
        likes: 0,
      });

      setSuccess(true);
      setMediaUrl('');
      setDescription('');
      showToast('Feeds başarıyla paylaşıldı!', 'success');

      setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        } else {
          navigate('/home');
        }
      }, 1500);

    } catch (err) {
      console.error('Feeds paylaşım hatası:', err);
      setError('Feeds paylaşılırken bir hata oluştu.');
      showToast('Paylaşım başarısız!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate('/home');
    }
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
            {loading ? 'Paylaşılıyor...' : (
              <>
                <FiSend size={18} /> Paylaş
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedsAdd;