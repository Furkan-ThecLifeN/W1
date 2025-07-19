import React from 'react';
import styles from './StoryBar.module.css';

const dummyUsers = [
  { id: 1, name: 'Ali', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Ayşe', img: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'Mehmet', img: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Zeynep', img: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'Can', img: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: 1, name: 'Ali', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Ayşe', img: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'Mehmet', img: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Zeynep', img: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'Can', img: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const StoryBar = () => {
  return (
    <div className={styles.storyBar}>
      {dummyUsers.map(user => (
        <div key={user.id} className={styles.storyItem}>
          <img src={user.img} alt={user.name} />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default StoryBar;
