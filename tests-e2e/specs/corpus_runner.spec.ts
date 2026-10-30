import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPRESENTATIVE_PROGRAMS = [
  // A. Basics (3)
  'a01_variable_assignment',
  'a06_for_loop',
  'a08_print_only',
  // B. Data structures (3)
  'b01_list_operations',
  'b02_dict_operations',
  'b08_stack',
  // C. Algorithms (3)
  'c01_bubble_sort',
  'c06_binary_search',
  'c07_two_sum',
  // D. Recursion (3)
  'd01_factorial',
  'd02_fibonacci',
  'd07_tower_of_hanoi',
  // E. Dynamic programming and graphs (3)
  'e01_fibonacci_memo',
  'e02_climbing_stairs',
  'e04_bfs',
  // F. Classes and references (3)
  'f01_simple_class',
  'f04_shared_references',
  'f06_nested_objects',
  // G. Other language features (2)
  'g01_generator',
  'g03_try_except_finally',
  // H. Student-style messy code (2)
  'h01_bad_indentation',
  'h04_unicode_emoji',
  // I. Expected failures (3)
  'i03_zero_division',
  'i07_long_loop_over_2000',
  'i09_forbidden_import',
  // J. Abuse and limits (2)
  'j01_memory_bomb',
  'j06_empty_code',
]

test.describe('Phase 4: Browser E2E Corpus Verification (27 Representative Programs)', () => {
  for (const progName of REPRESENTATIVE_PROGRAMS) {
    test(`E2E Execution & Navigation: ${progName}`, async ({ page }) => {
      // Load program code and metadata
      const corpusDir = path.resolve(__dirname, '../corpus')
      const codePath = path.join(corpusDir, `${progName}.py`)
      const metaPath = path.join(corpusDir, `${progName}.json`)

      const code = fs.readFileSync(codePath, 'utf-8')
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))

      const consoleErrors: string[] = []
      const failedRequests: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const txt = msg.text()
          // Do not treat expected 4xx HTTP responses or security block logs on blocked tests as unexpected UI errors
          if (
            (meta.expected_outcome === 'blocked' || meta.expected_outcome === 'validation_error') &&
            (txt.includes('Failed to load resource') || txt.includes('security') || txt.includes('status of 4') || txt.includes('not allowed'))
          ) {
            return
          }
          consoleErrors.push(txt)
        }
      })
      page.on('pageerror', (err) => {
        consoleErrors.push(err.message)
      })
      page.on('requestfailed', (req) => {
        failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`)
      })

      // Navigate to Workspace page
      await page.goto('/workspace')
      await page.waitForLoadState('networkidle')

      // Wait for Monaco editor to initialize
      await page.waitForFunction(() => (window as any).__codeEditor !== undefined)

      // Set code into Monaco editor
      await page.evaluate((c) => {
        ;(window as any).__codeEditor.setValue(c)
      }, code)

      const isRealNetworkCall = code.trim().length > 0
      const responsePromise = isRealNetworkCall
        ? page.waitForResponse((res) => res.url().includes('/run'), { timeout: 25000 }).catch(() => null)
        : null

      // Click Run button
      const runButton = page.locator('button[aria-label="Run Python code"]')
      await expect(runButton).toBeVisible()
      await runButton.click()

      if (responsePromise) {
        await responsePromise
      }
      await expect(runButton).toContainText('Run', { timeout: 20000 })

      // Handle expected failure cases that do not return 200 execution steps
      if (meta.expected_outcome === 'blocked' || meta.expected_outcome === 'validation_error') {
        await page.screenshot({
          path: path.join(__dirname, '../reports/screenshots', `${progName}_step_1.png`),
        })
        expect(consoleErrors).toEqual([])
        return
      }

      if (meta.expected_outcome === 'timeout') {
        await page.screenshot({
          path: path.join(__dirname, '../reports/screenshots', `${progName}_step_1.png`),
        })
        expect(consoleErrors).toEqual([])
        return
      }

      // Wait for steps total to update
      const totalStepsLocator = page.locator('[data-testid="total-steps-display"]')
      await expect(totalStepsLocator).toBeVisible()
      const totalText = await totalStepsLocator.innerText()
      const totalSteps = parseInt(totalText.replace('/', '').trim(), 10)
      expect(totalSteps).toBeGreaterThan(0)

      // Ensure body focus for reliable keyboard event capture
      await page.locator('body').click({ position: { x: 10, y: 10 } })

      // Checkpoint 1: Initial Step (Step 1)
      const currentStepLocator = page.locator('[data-testid="current-step-display"]')
      await expect(currentStepLocator).toHaveText('1')

      const screenshotsDir = path.join(__dirname, '../reports/screenshots')
      await page.screenshot({
        path: path.join(screenshotsDir, `${progName}_step_1.png`),
      })

      // If program is truncated, check truncated notice
      if (meta.expected_outcome === 'truncated') {
        await expect(page.locator('[data-testid="truncated-notice"]')).toBeVisible()
      }

      const midStep = Math.max(1, Math.floor(totalSteps / 2))

      if (totalSteps <= 50) {
        // Normal program: step through with keyboard ArrowRight
        for (let s = 1; s < midStep; s++) {
          await page.keyboard.press('ArrowRight')
        }
        await expect(currentStepLocator).toHaveText(String(midStep))

        // Checkpoint 2: Middle Step
        await page.screenshot({
          path: path.join(screenshotsDir, `${progName}_step_mid.png`),
        })

        // Step forward to the end
        for (let s = midStep; s < totalSteps; s++) {
          await page.keyboard.press('ArrowRight')
        }
        await expect(currentStepLocator).toHaveText(String(totalSteps))

        // Checkpoint 3: Last Step
        await page.screenshot({
          path: path.join(screenshotsDir, `${progName}_step_last.png`),
        })

        // Step backwards to start with ArrowLeft
        for (let s = totalSteps; s > 1; s--) {
          await page.keyboard.press('ArrowLeft')
        }
        await expect(currentStepLocator).toHaveText('1')
      } else {
        // High-step program (e.g. 2000 steps): verify keyboard responsiveness with sample steps
        for (let s = 1; s <= 5; s++) {
          await page.keyboard.press('ArrowRight')
        }
        await expect(currentStepLocator).toHaveText('6')

        // Jump to mid step for checkpoint
        await page.evaluate((m) => {
          ;(window as any).useTraceStore?.getState?.().setCurrentStep(m - 1)
        }, midStep)
        await expect(currentStepLocator).toHaveText(String(midStep))
        await page.screenshot({
          path: path.join(screenshotsDir, `${progName}_step_mid.png`),
        })

        // Jump to last step for checkpoint
        await page.evaluate((l) => {
          ;(window as any).useTraceStore?.getState?.().setCurrentStep(l - 1)
        }, totalSteps)
        await expect(currentStepLocator).toHaveText(String(totalSteps))
        await page.screenshot({
          path: path.join(screenshotsDir, `${progName}_step_last.png`),
        })

        // Verify keyboard ArrowLeft stepping backwards
        await page.keyboard.press('ArrowLeft')
        await expect(currentStepLocator).toHaveText(String(totalSteps - 1))

        // Reset back to step 1
        await page.locator('button[aria-label="Reset execution"]').first().click()
        await expect(currentStepLocator).toHaveText('1')
      }

      // Verify no console errors or failed network requests occurred
      expect(consoleErrors).toEqual([])
      expect(failedRequests).toEqual([])
    })
  }
})
