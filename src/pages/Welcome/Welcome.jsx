// src/pages/Home/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Contact.jsx'teki gibi animasyon için
import { FaFeatherAlt, FaVideo, FaShieldAlt } from "react-icons/fa";

import styles from "./Welcome.module.css";
import Footer from "../../components/Footer/Footer";

// Animasyon varyantları (Framer Motion için)
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const Welcome = () => {
  return (
    <>
      <title>W1 - Geleceğin Sosyal Deneyimi | QuantumTag</title>
      <meta
        name="description"
        content="W1'e katılın. Fikirlerinizi 'Feeling' ile paylaşın, anılarınızı 'Feed' ile ölümsüzleştirin. Güvenli, modern ve özgün sosyal platform."
      />
      <meta property="og:title" content="W1 - Geleceğin Sosyal Deneyimi" />
      <meta
        property="og:description"
        content="W1 (QuantumTag) platformu, fikirlerinizi ve anılarınızı paylaşmanız için fütüristik bir sosyal ağ sunar."
      />
      <meta property="og:url" content="https://www.siteniz.com/" />
      {/* Diğer meta etiketleri... */}

      <div className={styles.homePage}>
        {/* === 0. STICKY HEADER (Sadece Ana Sayfa için) === */}
        {/* Bu, kullanıcı giriş yapmadığında görünen header'dır */}
        <motion.header
          className={styles.stickyHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              W1
            </Link>
            <nav className={styles.authNav}>
              <Link to="/auth" className={styles.navLink}>
                Giriş Yap
              </Link>
              <Link to="/auth" className={styles.ctaButtonHeader}>
                Kayıt Ol
              </Link>
            </nav>
          </div>
        </motion.header>

        {/* === 1. HERO BÖLÜMÜ (Ekranı Kaplayan Giriş) === */}
        <section className={styles.heroSection}>
          <div className={styles.contentWrapper}>
            <motion.div
              className={styles.heroContent}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className={styles.titleH1}>
                Geleceğin Sosyal Deneyimi. <br />
                Bugün.
              </h1>
              <p className={styles.heroText}>
                Fikirlerini <strong>"Feeling"</strong> ile dünyaya duyur.
                Anılarını <strong>"Feed"</strong> ile ölümsüzleştir.
                QuantumTag'in yeni nesil sosyal platformu W1'e hoş geldin.
              </p>
              <Link to="/auth" className={styles.ctaButtonHero}>
                Topluluğa Şimdi Katıl
              </Link>
            </motion.div>

            {/* Buraya uygulamanızın bir görselini/mockup'ını ekleyebilirsiniz */}
            <motion.div
              className={styles.heroVisual}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className={styles.visualMockup}>
                <div className={styles.mockupHeader}>W1</div>
                <div className={styles.mockupFeedItem}>
                  <FaVideo /> Video Feed
                </div>
                <div className={styles.mockupFeelingItem}>
                  <FaFeatherAlt /> Feeling...
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === 2. "STICKY SCROLL" ÖZELLİK BÖLÜMÜ === */}
        <section className={styles.stickySection}>
          <div className={`${styles.contentWrapper} ${styles.stickyLayout}`}>
            {/* SOL TARAF (Yapışkan) */}
            <div className={styles.stickyLeft}>
              <motion.div
                className={styles.stickyContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeIn}
              >
                <h2 className={styles.titleH2}>W1 Nedir?</h2>
                <p className={styles.text}>
                  W1, iki dünyayı birleştiren hibrit bir platformdur. Hem hızlı
                  düşüncelerinizi hem de derinlemesine görsel hikayelerinizi
                  paylaşmanız için tasarlandı.
                </p>
                <div className={styles.stickyVisual}>
                  {/* Buraya da bir görsel eklenebilir */}
                </div>
              </motion.div>
            </div>

            {/* SAĞ TARAF (Kayan) */}
            <div className={styles.stickyRight}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <div className={styles.featureCard}>
                  <FaFeatherAlt className={styles.featureIcon} />
                  <h3>Feelings (Hisler)</h3>
                  <p className={styles.text}>
                    Kısa, metin tabanlı düşünceleriniz, anlık fikirleriniz ve
                    dünyayla hızlıca paylaşmak istedikleriniz.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <div className={styles.featureCard}>
                  <FaVideo className={styles.featureIcon} />
                  <h3>Feeds (Akışlar)</h3>
                  <p className={styles.text}>
                    Hayatınızdan anlar, görsel hikayeler, videolar ve
                    fotoğraflar. Estetik ve kalıcı içerikleriniz için ana
                    akışınız.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <div className={styles.featureCard}>
                  <FaShieldAlt className={styles.featureIcon} />
                  <h3>Güvenli Bağlantı</h3>
                  <p className={styles.text}>
                    Özel mesajlaşma ve gelişmiş gizlilik ayarlarıyla
                    bağlantılarınızı siz yönetin. Güvenliğiniz bizim
                    önceliğimiz.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* === 3. BENTO GRID (AboutUs'taki stil) === */}
        {/* Stil aynı, içerik farklı */}
        <section className={styles.bentoSection}>
          <div className={styles.contentWrapper}>
            <motion.h2
              className={styles.titleH2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeIn}
            >
              Sınırların Ötesinde
            </motion.h2>

            <motion.div
              className={styles.bentoGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              {/* KART 1 (BÜYÜK) */}
              <div className={`${styles.bentoItem} ${styles.bentoItemLarge}`}>
                <strong>Özgün ve Yenilikçi Tasarım</strong>
                <p>
                  W1, hazır bir şablon değildir. QuantumTag bünyesinde
                  geliştirilen, kullanıcı deneyimini ön planda tutan fütüristik
                  ve akıcı bir arayüze sahiptir.
                </p>
              </div>
              {/* KART 2 */}
              <div className={styles.bentoItem}>
                <strong>Güvenlik Odaklı Moderasyon</strong>
                <p>
                  Güçlü raporlama araçları ve 6 saat içinde müdahale hedefiyle
                  çalışan ekibimizle, saygılı bir topluluk sağlıyoruz.
                </p>
              </div>
              {/* KART 3 */}
              <div className={styles.bentoItem}>
                <strong>Hızlı ve Güçlü Altyapı</strong>
                <p>
                  Google Firebase altyapısı üzerinde çalışan W1, içeriklerinize
                  hızlı ve kesintisiz erişim sunar.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === 4. FİNAL CTA (ÇAĞRI) BÖLÜMÜ === */}
        <section className={styles.finalCtaSection}>
          <motion.div
            className={styles.contentWrapper}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeIn}
          >
            <h2 className={styles.titleH2}>W1 Evrenine Adım Atın.</h2>
            <p className={styles.text}>
              Keşfetmeye, paylaşmaya ve ilham almaya hazır mısın?
            </p>
            <Link to="/auth" className={styles.ctaButtonHero}>
              Ücretsiz Hesap Oluştur
            </Link>
          </motion.div>
        </section>

        {/* === 5. FOOTER === */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>
    </>
  );
};

export default Welcome;