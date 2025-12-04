import React from "react";
import { motion } from "framer-motion";
import {
  FaFeatherAlt,
  FaImage,
  FaVideo,
  FaHistory,
  FaShieldAlt,
  FaGlobe,
  FaBolt,
  FaCode,
  FaUserSecret
} from "react-icons/fa";
import { IoMdCamera, IoMdTime } from "react-icons/io";
import { Link } from "react-router-dom";
import styles from "./AboutApp.module.css";

// Animation Variants (Matching Welcome.jsx)
const containerFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", staggerChildren: 0.15 },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const AboutApp = () => {
  return (
    <div className={styles.aboutPage}>
      {/* Navbar Placeholder / Back Button */}
      <nav className={styles.navBar}>
        <Link to="/" className={styles.logo}>W1</Link>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <motion.div
          className={styles.heroContent}
          variants={containerFadeIn}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemFadeIn}>
            <span className={styles.badge}>v1.0 Now Live</span>
            <h1 className={styles.heroTitle}>The Story Behind W1</h1>
          </motion.div>
          
          <motion.p className={styles.heroText} variants={itemFadeIn}>
            W1 is a next-generation social platform built on the philosophy of 
            <strong> privacy, speed, and creative freedom</strong>. We stripped away the clutter 
            to focus on what matters: your voice, your vision, and your moments.
          </motion.p>
        </motion.div>

        {/* Background Visual Elements */}
        <div className={styles.heroGlow} />
      </section>

      {/* Core Features Grid (Bento Style like Welcome.jsx) */}
      <section className={styles.featuresSection}>
        <motion.div
          className={styles.container}
          variants={containerFadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
            Our Ecosystem
          </motion.h2>
          
          <div className={styles.bentoGrid}>
            
            {/* 1. Feelings */}
            <motion.div className={`${styles.card} ${styles.cardFeelings}`} variants={itemFadeIn}>
              <div className={styles.cardIcon}>
                <FaFeatherAlt />
              </div>
              <h3>Feelings</h3>
              <p>Micro-blogging redefined. Share thoughts without the noise.</p>
            </motion.div>

            {/* 2. Posts */}
            <motion.div className={`${styles.card} ${styles.cardPosts}`} variants={itemFadeIn}>
              <div className={styles.cardIcon}>
                <FaImage />
              </div>
              <h3>Posts</h3>
              <p>Curate your gallery with high-fidelity photo albums.</p>
            </motion.div>

            {/* 3. Feeds */}
            <motion.div className={`${styles.card} ${styles.cardFeeds}`} variants={itemFadeIn}>
              <div className={styles.cardIcon}>
                <FaVideo />
              </div>
              <h3>Feeds</h3>
              <p>Immersive short-form videos. Endless inspiration.</p>
            </motion.div>

            {/* 4. Stories (NEW UPDATE) */}
            <motion.div className={`${styles.card} ${styles.cardStories}`} variants={itemFadeIn}>
              <div className={styles.newBadge}>NEW</div>
              <div className={styles.cardIcon}>
                <IoMdCamera />
              </div>
              <h3>Stories</h3>
              <p>
                Ephemeral moments that vanish after <strong>24 hours</strong>. 
                Powered by our smart URL embedding system.
              </p>
              <ul className={styles.featureList}>
                <li><IoMdTime /> Disappears automatically</li>
                <li><FaBolt /> Instant URL embedding</li>
              </ul>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Stories Deep Dive Section */}
      <section className={styles.detailSection}>
        <motion.div 
          className={styles.detailContent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerFadeIn}
        >
          <motion.div className={styles.detailText} variants={itemFadeIn}>
            <h2>Introducing Stories</h2>
            <p>
              Life moves fast, and not everything needs to stay on your profile forever. 
              With the new <strong>Stories</strong> update, you can share casual updates, 
              behind-the-scenes clips, or quick thoughts.
            </p>
            <p>
              Just like our Posts system, Stories use our <strong>Secure URL Technology</strong>. 
              Simply paste a link to your media, and W1 renders it instantly—keeping the app 
              lightweight and your data secure.
            </p>
          </motion.div>
          
          <motion.div className={styles.detailVisual} variants={itemFadeIn}>
            <div className={styles.storyMockup}>
              <div className={styles.storyRing}>
                <div className={styles.storyAvatar} />
              </div>
              <div className={styles.storyCardMock}>
                <div className={styles.mockHeader}>
                  <div className={styles.mockUserLine} />
                  <div className={styles.mockTime}>23h left</div>
                </div>
                <div className={styles.mockContent} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech & Security */}
      <section className={styles.techSection}>
        <motion.div 
          className={styles.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerFadeIn}
        >
          <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
            Built on Trust
          </motion.h2>

          <div className={styles.techGrid}>
            <motion.div className={styles.techItem} variants={itemFadeIn}>
              <FaShieldAlt className={styles.techIcon} />
              <h4>Firebase Security</h4>
              <p>Enterprise-grade authentication and database protection.</p>
            </motion.div>

            <motion.div className={styles.techItem} variants={itemFadeIn}>
              <FaUserSecret className={styles.techIcon} />
              <h4>Privacy Control</h4>
              <p>You choose who sees what. Public, Friends, or Private.</p>
            </motion.div>

            <motion.div className={styles.techItem} variants={itemFadeIn}>
              <FaCode className={styles.techIcon} />
              <h4>Modern Stack</h4>
              <p>Powered by React, Node.js, and cutting-edge web tech.</p>
            </motion.div>

            <motion.div className={styles.techItem} variants={itemFadeIn}>
              <FaGlobe className={styles.techIcon} />
              <h4>Global Reach</h4>
              <p>Content delivery network optimized for speed anywhere.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} W1 Platform. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link to="/terms">Terms</Link>
          <Link to="/licenses">Licenses</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default AboutApp;