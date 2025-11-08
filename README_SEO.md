# SEO 체크리스트 - 구글 검색 노출을 위한 설정

## ✅ 완료된 작업

1. **robots.txt 생성**
   - 모든 검색 엔진 봇 허용
   - 사이트맵 위치 명시
   - Crawl-delay 설정

2. **sitemap.xml 자동 생성**
   - `/app/sitemap.ts` 파일로 동적 생성
   - 주요 페이지 포함

3. **구조화된 데이터 (Schema.org)**
   - WebApplication 스키마 적용 (logo 속성 수정 완료)
   - 서비스 정보 및 기능 명시
   - 미팅별 Event 스키마 추가 (JSON-LD)

4. **메타태그 최적화**
   - 상세한 설명과 키워드 추가
   - Open Graph 태그 개선
   - Twitter Card 태그 추가
   - robots 메타태그로 인덱싱 허용

5. **동적 OG 이미지 생성** ⭐ NEW
   - 미팅별 동적 Open Graph 이미지 생성
   - 1순위 날짜와 참석 가능 인원 표시
   - 카카오톡 미리보기 최적화

6. **미팅별 동적 메타데이터** ⭐ NEW
   - 각 미팅마다 고유한 title/description
   - 1순위 날짜 정보 자동 포함
   - 검색 엔진 최적화된 키워드 생성

## 📋 추가로 필요한 작업

### 1. Google Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 도메인 추가 (when22meet.vercel.app)
3. 소유권 확인
   - HTML 태그 방법 추천
   - 받은 인증 코드를 `layout.tsx`의 `verification.google`에 입력

### 2. 사이트맵 제출
1. Google Search Console에서 좌측 메뉴 '사이트맵' 클릭
2. `https://when22meet.vercel.app/sitemap.xml` 입력 후 제출

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