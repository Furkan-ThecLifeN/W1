import React, { useState, useEffect } from 'react';
import styles from './FeedsAdd.module.css';
import { FiYoutube, FiCheck, FiInfo, FiX, FiArrowLeft } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion, AnimatePresence } from 'framer-motion';

const FeedsAdd = ({ onClose }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // YouTube OAuth login
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      fetchChannelInfo(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError('Google hesabına bağlanılamadı. Lütfen tekrar deneyin.');
    },
  });

  // Fetch channel info after login
  const fetchChannelInfo = async (token) => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChannelId(response.data.items[0].id);
      fetchShortsVideos(token, response.data.items[0].id);
    } catch (err) {
      console.error('Channel info error:', err);
      setError('Kanal bilgileri alınamadı.');
    }
  };

  // Fetch shorts videos
  const fetchShortsVideos = async (token, channelId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&videoDuration=short&order=date&maxResults=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVideos(response.data.items);
    } catch (err) {
      console.error('Fetch videos error:', err);
      setError('Videolar alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Format duration (mock - YouTube API doesn't provide duration in search)
  const formatDuration = () => {
    return '0:15'; // Placeholder - in a real app you'd need to fetch video details
  };

  // Handle video select
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedVideo) return;
    
    setImporting(true);
    try {
      // Here you would send the video data to your backend
      // Example:
      // await axios.post('/api/import-video', {
      //   videoId: selectedVideo.id.videoId,
      //   title: selectedVideo.snippet.title,
      //   thumbnail: selectedVideo.snippet.thumbnails.medium.url,
      //   channelId: channelId,
      //   channelTitle: selectedVideo.snippet.channelTitle
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Import error:', err);
      setError('Video import edilemedi. Lütfen tekrar deneyin.');
    } finally {
      setImporting(false);
    }
  };

  // Modal variants for animation
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modalContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
          <h2 className={styles.modalTitle}>YouTube Shorts Import</h2>
          <button 
            className={styles.infoButton}
            onClick={() => setShowInfoModal(true)}
          >
            <FiInfo size={20} />
          </button>
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfoModal && (
            <motion.div 
              className={styles.infoModalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={styles.infoModal}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <div className={styles.infoModalHeader}>
                  <h3>YouTube Import Bilgileri</h3>
                  <button onClick={() => setShowInfoModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>
                <div className={styles.infoModalContent}>
                  <p>
                    <FaYoutube color="#FF0000" size={18} /> Videolar doğrudan YouTube'dan alınır ve herhangi bir değişiklik yapılmaz.
                  </p>
                  <p>
                    Sadece kendi kanalınızdaki Shorts videolarını import edebilirsiniz.
                  </p>
                  <p>
                    Videolar YouTube'un kullanım şartlarına tabidir.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className={styles.modalContent}>
          {!accessToken ? (
            <div className={styles.authContainer}>
              <div className={styles.youtubeLogo}>
                <FaYoutube size={48} color="#FF0000" />
              </div>
              <h3 className={styles.authTitle}>YouTube Hesabınıza Bağlanın</h3>
              <p className={styles.authDescription}>
                Sadece kendi kanalınızdaki Shorts videolarını import edebilirsiniz.
              </p>
              <button 
                className={styles.authButton}
                onClick={() => login()}
              >
                <FiYoutube size={20} /> YouTube ile Bağlan
              </button>
            </div>
          ) : loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.skeletonGrid}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height={300} borderRadius={12} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Tekrar Dene
              </button>
            </div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>Kanalınızda Shorts videosu bulunamadı.</p>
            </div>
          ) : (
            <>
              <div className={styles.videoGrid}>
                {videos.map((video) => (
                  <motion.div
                    key={video.id.videoId}
                    className={`${styles.videoCard} ${
                      selectedVideo?.id.videoId === video.id.videoId ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectVideo(video)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.videoThumbnail}>
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        loading="lazy"
                      />
                      <div className={styles.videoDuration}>{formatDuration()}</div>
                      <div className={styles.youtubeLogoBadge}>
                        <FaYoutube size={16} color="#FF0000" />
                      </div>
                    </div>
                    <div className={styles.videoInfo}>
                      <h4 className={styles.videoTitle}>{video.snippet.title}</h4>
                      <p className={styles.videoChannel}>{video.snippet.channelTitle}</p>
                    </div>
                    {selectedVideo?.id.videoId === video.id.videoId && (
                      <div className={styles.selectedBadge}>
                        <FiCheck size={20} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {accessToken && videos.length > 0 && (
          <div className={styles.modalFooter}>
            <motion.button
              className={styles.importButton}
              onClick={handleImport}
              disabled={!selectedVideo || importing}
              whileTap={{ scale: 0.95 }}
              animate={{
                opacity: selectedVideo ? 1 : 0.6,
                backgroundColor: selectedVideo ? '#FF0000' : '#888'
              }}
            >
              {importing ? (
                'Import Ediliyor...'
              ) : importSuccess ? (
                'Başarıyla Import Edildi!'
              ) : (
                <>
                  <FiYoutube size={18} /> Import Et
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FeedsAdd;