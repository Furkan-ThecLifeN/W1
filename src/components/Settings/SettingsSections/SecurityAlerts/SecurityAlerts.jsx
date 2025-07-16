import React, { useState } from "react";
import styles from "./SecurityAlerts.module.css";
import { FiBell, FiXCircle, FiCheckCircle } from "react-icons/fi";

const initialAlerts = [
  {
    id: 1,
    type: "warning",
    title: "Unusual Login Attempt",
    description: "We detected a login from a new device on July 15, 2025.",
    date: "2025-07-15",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "Password Changed",
    description: "Your password was changed successfully on June 30, 2025.",
    date: "2025-06-30",
    read: true,
  },
  {
    id: 3,
    type: "warning",
    title: "Two-Factor Authentication Disabled",
    description: "2FA was disabled on May 20, 2025. Secure your account.",
    date: "2025-05-20",
    read: false,
  },
];

const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const markAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <FiBell /> Security Alerts
      </h2>
      {alerts.length === 0 ? (
        <p className={styles.noAlerts}>No security alerts at this time.</p>
      ) : (
        <ul className={styles.alertList}>
          {alerts.map(({ id, type, title, description, date, read }) => (
            <li
              key={id}
              className={`${styles.alertItem} ${
                read ? styles.read : styles.unread
              } ${type === "warning" ? styles.warning : styles.info}`}
            >
              <div className={styles.alertContent}>
                <h4 className={styles.alertTitle}>{title}</h4>
                <p className={styles.alertDescription}>{description}</p>
                <small className={styles.alertDate}>{date}</small>
              </div>
              <div className={styles.actions}>
                {!read && (
                  <button
                    className={styles.markReadBtn}
                    onClick={() => markAsRead(id)}
                    aria-label="Mark as read"
                  >
                    <FiCheckCircle />
                  </button>
                )}
                <button
                  className={styles.removeBtn}
                  onClick={() => removeAlert(id)}
                  aria-label="Remove alert"
                >
                  <FiXCircle />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SecurityAlerts;
