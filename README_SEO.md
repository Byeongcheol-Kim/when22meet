# SEO 체크리스트 - 구글 검색 노출을 위한 설정

## ✅ 완료된 작업

1. **robots.txt 생성**
   - 모든 검색 엔진 봇 허용
   - 사이트맵 위치 명시
   - Crawl-delay 설정

2. **sitemap.xml 자동 생성**
   - `/app/sitemap.ts` 파일로 동적 생성
   - 주요 페이지 포함 (홈, FAQ)
   - 고정 날짜로 변경하여 안정성 개선

3. **구조화된 데이터 (Schema.org)** ⭐ 업데이트
   - WebApplication 스키마 적용
   - "약속일정 잡기 앱" 등 타겟 키워드 포함
   - aggregateRating, keywords 필드 추가
   - ProductivityApplication으로 카테고리 변경
   - 미팅별 Event 스키마 추가 (JSON-LD)

4. **메타태그 최적화** ⭐ 업데이트
   - **title**: "언제만나 | 약속일정 잡기 앱 - 간편한 일정 조율 서비스"
   - **description**: 타겟 키워드 포함 (약속일정 잡기, 모임 시간 정하기 등)
   - **keywords**: 25개 이상의 관련 키워드 추가
     - 약속일정 잡기 앱, 모임 시간 정하기 앱, 일정 조율 서비스
     - 회의 시간 정하기, 팀 미팅 일정, 그룹 일정 조율 등
   - Open Graph 태그 개선
   - Twitter Card 태그 추가

5. **동적 OG 이미지 생성** ⭐ 업데이트
   - **홈페이지**: PNG 파일 사용 (언어별 - ko/en)
   - **단축 URL**: PNG 파일 사용 (언어별)
   - **FAQ**: PNG 파일 사용 (언어별)
   - **미팅 페이지**: 동적 생성 (Top 3 날짜 표시)
   - 카카오톡 미리보기 최적화

6. **미팅별 동적 메타데이터**
   - 각 미팅마다 고유한 title/description
   - 1순위 날짜 정보 자동 포함
   - 검색 엔진 최적화된 키워드 생성

7. **SEO 콘텐츠 추가** ⭐ NEW
   - 홈페이지에 스크린 리더 전용 SEO 텍스트 추가
   - 타겟 키워드가 자연스럽게 포함된 구조화된 콘텐츠
   - H2, H3 태그로 계층 구조 명확히
   - 사용 사례 및 기능 설명 포함

## 📋 추가로 필요한 작업

### 1. Google Search Console 등록 ✅ (완료)
- Google 소유권 인증 코드 이미 등록됨
- 인증 코드: `1XQBJXV6W21_4jf-kkmySkt9kV-CgsMVEku97b-Q34M`

### 2. 사이트맵 제출
1. Google Search Console에서 좌측 메뉴 '사이트맵' 클릭
2. `sitemap.xml` 입력 후 제출
3. **중요**: 첫 제출 후 24-48시간 대기 (Google 크롤링 시간 필요)
4. 오류가 나면 며칠 후 다시 확인 (초기에 오류가 자주 발생함)

### 3. 페이지 속도 최적화
- [PageSpeed Insights](https://pagespeed.web.dev/) 에서 테스트
- 이미지 최적화 (WebP 형식 사용)
- 폰트 최적화

### 4. 백링크 구축
- 관련 블로그나 커뮤니티에 서비스 소개
- 소셜 미디어 공유

### 5. 콘텐츠 추가
- 블로그나 가이드 페이지 추가
- FAQ 페이지 생성
- 사용 방법 튜토리얼

## 🔍 검색 엔진 최적화 팁

1. **콘텐츠 품질**
   - 유용하고 독특한 콘텐츠 제공
   - 정기적인 업데이트

2. **모바일 최적화**
   - 반응형 디자인 (이미 적용됨)
   - 모바일 페이지 속도 개선

3. **사용자 경험**
   - 빠른 로딩 속도
   - 직관적인 네비게이션
   - HTTPS 사용 (이미 적용됨)

4. **지역 SEO**
   - 한국어 콘텐츠 강화
   - 지역 키워드 활용

## 🚀 배포 후 체크리스트

- [ ] Google Search Console 등록 및 인증
- [ ] 사이트맵 제출
- [ ] robots.txt 접근 가능 확인 (`https://when22meet.vercel.app/robots.txt`)
- [x] Open Graph 이미지 동적 생성 (완료)
- [ ] PageSpeed Insights 테스트
- [ ] 모바일 친화성 테스트
- [x] Schema.org 구조화된 데이터 검증 (완료)
- [x] 카카오톡 미리보기 테스트 (완료)

## 🧪 테스트 방법

### 1. OG 이미지 미리보기
미팅을 생성한 후 다음 방법으로 테스트:
- **카카오톡**: 링크를 보내서 미리보기 확인
- **온라인 도구**: https://www.opengraph.xyz/ 에서 미팅 URL 입력

### 2. 구조화된 데이터 검증
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/

### 3. 메타데이터 확인
- 브라우저 개발자 도구 → Elements → `<head>` 태그 확인
- `curl -I https://when22meet.vercel.app/meeting/[id]/opengraph-image` 로 이미지 생성 확인

## 📊 모니터링

Google Search Console에서 정기적으로 확인할 항목:
- 인덱싱 상태
- 검색 성능
- 모바일 사용성
- 크롤링 오류

일반적으로 구글에 새 사이트가 노출되기까지 2-4주 정도 소요됩니다.