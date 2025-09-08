import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image,
  X,
  Send,
  Globe,
  Users,
  Eye,
  Lock,
} from "lucide-react";
import styles from "./PostAdd.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import Toast from "../../../Toast";

const PostAdd = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth(); // ✅ showToast kullan
  const { currentUser: userData } = useUser();

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  const handleUrlChange = (e) => setImageUrl(e.target.value);
  const handleRemoveImage = () => setImageUrl("");

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
        return "Herkese Açık";
      case "friends":
        return "Sadece Arkadaşlar";
      case "close_friendships":
        return "Yakın Arkadaşlar";
      case "private":
        return "Sadece Ben";
      default:
        return "Herkese Açık";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!currentUser) {
      showToast("Gönderi paylaşmak için oturum açmalısınız.", "error");
      setLoading(false);
      return;
    }

    if (!caption.trim() && !imageUrl) {
      showToast("Lütfen bir açıklama girin veya bir görsel ekleyin.", "error");
      setLoading(false);
      return;
    }

    try {
      const refreshedToken = await currentUser.getIdToken(true);

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("privacy", privacy);

      if (imageUrl instanceof File) {
        formData.append("images", imageUrl);
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
        throw new Error(errorData.error || "Post paylaşılırken bir hata oluştu.");
      }

      await response.json();
      showToast("Post başarıyla paylaşıldı", "success");
      setTimeout(() => navigate(-1), 1500);

    } catch (error) {
      showToast(`Gönderi paylaşılırken hata: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <LoadingOverlay />}
      <Toast />

      <div className={styles.postCard}>
        <div className={styles.postHeader}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={styles.title}>Yeni Post Oluştur</h2>
          <button
            className={`${styles.shareButton} ${
              (caption.trim() || imageUrl) && !loading ? styles.active : ""
            }`}
            onClick={handleSubmit}
            disabled={loading || (!caption.trim() && !imageUrl)}
          >
            {loading ? "Yükleniyor..." : "Paylaş"} <Send size={18} />
          </button>
        </div>

        <div className={styles.postContent}>
          <div className={styles.mediaUploadSection}>
            <div className={styles.mediaPreview}>
              {imageUrl ? (
                <div className={styles.imageWrapper}>
                  <img
                    src={imageUrl}
                    alt="Görsel Önizleme"
                    className={styles.uploadedImage}
                  />
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
                  <p className={styles.dropzoneText}>Görsel URL'si yapıştırın</p>
                  <input
                    type="text"
                    placeholder="https://örnek.com/gorsel.jpg"
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
                  {currentUser?.displayName || "Kullanıcı Adı"}
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
                    <option value="public">Herkese Açık</option>
                    <option value="friends">Sadece Arkadaşlar</option>
                    <option value="close_friendships">Yakın Arkadaşlar</option>
                    <option value="private">Sadece Ben</option>
                  </select>
                </div>
              </div>
            </div>

            <textarea
              className={styles.captionInput}
              placeholder="Postunuza bir açıklama ekleyin..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAdd;
