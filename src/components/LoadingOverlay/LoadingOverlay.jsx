// src/components/LoadingOverlay/LoadingOverlay.js
import React from 'react';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingOverlay;