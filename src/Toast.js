import React from 'react';
import { useAuth } from './AuthProvider';

const Toast = () => {
  const { message } = useAuth();
  
  if (!message.text) return null;

  const style = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '5px',
    color: 'white',
    zIndex: 1000,
    backgroundColor: message.type === 'success' ? '#4CAF50' : '#F44336',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    animation: 'fadeInOut 4s forwards'
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