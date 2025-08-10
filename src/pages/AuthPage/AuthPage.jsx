import React, { useState } from "react";
import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import AuthPageStyle from "./AuthPage.module.css";
import AuthFormsStyle from "../../components/Auth/AuthForms.module.css"; // Ortak form stilleri için

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
  };

  // RegisterForm'dan gelen başarı durumunda login formuna geçiş yapmak için
  const handleRegisterSuccess = () => {
    setIsLogin(true); // Kayıt başarılıysa giriş formuna geç
  };

  return (
    <section className={AuthPageStyle.authpage_section}>
      <div className={AuthPageStyle.auth_container}>
        <div className={AuthPageStyle.authBox_logo}>
          <h2 className={AuthPageStyle.welcome_title}>Welcome to</h2>
          <h1 className={AuthPageStyle.AuthTitleLogo}>W1</h1>
        </div>

        <div className={AuthFormsStyle.auth_form_container}> 
          <div className={AuthPageStyle.auth_toggleBox}>
            {isLogin ? <LoginForm /> : <RegisterForm onRegisterSuccess={handleRegisterSuccess} />}

            <p className={AuthFormsStyle.toggle_text}>
              {isLogin ? (
                <>
                  Hesabın yok mu?{" "}
                  <span
                    className={AuthFormsStyle.toggle_link}
                    onClick={handleToggle}
                  >
                    Kaydol
                  </span>
                </>
              ) : (
                <>
                  Zaten hesabın var mı?{" "}
                  <span
                    className={AuthFormsStyle.toggle_link}
                    onClick={handleToggle}
                  >
                    Giriş Yap
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
