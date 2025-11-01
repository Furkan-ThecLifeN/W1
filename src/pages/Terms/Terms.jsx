// src/pages/Terms/Terms.jsx
import React, { useState, useEffect } from "react"; // useState ve useEffect'i import edin
import { Link } from "react-router-dom";

import styles from "./Terms.module.css";
import Footer from "../../components/Footer/Footer";

// Navigasyon linklerini ve section ID'lerini bir diziye taşıyalım (yönetimi kolaylaştırır)
const navItems = [
  { id: 'bolum1', title: '1. Giriş ve Kabul' },
  { id: 'bolum2', title: '2. Hesap Kullanımı' },
  { id: 'bolum3', title: '3. Kullanıcı İçeriği ve Haklar' },
  { id: 'bolum4', title: '4. Platform Kuralları' },
  { id: 'bolum5', title: '5. Moderasyon ve Fesih' },
  { id: 'bolum6', title: '6. Telif Hakkı (DMCA)' },
  { id: 'bolum7', title: '7. Hizmet ve Reklamcılık' },
  { id: 'bolum8', title: '8. Sorumluluğun Sınırlandırılması' },
  { id: 'bolum9', title: '9. İletişim' },
];

const Terms = () => {
  const lastUpdatedDate = "1 Kasım 2025";

  // Hangi linkin aktif olduğunu takip etmek için state kullanıyoruz
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll (kaydırma) olayını dinlemek için useEffect kullanıyoruz
  useEffect(() => {
    const handleScroll = () => {
      // Sayfanın üstünden ne kadar aşağıda olduğunu belirleyen bir eşik (offset)
      // Navigasyonun yüksekliği veya sabit bir değer olabilir (örn: 150px)
      const offset = 150; 
      
      let currentActiveIndex = 0;

      // Tüm bölümleri (section) kontrol et
      for (let i = 0; i < navItems.length; i++) {
        const section = document.getElementById(navItems[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          
          // Eğer bölümün üst kenarı, belirlediğimiz offset çizgisini geçtiyse
          if (rect.top <= offset) {
            currentActiveIndex = i;
            // O an ekranda olan bölüm bu (veya bu bölüme en yakın olan)
          }
        }
      }

      // Sadece index değiştiyse state'i güncelle (performans için)
      if (currentActiveIndex !== activeIndex) {
        setActiveIndex(currentActiveIndex);
      }
    };

    // Scroll event listener'ını ekle
    window.addEventListener('scroll', handleScroll);

    // Component kaldırıldığında event listener'ı temizle (memory leak önler)
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeIndex]); // activeIndex değiştiğinde de effect'i tetikle

  // Nav linkine tıklandığında anında state'i güncelleyen fonksiyon
  // Bu, scroll'un gecikmesinden daha hızlı hissettirir
  const handleNavClick = (index) => {
    setActiveIndex(index);
    // 'href' etiketi zaten kaydırmayı yapacaktır
  };


  return (
    <>
      {/* Sayfa Başlığı ve SEO Meta Etiketleri */}
      <title>Kullanım Şartları | W1 - QuantumTag</title>
      <meta
        name="description"
        content="W1 (QuantumTag) sosyal platformunun kullanım şartları. İçerik politikamız, moderasyon kurallarımız ve reklamcılık (AdSense) ilkelerimiz hakkında bilgi edinin."
      />
      {/* Diğer meta etiketleri... */}

      <div className={styles.termsPage}>
        <div className={styles.contentWrapper}>
          {/* 1. BÖLÜM: BAŞLIK */}
          <section>
            <h1 className={styles.titleH1}>Kullanım Şartları</h1>
            <p className={styles.lastUpdated}>
              Son Güncelleme: {lastUpdatedDate}
            </p>
          </section>

          {/* 2. BÖLÜM: İKİ SÜTUNLU YAPI */}
          <div className={styles.termsLayout}>
            {/* SOL SÜTUN (Navigasyon) - GÜNCELLENDİ */}
            <aside className={styles.navColumn}>
              <nav className={styles.stickyNav}>
                
                {/* Navigasyon linklerini dizi üzerinden dinamik olarak oluştur */}
                {navItems.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`${styles.navLink} ${
                      activeIndex === index ? styles.active : '' // Aktif class'ı state'e göre belirle
                    }`}
                    onClick={() => handleNavClick(index)} // Tıklama olayını ekle
                  >
                    {item.title}
                  </a>
                ))}

              </nav>
            </aside>

            {/* SAĞ SÜTUN (İçerik) - Değişiklik Yok */}
            <main className={styles.contentColumn}>
              {/* BÖLÜM 1 */}
              <section id="bolum1" className={styles.termsSection}>
                <h2 className={styles.titleH2}>1. Giriş ve Şartların Kabulü</h2>
                <p className={styles.text}>
                  Hoş geldiniz! Bu Kullanım Şartları ("Şartlar"), QuantumTag
                  ("Şirket", "biz") tarafından sağlanan W1 sosyal medya
                  platformuna ("Hizmet", "Platform") erişiminizi ve bu hizmeti
                  kullanmanızı yönetir.
                </p>
                <p className={styles.text}>
                  Hizmetimize erişerek veya kullanarak, bu Şartları,{" "}
                  <Link to="/privacy" className={styles.link}>
                    Gizlilik Politikamızı
                  </Link>{" "}
                  ve{" "}
                  <Link to="/cookie-policy" className={styles.link}>
                    Çerez Politikamızı
                  </Link>{" "}
                  okuduğunuzu, anladığınızı ve bunlara yasal olarak bağlı
                  olduğunuzu kabul edersiniz.
                </p>
              </section>

              {/* BÖLÜM 2 */}
              <section id="bolum2" className={styles.termsSection}>
                <h2 className={styles.titleH2}>2. Hesap Kullanımı</h2>
                <p className={styles.text}>
                  <strong>Yaş Sınırı:</strong> Hizmetimizi kullanmak için en az
                  13 yaşında (veya ülkenizdeki yasal reşit olma yaşında)
                  olmanız gerekmektedir.
                </p>
                <p className={styles.text}>
                  <strong>Hesap Güvenliği:</strong> Hesabınızın (şifreniz dahil)
                  güvenliğinden siz sorumlusunuz. Hesabınız altında gerçekleşen
                  tüm faaliyetlerin sorumluluğu size aittir. Güvenlik ihlallerini
                  derhal bize bildirmelisiniz.
                </p>
              </section>

              {/* BÖLÜM 3 */}
              <section id="bolum3" className={styles.termsSection}>
                <h2 className={styles.titleH2}>3. Kullanıcı İçeriği ve Haklar</h2>
                <p className={styles.text}>
                  Platformumuzda "Feelings" (tweet benzeri gönderiler), "Feeds"
                  (video içerikler), yorumlar, mesajlar ve katıştırılmış
                  bağlantılar ("Kullanıcı İçeriği") paylaşabilirsiniz.
                </p>
                <h3 className={styles.titleH3}>A. İçeriğinizin Sahipliği</h3>
                <p className={styles.text}>
                  W1'de yayınladığınız Kullanıcı İçeriğinin fikri mülkiyet
                  hakları <strong>size aittir</strong>.
                </p>
                <h3 className={styles.titleH3}>B. Bize Verdiğiniz Lisans</h3>
                <p className={styles.text}>
                  İçeriğinizi W1 üzerinde yayınlayarak, bize bu içeriği yalnızca
                  Hizmeti sağlamak, tanıtmak ve iyileştirmek amacıyla
                  kullanmak, barındırmak, çoğaltmak, değiştirmek (örn: mobil
                  cihaza sığdırmak için yeniden boyutlandırmak) ve halka açık
                  olarak göstermek (gönderi gizlilik ayarınıza göre) için
                  münhasır olmayan, telifsiz, dünya çapında geçerli bir lisans
                  vermiş olursunuz.
                </p>
                <p className={styles.text}>
                  Bu lisans, içeriğinizi veya hesabınızı sildiğinizde sona erer.
                </p>
              </section>

              {/* BÖLÜM 4 */}
              <section id="bolum4" className={styles.termsSection}>
                <h2 className={styles.titleH2}>
                  4. Platform Kuralları (Kabul Edilebilir Kullanım)
                </h2>
                <p className={styles.text}>
                  W1, güvenli ve saygılı bir topluluk olmayı hedefler. Aşağıdaki
                  içeriklerin yayınlanması kesinlikle yasaktır ve Google AdSense
                  gibi reklam ortaklarımızın politikaları gereği derhal
                  kaldırılacaktır:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Yasa Dışı Faaliyetler:</strong> Herhangi bir yasa
                    dışı eylemi teşvik eden veya tasvir eden içerikler.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Nefret Söylemi ve Taciz:</strong> Irk, etnik köken,
                    din, cinsiyet, cinsel yönelim veya engellilik temelinde
                    saldıran, taciz eden veya nefret uyandıran içerikler.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Şiddet ve Kan:</strong> Aşırı şiddet, işkence, kan
                    veya kendine zarar vermeyi teşvik eden grafik içerikler.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Yetişkinlere Yönelik ve Cinsel İçerik:</strong>{" "}
                    Pornografi, cinsel içerikli çıplaklık veya cinsel eylemleri
                    tasvir eden her türlü içerik (AdSense için sıfır tolerans).
                  </li>
                  <li className={styles.listItem}>
                    <strong>Telif Hakkı İhlali:</strong> Size ait olmayan veya
                    kullanım hakkınız bulunmayan müzik, video veya görselleri
                    paylaşmak.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Spam ve Kötü Amaçlı Yazılım:</strong> Spam yapmak,
                    "phishing" (kimlik avı) girişimleri veya virüs/malware
                    yayan bağlantılar paylaşmak.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Taklit (Impersonation):</strong> Başka bir kişi veya
                    kurum gibi davranmak.
                  </li>
                </ul>
              </section>

              {/* BÖLÜM 5 */}
              <section id="bolum5" className={styles.termsSection}>
                <h2 className={styles.titleH2}>5. Moderasyon ve Fesih</h2>
                <p className={styles.text}>
                  Hizmeti kullanırken paylaştığınız içerikten{" "}
                  <strong>tamamen siz sorumlusunuz</strong>.
                </p>
                <p className={styles.text}>
                  W1 (QuantumTag), bu Şartları (özellikle Bölüm 4'ü) ihlal eden
                  herhangi bir içeriği, önceden haber vermeksizin, kendi
                  takdirimize bağlı olarak inceleme, işaretleme veya{" "}
                  <strong>kaldırma hakkını saklı tutar</strong>.
                </p>
                <p className={styles.text}>
                  Ağır veya tekrarlanan ihlaller, hesabınızın askıya
                  alınmasına veya kalıcı olarak feshedilmesine yol açabilir.
                </p>
              </section>

              {/* BÖLÜM 6 */}
              <section id="bolum6" className={styles.termsSection}>
                <h2 className={styles.titleH2}>6. Telif Hakkı Politikası (DMCA)</h2>
                <p className={styles.text}>
                  Başka birinin telif hakkını ihlal ettiğini düşündüğünüz
                  içerikleri bize bildirebilirsiniz. Geçerli DMCA (Dijital
                  Milenyum Telif Hakkı Yasası) bildirimlerine yanıt veririz.
                  Tekrarlanan ihlallerde bulunan kullanıcıların hesaplarını
                  kapatmak politikamızdır. Bildirimler için lütfen{" "}
                  <a
                    href="mailto:w1globalmailbox@gmail.com"
                    className={styles.link}
                  >
                    w1globalmailbox@gmail.com
                  </a>{" "}
                  adresine ulaşın.
                </p>
              </section>

              {/* BÖLÜM 7 */}
              <section id="bolum7" className={styles.termsSection}>
                <h2 className={styles.titleH2}>7. Hizmet ve Reklamcılık</h2>
                <p className={styles.text}>
                  Hizmetimiz, Google AdSense veya Ezoic gibi üçüncü taraf
                  reklam ağları tarafından desteklenmektedir. Hizmeti kullanarak,
                  W1'in bu reklamları platform üzerinde göstermesini kabul
                  etmiş olursunuz.
                </p>
                <p className={styles.text}>
                  Platformumuzun altyapısı için Google Firebase gibi arka
                  uç hizmetleri (BaaS) kullanıyoruz. Bu hizmetlerin kendi şart ve
                  koşulları geçerli olabilir.
                </p>
              </section>

              {/* BÖLÜM 8 */}
              <section id="bolum8" className={styles.termsSection}>
                <h2 className={styles.titleH2}>8. Sorumluluğun Sınırlandırılması</h2>
                <p className={styles.text}>
                  Hizmet "olduğu gibi" sunulmaktadır. W1 veya QuantumTag,
                  platformun kesintisiz, hatasız veya güvenli olacağını garanti
                  etmez. Platformu kullanmanızdan kaynaklanan dolaylı veya
                sonuç olarak ortaya çıkan zararlardan sorumlu değiliz.
                </p>
              </section>

              {/* BÖLÜM 9 */}
              <section id="bolum9" className={styles.termsSection}>
                <h2 className={styles.titleH2}>9. Şartlardaki Değişliklikler ve İletişim</h2>
                <p className={styles.text}>
                  Bu Şartları zaman zaman güncelleyebiliriz. Değişiklikler bu
                  sayfada yayınlandığı an yürürlüğe girer. Hizmeti kullanmaya
                  devam etmeniz, güncellenmiş Şartları kabul ettiğiniz anlamına
                  gelir.
                </p>
                <p className={styles.text}>
                  Bu Şartlar hakkında sorularınız varsa, lütfen bizimle şu
                  adresten iletişime geçin:{" "}
                  <a
                    href="mailto:w1globalmailbox@gmail.com"
                    className={styles.link}
                  >
                    w1globalmailbox@gmail.com
                  </a>{" "}
                 
                </p>
              </section>
            </main>
            
          </div> {/* .termsLayout biter */}
        </div>

        {/* FOOTER */}
        <section className={styles.footerSection}>
          <Footer />
        </section>
      </div>
      {/* .termsPage biter */}
    </>
  );
};

export default Terms;