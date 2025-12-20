import React, { useState } from "react";
import styles from "./SettingsModal.module.css";
import { FaTimes, FaMicrophone, FaVolumeUp } from "react-icons/fa";

/* ================= CUSTOM SELECT ================= */

const CustomSelect = ({
  id,
  icon: Icon,
  value,
  options,
  onChange,
  openSelect,
  setOpenSelect,
}) => {
  const isOpen = openSelect === id;
  const selected = options.find((o) => o.value === value);

  return (
    <div className={styles.selectWrapper}>
      <div
        className={styles.selectContainer}
        onClick={() => setOpenSelect(isOpen ? null : id)}
      >
        <Icon className={styles.inputIcon} />
        <span className={styles.selectedText}>
          {selected?.label || "Seçiniz"}
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={styles.option}
              onClick={() => {
                onChange(opt.value);
                setOpenSelect(null);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= MODAL ================= */

const SettingsModal = ({ onClose, devices, actions }) => {
  const [openSelect, setOpenSelect] = useState(null);

  const micOptions = devices.inputs.map((d) => ({
    value: d.deviceId,
    label:
      d.deviceId === "default"
        ? "Varsayılan Giriş Cihazı"
        : d.label || `Giriş Cihazı (${d.deviceId.slice(0, 5)})`,
  }));

  const speakerOptions = devices.outputs.map((d) => ({
    value: d.deviceId,
    label:
      d.deviceId === "default"
        ? "Varsayılan Çıkış Cihazı"
        : d.label || `Çıkış Cihazı (${d.deviceId.slice(0, 5)})`,
  }));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Ses Ayarları</h3>
            <p className={styles.subTitle}>
              Donanım ayarlarını buradan yönetebilirsin.
            </p>
          </div>
          <div className={styles.closeBtnWrapper} onClick={onClose}>
            <FaTimes size={18} />
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <label className={styles.label}>GİRİŞ CİHAZI (MİKROFON)</label>
          <CustomSelect
            id="mic"
            icon={FaMicrophone}
            value={devices.selectedMic}
            options={micOptions}
            onChange={actions.switchMicrophone}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
          />

          <div style={{ marginTop: 28 }}>
            <label className={styles.label}>ÇIKIŞ CİHAZI (HOPARLÖR)</label>
            <CustomSelect
              id="speaker"
              icon={FaVolumeUp}
              value={devices.selectedSpeaker || "default"}
              options={speakerOptions}
              onChange={actions.switchSpeaker}
              openSelect={openSelect}
              setOpenSelect={setOpenSelect}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.actionBtn} onClick={onClose}>
            Bitti
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
