import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // <-- BU SATIRI SİLİN VEYA YORUMA ALIN
import Styles from "./SplashScreen.module.css";

const SplashScreen = () => {
  const [expandText, setExpandText] = useState(false);
  // const navigate = useNavigate(); // <-- BU SATIRI SİLİN VEYA YORUMA ALIN

  useEffect(() => {
    const timer1 = setTimeout(() => setExpandText(true), 2500); // Yazı büyümeye başlar
    // const timer2 = setTimeout(() => navigate("/home"), 6000); // <-- BU SATIRI SİLİN

    return () => {
      clearTimeout(timer1);
      // clearTimeout(timer2); // <-- BU SATIRI SİLİN
    };
  }, []); // <-- BAĞIMLILIĞI (navigate) BURADAN KALDIRIN

  return (
    <div className={Styles.SplashScreen}>
      <div className={Styles.SplashScreen_container}>
        <svg
          viewBox="0 0 300 100"
          className={`${Styles.svg} ${expandText ? Styles.expand : ""}`}
        >
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`${Styles.writingText} ${
              expandText ? Styles.fillWhite : ""
            }`}
          >
            W1
          </text>
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;