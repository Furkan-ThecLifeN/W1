// src/pages/AboutUs.jsx

import React from 'react';
import { Link } from 'react-router-dom'; 

// ARTIK GEREKLİ DEĞİL: import { Helmet } from 'react-helmet-async'; 

// Stil dosyamızı MODÜL olarak içe aktarıyoruz
import styles from './AboutUs.module.css';

// Sizin Footer bileşeninizi içe aktarıyoruz
import Footer from '../../components/Footer/Footer'; 

const AboutUs = () => {
  return (
    <>
      {/* React 19 ile Helmet'e GEREK YOKTUR.
        Tüm <title> ve <meta> etiketlerini doğrudan buraya yazabilirsiniz.
      */}
      <title>Hakkımızda | W1 - QuantumTag</title>
      <meta name="description" content="QuantumTag'in W1 platformu, özgün bağlantılar ve güvenli bir sosyal deneyim sunar. Misyonumuz, değerlerimiz ve sorumluluk taahhüdümüz hakkında bilgi edinin." />
      
      {/* Open Graph (Facebook, LinkedIn, vb. için) */}
      <meta property="og:title" content="Hakkımızda | W1 - Geleceğin Sosyal Platformu" />
      <meta property="og:description" content="QuantumTag'in W1 platformu, özgün bağlantılar ve güvenli bir sosyal deneyim sunar." />
      
      {/* !!! AŞAĞIDAKİ BU İKİ SATIRI KENDİ URL'LERİNİZLE GÜNCELLEYİN !!! */}
      <meta property="og:image" content="https://www.siteniz.com/w1-og-image.png" /> 
      <meta property="og:url" content="https://www.siteniz.com/hakkimizda" />
      
      <meta property="og:type" content="website" />
      
      {/* Twitter Card (Twitter'da paylaşım için) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Hakkımızda | W1 - Geleceğin Sosyal Platformu" />
      <meta name="twitter:description" content="QuantumTag'in W1 platformu, özgün bağlantılar ve güvenli bir sosyal deneyim sunar." />
      
      {/* !!! AŞAĞIDAKİ SATIRI KENDİ GÖRSELİNİZLE GÜNCELLEYİN !!! */}
      <meta name="twitter:image" content="https://www.siteniz.com/w1-twitter-image.png" />

      {/* <Helmet> etiketleri buradan kaldırıldı */}

      <div className={styles.container}>

        {/* 1. BÖLÜM: HERO */}
        <section id="hero" className={styles.section}>
          <h1 className={styles.titleH1}>Senin dünyan için bir alan.</h1>
          <p className={styles.heroText}>
            <strong>QuantumTag</strong> tarafından geliştirilen yeni nesil sosyal medya platformu W1'e hoş geldiniz.
            Gerçek zamanlı metin akışlarını, çarpıcı fotoğraf gönderilerini ve
            büyüleyici video keşiflerini bir araya getirerek, benzersiz, ilgi çekici ve güvenli bir dijital buluşma noktası sunuyoruz.
          </p>
          <Link to="/kesfet" className={styles.ctaButton}>Akışı Keşfet</Link>
        </section>

        {/* 2. BÖLÜM: MİSYON & VİZYON (2 Sütunlu Izgara) */}
        <section id="mission-vision" className={styles.section}>
          <h2 className={styles.titleH2}>Amacımız</h2>
          <div className={styles.twoColumnGrid}>
            <div className={styles.gridItem}>
              <h3 className={styles.gridItemTitle}>Misyonumuz</h3>
              <p className={styles.text}>
                Kullanıcıların dünyalarını özgürce paylaşabildiği, özgün bağlar kurabildiği ve
                ilham verici içerikleri güvenle keşfedebildiği bir platform sağlamak; tüm bunları
                benzersiz tasarımlı ve kullanıcı odaklı bir ortamda gerçekleştirmek.
              </p>
            </div>
            <div className={styles.gridItem}>
              <h3 className={styles.gridItemTitle}>Vizyonumuz</h3>
              <p className={styles.text}>
                Saygı, yaratıcılık ve otantik bağlantılar üzerine kurulu küresel bir topluluğu teşvik ederek,
                bir sosyal platformun hem inovatif hem de sorumlu olabileceğini kanıtlamak.
              </p>
            </div>
          </div>
        </section>

        {/* 3. BÖLÜM: DEĞERLER */}
        <section id="values" className={styles.section}>
          <h2 className={styles.titleH2}>Temel Değerlerimiz</h2>
          <ul className={styles.valuesList}>
            <li className={styles.valueItem}>
              <strong>Kullanıcı Güvenliği Önceliğimiz</strong>
              <p className={styles.text}>
                Platformumuz saygı temelinde inşa edilmiştir. Güçlü raporlama araçları ve proaktif bir moderasyon ekibiyle,
                herkes için güvenli bir ortam yaratmaya adanmış durumdayız.
              </p>
            </li>
            <li className={styles.valueItem}>
              <strong>Özgün ve Yenilikçi Tasarım</strong>
              <p className={styles.text}>
                Orijinalliğe inanıyoruz. Tamamen kendi bünyemizde geliştirilen, piyasada eşi benzeri olmayan tasarımımız,
                sezgisel ve estetik bir kullanıcı deneyimi sunar.
              </p>
            </li>
            <li className={styles.valueItem}>
              <strong>Kontrollü Yaratıcı İfade Özgürlüğü</strong>
              <p className={styles.text}>
                Hikayenizi kendi tarzınızla paylaşma gücünü size veriyoruz. Metin, fotoğraf ve video linkleri için
                detaylı gizlilik kontrolleriyle (Herkese Açık, Arkadaşlar, Yakın Arkadaşlar, Sadece Ben)
                içeriğinizin kontrolü sizde.
              </p>
            </li>
            <li className={styles.valueItem}>
              <strong>Güvenli ve Gizli Bağlantılar</strong>
              <p className={styles.text}>
                Herkese açık akışların ötesinde, güvenli ve özel birebir mesajlaşma sistemimiz sayesinde
                arkadaşlarınızla korunmuş bir ortamda gerçek etkileşimler kurabilirsiniz.
              </p>
            </li>
          </ul>
        </section>
        
        {/* 4. BÖLÜM: HİKAYEMİZ */}
        <section id="story" className={styles.section}>
          <h2 className={styles.titleH2}>W1'in Doğuşu</h2>
          <p className={styles.text}>
            W1, "Bir sosyal platform hem estetik hem de sorumlu olabilir mi?" sorusuyla doğdu.
            <strong>QuantumTag</strong> ekibi olarak çıktığımız bu yolda, kesintisiz, hızlı ve güvenilir bir web uygulaması
            oluşturmak için sayısız teknik zorluğun üstesinden geldik. Amacımız sadece bir akış yaratmak değil;
            büyüyen ve daha iyi bir sosyal alan sunmayı hedefleyen kalıcı bir topluluk inşa etmektir.
            Geleceğe yönelik büyük planlarımızla, her bir gönderiyle daha iyi bir sosyal deneyim yaratmaya odaklanmış durumdayız.
          </p>
        </section>

        {/* 5. BÖLÜM: SORUMLU PAYLAŞIM (AdSense için hayati) */}
        <section id="how-it-works" className={styles.section}>
          <h2 className={styles.titleH2}>Sorumlu Paylaşım Taahhüdümüz</h2>
          <p className={styles.text}>
            İçerik sorumluluğunu platformumuzun merkezine koyuyoruz. İşte detaylar:
          </p>
          <ol className={styles.stepsList}>
            <li className={styles.stepItem}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Gönderinizi Oluşturun:</strong>
                <p>Metninizi yazın veya fotoğraf/video embed linkinizi ekleyin, kendinizi ifade edin.</p>
              </div>
            </li>
            <li className={styles.stepItem}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Sahipliği Onaylayın:</strong>
                <p>Yayınlamadan önce, içeriğin size ait olduğunu ve tüm yasal kurallara ve platform politikalarına uyduğunu onaylayan bir kutucuğu <strong>işaretlemeniz zorunludur.</strong></p>
              </div>
            </li>
            <li className={styles.stepItem}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Moderasyonu Kabul Edin:</strong>
                <p>Bu onay kutusu, içeriğinizin kuralları ihlal etmesi durumunda (raporlama veya moderasyon yoluyla) tespit edildikten sonra kaldırılacağını anladığınızı da teyit eder.</p>
              </div>
            </li>
            <li className={styles.stepItem}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Gizliliği Ayarlayın ve Paylaşın:</strong>
                <p>Gönderinizin kimler tarafından görüleceğini belirleyin (Herkese Açık, Arkadaşlar vb.) ve güvenle paylaşın.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 6. BÖLÜM: S.S.S. (AdSense için) */}
        <section id="faq" className={styles.section}>
          <h2 className={styles.titleH2}>Sıkça Sorulan Sorular</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>S: İçerik moderasyonunu ve güvenliği nasıl sağlıyorsunuz?</h4>
              <p className={styles.faqAnswer}>
                Güvenliği son derece ciddiye alıyoruz. İçerik sahipliği onayı, "Rapor Et" özelliği ve ihlal eden içerikleri <strong>6 saat içinde</strong> kaldıran özel moderasyon ekibimizle çok katmanlı bir yaklaşım uyguluyoruz.
              </p>
            </li>
            <li className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>S: Platformunuzda hangi tür içeriklere izin verilmiyor?</h4>
              <p className={styles.faqAnswer}>
                Yasa dışı, nefret söylemi içeren, şiddet içeren, pornografik veya telif hakkını ihlal eden her türlü içerik kesinlikle yasaktır. Detaylar için lütfen <Link to="/terms" className={styles.link}>Kullanım Şartları</Link> sayfamızı inceleyin.
              </p>
            </li>
            <li className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>S: Verilerim ve mesajlarım güvende mi?</h4>
              <p className={styles.faqAnswer}>
                Evet, özel mesajlarınız güvendedir. Kişisel verilerinizi satmıyoruz ve veri işleme uygulamalarımız <Link to="/privacy" className={styles.link}>Gizlilik Politikamızda</Link> şeffaf bir şekilde detaylandırılmıştır.
              </p>
            </li>
          </ul>
        </section>

        {/* 7. BÖLÜM: ŞEFFAFLIK VE POLİTİKALAR (AdSense için Zorunlu) */}
        <section id="legal" className={styles.section}>
          <h2 className={styles.titleH2}>Şeffaflık ve Politikalar</h2>
          <p className={styles.text}>
            Güveniniz bizim için esastır. Platformumuzun nasıl çalıştığı, verileri nasıl kullandığımız, reklamları nasıl sunduğumuz ve topluluğu nasıl güvende tuttuğumuz konusunda şeffaf olmaya kararlıyız.
          </p>
          <div className={styles.legalLinks}>
            <p>
              <Link to="/privacy" className={styles.legalLink}>Gizlilik Politikası</Link>
              <Link to="/terms" className={styles.legalLink}>Kullanım Şartları</Link>
              <Link to="/cookie-policy" className={styles.legalLink}>Çerez Politikası</Link>
            </p>
          </div>
        </section>
        
        {/* 8. BÖLÜM: İLETİŞİM */}
        <section id="contact" className={styles.section}>
          <h2 className={styles.titleH2}>İletişime Geçin</h2>
          <p className={styles.text}>
            Sorularınız, geri bildirimleriniz veya iş birliği talepleriniz mi var? Sizden haber almak isteriz.
            Ekibimiz gelen kutumuzu yakından takip eder ve genellikle 24 saat içinde tüm sorulara yanıt verir.
          </p>
          <p className={styles.contactEmail}>
            <strong>E-posta:</strong> 
            <a href="mailto:w1globalmailbox@gmail.com">w1globalmailbox@gmail.com</a>
          </p>
          <p style={{textAlign: 'center', marginTop: '3rem'}}>
            <Link to="/kayit-ol" className={styles.ctaButton}>W1'e Bugün Katılın</Link>
          </p>
        </section>

        {/* KENDİ FOOTER BİLEŞENİNİZİ BURADA ÇAĞIRIYORSUNUZ */}
        <section className={styles.footerSection}>
          <Footer />
        </section>

      </div>
    </>
  );
};

export default AboutUs;