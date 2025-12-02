import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { getAuth } from "firebase/auth";
import styles from "./FeelingsAdd.module.css";
// İkonlar Lucide'ye çevrildi (Diğer sayfalarla uyum için)
import { X, Send, PenTool } from "lucide-react"; 
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import Toast from "../../../Toast";

const MAX_LENGTH = 3000;

const FeelingsAdd = () => {
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [postText, setPostText] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  // Validasyonlar
  const isPostValid = postText.trim().length > 0;
  const isTextOverLimit = postText.length > MAX_LENGTH;
  const isButtonDisabled = !isPostValid || isTextOverLimit || loading;

  const handleSubmit = async () => {
    if (isTextOverLimit) return showToast(`Text too long. Max ${MAX_LENGTH} chars.`, "error");
    if (!isPostValid) return showToast("Please write something.", "info");

    const auth = getAuth();
    if (!auth.currentUser) return showToast("Please login first.", "error");

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/feelings/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          postText,
          images: [], // Feelings'de resim yoksa boş array
          privacy,
        }),
      });

      if (!res.ok) throw new Error("Failed to share.");

      showToast("Feeling shared successfully!", "success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      console.error(error);
      showToast("Error sharing feeling.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.feelings_add}>
      {loading && <LoadingOverlay />}
      <Toast />

      <div className={styles.postFormContainer}>
        
        {/* HEADER */}
        <div className={styles.postFormHeader}>
          <button className={styles.closeButton} onClick={() => navigate(-1)}>
            <X size={24} />
          </button>
          <span className={styles.formTitle}>New Feeling</span>
          <button
            className={styles.postButton}
            onClick={handleSubmit}
            disabled={isButtonDisabled}
          >
            <Send size={18} />
            <span className={styles.postButtonLabel}>Share</span>
          </button>
        </div>

        <div className={styles.postFormContent}>
          
          {/* USER INFO */}
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              <img
                src={currentUser?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                alt="User"
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.username}>{currentUser?.displayName || "Guest"}</span>
              <div className={styles.privacySelector}>
                <select
                  className={styles.privacySelect}
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

          {/* EDITOR */}
          <div className={styles.editorArea}>
            <div className={styles.tabs}>
              <PenTool size={16} /><span>Write your feelings</span>
            </div>
            <textarea
              className={styles.postTextarea}
              placeholder="How are you feeling today?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              autoFocus
            />
          </div>

          {/* FOOTER */}
          <div className={styles.postFormFooter}>
            <span className={`${styles.characterCounter} ${isTextOverLimit ? styles.counterError : ''}`}>
              {postText.length} / {MAX_LENGTH}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeelingsAdd;