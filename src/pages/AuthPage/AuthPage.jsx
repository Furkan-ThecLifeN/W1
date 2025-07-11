import React, { useState } from "react";
import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import AuthPageStyle from "./AuthPage.module.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <section className={AuthPageStyle.authpage_section}>
      <div className={AuthPageStyle.auth_container}>
        <div className={AuthPageStyle.authBox_logo}>
          <h2 className={AuthPageStyle.welcome_title}>Welcome to</h2>
          <h1 className={AuthPageStyle.AuthTitleLogo}>W1</h1>
        </div>

        <div className={AuthPageStyle.auth_toggleBox}>
          {isLogin ? <LoginForm /> : <RegisterForm />}

          <p style={{ marginTop: "20px", color: "#333" }}>
            {isLogin ? (
              <div className={AuthPageStyle.handleToggle}>
                Don't have an account?{" "}
                <span
                  className={AuthPageStyle.handletoggle_Btn}
                  onClick={handleToggle}
                  style={{
                    color: "#00aaff",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Sign up
                </span>
              </div>
            ) : (
              <div className={AuthPageStyle.handleToggle}>
                Do you have an account?{" "}
                <span
                  className={AuthPageStyle.handletoggle_Btn}
                  onClick={handleToggle}
                  style={{
                    color: "#00aaff",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Sign in
                </span>
              </div>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
