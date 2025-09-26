import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { MdMore } from "react-icons/md";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import PostOptionsCard from "../PostOptionsCard/PostOptionsCard"; // Yeni import
// ✅ YENİ: DescriptionModal'ı içe aktar
import DescriptionModal from "../DescriptionModal/DescriptionModal"; 

// Açıklama metni kısaltma limiti
const TRUNCATE_LIMIT = 100; 
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const PostCard = ({ data, followStatus = "none", onFollowStatusChange }) => {
    const [tokenError, setTokenError] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    // ✅ Açıklama modalı state'i
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Açıklama metni kısaltma mantığı
    const description = data.caption || "";
    const needsTruncation = description.length > TRUNCATE_LIMIT;
    const truncatedDescription = needsTruncation 
        ? description.substring(0, TRUNCATE_LIMIT).trim() + '...' 
        : description;

    const getToken = async () => {
        try {
            return await defaultGetAuthToken();
        } catch (e) {
            console.error("PostCard: Token alma hatası ->", e.message);
            setTokenError(true);
            return null;
        }
    };

    const isOwnPost = currentUser?.uid === data?.uid;

    const renderActionControls = () => {
        if (!data?.id) return null;
        return (
            <ActionControls
                targetType="post"
                targetId={data.id}
                getAuthToken={getToken}
                commentsDisabled={data.commentsDisabled}
            />
        );
    };

    // ... Gönderi yönetimi fonksiyonları (handleDeletePost, handleDisableComments, handleEnableComments) ...
    // ... Bu fonksiyonlar önceki kodunuzla aynıdır ve kesikli çizgilerle gösterilmiştir. ...

    const handleDeletePost = async () => { /* ... */ };
    const handleDisableComments = async () => { /* ... */ };
    const handleEnableComments = async () => { /* ... */ };


    useEffect(() => {
        if (!data) return console.warn("PostCard: data yok!");
        if (!data.id) console.warn("PostCard: post id eksik!");
        if (!data.caption) console.warn("PostCard: caption eksik!");
        if (!data.imageUrls?.[0]) console.warn("PostCard: image yok!");
    }, [data]);

    if (!data) return null;

    return (
        <>
            {/* Desktop View */}
            <div className={`${styles.post_card} ${styles.desktop}`}>
                {data.imageUrls?.[0] && (
                    <img
                        src={data.imageUrls[0]}
                        alt="Post"
                        className={styles.post_image}
                    />
                )}

                <div className={styles.post_overlay}>
                    <div className={styles.post_header}>
                        {/* ... User Info ve Actions kısmı (değişmedi) ... */}
                        <div className={styles.user_info}>
                            <div className={styles.avatar_widget}>
                                <img
                                    src={data.photoURL || ""}
                                    alt="avatar"
                                    className={styles.avatar}
                                    onClick={() => navigate(`/profile/${data.username}`)}
                                />
                            </div>
                            <span className={styles.username}>
                                {data.displayName || "Bilinmeyen Kullanıcı"}
                            </span>
                        </div>
                        <div className={styles.actions}>
                            {!isOwnPost && (
                                <FollowButton
                                    targetUid={data.uid}
                                    isTargetPrivate={data.isPrivate}
                                    initialFollowStatus={followStatus}
                                    onFollowStatusChange={(newStatus) =>
                                        onFollowStatusChange?.(newStatus, data.uid)
                                    }
                                />
                            )}
                            <div className={styles.optionsContainer}>
                                <MdMore
                                    className={styles.more_icon}
                                    onClick={() => setShowOptions(!showOptions)}
                                />

                                {showOptions && (
                                    <PostOptionsCard
                                        isOwner={isOwnPost}
                                        postId={data.id}
                                        postOwnerId={data.uid}
                                        commentsDisabled={data.commentsDisabled}
                                        onDelete={handleDeletePost}
                                        onDisableComments={handleDisableComments}
                                        onEnableComments={handleEnableComments}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.post_footer}>
                        {/* ✅ Desktop Açıklama Alanı - Tümü Tıklanabilir */}
                        <p 
                            className={`${styles.post_text} ${needsTruncation ? styles.clickableDescription : ''}`}
                            onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
                        >
                            {truncatedDescription}
                            {needsTruncation && (
                                <span className={styles.readMore}>Daha Fazla</span>
                            )}
                        </p>
                        {renderActionControls()}

                        {tokenError && (
                            <div style={{ color: "red", fontSize: "12px" }}>
                                Token alınamadı, ActionControls çalışmayabilir!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
                <div className={styles.post_header_mobile}>
                    {/* ... Header (değişmedi) ... */}
                    <div className={styles.user_info}>
                        <div className={styles.avatar_widget}>
                            <img
                                src={data.photoURL || ""}
                                alt="avatar"
                                className={styles.avatar}
                                onClick={() => navigate(`/profile/${data.username}`)}
                            />
                        </div>
                        <span className={styles.username}>
                            {data.displayName || "Bilinmeyen Kullanıcı"}
                        </span>
                    </div>
                    <div className={styles.actions}>
                        {!isOwnPost && (
                            <FollowButton
                                targetUid={data.uid}
                                isTargetPrivate={data.isPrivate}
                                initialFollowStatus={followStatus}
                                onFollowStatusChange={(newStatus) =>
                                    onFollowStatusChange?.(newStatus, data.uid)
                                }
                            />
                        )}
                        <div className={styles.optionsContainer}>
                            <MdMore
                                className={styles.more_icon}
                                onClick={() => setShowOptions(!showOptions)}
                            />
                            {showOptions && (
                                <PostOptionsCard
                                    isOwner={isOwnPost}
                                    postId={data.id}
                                    postOwnerId={data.uid}
                                    onDelete={handleDeletePost}
                                    onDisableComments={handleDisableComments}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {data.imageUrls?.[0] && (
                    <img
                        src={data.imageUrls[0]}
                        alt="Post"
                        className={styles.post_image_mobile}
                    />
                )}

                <div className={styles.post_footer_mobile}>
                    {/* ✅ Mobile Açıklama Alanı - Tümü Tıklanabilir */}
                    <p 
                        className={`${styles.post_text} ${needsTruncation ? styles.clickableDescription : ''}`}
                        onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
                    >
                        {truncatedDescription}
                        {needsTruncation && (
                            <span className={styles.readMore}>Daha Fazla</span>
                        )}
                    </p>
                    {renderActionControls()}
                </div>
            </div>

            {/* ✅ Açıklama Modalını render et */}
            {isDescriptionModalOpen && (
                <DescriptionModal
                    data={{ ...data, currentUser, caption: description }} 
                    onClose={() => setIsDescriptionModalOpen(false)}
                    followStatus={followStatus}
                    onFollowStatusChange={onFollowStatusChange}
                />
            )}
        </>
    );
};

export default PostCard;