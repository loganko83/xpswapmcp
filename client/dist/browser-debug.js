// XPSwap 브라우저 디버깅 스크립트
// 사용법: F12 개발자 도구 콘솔에서 실행

console.log('🚀 XPSwap 브라우저 디버깅 시작...');

const debugInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errors: [],
    warnings: [],
    apiTests: {},
    reactStatus: 'unknown',
    routerStatus: 'unknown'
};

// 1. 기본 정보 수집
console.log('📍 현재 위치:', window.location.href);
console.log('🌐 User Agent:', navigator.userAgent);

// 2. React 앱 상태 확인
try {
    if (window.React) {
        debugInfo.reactStatus = 'loaded';
        console.log('✅ React 로드됨');
    } else {
        debugInfo.reactStatus = 'not_loaded';
        console.log('❌ React 로드되지 않음');
    }
} catch (e) {
    debugInfo.reactStatus = 'error';
    debugInfo.errors.push('React 확인 중 오류: ' + e.message);
}

// 3. DOM 상태 확인
const rootElement = document.getElementById('root');
if (rootElement) {
    console.log('✅ React 루트 엘리먼트 존재');
    console.log('📦 루트 엘리먼트 내용 길이:', rootElement.innerHTML.length);
    if (rootElement.innerHTML.length < 100) {
        debugInfo.warnings.push('루트 엘리먼트 내용이 거의 비어있음');
        console.log('⚠️ 루트 엘리먼트가 거의 비어있습니다');
    }
} else {
    debugInfo.errors.push('React 루트 엘리먼트가 없음');
    console.log('❌ React 루트 엘리먼트를 찾을 수 없음');
}

// 4. API 엔드포인트 테스트
const apiEndpoints = [
    '/xpswap/api/health',
    '/xpswap/api/xp-price',
    '/xpswap/api/crypto-ticker'
];

async function testAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.text();
        debugInfo.apiTests[endpoint] = {
            status: response.status,
            ok: response.ok,
            dataLength: data.length
        };
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
        return response.ok;
    } catch (error) {
        debugInfo.apiTests[endpoint] = {
            status: 'error',
            error: error.message
        };
        console.log(`❌ ${endpoint}: ${error.message}`);
        return false;
    }
}

// 5. 라우터 상태 확인
try {
    if (window.history && window.history.pushState) {
        debugInfo.routerStatus = 'supported';
        console.log('✅ History API 지원됨 (React Router 호환)');
    } else {
        debugInfo.routerStatus = 'not_supported';
        console.log('❌ History API 지원되지 않음');
    }
} catch (e) {
    debugInfo.routerStatus = 'error';
    debugInfo.errors.push('라우터 확인 중 오류: ' + e.message);
}

// 6. 콘솔 에러 캐치
const originalConsoleError = console.error;
console.error = function(...args) {
    debugInfo.errors.push(args.join(' '));
    originalConsoleError.apply(console, args);
};

// 7. JavaScript 에러 캐치
window.addEventListener('error', function(event) {
    debugInfo.errors.push(`JavaScript 에러: ${event.message} at ${event.filename}:${event.lineno}`);
});

// 8. Promise rejection 캐치
window.addEventListener('unhandledrejection', function(event) {
    debugInfo.errors.push(`Unhandled Promise Rejection: ${event.reason}`);
});

// 9. 종합 진단 실행
async function runFullDiagnosis() {
    console.log('🔍 종합 진단 실행 중...');
    
    // API 테스트 실행
    for (const endpoint of apiEndpoints) {
        await testAPI(endpoint);
    }
    
    // 최종 리포트 생성
    console.log('📊 진단 결과 요약:');
    console.log('==================');
    console.log('React 상태:', debugInfo.reactStatus);
    console.log('라우터 상태:', debugInfo.routerStatus);
    console.log('에러 개수:', debugInfo.errors.length);
    console.log('경고 개수:', debugInfo.warnings.length);
    
    if (debugInfo.errors.length > 0) {
        console.log('❌ 발견된 에러들:');
        debugInfo.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }
    
    if (debugInfo.warnings.length > 0) {
        console.log('⚠️ 발견된 경고들:');
        debugInfo.warnings.forEach((warning, index) => {
            console.log(`   ${index + 1}. ${warning}`);
        });
    }
    
    console.log('🔗 API 엔드포인트 상태:');
    Object.keys(debugInfo.apiTests).forEach(endpoint => {
        const result = debugInfo.apiTests[endpoint];
        console.log(`   ${endpoint}: ${result.status} ${result.ok ? '✅' : '❌'}`);
    });
    
    // 자동 수정 제안
    console.log('🛠️ 자동 수정 제안:');
    if (debugInfo.reactStatus === 'not_loaded') {
        console.log('   1. 페이지 새로고침 (Ctrl+F5)');
        console.log('   2. 브라우저 캐시 삭제');
    }
    
    if (Object.values(debugInfo.apiTests).some(test => !test.ok)) {
        console.log('   3. API 서버 상태 확인 필요');
    }
    
    if (debugInfo.errors.length > 0) {
        console.log('   4. 개발자 도구 Network 탭에서 실패한 요청 확인');
    }
    
    // 전체 디버그 정보 반환
    return debugInfo;
}

// 10. 자동 실행
console.log('⏳ 3초 후 자동 진단 시작...');
setTimeout(runFullDiagnosis, 3000);

// 수동 실행 함수도 제공
window.xpswapDebug = runFullDiagnosis;
console.log('💡 수동 실행: window.xpswapDebug()');
