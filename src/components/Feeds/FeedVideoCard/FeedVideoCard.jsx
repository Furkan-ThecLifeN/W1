import React, { useState, useEffect } from "react";
import { MdMore } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import ActionControls from "../../actions/ActionControls";
import { defaultGetAuthToken } from "../../actions/api";
import FollowButton from "../../FollowButton/FollowButton";
import { useAuth } from "../../../context/AuthProvider";
import styles from "./FeedVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import DescriptionModal from "../../DescriptionModal/DescriptionModal";
import PostOptionsCard from "../../PostOptionsCard/PostOptionsCard";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getYouTubeEmbedUrl = (url) => {
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

const TRUNCATE_LIMIT = 150;

export default function PostVideoCard({ data, followStatus = "none", onFollowStatusChange }) {
    const [doubleTap, setDoubleTap] = useState(false);
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const videoSrc = data?.mediaUrl;
    const description = data?.caption || data?.content || "Açıklama yok.";
    const username = data?.username || data?.displayName || "Anonim Kullanıcı";
    const userProfileImage = data?.userProfileImage || data?.photoURL || "https://i.pravatar.cc/48";
    const isOwnPost = currentUser?.uid === data?.uid;

    const needsTruncation = description.length > TRUNCATE_LIMIT;
    const truncatedDescription = needsTruncation
        ? description.substring(0, TRUNCATE_LIMIT).trim() + "..."
        : description;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", checkMobile);
        checkMobile();
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleDoubleClick = () => {
        setDoubleTap(true);
        setTimeout(() => setDoubleTap(false), 1000);
    };

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
            const res = await fetch(`${BASE_URL}/api/feeds/${data.id}/disable-comments`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Yorumlar kapatılamadı");
            alert("Yorumlar kapatıldı");
            setShowOptions(false);
        } catch (e) {
            console.error(e);
            alert("Yorumlar kapatılamadı");
        }
    };

    const handleEnableComments = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/feeds/${data.id}/enable-comments`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Yorumlar açılamadı");
            alert("Yorumlar açıldı");
            setShowOptions(false);
        } catch (e) {
            console.error(e);
            alert("Yorumlar açılamadı");
        }
    };

    const handleReport = async (reason = "Uygunsuz içerik") => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: data.id,
                    reportedUserId: data.uid,
                    reason,
                }),
            });
            if (!res.ok) throw new Error("Rapor gönderilemedi");
            alert("Rapor gönderildi");
            setShowOptions(false);
        } catch (e) {
            console.error(e);
            alert("Rapor gönderilemedi");
        }
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
    if (!embedUrl) return null;

    return (
        <div className={styles.container}>
            <div className={styles.videoCard}>
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

                <div className={styles.infoCard}>
                    <div className={styles.userInfo}>
                        <img src={userProfileImage} alt={username} className={styles.userAvatar} />
                        <div className={styles.userInfoText}>
                            <span className={styles.userName}>{username}</span>
                            <div
                                className={`${styles.description} ${
                                    needsTruncation ? styles.clickableDescription : ""
                                }`}
                                onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
                            >
                                {truncatedDescription}
                                {needsTruncation && <span className={styles.readMore}>Daha Fazla</span>}
                            </div>
                        </div>
                        {!isOwnPost && (
                            <FollowButton
                                targetUid={data.uid}
                                isTargetPrivate={data.isPrivate || false}
                                initialFollowStatus={followStatus}
                                onFollowStatusChange={(newStatus) =>
                                    onFollowStatusChange?.(newStatus, data.uid)
                                }
                                className={styles.followButton}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.actionButtons}>
                {renderActionControls()}

                <div className={styles.optionsContainer}>
                    <MdMore className={styles.moreIcon} onClick={() => setShowOptions(!showOptions)} />
                    {showOptions && (
                        <PostOptionsCard
                            isOwner={isOwnPost}
                            postId={data.id}
                            postOwnerId={data.uid}
                            commentsDisabled={data.commentsDisabled || false}
                            onDelete={handleDeletePost}
                            onDisableComments={handleDisableComments}
                            onEnableComments={handleEnableComments}
                            onReport={handleReport}
                            position="right"
                        />
                    )}
                </div>
            </div>

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
