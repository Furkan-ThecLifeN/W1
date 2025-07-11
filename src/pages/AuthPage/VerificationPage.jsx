import React, { useState } from "react";
import styles from "./VerificationPage.module.css";


const VerificationPage = () => {
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Verification code submitted:", code);
  };

  return (
    <div className={styles.verificationWrapper}>
      <form className={styles.verificationForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Verify Your Email</h2>
        <p className={styles.subtitle}>
          We sent a 6-digit code to your email. Please enter it below.
        </p>
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={handleChange}
          placeholder="Enter 6-digit code"
          className={styles.codeInput}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Verify
        </button>
        <p className={styles.resendText}>
          Didn’t receive the code?{" "}
          <span className={styles.resendLink}>Resend</span>
        </p>
      </form>
    </div>
  );
};

export default VerificationPage;
