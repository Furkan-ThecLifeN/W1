import React, { useState } from 'react';
import emailjs from '@emailjs/browser'; // EmailJS import edildi
import {
  FiAlertTriangle,
  FiMessageSquare,
  FiSend,
  // FiPaperclip, // Kaldırıldı (İkon)
  FiCheckCircle,
  FiX,
  // FiUser, // Kaldırıldı (İkon)
  FiMail,
  // FiSmartphone, // Kaldırıldı (İkon)
  FiChevronDown
} from 'react-icons/fi';
import styles from './BugFeedback.module.css';

const BugFeedback = () => {
  const [activeTab, setActiveTab] = useState('bug');
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    email: '',
    // contactMethod: 'email', // Kaldırıldı
    // phone: '', // Kaldırıldı
    // attachments: [], // Kaldırıldı
    termsAgreed: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Yüklenme durumu eklendi
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Feedback types
  const feedbackTypes = [
    { value: 'bug', label: 'Hata Bildirimi', icon: <FiAlertTriangle /> },
    { value: 'suggestion', label: 'Öneri', icon: <FiMessageSquare /> },
    { value: 'complaint', label: 'Şikayet', icon: <FiX /> },
    { value: 'compliment', label: 'Takdir', icon: <FiCheckCircle /> }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target; // 'files' kaldırıldı

    // 'file' tipi kaldırıldı
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Zaten gönderiliyorsa tekrar göndermeyi engelle

    setIsSubmitting(true); // Gönderim başladı

    // EmailJS için gönderilecek parametreler (template'iniz ile eşleşmeli)
    const templateParams = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      email: formData.email,
    };

    // -----------------------------------------------------------------
    // BURAYI DOLDURUN!
    // EmailJS bilgilerinizi buraya girin
    // https://dashboard.emailjs.com/admin
    // -----------------------------------------------------------------
    const SERVICE_ID = 'service_nqmg9j9';   // EmailJS > Email Services > Servisinizin ID'si
    const TEMPLATE_ID = 'template_5097syp'; // EmailJS > Email Templates > Şablonunuzun ID'si
    const PUBLIC_KEY = 'fHkjhIDonBDvyfGYs';  // EmailJS > Account > Public Key

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        console.log('E-POSTA GÖNDERİLDİ (SUCCESS!)', response.status, response.text);
        setIsSubmitted(true); // Başarılı formu göster
        setIsSubmitting(false); // Gönderim bitti
      }, (err) => {
        console.error('E-POSTA HATASI (FAILED...)', err);
        alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsSubmitting(false); // Gönderim bitti (hata)
      });
  };

  // Attachment kaldırma fonksiyonu kaldırıldı
  // const removeAttachment = (index) => { ... };

  // Terms and Conditions content
  const termsContent = `
## Geri Bildirim ve Hata Bildirimi Sözleşmesi

### 1. Giriş
Bu sözleşme, kullanıcıların [Uygulama Adı] uygulamasına gönderecekleri geri bildirim ve hata raporları ile ilgili şartları ve koşulları belirler.

### 2. Veri Toplama
Gönderdiğiniz geri bildirimlerde aşağıdaki veriler toplanabilir:
- İletişim bilgileriniz (e-posta)
- Cihaz bilgileri (model, işletim sistemi)
- Uygulama kullanım detayları

### 3. Veri Kullanımı
Toplanan veriler şu amaçlarla kullanılabilir:
- Hataları tespit ve düzeltme
- Uygulama iyileştirmeleri yapma
- Kullanıcı deneyimini geliştirme
- Sizinle iletişime geçme

### 4. Gizlilik
Gönderdiğiniz tüm bilgiler gizli tutulacak ve üçüncü şahıslarla paylaşılmayacaktır. Ancak:
- Anonimleştirilmiş veriler analiz için kullanılabilir
- Yasal zorunluluklar durumunda bilgiler paylaşılabilir

### 5. Haklar ve Sorumluluklar
- Gönderdiğiniz içeriklerin size ait olduğunu garanti edersiniz
- Uygunsuz içerik göndermeyeceğinizi kabul edersiniz
- Gönderdiğiniz öneriler üzerinde herhangi bir telif hakkı talep etmezsiniz

### 6. Sonlandırma
[Şirket Adı], uygunsuz bulduğu geri bildirimleri silme hakkını saklı tutar.

Bu sözleşme [Tarih] itibarıyla geçerlidir.
  `;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Hata Bildirimi & Geri Bildirim</h1>
        <p className={styles.subtitle}>Deneyiminizi daha iyi hale getirmemize yardımcı olun</p>
      </div>
      
      {/* Success Message */}
      {isSubmitted ? (
        <div className={styles.successContainer}>
          <FiCheckCircle className={styles.successIcon} />
          <h2 className={styles.successTitle}>Geri Bildiriminiz Gönderildi!</h2>
          <p className={styles.successMessage}>
            Değerli geri bildiriminiz için teşekkür ederiz. Ekibimiz en kısa sürede inceleyecektir.
          </p>
          <button
            className={styles.successButton}
            onClick={() => {
              setIsSubmitted(false);
              // Formu sıfırla
              setFormData({
                type: 'bug',
                title: '',
                description: '',
                email: '',
                termsAgreed: false
              });
            }}
          >
            Yeni Bildirim Gönder
          </button>
        </div>
      ) : (
        /* Form Container */
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          {/* Feedback Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Bildirim Türü</label>
            <div className={styles.typeButtons}>
              {feedbackTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`${styles.typeButton} ${formData.type === type.value ? styles.active : ''}`}
                  onClick={() => {
                    setActiveTab(type.value);
                    setFormData(prev => ({ ...prev, type: type.value }));
                  }}
                >
                  <span className={styles.typeIcon}>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              {formData.type === 'bug' ? 'Hata Başlığı' :
                formData.type === 'suggestion' ? 'Öneri Başlığı' :
                  formData.type === 'complaint' ? 'Şikayet Başlığı' : 'Konu'}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              placeholder={
                formData.type === 'bug' ? 'Örneğin: Profil sayfasında görüntüleme hatası' :
                  formData.type === 'suggestion' ? 'Örneğin: Yeni bir özellik önerisi' :
                    formData.type === 'complaint' ? 'Örneğin: Uygulama performansı ile ilgili şikayet' :
                      'Örneğin: Mükemmel kullanıcı deneyimi'
              }
              required
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              {formData.type === 'bug' ? 'Hata Açıklaması' : 'Detaylı Açıklama'}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder={
                formData.type === 'bug' ?
                  'Lütfen hatayı mümkün olduğunca detaylı açıklayın. Hangi adımları izlediğiniz, ne beklediğiniz ve ne olduğu önemli.' :
                  'Lütfen öneri, şikayet veya takdirinizi detaylı şekilde açıklayın.'
              }
rows="6"
              required
            />
          </div>

          {/* Attachments (KALDIRILDI) */}

          {/* Contact Information (SADELEŞTİRİLDİ) */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">İletişim E-postanız</label>
            <p className={styles.subtitle} style={{marginTop: '-8px', marginBottom: '12px'}}>
              Bildiriminizle ilgili size geri dönebilmemiz için gereklidir.
            </p>
            <div className={styles.inputWithIcon}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="E-posta adresiniz"
                required
              />
            </div>
          </div>
          
          {/* Contact Method (KALDIRILDI) */}

          {/* Terms and Conditions */}
          <div className={styles.formGroup}>
            <div className={styles.termsContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                  required
                />
                <span className={styles.checkboxCustom}></span>
                <span className={styles.termsText}>
                  <button
                    type="button"
                    className={styles.termsLink}
                    onClick={() => setIsTermsOpen(!isTermsOpen)}
                  >
                    Hizmet Şartları
                  </button>'nı okudum ve kabul ediyorum
                </span>
              </label>
              
              <button
                type="button"
                className={styles.termsToggle}
                onClick={() => setIsTermsOpen(!isTermsOpen)}
              >
                <FiChevronDown className={`${styles.termsToggleIcon} ${isTermsOpen ? styles.open : ''}`} />
              </button>
            </div>

            {isTermsOpen && (
              <div className={styles.termsContent}>
                <pre className={styles.termsTextContent}>{termsContent}</pre>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles.submitContainer}>
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={isSubmitting} // Gönderim sırasında butonu kilitle
            >
              <FiSend className={styles.submitIcon} />
              {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BugFeedback;