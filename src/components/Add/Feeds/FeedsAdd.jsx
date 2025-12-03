import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  X, 
  Upload, 
  Link as LinkIcon
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import styles from "./FeedsAdd.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { useUserData } from "../../../hooks/useUserData"; // ✅ 1. Import Eklendi
import { auth } from "../../../config/firebase-client";
import Toast from "../../../Toast";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";

// Rules Modal
const RulesModal = ({ onClose }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      <h3 className={styles.modalTitle}>Guidelines</h3>
      <div className={styles.modalContent}>
        <p>1. <strong>Ownership:</strong> Ensure you have the right to share this content.</p>
        <p>2. <strong>Safety:</strong> No violence, hate speech, or illegal acts.</p>
        <p>3. <strong>AdSense:</strong> Content must be advertiser-friendly.</p>
      </div>
      <button onClick={onClose} className={styles.modalBtn}>I Accept</button>
    </div>
  </div>
);

const FeedsAdd = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  
  // ✅ 2. Firestore'dan güncel veriyi dinliyoruz
  const userData = useUserData(currentUser?.uid);
  
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract ID
  const videoId = useMemo(() => {
    const regex = /(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/;
    const match = mediaUrl.match(regex);
    return match ? match[1] : null;
  }, [mediaUrl]);

  const handleShare = async () => {
    if (!currentUser) return showToast("Please login first.", "error");
    if (!videoId) return showToast("Invalid YouTube link.", "error");
    if (!isTermsAccepted) return showToast("Please accept guidelines.", "error");

    setLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/feeds/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postText: description,
          mediaUrl: mediaUrl,
          rulesAccepted: true,
          privacy: privacy,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish.");
      showToast("Published successfully!", "success");
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

      <div className={styles.feedCard}>
        
        {/* === LEFT: MEDIA ZONE === */}
        <div className={styles.mediaColumn}>
          {videoId ? (
            <div className={styles.videoContainer}>
              <iframe
                className={styles.videoFrame}
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Preview"
                allowFullScreen
              />
              <button className={styles.clearBtn} onClick={() => setMediaUrl("")}>
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className={styles.inputZone}>
              <FaYoutube size={64} className={styles.zoneIcon} />
              <div>
                <h3 className={styles.zoneTitle}>Share a Short</h3>
                <p className={styles.zoneDesc}>Paste your YouTube Shorts link below</p>
              </div>
              
              <input 
                type="text" 
                className={styles.urlInput} 
                placeholder="https://youtube.com/shorts/..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                autoFocus
              />

              <div className={styles.divider}><span>OR</span></div>

              <button className={styles.galleryBtn} disabled>
                <Upload size={18} /> Upload from Gallery 
                <span className={styles.badge}>SOON</span>
              </button>
            </div>
          )}
        </div>

        {/* === RIGHT: DETAILS === */}
        <div className={styles.detailsColumn}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={24} />
            </button>
            <span className={styles.headerTitle}>New Feed Post</span>
            <div style={{width: 24}}></div>
          </div>

          <div className={styles.formContent}>
            
            {/* User */}
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
                placeholder="What's this video about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Rules */}
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
              disabled={!videoId || !isTermsAccepted || loading}
            >
              {loading ? "Publishing..." : <><Send size={18} /> Publish Feed</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeedsAdd;