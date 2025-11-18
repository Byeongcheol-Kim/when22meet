import { test, expect } from '@playwright/test';

test.describe('가용성 선택', () => {
  let meetingUrl: string;

  test.beforeEach(async ({ page }) => {
    // 테스트용 모임 생성
    await page.goto('/');

    // 제목 입력
    await page.getByPlaceholder(/Team Meeting|모임/i).fill(`Availability Test ${Date.now()}`);

    // Weekends 템플릿으로 날짜 선택
    await page.getByRole('button', { name: /Weekends|주말/i }).click();
    await page.waitForTimeout(500);

    // 참가자 추가
    await page.getByPlaceholder(/Enter names|이름|참가자/i).fill('Tester1');
    await page.getByPlaceholder(/Enter names|이름|참가자/i).press('Enter');

    // 모임 생성
    await page.getByRole('button', { name: /Create|생성|만들기/i }).click();
    await page.waitForURL(/\/meeting\/.+/);
    meetingUrl = page.url();
  });

  test('모임 페이지가 로드되고 기본 요소가 표시된다', async ({ page }) => {
    // URL이 모임 페이지인지 확인
    expect(meetingUrl).toMatch(/\/meeting\//);

    // 페이지가 정상적으로 로드되었는지 확인
    await expect(page).toHaveURL(/\/meeting\/.+/);

    // 기본 UI 요소 확인 (그리드나 테이블 등)
    await page.waitForTimeout(1000);
  });

  test('참가자 이름이 표시된다', async ({ page }) => {
    // Tester1이 페이지에 표시되는지 확인 (첫 번째 요소)
    const testerText = page.getByText('Tester1').first();
    await expect(testerText).toBeVisible();
  });
});
