import React from "react";
import { IoMdClose } from "react-icons/io";
import { FiSend } from "react-icons/fi";
import styles from "../PostAdd.module.css";

const PostHeader = ({ onClose, onSubmit, hasContent }) => {
  return (
    <div className={styles.postFormHeader}>
      <button className={styles.closeButton} onClick={onClose}>
        <IoMdClose size={24} />
      </button>
      <h2 className={styles.formTitle}>Yeni Gönderi</h2>
      <button
        className={`${styles.postButton} ${hasContent ? styles.active : ""}`}
        onClick={onSubmit}
        disabled={!hasContent}
      >
        <FiSend size={18} />
        <span>Paylaş</span>
      </button>
    </div>
  );
};

export default PostHeader;