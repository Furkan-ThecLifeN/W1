import React from 'react';
import styles from './TermsAndConditions.module.css';

const TermsAndConditions = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Kullanım Şartları</h1>
        <p>Bu sözleşme, uygulamamızın kullanım koşullarını ve kullanıcı haklarını belirler.</p>
      </header>

      <article className={styles.content}>
        <section>
          <h2>1. Kabul ve Koşullar</h2>
          <p>
            Bu uygulamayı kullanarak, bu kullanım şartlarını kabul etmiş sayılırsınız. 
            Lütfen tüm şartları dikkatlice okuyunuz.
          </p>
        </section>

        <section>
          <h2>2. Kullanıcı Hesapları</h2>
          <p>
            Uygulamayı kullanmak için doğru ve güncel bilgilerle hesap oluşturmanız gerekmektedir.
            Hesabınızın güvenliğini sağlamak size aittir.
          </p>
        </section>

        <section>
          <h2>3. Gizlilik ve Veri Kullanımı</h2>
          <p>
            Kişisel verileriniz gizlilik politikamız çerçevesinde korunur ve üçüncü taraflarla paylaşılmaz.
            Detaylar için lütfen gizlilik politikamızı inceleyiniz.
          </p>
        </section>

        <section>
          <h2>4. İçerik ve Davranış Kuralları</h2>
          <p>
            Platformda paylaşılan içeriklerin yasalara uygun, etik ve diğer kullanıcıları rahatsız etmeyecek nitelikte olması gerekir.
            Yasak içerikler silinir ve hesaplar askıya alınabilir.
          </p>
        </section>

        <section>
          <h2>5. Sorumluluk Sınırlaması</h2>
          <p>
            Uygulama, kesintisiz ve hatasız hizmet garantisi vermez. Oluşabilecek veri kaybı, zararlardan sorumlu değildir.
          </p>
        </section>

        <section>
          <h2>6. Değişiklikler</h2>
          <p>
            Bu sözleşme zaman zaman güncellenebilir. Güncellemeler sonrası uygulamanın kullanımı yeni şartların kabulü anlamına gelir.
          </p>
        </section>

        <section>
          <h2>7. İletişim</h2>
          <p>
            Sorularınız için <span className={styles.mail}>furkantheclifen@gmail.com</span> adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </section>
      </article>
    </div>
  );
};

export default TermsAndConditions;
