import React, { useState } from 'react';
import styles from './ContentSensitivityFilter.module.css';

const ContentSensitivityFilter = () => {
  const [limitComments, setLimitComments] = useState(false);
  const [blurSensitive, setBlurSensitive] = useState(true);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Content Sensitivity Filter</h2>

      <div className={styles.settingBox}>
        <div className={styles.settingText}>
          <h4>Limit Harmful Comments</h4>
          <p>Hide or limit comments that may be offensive or inappropriate.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={limitComments}
            onChange={() => setLimitComments(!limitComments)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingBox}>
        <div className={styles.settingText}>
          <h4>Blur Sensitive Media</h4>
          <p>Automatically blur content detected as sensitive.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={blurSensitive}
            onChange={() => setBlurSensitive(!blurSensitive)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default ContentSensitivityFilter;
