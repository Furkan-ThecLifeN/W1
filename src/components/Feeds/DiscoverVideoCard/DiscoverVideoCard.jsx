import React, { useState, useEffect } from "react";
import { MdMore } from "react-icons/md"; // Seçenekler ikonu için
import { FaHeart, FaEllipsisV } from "react-icons/fa"; // Beğeni ve diğer ikonlar için
// ✅ Backend bağlantılarını ve bileşenlerini içe aktar
import ActionControls from "../../actions/ActionControls";
import { defaultGetAuthToken } from "../../actions/api";
import FollowButton from "../../FollowButton/FollowButton";
import { useAuth } from "../../../context/AuthProvider";
import styles from "./DiscoverVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import DescriptionModal from "../../DescriptionModal/DescriptionModal";
import PostOptionsCard from "../../PostOptionsCard/PostOptionsCard";

// Mock Data tamamen kaldırıldı, sadece structure korundu
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// YouTube URL'sini embed edilebilir formata dönüştürme fonksiyonu
const getYouTubeEmbedLink = (url) => {
    let videoId = null;
    if (url.includes("youtube.com/embed/")) {
        const embedMatch = url.match(/embed\/([^?]+)/);
        if (embedMatch && embedMatch[1]) videoId = embedMatch[1].split("?")[0];
    } else {
        const videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
        if (videoIdMatch && videoIdMatch[1]) videoId = videoIdMatch[1];
    }
    if (!videoId) return null;
    const params = new URLSearchParams({
        autoplay: 1,
        muted: 0,
        loop: 1,
        controls: 1,
        playlist: videoId,
        modestbranding: 1,
    });
    // Video her yüklendiğinde autoplay'i etkinleştirmek için bir parametre ekleyebiliriz.
    // Ancak iframe içinde autoplay her zaman garanti edilmez.
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const DESCRIPTION_CHAR_LIMIT = 150;

export default function DiscoverVideoCard({
    data, // Artık mock veri yok, Firebase'den gelen 'data' kullanılır
    followStatus = "none",
    onFollowStatusChange,
    // ⭐️ Üst bileşenden (HybridExploreFeed) gelen navigasyon fonksiyonları ve durumları
    onNextPost, 
    onPrevPost,
    isFirstItem, // İlk eleman mı? (Geri gitme butonunu devre dışı bırakmak için)
    isLastItem, // Son eleman mı? (İleri gitme butonunu devre dışı bırakmak/yükleniyor göstermek için)
}) {
    const [doubleTapEffect, setDoubleTapEffect] = useState(false);
    const { currentUser } = useAuth(); // ✅ useAuth hook'u etkinleştirildi
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
    const [isModalVisible, setIsModalVisible] = useState(false); // DescriptionModal state'i
    const [showMenu, setShowMenu] = useState(false); // PostOptionsCard state'i

    const mediaSourceUrl = data?.mediaUrl;
    const postDescription = data?.caption || data?.content || "Açıklama yok.";
    const profileUsername = data?.username || data?.displayName || "Anonim Kullanıcı";
    const userImageUrl = data?.userProfileImage || data?.photoURL || "https://i.pravatar.cc/150?img=1";
    const isOwnerPost = currentUser?.uid === data?.uid;

    const needsToTruncate = postDescription.length > DESCRIPTION_CHAR_LIMIT;
    const descriptionSnippet = needsToTruncate
        ? postDescription.substring(0, DESCRIPTION_CHAR_LIMIT).trim() + "..."
        : postDescription;

    useEffect(() => {
        const checkViewportSize = () => setIsMobileView(window.innerWidth <= 1024);
        window.addEventListener("resize", checkViewportSize);
        checkViewportSize();
        return () => window.removeEventListener("resize", checkViewportSize);
    }, []);

    const handleMediaDoubleClick = () => {
        setDoubleTapEffect(true);
        setTimeout(() => setDoubleTapEffect(false), 1000);
        // Burada ayrıca beğeni aksiyonu tetiklenmelidir. (ActionControls içinde yönetilir)
    };

    // PostOptionsCard için gerekli backend fonksiyonları (Değiştirilmedi)
    const getToken = async () => {
        try {
          return await defaultGetAuthToken();
        } catch (e) {
          console.error("Token alma hatası ->", e);
          return null;
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/feeds/${data.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Silme işlemi başarısız");
            alert("Gönderi silindi.");
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Silme işlemi başarısız");
        }
    };

    const handleDisableComments = async () => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${BASE_URL}/api/feeds/${data.id}/disable-comments`,
                { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Yorumlar kapatılamadı");
            alert("Yorumlar kapatıldı");
            setShowMenu(false);
        } catch (e) {
            console.error(e);
            alert("Yorumlar kapatılamadı");
        }
    };

    const handleEnableComments = async () => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${BASE_URL}/api/feeds/${data.id}/enable-comments`,
                { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Yorumlar açılamadı");
            alert("Yorumlar açıldı");
            setShowMenu(false);
        } catch (e) {
            console.error(e);
            alert("Yorumlar açılamadı");
        }
    };

    const handleReportPost = async (reason = "Uygunsuz içerik") => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    postId: data.id,
                    reportedUserId: data.uid,
                    reason,
                }),
            });
            if (!res.ok) throw new Error("Rapor gönderilemedi");
            alert("Rapor gönderildi");
            setShowMenu(false);
        } catch (e) {
            console.error(e);
            alert("Rapor gönderilemedi");
        }
    };

    // ✅ Düzeltme: Mobil görünümde forceLayout'u 'horizontal' yap
    const renderVideoActionControls = (isDesktopLayout) => {
        if (!data?.id || !data?.uid) return null;
        const backendType = "feed";

        return (
            <ActionControls
                targetType={backendType}
                targetId={data.id}
                postOwnerUid={data.uid}
                commentsDisabled={data.commentsDisabled || false}
                getAuthToken={defaultGetAuthToken}
                // ✅ forceLayout prop'u şimdi masaüstü için dikey, mobil için yatay olacak
                forceLayout={isDesktopLayout ? "vertical" : "horizontal"} 
            />
        );
    };

    const embedLink = mediaSourceUrl ? getYouTubeEmbedLink(mediaSourceUrl) : null;
    
    if (!data || !embedLink) return (
        <div className={styles.mainWrapper}>
            <div className={styles.contentLayout} style={{justifyContent: 'center', alignItems: 'center'}}>
                <div className={styles.errorText}>
                    Video linki geçersiz veya veri bulunamadı.
                </div>
            </div>
        </div>
    );


    /* ==========================================================
      RENDER KISMI: Masaüstü GÖRÜNÜM
      ========================================================== */
    if (!isMobileView) {
        return (
            <div className={styles.mainWrapper}>
                <div className={styles.contentLayout}>
                    
                    {/* SOL KUTU: Video ve Bilgi Kartı */}
                    <div className={styles.videoAndInfoBox}>
                        <div className={styles.videoPlayerOnly} onDoubleClick={handleMediaDoubleClick}>
                            <iframe
                                className={styles.mediaFrame}
                                src={embedLink}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <AnimatePresence>
                                {doubleTapEffect && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        className={styles.likePulse}
                                    >
                                        <FaHeart />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Alt Bilgi Kartı */}
                        <div className={styles.detailsCard}>
                            <div className={styles.userDetailsDesktop}>
                                <img
                                    src={userImageUrl}
                                    alt={profileUsername}
                                    className={styles.userPicDesktop}
                                />
                                <div className={styles.userTextContent}>
                                    <span className={styles.displayName}>{profileUsername}</span>
                                    <div
                                        className={`${styles.postDesc} ${
                                            needsToTruncate ? styles.clickableDesc : ""
                                        }`}
                                        onClick={
                                            needsToTruncate
                                                ? () => setIsModalVisible(true) // Modal açıldı
                                                : undefined
                                        }
                                    >
                                        {descriptionSnippet}
                                        {needsToTruncate && (
                                            <span className={styles.readMoreText}>Daha Fazla</span>
                                        )}
                                    </div>
                                </div>
                                {/* FollowButton bileşeni entegre edildi */}
                                {!isOwnerPost && (
                                    <FollowButton 
                                        targetUid={data.uid}
                                        isTargetPrivate={data.isPrivate || false}
                                        initialFollowStatus={followStatus}
                                        onFollowStatusChange={(newStatus) => onFollowStatusChange?.(newStatus, data.uid)}
                                        className={styles.followUserButtonDesktop}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* SAĞ KUTU: Kontrol Paneli (80px) */}
                    <div className={styles.controlsBox}>
                        <div className={styles.appLogoText}>W1</div>

                        {/* Aksiyon Kontrolleri */}
                        <div className={styles.actionZone}>
                            {renderVideoActionControls(true)} 
                            
                            {/* Seçenekler Butonu */}
                            <div className={styles.optionsWrapper}>
                                <FaEllipsisV
                                    className={styles.optionsIcon}
                                    onClick={() => setShowMenu(!showMenu)} // State ile PostOptionsCard açıldı
                                />
                                {showMenu && (
                                    <PostOptionsCard
                                        isOwner={isOwnerPost}
                                        postId={data.id}
                                        postOwnerId={data.uid}
                                        commentsDisabled={data.commentsDisabled || false}
                                        onDelete={handleDeletePost}
                                        onDisableComments={handleDisableComments}
                                        onEnableComments={handleEnableComments}
                                        onReport={handleReportPost}
                                        position="right"
                                    />
                                )}
                            </div>
                        </div>

                        {/* ⭐️ Navigasyon Butonları (Butona Tıklama Mantığı Doğru) ⭐️ */}
                        <div className={styles.scrollControls}>
                            <button 
                                className={styles.arrowButton} 
                                aria-label="Önceki İçerik" 
                                onClick={onPrevPost} // Üst bileşenden gelen Prev handler
                                disabled={isFirstItem} // İlk elemansa devre dışı
                            >
                                <span className={styles.controlArrow}>&#9650;</span>
                            </button>
                            <button 
                                className={styles.arrowButton} 
                                aria-label="Sonraki İçerik" 
                                onClick={onNextPost} // Üst bileşenden gelen Next handler
                                disabled={isLastItem} // Son elemansa devre dışı (Yeni içerik yükleme mantığı HybridExploreFeed'de)
                            >
                                <span className={styles.controlArrow}>&#9660;</span>
                            </button>
                        </div>
                    </div>
                </div>

                {isModalVisible && (
                    <DescriptionModal
                        data={{ ...data, currentUser }}
                        onClose={() => setIsModalVisible(false)}
                        followStatus={followStatus}
                        onFollowStatusChange={onFollowStatusChange}
                    />
                )}
            </div>
        );
    }

    /* ==========================================================
      RENDER KISMI: MOBİL GÖRÜNÜM (Düzeltme: Action Controls yatay)
      ========================================================== */
    return (
        <div className={styles.mainWrapper} style={{maxWidth: '450px', padding: 0}}>
            <div className={styles.videoUnit}>
                <div className={styles.playerArea} onDoubleClick={handleMediaDoubleClick}>
                    <iframe
                        className={styles.mediaFrame}
                        src={embedLink}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    <AnimatePresence>
                        {doubleTapEffect && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className={styles.likePulse}
                            >
                                <FaHeart />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.bottomInfoBar}>
                    <div className={styles.userDetails}>
                        <img
                            src={userImageUrl}
                            alt={profileUsername}
                            className={styles.userPic}
                        />
                        <div className={styles.userTextContent}>
                            <span className={styles.displayName}>{profileUsername}</span>
                            <div
                                className={`${styles.postDesc} ${
                                    needsToTruncate ? styles.clickableDesc : ""
                                }`}
                                onClick={
                                    needsToTruncate
                                        ? () => setIsModalVisible(true)
                                        : undefined
                                }
                            >
                                {descriptionSnippet}
                                {needsToTruncate && (
                                    <span className={styles.readMoreText}>Daha Fazla</span>
                                )}
                            </div>
                        </div>
                        {/* FollowButton bileşeni entegre edildi */}
                        {!isOwnerPost && (
                            <FollowButton 
                                targetUid={data.uid}
                                isTargetPrivate={data.isPrivate || false}
                                initialFollowStatus={followStatus}
                                onFollowStatusChange={(newStatus) => onFollowStatusChange?.(newStatus, data.uid)}
                                className={styles.followUserButton}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Side Controls (Mobil Aksiyon Butonları) */}
            <div className={styles.sideControls}>
                {/* ✅ forceLayout='horizontal' prop'u ile ActionControls yatay render edilir */}
                {renderVideoActionControls(false)}
                <div className={styles.extraOptionsContainer}>
                    <MdMore 
                        className={styles.optionsIcon}
                        onClick={() => setShowMenu(!showMenu)}
                        style={{marginTop: 0, color: '#fff'}}
                    />
                    {showMenu && (
                        <PostOptionsCard
                            isOwner={isOwnerPost}
                            postId={data.id}
                            postOwnerId={data.uid}
                            commentsDisabled={data.commentsDisabled || false}
                            onDelete={handleDeletePost}
                            onDisableComments={handleDisableComments}
                            onEnableComments={handleEnableComments}
                            onReport={handleReportPost}
                            position="left"
                        />
                    )}
                </div>
            </div>

            {isModalVisible && (
                <DescriptionModal
                    data={{ ...data, currentUser }}
                    onClose={() => setIsModalVisible(false)}
                    followStatus={followStatus}
                    onFollowStatusChange={onFollowStatusChange}
                />
            )}
        </div>
    );
}