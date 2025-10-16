import React, { useState, useRef } from 'react';
import styles from './StoryBar.module.css';

// --- ICONS (SVG olarak içeri gömüldü, harici kütüphane gerekmez) ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


// --- MOCK DATA (Örnek Veri) ---
const currentUser = {
  id: 1,
  name: 'You',
  img: `https://i.pravatar.cc/150?u=currentuser`,
};

const usersStories = [
  {
    user: currentUser,
    stories: [
      { id: 1, media: 'https://picsum.photos/500/900?random=1', duration: 5 },
      { id: 2, media: 'https://picsum.photos/500/900?random=2', duration: 7 },
    ]
  },
  {
    user: { id: 2, name: 'Ali', img: 'https://i.pravatar.cc/150?u=ali' },
    stories: [ { id: 3, media: 'https://picsum.photos/500/900?random=3', duration: 5 } ]
  },
  {
    user: { id: 3, name: 'Zeynep', img: 'https://i.pravatar.cc/150?u=zeynep' },
    stories: [ { id: 4, media: 'https://picsum.photos/500/900?random=4', duration: 8 } ]
  },
  {
    user: { id: 4, name: 'Murat', img: 'https://i.pravatar.cc/150?u=murat' },
    stories: [ { id: 5, media: 'https://picsum.photos/500/900?random=5', duration: 6 } ]
  },
    {
    user: { id: 5, name: 'Elif', img: 'https://i.pravatar.cc/150?u=elif' },
    stories: [ { id: 6, media: 'https://picsum.photos/500/900?random=6', duration: 5 } ]
  },
  {
    user: { id: 6, name: 'Can', img: 'https://i.pravatar.cc/150?u=can' },
    stories: [ { id: 7, media: 'https://picsum.photos/500/900?random=7', duration: 7 } ]
  },
  {
    user: { id: 7, name: 'Selin', img: 'https://i.pravatar.cc/150?u=selin' },
    stories: [ { id: 8, media: 'https://picsum.photos/500/900?random=8', duration: 5 } ]
  },
    {
    user: { id: 8, name: 'Barış', img: 'https://i.pravatar.cc/150?u=baris' },
    stories: [ { id: 9, media: 'https://picsum.photos/500/900?random=9', duration: 9 } ]
  },
  {
    user: currentUser,
    stories: [
      { id: 1, media: 'https://picsum.photos/500/900?random=1', duration: 5 },
      { id: 2, media: 'https://picsum.photos/500/900?random=2', duration: 7 },
    ]
  },
  {
    user: { id: 2, name: 'Ali', img: 'https://i.pravatar.cc/150?u=ali' },
    stories: [ { id: 3, media: 'https://picsum.photos/500/900?random=3', duration: 5 } ]
  },
  {
    user: { id: 3, name: 'Zeynep', img: 'https://i.pravatar.cc/150?u=zeynep' },
    stories: [ { id: 4, media: 'https://picsum.photos/500/900?random=4', duration: 8 } ]
  },
  {
    user: { id: 4, name: 'Murat', img: 'https://i.pravatar.cc/150?u=murat' },
    stories: [ { id: 5, media: 'https://picsum.photos/500/900?random=5', duration: 6 } ]
  },
    {
    user: { id: 5, name: 'Elif', img: 'https://i.pravatar.cc/150?u=elif' },
    stories: [ { id: 6, media: 'https://picsum.photos/500/900?random=6', duration: 5 } ]
  },
  {
    user: { id: 6, name: 'Can', img: 'https://i.pravatar.cc/150?u=can' },
    stories: [ { id: 7, media: 'https://picsum.photos/500/900?random=7', duration: 7 } ]
  },
  {
    user: { id: 7, name: 'Selin', img: 'https://i.pravatar.cc/150?u=selin' },
    stories: [ { id: 8, media: 'https://picsum.photos/500/900?random=8', duration: 5 } ]
  },
    {
    user: { id: 8, name: 'Barış', img: 'https://i.pravatar.cc/150?u=baris' },
    stories: [ { id: 9, media: 'https://picsum.photos/500/900?random=9', duration: 9 } ]
  },
];


// --- STORY VIEWER (Geçici Görüntüleyici Bileşeni) ---
const StoryViewer = ({ usersStories, initialUserIndex, onClose }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const activeUser = usersStories[currentUserIndex];
  const activeStory = activeUser.stories[currentStoryIndex];

  return (
    <div className={styles.viewerOverlay}>
      <div className={styles.viewerContent}>
        <img src={activeStory.media} alt={`${activeUser.user.name}'s story`} className={styles.viewerImage} />
        <div className={styles.viewerHeader}>
            <div className={styles.viewerUserInfo}>
                <img src={activeUser.user.img} className={styles.viewerUserImg} alt={activeUser.user.name} />
                <span className={styles.viewerUserName}>{activeUser.user.name}</span>
            </div>
        </div>
        <button onClick={onClose} className={styles.viewerCloseButton}>
          <XIcon />
        </button>
      </div>
    </div>
  );
};


// --- STORY BAR (Ana Bileşen) ---
const StoryBar = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialUserIndex, setInitialUserIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleStoryClick = (userIndex) => {
    setInitialUserIndex(userIndex);
    setIsViewerOpen(true);
  };
  
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -300 : 300;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className={styles.storyBarContainer}>
        {/* Header */}
        <header className={styles.header}>
          <h2 className={styles.title}>Stories</h2>
          <div className={styles.navigation}>
            <button 
                onClick={() => handleScroll('left')}
                className={styles.navButton}
                aria-label="Scroll left"
            >
              <ChevronLeftIcon />
            </button>
            <button 
                onClick={() => handleScroll('right')}
                className={styles.navButton}
                aria-label="Scroll right"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </header>

        {/* Stories */}
        <div 
          ref={scrollContainerRef}
          className={styles.storiesScroller}
        >
          {/* Your Story Item */}
          <div 
            className={styles.storyItem}
            onClick={() => handleStoryClick(0)}
          >
            <div className={styles.yourStoryAvatarContainer}>
              <img 
                src={currentUser.img} 
                alt="Your story" 
                className={styles.yourStoryAvatar}
              />
              <div className={styles.addStoryButton}>
                <PlusIcon />
              </div>
            </div>
            <span className={styles.storyName}>Your Story</span>
          </div>

          {/* Other Stories */}
          {usersStories.slice(1).map((userStory, index) => (
            <div 
              key={userStory.user.id} 
              className={styles.storyItem}
              onClick={() => handleStoryClick(index + 1)}
            >
              <div className={styles.gradientBorder}>
                <img 
                  src={userStory.user.img} 
                  alt={userStory.user.name} 
                  className={styles.storyAvatar}
                />
              </div>
              <span className={styles.storyName}>{userStory.user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {isViewerOpen && (
        <StoryViewer
          usersStories={usersStories}
          initialUserIndex={initialUserIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoryBar;

