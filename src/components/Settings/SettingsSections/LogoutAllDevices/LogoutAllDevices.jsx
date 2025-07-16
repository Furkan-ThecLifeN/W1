import React, { useState } from "react";
import styles from "./LogoutAllDevices.module.css";
import Modal from "react-modal";
import { FiLogOut, FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";

Modal.setAppElement("#root");

const LogoutAllDevices = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogoutAll = () => {
    setModalOpen(true);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setModalOpen(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setConfirmed(false);
    }, 4000);
  };

  return (
    <div className={styles.wrapper}>
      {success && (
        <div className={styles.toast}>
          <FiCheckCircle /> You have been logged out from all devices.
        </div>
      )}

      <h2 className={styles.heading}>
        <FiLogOut /> Logout from All Devices
      </h2>
      <p className={styles.subtext}>
        For your security, you can log out from all other active sessions except this one.
      </p>

      <button className={styles.logoutBtn} onClick={handleLogoutAll}>
        Logout All Devices
      </button>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiAlertTriangle /> Confirm Logout
        </h3>
        <p className={styles.modalText}>
          Are you sure you want to log out from all devices? This will end all active sessions except the current one.
        </p>
        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Yes, Logout All
          </button>
          <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LogoutAllDevices;
