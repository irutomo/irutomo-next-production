'use client';

import { useCallback } from 'react';
import { toast } from 'react-toastify';

// 使用可能なトーストタイプ
type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * トースト通知を表示するためのカスタムフック
 * @returns トースト通知関数
 */
const useToast = () => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const options = {
      position: toast.POSITION.TOP_CENTER,
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
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
      default:
        toast.info(message, options);
        break;
    }
  }, []);

  return showToast;
};

export default useToast; 