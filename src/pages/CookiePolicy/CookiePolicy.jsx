// src/pages/CookiePolicy/CookiePolicy.jsx
import React from "react";
import { Link } from "react-router-dom";

import styles from "./CookiePolicy.module.css";
import Footer from "../../components/Footer/Footer";

const CookiePolicy = () => {
  const lastUpdatedDate = "1 Kasım 2025";

  return (
    <>
      {/* Sayfa Başlığı ve SEO Meta Etiketleri */}
      <title>Çerez Politikası | W1 - QuantumTag</title>
      <meta
        name="description"
        content="W1 (QuantumTag) platformunun hangi çerezleri (cookies) kullandığını, bu çerezlerin (reklamcılık, analitik) neden kullanıldığını ve nasıl yönetileceğini öğrenin."
      />
      <meta property="og:title" content="Çerez Politikası | W1" />
      <meta
        property="og:description"
        content="W1'de daha iyi bir deneyim ve kişiselleştirilmiş reklamlar sunmak için çerezleri nasıl kullandığımızı inceleyin."
      
      />
      <meta property="og:url" content="https://www.siteniz.com/cookie-policy" />

      <div className={styles.policyPage}>
        <div className={styles.contentWrapper}>
          {/* 1. BÖLÜM: BAŞLIK */}
          <section>
            <h1 className={styles.titleH1}>Çerez Politikası</h1>
            <p className={styles.lastUpdated}>
              Son Güncelleme: {lastUpdatedDate}
            </p>
            <p className={styles.introText}>
              W1 olarak, platformumuzu daha işlevsel, güvenli ve kişisel hale
              getirmek için çerezler (cookies) ve benzeri teknolojiler
              kullanıyoruz. Bu politika, hangi çerezleri neden kullandığımızı ve
              bunları nasıl kontrol edebileceğinizi açıklar.
            </p>
          </section>

          {/* 2. BÖLÜM: ÇEREZ KATEGORİLERİ (BENTO GRID) */}
          {/* AboutUs'taki Bento Grid yapısı */}
          <section className={styles.bentoGrid}>
            {/* KART 1: GEREKLİ ÇEREZLER */}
            <div className={styles.bentoItem}>
              <strong className={styles.bentoTitle}>
                1. Zorunlu Çerezler
              </strong>
              <p className={styles.bentoText}>
                Bu çerezler, platformumuzun temel işlevleri için gereklidir.
                Oturum açma bilgilerinizi hatırlamak (Authentication), güvenlik
                önlemlerini uygulamak ve platformda gezinmenizi sağlamak gibi
                işlemler için kullanılırlar.
              </p>
            </div>

            {/* KART 2: REKLAMCILIK (BÜYÜK KART) - AdSense/Ezoic için En Önemlisi */}
            <div className={`${styles.bentoItem} ${styles.bentoItemLarge}`}>
              <strong className={styles.bentoTitle}>
                2. Reklamcılık Çerezleri (Üçüncü Taraf)
              </strong>
              <p className={styles.bentoText}>
                Hizmetimizi ücretsiz sunabilmek için Google AdSense ve Ezoic
                gibi üçüncü taraf reklam ortaklarıyla çalışıyoruz.
              </p>
              <p className={styles.bentoText}>
                Bu ortaklar, ilgi alanlarınıza dayalı kişiselleştirilmiş
                reklamlar sunmak için çerezler kullanır. Örneğin, Google'ın
                <strong> DART çerezi</strong>, sizin sitemize ve internetteki
                diğer sitelere yaptığınız ziyaretlere dayalı reklamlar sunar.
              </p>
              <p className={styles.bentoText}>
                Bu çerezler, reklamların kaç kez gösterildiğini ölçmek ve reklam
                sahtekarlığını önlemek için de kullanılır.
              </p>
            </div>

            {/* KART 3: ANALİTİK ÇEREZLER */}
            <div className={styles.bentoItem}>
              <strong className={styles.bentoTitle}>
                3. Performans ve Analitik Çerezler
              </strong>
              <p className={styles.bentoText}>
                Platformu nasıl kullandığınızı (hangi "Feed"lere baktığınız,
                hangi özellikleri kullandığınız) anlamak için (Google Analytics
                aracılığıyla - Firebase'e bağlı olarak) anonim veriler
                toplarız. Bu veriler, hataları ayıklamamıza ve W1 deneyimini
                iyileştirmemize yardımcı olur.
              </p>
            </div>

            {/* KART 4: İŞLEVSELLİK ÇEREZLERİ */}
            <div className={styles.bentoItem}>
              <strong className={styles.bentoTitle}>
                4. İşlevsellik Çerezleri
              </strong>
              <p className={styles.bentoText}>
                Bu çerezler, tercihlerinizi (dil seçimi, tema ayarları gibi)
                hatırlamamızı sağlar. "Beni Hatırla" seçeneği bu tür bir çerez
                kullanır. Amacı, platformu her ziyaret ettiğinizde ayar
                yapmamanız için deneyiminizi kişiselleştirmektir.
              </p>
            </div>
          </section>

          {/* 3. BÖLÜM: ÇEREZ YÖNETİMİ */}
          <section className={styles.managementSection}>
            <h2 className={styles.managementTitle}>
              Çerezleri Nasıl Yönetirsiniz?
            </h2>
            <p className={styles.managementText}>
              Platformumuza ilk girdiğinizde size sunulan **Çerez İzin
              Yönetimi (CMP)** aracı (çerez banner'ı) üzerinden tercihlerinizi
              belirleyebilirsiniz.
            </p>
            <p className={styles.managementText}>
              Ayrıca, tarayıcınızın ayarlarından çerezleri engelleyebilir veya
              silebilirsiniz. Ancak, zorunlu çerezleri engellemek, W1
              platformunun bazı özelliklerinin çalışmamasına neden olabilir.
            </p>
            <p className={styles.managementText}>
              Kişiselleştirilmiş reklamcılıktan çıkmak için (opt-out) şu
              bağlantıları ziyaret edebilirsiniz:
              <br />
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Google Reklam Ayarları
              </a>{" "}
              veya{" "}
              <a
                href="https://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                DAA Opt-Out Portalı
              </a>
              .
            </p>
          </section>
        </div>

        {/* 4. BÖLÜM: FOOTER */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>
      {/* .policyPage biter */}
    </>
  );
};

export default CookiePolicy;