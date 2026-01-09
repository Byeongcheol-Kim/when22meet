# Messages Directory - AGENTS.md

이 디렉토리는 다국어(i18n) 번역 파일을 포함합니다.

## 디렉토리 구조

```
messages/
├── ko.json    # 한국어 (기본 언어)
└── en.json    # 영어
```

## 번역 파일 구조

### 최상위 키 구조

```json
{
  "landing": { ... },        // 랜딩 페이지
  "meeting": { ... },        // 미팅 상세 페이지
  "dateSelector": { ... },   // 날짜 선택기
  "timeSlotSelector": { ... }, // 시간대 선택기
  "faq": { ... },            // FAQ 페이지
  "modals": { ... },         // 모달 공통
  "common": { ... },         // 공통 텍스트
  "dayNames": { ... },       // 요일명
  "errors": { ... }          // 에러 메시지
}
```

### 주요 번역 키

#### landing (랜딩 페이지)

```json
{
  "landing": {
    "splash": {
      "title": "일정 조율",
      "subtitle": "가장 빠르고 간편하게"
    },
    "createMeeting": "미팅 만들기",
    "title": {
      "label": "미팅 제목",
      "placeholder": "예: 팀 회의, 모임 약속"
    },
    "participants": {
      "label": "참석자",
      "placeholder": "이름 입력 후 Enter",
      "helper": "나중에 추가할 수 있어요"
    },
    "dates": {
      "label": "후보 날짜"
    },
    "timeSlots": {
      "label": "시간대 설정 (선택사항)"
    }
  }
}
```

#### meeting (미팅 상세 페이지)

```json
{
  "meeting": {
    "status": {
      "available": "참여",
      "unavailable": "불참",
      "undecided": "미정"
    },
    "alerts": {
      "enterName": "이름을 입력해주세요",
      "duplicateName": "이미 존재하는 이름입니다"
    },
    "toast": {
      "linkCopied": "링크가 복사되었습니다",
      "shareTemplateCopied": "템플릿 URL이 복사되었습니다",
      "updateSuccess": "저장되었습니다",
      "updateError": "저장에 실패했습니다"
    },
    "actions": {
      "share": "공유하기",
      "edit": "수정하기",
      "finalize": "확정하기",
      "unlock": "수정하기"
    },
    "topDates": {
      "title": "TOP 3",
      "noData": "아직 데이터가 없습니다"
    }
  }
}
```

#### dateSelector (날짜 선택기)

```json
{
  "dateSelector": {
    "templates": {
      "next7days": "오는 한 주",
      "next30days": "다음 한 달",
      "weekdaysOnly": "평일만",
      "weekendsOnly": "주말만"
    },
    "counter": "{count}일 선택됨"
  }
}
```

#### timeSlotSelector (시간대 선택기)

```json
{
  "timeSlotSelector": {
    "enable": "시간대 설정하기",
    "disable": "시간대 설정 끄기",
    "shortcuts": {
      "dawn": "새벽",
      "morning": "오전",
      "afternoon": "오후",
      "evening": "저녁",
      "night": "심야",
      "allDay": "종일"
    },
    "consecutiveSlots": {
      "label": "연속 시간 추천",
      "hour": "{n}시간"
    }
  }
}
```

#### dayNames (요일명)

```json
{
  "dayNames": {
    "short": ["일", "월", "화", "수", "목", "금", "토"],
    "long": ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
  }
}
```

#### errors (에러 메시지)

```json
{
  "errors": {
    "meetingNotFound": "미팅을 찾을 수 없습니다",
    "invalidDate": "유효하지 않은 날짜입니다",
    "networkError": "네트워크 오류가 발생했습니다",
    "maxParticipants": "최대 100명까지 추가할 수 있습니다",
    "maxDates": "최대 365일까지 선택할 수 있습니다"
  }
}
```

---

## 번역 사용 방법

### 클라이언트 컴포넌트

```typescript
'use client';

import { useTranslation } from '@/lib/useTranslation';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t('landing.splash.title')}</h1>
      <button onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}>
        {locale === 'ko' ? 'English' : '한국어'}
      </button>
    </div>
  );
}
```

### 동적 값 삽입

번역 문자열에 동적 값이 필요한 경우:

```json
{
  "dateSelector": {
    "counter": "{count}일 선택됨"
  }
}
```

```typescript
// 사용 시 직접 치환
const message = t('dateSelector.counter').replace('{count}', String(selectedDates.length));
```

---

## 번역 추가 가이드라인

### 새 번역 키 추가 시

1. **양쪽 파일에 추가**: `ko.json`과 `en.json` 모두에 추가
2. **키 네이밍 규칙**: `{페이지/기능}.{섹션}.{항목}` 형식
3. **한국어 우선**: 한국어를 먼저 작성 후 영어 번역

### 체크리스트

- [ ] `ko.json`에 한국어 번역 추가
- [ ] `en.json`에 영어 번역 추가
- [ ] 키 경로가 일치하는지 확인
- [ ] 동적 값(`{value}`)이 있다면 양쪽에 동일하게 작성
- [ ] UI에서 번역이 올바르게 표시되는지 확인

### 키 네이밍 규칙

| 패턴 | 예시 | 설명 |
|------|------|------|
| `{page}.{section}.{item}` | `landing.title.label` | 페이지별 번역 |
| `{component}.{item}` | `dateSelector.counter` | 컴포넌트별 번역 |
| `common.{item}` | `common.cancel` | 공통 텍스트 |
| `errors.{errorType}` | `errors.networkError` | 에러 메시지 |
| `dayNames.{format}` | `dayNames.short` | 포맷별 데이터 |

### 예시: 새 기능 번역 추가

```json
// ko.json
{
  "newFeature": {
    "title": "새로운 기능",
    "description": "이 기능은 {feature}를 제공합니다",
    "button": {
      "enable": "활성화",
      "disable": "비활성화"
    }
  }
}

// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This feature provides {feature}",
    "button": {
      "enable": "Enable",
      "disable": "Disable"
    }
  }
}
```

---

## 언어 감지 로직

### 클라이언트 사이드

1. localStorage에서 저장된 언어 확인
2. 없으면 `navigator.language` 확인
3. `ko`로 시작하면 한국어, 그 외 영어
4. 기본값: 한국어 (`ko`)

### 서버 사이드

1. `Accept-Language` 헤더 확인
2. `ko`가 포함되면 한국어
3. 기본값: 한국어 (`ko`)

---

## 주의사항

1. **SSR 호환성**: `useTranslation`의 `isHydrated`를 확인하여 hydration mismatch 방지
2. **폴백**: 번역 키가 없으면 키 경로 그대로 반환
3. **깊은 키 접근**: 점 표기법으로 중첩 객체 접근 (`landing.splash.title`)
