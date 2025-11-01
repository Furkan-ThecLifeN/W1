// src/pages/AboutUs/AboutUs.jsx
import React from "react";
import { Link } from "react-router-dom";

import styles from "./AboutUs.module.css";
import Footer from "../../components/Footer/Footer";

const AboutUs = () => {
  return (
    <>
      <title>Hakkımızda | W1 - QuantumTag</title>
      <meta
        name="description"
        content="QuantumTag'in W1 platformu, özgün bağlantılar ve güvenli bir sosyal deneyim sunar. Misyonumuz, değerlerimiz ve sorumluluk taahhüdümüz hakkında bilgi edinin."
      />
      <meta
        property="og:title"
        content="Hakkımızda | W1 - Geleceğin Sosyal Platformu"
      />
      <meta
        property="og:description"
        content="QuantumTag'in W1 platformu, özgün bağlantılar ve güvenli bir sosyal deneyim sunar."
      />
      <meta
        property="og:image"
        content="https://www.siteniz.com/w1-og-image.png"
      />
      <meta property="og:url" content="https://www.siteniz.com/hakkimizda" />
      <meta name="twitter:card" content="summary_large_image" />
      <div className={styles.aboutPage}>
        {/* 1. BÖLÜM: HERO (Giriş) */}
        <section className={styles.heroSection}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.titleH1}>
              Bizim Hikayemiz. Sizin Platformunuz.
            </h1>
            <p className={styles.heroText}>
              QuantumTag olarak, sosyal medyanın hem estetik hem de sorumlu
              olabileceğine inandık. W1, bu inancın ürünüdür.
            </p>
            <Link to="/kesfet" className={styles.ctaButton}>
              W1'i Keşfet
            </Link>
          </div>
        </section>

        {/* 2. BÖLÜM: YENİ ZAMAN TÜNELİ (TIMELINE) YAPISI */}
        <section className={styles.timelineSection}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>W1'in Yolculuğu</h2>
            <div className={styles.timeline}>
              {/* Zaman Tüneli Adımı: Misyon */}
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>★</div>
                <div className={styles.timelineContent}>
                  <h3>Kıvılcım: Misyonumuz</h3>
                  <p className={styles.text}>
                    Kullanıcıların dünyalarını özgürce paylaşabildiği, özgün
                    bağlar kurabildiği ve ilham verici içerikleri güvenle
                    keşfedebildiği, benzersiz tasarımlı ve kullanıcı odaklı bir
                    ortam sağlamak.
                  </p>
                </div>
              </div>

              {/* Zaman Tüneli Adımı: Vizyon */}
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>🚀</div>
                <div className={styles.timelineContent}>
                  <h3>Hedef: Vizyonumuz</h3>
                  <p className={styles.text}>
                    Saygı, yaratıcılık ve otantik bağlantılar üzerine kurulu
                    küresel bir topluluğu teşvik ederek, bir sosyal platformun
                    hem inovatif hem de sorumlu olabileceğini kanıtlamak.
                  </p>
                </div>
              </div>

              {/* Zaman Tüneli Adımı: Sorumlu Paylaşım (AdSense için önemli) */}
              <div className={styles.timelineItem}>
                {/* DÜZELTME: 'className_' -> 'className' oldu */}
                <div className={styles.timelineIcon}>🛡️</div>
                <div className={styles.timelineContent}>
                  <h3>Taahhüt: Sorumlu Paylaşım</h3>
                  <p className={styles.text}>
                    Güvenliği temel alıyoruz. Platformumuzda paylaşımdan önce:
                  </p>
                  <ul className={styles.timelineList}>
                    <li>
                      İçeriğin size ait olduğunu ve yasalara uyduğunu{" "}
                      <strong>onaylamanız zorunludur.</strong>
                    </li>
                    <li>
                      Bu onayla, kuralları ihlal eden içeriğin moderasyonla
                      kaldırılacağını kabul edersiniz.
                    </li>
                    <li>
                      Gizlilik ayarlarınızı (Herkese Açık, Arkadaşlar vb.)
                      seçerek güvenle paylaşırsınız.
                    </li>
                  </ul>
                </div>
              </div>
            </div>{" "}
            {/* .timeline biter */}
          </div>
        </section>

        {/* 3. BÖLÜM: YENİ "BENTO GRID" DEĞERLER YAPISI */}
        <section className={styles.bentoSection}>
          {/* DÜZELTME: 'className_' -> 'className' oldu */}
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>Değerlerimiz: W1'in DNA'sı</h2>
            <div className={styles.bentoGrid}>
              {/* Bu 3 kartın sıralaması ve sınıfları CSS ızgarası için önemlidir */}
              <div className={`${styles.bentoItem} ${styles.bentoItemLarge}`}>
                <strong>Kullanıcı Güvenliği Önceliğimiz</strong>
                <p>
                  Güçlü raporlama araçları ve proaktif moderasyon ekibimizle
                  (ihlallere 6 saat içinde müdahale) herkes için güvenli bir
                  ortam yaratmaya adanmış durumdayız.
                </p>
              </div>

              <div className={styles.bentoItem}>
                <strong>Özgün ve Yenilikçi Tasarım</strong>
                <p>
                  Piyasada eşi benzeri olmayan, tamamen kendi bünyemizde
                  geliştirilen tasarımımızla estetik bir deneyim sunarız.
                </p>
              </div>

              <div className={styles.bentoItem}>
                <strong>Güvenli ve Gizli Bağlantılar</strong>
                <p>
                  Herkese açık akışların ötesinde, güvenli ve özel birebir
                  mesajlaşma sistemimizle gerçek etkileşimler kurun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BÖLÜM: S.S.S. VE YASAL (AdSense için korundu) */}
        <section className={styles.faqSection}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>Sıkça Sorulan Sorular</h2>
            <div className={styles.faqContainer}>
              {/* SSS Sol Sütun */}
              <ul className={styles.faqList}>
                <li className={styles.faqItem}>
                  <h4 className={styles.faqQuestion}>
                    S: İçerik moderasyonunu nasıl sağlıyorsunuz?
                  </h4>
                  <p className={styles.faqAnswer}>
                    İçerik sahipliği onayı, "Rapor Et" özelliği ve hızlı
                    moderasyon ekibimizle çok katmanlı bir yaklaşım uyguluyoruz.
                  </p>
                </li>
              </ul>
              {/* SSS Sağ Sütun */}
              {/* DÜZELTME: 'className_' -> 'className' oldu */}
              <ul className={styles.faqList}>
                <li className={styles.faqItem}>
                  <h4 className={styles.faqQuestion}>
                    S: Hangi tür içeriklere izin verilmiyor?
                  </h4>
                  <p className={styles.faqAnswer}>
                    Yasa dışı, nefret söylemi, şiddet, pornografi veya telif
                    hakkı ihlali içeren içerikler kesinlikle yasaktır. Detaylar
                    için{" "}
                    <Link to="/terms" className={styles.link}>
                      Kullanım Şartları
                    </Link>{" "}
                    sayfamızı inceleyin.
                  </p>
                </li>
              </ul>
            </div>

            {/* Yasal Linkler ve İletişim */}
            <div className={styles.legalSection}>
              <h3 className={styles.legalTitle}>Şeffaflık ve Politikalar</h3>
              <p className={styles.text}>
                Güveniniz bizim için esastır. Platformumuzun nasıl çalıştığı
                konusunda şeffaf olmaya kararlıyız.
              </p>
              <div className={styles.legalLinks}>
                <Link to="/privacy" className={styles.legalLink}>
                  Gizlilik Politikası
                </Link>
                <Link to="/terms" className={styles.legalLink}>
                  Kullanım Şartları
                </Link>
                <Link to="/cookie-policy" className={styles.legalLink}>
                  Çerez Politikası
                </Link>
              </div>
              {/* DÜZELTME: 'className_' -> 'className' oldu */}
              <p className={styles.contactEmail}>
                Sorularınız için:{" "}
                <a
                  href="mailto:w1globalmailbox@gmail.com"
                  className={styles.link}
                >
                  w1globalmailbox@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* KENDİ FOOTER BİLEŞENİNİZ */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>{" "}
      {/* .aboutPage biter */}
    </>
  );
};

export default AboutUs;
