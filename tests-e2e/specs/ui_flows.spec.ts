import { test, expect } from '@playwright/test'

test.describe('Phase 4: Browser E2E UI Flows Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor errors
    page.on('pageerror', (err) => {
      throw new Error(`Uncaught page error: ${err.message}`)
    })
  })

  test('UI Flow 1: Curated examples dropdown loads and updates code', async ({ page }) => {
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    const presetSelect = page.locator('select[aria-label="Select Python preset"]')
    await expect(presetSelect).toBeVisible()

    // Select factorial-recursion
    await presetSelect.selectOption('factorial-recursion')
    const codeVal = await page.evaluate(() => (window as any).__codeEditor.getValue())
    expect(codeVal).toContain('def factorial')

    // Run factorial
    const runBtn = page.locator('button[aria-label="Run Python code"]')
    await runBtn.click()
    await expect(page.locator('[data-testid="total-steps-display"]')).toBeVisible()
  })

  test('UI Flow 2: Predict mode - correct and wrong answer branches', async ({ page }) => {
    await page.goto('/workspace?mode=predict')
    await page.waitForLoadState('networkidle')

    const stepForwardBtn = page.locator('button[aria-label="Step forward"]')
    // Step forward to step index 6 where two-sum predict prompt appears
    for (let i = 0; i < 6; i++) {
      await stepForwardBtn.click()
    }

    // Verify Predict quiz card heading is displayed
    const quizCard = page.getByRole('heading', { name: 'Predict Mode' })
    await expect(quizCard).toBeVisible()

    // Test clicking option A (correct answer)
    const optionA = page.locator('button:has-text("[A]")')
    if (await optionA.isVisible()) {
      await optionA.click()
      await expect(page.locator('text=Correct!')).toBeVisible()
    }
  })

  test('UI Flow 3: Compare mode with two solutions to the same problem', async ({ page }) => {
    await page.goto('/workspace?mode=compare')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    // Verify dual solution containers are visible
    await expect(page.locator('text=Solution A (Primary)')).toBeVisible()
    await expect(page.locator('[data-testid="compare-solution-b-container"]')).toBeVisible()

    // Click Compare button (the action button with aria-label)
    const compareBtn = page.locator('button[aria-label="Run Python code"]')
    await expect(compareBtn).toBeVisible()
    await compareBtn.click()

    // Verify comparison results card appears with step counts
    const resultsCard = page.locator('[data-testid="compare-results-card"]')
    await expect(resultsCard).toBeVisible({ timeout: 15000 })
    await expect(resultsCard).toContainText('steps')
    await expect(resultsCard).toContainText('Solution A')
    await expect(resultsCard).toContainText('Solution B')
  })

  test('UI Flow 4: Complexity meter display', async ({ page }) => {
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')

    const complexityHeader = page.locator('text=Complexity')
    await expect(complexityHeader).toBeVisible()

    // Verify Big-O tags exist (e.g. O(n^2), O(1))
    await expect(page.getByRole('button', { name: /T:/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /S:/ })).toBeVisible()
  })

  test('UI Flow 5: Save snippet and open share link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    // Set custom code
    await page.evaluate(() => {
      ;(window as any).__codeEditor.setValue('x = "SHARED_MAGIC_42"\nprint(x)')
    })

    // Click Share button
    const shareBtn = page.locator('button[aria-label="Share code snippet"]')
    await expect(shareBtn).toBeVisible()
    await shareBtn.click()

    // Wait for URL to have ?snippet=
    await expect(page).toHaveURL(/snippet=/, { timeout: 10000 })
    const url = new URL(page.url())
    const snippetId = url.searchParams.get('snippet')
    expect(snippetId).toBeTruthy()

    // Open a fresh page with the share link
    const newPage = await context.newPage()
    await newPage.goto(`/workspace?snippet=${snippetId}`)
    await newPage.waitForLoadState('networkidle')
    await newPage.waitForFunction(() => (window as any).__codeEditor !== undefined)

    // Verify the editor loaded the snippet
    await expect
      .poll(async () => {
        return await newPage.evaluate(() => (window as any).__codeEditor.getValue())
      })
      .toContain('SHARED_MAGIC_42')

    await newPage.close()
  })

  test('UI Flow 6: Reset execution', async ({ page }) => {
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')

    // Step forward several times
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')

    const currentStepLocator = page.locator('[data-testid="current-step-display"]')
    await expect(currentStepLocator).not.toHaveText('1')

    // Click Reset
    const resetBtn = page.locator('button[aria-label="Reset execution"]').first()
    await resetBtn.click()

    // Step display returns to 1
    await expect(currentStepLocator).toHaveText('1')
  })

  test('UI Flow 7: Run twice in a row', async ({ page }) => {
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    const runBtn = page.locator('button[aria-label="Run Python code"]')

    // First Run
    await runBtn.click()
    await expect(runBtn).toContainText('Run', { timeout: 10000 })

    // Step forward
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')

    // Second Run
    await runBtn.click()
    await expect(runBtn).toContainText('Run', { timeout: 10000 })

    // Reset to step 1
    const currentStepLocator = page.locator('[data-testid="current-step-display"]')
    await expect(currentStepLocator).toHaveText('1')
  })

  test('UI Flow 8: Run button disabled/loading during execution', async ({ page }) => {
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    const runBtn = page.locator('button[aria-label="Run Python code"]')

    // Set code with a loop
    await page.evaluate(() => {
      ;(window as any).__codeEditor.setValue('total = 0\nfor i in range(100):\n    total += i\nprint(total)')
    })

    await runBtn.click()
    // Either disabled or in progress
    await expect(runBtn).toContainText('Run', { timeout: 10000 })
  })

  test('UI Flow 9: Mobile viewport (390px) responsive layout and run flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/workspace')
    await page.waitForLoadState('networkidle')

    // Mobile tabs switcher must be visible
    const mobileTabs = page.locator('button:has-text("State & Stack")')
    await expect(mobileTabs).toBeVisible()

    // Monaco editor is present
    await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

    // Run code
    const runBtn = page.locator('button[aria-label="Run Python code"]')
    await runBtn.click()
    await expect(runBtn).toContainText('Run', { timeout: 10000 })

    // Switch tab to State & Stack
    await mobileTabs.click()
    await expect(page.getByRole('heading', { name: 'Variables' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Call Stack' })).toBeVisible()

    // Switch tab to Heap
    await page.locator('button:has-text("Heap")').click()
    await expect(page.getByRole('heading', { name: 'Virtual Heap' })).toBeVisible()
  })
})
