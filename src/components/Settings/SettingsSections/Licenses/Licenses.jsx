import React from 'react';
import styles from './Licenses.module.css';

// Expanded license data
const LICENSES = [
  {
    id: "mit",
    name: "MIT License",
    shortName: "MIT",
    description: "A short and simple permissive license. Allows commercial use, distribution, and modification as long as copyright and license notices are preserved.",
    url: "https://opensource.org/licenses/MIT",
    permissions: ["Commercial Use", "Modification", "Distribution", "Private Use"],
    color: "#22c55e" // Green theme
  },
  {
    id: "apache",
    name: "Apache License 2.0",
    shortName: "Apache 2.0",
    description: "A permissive license offering copyright protection along with an express patent grant from contributors to users.",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
    permissions: ["Commercial Use", "Patent Rights", "Modification"],
    color: "#d946ef" // Purple theme
  },
  {
    id: "gpl",
    name: "GNU General Public License v3.0",
    shortName: "GPL v3",
    description: "A copyleft license requiring source code to remain accessible and modifications to be released under the same license.",
    url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
    permissions: ["Open Source Requirement", "Share-Alike Distribution"],
    color: "#f59e0b" // Orange theme
  },
  {
    id: "bsd",
    name: "BSD 3-Clause License",
    shortName: "BSD 3-Clause",
    description: "Similar to MIT but includes a clause restricting the use of contributors' names for promotional purposes.",
    url: "https://opensource.org/licenses/BSD-3-Clause",
    permissions: ["Commercial Use", "Distribution"],
    color: "#3b82f6" // Blue theme
  },
  {
    id: "cc",
    name: "Creative Commons Attribution 4.0",
    shortName: "CC BY 4.0",
    description: "Allows copying and redistribution in any medium, as long as proper attribution is given to the copyright holder.",
    url: "https://creativecommons.org/licenses/by/4.0/",
    permissions: ["Sharing", "Adaptation", "Attribution Required"],
    color: "#ec4899" // Pink theme
  },
  {
    id: "mpl",
    name: "Mozilla Public License 2.0",
    shortName: "MPL 2.0",
    description: "A hybrid license. Modified files must be open source, but the rest of the project may remain closed source.",
    url: "https://www.mozilla.org/en-US/MPL/2.0/",
    permissions: ["File-Level Copyleft", "Commercial Use"],
    color: "#6366f1" // Indigo theme
  },
];

const Licenses = () => {
  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <div className={styles.badgeContainer}>
          <span className={styles.secureBadge}>
            <svg className={styles.lockIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure & Verified Infrastructure
          </span>
        </div>
        <h1 className={styles.title}>Licenses & Legal Information</h1>
        <p className={styles.subtitle}>
          Below is a list of the open-source technologies used in our project, along with their legal usage rights.
          All data is stored on secure Firebase infrastructure.
        </p>
      </header>

      <div className={styles.grid}>
        {LICENSES.map((license) => (
          <a
            key={license.id}
            href={license.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
            style={{ '--accent-color': license.color }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.shortName} style={{ backgroundColor: `${license.color}20`, color: license.color }}>
                {license.shortName}
              </span>
              <svg className={styles.externalLinkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            
            <h2 className={styles.cardTitle}>{license.name}</h2>
            <p className={styles.cardDescription}>{license.description}</p>
            
            <div className={styles.tagsContainer}>
              {license.permissions.map((perm, index) => (
                <span key={index} className={styles.tag}>
                  {perm}
                </span>
              ))}
            </div>
            
            <div className={styles.cardFooter}>
              View Details
            </div>
          </a>
        ))}
      </div>
      
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} All Rights Reserved. Data encrypted with Firebase.</p>
      </footer>
    </div>
  );
};

export default Licenses;
