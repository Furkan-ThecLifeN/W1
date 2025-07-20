import React from "react";
import { FiSmile, FiMapPin } from "react-icons/fi";
import styles from "../PostAdd.module.css";

const PostSettings = ({ privacy, setPrivacy, postText, setPostText }) => {
  return (
    <div className={styles.settingsArea}>
      <div className={styles.privacySettings}>
        <label>Gizlilik:</label>
        <select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
          className={styles.privacySelect}
        >
          <option value="public">Herkese Açık</option>
          <option value="friends">Sadece Arkadaşlar</option>
          <option value="close_friends">Sadece Yakın Arkadaşlar</option>
          <option value="private">Sadece Ben</option>
        </select>
      </div>

      <div className={styles.captionArea}>
        <textarea
          className={styles.postTextarea}
          placeholder="Gönderi açıklaması ekle..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          rows="4"
        />
        <div className={styles.captionTools}>
          <button className={styles.captionToolButton}>
            <FiSmile size={20} />
          </button>
          <button className={styles.captionToolButton}>
            <FiMapPin size={20} />
          </button>
          <span className={styles.charCounter}>
            {postText.length}/2,200
          </span>
        </div>
      </div>

      <div className={styles.advancedSettings}>
        <div className={styles.settingOption}>
          <input type="checkbox" id="allowComments" defaultChecked />
          <label htmlFor="allowComments">Yorumlara izin ver</label>
        </div>
        <div className={styles.settingOption}>
          <input type="checkbox" id="hideLikes" />
          <label htmlFor="hideLikes">Beğenileri gizle</label>
        </div>
        <div className={styles.settingOption}>
          <input type="checkbox" id="highQuality" defaultChecked />
          <label htmlFor="highQuality">Yüksek kalitede yükle</label>
        </div>
      </div>
    </div>
  );
};

export default PostSettings;