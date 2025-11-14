import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerContainer}>
      <nav className={styles.footerNav}>
        <a href="/welcome" className={styles.footerLink}>Home</a>
        <a href="/about" className={styles.footerLink}>Hakkımızda</a>
        <a href="/contact" className={styles.footerLink}>İletişim</a>
        <a href="/privacy" className={styles.footerLink}>Gizlilik Politikası</a>
        <a href="/terms" className={styles.footerLink}>Kullanım Şartları</a>
        <a href="/help" className={styles.footerLink}>Yardım</a>
      </nav>
      <p className={styles.copyright}>
        &copy; {currentYear} W1. Tüm hakları saklıdır.
      </p>
    </footer>
  );
};

export default Footer;