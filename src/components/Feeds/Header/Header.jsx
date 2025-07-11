import styles from "./Header.module .css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.adBanner}>Bu alana reklam yerleştirilebilir</div>
    </header>
  );
}
