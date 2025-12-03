import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Send,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import styles from "./PostAdd.module.css";
import { BsFillImageFill } from "react-icons/bs";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { useUserData } from "../../../hooks/useUserData"; // ✅ 1. Import Eklendi
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import Toast from "../../../Toast";
import { auth } from "../../../config/firebase-client";

// --- Rules Modal ---
const RulesModal = ({ onClose }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Guidelines</h3>
        <button onClick={onClose} className={styles.closeModalButton}><X size={24}/></button>
      </div>
      <div className={styles.modalContent}>
        <p>1. <strong>Respect:</strong> No hate speech, violence, or harassment.</p>
        <p>2. <strong>Copyright:</strong> Only share content you own or have permission to use.</p>
        <p>3. <strong>Safety:</strong> No NSFW or illegal content.</p>
      </div>
      <button onClick={onClose} className={styles.modalBtn}>I Understand & Accept</button>
    </div>
  </div>
);

const PostAdd = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();

  // ✅ 2. Firestore'dan güncel veriyi dinliyoruz
  const userData = useUserData(currentUser?.uid);

  // State
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image"); // 'image' or 'video'
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);

  // URL Change Logic
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);
    
    // Basit tip kontrolü (Uzantıya göre)
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) {
      setMediaType("video");
    } else {
      setMediaType("image");
    }
  };

  const handleShare = async () => {
    // Validasyonlar
    if (!currentUser) return showToast("Please login first.", "error");
    if (!mediaUrl) return showToast("Please enter a valid image/video URL.", "error");
    if (!caption.trim()) return showToast("Please write a caption.", "error");
    if (!isTermsAccepted) return showToast("Please accept guidelines.", "error");

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      
      const bodyData = {
        caption: caption,
        privacy: privacy,
        mediaUrls: [mediaUrl],
        mediaType: mediaType,
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/share`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to share post.");
      }

      showToast("Post shared successfully!", "success");
      setTimeout(() => navigate("/home"), 1000);

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

      <div className={styles.postCard}>
        
        {/* === LEFT: MEDIA PREVIEW ZONE === */}
        <div className={styles.mediaColumn}>
          {mediaUrl ? (
            <div className={styles.previewContainer}>
              {mediaType === "video" ? (
                <video 
                  src={mediaUrl} 
                  className={styles.previewMedia} 
                  controls 
                  playsInline 
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className={styles.previewMedia} 
                />
              )}
              <button className={styles.clearBtn} onClick={() => setMediaUrl("")}>
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className={styles.inputZone}>
              <BsFillImageFill size={64} className={styles.zoneIcon} />
              <div>
                <h3 className={styles.zoneTitle}>Create Post</h3>
                <p className={styles.zoneDesc}>Paste an Image or Video URL</p>
              </div>
              
              <input 
                type="text" 
                className={styles.urlInput} 
                placeholder="https://example.com/image.jpg..."
                value={mediaUrl}
                onChange={handleUrlChange}
                autoFocus
              />

              <div className={styles.divider}><span>OR</span></div>

              {/* DISABLED UPLOAD BUTTON */}
              <button className={styles.disabledUploadBtn} disabled>
                <Upload size={18} /> Upload from Device 
                <span className={styles.badge}>YAKINDA</span>
              </button>
            </div>
          )}
        </div>

        {/* === RIGHT: DETAILS ZONE === */}
        <div className={styles.detailsColumn}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={24} />
            </button>
            <span className={styles.headerTitle}>New Post</span>
            <div style={{width: 24}}></div>
          </div>

          <div className={styles.formContent}>
            
            {/* User Info */}
            <div className={styles.userRow}>
              {/* ✅ 3. Güncel Profil Resmi */}
              <img 
                src={userData?.photoURL || currentUser?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} 
                alt="Avatar" 
                className={styles.avatar} 
              />
              <div className={styles.meta}>
                {/* ✅ 4. Güncel DisplayName */}
                <span className={styles.username}>
                    {userData?.displayName || currentUser?.displayName || "User"}
                </span>
                
                <select 
                  className={styles.privacySelect}
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="close_friendships">Close Friends</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
            </div>

            {/* Caption */}
            <div className={styles.captionGroup}>
              <textarea 
                className={styles.textArea} 
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Rules Checkbox */}
            <div className={styles.rulesGroup} onClick={() => setIsTermsAccepted(!isTermsAccepted)}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={isTermsAccepted}
                onChange={() => {}} 
              />
              <div className={styles.rulesText}>
                I agree to the <span className={styles.link} onClick={(e) => {
                  e.stopPropagation();
                  setShowRules(true);
                }}>Community Guidelines</span> and confirm this content is safe.
              </div>
            </div>

          </div>

          <div className={styles.footer}>
            <button 
              className={styles.publishBtn}
              onClick={handleShare}
              disabled={!mediaUrl || !caption || !isTermsAccepted || loading}
            >
              {loading ? "Posting..." : <><Send size={18} /> Share Post</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostAdd;