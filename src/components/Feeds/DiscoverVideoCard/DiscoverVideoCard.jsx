import React, { useState, useEffect } from "react";
// Sadece tasarım amaçlı ikonlar korundu
import { FaEllipsisV, FaHeart, FaCommentAlt, FaShare } from "react-icons/fa"; 
// Harici bileşenler ve hook'lar devre dışı bırakıldı:
// import ActionControls from "../../actions/ActionControls"; 
// import { defaultGetAuthToken } from "../../actions/api";
// import FollowButton from "../../FollowButton/FollowButton";
// import { useAuth } from "../../../context/AuthProvider";
import styles from "./DiscoverVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";
// import DescriptionModal from "../../DescriptionModal/DescriptionModal";
// import PostOptionsCard from "../../PostOptionsCard/PostOptionsCard";

// Mock Data - Tasarımı görebilmek için zorunlu mock veri
const mockVideoData = {
    id: "2",
    type: "video",
    title: "SCARECAM Pranks Reaction 2025 #33 | Funny Scare Pranks",
    // Test için bir YouTube URL'si
    mediaUrl: "https://www.youtube.com/watch?v=O07prvg0o3E", 
    thumbnail: "https://img.youtube.com/vi/O07prvg0o3E/0.jpg",
    caption: "Bu yeni video formatı ile çok eğleneceksiniz! Korku ve komedinin birleştiği anlar. Uzun bir açıklama metni deniyoruz. Bakalım ne kadar uzun olabilir? Bu bir test açıklamasıdır. Bu bir test açıklamasıdır. Bu bir test açıklamasıdır. Bu bir test açıklamasıdır. #prank #komik #shorts #2025",
    duration: "0:45",
    tags: ["prank", "komik", "shorts", "2025"],
    seen: false,
    date: "2025-06-15T14:00:00Z",
    uid: "post_owner_123", 
    username: "DenemeKullanici98",
    userProfileImage: "https://i.pravatar.cc/150?img=1",
    isPrivate: false,
    commentsDisabled: false,
};

// Mock Auth - Kullanıcı bilgilerini simüle etmek için
const mockCurrentUser = {
    uid: "current_user_456", 
    username: "MevcutKullanici",
    photoURL: "https://i.pravatar.cc/150?img=3",
};

// BASE_URL korundu
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// YouTube URL'sini embed edilebilir formata dönüştürme fonksiyonu korundu
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
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const DESCRIPTION_CHAR_LIMIT = 150;

export default function DiscoverVideoCard({
    data = mockVideoData, // Mock veri kullanıldı
    followStatus = "none",
    onFollowStatusChange,
}) {
    const [doubleTapEffect, setDoubleTapEffect] = useState(false);
    // const { currentUser } = useAuth(); // Devre dışı bırakıldı
    const currentUser = mockCurrentUser; // Mock kullanıcı atandı
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal state'i korundu
    const [showMenu, setShowMenu] = useState(false); // Menü state'i korundu

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
    };

    // Backend fonksiyonları korundu (ancak çağrılmayacaklar)
    const fetchAuthToken = async () => { /* ... */ };
    const handleRemovePost = async () => { /* ... */ };
    const handleRestrictComments = async () => { /* ... */ };
    const handleAllowComments = async () => { /* ... */ };
    const handleReportPost = async (reason = "Uygunsuz içerik") => { /* ... */ };

    // Placeholder: ActionControls yerine basit butonlar render edildi
    const renderVideoActionControls = (isDesktopLayout) => {
        const buttonSize = isDesktopLayout ? '55px' : '40px';
        const iconSize = isDesktopLayout ? 24 : 18;
        const fontSize = isDesktopLayout ? '12px' : '10px';

        return (
            <>
                <div style={{textAlign: 'center'}}>
                    <button className={styles.arrowButton} style={{width: buttonSize, height: buttonSize, backgroundColor: '#FF5733'}}
                        onClick={() => alert("Beğenme aksiyonu çalışacak.")}
                    >
                        <FaHeart size={iconSize} />
                    </button>
                    <div style={{fontSize: fontSize, marginTop: '5px', color: '#fff'}}>12.5K</div>
                </div>
                <div style={{textAlign: 'center'}}>
                    <button className={styles.arrowButton} style={{width: buttonSize, height: buttonSize, backgroundColor: '#337AFF'}}
                        onClick={() => alert("Yorum aksiyonu çalışacak.")}
                    >
                        <FaCommentAlt size={iconSize} />
                    </button>
                    <div style={{fontSize: fontSize, marginTop: '5px', color: '#fff'}}>456</div>
                </div>
                <div style={{textAlign: 'center'}}>
                    <button className={styles.arrowButton} style={{width: buttonSize, height: buttonSize, backgroundColor: '#17A2B8'}}
                        onClick={() => alert("Paylaşma aksiyonu çalışacak.")}
                    >
                        <FaShare size={iconSize} />
                    </button>
                    <div style={{fontSize: fontSize, marginTop: '5px', color: '#fff'}}>1.2K</div>
                </div>
            </>
        );
    };

    const embedLink = mediaSourceUrl ? getYouTubeEmbedLink(mediaSourceUrl) : null;
    
    if (!embedLink) return (
        <div className={styles.mainWrapper}>
            <div className={styles.contentLayout} style={{justifyContent: 'center', alignItems: 'center'}}>
                <div className={styles.errorText}>
                    Video linki geçersiz veya bulunamadı.
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
                                                ? () => { /* setIsModalVisible(true) */ alert("Daha Fazla Açıklama Modalı açılacak") }
                                                : undefined
                                        }
                                    >
                                        {descriptionSnippet}
                                        {needsToTruncate && (
                                            <span className={styles.readMoreText}>Daha Fazla</span>
                                        )}
                                    </div>
                                </div>
                                {/* FollowButton Yer Tutucu */}
                                {!isOwnerPost && (
                                    <button 
                                        className={styles.followUserButtonDesktop}
                                        onClick={() => alert(`@${profileUsername} takip ediliyor/takip isteği gönderiliyor...`)}
                                    >
                                        Takip Et
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* SAĞ KUTU: Kontrol Paneli (80px) */}
                    <div className={styles.controlsBox}>
                        <div className={styles.appLogoText}>W1</div>

                        {/* Aksiyon Kontrolleri Yer Tutucu */}
                        <div className={styles.actionZone}>
                            {renderVideoActionControls(true)}
                            
                            {/* Seçenekler Butonu Yer Tutucu */}
                            <div className={styles.optionsWrapper}>
                                <FaEllipsisV
                                    className={styles.optionsIcon}
                                    onClick={() => { setShowMenu(!showMenu); alert("PostOptionsCard menüsü açılacak.") }}
                                />
                                {/** showMenu && <PostOptionsCard ... /> */}
                            </div>
                        </div>

                        {/* Navigasyon Butonları */}
                        <div className={styles.scrollControls}>
                            <button className={styles.arrowButton} aria-label="Scroll Up" onClick={() => console.log('Yukarı kaydır')}>
                                <span className={styles.controlArrow}>&#9650;</span>
                            </button>
                            <button className={styles.arrowButton} aria-label="Scroll Down" onClick={() => console.log('Aşağı kaydır')}>
                                <span className={styles.controlArrow}>&#9660;</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/** isModalVisible && <DescriptionModal ... /> */}
            </div>
        );
    }

    /* ==========================================================
       RENDER KISMI: MOBİL GÖRÜNÜM (Kaynak bileşen ile aynı yapı)
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
                                        ? () => { /* setIsModalVisible(true) */ alert("Daha Fazla Açıklama Modalı açılacak") }
                                        : undefined
                                }
                            >
                                {descriptionSnippet}
                                {needsToTruncate && (
                                    <span className={styles.readMoreText}>Daha Fazla</span>
                                )}
                            </div>
                        </div>
                        {/* FollowButton Yer Tutucu */}
                        {!isOwnerPost && (
                            <button 
                                className={styles.followUserButton}
                                onClick={() => alert(`@${profileUsername} takip ediliyor/takip isteği gönderiliyor...`)}
                            >
                                Takip Et
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Controls (Mobil Üst Navigasyon) */}
            <div className={styles.sideControls}>
                {renderVideoActionControls(false)}

                <div className={styles.extraOptionsContainer}>
                    <FaEllipsisV
                        className={styles.optionsIcon}
                        onClick={() => { setShowMenu(!showMenu); alert("PostOptionsCard menüsü açılacak.") }}
                        style={{marginTop: 0, color: '#fff'}}
                    />
                    {/** showMenu && <PostOptionsCard ... /> */}
                </div>
            </div>

            {/** isModalVisible && <DescriptionModal ... /> */}
        </div>
    );
}