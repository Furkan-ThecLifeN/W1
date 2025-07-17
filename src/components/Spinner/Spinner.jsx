import React from "react";
import styles from "./Spinner.module.css";

const Spinner = () => {
  return (
    <div className={styles.spinnerOverlay} role="alert" aria-live="assertive">
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Spinner;
