// components/PostOptionsCard/PostOptionsCard.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom"; // 1. ADIM: ReactDOM'u import et
import styles from "./PostOptionsCard.module.css";
import ReportModal from "../ReportModal/ReportModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { FiTrash2, FiMessageCircle, FiFlag } from "react-icons/fi";

const PostOptionsCard = ({
  isOwner,
  postId,
  postOwnerId,
  commentsDisabled,
  onDelete,
  onDisableComments,
  onEnableComments,
}) => {
  // Bu state yönetimi aynı kalıyor
  const [modalType, setModalType] = useState(null);

  // Bu fonksiyonlar aynı kalıyor
  const handleDeleteConfirm = () => {
    onDelete();
    setModalType(null); // Modalı kapat
  };

  const handleCommentConfirm = () => {
    if (commentsDisabled) {
      onEnableComments();
    } else {
      onDisableComments();
    }
    setModalType(null); // Modalı kapat
  };

  return (
    // 2. ADIM: Bileşeni bir React Fragment (<> ... </>) ile sarmala
    <>
      <div className={styles.card}>
        {isOwner && (
          <>
            <button
              className={styles.deleteButton}
              onClick={() => setModalType("delete")}
            >
              <FiTrash2 className={styles.icon} />
              <span>Sil</span>
            </button>
            {commentsDisabled ? (
              <button
                className={styles.enableCommentsButton}
                onClick={() => setModalType("comments")}
              >
                <FiMessageCircle className={styles.icon} />
                <span>Yorumları Aç</span>
              </button>
            ) : (
              <button
                className={styles.disableCommentsButton}
                onClick={() => setModalType("comments")}
              >
                <FiMessageCircle className={styles.icon} />
                <span>Yorumları Kapat</span>
              </button>
            )}
          </>
        )}
        <button
          className={styles.reportButton}
          onClick={() => setModalType("report")}
        >
          <FiFlag className={styles.icon} />
          <span>Şikayet Et</span>
        </button>
        
        {/* Modallar kartın içinden render edilmeyecek */}
      </div>

      {/* 3. ADIM: Tüm modalları ReactDOM.createPortal ile sar.
        Modallar artık .card div'inin içinde değil, 
        doğrudan document.body'nin içinde render edilecek.
      */}
      {ReactDOM.createPortal(
        <>
          {/* 1. Rapor Modalı */}
          {modalType === "report" && (
            <ReportModal
              postId={postId}
              reportedUserId={postOwnerId}
              onClose={() => setModalType(null)}
            />
          )}

          {/* 2. Silme Onay Modalı */}
          <ConfirmationModal
            show={modalType === "delete"} // Bu modal 'show' prop'unu kendi yönetiyor
            onClose={() => setModalType(null)}
            onConfirm={handleDeleteConfirm}
            title="Gönderiyi Sil"
            message="Bu gönderiyi kalıcı olarak silmek istediğinden emin misin? Bu işlem geri alınamaz."
            confirmText="Sil"
            confirmType="danger"
          />

          {/* 3. Yorum Aç/Kapat Onay Modalı */}
          <ConfirmationModal
            show={modalType === "comments"} // Bu modal 'show' prop'unu kendi yönetiyor
            onClose={() => setModalType(null)}
            onConfirm={handleCommentConfirm}
            title={commentsDisabled ? "Yorumları Aç" : "Yorumları Kapat"}
            message={
              commentsDisabled
                ? "Bu gönderi için yorum yapmayı açmak istediğinden emin misin?"
                : "Bu gönderi için yorum yapmayı kapatmak istediğinden emin misin?"
            }
            confirmText={commentsDisabled ? "Aç" : "Kapat"}
          />
        </>,
        document.body // Hedef olarak body'yi göster
      )}
    </>
  );
};

export default PostOptionsCard;