import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification, reload } from 'firebase/auth'; // Firebase Auth fonksiyonları
import AuthPageStyle from './AuthPage.module.css'; // Ortak sayfa stili
import AuthFormsStyle from '../../components/Auth/AuthForms.module.css'; // Ortak form stili

const VerificationPage = () => {
  const { currentUser, showMessage } = useAuth();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // Kullanıcı doğrulanmışsa veya kullanıcı yoksa yönlendirme yap
    if (!currentUser) {
      navigate('/auth'); // Kullanıcı yoksa login sayfasına
      return;
    }
    if (currentUser.emailVerified) {
      showMessage('success', 'E-posta adresiniz zaten doğrulanmış. Ana sayfaya yönlendiriliyorsunuz.');
      navigate('/home'); // Doğrulanmışsa ana sayfaya
    }
  }, [currentUser, navigate, showMessage]);

  const handleResendVerification = async () => {
    if (currentUser) {
      try {
        await sendEmailVerification(currentUser);
        showMessage('success', 'Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.');
      } catch (error) {
        showMessage('error', `Doğrulama e-postası gönderilirken hata oluştu: ${error.message}`);
      }
    }
  };

  const handleCheckVerificationStatus = async () => {
    if (currentUser) {
      setCheckingStatus(true);
      try {
        await reload(currentUser); // Firebase Auth kullanıcısını manuel olarak yeniden yükle
        // currentUser state'i AuthProvider içinde onAuthStateChanged ile güncellenecek
        // useEffect yeniden çalışacak ve yönlendirme yapacak
        showMessage('success', 'Doğrulama durumu güncellendi. Eğer doğrulandıysa yönlendirileceksiniz.');
      } catch (error) {
        showMessage('error', `Doğrulama durumu kontrol edilirken hata oluştu: ${error.message}`);
      } finally {
        setCheckingStatus(false);
      }
    }
  };

  if (!currentUser) {
    return null; // Yönlendirme zaten useEffect içinde yapılıyor
  }

  return (
    <section className={AuthPageStyle.authpage_section}>
      <div className={AuthPageStyle.auth_container}>
        <div className={AuthPageStyle.authBox_logo}>
          <h2 className={AuthPageStyle.welcome_title}>E-posta Doğrulama</h2>
          <h1 className={AuthPageStyle.AuthTitleLogo}>W1</h1>
        </div>

        <div className={AuthFormsStyle.auth_form_container}>
          <h3>E-posta Doğrulamanız Gerekiyor</h3>
          <p className={AuthFormsStyle.toggle_text}>
            Hesabınızı kullanmaya başlamadan önce lütfen <strong>{currentUser.email}</strong> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
          </p>
          <button className={AuthFormsStyle.auth_form_container.button} onClick={handleResendVerification}>
            Doğrulama E-postasını Tekrar Gönder
          </button>
          <button 
            className={AuthFormsStyle.auth_form_container.button} 
            onClick={handleCheckVerificationStatus} 
            disabled={checkingStatus}
          >
            {checkingStatus ? 'Kontrol Ediliyor...' : 'Doğrulama Durumunu Kontrol Et'}
          </button>
          <p className={AuthFormsStyle.toggle_text} style={{marginTop: '20px'}}>
             Yardım mı gerekiyor? Destek ile iletişime geçin.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerificationPage;
