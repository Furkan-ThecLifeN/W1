// VerificationPage.js

import React, { useEffect, useState, useRef } from 'react'; // useRef import edildi
import { useAuth } from '../../AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../firebase';
import AuthPageStyle from './AuthPage.module.css';
import AuthFormsStyle from '../../components/Auth/AuthForms.module.css';

const VerificationPage = () => {
  const { currentUser, showMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [identifier, setIdentifier] = useState(''); // Email veya Kullanıcı Adı
  const [loginCode, setLoginCode] = useState(''); // OTP Kodu
  const [codeSent, setCodeSent] = useState(false); // Kod gönderildi mi
  const [loading, setLoading] = useState(false); // Yükleme durumu

  // useRef kullanarak bu useEffect bloğunun başlangıçtaki identifier ayarlamasını bir kez yapmasını sağla
  const isInitialLoad = useRef(true); 

  useEffect(() => {
    // Eğer kullanıcı zaten doğrulanmışsa (OTP girilmişse), Home'a yönlendir
    if (currentUser && currentUser.emailVerified) {
      showMessage('success', 'Hesabınız zaten etkin. Ana sayfaya yönlendiriliyorsunuz.');
      navigate('/home', { replace: true });
      return; // Yönlendirme yapıldı, daha fazla işlem yapma
    }

    // Eğer kullanıcı oturumu yoksa (yani login olmamışsa) ve location.state'ten email gelmiyorsa Auth sayfasına git
    // Bu, doğrudan /verification sayfasına gelenleri (oturum açmadan) Auth sayfasına yönlendirecek.
    if (!currentUser && !location.state?.email) {
      navigate('/auth', { replace: true });
      return; // Yönlendirme yapıldı, daha fazla işlem yapma
    }

    // LoginForm'dan yönlendirildiyse identifier'ı (email) bir kez ayarla
    // isInitialLoad.current true ise ve location.state.email varsa identifier'ı ayarlar.
    // Ardından isInitialLoad.current'ı false yapar, böylece bir daha çalışmaz.
    if (isInitialLoad.current && location.state?.email) {
      setIdentifier(location.state.email);
      isInitialLoad.current = false; // Yalnızca bir kez çalışmasını işaretle
    }
    // showMessage, navigate ve location.state dependency array'de kalmalı
    // currentUser değişimleri de bu effect'i tetiklemeli
  }, [currentUser, navigate, showMessage, location.state]);

  // Giriş kodu gönderme
  const handleSendCode = async () => {
    if (!identifier) {
      showMessage('error', 'Lütfen e-posta adresinizi veya kullanıcı adınızı girin.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/send-login-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', data.message);
        setCodeSent(true);
      } else {
        showMessage('error', data.error || 'Kod gönderilemedi.');
      }
    } catch (error) {
      showMessage('error', `Kod gönderilirken hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Kodu doğrulama ve giriş yapma
  const handleVerifyCode = async () => {
    if (!identifier || !loginCode) {
      showMessage('error', 'Lütfen e-posta/kullanıcı adı ve kodu girin.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-login-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: loginCode })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', data.message);
        await signInWithCustomToken(auth, data.token);
        navigate('/home', { replace: true });
      } else {
        showMessage('error', data.error || 'Kod doğrulanamadı.');
      }
    } catch (error) {
      showMessage('error', `Kod doğrulanırken hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Google ile giriş yapma (LoginForm'daki kodun aynısı)
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idToken })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('error', data.error || 'Google ile giriş başarısız.');
        await auth.signOut();
      } else {
        showMessage('success', `Google ile giriş başarılı! Hoş geldin ${data.user.displayName || data.user.email}`);
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Google Sign-In Hatası:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        showMessage('error', 'Google giriş penceresi kapatıldı.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        showMessage('error', 'Aynı anda birden fazla giriş isteği algılandı.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        showMessage('error', 'Bu e-posta adresiyle başka bir kimlik doğrulama yöntemiyle zaten hesap var.');
      } else {
        showMessage('error', `Google ile giriş sırasında bir hata oluştu: ${error.message}`);
      }
    }
  };


  return (
    <section className={AuthPageStyle.authpage_section}>
      <div className={AuthPageStyle.auth_container}>
        <div className={`${AuthPageStyle.authBox_logo} mb-8`}>
          <h2 className={`${AuthPageStyle.welcome_title} text-2xl font-bold`}>Giriş Kodunu Onayla</h2>
          <h1 className={`${AuthPageStyle.AuthTitleLogo} text-5xl font-extrabold text-blue-600`}>W1</h1>
        </div>

        <div className={`${AuthFormsStyle.auth_form_container} p-8 rounded-lg shadow-xl bg-white max-w-md mx-auto`}>
          <h3 className="text-xl font-semibold mb-4 text-center">Giriş Yapmak İçin Kod Gerekli</h3>
          <p className={`${AuthFormsStyle.toggle_text} text-gray-700 mb-6 text-center`}>
            Hesabınıza giriş yapmak için e-posta adresinize bir kod göndereceğiz. Lütfen aşağıdaki alanı doldurun.
          </p>

          <label htmlFor="identifier-input" className="block text-gray-700 text-sm font-bold mb-2">E-posta Adresi veya Kullanıcı Adı</label>
          <input
            id="identifier-input"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            placeholder="email@example.com veya kullanıcı_adı"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={codeSent || loading}
          />

          {!codeSent ? (
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Giriş Kodu Gönder'}
            </button>
          ) : (
            <>
              <label htmlFor="code-input" className="block text-gray-700 text-sm font-bold mb-2">Giriş Kodu</label>
              <input
                id="code-input"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 text-center text-lg font-bold"
                placeholder="XXXXXX"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                maxLength="6"
                disabled={loading}
              />
              <button
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                {loading ? 'Doğrulanıyor...' : 'Kodu Onayla ve Giriş Yap'}
              </button>
              <button
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCodeSent(false)}
                disabled={loading}
              >
                Kodu Tekrar Gönder / E-postayı Değiştir
              </button>
            </>
          )}

          <div className="flex items-center justify-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 text-sm">VEYA</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google Logo" className="w-5 h-5" />
            <span>Google ile Giriş Yap</span>
          </button>

          <p className="text-gray-500 text-sm text-center mt-6">
            Yardım mı gerekiyor? Destek ile iletişime geçin.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerificationPage;
