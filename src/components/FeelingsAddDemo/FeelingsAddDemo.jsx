import React, { useState } from "react"; // Etkileşim için useState eklendi
import styles from "./FeelingsAddDemo.module.css";
import { IoMdClose } from "react-icons/io";
// FiSend kaldırıldı çünkü paylaş butonu yok
import { RiQuillPenLine } from "react-icons/ri";

// Demo için sabit değer
const MAX_LENGTH = 3000;

/**
 * FeelingsAdd Bileşeninin Statik Demo Versiyonu
 * - Bu demo, kullanıcının arayüzü "denemesine" olanak tanır.
 * - State (durum) bu bileşende tutulur ve sayfa yenilendiğinde kaybolur.
 */
const FeelingsAddDemo = () => {
  // Demo bileşeninin kendi state'i eklendi
  const [postText, setPostText] = useState("");
  const [privacy, setPrivacy] = useState("public");

  return (
    <div className={styles.feelingsAddDemoWrapper}>
      <div className={styles.postFormContainer}>
        {/* ===== BAŞLIK ===== */}
        <div className={styles.postFormHeader}>
          <button
            className={styles.closeButton}
            aria-label="Close (Demo)" // İngilizce
            disabled // Fonksiyonel değil
          >
            <IoMdClose size={22} />
          </button>

          <h2 className={styles.formTitle}>Create a New Feeling</h2>{" "}
          {/* İngilizce */}
          {/* Paylaş butonu kaldırıldı, başlığı ortalamak için yer tutucu eklendi */}
          <div className={styles.headerRightPlaceholder} />
        </div>

        {/* ===== İÇERİK ===== */}
        <div className={styles.postFormContent}>
          {/* Kullanıcı Bilgisi */}
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                alt="User Avatar"
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.username}>W1 User</span> {/* Değiştirildi */}
              <div className={styles.privacySelector}>
                <select
                  className={styles.privacySelect}
                  value={privacy} // State'e bağlandı
                  onChange={(e) => setPrivacy(e.target.value)} // Etkileşim eklendi
                  aria-label="Privacy (Demo)" // İngilizce
                >
                  {/* Seçenekler İngilizce'ye çevrildi */}
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="close_friendships">Close Friends</option>
                  <option value="private">Private (Only Me)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sekme (Zaten statikti) */}
          <div className={styles.tabs}>
            <div className={styles.tab}>
              <RiQuillPenLine /> FeelingsAdd
            </div>
          </div>

          {/* Editör Alanı */}
          <div className={styles.editorArea}>
            <textarea
              className={styles.postTextarea}
              placeholder="What's on your mind? (Demo)" // İngilizce
              value={postText} // State'e bağlandı
              onChange={(e) => setPostText(e.target.value)} // Etkileşim eklendi
              maxLength={MAX_LENGTH} // Karakter limitini zorunlu kıl
            />
          </div>

          {/* ===== FOOTER ===== */}
          <div className={styles.postFormFooter}>
            <div className={styles.rightActions}>
              <div className={styles.characterCounter}>
                <span
                  className={`${styles.counter} ${
                    postText.length >= MAX_LENGTH ? styles.error : ""
                  }`}
                >
                  {/* Dinamik karakter sayacı */}
                  {postText.length}/{MAX_LENGTH}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ARKA PLAN EFEKTLERİ ===== */}
        <div className={styles.backgroundEffects}>
          <div className={styles.gradientCircle1}></div>
          <div className={styles.gradientCircle2}></div>
        </div>
      </div>
    </div>
  );
};

export default FeelingsAddDemo;