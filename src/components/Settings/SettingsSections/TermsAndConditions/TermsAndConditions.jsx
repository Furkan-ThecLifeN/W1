import React, { useState } from 'react';
import styles from './TermsAndConditions.module.css';

const SECTIONS = [
  { id: 'giris', title: '1. Introduction & Acceptance' },
  { id: 'hesap', title: '2. Account Security' },
  { id: 'icerik', title: '3. Content & Sharing' },
  { id: 'davranis', title: '4. Community Guidelines' },
  { id: 'telif', title: '5. Intellectual Property' },
  { id: 'sorumluluk', title: '6. Liability Disclaimer' },
  { id: 'degisiklik', title: '7. Changes' },
  { id: 'iletisim', title: '8. Contact' },
];

const TermsOfUse = () => {
  const [activeSection, setActiveSection] = useState('giris');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.wrapper}>
        {/* Header Area */}
        <header className={styles.header}>
          <div className={styles.lastUpdated}>Last Updated: December 4, 2025</div>
          <h1 className={styles.pageTitle}>Terms of Use</h1>
          <p className={styles.pageSubtitle}>
            A set of rules designed to ensure you can enjoy and use our platform safely.
          </p>
        </header>

        <div className={styles.contentLayout}>
          {/* Left Sidebar - Sticky */}
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              <span className={styles.navTitle}>Contents</span>
              <ul className={styles.navList}>
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <button
                      className={`${styles.navButton} ${activeSection === section.id ? styles.active : ''}`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className={styles.mainContent}>
            <div className={styles.paper}>

              <section id="giris" className={styles.section}>
                <h2>1. Introduction & Acceptance of Terms</h2>
                <p>
                  By accessing or using this platform ("Application"), you agree to these Terms of Use ("Terms") 
                  and our Privacy Policy. By using our services, you represent that you are at least 13 years old 
                  or have reached the legal digital age of consent in your country.
                </p>
              </section>

              <hr className={styles.divider} />

              <section id="hesap" className={styles.section}>
                <h2>2. User Accounts & Security</h2>
                <p>You may need to create an account to use the platform with full functionality.</p>
                <ul className={styles.list}>
                  <li><strong>Accuracy:</strong> Information you provide during registration (Email, Name, etc.) must be accurate and up to date.</li>
                  <li><strong>Account Security:</strong> You are responsible for keeping your password secure. You agree that you are responsible for all activities performed through your account (including unauthorized access).</li>
                  <li><strong>Impersonation:</strong> Impersonating another person or entity, or manipulating the “Verified Account” (Blue Tick) badge, is strictly prohibited.</li>
                </ul>
              </section>

              <hr className={styles.divider} />

              <section id="icerik" className={styles.section}>
                <h2>3. Content & Sharing Rights</h2>
                <p>
                  The photos, videos, and text you share on our social media platform ("User Content") belong to you. 
                  However, by sharing content, you grant us the following rights:
                </p>
                <p>
                  A worldwide license to use, host, store, reproduce, modify, create derivative works (such as translations), 
                  transmit, publish, and display your content to us and our partners.
                </p>
              </section>

              <hr className={styles.divider} />

              <section id="davranis" className={styles.section}>
                <h2>4. Community & Behavior Guidelines</h2>
                <p>The following actions are prohibited to keep our platform a safe place:</p>
                <ul className={styles.list}>
                  <li>Sharing illegal, misleading, or discriminatory content.</li>
                  <li>Harassing, bullying, or threatening other users.</li>
                  <li>Spamming, or generating fake engagement (fake likes/followers).</li>
                  <li>Uploading viruses or code that could harm the system infrastructure.</li>
                </ul>
                <div className={styles.warningBox}>
                  <strong>Warning:</strong> Violating these rules may result in content removal or permanent suspension of your account.
                </div>
              </section>

              <hr className={styles.divider} />

              <section id="telif" className={styles.section}>
                <h2>5. Intellectual Property Rights</h2>
                <p>
                  Logos, software, interface designs, and trademarks on the platform belong to our company. 
                  Users may not share content that infringes on others’ copyrights. 
                  Any reported violations under the DMCA (Digital Millennium Copyright Act) 
                  may lead to the removal of infringing content.
                </p>
              </section>

              <hr className={styles.divider} />

              <section id="sorumluluk" className={styles.section}>
                <h2>6. Limitation of Liability</h2>
                <p>
                  Our services are provided “as is” and “as available.” We do not guarantee uninterrupted, 
                  secure, or error-free service. Our company is not responsible for data loss, server outages, 
                  or damages arising from third-party links.
                </p>
              </section>

              <hr className={styles.divider} />

              <section id="degisiklik" className={styles.section}>
                <h2>7. Changes</h2>
                <p>
                  We may update these terms from time to time. When significant changes occur 
                  (e.g., changes to data processing policies), we will notify you via in-app notification 
                  or email. Continuing to use the platform after updates means you accept the new terms.
                </p>
              </section>

              <hr className={styles.divider} />

              <section id="iletisim" className={styles.section}>
                <h2>8. Contact</h2>
                <p>
                  For questions about the terms of use, copyright violations, 
                  or account issues, you can contact our legal team.
                </p>
                <a href="mailto:w1globalmailbox@gmail.com" className={styles.contactLink}>
                  w1globalmailbox@gmail.com
                </a>
              </section>

            </div>
          </main>
        </div>

        <footer className={styles.footer}>
          © 2025 FurkanTheClifen Inc. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
};

export default TermsOfUse;
