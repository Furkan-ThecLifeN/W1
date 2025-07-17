import React, { useState } from 'react';
import { 
  FiAlertTriangle, 
  FiMessageSquare, 
  FiSend, 
  FiPaperclip,
  FiCheckCircle,
  FiX,
  FiUser,
  FiMail,
  FiSmartphone,
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
    contactMethod: 'email',
    phone: '',
    attachments: [],
    termsAgreed: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(files)]
      }));
    } else if (type === 'checkbox') {
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
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Terms and Conditions content
  const termsContent = `
## Geri Bildirim ve Hata Bildirimi Sözleşmesi

### 1. Giriş
Bu sözleşme, kullanıcıların [Uygulama Adı] uygulamasına gönderecekleri geri bildirim ve hata raporları ile ilgili şartları ve koşulları belirler.

### 2. Veri Toplama
Gönderdiğiniz geri bildirimlerde aşağıdaki veriler toplanabilir:
- İletişim bilgileriniz (e-posta, telefon)
- Cihaz bilgileri (model, işletim sistemi)
- Uygulama kullanım detayları
- Eklediğiniz dosya ve ekran görüntüleri

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
              setFormData({
                type: 'bug',
                title: '',
                description: '',
                email: '',
                contactMethod: 'email',
                phone: '',
                attachments: [],
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

          {/* Attachments */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ekler (Ekran Görüntüsü, Log Dosyası vb.)</label>
            <div className={styles.attachmentContainer}>
              <label htmlFor="attachments" className={styles.attachmentLabel}>
                <FiPaperclip className={styles.attachmentIcon} />
                <span>Dosya Ekle</span>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  onChange={handleInputChange}
                  className={styles.fileInput}
                  multiple
                  accept="image/*,.pdf,.txt,.log"
                />
              </label>
              
              {formData.attachments.length > 0 && (
                <div className={styles.attachmentList}>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className={styles.attachmentItem}>
                      <span className={styles.attachmentName}>
                        {file.name.length > 20 
                          ? `${file.name.substring(0, 15)}...${file.name.split('.').pop()}` 
                          : file.name}
                      </span>
                      <button
                        type="button"
                        className={styles.attachmentRemove}
                        onClick={() => removeAttachment(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.formGroup}>
            <label className={styles.label}>İletişim Bilgileri</label>
            <div className={styles.contactMethod}>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === 'email'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCustom}></span>
                  <span className={styles.radioText}>E-posta</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={formData.contactMethod === 'phone'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCustom}></span>
                  <span className={styles.radioText}>Telefon</span>
                </label>
              </div>

              {formData.contactMethod === 'email' ? (
                <div className={styles.inputWithIcon}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="E-posta adresiniz"
                    required
                  />
                </div>
              ) : (
                <div className={styles.inputWithIcon}>
                  <FiSmartphone className={styles.inputIcon} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Telefon numaranız"
                    required
                  />
                </div>
              )}
            </div>
          </div>

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
            <button type="submit" className={styles.submitButton}>
              <FiSend className={styles.submitIcon} />
              Gönder
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BugFeedback;