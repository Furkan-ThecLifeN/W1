import React, { useState } from "react";
import { FaCamera, FaGamepad, FaUsers, FaBriefcase, FaGraduationCap } from "react-icons/fa";
import { getAuth } from "firebase/auth"; 
import styles from "./CreateServerModal.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const CreateServerModal = ({ onClose, onCreate }) => {
  const [serverName, setServerName] = useState("");
  const [category, setCategory] = useState("gaming");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleImageURL = (url) => {
    setImageUrl(url);
    if (url && url.trim() !== "") {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serverName || !rulesAccepted) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) throw new Error("Lütfen önce giriş yapın.");
      
      const token = await currentUser.getIdToken();

      const response = await fetch(`${API_URL}/api/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: serverName,
          category: category,
          icon: imagePreview || null,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sunucu oluşturulamadı.");
      }

      // Başarılı olduğunda parent'a (ServerSidebar) veriyi gönder
      if (onCreate) {
        onCreate(data);
      }
      
      // Modalı kapat
      onClose();

    } catch (err) {
      console.error("Sunucu kurma hatası:", err);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={!isLoading ? onClose : null}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* SOL PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.uploadWrapper}>
            <label className={styles.uploadBox}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className={styles.previewImg} />
              ) : (
                <>
                  <FaCamera className={styles.cameraIcon} />
                  <span className={styles.uploadText}>Fotoğraf URL</span>
                </>
              )}
            </label>
          </div>

          <input
            type="text"
            className={styles.input}
            placeholder="https://example.com/logo.png"
            value={imageUrl}
            onChange={(e) => handleImageURL(e.target.value)}
            disabled={isLoading}
            style={{ marginTop: "10px", width: "140px", fontSize: "0.8rem" }}
          />

          <h3 className={styles.leftTitle}>Kimlik Oluştur</h3>
          <p className={styles.leftDesc}>
            Sunucunun logosunu bu URL üzerinden belirleyebilirsin.
          </p>
        </div>

        {/* SAĞ PANEL */}
        <div className={styles.rightPanel}>
          
          <div className={styles.formHeader}>
            <span className={styles.stepTitle}>ADIM 1 / 1</span>
            <h2 className={styles.mainTitle}>Sunucu Detayları</h2>
          </div>

          <form id="createForm" onSubmit={handleSubmit} className={styles.formContent}>
            
            {errorMsg && (
              <div style={{ backgroundColor: "rgba(255, 80, 80, 0.1)", color: "#ff5050", padding: "10px", borderRadius: "5px", marginBottom: "10px", fontSize: "0.9rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>SUNUCU ADI</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Örn: Gece Oyuncuları" 
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                autoFocus
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>KATEGORİ</label>
              <div className={styles.categoryGrid}>
                {['gaming', 'community', 'work', 'study'].map((cat) => (
                  <div 
                    key={cat}
                    className={`${styles.catCard} ${category === cat ? styles.active : ''}`}
                    onClick={() => !isLoading && setCategory(cat)}
                    style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'default' : 'pointer' }}
                  >
                    {cat === 'gaming' && <FaGamepad className={styles.catIcon} />}
                    {cat === 'community' && <FaUsers className={styles.catIcon} />}
                    {cat === 'work' && <FaBriefcase className={styles.catIcon} />}
                    {cat === 'study' && <FaGraduationCap className={styles.catIcon} />}
                    <span className={styles.catName}>
                      {cat === 'gaming' ? 'Oyun' : cat === 'community' ? 'Topluluk' : cat === 'work' ? 'İş / Ofis' : 'Eğitim'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>TOPLULUK KURALLARI</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
               <span style={{ color: "#bbb", fontSize: "0.85rem", lineHeight: "1.4" }}>
                  Topluluk kurallarını, saygı ilkelerini kabul ediyorum ve sunucu içerisinde
                  davranış kurallarına uyacağımı ve uygulayacağımı onaylıyorum.
                </span>
              </div>
            </div>
          </form>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.btnCancel} disabled={isLoading}>
              Vazgeç
            </button>
            <button 
              type="submit" 
              form="createForm" 
              className={styles.btnCreate}
              disabled={!serverName || !rulesAccepted || isLoading}
            >
              {isLoading ? "Kuruluyor..." : "Sunucuyu Kur"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;