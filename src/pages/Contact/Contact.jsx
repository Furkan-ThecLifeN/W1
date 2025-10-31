import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { FaInstagram, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import styles from "./Contact.module.css";

function Contact() {
  const [formData, setFormData] = useState({
    adSoyad: "",
    email: "",
    mesaj: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const SERVICE_ID = "service_nqmg9j9";
    const TEMPLATE_ID = "template_5qoinzc";
    const PUBLIC_KEY = "fHkjhIDonBDvyfGYs";

    const templateParams = {
      adSoyad: formData.adSoyad,
      email: formData.email,
      mesaj: formData.mesaj,
      time: new Date().toLocaleString("tr-TR"),
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY).then(
      () => {
        setIsSubmitted(true);
        setIsSubmitting(false);
        setFormData({ adSoyad: "", email: "", mesaj: "" });
      },
      (error) => {
        console.error("Gönderim hatası:", error);
        alert("Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        setIsSubmitting(false);
      }
    );
  };

  return (
    <div className={styles.contactContainer}>

      <section className={styles.w1Logo}>
        <h1>W1</h1>
      </section>

      <section className={styles.heroSection}>
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroTitle}
        >
          Let’s Connect ✉️
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={styles.heroSubtitle}
        >
          Get in touch with me through the form below or via my socials.
        </motion.p>
      </section>

      <section className={styles.scrollSection}>
        <motion.div
          className={styles.contactCard}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.socialPanel}>
            <h2>Find Me On</h2>
            <div className={styles.socialIcons}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <FaGithub />
              </a>
              <a href="mailto:info@siteadiniz.com">
                <FaEnvelope />
              </a>
            </div>
          </div>

          <div className={styles.formPanel}>
            {isSubmitted ? (
              <div className={styles.successBox}>
                <h3>🎉 Thanks!</h3>
                <p>Your message has been sent successfully.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className={styles.newMessageBtn}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2>Send a Message</h2>

                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="adSoyad"
                    placeholder="Full Name"
                    value={formData.adSoyad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <textarea
                    name="mesaj"
                    placeholder="Your Message..."
                    rows="5"
                    value={formData.mesaj}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;
