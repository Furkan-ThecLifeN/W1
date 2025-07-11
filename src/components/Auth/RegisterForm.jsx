import React, { useState } from 'react';
import AuthStyle from "./Auth.module.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    communityAccepted: false,
    ageConfirmed: false,
    newsletterOptIn: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!formData.termsAccepted || !formData.communityAccepted || !formData.ageConfirmed) {
      alert('Please accept all required checkboxes.');
      return;
    }

    console.log('Registration Data:', formData);
  };

  return (
    <form className={AuthStyle.auth_form} onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      <label>First Name</label>
      <input type="text" name="firstname" required onChange={handleChange} />

      <label>Last Name</label>
      <input type="text" name="lastname" required onChange={handleChange} />

      <label>Email</label>
      <input type="email" name="email" required onChange={handleChange} />

      <label>Password</label>
      <input type="password" name="password" required onChange={handleChange} />

      <label>Confirm Password</label>
      <input type="password" name="confirmPassword" required onChange={handleChange} />

      <label>Unicode</label>
      <input type="password" name="unicode" required onChange={handleChange} />

      {/* Required: Terms and Privacy */}
      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="termsAccepted" onChange={handleChange} />
        <span>
          I accept the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank" className={AuthStyle.checkBoxLabel_a}>Privacy Policy</a>.
        </span>
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="communityAccepted" onChange={handleChange} />
        I have read and accept the <a href="/community-guidelines" target="_blank" className={AuthStyle.checkBoxLabel_a}>Community Guidelines</a>.
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="ageConfirmed" onChange={handleChange} />
        I confirm that I am at least 13 years old.
      </label>

      <label className={AuthStyle.checkbox_label}>
        <input type="checkbox" name="newsletterOptIn" onChange={handleChange} />
        I want to receive emails about special offers and updates (optional).
      </label>

      <button type="submit">Sign Up</button>
    </form>
  );
};

export default RegisterForm;
