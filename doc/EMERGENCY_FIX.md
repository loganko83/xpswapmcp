# 🚨 XPSwap 긴급 수정 가이드
## 즉시 실행 명령어 (서버에서)

### ✅ 1단계: 서버 업데이트
```bash
cd /var/www/storage/xpswap
git pull origin main
```

### ✅ 2단계: PM2 재시작
```bash
pm2 restart xpswap-api
```

### ✅ 3단계: Apache 재시작 (선택사항)
```bash
sudo systemctl reload apache2
```

### ✅ 4단계: 확인
```bash
curl -I https://trendy.storydot.kr/xpswap/assets/react-B-ht5LAu.js
```

### 📱 사용자 안내
브라우저에서 **Ctrl+F5** (Windows) 또는 **Cmd+Shift+R** (Mac)로 강제 새로고침

---

**📞 완료 후 테스트**: https://trendy.storydot.kr/xpswap/

**⏰ 예상 소요시간**: 2-3분
