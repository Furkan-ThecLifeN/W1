import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

const AddButton = ({ onClick }) => {
  const [hover, setHover] = useState(false);

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    marginLeft: "auto",
    cursor: "pointer",
    background: hover
      ? "linear-gradient(135deg, #5865F2, #9b59b6)"
      : "rgba(255, 255, 255, 0.08)",
    boxShadow: hover
      ? "0 0 12px rgba(88, 101, 242, 0.8), 0 0 4px rgba(255, 255, 255, 0.5)"
      : "none",
    border: hover ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    transform: hover ? "scale(1.1) rotate(90deg)" : "scale(1) rotate(0deg)",
  };

  return (
    <div
      style={btnStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Yeni Kanal Oluştur"
    >
      <FaPlus style={{ color: "white", fontSize: "10px", pointerEvents: "none" }} />
    </div>
  );
};

export default AddButton;