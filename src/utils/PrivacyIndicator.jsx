// src/components/utils/PrivacyIndicator/PrivacyIndicator.jsx

import React from 'react';
// Kullandığınız ikon kütüphanesini import edin (FeedsAdd'den Fi... aldım)
import { FiGlobe, FiUsers, FiEye, FiLock } from "react-icons/fi";
import styles from './PrivacyIndicator.module.css';

/**
 * Verilen gizlilik türüne göre bir ikon ve metin döndürür.
 * @param {string} privacy - 'public', 'friends', 'close_friendships', 'private'
 * @returns {object} { icon: JSX.Element, text: string }
 */
const getPrivacyInfo = (privacy) => {
  switch (privacy) {
    case 'friends':
      return {
        icon: <FiUsers size={14} />,
        text: 'Arkadaşlar',
      };
    case 'close_friendships':
      return {
        icon: <FiEye size={14} />,
        text: 'Yakın Arkadaşlar',
      };
    case 'private':
      return {
        icon: <FiLock size={14} />,
        text: 'Sadece Ben',
      };
    case 'public':
    default:
      return {
        icon: <FiGlobe size={14} />,
        text: 'Herkese Açık',
      };
  }
};

/**
 * Gizlilik durumunu (ikon + metin) gösteren bir belirteç bileşeni.
 * @param {object} props - { privacy: string }
 */
const PrivacyIndicator = ({ privacy }) => {
  const { icon, text } = getPrivacyInfo(privacy);

  // Eğer gizlilik "public" ise hiçbir şey gösterme (isteğe bağlı)
  // Eğer "Herkese Açık" yazısının da görünmesini istiyorsanız bu "if" satırını silin.
  if (privacy === 'public') {
    return null; 
  }

  return (
    <div className={styles.privacyIndicator}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

export default PrivacyIndicator;