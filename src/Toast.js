import React from 'react';
// ✅ AuthProvider'ın belirtilen doğru yolu
import { useAuth } from '../src/context/AuthProvider'; 

const Toast = () => {
  const { message } = useAuth();
  
  if (!message.text) return null;

  // Mesaj tipine göre stil belirleme
  let backgroundColor;
  let boxShadowColor;

  switch (message.type) {
    case 'success':
      backgroundColor = 'rgba(255, 255, 255, 1)'; // Yeşil, hafif şeffaf
      boxShadowColor = 'rgba(255, 255, 255, 1)';
      break;
    case 'error':
      backgroundColor = 'rgba(255, 17, 0, 0.9)'; // Kırmızı, hafif şeffaf
      boxShadowColor = 'rgba(244, 67, 54, 0.4)';
      break;
    default: // Bilgi veya varsayılan mesajlar için
      backgroundColor = 'rgba(33, 150, 243, 0.9)'; // Mavi, hafif şeffaf
      boxShadowColor = 'rgba(33, 150, 243, 0.4)';
      break;
  }

  const style = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px', // Modern dolgu
    borderRadius: '12px', // Yuvarlak köşeler
    color: '#00bbffff', // Beyaz yazı rengi
    
    zIndex: 9999, // Her zaman en önde
    backgroundColor: backgroundColor,
    boxShadow: `0 6px 20px ${boxShadowColor}`, // Renkli ve yumuşak gölge
    animation: 'fadeInOut 4s forwards',
    fontFamily: '"Inter", sans-serif, "Helvetica Neue", Arial, "Noto Sans", sans-serif', // Modern font ailesi
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // İçerik arasında boşluk
    // backdropFilter: 'blur(5px)', // Modern "buzlu cam" efekti - tarayıcı desteği önemli
  };

  return (
    <div style={style}>
      {message.text}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
