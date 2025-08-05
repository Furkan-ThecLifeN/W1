import React, { useState } from 'react';
import { Plus } from 'react-feather';
import StoryViewer from '../StoryViewer/StoryViewer';
import styles from './StoryBar.module.css';

const StoryBar = ({ currentUser }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialUserIndex, setInitialUserIndex] = useState(0);

  // Mock data with multiple stories per user
  const usersStories = [
    {
      user: { id: currentUser.id, name: 'You', img: currentUser.img },
      stories: [
        { id: 1, media: 'https://picsum.photos/500/900?random=1', timeAgo: 'Just now', duration: 5 },
        { id: 2, media: 'https://picsum.photos/500/900?random=2', timeAgo: '10m ago', duration: 7 },
      ]
    },
    {
      user: { id: 2, name: 'Ali', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
      stories: [
        { id: 3, media: 'https://picsum.photos/500/900?random=3', timeAgo: '1h ago', duration: 5 },
      ]
    },
    // ... other users
  ];

  const handleStoryClick = (userIndex) => {
    setInitialUserIndex(userIndex);
    setIsViewerOpen(true);
  };

  const handleAddStory = () => {
    console.log('Add story clicked');
    // In a real app, this would open camera or file picker
    // But also allow viewing existing stories
    handleStoryClick(0); // Open your own stories at index 0
  };

  return (
    <>
      <div className={styles.storyBarContainer}>
        <div className={styles.storyBar}>
          {/* Your Story item - now clickable to view */}
          <div 
            className={styles.storyItem} 
            onClick={() => handleStoryClick(0)} // Index 0 is your own stories
          >
            <div className={styles.addStoryCircle}>
              <img src={currentUser.img} alt="Your story" />
              <div 
                className={styles.addStoryButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddStory();
                }}
              >
                <Plus size={16} />
              </div>
            </div>
            <span>Your Story</span>
          </div>

          {/* Other stories */}
          {usersStories.slice(1).map((userStories, index) => (
            <div 
              key={userStories.user.id} 
              className={styles.storyItem} 
              onClick={() => handleStoryClick(index + 1)}
            >
              <div className={styles.storyCircle}>
                <img src={userStories.user.img} alt={userStories.user.name} />
              </div>
              <span>{userStories.user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {isViewerOpen && (
        <StoryViewer
          usersStories={usersStories}
          currentUser={currentUser}
          initialUserIndex={initialUserIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoryBar;