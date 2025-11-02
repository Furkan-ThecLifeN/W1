import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFeatherAlt,
  FaImage,
  FaVideo,
  FaShieldAlt,
  FaGlobe,
  FaUserFriends,
  FaStar,
  FaLock,
  FaFlag,
  FaBug,
  FaCode,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaPlay,
} from "react-icons/fa";
import styles from "./Welcome.module.css";
import Footer from "../../components/Footer/Footer";

// Animasyon objeleri
const containerFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", staggerChildren: 0.18 },
  },
};
const itemFadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const visualFadeIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      className={styles.toggle}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`${styles.toggleTrack} ${checked ? styles.on : styles.off}`}
      >
        <span className={styles.toggleThumb} />
      </span>
    </button>
  );
}

function PrivacyPill({ icon: Icon, title, description, active }) {
  return (
    <div
      className={`${styles.privacyPill} ${active ? styles.activePill : ""}`}
      role="article"
      aria-pressed={active}
      tabIndex={0}
    >
      <Icon className={styles.pillIcon} />
      <div className={styles.pillBody}>
        <strong className={styles.pillTitle}>{title}</strong>
        <span className={styles.pillDesc}>{description}</span>
      </div>
      <div className={styles.pillMark}>
        {active ? <FaCheck /> : <FaTimes />}
      </div>
    </div>
  );
}

function FeatureCard({ visual, title, children, reversed }) {
  return (
    <motion.div
      className={`${styles.featureCard} ${reversed ? styles.reversed : ""}`}
      variants={containerFadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 300 },
      }}
    >
      <motion.div className={styles.featureCardVisual} variants={visualFadeIn}>
        {visual}
      </motion.div>
      <motion.div className={styles.featureCardBody} variants={itemFadeIn}>
        <h3 className={styles.featureCardTitle}>{title}</h3>
        <div className={styles.featureCardText}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

const Welcome = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [audible, setAudible] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState("public");
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const toggleFaq = (id) => setFaqOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <>
      <title>W1'e Hoş Geldiniz - Sosyal Medyanın Yeniden Tanımı</title>
      <meta
        name="description"
        content="W1 (QuantumTag) - Fikirler (Feeling), Fotoğraflar (Post) ve Videolar (Feed) için fütüristik sosyal platform. Benzersiz gizlilik kontrolleri ve Firebase güvencesiyle."
      />

      <div className={styles.welcomePage}>
        <motion.header
          className={styles.stickyHeader}
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              W1
            </Link>

            <nav className={styles.headerControls} aria-label="Üst navigasyon">
              <div className={styles.iconRow}>
                <button
                  className={styles.iconButton}
                  aria-label="Tema"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <FaMoon /> : <FaSun />}
                </button>
              </div>

              <div className={styles.authNav}>
                <Link to="/auth" className={styles.navLink}>
                  Giriş Yap
                </Link>
                <Link to="/auth" className={styles.ctaButtonHeader}>
                  Kayıt Ol
                </Link>
              </div>
            </nav>
          </div>
        </motion.header>

        <section
          className={`${styles.fullscreenSection} ${styles.heroSection}`}
        >
          <motion.div
            className={styles.heroContentEnhanced}
            variants={containerFadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div className={styles.heroIntro} variants={itemFadeIn}>
              <h1 className={styles.heroTitleLarge}>W1</h1>
              <p className={styles.heroKicker}>
                Sosyal Medyanın Yeniden Tanımı
              </p>
            </motion.div>

            <motion.div className={styles.heroCopy} variants={itemFadeIn}>
              <h2 className={styles.heroSubtitle}>
                Kontrol Sizde, Deneyim Fütüristik
              </h2>
              <p className={styles.heroText}>
                Fikirleriniz, anılarınız ve keşiflerinizi üç farklı formatta
                ifade edin: kısa "Feeling" parıltıları, tekil "Post"
                fotoğrafları ve ilham verici "Feed" videoları. Gönderi bazlı
                gizlilik ve gelişmiş keşif araçlarıyla paylaşın.
              </p>
            </motion.div>

            <motion.div className={styles.heroActions} variants={itemFadeIn}>
              <Link to="/auth" className={styles.ctaButtonHero}>
                Evrene Katıl
              </Link>
              <Link to="/home" className={styles.secondaryButton}>
                Keşfet
              </Link>
            </motion.div>

            <motion.div className={styles.quickStats} variants={itemFadeIn}>
              {/*    <div className={styles.stat}>
                <strong>12K+</strong>
                <span>Günlük Aktif</span>
              </div> */}
              <div className={styles.stat}>
                <strong>4.8</strong>
                <span>Topluluk Puanı</span>
              </div>
              <div className={styles.stat}>
                <strong>0</strong>
                <span>Rekabet (Reklamsız)</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className={styles.fullscreenSection}>
          <div className={styles.splitGrid}>
            <FeatureCard
              visual={<FaFeatherAlt className={styles.featureIconLarge} />}
              title="FEELING"
            >
              Anlık düşünceleriniz. Kısa, hızlı ve etkili. Hemen paylaşın, geri
              bildirim alın ya da özel kaydedin.
            </FeatureCard>

            <FeatureCard
              visual={<FaImage className={styles.featureIconLarge} />}
              title="POST"
              reversed
            >
              Yüksek çözünürlükte görseller için ideal. Albümler oluşturun,
              düzenleyin ve koleksiyonlara kaydedin.
            </FeatureCard>

            <FeatureCard
              visual={<FaVideo className={styles.featureIconLarge} />}
              title="FEED"
            >
              Embed destekli videolar ve interaktif içerikler. Keşif motorumuz
              kişiselleştirilmiş sonuçlar sunar.
            </FeatureCard>
          </div>
        </section>

        <section
          className={`${styles.fullscreenSection} ${styles.privacySection}`}
        >
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
              Kontrol Tamamen Sende
            </motion.h2>
            <motion.p className={styles.sectionText} variants={itemFadeIn}>
              Her gönderi için detaylı gizlilik ayarları. Birden fazla gizlilik
              seviyesini test edebilir ve önizleyebilirsiniz.
            </motion.p>

            <motion.div
              className={styles.privacyInteractive}
              variants={itemFadeIn}
            >
              <div className={styles.privacyPreview}>
                <div className={styles.postPreviewHeader}>
                  <div className={styles.previewUser}>W1 Kullanıcısı</div>
                  <div className={styles.previewPrivacy}>{selectedPrivacy}</div>
                </div>

                <div className={styles.postPreviewBody}>
                  <p>
                    Keşke dünya daha yavaş olsaydı. Bu anı kaydetmek yetiyor
                    bana.
                  </p>
                </div>
              </div>

              <div className={styles.privacyControls}>
                <div className={styles.privacyGridControls}>
                  <button
                    onClick={() => setSelectedPrivacy("public")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "public" ? styles.selectedBtn : ""
                    }`}
                  >
                    Herkese Açık
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("followers")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "followers" ? styles.selectedBtn : ""
                    }`}
                  >
                    Arkadaşlar
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("close")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "close" ? styles.selectedBtn : ""
                    }`}
                  >
                    Yakın Arkadaşlar
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("private")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "private" ? styles.selectedBtn : ""
                    }`}
                  >
                    Sadece Ben
                  </button>
                </div>

                <div className={styles.privacyPillsWrap}>
                  <PrivacyPill
                    icon={FaGlobe}
                    title="Herkese Açık"
                    description="Gönderinizi herkes görebilir."
                    active={selectedPrivacy === "public"}
                  />
                  <PrivacyPill
                    icon={FaUserFriends}
                    title="Arkadaşlar"
                    description="Sadece sizi takip edenler görebilir."
                    active={selectedPrivacy === "followers"}
                  />
                  <PrivacyPill
                    icon={FaStar}
                    title="Yakın Arkadaşlar"
                    description="Sadece özel listeniz görebilir."
                    active={selectedPrivacy === "close"}
                  />
                  <PrivacyPill
                    icon={FaLock}
                    title="Sadece Ben"
                    description="Sadece siz görebilirsiniz."
                    active={selectedPrivacy === "private"}
                  />
                </div>
              </div>
            </motion.div>

            <motion.p className={styles.sectionTextSmall} variants={itemFadeIn}>
              Bu ayarlar mesajlaşma için de uygulanır. Kimlerden mesaj
              alacağınızı da burada kontrol edin.
            </motion.p>
          </motion.div>
        </section>

        <section
          className={`${styles.fullscreenSection} ${styles.securitySection}`}
        >
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
              Güven ve Şeffaflık
            </motion.h2>
            <motion.p className={styles.sectionText} variants={itemFadeIn}>
              Verilerinizin korunması ve şeffaf politika uygulamaları W1'in
              temelidir.
            </motion.p>

            <motion.div
              className={styles.securityGridEnhanced}
              variants={containerFadeIn}
            >
              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaCode className={styles.cardIcon} />
                <h4>Firebase Altyapısı</h4>
                <p>Verileriniz güçlü bir altyapıda saklanır.</p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaFlag className={styles.cardIcon} />
                <h4>Raporlama</h4>
                <p>Uygunsuz içeriği kolayca raporlayın ve takip edin.</p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaBug className={styles.cardIcon} />
                <h4>Geri Bildirim</h4>
                <p>Hata bildirimleri ve öneriler için özel kanal.</p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaShieldAlt className={styles.cardIcon} />
                <h4>Veri Şeffaflığı</h4>
                <p>Hangi veriler toplandığını görün.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <section className={`${styles.fullscreenSection} ${styles.ctaSection}`}>
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div className={styles.ctaCard} variants={itemFadeIn}>
              <motion.h2 className={styles.ctaTitle} variants={itemFadeIn}>
                W1 Evrenine Adım Atın.
              </motion.h2>
              <motion.p className={styles.sectionText} variants={itemFadeIn}>
                Keşfetmeye, paylaşmaya ve ilham almaya hazır mısın? Platformumuz
                sürekli gelişiyor ve topluluğumuz büyüyor.
              </motion.p>

              <motion.div className={styles.ctaRow} variants={itemFadeIn}>
                <Link to="/auth" className={styles.ctaButtonHero}>
                  Ücretsiz Hesap Oluştur
                </Link>
                <Link to="/discover" className={styles.ghostButton}>
                  Discover
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Welcome;
