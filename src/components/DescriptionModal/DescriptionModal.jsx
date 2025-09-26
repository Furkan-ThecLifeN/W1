import React from 'react';
import ReactDOM from 'react-dom';
import styles from './DescriptionModal.module.css'; // Modal CSS'i
import { FiX } from 'react-icons/fi';
import FollowButton from "../FollowButton/FollowButton"; // FollowButton'u kullanmak için

// ✅ MODAL BİLEŞENİ
export default function DescriptionModal({ data, onClose, followStatus, onFollowStatusChange }) {
    if (!data) return null;

    const username = data?.username || data?.displayName || "Anonim Kullanıcı";
    const userProfileImage = data?.userProfileImage || data?.photoURL || "https://i.pravatar.cc/48";
    const fullDescription = data?.caption || data?.content || "Açıklama yok.";
    // isOwnPost için PostVideoCard'dan currentUser'ı geçirdik
    const isOwnPost = data.currentUser?.uid === data?.uid; 

    // Modal'ı body'ye portal olarak render et
    return ReactDOM.createPortal(
        // Overlay'e tıklandığında kapanma
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Modal içeriğine tıklandığında kapanmayı engelle */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button className={styles.closeButton} onClick={onClose}>
                    <FiX size={24} />
                </button>

                {/* Kullanıcı Bilgisi Kısmı */}
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
                    </div>
                    {/* FollowButton */}
                    {!isOwnPost && data.uid && (
                        <FollowButton
                            targetUid={data.uid}
                            isTargetPrivate={data.isPrivate || false}
                            initialFollowStatus={followStatus}
                            onFollowStatusChange={newStatus => onFollowStatusChange?.(newStatus, data.uid)}
                            className={styles.followButton}
                        />
                    )}
                </div>

                {/* Tam Açıklama Metni */}
                <div className={styles.fullDescriptionContainer}>
                    <p className={styles.fullDescriptionText}>{fullDescription}</p>
                </div>

            </div>
        </div>,
        document.body
    );
}