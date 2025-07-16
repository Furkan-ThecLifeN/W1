import React, { useState } from 'react';
import { FiMessageSquare, FiCamera, FiUser, FiUserPlus, FiUserX, FiChevronDown, FiCheck, FiX } from 'react-icons/fi';
import styles from './MessagesStoryReplies.module.css';

const MessagesStoryReplies = () => {
  // Settings state
  const [messageSettings, setMessageSettings] = useState({
    whoCanMessage: 'following', // 'everyone', 'following', 'none'
    allowStoryReplies: true,
    storyReplyAudience: 'following' // 'everyone', 'following', 'none'
  });

  // Custom list management
  const [showCustomList, setShowCustomList] = useState(false);
  const [customListType, setCustomListType] = useState(null); // 'allow' or 'deny'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample followers data
  const [followers, setFollowers] = useState([
    { id: 1, name: 'Alex Johnson', username: 'alexj', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', allowed: true, denied: false },
    { id: 2, name: 'Sarah Miller', username: 'sarahm', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', allowed: false, denied: false },
    { id: 3, name: 'David Kim', username: 'davidk', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', allowed: false, denied: true },
    { id: 4, name: 'Emma Wilson', username: 'emmaw', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', allowed: true, denied: false },
    { id: 5, name: 'Michael Chen', username: 'michaelc', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', allowed: false, denied: false },
  ]);

  const toggleMessageSetting = (value) => {
    setMessageSettings(prev => ({
      ...prev,
      whoCanMessage: value
    }));
  };

  const toggleStoryReplies = () => {
    setMessageSettings(prev => ({
      ...prev,
      allowStoryReplies: !prev.allowStoryReplies
    }));
  };

  const toggleStoryReplyAudience = (value) => {
    setMessageSettings(prev => ({
      ...prev,
      storyReplyAudience: value
    }));
  };

  const toggleUserPermission = (userId, type) => {
    setFollowers(prev => prev.map(user => {
      if (user.id === userId) {
        if (type === 'allow') {
          return { ...user, allowed: !user.allowed, denied: false };
        } else {
          return { ...user, denied: !user.denied, allowed: false };
        }
      }
      return user;
    }));
  };

  const openCustomList = (type) => {
    setCustomListType(type);
    setShowCustomList(true);
  };

  const filteredFollowers = followers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages & Story Replies</h1>
        <p className={styles.subtitle}>Control who can contact you and reply to your stories</p>
      </div>

      <div className={styles.settingsContainer}>
        {/* Messages Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <FiMessageSquare className={styles.settingIcon} />
            <h2 className={styles.settingTitle}>Direct Messages</h2>
          </div>
          
          <div className={styles.optionGroup}>
            <div 
              className={`${styles.option} ${messageSettings.whoCanMessage === 'everyone' ? styles.active : ''}`}
              onClick={() => toggleMessageSetting('everyone')}
            >
              <div className={styles.optionContent}>
                <FiUser className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>Everyone</h3>
                  <p className={styles.optionDescription}>Anyone on the platform can message you</p>
                </div>
              </div>
              {messageSettings.whoCanMessage === 'everyone' && <FiCheck className={styles.checkIcon} />}
            </div>

            <div 
              className={`${styles.option} ${messageSettings.whoCanMessage === 'following' ? styles.active : ''}`}
              onClick={() => toggleMessageSetting('following')}
            >
              <div className={styles.optionContent}>
                <FiUserPlus className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>People You Follow</h3>
                  <p className={styles.optionDescription}>Only people you follow can message you</p>
                </div>
              </div>
              {messageSettings.whoCanMessage === 'following' && <FiCheck className={styles.checkIcon} />}
            </div>

            <div 
              className={`${styles.option} ${messageSettings.whoCanMessage === 'none' ? styles.active : ''}`}
              onClick={() => toggleMessageSetting('none')}
            >
              <div className={styles.optionContent}>
                <FiUserX className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>No One</h3>
                  <p className={styles.optionDescription}>Turn off direct messages</p>
                </div>
              </div>
              {messageSettings.whoCanMessage === 'none' && <FiCheck className={styles.checkIcon} />}
            </div>
          </div>

          <div className={styles.customControls}>
            <button 
              className={styles.customButton}
              onClick={() => openCustomList('allow')}
            >
              Allow specific users
            </button>
            <button 
              className={styles.customButton}
              onClick={() => openCustomList('deny')}
            >
              Block specific users
            </button>
          </div>
        </div>

        {/* Story Replies Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <FiCamera className={styles.settingIcon} />
            <h2 className={styles.settingTitle}>Story Replies</h2>
          </div>
          
          <div className={styles.toggleOption}>
            <div className={styles.toggleContent}>
              <h3 className={styles.toggleTitle}>Allow Story Replies</h3>
              <p className={styles.toggleDescription}>Let people reply to your stories</p>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={messageSettings.allowStoryReplies}
                onChange={toggleStoryReplies}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          {messageSettings.allowStoryReplies && (
            <>
              <div className={styles.optionGroup}>
                <div 
                  className={`${styles.option} ${messageSettings.storyReplyAudience === 'everyone' ? styles.active : ''}`}
                  onClick={() => toggleStoryReplyAudience('everyone')}
                >
                  <div className={styles.optionContent}>
                    <FiUser className={styles.optionIcon} />
                    <div>
                      <h3 className={styles.optionTitle}>Everyone</h3>
                      <p className={styles.optionDescription}>Anyone can reply to your stories</p>
                    </div>
                  </div>
                  {messageSettings.storyReplyAudience === 'everyone' && <FiCheck className={styles.checkIcon} />}
                </div>

                <div 
                  className={`${styles.option} ${messageSettings.storyReplyAudience === 'following' ? styles.active : ''}`}
                  onClick={() => toggleStoryReplyAudience('following')}
                >
                  <div className={styles.optionContent}>
                    <FiUserPlus className={styles.optionIcon} />
                    <div>
                      <h3 className={styles.optionTitle}>People You Follow</h3>
                      <p className={styles.optionDescription}>Only people you follow can reply</p>
                    </div>
                  </div>
                  {messageSettings.storyReplyAudience === 'following' && <FiCheck className={styles.checkIcon} />}
                </div>
              </div>

              <div className={styles.customControls}>
                <button 
                  className={styles.customButton}
                  onClick={() => openCustomList('allow')}
                >
                  Allow specific users
                </button>
                <button 
                  className={styles.customButton}
                  onClick={() => openCustomList('deny')}
                >
                  Block specific users
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom List Modal */}
      {showCustomList && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {customListType === 'allow' ? 'Allow List' : 'Block List'}
              </h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCustomList(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search followers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.userList}>
              {filteredFollowers.length > 0 ? (
                filteredFollowers.map(user => (
                  <div key={user.id} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                      <div>
                        <h3 className={styles.userName}>{user.name}</h3>
                        <p className={styles.userUsername}>@{user.username}</p>
                      </div>
                    </div>
                    <button
                      className={`${styles.permissionButton} ${
                        customListType === 'allow' && user.allowed ? styles.allowed :
                        customListType === 'deny' && user.denied ? styles.denied : ''
                      }`}
                      onClick={() => toggleUserPermission(user.id, customListType)}
                    >
                      {customListType === 'allow' && user.allowed ? 'Allowed' :
                       customListType === 'deny' && user.denied ? 'Blocked' :
                       customListType === 'allow' ? 'Allow' : 'Block'}
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No followers found</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.saveButton}
                onClick={() => setShowCustomList(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesStoryReplies;