import React, { useState, useEffect } from "react";
// ✅ Gerekli Ikonlar
import {
    FiMoreVertical,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
// ✅ Backend ve Aksiyon Kontrol importları
import ActionControls from "../../actions/ActionControls";
import { defaultGetAuthToken } from "../../actions/api";
import FollowButton from "../../FollowButton/FollowButton";
import { useAuth } from "../../../context/AuthProvider";
// Diğer Importlar
import styles from "./FeedVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";
// ✅ Açıklama Modalını İçe Aktar
import DescriptionModal from "../../DescriptionModal/DescriptionModal";

/**
 * Gelen URL'yi (short, youtu.be veya embed) alıp, oynatılabilir bir embed URL'ye dönüştürür.
 */
const getYouTubeEmbedUrl = (url) => {
    let videoId = null;

    if (url.includes("youtube.com/embed/")) {
        const embedMatch = url.match(/embed\/([^?]+)/);
        if (embedMatch && embedMatch[1]) {
            videoId = embedMatch[1].split("?")[0];
        }
    } else {
        const videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            videoId = videoIdMatch[1];
        }
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

const TRUNCATE_LIMIT = 150; 

export default function PostVideoCard({
    data,
    followStatus = "none",
    onFollowStatusChange
}) {
    const [doubleTap, setDoubleTap] = useState(false);
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false); 

    // Data'dan gerekli bilgileri çek
    const videoSrc = data?.mediaUrl;
    const description = data?.caption || data?.content || "Açıklama yok.";
    const username = data?.username || data?.displayName || "Anonim Kullanıcı";
    const userProfileImage = data?.userProfileImage || data?.photoURL || "https://i.pravatar.cc/48";
    const isOwnPost = currentUser?.uid === data?.uid;

    // Açıklama kısaltma mantığı
    const needsTruncation = description.length > TRUNCATE_LIMIT;
    const truncatedDescription = needsTruncation 
        ? description.substring(0, TRUNCATE_LIMIT).trim() + '...' 
        : description;


    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', checkMobile);
        checkMobile(); 
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    const handleDoubleClick = () => {
        setDoubleTap(true);
        setTimeout(() => setDoubleTap(false), 1000);
    };

    const renderActionControls = () => {
        if (!data?.id || !data?.uid) return null;

        const currentTargetType = isMobile ? "post" : "feed";

        return (
            <ActionControls
                targetType={currentTargetType} 
                targetId={data.id}
                postOwnerUid={data.uid}
                commentsDisabled={data.commentsDisabled || false}
                getAuthToken={defaultGetAuthToken}
            />
        );
    };

    const embedUrl = videoSrc ? getYouTubeEmbedUrl(videoSrc) : null;
    if (!embedUrl) {
        console.error("Geçersiz video URL'si:", videoSrc);
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.videoCard}>
                {/* Video Alanı */}
                <div className={styles.videoWrapper} onDoubleClick={handleDoubleClick}>
                    <iframe
                        className={styles.videoFrame}
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>

                    <AnimatePresence>
                        {doubleTap && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className={styles.heartAnimation}
                            >
                                <FaHeart />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Kullanıcı Bilgisi */}
                <div className={styles.infoCard}>
                    <div className={styles.userInfo}>
                        <img
                            src={userProfileImage}
                            alt={username}
                            className={styles.userAvatar}
                        />
                        <div className={styles.userInfoText}>
                            <span className={styles.userName}>
                                {username}
                            </span>
                            {/* ✅ GÜNCEL KISIM: Modal'ı, sadece metin kısaltılmışsa 
                                tüm açıklama alanına tıklandığında açar.
                            */}
                            <div 
                                // Tıklanabilirse 'clickableDescription' sınıfını ekle
                                className={`${styles.description} ${needsTruncation ? styles.clickableDescription : ''}`}
                                // Sadece kısaltma gerekiyorsa onClick ekle
                                onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
                            >
                                {truncatedDescription}
                                {needsTruncation && (
                                    <span 
                                        className={styles.readMore} 
                                    >
                                        Daha Fazla
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* FollowButton'u doğru propslarla kullan */}
                        {!isOwnPost && (
                            <FollowButton
                                targetUid={data.uid}
                                isTargetPrivate={data.isPrivate || false}
                                initialFollowStatus={followStatus}
                                onFollowStatusChange={newStatus => onFollowStatusChange?.(newStatus, data.uid)}
                                className={styles.followButton}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Aksiyon Butonları Konteyneri */}
            <div className={styles.actionButtons}>
                {renderActionControls()}

                {!isMobile && (
                    <div className={styles.iconWrapper}>
                        <FiMoreVertical className={styles.iconItem} />
                    </div>
                )}
            </div>
            
            {/* Açıklama Modalını render et */}
            {isDescriptionModalOpen && (
                <DescriptionModal
                    data={{ ...data, currentUser }} 
                    onClose={() => setIsDescriptionModalOpen(false)}
                    followStatus={followStatus}
                    onFollowStatusChange={onFollowStatusChange}
                />
            )}
        </div>
    );
}