import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image,
  Video,
  X,
  Send,
  Globe,
  Users,
  Eye,
  Lock,
  Upload // Upload ikonu eklendi
} from "lucide-react";
import styles from "./PostAdd.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import Toast from "../../../Toast";

// Modal Component (Translated to English)
const RulesModal = ({ onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Community & Content Guidelines</h3>
          <button onClick={onClose} className={styles.closeModalButton}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.ruleItem}>
            <h4>1. Community Standards & Safety</h4>
            <p>
              The content you share must adhere to general moral standards. 
              Posts containing violence, threats, harassment, or disturbing elements 
              will be removed without warning.
            </p>
          </div>
          <div className={styles.ruleItem}>
            <h4>2. Copyright & Embed Usage</h4>
            <p>
              You acknowledge that you own the rights to the images or videos you share, 
              or that you are sharing within legal "embed" rules. You are responsible 
              for any unauthorized use of content belonging to others.
            </p>
          </div>
          <div className={styles.ruleItem}>
            <h4>3. Ad Policy</h4>
            <p>
              Our platform is subject to Google AdSense and Ezoic partnership policies. 
              The following content is strictly <strong>PROHIBITED</strong>:
            </p>
            <ul>
              <li>Sexual content or nudity (+18).</li>
              <li>Hate speech, racism, or discrimination.</li>
              <li>Promotion or sale of illegal substances.</li>
              <li>Copyright-infringing materials.</li>
            </ul>
            <p className={styles.warningText}>
              Accounts violating these rules may be suspended.
            </p>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.agreeButton}>
            I Understand, I Accept the Rules
          </button>
        </div>
      </div>
    </div>
  );
};

const PostAdd = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const { currentUser: userData } = useUser();

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("image"); // 'image' or 'video'
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  
  // Terms acceptance states
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Determine if video or image based on URL
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);
    
    // Simple extension check
    const videoExtensions = /\.(mp4|webm|ogg|mov)$/i;
    if (videoExtensions.test(url)) {
      setMediaType("video");
    } else {
      setMediaType("image");
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl("");
    setMediaFile(null);
    setMediaType("image");
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public": return <Globe size={16} />;
      case "friends": return <Users size={16} />;
      case "close_friendships": return <Eye size={16} />;
      case "private": return <Lock size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getPrivacyText = () => {
    switch (privacy) {
      case "public": return "Public";
      case "friends": return "Friends Only";
      case "close_friendships": return "Close Friends";
      case "private": return "Only Me";
      default: return "Public";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast("You must be logged in to share a post.", "error");
      return;
    }

    if (!isTermsAccepted) {
      showToast("Please accept the Community Guidelines.", "error");
      return;
    }

    if (!caption.trim() && !mediaUrl && !mediaFile) {
      showToast("Please add a caption or attach media.", "error");
      return;
    }

    setLoading(true);

    try {
      const refreshedToken = await currentUser.getIdToken(true);

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("privacy", privacy);
      formData.append("mediaType", mediaType);

      // Add file or URL
      if (mediaFile) {
        formData.append("media", mediaFile); 
      } else if (mediaUrl) {
        formData.append("mediaUrls[]", mediaUrl);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/posts/share`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${refreshedToken}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred while sharing the post.");
      }

      await response.json();
      showToast("Post shared successfully", "success");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      showToast(`Error sharing post: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <LoadingOverlay />}
      <Toast />
      
      {/* Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      <div className={styles.postCard}>
        <div className={styles.postHeader}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={styles.title}>Create New Post</h2>
          <button
            className={`${styles.shareButton} ${
              (caption.trim() || mediaUrl || mediaFile) && isTermsAccepted && !loading ? styles.active : ""
            }`}
            onClick={handleSubmit}
            disabled={loading || !isTermsAccepted || (!caption.trim() && !mediaUrl && !mediaFile)}
          >
            {loading ? "Loading..." : "Share"} <Send size={18} />
          </button>
        </div>

        <div className={styles.postContent}>
          <div className={styles.mediaUploadSection}>
            <div className={styles.mediaPreview}>
              {(mediaUrl || mediaFile) ? (
                <div className={styles.imageWrapper}>
                  {mediaType === "video" ? (
                     <video 
                        src={mediaFile ? URL.createObjectURL(mediaFile) : mediaUrl} 
                        className={styles.uploadedImage}
                        controls
                     />
                  ) : (
                    <img
                      src={mediaFile ? URL.createObjectURL(mediaFile) : mediaUrl}
                      alt="Preview"
                      className={styles.uploadedImage}
                    />
                  )}
                  
                  <button
                    className={styles.removeImageButton}
                    onClick={handleRemoveMedia}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className={styles.dropzone}>
                  <div className={styles.iconsRow}>
                    <Image size={40} className={styles.dropzoneIcon} />
                    <Video size={40} className={styles.dropzoneIcon} />
                  </div>
                  <p className={styles.dropzoneText}>
                    Paste Image or Video URL
                  </p>
                  <input
                    type="text"
                    placeholder="https://example.com/video.mp4 or image.jpg"
                    value={mediaUrl}
                    onChange={handleUrlChange}
                    className={styles.urlInput}
                  />
                  
                  {/* --- NEW: Disabled Gallery Upload Button --- */}
                  <div style={{ marginTop: '15px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                        borderTop: '1px solid #eee', 
                        width: '80%', 
                        margin: '10px 0', 
                        position: 'relative', 
                        textAlign: 'center' 
                    }}>
                        <span style={{ 
                            background: '#fff', 
                            padding: '0 10px', 
                            color: '#999', 
                            fontSize: '0.8rem', 
                            position: 'relative', 
                            top: '-10px' 
                        }}>OR</span>
                    </div>
                    
                    <button 
                        disabled 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f0f2f5',
                            border: '1px dashed #ccc',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            color: '#888',
                            cursor: 'not-allowed',
                            fontWeight: '500',
                            opacity: 0.7
                        }}
                    >
                        <Upload size={18} />
                        Upload from Gallery
                        <span style={{
                            fontSize: '0.7rem',
                            background: '#ff9800',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '5px',
                            textTransform: 'uppercase'
                        }}>Coming Soon</span>
                    </button>
                  </div>
                  {/* --- End of New Button --- */}

                </div>
              )}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.userInfoAndPrivacy}>
              <div className={styles.avatar}>
                <img
                  src={
                    currentUser?.photoURL ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="User Avatar"
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.userMeta}>
                <span className={styles.username}>
                  {currentUser?.displayName || "Username"}
                </span>
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

            {/* Terms Checkbox Area */}
            <div className={styles.rulesContainer} style={{marginTop: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
              <input 
                type="checkbox" 
                id="termsCheck"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                style={{marginTop: '4px', cursor: 'pointer'}}
              />
              <label htmlFor="termsCheck" style={{fontSize: '0.9rem', color: '#555'}}>
                I accept the{" "}
                <span 
                  onClick={(e) => { e.preventDefault(); setShowRulesModal(true); }}
                  style={{color: '#0095f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline'}}
                >
                  Community Guidelines
                </span>
                , Copyright, and Ad Policies (Google AdSense/Ezoic).
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAdd;