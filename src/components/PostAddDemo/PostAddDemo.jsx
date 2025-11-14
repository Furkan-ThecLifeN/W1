import React, { useState } from "react";
import {
  Image,
  X,
  Globe,
  Users,
  Eye,
  Lock,
} from "lucide-react";
import styles from "./PostAddDemo.module.css";
import { motion } from "framer-motion";

// You can include this component in your homepage Post Creation Demo section
// as <PostAddDemo />.

const PostAddDemo = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const handleUrlChange = (e) => setImageUrl(e.target.value);

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public":
        return <Globe size={16} />;
      case "friends":
        return <Users size={16} />;
      case "close_friendships":
        return <Eye size={16} />;
      case "private":
        return <Lock size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getPrivacyText = () => {
    switch (privacy) {
      case "public":
        return "Public";
      case "friends":
        return "Friends Only";
      case "close_friendships":
        return "Close Friends";
      case "private":
        return "Only Me";
      default:
        return "Public";
    }
  };

  // Framer-motion animations for homepage
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={styles.demoWrapper}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Demo version of .postCard from PostAdd.jsx.
          Without header (Share/Back buttons).
      */}
      <div className={styles.postCard}>
        <div className={styles.demoHeader}>
          <h4>Try the Post Creator</h4>
          <p>Your data will not be saved.</p>
        </div>

        <div className={styles.postContent}>
          <div className={styles.mediaUploadSection}>
            <div className={styles.mediaPreview}>
              {imageUrl ? (
                <div className={styles.imageWrapper}>
                  <img
                    src={imageUrl}
                    alt="Image Preview"
                    className={styles.uploadedImage}
                    // Show icon if image fails to load
                    onError={(e) => {
                      e.target.style.display = "none"; // Hide broken image
                      e.target.parentElement.querySelector(
                        `.${styles.errorIcon}`
                      ).style.display = "flex"; // Show error icon
                    }}
                  />
                  {/* Icon shown in case of image load error */}
                  <div
                    className={`${styles.dropzone} ${styles.errorIcon}`}
                    style={{ display: "none", padding: 0 }}
                  >
                    <Image size={48} className={styles.dropzoneIcon} />
                    <p
                      className={styles.dropzoneText}
                      style={{ fontSize: "0.9rem" }}
                    >
                      Image could not be loaded
                    </p>
                  </div>

                  <button
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className={styles.dropzone}>
                  <Image size={48} className={styles.dropzoneIcon} />
                  <p className={styles.dropzoneText}>
                    Paste an image URL below
                  </p>
                  <input
                    type="text"
                    placeholder="https://.../image.jpg"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    className={styles.urlInput}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.userInfoAndPrivacy}>
              <div className={styles.avatar}>
                {/* Placeholder avatar for demo */}
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  alt="Demo User Avatar"
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.userMeta}>
                <span className={styles.username}>W1 User</span>
                <div className={styles.privacySelector}>
                  <div className={styles.privacyDisplay}>
                    {getPrivacyIcon()}
                    <span>{getPrivacyText()}</span>
                  </div>
                  <select
                    className={styles.hiddenSelect}
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="close_friendships">Close Friends</option>
                    <option value="private">Only Me</option>
                  </select>
                </div>
              </div>
            </div>

            <textarea
              className={styles.captionInput}
              placeholder="Add a caption to your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostAddDemo;
