import React, { useState, useRef } from "react";
import styles from "./FeelingsAdd.module.css";
import { FiImage, FiSmile, FiMapPin, FiX, FiSend } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { RiQuillPenLine } from "react-icons/ri";

const FeelingsAdd = ({ onClose, user, authToken }) => {
  const [postText, setPostText] = useState("");
  const [images, setImages] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const updated = [...images];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postText.trim() && images.length === 0) {
      alert("Lütfen bir metin girin veya bir görsel ekleyin.");
      return;
    }

    try {
      // ✅ Token'ı yenile
      const refreshedToken = await user.getIdToken(true);

      const response = await fetch("http://localhost:3001/api/feelings/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ✅ Yenilenmiş token'ı kullan
          Authorization: `Bearer ${refreshedToken}`,
        },
        body: JSON.stringify({
          postText: postText,
          images: images.map((img) => img.file.name),
          privacy: privacy,
        }),
      });

      if (!response.ok) {
        throw new Error("Gönderi paylaşılırken bir hata oluştu.");
      }

      const result = await response.json();
      onClose();
    } catch (error) {
      console.error("Paylaşım hatası:", error.message);
    }
  };

  return (
    <div className={styles.postFormContainer}>
      <div className={styles.postFormHeader}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoMdClose size={24} />
        </button>
        <h2 className={styles.formTitle}>Yeni Gönderi Oluştur</h2>
        <button
          className={`${styles.postButton} ${
            postText.trim() || images.length ? styles.active : ""
          }`}
          onClick={handleSubmit}
          disabled={!postText.trim() && images.length === 0}
        >
          <FiSend size={20} />
          <span>Paylaş</span>
        </button>
      </div>

      <div className={styles.postFormContent}>
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            <img
              src={
                user?.photoURL ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt="User Avatar"
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.username}>
              {user?.displayName || "Kullanıcı Adı"}
            </span>
            <div className={styles.privacySelector}>
              <select
                className={styles.privacySelect}
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

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.active}`}>
            <RiQuillPenLine /> FeelingsAdd
          </button>
        </div>

        <div className={styles.editorArea}>
          <textarea
            className={styles.postTextarea}
            placeholder="Neler oluyor?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            autoFocus
          />
          {images.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {images.map((img, index) => (
                <div key={index} className={styles.imagePreviewWrapper}>
                  <img
                    src={img.preview}
                    alt={`Preview ${index}`}
                    className={styles.imagePreview}
                  />
                  <button
                    className={styles.removeImageButton}
                    onClick={() => removeImage(index)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.postFormFooter}>
         {/*  <div className={styles.attachmentButtons}>
            <button
              className={styles.attachmentButton}
              onClick={() => fileInputRef.current.click()}
            >
              <FiImage size={20} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                style={{ display: "none" }}
              />
            </button>
            <button className={styles.attachmentButton}>
              <FiSmile size={20} />
            </button>
            <button className={styles.attachmentButton}>
              <FiMapPin size={20} />
            </button>
          </div> */}

          <div className={styles.characterCounter}>
            <span
              className={`${styles.counter} ${
                postText.length > 250 ? styles.warning : ""
              }`}
            >
              {postText.length}/300
            </span>
          </div>
        </div>
      </div>

      <div className={styles.backgroundEffects}>
        <div className={styles.gradientCircle1}></div>
        <div className={styles.gradientCircle2}></div>
      </div>
    </div>
  );
};

export default FeelingsAdd;
