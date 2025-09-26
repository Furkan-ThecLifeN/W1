import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { getAuth } from "firebase/auth";
import styles from "./FeelingsAdd.module.css";
import { FiImage, FiSmile, FiMapPin, FiX, FiSend } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { RiQuillPenLine } from "react-icons/ri";

// ✅ SABİT DEĞER: Maksimum karakter limiti
const MAX_LENGTH = 3000;

const FeelingsAdd = () => {
    const { currentUser, loading } = useUser();
    const { showToast } = useAuth();
    const navigate = useNavigate();

    const [postText, setPostText] = useState("");
    const [images, setImages] = useState([]);
    const [privacy, setPrivacy] = useState("public");
    const fileInputRef = useRef(null);

    // ✅ YENİ KONTROL: Paylaşım butonunun etkin olup olmadığını belirler
    const isPostValid = postText.trim() || images.length > 0;
    const isTextOverLimit = postText.length > MAX_LENGTH;
    const isButtonDisabled = !isPostValid || isTextOverLimit;

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

        // 1. KONTROL: Metin uzunluğunu kontrol et
        if (isTextOverLimit) {
            showToast(`Gönderi metni ${MAX_LENGTH} karakteri aşamaz.`, "error");
            return;
        }

        if (!isPostValid) {
            showToast("Lütfen bir metin girin veya bir görsel ekleyin.", "info");
            return;
        }

        const auth = getAuth();
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            showToast("Paylaşım yapmak için lütfen giriş yapın.", "error");
            return;
        }

        try {
            const token = await firebaseUser.getIdToken(true);

            // API endpoint'inin doğru olduğundan emin olunuz
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/feelings/share`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        postText,
                        images: images.map((img) => img.file.name),
                        privacy,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Gönderi paylaşılırken hata oluştu.");
            }

            showToast("Gönderiniz başarıyla paylaşıldı!", "success");
            navigate("/home");
        } catch (error) {
            console.error("Sharing error:", error);
            showToast("Gönderi paylaşılırken bir hata oluştu.", "error");
        }
    };

    if (loading || !currentUser) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className={styles.postFormContainer}>
            <div className={styles.postFormHeader}>
                <button className={styles.closeButton} onClick={() => navigate(-1)}>
                    <IoMdClose size={24} />
                </button>
                <h2 className={styles.formTitle}>Yeni Gönderi Oluştur</h2>
                <button
                    className={`${styles.postButton} ${
                        isPostValid && !isTextOverLimit ? styles.active : ""
                    }`}
                    onClick={handleSubmit}
                    // ✅ GÜNCELLEME 1: Butonun devre dışı bırakılma durumunu güncelle
                    disabled={isButtonDisabled}
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
                                currentUser?.photoURL ||
                                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                            }
                            alt="User Avatar"
                            className={styles.avatarImage}
                        />
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.username}>
                            {currentUser?.displayName || "Kullanıcı Adı"}
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
                        // ✅ GÜNCELLEME 2: Metin kutusuna maksimum uzunluk ekle (Opsiyonel, sadece tarayıcı kısıtlaması için)
                        maxLength={MAX_LENGTH} 
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
                    <div className={styles.characterCounter}>
                        <span
                            className={`${styles.counter} ${
                                // ✅ GÜNCELLEME 3: Sınırı aşanlar için uyarı stilini kontrol et
                                postText.length > MAX_LENGTH ? styles.error : ""
                            }`}
                        >
                            {postText.length}/{MAX_LENGTH}
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