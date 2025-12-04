import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquare,
  Send,
  CheckCircle,
  X,
  Mail,
  ChevronDown,
  Bug,
  Lightbulb,
  ThumbsUp,
  AlertOctagon,
  Loader2
} from 'lucide-react';
import styles from './BugFeedback.module.css';

const BugFeedback = () => {
  const [activeTab, setActiveTab] = useState('bug');
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    email: '',
    termsAgreed: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Feedback Types Configuration
  const feedbackTypes = [
    { 
      value: 'bug', 
      label: 'Bug Report', 
      icon: <Bug size={24} />, 
      color: '#ef4444', // Red
      desc: 'Something is broken'
    },
    { 
      value: 'suggestion', 
      label: 'Suggestion', 
      icon: <Lightbulb size={24} />, 
      color: '#eab308', // Yellow
      desc: 'Idea for a new feature'
    },
    { 
      value: 'complaint', 
      label: 'Issue', 
      icon: <AlertOctagon size={24} />, 
      color: '#f97316', // Orange
      desc: 'Not satisfied with something'
    },
    { 
      value: 'compliment', 
      label: 'Compliment', 
      icon: <ThumbsUp size={24} />, 
      color: '#22c55e', // Green
      desc: 'Show some love'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const templateParams = {
      type: formData.type.toUpperCase(),
      title: formData.title,
      description: formData.description,
      email: formData.email,
    };

    // -----------------------------------------------------------------
    // EmailJS Credentials
    // -----------------------------------------------------------------
    const SERVICE_ID = 'service_nqmg9j9';
    const TEMPLATE_ID = 'template_5097syp';
    const PUBLIC_KEY = 'fHkjhIDonBDvyfGYs';

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, (err) => {
        console.error('FAILED...', err);
        alert('An error occurred. Please try again later.');
        setIsSubmitting(false);
      });
  };

  const termsContent = `
## Feedback & Bug Report Agreement

### 1. Introduction
This agreement establishes the terms and conditions regarding feedback and bug reports submitted to the W1 platform.

### 2. Data Collection
When submitting feedback, we may collect:
- Contact information (Email)
- Device details (Model, OS version) for debugging
- Usage details related to the reported issue

### 3. Usage of Data
We use this data solely to:
- Identify and fix bugs
- Improve app performance and features
- Enhance overall user experience
- Contact you for clarification if needed

### 4. Privacy & Rights
- Your data is treated with strict confidentiality.
- You grant W1 a perpetual, royalty-free license to use any suggestions or ideas submitted for product improvement.
- You guarantee that your submission does not contain inappropriate content or violate third-party rights.
  `;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Help Us Improve W1</h1>
          <p className={styles.subtitle}>
            Found a bug? Have a brilliant idea? We are listening.
          </p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            /* SUCCESS STATE */
            <motion.div 
              className={styles.successContainer}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.successIconWrapper}>
                <CheckCircle className={styles.successIcon} size={64} />
              </div>
              <h2 className={styles.successTitle}>Feedback Received!</h2>
              <p className={styles.successMessage}>
                Thank you for contributing to the W1 universe. Our team will review your report shortly.
              </p>
              <button
                className={styles.resetButton}
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    type: 'bug',
                    title: '',
                    description: '',
                    email: '',
                    termsAgreed: false
                  });
                  setActiveTab('bug');
                }}
              >
                Send Another Report
              </button>
            </motion.div>
          ) : (
            /* FORM STATE */
            <motion.form 
              className={styles.formCard} 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              
              {/* Type Selection Grid */}
              <div className={styles.gridContainer}>
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`${styles.typeCard} ${activeTab === type.value ? styles.activeType : ''}`}
                    onClick={() => {
                      setActiveTab(type.value);
                      setFormData(prev => ({ ...prev, type: type.value }));
                    }}
                    style={{ '--accent-color': type.color }}
                  >
                    <div className={styles.iconBox}>{type.icon}</div>
                    <span className={styles.typeLabel}>{type.label}</span>
                    <span className={styles.typeDesc}>{type.desc}</span>
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className={styles.fieldsContainer}>
                
                {/* Subject Line */}
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>
                    Subject
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={
                      activeTab === 'bug' ? 'e.g., Profile photo not loading' :
                      activeTab === 'suggestion' ? 'e.g., Add dark mode toggle' :
                      'Summarize your topic'
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className={styles.inputGroup}>
                  <label htmlFor="description" className={styles.label}>
                    Details
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Please describe the situation in detail..."
                    rows="5"
                    required
                  />
                </div>

                {/* Email */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Your Email
                  </label>
                  <div className={styles.iconInputWrapper}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${styles.withIcon}`}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <span className={styles.hint}>We may contact you for more details.</span>
                </div>

                {/* Terms Agreement */}
                <div className={styles.termsGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="termsAgreed"
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      required
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span className={styles.termsText}>
                      I agree to the{' '}
                      <button
                        type="button"
                        className={styles.termsLink}
                        onClick={() => setIsTermsOpen(!isTermsOpen)}
                      >
                        Feedback Terms
                      </button>
                    </span>
                  </label>
                  
                  <AnimatePresence>
                    {isTermsOpen && (
                      <motion.div 
                        className={styles.termsContent}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className={styles.termsInner}>
                          <pre>{termsContent}</pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className={styles.submitButton} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={styles.spinner} size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Report
                    </>
                  )}
                </button>

              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BugFeedback;