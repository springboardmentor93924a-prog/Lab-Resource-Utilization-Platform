import React, { useEffect } from "react";
import "./Toast.css";

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-icon">
        {type === "success" ? "✓" : type === "warning" ? "⚠️" : "🔔"}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

export default Toast;