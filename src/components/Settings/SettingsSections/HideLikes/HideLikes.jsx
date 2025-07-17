import React, { useState } from 'react';
import styles from './HideLikes.module.css';
import { FiEyeOff, FiEye } from 'react-icons/fi';

const HideLikes = () => {
  const [hideLikes, setHideLikes] = useState(false);

  const handleToggle = () => {
    setHideLikes(!hideLikes);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hide Likes</h2>
      <p className={styles.description}>
        Control whether people can see the number of likes on your posts. You can change this setting anytime.
      </p>

      <div className={styles.toggleCard}>
        <div className={styles.toggleContent}>
          <div className={styles.icon}>
            {hideLikes ? <FiEyeOff /> : <FiEye />}
          </div>
          <div>
            <h4 className={styles.toggleTitle}>
              {hideLikes ? 'Likes are Hidden' : 'Likes are Visible'}
            </h4>
            <p className={styles.toggleSubtitle}>
              {hideLikes
                ? 'People will not see like counts on your posts.'
                : 'People can see the number of likes your posts receive.'}
            </p>
          </div>
        </div>
        <label className={styles.switch}>
          <input type="checkbox" checked={hideLikes} onChange={handleToggle} />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default HideLikes;
