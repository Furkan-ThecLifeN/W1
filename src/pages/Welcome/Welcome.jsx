import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFeatherAlt,
  FaImage,
  FaVideo,
  FaShieldAlt,
  FaGlobe,
  FaUserFriends,
  FaStar,
  FaLock,
  FaFlag,
  FaBug,
  FaCode,
  FaMoon,
  FaSun,
  FaCheck,
  FaTimes,
  FaYoutube,
  FaPause,
  FaPlay,
  FaHome,
  FaCompass,
  FaCommentDots,
  FaChartLine,
} from "react-icons/fa";
import {
  Pen,
  Lock,
  Smile,
  AlertCircle,
  Image,
  Layout,
  Zap,
} from "lucide-react";
import { IoMdCamera } from "react-icons/io";
import { SiStreamlabs } from "react-icons/si";
import styles from "./Welcome.module.css";
import Footer from "../../components/Footer/Footer";
import DemoFeedCreator from "../../components/DemoFeedCreator/DemoFeedCreator";
import PostAddDemo from "../../components/PostAddDemo/PostAddDemo";
import FeelingsAddDemo from "../../components/FeelingsAddDemo/FeelingsAddDemo";

// Animations
const containerFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", staggerChildren: 0.18 },
  },
};
const itemFadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const visualFadeIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      className={styles.toggle}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`${styles.toggleTrack} ${checked ? styles.on : styles.off}`}
      >
        <span className={styles.toggleThumb} />
      </span>
    </button>
  );
}

function PrivacyPill({ icon: Icon, title, description, active }) {
  return (
    <div
      className={`${styles.privacyPill} ${active ? styles.activePill : ""}`}
      role="article"
      aria-pressed={active}
      tabIndex={0}
    >
      <Icon className={styles.pillIcon} />
      <div className={styles.pillBody}>
        <strong className={styles.pillTitle}>{title}</strong>
        <span className={styles.pillDesc}>{description}</span>
      </div>
      <div className={styles.pillMark}>
        {active ? <FaCheck /> : <FaTimes />}
      </div>
    </div>
  );
}

function FeatureCard({ visual, title, children, reversed }) {
  return (
    <motion.div
      className={`${styles.featureCard} ${reversed ? styles.reversed : ""}`}
      variants={containerFadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 300 },
      }}
    >
      <motion.div className={styles.featureCardVisual} variants={visualFadeIn}>
        {visual}
      </motion.div>
      <motion.div className={styles.featureCardBody} variants={itemFadeIn}>
        <h3 className={styles.featureCardTitle}>{title}</h3>
        <div className={styles.featureCardText}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

const Welcome = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPrivacy, setSelectedPrivacy] = useState("public");

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const FeatureIcons = {
    home: <FaHome />,
    discover: <FaCompass />, // Keşfet için pusula ikonu
    chat: <FaCommentDots />,
    activity: <FaChartLine />, // Aktivite için çizgi grafik ikonu
    stories: <IoMdCamera />, // Hikayeler için kamera ikonu
  };

  return (
    <>
      <title>Welcome to W1 – Redefining Social Media</title>
      <meta
        name="description"
        content="W1 (QuantumTag) – The futuristic social platform for ideas (Feelings), photos (Posts), and videos (Feeds). Experience total privacy control powered by Firebase security."
      />

      <div className={styles.welcomePage}>
        {/* Header */}
        <motion.header
          className={styles.stickyHeader}
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              W1
            </Link>

            <nav className={styles.headerControls} aria-label="Top navigation">
              <div className={styles.iconRow}>
                <button
                  className={styles.iconButton}
                  aria-label="Theme"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
              </div>

              <div className={styles.authNav}>
                <Link to="/auth" className={styles.ctaButtonHeader}>
                  Join W1
                </Link>
              </div>
            </nav>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section
          className={`${styles.fullscreenSection} ${styles.heroSection}`}
        >
          <motion.div
            className={styles.heroContentEnhanced}
            variants={containerFadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div className={styles.heroIntro} variants={itemFadeIn}>
              <h1 className={styles.heroTitleLarge}>W1</h1>
              <p className={styles.heroKicker}>Redefining Social Media</p>
            </motion.div>

            <motion.div className={styles.heroCopy} variants={itemFadeIn}>
              <h2 className={styles.heroSubtitle}>
                You Control the Experience.
              </h2>
              <p className={styles.heroText}>
                Express your ideas, moments, and inspirations through three
                dynamic formats: short "Feelings", curated photo "Posts", and
                engaging "Feed" videos. Share with confidence using our advanced
                privacy and discovery tools.
              </p>
            </motion.div>

            <motion.div className={styles.heroActions} variants={itemFadeIn}>
              <Link to="/auth" className={styles.ctaButtonHero}>
                Join the Universe
              </Link>
              <Link to="/home" className={styles.secondaryButton}>
                Explore
              </Link>
            </motion.div>

            <motion.div className={styles.quickStats} variants={itemFadeIn}>
              <div className={styles.stat}>
                <strong>4.8</strong>
                <span>Community Rating</span>
              </div>
              <div className={styles.stat}>
                <strong>0</strong>
                <span>Ads or Distractions</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className={styles.fullscreenSection}>
          <div className={styles.splitGrid}>
            <FeatureCard
              visual={<FaFeatherAlt className={styles.featureIconLarge} />}
              title="FEELING"
            >
              Capture your thoughts in real-time — short, expressive, and
              impactful. Share instantly or keep them private.
            </FeatureCard>

            <FeatureCard
              visual={<FaImage className={styles.featureIconLarge} />}
              title="POST"
              reversed
            >
              Showcase high-quality visuals. Build albums, organize memories,
              and curate your personal gallery.
            </FeatureCard>

            <FeatureCard
              visual={<FaVideo className={styles.featureIconLarge} />}
              title="FEED"
            >
              Dive into interactive video content. Our discovery engine brings
              you personalized, relevant inspiration.
            </FeatureCard>
            <FeatureCard
              visual={<SiStreamlabs className={styles.featureIconLarge} />}
              title="LIVE"
              reversed
            >
              The next level of real-time interaction is coming soon. Share the
              moment through live broadcasts and connect with your community —
              we're getting ready!
            </FeatureCard>
          </div>
        </section>

        {/* Core Features Section with Bento Grid */}
        <section
          className={`${styles.fullscreenSection} ${styles.featuresSection}`}
        >
          <motion.div
            className={styles.centeredContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.h2 className={styles.sectionTitle}>
              Discover the Core of Our Platform
            </motion.h2>
            <motion.p className={styles.sectionText}>
              Share your feelings, explore new content, and stay connected with
              your friends. Dive into everything our community has to offer.
            </motion.p>

            {/* Modern Bento Grid Başlangıcı */}
            <motion.div className={styles.featuresGrid}>
              {/* 1. Kutu: Ana Sayfa (Büyük) */}
              <motion.div
                className={`${styles.featureBox} ${styles.boxHome}`}
                // variants={itemFadeIn} // Örnek animasyon
              >
                <div
                  className={styles.iconWrapper}
                  style={{ "--accent-color": "#00aaff" }}
                >
                  {FeatureIcons.home}
                </div>
                <h3 className={styles.boxTitle}>Home Feed</h3>
                <p className={styles.boxDescription}>
                  Instantly see the latest "Feelings" and "Posts" shared by your
                  friends and people you follow.
                </p>

                {/* Görsel Detay: Mini Mockup */}
                <div className={styles.homeMockup}>
                  <div className={styles.mockPost}>
                    <div className={styles.mockAvatar}></div>
                    <div className={styles.mockTextLines}>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className={styles.mockFeeling}>
                    <span>😊 "Feeling Great!"</span>
                  </div>
                </div>
              </motion.div>

              {/* 2. Kutu: Keşfet (Büyük) */}
              <motion.div
                className={`${styles.featureBox} ${styles.boxDiscover}`}
                // variants={itemFadeIn}
              >
                <div
                  className={styles.iconWrapper}
                  style={{ "--accent-color": "#ff0000ff" }}
                >
                  {FeatureIcons.discover}
                </div>
                <h3 className={styles.boxTitle}>Discover: Shorts Videos</h3>
                <p className={styles.boxDescription}>
                  Dive into a world of entertaining Shorts videos, uploaded by
                  users and embedded directly from YouTube.
                </p>

                {/* Görsel Detay: Mini Shorts Mockup - GÜNCELLENDİ */}
                <div className={styles.shortsMockup}>
                  <div className={styles.mockShortsVideo}>
                    <FaYoutube className={styles.shortsIcon} />
                  </div>
                  <div className={styles.mockShortsVideo}>
                    <FaPlay className={styles.shortsIcon} />
                  </div>
                  <div className={styles.mockShortsVideo}>
                    <FaPause className={styles.shortsIcon} />
                  </div>
                </div>
              </motion.div>

              {/* 3. Kutu: Mesajlaşma (Küçük) - GÜNCELLENDİ */}
              <motion.div
                className={`${styles.featureBox} ${styles.boxChat}`}
                // variants={itemFadeIn}
              >
                <div
                  className={styles.iconWrapper}
                  style={{ "--accent-color": "#00ed0ce1" }}
                >
                  {FeatureIcons.chat}
                </div>
                <h3 className={styles.boxTitle}>Private Messaging</h3>
                <p className={styles.boxDescription}>
                  Chat securely and quickly with your friends.
                </p>
              </motion.div>

              {/* 4. Kutu: Aktivite (Küçük) - GÜNCELLENDİ */}
              <motion.div
                className={`${styles.featureBox} ${styles.boxActivity}`}
                // variants={itemFadeIn}
              >
                <div
                  className={styles.iconWrapper}
                  style={{ "--accent-color": "#FFB800" }}
                >
                  {FeatureIcons.activity}
                </div>
                <h3 className={styles.boxTitle}>Friend Activity Status</h3>
                <p className={styles.boxDescription}>
                  See the online status of your connections.
                </p>
              </motion.div>

              {/* 5. Kutu: Hikayeler (Küçük, Yakında) - GÜNCELLENDİ */}
              <motion.div
                className={`${styles.featureBox} ${styles.boxStories}`}
                // variants={itemFadeIn}
              >
                {/* Profesyonel "Yakında" Etiketi */}
                <div className={styles.comingSoonBadge}>COMING SOON</div>

                <div
                  className={styles.iconWrapper}
                  style={{ "--accent-color": "#ff00c8ff" }}
                >
                  {FeatureIcons.stories}
                </div>
                <h3 className={styles.boxTitle}>Stories</h3>
                <p className={styles.boxDescription}>
                  Share your daily moments with fun, ephemeral stories that
                  disappear after 24 hours.
                </p>
              </motion.div>
            </motion.div>
            {/* Bento Grid Sonu */}
          </motion.div>
        </section>

        {/* 🎬 Feed Demo Section – yeni bölüm */}
        <section
          className={`${styles.fullscreenSection} ${styles.feedDemoSection}`}
        >
          <motion.div
            className={styles.feedDemoContainer}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Sol kutu: Demo Feed Creator */}
            <motion.div className={styles.feedDemoLeft} variants={itemFadeIn}>
              <DemoFeedCreator />
            </motion.div>

            {/* Sağ kutu: Bilgilendirici metin */}
            <motion.div className={styles.feedDemoRight} variants={itemFadeIn}>
              <h2 className={styles.feedDemoTitle}>Explore Feed Creation</h2>
              <p className={styles.feedDemoText}>
                On W1, your <strong>Feed</strong> is where your creativity comes
                alive. You can link your <strong>YouTube Shorts</strong>, write
                captions, and choose who can see your post — all with complete
                control.
              </p>
              <p className={styles.feedDemoText}>
                Try out this live demo on the left. Type in a video link, add a
                short description, pick your privacy level, and experience how
                easy it feels to share on W1.
              </p>
              <ul className={styles.feedDemoList}>
                <li>
                  <FaYoutube size={16} className={styles.listIcon} /> Embed
                  YouTube Shorts instantly
                </li>
                <li>
                  <Lock size={16} className={styles.listIcon} /> Advanced
                  privacy options per post
                </li>
                <li>
                  <Layout size={16} className={styles.listIcon} /> Minimal,
                  distraction-free design
                </li>
              </ul>

              <div className={styles.feedDemoNote}>
                No login required — your input resets when the page reloads.
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 🖼️ Post Creation Demo Section – yeni bölüm */}
        <section
          className={`${styles.fullscreenSection} ${styles.postDemoSection}`}
        >
          <motion.div
            className={styles.feedDemoContainer}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Sol kutu: Bilgilendirici metin */}
            <motion.div className={styles.feedDemoLeft} variants={itemFadeIn}>
              <h2 className={styles.feedDemoTitle}>Create Stunning Posts</h2>
              <p className={styles.feedDemoText}>
                With <strong>W1 Post Creator</strong>, sharing your moments has
                never been easier. Upload photos, write captions, and tag
                friends — all in a sleek, minimal interface.
              </p>
              <p className={styles.feedDemoText}>
                On the right, you can try the live post creation demo. Add your
                image, caption, and select privacy settings to experience how W1
                keeps your sharing effortless and beautiful.
              </p>

              <ul className={styles.feedDemoList}>
                <li>
                  <Image size={16} className={styles.listIcon} /> Upload
                  multiple images easily
                </li>
                <li>
                  <Lock size={16} className={styles.listIcon} /> Full privacy
                  control per post
                </li>
                <li>
                  <Zap size={16} className={styles.listIcon} /> Instant feedback
                  design
                </li>
              </ul>

              <div className={styles.feedDemoNote}>
                Everything here is local — your content isn’t uploaded.
              </div>
            </motion.div>

            {/* Sağ kutu: PostAddDemo bileşeni */}
            <motion.div className={styles.feedDemoRight} variants={itemFadeIn}>
              <PostAddDemo />
            </motion.div>
          </motion.div>
        </section>

        {/* 🎬 Feelings Demo Section – new section */}
        <section
          className={`${styles.fullscreenSection} ${styles.feelingsDemoSection}`}
        >
          <motion.div
            className={styles.feelingsDemoContainer}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Left box: Demo FeelingsAdd */}
            <motion.div
              className={styles.feelingsDemoLeft}
              variants={itemFadeIn}
            >
              {/* Previously created static demo component */}
              <FeelingsAddDemo />
            </motion.div>

            {/* Right box: Informative text */}
            <motion.div
              className={styles.feelingsDemoRight}
              variants={itemFadeIn}
            >
              <h2 className={styles.feelingsDemoTitle}>
                Share Your Feelings Freely
              </h2>
              <p className={styles.feelingsDemoText}>
                On W1, <strong>"Feelings"</strong> provides a personal space
                where you can express your thoughts, moods, and experiences.
                This module is designed with a rich text editor, intuitive input
                fields, and interactive elements to make sharing easy and
                engaging.
              </p>
              <p className={styles.feelingsDemoText}>
                In the live demo on the left, you can explore how the interface
                works. From privacy settings to text formatting and image
                previews, every feature is crafted to provide a smooth,
                user-friendly experience.
              </p>
              <ul className={styles.feelingsDemoList}>
                <li>
                  <Pen size={16} className={styles.listIcon} />
                  Rich text input supporting up to 3000 characters
                </li>
                <li>
                  <Lock size={16} className={styles.listIcon} />
                  Per-post privacy controls (Public, Friends, Close Friends, or
                  Only Me)
                </li>
                <li>
                  <Smile size={16} className={styles.listIcon} />
                  Flexible, interactive interface designed for safe and creative
                  expression
                </li>
                <li>
                  <AlertCircle size={16} className={styles.listIcon} />
                  Content is moderated: share freely, but inappropriate content
                  is not allowed
                </li>
              </ul>

              <div className={styles.feelingsDemoNote}>
                <strong>Note:</strong> This is a static demo. Any input you
                provide will not be saved or sent anywhere.
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Embed Help Section */}
        <section
          className={`${styles.fullscreenSection} ${styles.feelingsDemoSection} ${styles.embedHelpSection}`}
        >
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
              Share Your Own Media
            </motion.h2>
            <motion.p className={styles.sectionText} variants={itemFadeIn}>
              While the direct upload feature isn’t active yet, you can still
              share your own images or videos easily by using their online links
              (embed URLs). Here’s how you can do it in just two simple ways:
            </motion.p>

            {/* Methods Grid */}
            <motion.div className={styles.methodsGrid} variants={itemFadeIn}>
              {/* Method 1: Copy Image Address */}
              <div className={styles.methodBox}>
                <h3 className={styles.methodTitle}>
                  Method 1: Copy an Online Image URL
                </h3>
                <p className={styles.methodText}>
                  If the image you want to share is already uploaded on another
                  website (like your blog or another platform):
                </p>

                {/* Visual Mockup */}
                <div className={styles.visualMockup}>
                  <div className={styles.mockBrowser}>
                    <div className={styles.mockBrowserHeader}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    {/* Placeholder image */}
                    <img
                      src="https://placehold.co/400x250/25283A/E0E0E0?text=Your+Image+Here"
                      alt="Example website image"
                      className={styles.mockImage}
                    />

                    {/* Mock mouse + context menu */}
                    <div className={styles.mockMousePointer}>🖱️</div>
                    <div className={styles.mockMenu}>
                      <div>Back</div>
                      <div>Reload</div>
                      <div className={styles.mockMenuHighlight}>
                        Copy Image Address
                      </div>
                      <div>Save Image As...</div>
                    </div>
                  </div>
                </div>

                <p className={styles.methodStep}>
                  1. Hover over the image and <strong>right-click</strong>.
                  <br />
                  2. From the context menu, select{" "}
                  <strong>"Copy Image Address"</strong> (or similar, depending
                  on your browser).
                </p>
              </div>

              {/* Method 2: Upload via Online Service */}
              <div className={styles.methodBox}>
                <h3 className={styles.methodTitle}>
                  Method 2: Upload from Your Device (via Free Service)
                </h3>
                <p className={styles.methodText}>
                  If your image or video is stored on your computer, you’ll need
                  to make it accessible online first.
                </p>

                {/* Step Diagram */}
                <div className={styles.stepDiagram}>
                  <div className={styles.step}>
                    <img
                      src="https://placehold.co/80x80/00aaff/FFFFFF?text=Step+1"
                      className={styles.stepIcon}
                      alt="Upload Step"
                    />
                    <strong>1. Find a Free Service</strong>
                    <p>
                      Search online for “image upload” or “img to URL” to find
                      free platforms that let you upload and host your files.
                    </p>
                  </div>
                  <div className={styles.stepArrow}>&rarr;</div>
                  <div className={styles.step}>
                    <img
                      src="https://placehold.co/80x80/00aaff/FFFFFF?text=Step+2"
                      className={styles.stepIcon}
                      alt="Link Step"
                    />
                    <strong>2. Upload and Copy the Link</strong>
                    <p>
                      Upload your image to the service. It will provide you with
                      a “Direct Link” to your file — simply copy that link.
                    </p>
                  </div>
                </div>

                <p className={styles.methodStep}>
                  <strong>Important:</strong> Make sure the link you receive
                  ends with a valid file extension such as{" "}
                  <strong>.jpg, .png, .gif,</strong> or <strong>.mp4</strong>.
                </p>
              </div>
            </motion.div>

            {/* Final Step */}
            <motion.div className={styles.pasteExample} variants={itemFadeIn}>
              <h3 className={styles.methodTitle}>Final Step: Paste the Link</h3>
              <p className={styles.sectionText}>
                Paste the copied link into the URL field on the post creation
                screen. That’s it!
              </p>

              {/* Mock input (inspired by PostAdd) */}
              <div className={styles.mockInputWrapper}>
                <span>🖼️</span>
                <input
                  type="text"
                  readOnly
                  value="https://example-img.com/your-image.jpg"
                  className={styles.mockInput}
                />
              </div>
              <p className={styles.sectionTextSmall}>
                Your image or video will instantly appear in the preview area.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Privacy Section */}
        <section
          className={`${styles.fullscreenSection} ${styles.privacySection}`}
        >
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
              Full Control in Your Hands
            </motion.h2>
            <motion.p className={styles.sectionText} variants={itemFadeIn}>
              Every post can have its own visibility level. Test multiple
              privacy modes and preview instantly.
            </motion.p>

            <motion.div
              className={styles.privacyInteractive}
              variants={itemFadeIn}
            >
              <div className={styles.privacyPreview}>
                <div className={styles.postPreviewHeader}>
                  <div className={styles.previewUser}>W1 User</div>
                  <div className={styles.previewPrivacy}>{selectedPrivacy}</div>
                </div>

                <div className={styles.postPreviewBody}>
                  <p>
                    Sometimes it’s enough to just pause and capture the moment.
                  </p>
                </div>
              </div>

              <div className={styles.privacyControls}>
                <div className={styles.privacyGridControls}>
                  <button
                    onClick={() => setSelectedPrivacy("public")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "public" ? styles.selectedBtn : ""
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("followers")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "followers" ? styles.selectedBtn : ""
                    }`}
                  >
                    Friends
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("close")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "close" ? styles.selectedBtn : ""
                    }`}
                  >
                    Close Friends
                  </button>
                  <button
                    onClick={() => setSelectedPrivacy("private")}
                    className={`${styles.privacyBtn} ${
                      selectedPrivacy === "private" ? styles.selectedBtn : ""
                    }`}
                  >
                    Only Me
                  </button>
                </div>

                <div className={styles.privacyPillsWrap}>
                  <PrivacyPill
                    icon={FaGlobe}
                    title="Public"
                    description="Anyone can view your post."
                    active={selectedPrivacy === "public"}
                  />
                  <PrivacyPill
                    icon={FaUserFriends}
                    title="Friends"
                    description="Only your followers can see it."
                    active={selectedPrivacy === "followers"}
                  />
                  <PrivacyPill
                    icon={FaStar}
                    title="Close Friends"
                    description="Visible only to your special circle."
                    active={selectedPrivacy === "close"}
                  />
                  <PrivacyPill
                    icon={FaLock}
                    title="Only Me"
                    description="Completely private to you."
                    active={selectedPrivacy === "private"}
                  />
                </div>
              </div>
            </motion.div>

            <motion.p className={styles.sectionTextSmall} variants={itemFadeIn}>
              These settings also apply to messages. You decide who can contact
              you.
            </motion.p>
          </motion.div>
        </section>

        {/* Security Section */}
        <section
          className={`${styles.fullscreenSection} ${styles.securitySection}`}
        >
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className={styles.sectionTitle} variants={itemFadeIn}>
              Security and Transparency
            </motion.h2>
            <motion.p className={styles.sectionText} variants={itemFadeIn}>
              Data protection and transparency are core to W1’s philosophy.
            </motion.p>

            <motion.div
              className={styles.securityGridEnhanced}
              variants={containerFadeIn}
            >
              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaCode className={styles.cardIcon} />
                <h4>Firebase Infrastructure</h4>
                <p>Your data is securely stored on trusted cloud systems.</p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaFlag className={styles.cardIcon} />
                <h4>Reporting</h4>
                <p>
                  Flag inappropriate content easily and track actions taken.
                </p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaBug className={styles.cardIcon} />
                <h4>Feedback</h4>
                <p>Dedicated channels for bugs, feedback, and suggestions.</p>
              </motion.div>

              <motion.div
                className={styles.securityCard}
                variants={itemFadeIn}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(0, 153, 255, 0.932)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaShieldAlt className={styles.cardIcon} />
                <h4>Data Transparency</h4>
                <p>Always know what data is collected and how it's used.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className={`${styles.fullscreenSection} ${styles.ctaSection}`}>
          <motion.div
            className={styles.centeredContent}
            variants={containerFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div className={styles.ctaCard} variants={itemFadeIn}>
              <motion.h2 className={styles.ctaTitle} variants={itemFadeIn}>
                Step Into the W1 Universe.
              </motion.h2>
              <motion.p className={styles.sectionText} variants={itemFadeIn}>
                Ready to explore, share, and be inspired? Our platform is
                evolving every day — and so is our community.
              </motion.p>

              <motion.div className={styles.ctaRow} variants={itemFadeIn}>
                <Link to="/auth" className={styles.ctaButtonHero}>
                  Create a Free Account
                </Link>
                <Link to="/discover" className={styles.ghostButton}>
                  Discover
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <div className={styles.footerWelcome}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Welcome;
