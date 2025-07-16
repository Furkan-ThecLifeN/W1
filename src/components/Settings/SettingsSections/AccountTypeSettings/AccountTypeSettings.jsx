import React, { useState } from "react";
import styles from "./AccountTypeSettings.module.css";
import { FiUser, FiBriefcase, FiCheckCircle, FiInfo } from "react-icons/fi";

const AccountTypeSettings = () => {
  const [accountType, setAccountType] = useState("personal");
  const [selectedType, setSelectedType] = useState(accountType);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setAccountType(selectedType);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Choose Your Account Type</h2>
      <p className={styles.subtext}><FiInfo /> Select the type of account that best describes your usage. You can switch anytime.</p>

      <div className={styles.options}>
        <div
          className={`${styles.card} ${selectedType === "personal" ? styles.active : ""}`}
          onClick={() => setSelectedType("personal")}
        >
          <FiUser className={styles.icon} />
          <h3>Personal</h3>
          <p>Ideal for individuals using the platform for personal reasons, portfolios, or non-commercial purposes.</p>
        </div>

        <div
          className={`${styles.card} ${selectedType === "business" ? styles.active : ""}`}
          onClick={() => setSelectedType("business")}
        >
          <FiBriefcase className={styles.icon} />
          <h3>Business</h3>
          <p>Recommended for companies, brands, or freelancers offering services or managing teams.</p>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={selectedType === accountType}
        >
          Save Changes
        </button>
        {saved && (
          <div className={styles.savedNotice}>
            <FiCheckCircle /> Account type updated successfully.
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountTypeSettings;
