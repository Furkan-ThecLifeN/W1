import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./DeleteAccount.module.css";
import { FiAlertTriangle, FiTrash2, FiCheckCircle, FiLock } from "react-icons/fi";

Modal.setAppElement("#root");

const DeleteAccount = () => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = () => {
    if (reason.trim() && password.trim() && confirmChecked) {
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setReason("");
      setPassword("");
      setConfirmChecked(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {success && (
        <div className={styles.toast}>
          <FiCheckCircle /> Your account has been permanently deleted.
        </div>
      )}

      <h2 className={styles.heading}>Delete Account</h2>
      <p className={styles.subtext}>
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      <button className={styles.deleteBtn} onClick={() => setShowModal(true)}>
        <FiTrash2 /> Delete My Account
      </button>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiAlertTriangle /> Confirm Permanent Deletion
        </h3>

        <p className={styles.modalText}>Please tell us why you're deleting your account (optional):</p>
        <textarea
          className={styles.reasonInput}
          placeholder="Your reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label className={styles.label}>Enter your password</label>
        <input
          className={styles.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className={styles.confirmCheckbox}>
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={() => setConfirmChecked(!confirmChecked)}
          />
          I understand that this action is permanent and cannot be undone.
        </label>

        <div className={styles.modalButtons}>
          <button
            className={styles.deleteConfirmBtn}
            disabled={!reason.trim() || !password.trim() || !confirmChecked}
            onClick={handleDelete}
          >
            Confirm Delete
          </button>
          <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteAccount;
