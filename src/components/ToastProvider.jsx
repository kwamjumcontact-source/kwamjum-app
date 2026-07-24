import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, WarningCircle, Warning, Info, X } from '@phosphor-icons/react';
import './ToastProvider.css';

const ToastContext = createContext(null);

const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success': return <CheckCircle size={24} weight="fill" className="toast-icon success" />;
    case 'error': return <WarningCircle size={24} weight="fill" className="toast-icon error" />;
    case 'warning': return <Warning size={24} weight="fill" className="toast-icon warning" />;
    case 'info': return <Info size={24} weight="fill" className="toast-icon info" />;
    default: return <Info size={24} weight="fill" className="toast-icon info" />;
  }
};

const Toast = ({ id, type = 'info', message, duration = 3000, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300); // Wait for animation
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div className={`toast toast-${type} ${isLeaving ? 'toast-leave' : 'toast-enter'}`}>
      <div className="toast-icon-container">
        <ToastIcon type={type} />
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close toast">
        <X size={16} weight="bold" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, message, duration = 3000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => {
      const newToasts = [...prevToasts, { id, type, message, duration }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
