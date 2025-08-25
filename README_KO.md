# 언제만나 (When2Meet)

> 최적의 모임 시간을 찾아주는 간편한 그룹 일정 조율 서비스

[English Documentation](./README.md)

## 개요

언제만나는 참가자들이 선택된 날짜에 대한 가능 여부를 표시하여 그룹의 최적 모임 시간을 찾도록 도와주는 일정 조율 도구입니다. 최신 웹 기술로 구축되어 깔끔하고 직관적인 협업 일정 관리 인터페이스를 제공합니다.

## 주요 기능

- 📅 **직관적인 날짜 선택**: 클릭 및 드래그로 여러 날짜를 한 번에 선택
- 👥 **동적 참가자 관리**: 생성 시 또는 실시간으로 참가자 추가
- 🎯 **가능 여부 추적**: 3단계 시스템 (참여, 불참, 미정)
- 📊 **실시간 최적 날짜**: 대부분의 참가자에게 가장 적합한 날짜를 즉시 확인
- 📱 **반응형 디자인**: 데스크톱과 모바일에서 완벽하게 작동
- 🔗 **URL 단축**: 쉬운 공유를 위한 단축 링크 옵션
- 🔒 **일정 잠금**: 확정된 일정의 실수 변경 방지

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: Upstash Redis (18개월 TTL)
- **배포**: Vercel
- **빌드 도구**: Turbopack

## 시작하기

### 사전 요구사항

- Node.js 18.0 이상
- npm, yarn, 또는 pnpm
- Upstash Redis 계정 (무료 티어 사용 가능)

### 환경 설정

1. 저장소 클론:
```bash
git clone https://github.com/yourusername/when2meet.git
cd when2meet
```

2. 의존성 설치:
```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

3. `.env.local` 파일 생성:
```bash
# 필수: Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# 선택: URL 단축기
SHORTENER_API_URL=your_shortener_api_url
SHORTENER_API_KEY=your_shortener_api_key
```

4. 개발 서버 실행:
```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

[http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### Upstash Redis 설정

1. [Upstash Console](https://console.upstash.com)에서 가입
2. 새 Redis 데이터베이스 생성
3. 대시보드에서 REST URL과 토큰 복사
4. `.env.local` 파일에 추가

## 프로젝트 구조

```
when2meet/
├── app/                        # Next.js 앱 라우터
│   ├── api/                   # API 라우트
│   │   ├── meetings/          # 모임 CRUD 작업
│   │   └── shorten/           # URL 단축 서비스
│   ├── meeting/[id]/          # 모임 보기 페이지
│   └── page.tsx               # 랜딩 페이지
├── components/                 # React 컴포넌트
│   ├── AboutModal.tsx         # 정보 다이얼로그
│   ├── DateSelector.tsx       # 캘린더 날짜 선택기
│   ├── MeetingTitleInput.tsx  # 제목 입력 컴포넌트
│   └── ParticipantsInput.tsx  # 참가자 관리
├── lib/                        # 유틸리티 함수
│   ├── redis.ts               # Redis 클라이언트 설정
│   ├── types.ts               # TypeScript 정의
│   └── utils/                 # 헬퍼 함수
└── public/                     # 정적 자산
```

## API 엔드포인트

### 모임

- `POST /api/meetings` - 새 모임 생성
- `GET /api/meetings/[id]` - 모임 세부 정보 조회
- `PUT /api/meetings/[id]` - 모임 업데이트 (가능 여부, 잠금 상태)
- `DELETE /api/meetings/[id]` - 모임 삭제

### URL 단축기

- `POST /api/shorten` - 단축 URL 생성 (선택 기능)

## 개발

### 테스트 실행
```bash
npm run test
```

### 코드 품질
```bash
npm run lint        # ESLint 실행
npm run type-check  # TypeScript 타입 체크
```

### 프로덕션 빌드
```bash
npm run build
npm run start
```

## 배포

### Vercel에 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 저장소 가져오기
3. Vercel 대시보드에서 환경 변수 추가
4. 배포

main 브랜치에 푸시하면 자동으로 배포됩니다.

### 프로덕션 환경 변수

Vercel 대시보드에서 필수:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

선택:
- `SHORTENER_API_URL`
- `SHORTENER_API_KEY`

## 기능 상세

### 날짜 선택
- 개별 날짜 선택/해제하려면 클릭
- 여러 날짜 선택을 위한 클릭 및 드래그
- 일반 패턴을 위한 빠른 템플릿 (평일, 주말, 특정 요일)

### 가능 여부 상태
- **참여**: 녹색 표시, 참가자가 참석 가능
- **불참**: 회색 표시, 참가자가 참석 불가
- **미정**: 테두리가 있는 연회색, 아직 결정하지 않음

### 최적 날짜 알고리즘
앱은 다음을 기반으로 최적의 모임 날짜를 계산합니다:
- 가능한 참가자 수
- 최소 불가능 수
- 참가자가 가능 여부를 표시할 때 실시간 업데이트

### 모바일 최적화
- 터치 친화적 인터페이스
- 날짜 그리드를 위한 가로 스크롤
- 쉬운 탐색을 위한 고정 헤더
- 반응형 타이포그래피와 간격

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 데이터 보존

모든 모임 데이터는 18개월 후 자동으로 삭제됩니다 (Redis TTL 설정).

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요.

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

## 라이선스

이 프로젝트는 MIT 라이선스로 라이선스가 부여됩니다 - 자세한 내용은 LICENSE 파일을 참조하세요.

## 감사의 말

- 원래 When2meet 서비스에서 영감을 받음
- Next.js와 Vercel로 구축
- Upstash의 데이터베이스 호스팅

## 연락처

질문이나 지원이 필요하면 GitHub에서 이슈를 열어주세요.

---

Next.js와 TypeScript로 ❤️를 담아 만들었습니다