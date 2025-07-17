import React from "react";
import styles from "./AboutApp.module.css";

const AboutApp = () => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Hakkımızda</h1>

      <section className={styles.section}>
        <h2>W1 Nedir?</h2>
        <p>
          W1, modern dijital etkileşimleri tek bir güçlü platformda birleştiren bir sosyal medya deneyimidir.
          Kullanıcılar özgün içerikler paylaşabilir, sesli odalarda buluşabilir, kısa videolar keşfedebilir ve müzikle derin bağlar kurabilir.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Temel Özellikler</h2>
        <ul>
          <li><strong>Feelings:</strong> Kısa, düşünce odaklı içerikler paylaşabileceğiniz mikro yazı formatı.</li>
          <li><strong>Feeds:</strong> 15-60 saniyelik kısa videolarla ilham verici, eğlenceli veya bilgilendirici içerikler.</li>
          <li><strong>EchoRooms:</strong> Topluluklarla sesli etkileşim kurabileceğiniz sanal alanlar.</li>
          <li><strong>SoundWave:</strong> Müzik keşfi yapabileceğiniz, beğendiğiniz parçaları arkadaşlarınızla paylaşabileceğiniz özel alan.</li>
          <li><strong>CreatorPay:</strong> Reklam destekli içeriklerden gelir elde etme sistemiyle içerik üreticileri için kazanç imkanı.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Vizyonumuz</h2>
        <p>
          W1, sadece zaman geçirilen bir platform değil, aynı zamanda yaratıcılığı teşvik eden, toplulukları bir araya getiren
          ve bireylerin dijital dünyada değer üretmesini sağlayan bir evrendir.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Gizlilik ve Güvenlik</h2>
        <p>
          W1 olarak kullanıcı verilerini şeffaf ve güvenli bir şekilde işleriz. Gizlilik politikamız ve kullanıcı sözleşmemiz çerçevesinde
          herkesin dijital alanda kendini güvende hissetmesi bizim önceliğimizdir.
        </p>
      </section>
    </div>
  );
};

export default AboutApp;
