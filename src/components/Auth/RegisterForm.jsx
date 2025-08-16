import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import styles from './AuthForms.module.css';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';

// Client-side validasyon regex'leri
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsernameFormat = (username) => /^[a-z0-9_.]{3,15}$/.test(username);
const isValidPasswordFormat = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/.test(password);

const RegisterForm = ({ onRegisterSuccess }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ showMessage yerine showToast kullanıyoruz
    const { showToast } = useAuth();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError(e.target.value && !isValidEmailFormat(e.target.value) ? 'Lütfen geçerli bir e-posta adresi girin.' : '');
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setUsernameError(e.target.value && !isValidUsernameFormat(e.target.value) ? 'Kullanıcı adı sadece küçük harf, rakam, alt çizgi (_) ve nokta (.) içermeli, 3-15 karakter olmalıdır.' : '');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError(e.target.value && !isValidPasswordFormat(e.target.value) ? 'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir.' : '');
        if (confirmPassword && e.target.value !== confirmPassword) {
            setConfirmPasswordError('Şifreler eşleşmiyor.');
        } else if (confirmPassword && e.target.value === confirmPassword) {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setConfirmPasswordError(e.target.value && e.target.value !== password ? 'Şifreler eşleşmiyor.' : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = isValidEmailFormat(email);
        const isUsernameValid = isValidUsernameFormat(username);
        const isPasswordValid = isValidPasswordFormat(password);
        const passwordsMatch = password === confirmPassword;

        setEmailError(isEmailValid ? '' : 'Geçerli bir e-posta adresi gerekli.');
        setUsernameError(isUsernameValid ? '' : 'Geçerli bir kullanıcı adı gerekli.');
        setPasswordError(isPasswordValid ? '' : 'Geçerli bir şifre gerekli.');
        setConfirmPasswordError(passwordsMatch ? '' : 'Şifreler eşleşmiyor.');

        if (!isEmailValid || !isUsernameValid || !isPasswordValid || !passwordsMatch) {
            // ✅ showMessage yerine showToast kullanıyoruz
            showToast('Lütfen tüm alanları doğru ve eksiksiz doldurun.', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, displayName, password, confirmPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                // ✅ showMessage yerine showToast kullanıyoruz
                showToast(data.error || 'Kayıt sırasında bir hata oluştu.', 'error');
            } else {
                // ✅ showMessage yerine showToast kullanıyoruz
                showToast('Kayıt başarılı! Şimdi giriş yapabilirsiniz.', 'success');
                if (onRegisterSuccess) { onRegisterSuccess(); }
                setEmail(''); setEmailError('');
                setUsername(''); setUsernameError('');
                setDisplayName('');
                setPassword(''); setPasswordError('');
                setConfirmPassword(''); setConfirmPasswordError('');
            }
        } catch (error) {
            // ✅ showMessage yerine showToast kullanıyoruz
            showToast(`İstek gönderilirken hata oluştu: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit} className={styles.auth_form_container}>
                <h2>Kayıt Ol</h2>
                <label>Email</label>
                <input type="email" value={email} onChange={handleEmailChange} placeholder="email@example.com" required />
                {emailError && <span className={styles.error_text}>{emailError}</span>}
                <label>Kullanıcı Adı</label>
                <input type="text" value={username} onChange={handleUsernameChange} placeholder="benzersiz_kullanici" required />
                {usernameError && <span className={styles.error_text}>{usernameError}</span>}
                <label>Görünen İsim (Opsiyonel)</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Furkan Yılmaz" />
                <span className={styles.error_text}></span>
                <label>Şifre</label>
                <input type="password" value={password} onChange={handlePasswordChange} placeholder="********" required />
                {passwordError && <span className={styles.error_text}>{passwordError}</span>}
                <label>Şifreyi Onayla</label>
                <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} placeholder="********" required />
                {confirmPasswordError && <span className={styles.error_text}>{confirmPasswordError}</span>}
                <button type="submit">Kayıt Ol</button>
            </form>
        </>
    );
};

export default RegisterForm;