import React, { useState, useEffect } from "react";
import styles from "./TwoFactorAuth.module.css";
import { FiShield, FiPhone, FiMail, FiCheckCircle } from "react-icons/fi";
import Modal from "react-modal";

Modal.setAppElement("#root");

const TwoFactorAuth = () => {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState("sms");
  const [verified, setVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleToggle = () => {
    if (enabled) {
      setConfirmationType("disable");
      setShowModal(true);
    } else {
      setEnabled(true);
      setVerified(false);
    }
  };

  const handleVerify = () => {
    setConfirmationType(method);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (confirmationType === "disable") {
      setEnabled(false);
      setVerified(false);
      showToast("Two-Factor Authentication disabled");
    } else {
      if (codeInput === "123456") {
        setVerified(true);
        showToast(`${confirmationType.toUpperCase()} verified. 2FA is now active`);
      } else {
        showToast("Invalid code. Please try again.");
      }
    }

    setShowModal(false);
    setConfirmationType(null);
    setCodeInput("");
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  return (
    <div className={styles.wrapper}>
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}

      <h2 className={styles.heading}>Two-Factor Authentication (2FA)</h2>
      <p className={styles.subtext}>Secure your account by enabling an additional layer of protection.</p>

      <div className={styles.section}>
        <label className={styles.toggleLabel}>
          <input type="checkbox" checked={enabled} onChange={handleToggle} />
          Enable 2FA
        </label>
      </div>

      {enabled && (
        <div className={styles.section}>
          <h4>Select Method</h4>
          <div className={styles.methods}>
            <button
              className={`${styles.methodBtn} ${method === "sms" ? styles.active : ""}`}
              onClick={() => setMethod("sms")}
            >
              <FiPhone /> SMS Verification
            </button>
            <button
              className={`${styles.methodBtn} ${method === "email" ? styles.active : ""}`}
              onClick={() => setMethod("email")}
            >
              <FiMail /> Email Verification
            </button>
          </div>

          <button className={styles.verifyBtn} onClick={handleVerify}>
            Verify & Activate
          </button>

          {verified && (
            <div className={styles.verifiedBox}>
              <FiCheckCircle /> 2FA is now active via {method.toUpperCase()}.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          {confirmationType === "disable"
            ? "Disable Two-Factor Authentication?"
            : `Confirm ${confirmationType ? confirmationType.toUpperCase() : ""} Verification`}
        </h3>
        <p className={styles.modalText}>
          {confirmationType === "disable"
            ? "Are you sure you want to turn off 2FA? This will reduce your account security."
            : `A verification code has been sent to your ${confirmationType || ""}. Enter the code to activate 2FA.`}
        </p>

        {confirmationType !== "disable" && (
          <input
            className={styles.codeInput}
            type="text"
            placeholder="Enter 6-digit code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            maxLength={6}
          />
        )}

        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={confirmAction}>Confirm</button>
          <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default TwoFactorAuth;
