'use client';

import { toast, ToastOptions, TypeOptions } from 'react-toastify';
import { useCallback } from 'react';

// 使用可能なトーストタイプ
type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Toastを表示するためのカスタムフック
 * react-toastifyを使用
 */
export const useToast = () => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const options: ToastOptions = {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      default:
        toast.info(message, options);
        break;
    }
  }, []);

  return { showToast };
}; 