import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  X, 
  Send, 
  Globe, 
  Users, 
  Eye, 
  Upload 
} from "lucide-react";
import { MdWebStories } from "react-icons/md";
import styles from "./StoryAdd.module.css";
import { useAuth } from "../../../context/AuthProvider";
import Toast from "../../../Toast"; // Toast bileşeninizin yolu
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay"; // Loading bileşeniniz

// --- RULES MODAL ---
const RulesModal = ({ onClose }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h3>Story Guidelines</h3>
        <button onClick={onClose} className={styles.closeModalButton}><X size={24}/></button>
      </div>
      <div className={styles.modalBody}>
        <h4>1. Content Safety</h4>
        <p>Stories must be suitable for all audiences. No violence, hate speech, or illegal content.</p>
        <h4>2. Copyright</h4>
        <p>Ensure you have the right to share the embedded content.</p>
        <h4>3. Ad Policy</h4>
        <p>Strictly no NSFW content. Violations will result in a ban.</p>
      </div>
      <button onClick={onClose} className={styles.agreeButton}>I Understand</button>
    </div>
  </div>
);

const StoryAdd = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // URL değişimi ve tip algılama
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);

    const videoRegex = /\.(mp4|webm|ogg|mov)$/i;
    if (videoRegex.test(url)) {
      setMediaType("video");
    } else {
      setMediaType("image");
    }
  };

  const handleClear = () => {
    setMediaUrl("");
    setMediaType("image");
  };

  const handleShare = async () => {
    if (!currentUser) return showToast("Please login first.", "error");
    if (!mediaUrl) return showToast("Please enter a media URL.", "error");
    if (!isTermsAccepted) return showToast("Please accept the guidelines.", "error");

    setLoading(true);

    try {
      const token = await currentUser.getIdToken();
      const bodyData = {
        mediaUrl,
        mediaType,
        privacy,
        caption: ""
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/add`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        showToast("Story shared successfully!", "success");
        setTimeout(() => navigate("/"), 1000);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to share story");
      }
    } catch (e) {
      console.error(e);
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <LoadingOverlay />}
      <Toast />
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <div className={styles.storyCard}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>New Story</span>
          <div style={{width: 40}}></div>
        </div>

        {/* Preview */}
        <div className={styles.previewArea}>
          {mediaUrl ? (
            <>
              <button onClick={handleClear} className={styles.clearButton}>
                <X size={20} />
              </button>

              {mediaType === "video" ? (
                <video 
                  src={mediaUrl} 
                  className={styles.mediaPreview} 
                  autoPlay loop muted playsInline
                  onError={() => setMediaUrl("")} // bozuk URL temizle
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className={styles.mediaPreview}
                  onError={(e) => e.currentTarget.src = "/blank-profile-picture.png"} // fallback resim
                />
              )}
            </>
          ) : (
            <div className={styles.inputContainer}>
              <div className={styles.iconGroup}>
                <MdWebStories size={48} />
              </div>
              <input 
                type="text" 
                className={styles.urlInput} 
                placeholder="Paste Image or Video URL..." 
                value={mediaUrl}
                onChange={handleUrlChange}
                autoFocus
              />
              <div className={styles.uploadDisabled}>
                <Upload size={20} />
                <span>Upload from Gallery</span>
                <span className={styles.comingSoonBadge}>Soon</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Privacy */}
          <div className={styles.privacyGroup}>
            <button 
              className={`${styles.privacyBtn} ${privacy === 'public' ? styles.active : ''}`}
              onClick={() => setPrivacy('public')}
            >
              <Globe size={18} /> Public
            </button>
            <button 
              className={`${styles.privacyBtn} ${privacy === 'friends' ? styles.active : ''}`}
              onClick={() => setPrivacy('friends')}
            >
              <Users size={18} /> Friends
            </button>
            <button 
              className={`${styles.privacyBtn} ${privacy === 'close_friendships' ? styles.active : ''} ${styles.closeFriends}`}
              onClick={() => setPrivacy('close_friendships')}
            >
              <Eye size={18} /> Close Friends
            </button>
          </div>

          {/* Terms */}
          <div className={styles.termsContainer}>
            <input 
              type="checkbox" 
              id="terms" 
              className={styles.checkbox}
              checked={isTermsAccepted}
              onChange={(e) => setIsTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className={styles.termsLabel}>
              I accept the <span className={styles.link} onClick={() => setShowRules(true)}>Community Guidelines</span>.
            </label>
          </div>

          {/* Share */}
          <button 
            className={styles.shareButton} 
            onClick={handleShare}
            disabled={!mediaUrl || !isTermsAccepted || loading}
          >
            {loading ? "Sharing..." : "Share to Story"} <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryAdd;
