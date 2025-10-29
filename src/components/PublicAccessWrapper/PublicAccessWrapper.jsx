import React from "react";
import { useAuth } from "../../context/AuthProvider";

const PublicAccessWrapper = ({ children, loginMessage }) => {
  const { currentUser } = useAuth();

  // Eğer kullanıcı login değilse mesaj göster
  if (!currentUser) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "20px",
      }}>
        <p>{loginMessage || "Bu içeriği görmek için lütfen giriş yapın."}</p>
      </div>
    );
  }

  // Login varsa çocuk bileşenleri göster
  return <>{children}</>;
};

export default PublicAccessWrapper;
