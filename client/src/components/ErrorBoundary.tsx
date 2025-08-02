import React from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Bug, 
  Wifi, 
  Server,
  ShieldAlert,
  AlertTriangle 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

// 에러 타입 정의
export type ErrorType = 
  | 'network'
  | 'api'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'blockchain'
  | 'wallet'
  | 'unknown';

interface ErrorDetails {
  type: ErrorType;
  message: string;
  userMessage: string;
  action?: string;
  canRetry: boolean;
  icon: React.ComponentType<any>;
  color: 'destructive' | 'warning' | 'default';
}

// 에러 메시지 매핑
const errorMessages: Record<ErrorType, ErrorDetails> = {
  network: {
    type: 'network',
    message: 'Network connection failed',
    userMessage: '인터넷 연결을 확인해주세요. 네트워크가 불안정하거나 연결이 끊어진 것 같습니다.',
    action: '연결 상태를 확인하고 다시 시도해주세요.',
    canRetry: true,
    icon: Wifi,
    color: 'warning'
  },
  api: {
    type: 'api',
    message: 'API request failed',
    userMessage: '서버와의 통신에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    action: '문제가 지속되면 관리자에게 문의해주세요.',
    canRetry: true,
    icon: Server,
    color: 'destructive'
  },
  validation: {
    type: 'validation',
    message: 'Validation error',
    userMessage: '입력하신 정보를 다시 확인해주세요.',
    action: '모든 필드를 올바르게 입력했는지 확인해주세요.',
    canRetry: false,
    icon: AlertTriangle,
    color: 'warning'
  },
  permission: {
    type: 'permission',
    message: 'Permission denied',
    userMessage: '이 기능을 사용할 권한이 없습니다.',
    action: '로그인 상태를 확인하거나 관리자에게 문의해주세요.',
    canRetry: false,
    icon: ShieldAlert,
    color: 'destructive'
  },
  timeout: {
    type: 'timeout',
    message: 'Request timeout',
    userMessage: '요청 시간이 초과되었습니다. 네트워크가 느리거나 서버가 응답하지 않습니다.',
    action: '잠시 후 다시 시도해주세요.',
    canRetry: true,
    icon: AlertCircle,
    color: 'warning'
  },
  blockchain: {
    type: 'blockchain',
    message: 'Blockchain interaction failed',
    userMessage: '블록체인과의 연결에 문제가 발생했습니다.',
    action: '지갑 연결 상태를 확인하고 다시 시도해주세요.',
    canRetry: true,
    icon: AlertCircle,
    color: 'destructive'
  },
  wallet: {
    type: 'wallet',
    message: 'Wallet connection failed',
    userMessage: '지갑 연결에 실패했습니다.',
    action: 'MetaMask 등 지갑 확장 프로그램이 설치되어 있는지 확인해주세요.',
    canRetry: true,
    icon: AlertCircle,
    color: 'warning'
  },
  unknown: {
    type: 'unknown',
    message: 'Unknown error',
    userMessage: '예기치 않은 오류가 발생했습니다.',
    action: '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.',
    canRetry: true,
    icon: Bug,
    color: 'destructive'
  }
};

// 에러 타입 감지 함수
function detectErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  if (message.includes('timeout')) {
    return 'timeout';
  }
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('wallet') || message.includes('metamask')) {
    return 'wallet';
  }
  if (message.includes('blockchain') || message.includes('contract')) {
    return 'blockchain';
  }
  if (message.includes('api') || message.includes('server')) {
    return 'api';
  }
  
  return 'unknown';
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 로깅 (실제 환경에서는 외부 서비스로 전송)
    this.logError(error, errorInfo);
    
    this.setState({ errorInfo });
  }

  logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.table(errorReport);
    }
    
    // 프로덕션에서는 외부 로깅 서비스로 전송
    // 예: Sentry, LogRocket 등
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/xpswap';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const errorType = detectErrorType(this.state.error);
      const errorDetails = errorMessages[errorType];
      const Icon = errorDetails.icon;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full">
            <Alert variant={errorDetails.color} className="mb-6">
              <Icon className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold mb-2">
                문제가 발생했습니다
              </AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-sm leading-relaxed">
                  {errorDetails.userMessage}
                </p>
                
                {errorDetails.action && (
                  <p className="text-sm text-muted-foreground">
                    💡 {errorDetails.action}
                  </p>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      개발자 정보 (개발 모드에서만 표시)
                    </summary>
                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded font-mono">
                      <p><strong>Error ID:</strong> {this.state.errorId}</p>
                      <p><strong>Type:</strong> {errorType}</p>
                      <p><strong>Message:</strong> {this.state.error.message}</p>
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {errorDetails.canRetry && (
                    <Button 
                      onClick={this.handleReset} 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      다시 시도
                    </Button>
                  )}
                  
                  <Button 
                    onClick={this.handleReload} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    새로고침
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    홈으로
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {/* 도움말 섹션 */}
            <div className="text-center text-sm text-muted-foreground">
              <p>문제가 지속되시나요?</p>
              <a 
                href="https://github.com/loganko83/xpswapmcp/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                GitHub에서 이슈 신고하기
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 인라인 에러 컴포넌트 (작은 에러 표시용)
export function InlineError({ 
  error, 
  onRetry, 
  className = '',
  size = 'sm' 
}: {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const message = typeof error === 'string' ? error : error.message;
  const errorType = typeof error === 'string' ? 'unknown' : detectErrorType(error);
  const errorDetails = errorMessages[errorType];
  const Icon = errorDetails.icon;

  const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-base p-4'
  };

  return (
    <Alert variant={errorDetails.color} className={`${sizeClasses[size]} ${className}`}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <p className="mb-2">{errorDetails.userMessage}</p>
        {onRetry && errorDetails.canRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            다시 시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// API 에러 핸들러 유틸리티
export function handleApiError(error: any): Error {
  if (error.name === 'AbortError') {
    return new Error('요청이 취소되었습니다.');
  }
  
  if (!navigator.onLine) {
    return new Error('네트워크 연결을 확인해주세요.');
  }
  
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
  }
  
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      case 401:
        return new Error('인증이 필요합니다. 로그인해주세요.');
      case 403:
        return new Error('접근 권한이 없습니다.');
      case 404:
        return new Error('요청한 리소스를 찾을 수 없습니다.');
      case 429:
        return new Error('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.');
      case 500:
        return new Error('서버 내부 오류가 발생했습니다.');
      case 502:
        return new Error('서버 게이트웨이 오류가 발생했습니다.');
      case 503:
        return new Error('서비스를 일시적으로 사용할 수 없습니다.');
      default:
        return new Error(`서버 오류가 발생했습니다. (${status})`);
    }
  }
  
  return new Error(error.message || '알 수 없는 오류가 발생했습니다.');
}
