// components/StoryViewer/StoryViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Send, MoreVertical, Eye } from 'react-feather';
import styles from './StoryViewer.module.css';

const StoryViewer = ({ usersStories, currentUser, onClose, initialUserIndex = 0 }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const progressInterval = useRef(null);

  const currentUserStories = usersStories[currentUserIndex];
  const currentStory = currentUserStories.stories[currentStoryIndex];
  const isOwnStory = currentUserStories.user.id === currentUser.id;

  // Mock viewers data
  const storyViewers = [
    { id: 1, name: 'Ali', img: 'https://randomuser.me/api/portraits/men/1.jpg', timeAgo: '2m ago' },
    { id: 2, name: 'Ayşe', img: 'https://randomuser.me/api/portraits/women/2.jpg', timeAgo: '5m ago' },
    { id: 3, name: 'Mehmet', img: 'https://randomuser.me/api/portraits/men/3.jpg', timeAgo: '10m ago' },
  ];

  // Progress bar animation
  useEffect(() => {
    if (isPaused) {
      clearInterval(progressInterval.current);
      return;
    }

    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          handleNext();
          return 0;
        }
        return prev + (100 / (currentStory.duration * 50));
      });
    }, 20);

    return () => clearInterval(progressInterval.current);
  }, [currentUserIndex, currentStoryIndex, isPaused]);

  const handleNext = () => {
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } 
    else if (currentUserIndex < usersStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } 
    else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } 
    else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(usersStories[currentUserIndex - 1].stories.length - 1);
    }
    setProgress(0);
  };

  const handleScreenClick = (e) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    
    if (clickX > screenWidth * 0.66) {
      handleNext();
    } else if (clickX < screenWidth * 0.33) {
      handlePrev();
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      console.log(`Comment submitted: ${comment}`);
      setComment('');
    }
  };

  const deleteStory = () => {
    console.log(`Deleting story ${currentStory.id}`);
    setShowOptions(false);
    onClose();
  };

  const toggleViewers = () => {
    setShowViewers(!showViewers);
    setIsPaused(!showViewers);
  };

  return (
    <div className={styles.storyViewerContainer} onClick={handleScreenClick}>
      <div className={styles.storyContent}>
        {/* Progress bars */}
        <div className={styles.progressBars}>
          {currentUserStories.stories.map((_, index) => (
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

        {/* Story header */}
        <div className={styles.storyHeader}>
          <div className={styles.userInfo}>
            <img src={currentUserStories.user.img} alt={currentUserStories.user.name} className={styles.userAvatar} />
            <span>{currentUserStories.user.name}</span>
            <span className={styles.timeAgo}>{currentStory.timeAgo}</span>
          </div>
          <div className={styles.headerActions}>
            {isOwnStory && (
              <button className={styles.viewersButton} onClick={toggleViewers}>
                <Eye size={20} />
                <span>{storyViewers.length}</span>
              </button>
            )}
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Story media */}
        <div className={styles.mediaContainer}>
          <img src={currentStory.media} alt="Story" className={styles.storyMedia} />
        </div>

        {/* Viewers list modal */}
        {showViewers && (
          <div className={styles.viewersModal}>
            <div className={styles.viewersHeader}>
              <h3>Viewers</h3>
              <button onClick={toggleViewers} className={styles.closeModalButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.viewersList}>
              {storyViewers.map(viewer => (
                <div key={viewer.id} className={styles.viewerItem}>
                  <img src={viewer.img} alt={viewer.name} className={styles.viewerAvatar} />
                  <div className={styles.viewerInfo}>
                    <span>{viewer.name}</span>
                    <span className={styles.viewerTime}>{viewer.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Story footer */}
        <div className={styles.storyFooter}>
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <input
              type="text"
              placeholder="Send message"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.commentInput}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            />
            <button type="submit" className={styles.sendButton}>
              <Send size={20} />
            </button>
          </form>

          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <Heart size={24} />
            </button>
            <button className={styles.actionButton}>
              <MessageCircle size={24} />
            </button>
            {isOwnStory && (
              <div className={styles.optionsContainer}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <MoreVertical size={24} />
                </button>
                {showOptions && (
                  <div className={styles.optionsMenu}>
                    <button onClick={deleteStory}>Delete Story</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;