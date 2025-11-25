import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerContainer}>
      <nav className={styles.footerNav}>
        <a href="/welcome" className={styles.footerLink}>Home</a>
        <a href="/about" className={styles.footerLink}>About Us</a>
        <a href="/contact" className={styles.footerLink}>Contact</a>
        <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
        <a href="/help" className={styles.footerLink}>Help</a>
      </nav>
      <p className={styles.copyright}>
        &copy; {currentYear} W1. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
