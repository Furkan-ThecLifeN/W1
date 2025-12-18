import React from "react";
import styles from "../../ChannelSidebar/ChannelSidebar.module.css";

const SettingsModal = ({ onClose, devices, actions }) => {
  return (
    <div className={styles.settingsOverlay} onClick={onClose}>
      <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Ses Ayarları</h3>
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>MİKROFON</label>
          <select
            className={styles.deviceSelect}
            value={devices.selectedMic}
            onChange={(e) => actions.switchMicrophone(e.target.value)}
          >
            {devices.inputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mikrofon ${d.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>HOPARLÖR</label>
          <select
            className={styles.deviceSelect}
            value={devices.selectedSpeaker}
            onChange={(e) => actions.switchSpeaker(e.target.value)}
          >
            {devices.outputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Hoparlör ${d.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          Tamam
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;