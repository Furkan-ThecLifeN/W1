// src/pages/PrivacyPolicy/PrivacyPolicy.jsx
import React, { useState } from "react"; // useState hook'unu import et
import { Link } from "react-router-dom";

import styles from "./PrivacyPolicy.module.css";
import Footer from "../../components/Footer/Footer";

// Akordeon verilerini yönetmek için bir JSX dizisi oluşturalım.
// Bu, hem kodun daha temiz olmasını sağlar hem de stil sınıflarını (styles.link vb.) doğrudan kullanmamıza olanak tanır.
const policyData = [
  {
    title: "1. Topladığımız Bilgiler",
    content: (
      <>
        <p className={styles.contentText}>
          Hizmetimizi sağlamak ve iyileştirmek için çeşitli türde bilgiler
          topluyoruz.
        </p>
        <h3 className={styles.contentH3}>A. Bize Doğrudan Sağladığınız Bilgiler</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Hesap Bilgileri:</strong> Bir W1 hesabı oluşturduğunuzda,
            kullanıcı adınız, e-posta adresiniz, şifreniz ve (isteğe bağlı
            olarak) profil fotoğrafınız gibi bilgileri toplarız.
          </li>
          <li className={styles.listItem}>
            <strong>Kullanıcı İçeriği:</strong> Platformda oluşturduğunuz veya
            paylaştığınız içerikler. Buna "Feelings" (tweet benzeri), "Feeds"
            (video), fotoğraflar, yorumlar, katıştırdığınız linkler ve
            gönderdiğiniz özel mesajlar dahildir.
          </li>
          <li className={styles.listItem}>
            <strong>İletişim:</strong> Müşteri desteği için bizimle iletişime
            geçtiğinizde (örn:{" "}
            <a
              href="mailto:w1globalmailbox@gmail.com"
              className={styles.link}
            >
              w1globalmailbox@gmail.com
            </a>
            ) sağladığınız bilgiler.
          </li>
        </ul>

        <h3 className={styles.contentH3}>B. Otomatik Olarak Topladığımız Bilgiler</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Kullanım Verileri:</strong> Platformla nasıl etkileşime
            girdiğiniz (görüntülediğiniz içerikler, tıkladığınız bağlantılar,
            arama terimleriniz) hakkında bilgiler toplarız.
          </li>
          <li className={styles.listItem}>
            <strong>Cihaz ve Bağlantı Bilgileri:</strong> IP adresiniz, cihaz
            türünüz (örn: mobil, web), işletim sisteminiz, tarayıcı türünüz ve
            saat diliminiz gibi teknik bilgileri toplarız.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. Bilgilerinizi Nasıl Kullanıyoruz?",
    content: (
      <>
        <p className={styles.contentText}>
          Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            Hizmetimizi (içerik gösterme, mesajlaşma) sağlamak, sürdürmek ve
            iyileştirmek.
          </li>
          <li className={styles.listItem}>
            Deneyiminizi kişiselleştirmek (ilginizi çekebilecek "Feed"ler veya
            kullanıcılar önermek).
          </li>
          <li className={styles.listItem}>
            Platformumuzun güvenliğini sağlamak (sahtekarlığı ve kötüye kullanımı
            tespit etmek, Kullanım Şartlarımızı uygulamak).
          </li>
          <li className={styles.listItem}>
            <strong>Reklamcılık:</strong> Size ve ilgi alanlarınıza uygun,
            kişiselleştirilmiş reklamlar sunmak (Aşağıdaki Bölüm 4'e bakınız).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Bilgilerinizi Nasıl Paylaşıyoruz?",
    content: (
      <>
        <p className={styles.contentText}>
          Kişisel bilgilerinizi izniniz olmadan üçüncü taraflara satmayız. Ancak,
          bilgilerinizi aşağıdaki durumlarla paylaşabiliriz:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Herkese Açık Bilgiler:</strong> Kullanıcı adınız, profil
            resminiz ve "Herkese Açık" olarak ayarladığınız "Feelings" veya
            "Feeds" gönderileriniz herkes tarafından görülebilir.
          </li>
          <li className={styles.listItem}>
            <strong>Hizmet Sağlayıcılar (Firebase):</strong> Uygulamamızın
            altyapısını sağlamak için Google Firebase kullanıyoruz. Firebase,
            veritabanı barındırma, kimlik doğrulama (Authentication) ve analiz
            hizmetleri sağlar. Google'ın bu verileri nasıl işlediği hakkında daha
            fazla bilgiyi{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Google Gizlilik Politikası
            </a>
            'nda bulabilirsiniz.
          </li>
          <li className={styles.listItem}>
            <strong>Reklam Ortakları:</strong> (Bkz. Bölüm 4).
          </li>
          <li className={styles.listItem}>
            <strong>Yasal Yükümlülükler:</strong> Yasal bir talebe (mahkeme
            kararı veya arama emri gibi) uymak için gerekliyse bilgilerinizi
            paylaşabiliriz.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Üçüncü Taraf Reklamcılık ve Çerezler",
    content: (
      <>
        <p className={styles.contentText}>
          Hizmetimizi ücretsiz sunabilmek için Google AdSense ve potansiyel
          olarak diğer üçüncü taraf reklam ağlarını (Ezoic gibi) kullanıyoruz.
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            Üçüncü taraf satıcı olarak Google, sitemizde reklam yayınlamak için
            çerezleri (cookies) kullanır.
          </li>
          <li className={styles.listItem}>
            Google'ın <strong>DART çerezini</strong> kullanması, Hizmetimize ve
            internetteki diğer sitelere yaptığınız ziyaretlere dayalı olarak size
            reklamlar sunmasına olanak tanır.
          </li>
          <li className={styles.listItem}>
            Kullanıcılar,{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Google Reklam ve İçerik Ağı Gizlilik Politikası
            </a>
            'nı ziyaret ederek DART çerezinin kullanılmamasını tercih
            edebilirler.
          </li>
          <li className={styles.listItem}>
            Reklam ortaklarımız, kişiselleştirilmiş reklamlar sunmak için
            çerezler ve web işaretçileri gibi teknolojileri kullanabilir. Bu
            politikaların ayrıntıları için lütfen{" "}
            <Link to="/cookie-policy" className={styles.link}>
              Çerez Politikamızı
            </Link>{" "}
            inceleyin.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Veri Haklarınız ve Seçenekleriniz",
    content: (
      <>
        <p className={styles.contentText}>
          Verileriniz üzerinde kontrole sahipsiniz:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Erişim ve Düzeltme:</strong> Profil ayarlarınızdan hesap
            bilgilerinizi gözden geçirebilir ve güncelleyebilirsiniz.
          </li>
          <li className={styles.listItem}>
            <strong>Hesap Silme:</strong> Hesabınızı istediğiniz zaman silme
            hakkına sahipsiniz.
          </li>
          <li className={styles.listItem}>
            <strong>Kişiselleştirilmiş Reklamları Reddetme:</strong> Google'ın
            reklam ayarları sayfasından veya{" "}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Digital Advertising Alliance (DAA)
            </a>{" "}
            gibi araçlar üzerinden kişiselleştirilmiş reklamcılığı
            reddedebilirsiniz.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Veri Güvenliği ve İletişim",
    content: (
      <>
        <p className={styles.contentText}>
          Verilerinizi korumak için (Firebase'in sağladığı güvenlik önlemleri ve
          aktarım sırasında şifreleme dahil) endüstri standardı teknik ve idari
          güvenlik önlemleri alıyoruz. Ancak, internet üzerinden hiçbir iletim
          yönteminin veya elektronik depolamanın %100 güvenli olmadığını lütfen
          unutmayın.
        </p>
        <p className={styles.contentText}>
          Bu Gizlilik Politikası hakkında herhangi bir sorunuz veya endişeniz
          varsa, lütfen bize şu adresten ulaşın:{" "}
          <a
            href="mailto:w1globalmailbox@gmail.com"
            className={styles.link}
          >
            w1globalmailbox@gmail.com
          </a>
        </p>
      </>
    ),
  },
  // İhtiyaca göre daha fazla bölüm ekleyebilirsiniz
];

// Ana Akordeon Bileşeni
const AccordionItem = ({ title, content, index, openIndex, setOpenIndex }) => {
  const isOpen = index === openIndex;

  const handleToggle = () => {
    setOpenIndex(isOpen ? null : index); // Tıklanana aç, açıksa kapat
  };

  return (
    <div className={styles.accordionItem}>
      <button
        className={`${styles.accordionHeader} ${isOpen ? styles.active : ""}`}
        onClick={handleToggle}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <span className={styles.accordionIcon}>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <section className={styles.accordionContent}>{content}</section>
      )}
    </div>
  );
};

// Sayfa Bileşeni
const PrivacyPolicy = () => {
  const lastUpdatedDate = "1 Kasım 2025";
  const [openIndex, setOpenIndex] = useState(0); // 0 = İlk akordeon varsayılan olarak açık

  return (
    <>
      {/* Sayfa Başlığı ve SEO Meta Etiketleri */}
      <title>Gizlilik Politikası | W1 - QuantumTag</title>
      <meta
        name="description"
        content="W1 (QuantumTag) platformunun kullanıcı verilerini nasıl topladığını, işlediğini, paylaştığını ve koruduğunu öğrenin. Reklamcılık ve çerez politikalarımız."
      />
      <meta property="og:title" content="Gizlilik Politikası | W1" />
      <meta
        property="og:description"
        content="W1 olarak gizliliğinize nasıl değer verdiğimizi ve verilerinizi nasıl koruduğumuzu inceleyin."
      
      />
      <meta property="og:url" content="https://www.siteniz.com/privacy" />

      <div className={styles.policyPage}>
        <div className={styles.contentWrapper}>
          {/* 1. BÖLÜM: BAŞLIK */}
          <section>
            <h1 className={styles.titleH1}>Gizlilik Politikası</h1>
            <p className={styles.lastUpdated}>
              Son Güncelleme: {lastUpdatedDate}
            </p>
          </section>

          {/* 2. BÖLÜM: MODERN AKORDEON İÇERİĞİ */}
          <section className={styles.accordionContainer}>
            {policyData.map((item, index) => (
              <AccordionItem
                key={index}
                index={index}
                title={item.title}
                content={item.content}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
              />
            ))}
          </section>
        </div>

        {/* 3. BÖLÜM: FOOTER */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>
      {/* .policyPage biter */}
    </>
  );
};

export default PrivacyPolicy;