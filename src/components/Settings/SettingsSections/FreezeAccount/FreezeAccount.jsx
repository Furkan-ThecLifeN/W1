import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./FreezeAccount.module.css";
import { FiAlertCircle, FiLock, FiCheckCircle, FiPhone, FiSend } from "react-icons/fi";

Modal.setAppElement("#root");

const FreezeAccount = () => {
  const [showMainModal, setShowMainModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirm = () => {
    if (reason.trim() && password.trim()) {
      setShowMainModal(false);
      setShowCodeModal(true);
      setSent(true);
    }
  };

  const handleFinalConfirm = () => {
    if (phoneCode.trim().length === 6) {
      setShowCodeModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setReason("");
      setPassword("");
      setPhoneCode("");
      setSent(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {success && (
        <div className={styles.toast}>
          <FiCheckCircle /> Account successfully frozen.
        </div>
      )}

      <h2 className={styles.heading}>Freeze Account</h2>
      <p className={styles.subtext}>
        Temporarily deactivate your account. You can reactivate it by logging back in.
      </p>

      <button className={styles.freezeBtn} onClick={() => setShowMainModal(true)}>
        <FiLock /> Freeze My Account
      </button>

      {/* Step 1 Modal */}
      <Modal
        isOpen={showMainModal}
        onRequestClose={() => setShowMainModal(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiAlertCircle /> Confirm Freeze
        </h3>

        <p className={styles.modalText}>Why are you freezing your account?</p>
        <textarea
          className={styles.reasonInput}
          placeholder="Write your reason..."
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

        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Continue
          </button>
          <button className={styles.cancelBtn} onClick={() => setShowMainModal(false)}>
            Cancel
          </button>
        </div>
      </Modal>

      {/* Step 2 Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onRequestClose={() => setShowCodeModal(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiPhone /> Phone Verification
        </h3>
        <p className={styles.modalText}>
          A 6-digit verification code has been sent to your phone.
        </p>

        <div className={styles.codeSection}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter 6-digit code"
            maxLength={6}
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
          />
          <button
            className={styles.resendBtn}
            onClick={() => setSent(true)}
            disabled={sent}
          >
            <FiSend /> {sent ? "Code Sent" : "Send Code"}
          </button>
        </div>

        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={handleFinalConfirm}>
            Confirm Freeze
          </button>
          <button className={styles.cancelBtn} onClick={() => setShowCodeModal(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FreezeAccount;
