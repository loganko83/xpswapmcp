import { Loader2, Wifi, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showProgress?: boolean;
  progress?: number;
  type?: 'spinner' | 'pulse' | 'skeleton';
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text,
  showProgress = false,
  progress = 0,
  type = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (type === 'skeleton') {
    return <SkeletonLoader className={className} />;
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`} />
        {text && (
          <p className={`${textSizes[size]} text-muted-foreground animate-pulse`}>{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {text && (
        <p className={`${textSizes[size]} text-muted-foreground animate-pulse text-center max-w-xs`}>
          {text}
        </p>
      )}
      {showProgress && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// 스켈레톤 로더 컴포넌트
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// 카드 스켈레톤 로더
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse border rounded-lg p-4 ${className}`}>
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// 개선된 페이지 로더
export function PageLoader({ text = "페이지를 로딩하는 중..." }: { text?: string }) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner 
        size="xl" 
        text={`${text}${dots}`}
        className="space-y-6"
      />
    </div>
  );
}

// 섹션 로더
export function SectionLoader({ text = "데이터를 불러오는 중..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// API 로딩 상태 컴포넌트
export function ApiLoader({ 
  isLoading, 
  error, 
  children, 
  loadingText = "데이터를 불러오는 중...",
  errorText = "데이터를 불러오는데 실패했습니다."
}: {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  errorText?: string;
}) {
  if (isLoading) {
    return <SectionLoader text={loadingText} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 text-sm">{errorText}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// 네트워크 상태 표시 컴포넌트
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50">
      <Wifi className="inline w-4 h-4 mr-2" />
      인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.
    </div>
  );
}

// 프로그레스 바 컴포넌트
export function ProgressBar({ 
  progress, 
  className = '',
  showText = true,
  color = 'blue'
}: {
  progress: number;
  className?: string;
  showText?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between text-sm mb-1">
          <span>진행률</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
