import React from 'react';
import styles from './Licenses.module.css';

const LICENSES = [
  {
    name: "MIT License",
    shortName: "MIT",
    description: "Çok basit, açık kaynak kullanımı için uygun, izin verici lisans.",
    url: "https://opensource.org/licenses/MIT",
  },
  {
    name: "Apache License 2.0",
    shortName: "Apache 2.0",
    description: "Patent lisansları ve katkılar için koruma sağlar, ticari kullanım izinlidir.",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
  },
  {
    name: "GNU General Public License v3.0",
    shortName: "GPL v3",
    description: "Kısıtlayıcı, değiştirilen yazılım da aynı lisansla dağıtılmalı.",
    url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
  },
  {
    name: "BSD 3-Clause License",
    shortName: "BSD 3-Clause",
    description: "MIT benzeri, kullanımda hafif kısıtlamalar vardır.",
    url: "https://opensource.org/licenses/BSD-3-Clause",
  },
  {
    name: "Creative Commons Attribution 4.0",
    shortName: "CC BY 4.0",
    description: "İçerik paylaşımı ve atıf gerektirir, geniş kullanım hakkı verir.",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    name: "Mozilla Public License 2.0",
    shortName: "MPL 2.0",
    description: "Dosya bazlı açık kaynak lisansı, bazı patent koruması sunar.",
    url: "https://www.mozilla.org/en-US/MPL/2.0/",
  },
];

const Licenses = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Lisanslar</h1>
        <p>Projelerde kullanılan yaygın lisanslar ve açıklamaları</p>
      </header>

      <section className={styles.grid}>
        {LICENSES.map(({ name, shortName, description, url }) => (
          <a
            key={shortName}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
            aria-label={`${name} Lisans Detayları`}
          >
            <div className={styles.licenseHeader}>
              <span className={styles.licenseShortName}>{shortName}</span>
              <h2>{name}</h2>
            </div>
            <p>{description}</p>
            <span className={styles.linkText}>Detayları Gör →</span>
          </a>
        ))}
      </section>
    </div>
  );
};

export default Licenses;
