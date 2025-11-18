import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* 병렬 실행 설정 */
  fullyParallel: true,

  /* CI 환경에서 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* CI 환경에서 병렬 워커 수 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: [
    ['html'],
    ['list']
  ],

  /* 모든 테스트에 공통으로 적용되는 설정 */
  use: {
    /* Base URL - 로컬 개발 서버 */
    baseURL: 'http://localhost:3000',

    /* 실패 시 스크린샷 자동 캡처 */
    screenshot: 'only-on-failure',

    /* 실패 시 비디오 녹화 */
    video: 'retain-on-failure',

    /* 실패 시 trace 수집 */
    trace: 'on-first-retry',
  },

  /* 테스트 전에 개발 서버 자동 시작 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* 프로젝트별 브라우저 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
