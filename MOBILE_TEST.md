# 모바일 기기에서 로컬 개발 환경 테스트하기

## 방법 1: 같은 Wi-Fi 네트워크 사용 (권장)

### 1단계: 개발 서버 실행
```bash
npm run dev:mobile
```

### 2단계: 로컬 IP 주소 확인
Mac에서:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Windows에서:
```bash
ipconfig
```

예시 결과: `192.168.0.3`

### 3단계: 모바일에서 접속
1. 모바일 기기가 같은 Wi-Fi에 연결되어 있는지 확인
2. 모바일 브라우저에서 접속:
   ```
   http://192.168.0.3:3000
   ```

## 방법 2: ngrok 사용 (외부 네트워크에서도 가능)

### 설치
```bash
# Mac (Homebrew)
brew install ngrok

# 또는 npm으로 설치
npm install -g ngrok
```

### 사용
1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 새 터미널에서 ngrok 실행:
   ```bash
   ngrok http 3000
   ```

3. 생성된 공개 URL로 접속 (예: `https://abc123.ngrok.io`)

## 방법 3: Chrome DevTools 원격 디버깅

### Android Chrome
1. USB 디버깅 활성화 (개발자 옵션)
2. USB로 연결
3. Chrome에서 `chrome://inspect` 접속
4. 포트 포워딩 설정: 3000 → localhost:3000
5. 모바일에서 `http://localhost:3000` 접속

### iOS Safari
1. iPhone 설정 → Safari → 고급 → 웹 검사기 활성화
2. Mac Safari → 개발 메뉴 활성화
3. USB로 연결
4. Safari 개발 메뉴에서 iPhone 선택

## 방법 4: QR 코드로 빠른 접속

### QR 코드 생성 스크립트
```bash
# qrcode 패키지 설치
npm install -g qrcode-terminal

# QR 코드 생성
echo "http://192.168.0.3:3000" | qrcode-terminal
```

## 트러블슈팅

### 연결이 안 될 때
1. **방화벽 확인**: 3000 포트가 열려있는지 확인
   - Mac: 시스템 환경설정 → 보안 및 개인정보 보호 → 방화벽
   - Windows: Windows Defender 방화벽 설정

2. **같은 네트워크 확인**: 컴퓨터와 모바일이 같은 Wi-Fi에 연결되어 있는지 확인

3. **개발 서버 확인**: 
   ```bash
   # 0.0.0.0으로 바인딩되었는지 확인
   npm run dev:mobile
   ```

4. **IP 주소 변경**: Wi-Fi 재연결 시 IP가 변경될 수 있음

### 모바일 디버깅 팁

1. **콘솔 로그 확인**:
   - Android: Chrome 원격 디버깅 사용
   - iOS: Safari 웹 검사기 사용

2. **네트워크 요청 확인**:
   - 모바일 브라우저 개발자 도구 사용
   - 또는 프록시 도구 (Charles, Fiddler) 사용

3. **반응형 테스트**:
   - 실제 기기 테스트가 가장 정확
   - Chrome DevTools Device Mode는 참고용

## 환경 변수 설정 (중요!)

모바일 테스트 시 API 호출이 필요한 경우:

1. `.env.local` 파일 확인:
   ```bash
   # Upstash Redis는 외부에서도 접근 가능하므로 문제 없음
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```

2. CORS 설정은 이미 Next.js가 처리함

## 유용한 도구

- **Browsersync**: 여러 기기 동시 테스트
- **Remote Preview**: QR 코드로 쉽게 공유
- **LocalTunnel**: ngrok 대안
- **Tailscale**: VPN 기반 로컬 네트워크 공유