import React from "react";
import styles from "./LoginDeviceHistory.module.css";
import { FiMonitor, FiSmartphone, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";

const devices = [
  {
    id: 1,
    device: "MacBook Pro",
    type: "desktop",
    location: "Istanbul, TR",
    time: "Today at 14:35",
    current: true,
  },
  {
    id: 2,
    device: "iPhone 13",
    type: "mobile",
    location: "Istanbul, TR",
    time: "Yesterday at 23:10",
    current: false,
  },
  {
    id: 3,
    device: "Windows PC",
    type: "desktop",
    location: "Ankara, TR",
    time: "Jul 12, 08:20",
    current: false,
  },
];

const LoginDeviceHistory = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Login & Device History</h2>
      <p className={styles.subtext}>Devices that accessed your account. Revoke access if suspicious.</p>

      <div className={styles.deviceList}>
        {devices.map(({ id, device, type, location, time, current }) => (
          <div className={`${styles.deviceCard} ${current ? styles.active : ""}`} key={id}>
            <div className={styles.icon}>
              {type === "mobile" ? <FiSmartphone /> : <FiMonitor />}
            </div>
            <div className={styles.info}>
              <h4>{device}</h4>
              <p><FiMapPin /> {location}</p>
              <p><FiClock /> {time}</p>
            </div>
            {current && (
              <div className={styles.currentTag}>
                <FiCheckCircle /> This device
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginDeviceHistory;