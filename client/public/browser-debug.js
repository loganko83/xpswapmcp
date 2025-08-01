# XPSwap 브라우저 디버깅 테스트 페이지
# 브라우저에서 F12 -> Console 탭에서 실행하세요

# 1. 기본 환경 확인
console.log('🔍 XPSwap 디버깅 시작');
console.log('현재 URL:', window.location.href);
console.log('사용자 에이전트:', navigator.userAgent);

# 2. DOM 확인
console.log('📄 DOM 상태 확인:');
console.log('HTML title:', document.title);
console.log('Body 클래스:', document.body.className);
console.log('Root 엘리먼트:', document.getElementById('root'));

# 3. React 앱 확인
if (window.React) {
    console.log('✅ React 로드됨:', window.React.version);
} else {
    console.log('❌ React 로드되지 않음');
}

# 4. CSS 스타일 확인
const stylesheets = Array.from(document.styleSheets);
console.log('📎 로드된 스타일시트:', stylesheets.length);
stylesheets.forEach((sheet, index) => {
    try {
        console.log(`  ${index + 1}. ${sheet.href || '인라인 스타일'}`);
    } catch (e) {
        console.log(`  ${index + 1}. 접근 불가 (CORS)`);
    }
});

# 5. JavaScript 에러 확인
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript 에러:', e.error);
    console.error('파일:', e.filename, '라인:', e.lineno);
});

# 6. API 연결 테스트
async function testAPI() {
    console.log('🔗 API 연결 테스트 시작');
    
    const endpoints = [
        '/xpswap/api/health',
        '/xpswap/api/xp-price',
        '/xpswap/api/crypto-ticker'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.text();
                console.log(`   응답: ${data.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error(`❌ ${endpoint}: ${error.message}`);
        }
    }
}

# 7. 네트워크 요청 모니터링
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🌐 Fetch 요청:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            console.log('📥 응답 받음:', args[0], response.status);
            return response;
        })
        .catch(error => {
            console.error('🚨 Fetch 에러:', args[0], error);
            throw error;
        });
};

# 8. 즉시 실행
testAPI();

console.log('🎯 XPSwap 디버깅 설정 완료');
console.log('다음 명령어들을 사용할 수 있습니다:');
console.log('- testAPI(): API 엔드포인트 테스트');
console.log('- location.reload(): 페이지 새로고침');
console.log('- localStorage: 로컬 스토리지 확인');