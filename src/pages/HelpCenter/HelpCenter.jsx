// src/pages/HelpCenter/HelpCenter.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUserCog,
  FaShieldAlt,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";

import styles from "./HelpCenter.module.css";
import Footer from "../../components/Footer/Footer";

// --- Yardım Konuları ve Cevapları ---
// Burayı kendi platformunuz (W1) için dilediğiniz gibi genişletebilirsiniz.
const allHelpTopics = [
  {
    category: "hesap",
    question: "W1 hesabımı nasıl oluştururum?",
    answer:
      'Ana sayfadaki "Kaydol" butonuna tıklayarak e-posta adresiniz ve belirleyeceğiniz bir şifre ile hızlıca hesap oluşturabilirsiniz.',
  },
  {
    category: "hesap",
    question: "Şifremi unuttum, ne yapmalıyım?",
    answer:
      'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayın. E-posta adresinize bir sıfırlama bağlantısı göndereceğiz.',
  },
  {
    category: "kullanim",
    question: '"Feeling" ve "Feed" arasındaki fark nedir?',
    answer:
      '"Feeling", kısa metin tabanlı düşüncelerinizi paylaştığınız gönderilerdir. "Feed" ise video ve fotoğraf odaklı paylaşımlarınızdır.',
  },
  {
    category: "kullanim",
    question: "Nasıl gönderi paylaşabilirim?",
    answer:
      'Ana akış sayfanızdayken, alt menüdeki "+" ikonuna tıklayarak "Feeling" veya "Feed" seçeneklerinden birini seçip içeriğinizi oluşturabilirsiniz.',
  },
  {
    category: "guvenlik",
    question: "Profilimi nasıl gizli yapabilirim?",
    answer:
      '"Ayarlar" > "Gizlilik ve Güvenlik" menüsü altından "Hesabı Gizle" seçeneğini aktif hale getirebilirsiniz. Bu durumda sizi sadece onayladığınız kişiler takip edebilir.',
  },
  {
    category: "kurallar",
    question: "Bir kullanıcıyı nasıl rapor ederim?",
    answer:
      'Rapor etmek istediğiniz kullanıcının profiline veya gönderisine gidin. Sağ üst köşedeki üç nokta (...) menüsünden "Rapor Et" seçeneğini seçin ve nedeni belirtin. Moderasyon ekibimiz 6 saat içinde inceleyecektir.',
  },
  {
    category: "kurallar",
    question: "Hangi içerikler yasaktır?",
    answer: (
      <>
        W1 platformunda güvenliğe çok önem veriyoruz. Nefret söylemi, şiddet,
        yasa dışı faaliyetler ve telif hakkı ihlalleri kesinlikle yasaktır. Tüm
        detaylar için lütfen{" "}
        <Link to="/terms" className={styles.link}>
          Kullanım Şartları
        </Link>{" "}
        sayfamızı inceleyin.
      </>
    ),
  },
];
// --- --- ---

// Akordeon Bileşeni (PrivacyPolicy sayfasındakine benzer)
const AccordionItem = ({ topic, isOpen, onClick }) => {
  return (
    <div className={styles.accordionItem}>
      <button className={styles.accordionHeader} onClick={onClick}>
        <span>{topic.question}</span>
        <span className={styles.accordionIcon}>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className={styles.accordionContent}>
          <p className={styles.text}>{topic.answer}</p>
        </div>
      )}
    </div>
  );
};

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openAccordion, setOpenAccordion] = useState(null);

  // Arama filtrelemesi
  const filteredTopics = allHelpTopics.filter(
    (topic) =>
      topic.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof topic.answer === "string" &&
        topic.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAccordionClick = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <>
      <title>Yardım Merkezi | W1 - QuantumTag</title>
      <meta
        name="description"
        content="W1 (QuantumTag) Yardım Merkezi. Hesabınız, gizlilik ayarlarınız ve platformu kullanma hakkında sıkça sorulan soruların yanıtlarını bulun."
      />
      <meta
        property="og:title"
        content="W1 Yardım Merkezi | Size Nasıl Yardım Edebiliriz?"
      />
      <meta property="og:url" content="https://www.siteniz.com/help" />

      <div className={styles.helpPage}>
        {/* 1. BÖLÜM: HERO (Arama Çubuğu) */}
        <section className={styles.heroSection}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.titleH1}>Size nasıl yardımcı olabiliriz?</h1>
            <p className={styles.heroText}>
              Aklınıza takılan bir soruyu arayın veya kategorilere göz atın.
            </p>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Örn: Şifremi nasıl sıfırlarım?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 2. BÖLÜM: KATEGORİLER (AboutUs'taki Bento Grid benzeri) */}
        <section className={styles.categoriesSection}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>Kategoriler</h2>
            <div className={styles.categoryGrid}>
              {/* Bu linkler aşağıdaki 'faqSection' içindeki id'lere gider */}
              <a href="#kategori-hesap" className={styles.categoryCard}>
                <FaUserCog className={styles.categoryIcon} />
                <h3 className={styles.categoryTitle}>Hesap Yönetimi</h3>
              </a>
              <a href="#kategori-kullanim" className={styles.categoryCard}>
                <FaPaperPlane className={styles.categoryIcon} />
                <h3 className={styles.categoryTitle}>Platform Kullanımı</h3>
              </a>
              <a href="#kategori-guvenlik" className={styles.categoryCard}>
                <FaShieldAlt className={styles.categoryIcon} />
                <h3 className={styles.categoryTitle}>Güvenlik ve Gizlilik</h3>
              </a>
              <a href="#kategori-kurallar" className={styles.categoryCard}>
                <FaQuestionCircle className={styles.categoryIcon} />
                <h3 className={styles.categoryTitle}>Kurallar ve Raporlama</h3>
              </a>
            </div>
          </div>
        </section>

        {/* 3. BÖLÜM: S.S.S. (Akordeon Menü) */}
        <section className={styles.faqSection}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>Sıkça Sorulan Sorular</h2>

            {/* Arama terimi yoksa kategorilere göre grupla */}
            {searchTerm === "" ? (
              <>
                <h3 id="kategori-hesap" className={styles.categorySubTitle}>
                  Hesap Yönetimi
                </h3>
                {allHelpTopics
                  .filter((t) => t.category === "hesap")
                  .map((topic, index) => (
                    <AccordionItem
                      key={`hesap-${index}`}
                      topic={topic}
                      isOpen={openAccordion === `hesap-${index}`}
                      onClick={() => handleAccordionClick(`hesap-${index}`)}
                    />
                  ))}

                <h3 id="kategori-kullanim" className={styles.categorySubTitle}>
                  Platform Kullanımı
                </h3>
                {allHelpTopics
                  .filter((t) => t.category === "kullanim")
                  .map((topic, index) => (
                    <AccordionItem
                      key={`kullanim-${index}`}
                      topic={topic}
                      isOpen={openAccordion === `kullanim-${index}`}
                      onClick={() => handleAccordionClick(`kullanim-${index}`)}
                    />
                  ))}

                <h3 id="kategori-guvenlik" className={styles.categorySubTitle}>
                  Güvenlik ve Gizlilik
                </h3>
                {allHelpTopics
                  .filter((t) => t.category === "guvenlik")
                  .map((topic, index) => (
                    <AccordionItem
                      key={`guvenlik-${index}`}
                      topic={topic}
                      isOpen={openAccordion === `guvenlik-${index}`}
                      onClick={() => handleAccordionClick(`guvenlik-${index}`)}
                    />
                  ))}

                <h3 id="kategori-kurallar" className={styles.categorySubTitle}>
                  Kurallar ve Raporlama
                </h3>
                {allHelpTopics
                  .filter((t) => t.category === "kurallar")
                  .map((topic, index) => (
                    <AccordionItem
                      key={`kurallar-${index}`}
                      topic={topic}
                      isOpen={openAccordion === `kurallar-${index}`}
                      onClick={() => handleAccordionClick(`kurallar-${index}`)}
                    />
                  ))}
              </>
            ) : (
              // Arama terimi varsa, filtrelenmiş sonuçları göster
              <>
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, index) => (
                    <AccordionItem
                      key={`search-${index}`}
                      topic={topic}
                      isOpen={openAccordion === index}
                      onClick={() => handleAccordionClick(index)}
                    />
                  ))
                ) : (
                  <p className={styles.noResults}>
                    Aramanızla eşleşen bir sonuç bulunamadı.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* 4. BÖLÜM: İLETİŞİM ÇAĞRISI (AdSense için Önemli) */}
        <section className={styles.contactCtaSection}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.titleH2}>Aradığınızı bulamadınız mı?</h2>
            <p className={styles.text}>
              Sorun değil. W1 destek ekibiyle doğrudan iletişime geçebilirsiniz.
            </p>
            <Link to="/contact" className={styles.ctaButton}>
              Bize Ulaşın
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>
    </>
  );
};

export default HelpCenter;