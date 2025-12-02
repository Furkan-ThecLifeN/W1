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

// --- RULES MODAL (Same content as PostAdd) ---
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
  const { currentUser, showToast } = useAuth(); // Toast fonksiyonunu context'ten alıyoruz

  // State Management
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [privacy, setPrivacy] = useState("public"); // Varsayılan: Public
  const [loading, setLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // URL Değişimi ve Tip Algılama
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);

    // Basit uzantı kontrolü (Linklerde genelde mp4 vs geçer)
    // Eğer YouTube vb embed ise burası daha gelişmiş regex gerektirebilir.
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
      
      // Backend'in PostController gibi JSON body kabul etmesi gerekiyor
      const bodyData = {
        mediaUrl: mediaUrl, // Dosya yerine URL gönderiyoruz
        mediaType: mediaType,
        privacy: privacy,
        caption: "" // Story'de caption olmayabilir veya overlay olabilir
      };

      // NOT: Backend rotanızın JSON body kabul ettiğinden emin olun.
      // Eğer sadece FormData kabul ediyorsa, backend 'upload.none()' kullanmalı.
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/add`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" // JSON olarak gönderiyoruz
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        showToast("Story shared successfully!", "success");
        setTimeout(() => navigate("/"), 1000); // Feed'e dön
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
        {/* --- Header --- */}
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>New Story</span>
          <div style={{width: 40}}></div> {/* Spacer for alignment */}
        </div>

        {/* --- Main Preview / Input Area --- */}
        <div className={styles.previewArea}>
          {mediaUrl ? (
            <>
              <button onClick={handleClear} className={styles.clearButton}>
                <X size={20} />
              </button>
              {mediaType === "video" ? (
                <video src={mediaUrl} className={styles.mediaPreview} autoPlay loop muted playsInline />
              ) : (
                <img src={mediaUrl} alt="Preview" className={styles.mediaPreview} />
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

        {/* --- Bottom Controls --- */}
        <div className={styles.controls}>
          
          {/* Privacy Selector */}
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

          {/* Rules Checkbox */}
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

          {/* Share Button */}
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