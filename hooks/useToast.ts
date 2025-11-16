'use client';

import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface UseToastReturn {
  toastMessage: string;
  toastType: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export function useToast(): UseToastReturn {
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage('');
  }, []);

  return {
    toastMessage,
    toastType,
    showToast,
    hideToast,
  };
}
