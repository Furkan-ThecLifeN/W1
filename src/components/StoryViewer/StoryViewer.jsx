import React, { useState, useEffect, useRef } from 'react';
import { X, MoreVertical, Trash2 } from 'lucide-react'; 
import styles from './StoryViewer.module.css';
import { useAuth } from '../../context/AuthProvider';
import { useStoryStore } from '../../Store/useStoryStore'; // ✅ Store Import

const StoryViewer = ({ 
  usersStories, 
  currentUser, 
  onClose, 
  initialUserIndex = 0,
  // ✅ YENİ: Custom görüldü fonksiyonu (Public Feed için)
  customMarkAsSeen = null 
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const { currentUser: authUser } = useAuth();
  
  // Store'dan varsayılan 'markAsSeen' fonksiyonunu al
  const storeMarkAsSeen = useStoryStore(state => state.markAsSeen); 
  
  // ✅ Hangi fonksiyonu kullanacağına karar ver (Prop gelirse onu, yoksa store'dakini)
  const markAsSeenAction = customMarkAsSeen || storeMarkAsSeen;

  const progressInterval = useRef(null);

  const currentUserGroup = usersStories[currentUserIndex];
  const currentStory = currentUserGroup?.stories[currentStoryIndex];
  
  // Kendi hikayem mi? (Güvenli kontrol)
  const isOwnStory = currentUserGroup?.user?.uid === currentUser?.uid;

  // --- ZAMAN HESAPLAMA ---
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  // --- GÖRÜLDÜ TETİKLEME (GÜNCELLENDİ) ---
  useEffect(() => {
    // Hikaye var ve henüz görülmemişse
    if (currentStory && !currentStory.seen) {
        // Dinamik olarak seçilen aksiyonu çağır
        markAsSeenAction(currentStory.id, currentUserGroup.user.uid, currentUser);
    }
  }, [currentStory, currentUserGroup, currentUser, markAsSeenAction]); 

  // --- PROGRESS ANIMATION ---
  useEffect(() => {
    if (!currentStory || isPaused) {
      clearInterval(progressInterval.current);
      return;
    }

    const duration = currentStory.type === 'video' ? 15 : 5; 
    const step = 100 / (duration * 50); 

    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, 20);

    return () => clearInterval(progressInterval.current);
  }, [currentUserIndex, currentStoryIndex, isPaused, currentStory]);

  // --- NAVİGASYON ---
  const handleNext = () => {
    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentUserIndex < usersStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(usersStories[prevUserIndex].stories.length - 1);
      setProgress(0);
    }
  };

  // --- EKRAN TIKLAMA ---
  const handleScreenClick = (e) => {
    if (e.target.closest('button') || e.target.closest(`.${styles.optionsMenu}`)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width * 0.66) {
      handleNext();
    } else if (x < width * 0.33) {
      handlePrev();
    }
  };

  const handleDeleteStory = async () => {
    if (!window.confirm("Delete this story?")) return;
    try {
        const token = await authUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/${currentStory.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            onClose();
            window.location.reload();
        } else {
            alert("Could not delete story.");
        }
    } catch (e) {
        console.error(e);
    }
  };

  if (!currentStory) return null;

  return (
    <div className={styles.storyOverlay}>
      <button className={styles.desktopCloseButton} onClick={onClose}>
         <X size={32} color="#fff" />
      </button>

      <div className={styles.storyFrame} onClick={handleScreenClick}>
        
        {/* Progress Bars */}
        <div className={styles.progressBars}>
          {currentUserGroup.stories.map((_, index) => (
            <div key={index} className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar} 
                style={{
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={styles.storyHeader}>
          <div className={styles.userInfo}>
            <img 
              src={currentUserGroup.user.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} 
              alt="User" 
              className={styles.userAvatar} 
            />
            <div className={styles.userMeta}>
               <span className={styles.userName}>{currentUserGroup.user.displayName || "Unknown"}</span>
               <span className={styles.timeAgo}>{getTimeAgo(currentStory.createdAt)}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            {isOwnStory && (
              <div className={styles.optionsContainer}>
                  <button 
                      className={styles.iconButton} 
                      onClick={() => {
                          setShowOptions(!showOptions);
                          setIsPaused(!showOptions);
                      }}
                  >
                      <MoreVertical size={24} color="#fff" />
                  </button>
                  {showOptions && (
                      <div className={styles.optionsMenu}>
                          <button onClick={handleDeleteStory} className={styles.deleteBtn}>
                              <Trash2 size={16} /> Delete
                          </button>
                      </div>
                  )}
              </div>
            )}
            <button className={`${styles.iconButton} ${styles.mobileCloseBtn}`} onClick={onClose}>
              <X size={28} color="#fff" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className={styles.mediaContainer}>
          {currentStory.type === 'video' ? (
              <video 
                  src={currentStory.mediaUrl} 
                  className={styles.storyMedia} 
                  autoPlay 
                  playsInline
                  onEnded={handleNext}
              />
          ) : (
              <img 
                  src={currentStory.mediaUrl} 
                  alt="Story" 
                  className={styles.storyMedia} 
              />
          )}
          
          {currentStory.caption && (
              <div className={styles.captionOverlay}>
                  <p>{currentStory.caption}</p>
              </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;