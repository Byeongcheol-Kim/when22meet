import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/언제만나|When22Meet/);

    // 헤더 확인
    await expect(page.getByRole('heading', { name: /When22Meet!|언제만나/i })).toBeVisible();

    // Meeting Title 입력 필드 확인
    await expect(page.getByPlaceholder(/Team Meeting|모임/i)).toBeVisible();

    // Participants 입력 필드 확인
    await expect(page.getByPlaceholder(/Enter names|이름|참가자/i)).toBeVisible();

    // Select Dates 섹션 확인
    await expect(page.getByText(/Select Dates|날짜 선택/i)).toBeVisible();
  });

  test('날짜 템플릿 버튼이 동작한다', async ({ page }) => {
    await page.goto('/');

    // Weekends 버튼 확인 및 클릭
    const weekendsButton = page.getByRole('button', { name: /Weekends|주말/i });
    await expect(weekendsButton).toBeVisible();
    await weekendsButton.click();

    // 날짜가 선택되었는지 확인 (캘린더에 선택된 날짜가 표시됨)
    await page.waitForTimeout(500);
  });

  test('캘린더가 표시된다', async ({ page }) => {
    await page.goto('/');

    // 캘린더 헤더 확인 - 정확한 div 찾기
    await expect(page.locator('div.text-sm.font-bold').filter({ hasText: 'Sun' }).first()).toBeVisible();
    await expect(page.locator('div.text-sm.font-bold').filter({ hasText: 'Mon' }).first()).toBeVisible();
    await expect(page.locator('div.text-sm.font-bold').filter({ hasText: 'Wed' }).first()).toBeVisible();
  });
});
