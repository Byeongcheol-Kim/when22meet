# When2Meet - AGENTS.md (Root)

이 문서는 When2Meet 프로젝트의 전반적인 컨벤션, 아키텍처 설계 원칙, 작업 시 고려사항을 정의합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [아키텍처 설계 원칙](#2-아키텍처-설계-원칙)
3. [코드 컨벤션](#3-코드-컨벤션)
4. [상태 관리 패턴](#4-상태-관리-패턴)
5. [데이터 흐름](#5-데이터-흐름)
6. [성능 최적화 가이드](#6-성능-최적화-가이드)
7. [에러 처리 전략](#7-에러-처리-전략)
8. [테스트 전략](#8-테스트-전략)
9. [보안 고려사항](#9-보안-고려사항)
10. [모듈별 문서](#10-모듈별-문서)

---

## 1. 프로젝트 개요

### 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| 언어 | TypeScript (strict mode) |
| 데이터베이스 | Upstash Redis (REST API) |
| 배포 | Vercel |
| 아이콘 | lucide-react |
| 폰트 | Noto Sans KR |

### 핵심 도메인

```
미팅(Meeting) ─┬─ 제목, 날짜 목록, 참석자 목록
              └─ 시간대 설정 (선택사항)

가용성(Availability) ─┬─ 참석자별 가능/불가능/미정 상태
                     └─ 잠금(확정) 상태
```

---

## 2. 아키텍처 설계 원칙

### 2.1 계층 분리

```
┌─────────────────────────────────────────┐
│              Presentation               │
│  (app/, components/)                    │
│  - 페이지, UI 컴포넌트, 스타일링        │
├─────────────────────────────────────────┤
│              Business Logic             │
│  (hooks/)                               │
│  - 상태 관리, 데이터 변환, 비즈니스 규칙 │
├─────────────────────────────────────────┤
│              Data Access                │
│  (app/api/, lib/utils/redis.ts)         │
│  - API 라우트, Redis 추상화             │
├─────────────────────────────────────────┤
│              Infrastructure             │
│  (lib/redis.ts, lib/constants/)         │
│  - Redis 클라이언트, 설정, 상수         │
└─────────────────────────────────────────┘
```

### 2.2 단일 책임 원칙

| 모듈 | 책임 |
|------|------|
| `useMeetingData` | 데이터 페칭 및 캐싱 |
| `useMeetingActions` | 데이터 변경(Mutation) |
| `useMeetingGrid` | 그리드 렌더링 데이터 계산 |
| `useCurrentUser` | 세션 관리 |

### 2.3 설계 결정 기록

#### 왜 Redux/Zustand 없이 훅으로 상태 관리?
- 앱 규모가 작음 (단일 페이지에서 대부분 동작)
- 서버 상태가 주요 데이터 소스 (Redis)
- 복잡한 전역 상태 불필요

#### 왜 Upstash Redis?
- Serverless 환경 최적화 (Vercel)
- REST API로 cold start 없음
- 자동 JSON 직렬화
- 18개월 TTL로 데이터 라이프사이클 관리

#### 왜 인증 시스템 없음?
- 일회성 일정 조율 서비스
- URL 공유 기반 접근 (obscure URL)
- 간편함 > 보안 (민감 데이터 없음)

---

## 3. 코드 컨벤션

### 3.1 파일/폴더 네이밍

| 유형 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 파일 | PascalCase | `DateSelector.tsx` |
| 훅 파일 | camelCase (use 접두사) | `useMeetingData.ts` |
| 유틸리티 파일 | camelCase | `dateTemplates.ts` |
| 상수 파일 | camelCase | `colors.ts`, `config.ts` |
| 타입 파일 | camelCase | `api.ts`, `types.ts` |

### 3.2 TypeScript 규칙

```typescript
// ✅ DO: 명시적 타입 정의
interface Props {
  status: ParticipantStatus;
  onStatusClick: (status: ParticipantStatus) => void;
}

// ❌ DON'T: any 사용
function handle(data: any) { ... }

// ✅ DO: 유니온 타입 사용
type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

// ✅ DO: 상수는 as const
const STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
} as const;
```

### 3.3 컴포넌트 구조

```typescript
'use client';  // 클라이언트 컴포넌트 명시

import { memo, useState, useCallback } from 'react';  // React 임포트
import { Check } from 'lucide-react';                  // 외부 라이브러리
import { STATUS_COLORS } from '@/lib/constants/colors'; // 내부 모듈
import { useTranslation } from '@/lib/useTranslation';
import type { ParticipantStatus } from '@/lib/types';  // 타입 임포트

// 인터페이스 정의
interface ComponentProps {
  status: ParticipantStatus;
  isEditable: boolean;
  onClick: () => void;
}

// 컴포넌트 정의 (memo로 최적화)
export const Component = memo(function Component({
  status,
  isEditable,
  onClick,
}: ComponentProps) {
  const { t } = useTranslation();

  // 훅 사용
  const [isHovered, setIsHovered] = useState(false);

  // 핸들러
  const handleClick = useCallback(() => {
    if (isEditable) onClick();
  }, [isEditable, onClick]);

  // 렌더링
  return (
    <button
      className={getStatusClasses(status, isEditable)}
      onClick={handleClick}
      aria-label={t(`meeting.status.${status}`)}
    >
      {t(`meeting.status.${status}`)}
    </button>
  );
});
```

### 3.4 임포트 순서

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { Check, X } from 'lucide-react';

// 3. 내부 모듈 (절대 경로)
import { STATUS_COLORS } from '@/lib/constants/colors';
import { useTranslation } from '@/lib/useTranslation';
import { DateSelector } from '@/components/DateSelector';

// 4. 타입 (type 키워드 사용)
import type { Meeting, Availability } from '@/lib/types';
```

### 3.5 주석 규칙

```typescript
// ✅ DO: 복잡한 로직에 "왜"를 설명
// 시간대 모드에서는 날짜+시간 조합으로 키를 생성해야 함
const dateSlotKey = timeSlotEnabled ? `${date}:${timeSlot}` : date;

// ❌ DON'T: 코드가 하는 일을 반복
// 상태를 설정함
setStatus(newStatus);

// ✅ DO: TODO는 구체적으로
// TODO(2025-02): 연속 시간대 추천 알고리즘 최적화 필요

// ❌ DON'T: 주석 없이 마법의 숫자
const MAGIC = 47304000;

// ✅ DO: 상수로 의미 부여
const TTL_18_MONTHS_SECONDS = 47304000;
```

---

## 4. 상태 관리 패턴

### 4.1 상태 분류

| 상태 유형 | 관리 위치 | 예시 |
|-----------|-----------|------|
| 서버 상태 | `useMeetingData` | 미팅 데이터, 가용성 |
| UI 상태 | 컴포넌트 `useState` | 모달 열림, 호버 |
| 폼 상태 | 컴포넌트 `useState` | 입력값, 유효성 |
| 세션 상태 | `useCurrentUser` + localStorage | 현재 사용자 |
| URL 상태 | Next.js 라우터 | 미팅 ID |

### 4.2 Optimistic Update 패턴

```typescript
// useMeetingActions.ts
const handleStatusClick = useCallback(async (
  participant: string,
  date: string,
  currentStatus: ParticipantStatus
) => {
  // 1. 원본 상태 저장
  const originalAvailability = availabilityMap.get(participant);

  // 2. 다음 상태 계산
  const nextStatus = getNextStatus(currentStatus);

  // 3. Optimistic Update (즉시 UI 반영)
  setOptimisticAvailability(participant, date, nextStatus);

  try {
    // 4. API 호출
    await updateAvailability({ participant, date, status: nextStatus });
  } catch (error) {
    // 5. 실패 시 롤백
    setOptimisticAvailability(participant, date, currentStatus);
    showToast(t('errors.updateFailed'), 'error');
  }
}, [availabilityMap, showToast, t]);
```

### 4.3 상태 순환 규칙

```
undecided (미정) → available (참여) → unavailable (불참) → undecided (미정)
```

---

## 5. 데이터 흐름

### 5.1 미팅 생성 플로우

```
[랜딩 페이지]
     │
     ▼
사용자 입력 (제목, 날짜, 참석자)
     │
     ▼
[POST /api/meetings]
     │
     ▼
Redis 저장 (meeting:{id})
     │
     ▼
참석자별 가용성 초기화 (availability:{id}:{name})
     │
     ▼
미팅 ID 반환 → 리다이렉트
```

### 5.2 가용성 업데이트 플로우

```
[미팅 페이지]
     │
     ▼
상태 셀 클릭
     │
     ▼
handleStatusClick (useMeetingActions)
     │
     ├─→ Optimistic Update (즉시 UI 반영)
     │
     ▼
[POST /api/meetings/{id}/availability]
     │
     ▼
Redis 업데이트
     │
     ├─ 성공 → 완료
     │
     └─ 실패 → 롤백 + 에러 토스트
```

### 5.3 Redis 키 구조

```
meeting:{id}
├── id: string
├── title: string
├── dates: string[]
├── participants: string[]
├── createdAt: string
├── expiresAt: string
├── timeSlotEnabled?: boolean
├── timeSlots?: string[]
└── consecutiveSlotCount?: number

availability:{meetingId}:{participantName}
├── participantName: string
├── availableDates: string[]
├── unavailableDates: string[]
├── isLocked: boolean
└── updatedAt: string

short:{code}
└── originalUrl: string
```

---

## 6. 성능 최적화 가이드

### 6.1 필수 최적화 패턴

| 패턴 | 적용 위치 | 효과 |
|------|-----------|------|
| `memo` | 반복 렌더링 컴포넌트 | 불필요한 리렌더 방지 |
| `useMemo` | 계산 비용 큰 데이터 | O(N) → O(1) 조회 |
| `useCallback` | 이벤트 핸들러 | 자식 컴포넌트 리렌더 방지 |
| MGET | Redis 조회 | N+1 쿼리 방지 |

### 6.2 Map 사용 (O(1) 조회)

```typescript
// ❌ DON'T: 배열 검색 O(N)
const availability = availabilities.find(a => a.participantName === name);

// ✅ DO: Map 조회 O(1)
const availabilityMap = useMemo(
  () => new Map(availabilities.map(a => [a.participantName, a])),
  [availabilities]
);
const availability = availabilityMap.get(name);
```

### 6.3 Redis 벌크 조회

```typescript
// ❌ DON'T: N번 조회
for (const participant of participants) {
  const data = await redis.get(`availability:${meetingId}:${participant}`);
}

// ✅ DO: 한 번에 조회
const keys = participants.map(p => `availability:${meetingId}:${p}`);
const data = await redis.mget(...keys);
```

### 6.4 CSS 성능

```css
/* 하드웨어 가속 */
.meeting-grid-container {
  transform: translateZ(0);
  will-change: scroll-position;
  contain: layout style;
}

/* iOS Safari 스크롤 최적화 */
-webkit-overflow-scrolling: touch;
```

---

## 7. 에러 처리 전략

### 7.1 API 에러 응답 형식

```typescript
// 성공
{ success: true, data: { ... } }

// 실패
{
  error: "미팅을 찾을 수 없습니다",
  details?: "ID: abc123"
}
```

### 7.2 클라이언트 에러 처리

```typescript
try {
  const response = await fetch(`/api/meetings/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Unknown error');
  }

  return response.json();
} catch (error) {
  // 사용자에게 피드백
  showToast(t('errors.networkError'), 'error');

  // 개발자 로깅
  console.error('API Error:', error);

  // 필요시 롤백
  rollbackOptimisticUpdate();
}
```

### 7.3 유효성 검사

```typescript
// lib/constants/config.ts의 VALIDATION 사용
import { CONFIG } from '@/lib/constants/config';

// API 라우트에서
if (title.length > CONFIG.VALIDATION.MAX_TITLE_LENGTH) {
  return NextResponse.json(
    { error: '제목이 너무 깁니다' },
    { status: 400 }
  );
}

// 클라이언트에서
if (participants.length >= CONFIG.VALIDATION.MAX_PARTICIPANTS) {
  showToast(t('errors.maxParticipants'), 'warning');
  return;
}
```

---

## 8. 테스트 전략

### 8.1 테스트 유형

| 유형 | 도구 | 위치 | 범위 |
|------|------|------|------|
| E2E | Playwright | `e2e/` | 사용자 시나리오 |
| 단위 | (미구현) | `__tests__/` | 유틸리티 함수 |

### 8.2 E2E 테스트 시나리오

```typescript
// e2e/meeting.spec.ts
test('미팅 생성 및 가용성 업데이트', async ({ page }) => {
  // 1. 랜딩 페이지 접속
  await page.goto('/');

  // 2. 미팅 생성
  await page.fill('[data-testid="title-input"]', '팀 회의');
  await page.click('[data-testid="create-button"]');

  // 3. 미팅 페이지로 이동 확인
  await expect(page).toHaveURL(/\/meeting\/.+/);

  // 4. 가용성 업데이트
  await page.click('[data-testid="status-cell-0-0"]');
  await expect(page.locator('[data-testid="status-cell-0-0"]'))
    .toHaveClass(/available/);
});
```

---

## 9. 보안 고려사항

### 9.1 현재 보안 모델

- **인증 없음**: URL을 아는 사람은 누구나 접근 가능
- **Obscure URL**: 추측하기 어려운 nanoid 기반 ID
- **민감 데이터 없음**: 이름과 가용성만 저장

### 9.2 입력 검증

```typescript
// 모든 사용자 입력 검증
const sanitizedTitle = title.trim().slice(0, CONFIG.VALIDATION.MAX_TITLE_LENGTH);
const sanitizedName = name.trim().slice(0, CONFIG.VALIDATION.MAX_NAME_LENGTH);

// 날짜 형식 검증
const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
```

### 9.3 Rate Limiting

- Vercel의 기본 rate limiting 활용
- 추가 구현 필요 시 Upstash Rate Limit 사용 가능

---

## 10. 모듈별 문서

각 디렉토리에 상세한 AGENTS.md가 있습니다:

### 주요 모듈

| 파일 | 내용 |
|------|------|
| [`app/AGENTS.md`](./app/AGENTS.md) | 페이지, API 라우트 명세 |
| [`components/AGENTS.md`](./components/AGENTS.md) | UI 컴포넌트 Props, 패턴 |
| [`hooks/AGENTS.md`](./hooks/AGENTS.md) | 커스텀 훅 API, 데이터 흐름 |
| [`lib/AGENTS.md`](./lib/AGENTS.md) | 타입, 상수, 유틸리티 |
| [`messages/AGENTS.md`](./messages/AGENTS.md) | i18n 번역 키 구조 |

### 복잡한 코드 모듈 (200줄 이상)

| 파일 | 줄 수 | 내용 |
|------|-------|------|
| [`app/meeting/[id]/AGENTS.md`](./app/meeting/[id]/AGENTS.md) | 614줄 | 미팅 상세 페이지, 훅 사용법, 그리드 렌더링 |
| [`lib/constants/AGENTS.md`](./lib/constants/AGENTS.md) | 579줄 | 색상 토큰, 설정 상수, 헬퍼 함수 |
| [`components/MeetingGrid/AGENTS.md`](./components/MeetingGrid/AGENTS.md) | 405줄 | GridCell 셀 타입별 컴포넌트, z-index 계층 |
| [`lib/utils/AGENTS.md`](./lib/utils/AGENTS.md) | 165줄 | Redis 추상화, 날짜/i18n/URL 유틸리티 |
| [`app/api/meetings/AGENTS.md`](./app/api/meetings/AGENTS.md) | 355줄 | 미팅 API 엔드포인트, 요청/응답 명세 |

---

## 작업 체크리스트

### 새 기능 추가 시

- [ ] 도메인 타입이 필요하면 `lib/types.ts`에 추가
- [ ] API 타입이 필요하면 `lib/types/api.ts`에 추가
- [ ] 상수가 필요하면 `lib/constants/`에 추가
- [ ] 색상이 필요하면 `lib/constants/colors.ts`에 추가
- [ ] 번역이 필요하면 `messages/ko.json`, `messages/en.json`에 추가
- [ ] 해당 모듈의 `AGENTS.md` 업데이트

### 코드 리뷰 체크리스트

- [ ] TypeScript 타입 명시 (any 사용 X)
- [ ] 하드코딩 값 대신 `CONFIG` 상수 사용
- [ ] 색상은 `colors.ts` 토큰 사용
- [ ] `memo`, `useMemo`, `useCallback` 적절히 사용
- [ ] 에러 처리 및 롤백 로직 존재
- [ ] 번역 키 사용 (하드코딩 텍스트 X)
- [ ] 접근성 속성 (aria-label 등) 추가

### 배포 전 체크리스트

- [ ] `npm run lint` 통과
- [ ] `npm run build` 성공
- [ ] E2E 테스트 통과 (있다면)
- [ ] 환경 변수 확인
- [ ] AGENTS.md 문서 최신화
