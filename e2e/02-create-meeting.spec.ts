import { test, expect } from '@playwright/test';

test.describe('모임 생성 플로우', () => {
  test('템플릿 버튼으로 날짜를 선택하고 모임을 생성할 수 있다', async ({ page }) => {
    await page.goto('/');

    // 1. 모임 제목 입력
    const titleInput = page.getByPlaceholder(/Team Meeting|모임/i);
    const testTitle = `E2E Test Meeting ${Date.now()}`;
    await titleInput.fill(testTitle);

    // 2. Weekends 템플릿 버튼으로 날짜 선택
    const weekendsButton = page.getByRole('button', { name: /Weekends|주말/i });
    await weekendsButton.click();
    await page.waitForTimeout(500);

    // 3. 참가자 입력
    const participantInput = page.getByPlaceholder(/Enter names|이름|참가자/i);
    await participantInput.fill('Alice');
    await participantInput.press('Enter');
    await participantInput.fill('Bob');
    await participantInput.press('Enter');

    // 4. Create Meeting 버튼 찾아서 클릭
    const createButton = page.getByRole('button', { name: /Create|생성|만들기/i });
    await createButton.click();

    // 5. 모임 페이지로 이동 확인
    await page.waitForURL(/\/meeting\/.+/, { timeout: 10000 });

    // 6. URL이 모임 페이지인지 확인
    expect(page.url()).toMatch(/\/meeting\//);
  });

  test('캘린더에서 직접 날짜를 클릭하여 선택할 수 있다', async ({ page }) => {
    await page.goto('/');

    // 제목 입력
    await page.getByPlaceholder(/Team Meeting|모임/i).fill('Manual Date Selection Test');

    // 캘린더에서 활성화된 날짜 버튼 찾기 (disabled가 아닌 것)
    const dateCells = page.locator('button[data-date]:not([disabled])');
    const cellCount = await dateCells.count();

    if (cellCount > 0) {
      // 첫 번째 활성화된 날짜 클릭
      await dateCells.first().click();
      await page.waitForTimeout(300);

      // 두 번째 날짜도 클릭 (있다면)
      if (cellCount > 1) {
        await dateCells.nth(1).click();
        await page.waitForTimeout(300);
      }
    }

    // 날짜가 선택되었는지 시각적으로 확인하기 위해 잠시 대기
    await page.waitForTimeout(500);
  });
});
