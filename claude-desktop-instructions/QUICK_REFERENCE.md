# XPSwap 빠른 개발 참조

## 🔥 자주 사용하는 명령어

### 개발 시작
```powershell
cd "C:\Users\vincent\Downloads\XPswap\XPswap"
npm run dev:full
```

### 파일 수정 위치
- **메뉴 수정**: `client/src/components/Layout.tsx`
- **홈페이지 수정**: `client/src/pages/home.tsx`
- **API 추가**: `server/routes.ts`
- **새 페이지 추가**: `client/src/pages/` + `client/src/App.tsx` 라우트 추가

### 빌드 및 배포
```powershell
# 로컬 빌드
npm run build

# 서버 배포 (SSH 연결 필요)
scp -r dist/ user@server:/var/www/storage/xpswap/
scp -r client/dist/ user@server:/var/www/storage/xpswap/client/
```

### 문제 해결
```powershell
# 포트 확인
netstat -ano | findstr :5000

# 의존성 재설치
rm -rf node_modules ; npm install

# 데이터베이스 초기화
rm test.db ; touch test.db
```

## 🎯 주요 API 엔드포인트

- `GET /api/health` - 서버 상태
- `GET /api/xp-price` - XP 가격
- `GET /api/market-stats` - 시장 통계
- `POST /api/swap/quote` - 스왑 견적
- `POST /api/liquidity/add` - 유동성 추가
- `GET /api/farming/pools` - 파밍 풀 목록

## 📌 중요 파일 경로

```
client/
├── src/
│   ├── App.tsx              # 라우팅 설정
│   ├── components/
│   │   ├── Layout.tsx       # 레이아웃 & 메뉴
│   │   ├── SwapInterface.tsx # 스왑 UI
│   │   └── ui/             # shadcn 컴포넌트
│   └── pages/              # 페이지 컴포넌트
│
server/
├── index.ts                # 서버 진입점
├── routes.ts              # API 라우트
└── db.ts                  # DB 설정
```

## 🔗 유용한 링크

- 로컬: http://localhost:5000/xpswap/
- 서버: https://trendy.storydot.kr/xpswap/
- API: http://localhost:5000/api/

## 💡 개발 팁

1. **Hot Reload**: Vite가 자동으로 변경사항 반영
2. **API 테스트**: Thunder Client 또는 Postman 사용
3. **타입 체크**: `npm run check` 실행
4. **로그 확인**: `console.log` 또는 `server/logs/` 확인
