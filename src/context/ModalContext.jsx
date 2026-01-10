import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from './LanguageContext';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};

export const ModalProvider = ({ children }) => {
  const { t } = useTranslation();
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'alert', // 'alert', 'confirm', 'info', 'prompt'
    onConfirm: null,
    onCancel: null,
    confirmText: '',
    cancelText: ''
  });
  const [inputValue, setInputValue] = useState('');

  const showAlert = useCallback((message, title = t('modal_alert_title')) => {
    setModal({
      show: true,
      title,
      message,
      type: 'alert',
      confirmText: t('confirm') || 'OK',
    });
  }, [t]);

  const showConfirm = useCallback((message, onConfirm, onCancel, title = t('modal_confirm_title'), confirmLabel = '', cancelLabel = '') => {
    setModal({
      show: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      onCancel,
      confirmText: confirmLabel || t('confirm') || 'Confirm',
      cancelText: cancelLabel || t('cancel') || 'Cancel'
    });
  }, [t]);

  const showPrompt = useCallback((message, onConfirm, defaultValue = '', title = t('modal_confirm_title'), confirmLabel = '', cancelLabel = '') => {
    setInputValue(defaultValue);
    setModal({
      show: true,
      title,
      message,
      type: 'prompt',
      onConfirm: (val) => onConfirm(val),
      confirmText: confirmLabel || t('confirm') || 'Confirm',
      cancelText: cancelLabel || t('cancel') || 'Cancel'
    });
  }, [t]);

  const showInfo = useCallback((message, onConfirm, title = t('modal_info_title')) => {
    setModal({
      show: true,
      title,
      message,
      type: 'info',
      onConfirm,
      confirmText: t('confirm') || 'OK',
    });
  }, [t]);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, show: false }));
    setInputValue('');
  }, []);

  const handleConfirm = () => {
    if (modal.onConfirm) {
      if (modal.type === 'prompt') {
        modal.onConfirm(inputValue);
      } else {
        modal.onConfirm();
      }
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modal.onCancel) modal.onCancel();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt, showInfo, hideModal }}>
      {children}
      {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-card-dark border border-white/10 rounded-[32px] p-8 shadow-2xl animate-scale-in flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${modal.type === 'confirm' || modal.type === 'prompt' ? 'bg-primary/10' : 'bg-primary/10'} rounded-full flex items-center justify-center mb-6`}>
              <span className="material-symbols-outlined text-primary text-3xl">
                {modal.type === 'confirm' ? 'help_outline' : modal.type === 'prompt' ? 'edit' : modal.type === 'info' ? 'info' : 'warning'}
              </span>
            </div>
            
            {modal.title && <h2 className="text-white font-extrabold text-xl mb-3 tracking-tight">{modal.title}</h2>}
            <p className="text-gray-400 font-medium text-base mb-8 leading-relaxed whitespace-pre-wrap">{modal.message}</p>
            
            {modal.type === 'prompt' && (
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white text-base font-bold mb-8 outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            )}

            <div className="flex w-full gap-3">
              {(modal.type === 'confirm' || modal.type === 'prompt') && (
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all active:scale-95 border border-white/5"
                >
                  {modal.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm}
                className="flex-1 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
