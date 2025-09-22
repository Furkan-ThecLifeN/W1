import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./ReportModal.module.css";
import { createReportRemote, defaultGetAuthToken } from "../actions/api";
import { FiX, FiSend } from "react-icons/fi";
import { FaThumbsUp } from "react-icons/fa";

const ReportModal = ({ postId, reportedUserId, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please do not leave the report text empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await defaultGetAuthToken();
      await createReportRemote({ postId, reportedUserId, reason, token });
      setSuccess(true);
    } catch (e) {
      console.error("Report sending error:", e);
      setError("An error occurred while submitting your report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    const handleAnimationEnd = () => {
      if (isClosing) {
        onClose();
      }
    };

    if (modalElement) {
      modalElement.addEventListener("animationend", handleAnimationEnd);
    }
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("animationend", handleAnimationEnd);
      }
    };
  }, [isClosing, onClose]);

  return ReactDOM.createPortal(
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div
        ref={modalRef}
        className={`${styles.modalContent} ${isClosing ? styles.closing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className={styles.successContent}>
            <h3>
              <FaThumbsUp />
              Report Submitted
            </h3>
            <p>Your report has been successfully sent. Thank you for your feedback.</p>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3>Report</h3>
              <button onClick={handleClose} className={styles.closeIcon}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <textarea
                maxLength={500}
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setError(null);
                }}
                placeholder="Please explain the reason for your report (max. 500 characters)."
                className={styles.textarea}
              />
              {error && <p className={styles.errorText}>{error}</p>}
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`${styles.button} ${styles.cancelButton}`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.submitButton}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <FiSend />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
