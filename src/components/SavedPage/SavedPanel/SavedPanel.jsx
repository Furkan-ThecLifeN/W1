// SavedPanel.jsx
import React from 'react';
import styles from './SavedPanel.module.css';
import { FaVideo, FaFolder  } from 'react-icons/fa';
import { IoImageSharp } from "react-icons/io5";
import { BsFileImageFill } from "react-icons/bs";
import { PiChatCircleTextFill } from "react-icons/pi";



const savedItems = [
  { icon: <FaVideo />, label: 'Feeds' },
  { icon: <IoImageSharp  />, label: 'Post' },
  { icon: <BsFileImageFill />, label: 'Story' },
  { icon: <PiChatCircleTextFill />, label: 'Alıntılar' },
  { icon: <FaFolder />, label: 'Koleksiyonlar' },
];

const SavedPanel = ({ onItemClick }) => {
  return (
    <div className={styles.panelContainer}>
      <h2 className={styles.panelTitle}>QuantumTag</h2>
      <div className={styles.itemList}>
        {savedItems.map((item, index) => (
          <div
            key={index}
            className={styles.itemBox}
            onClick={() => onItemClick(item.label)}
          >
            <div className={styles.itemIcon}>{item.icon}</div>
            <span className={styles.itemLabel}>{item.label}</span>
             <div className={styles.itemGhost}><span>W</span></div>
          </div>
        ))}

      </div>
      <div className={styles.panelFooter}>Kaydedilenler</div>
    </div>
  );
};


export default SavedPanel;
