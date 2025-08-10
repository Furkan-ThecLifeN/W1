import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import AuthStyle from './Auth.module.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    unicode: '',
    termsAccepted: false,
    communityAccepted: false,
    ageConfirmed: false,
    newsletterOptIn: false,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Şifreler uyuşmuyor.');
      return;
    }
    if (!formData.termsAccepted || !formData.communityAccepted || !formData.ageConfirmed) {
      setMessage('Lütfen gerekli kutucukları işaretleyin.');
      return;
    }

    try {
      // Firebase ile kullanıcı oluşturma
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(userCredential.user);
      const idToken = await userCredential.user.getIdToken();

      // Backend'e profil bilgilerini gönderme
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          unicode: formData.unicode,
          newsletterOptIn: formData.newsletterOptIn,
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Backend hatası');
      }

      setMessage('Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.');
    } catch (error) {
      setMessage(`Hata: ${error.message}`);
    }
  };

  return (
    <form className={AuthStyle.auth_form} onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      <label>First Name</label>
      <input type="text" name="firstname" required value={formData.firstname} onChange={handleChange} />

      <label>Last Name</label>
      <input type="text" name="lastname" required value={formData.lastname} onChange={handleChange} />

      <label>Email</label>
      <input type="email" name="email" required value={formData.email} onChange={handleChange} />

      <label>Password</label>
      <input type="password" name="password" required value={formData.password} onChange={handleChange} />

      <label>Confirm Password</label>
      <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />

      <label>Unicode</label>
      <input type="text" name="unicode" required value={formData.unicode} onChange={handleChange} />

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />
        <span>
          I accept the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" className={AuthStyle.checkBoxLabel_a}>Privacy Policy</a>.
        </span>
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="communityAccepted" checked={formData.communityAccepted} onChange={handleChange} />
        I have read and accept the <a href="/community-guidelines" target="_blank" rel="noreferrer" className={AuthStyle.checkBoxLabel_a}>Community Guidelines</a>.
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="ageConfirmed" checked={formData.ageConfirmed} onChange={handleChange} />
        I confirm that I am at least 13 years old.
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="newsletterOptIn" checked={formData.newsletterOptIn} onChange={handleChange} />
        I want to receive emails about special offers and updates (optional).
      </label>

      <button type="submit">Sign Up</button>

      {message && <p className={AuthStyle.message}>{message}</p>}
    </form>
  );
};

export default RegisterForm;
