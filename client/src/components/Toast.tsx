import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // 자동 제거
    if (newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title });
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast({ type: 'error', message, title, duration: 7000 });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title, duration: 6000 });
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
      clearAll
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  React.useEffect(() => {
    // 등장 애니메이션
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getVariant = () => {
    switch (toast.type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <Alert 
        variant={getVariant()}
        className={`relative border-l-4 ${getBorderColor()} shadow-lg bg-white/95 backdrop-blur-sm`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <div className="font-semibold text-sm mb-1">
                {toast.title}
              </div>
            )}
            <AlertDescription className="text-sm">
              {toast.message}
            </AlertDescription>
            
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 프로그레스 바 (자동 사라지는 경우) */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-current opacity-30 transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${toast.duration}ms linear`
              }}
            />
          </div>
        )}
      </Alert>
    </div>
  );
}

// 전역 스타일을 위한 CSS (실제로는 global CSS 파일에 추가해야 함)
const toastStyles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// 편의 함수들을 export
export const toast = {
  success: (message: string, title?: string) => {
    // Context 외부에서 사용할 수 있도록 window 이벤트 활용
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'success', message, title }
    }));
  },
  error: (message: string, title?: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'error', message, title }
    }));
  },
  warning: (message: string, title?: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'warning', message, title }
    }));
  },
  info: (message: string, title?: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'info', message, title }
    }));
  }
};

// Window 이벤트 리스너를 위한 Hook
export function useGlobalToast() {
  const { addToast } = useToast();

  React.useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { type, message, title } = event.detail;
      addToast({ type, message, title });
    };

    window.addEventListener('show-toast', handleToastEvent as EventListener);
    return () => {
      window.removeEventListener('show-toast', handleToastEvent as EventListener);
    };
  }, [addToast]);
}

// CSS 주입을 위한 컴포넌트 (한번만 렌더링)
export function ToastStyles() {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = toastStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// 사전 정의된 메시지들
export const toastMessages = {
  // 성공 메시지
  success: {
    walletConnected: '지갑이 성공적으로 연결되었습니다!',
    transactionSuccess: '트랜잭션이 성공적으로 완료되었습니다!',
    swapSuccess: '토큰 스왑이 완료되었습니다!',
    liquidityAdded: '유동성이 성공적으로 추가되었습니다!',
    stakingSuccess: '스테이킹이 완료되었습니다!'
  },
  
  // 에러 메시지
  error: {
    walletNotFound: 'MetaMask 지갑을 찾을 수 없습니다. 설치되어 있는지 확인해주세요.',
    networkError: '네트워크 연결에 문제가 발생했습니다.',
    transactionFailed: '트랜잭션이 실패했습니다. 다시 시도해주세요.',
    insufficientBalance: '잔액이 부족합니다.',
    slippageTooHigh: '슬리피지가 너무 높습니다. 설정을 확인해주세요.'
  },
  
  // 경고 메시지
  warning: {
    highSlippage: '슬리피지가 높습니다. 계속 진행하시겠습니까?',
    networkSwitch: '네트워크를 Xphere로 변경해주세요.',
    lowLiquidity: '유동성이 낮아 큰 가격 변동이 있을 수 있습니다.'
  },
  
  // 정보 메시지
  info: {
    connectWallet: '지갑을 연결하여 거래를 시작하세요.',
    approveToken: '토큰 승인이 필요합니다.',
    transactionPending: '트랜잭션이 처리 중입니다...'
  }
};
