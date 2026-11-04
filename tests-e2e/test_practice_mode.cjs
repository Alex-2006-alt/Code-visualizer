/**
 * Playwright E2E Test Suite: CodeTrace Practice Mode (Phase 4)
 *
 * Verifies:
 * 1. Catalog listing, difficulty filtering, and search functionality
 * 2. Problem selection, statement rendering, constraints, and starter code loading
 * 3. Fail Flow: buggy solution evaluated, results panel shows failing tests and diff
 * 4. Visualize Flow: "Visualize this test" loads test case into Workspace Studio trace
 * 5. Solve Flow: correct solution passes 100% of tests, marks problem solved, updates localStorage tally
 * 6. Evidence: visual screenshot capture of Practice Arena
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'

async function runTests() {
  console.log(`[E2E] Testing Practice Mode at: ${BASE_URL}`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  try {
    // 1. Visit /practice
    console.log('\n--- 1. Testing Practice Catalog & Filtering ---')
    await page.goto(`${BASE_URL}/practice`, { waitUntil: 'networkidle' })

    const practicePage = page.locator('[data-testid="practice-page"]')
    await practicePage.waitFor({ state: 'visible', timeout: 5000 })
    assert(await practicePage.isVisible(), 'Practice page container loaded')

    // Verify solved counter badge
    const solvedCounter = page.locator('[data-testid="solved-counter-badge"]')
    assert(await solvedCounter.isVisible(), 'Solved tally counter is displayed in header')

    // Verify problems list container has problem items
    const listContainer = page.locator('[data-testid="problems-list-container"]')
    await listContainer.waitFor({ state: 'visible', timeout: 5000 })
    const problemCards = page.locator('[data-testid^="problem-card-"]')
    const initialCount = await problemCards.count()
    assert(initialCount >= 20, `Catalog loaded all ${initialCount} problems (expected >= 20)`)

    // Filter by Medium difficulty
    const mediumTab = page.locator('button', { hasText: 'Medium' }).first()
    await mediumTab.click()
    await page.waitForTimeout(300)
    const mediumCount = await page.locator('[data-testid^="problem-card-"]').count()
    assert(mediumCount > 0 && mediumCount < initialCount, `Difficulty filter isolated ${mediumCount} Medium problems`)

    // Reset filter to All
    const allTab = page.locator('button', { hasText: 'All' }).first()
    await allTab.click()
    await page.waitForTimeout(200)

    // Search filter
    const searchInput = page.locator('[data-testid="input-problem-search"]')
    await searchInput.fill('Binary Search')
    await page.waitForTimeout(300)
    const searchCards = page.locator('[data-testid^="problem-card-"]')
    const searchCount = await searchCards.count()
    assert(searchCount >= 1, `Search filter isolated ${searchCount} problem(s) matching "Binary Search"`)

    // ─── 2. Problem View & Starter Code ───
    console.log('\n--- 2. Testing Problem Selection & Details ---')
    const bsCard = page.locator('[data-testid="problem-card-binary-search"]')
    await bsCard.click()
    await page.waitForTimeout(500)

    const titleHeading = page.locator('[data-testid="problem-title-heading"]')
    const titleText = await titleHeading.innerText()
    assert(titleText.includes('Binary Search'), `Problem title displayed: "${titleText}"`)

    const statementBody = page.locator('[data-testid="problem-statement-body"]')
    assert(await statementBody.isVisible(), 'Problem statement body is rendered')

    // ─── 3. Fail Flow ───
    console.log('\n--- 3. Testing Fail Flow (Failing Tests & Results Panel) ---')
    const buggyCode = `def search(nums: list[int], target: int) -> int:
    return -1
`
    // Set code in editor using Monaco or page evaluation
    await page.evaluate((c) => {
      const editor = window.__codeEditor
      if (editor) {
        editor.setValue(c)
      }
    }, buggyCode)
    await page.waitForTimeout(300)

    const submitBtn = page.locator('[data-testid="btn-submit-solution"]')
    await submitBtn.click()
    await page.waitForResponse((res) => res.url().includes('/submit') && res.status() === 200)
    await page.waitForTimeout(800)

    const resultsPanel = page.locator('[data-testid="practice-results-panel"]')
    assert(await resultsPanel.isVisible(), 'Test results panel displayed after evaluation')

    const statusTitle = page.locator('[data-testid="results-status-title"]')
    const statusText = await statusTitle.innerText()
    assert(statusText.includes('Passed') && !statusText.includes('All'), `Results overview reports partial pass: "${statusText}"`)

    // Locate failing visible test tab
    const test1Tab = page.locator('[data-testid="test-result-tab-1"]')
    await test1Tab.click()
    await page.waitForTimeout(200)

    const detailCard = page.locator('[data-testid="test-detail-card"]')
    assert(await detailCard.isVisible(), 'Test detail card displays input and expected output')

    const visualizeBtn = page.locator('[data-testid="btn-visualize-test"]')
    assert(await visualizeBtn.isVisible(), '"Visualize this test" button appears on failing test')

    // ─── 4. Visualize Flow ───
    console.log('\n--- 4. Testing Visualize Flow (Transfer to Studio Visualizer) ---')
    await visualizeBtn.click()
    await page.waitForTimeout(800)

    // Assert URL navigated to /workspace
    const currentUrl = page.url()
    assert(currentUrl.includes('/workspace'), `Successfully redirected to Workspace visualizer: ${currentUrl}`)

    // Verify transferred code in useTraceStore
    const visualizerCode = await page.evaluate(() => window.useTraceStore.getState().code)
    assert(
      visualizerCode.includes('Visualizing Test #1') && visualizerCode.includes('search('),
      'Workspace code initialized with function and failing test inputs'
    )

    // Run transferred script in visualizer
    const runBtn = page.locator('button[aria-label="Run Python code"]')
    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    const stepCount = await page.evaluate(() => window.useTraceStore.getState().steps.length)
    assert(stepCount > 0, `Studio visualizer successfully stepped through failing test with ${stepCount} steps`)

    // ─── 5. Solve Flow ───
    console.log('\n--- 5. Testing Solve Flow (100% Pass & LocalStorage Persistence) ---')
    await page.goto(`${BASE_URL}/practice/binary-search`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    const optimalSolution = `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`
    await page.evaluate((c) => {
      const editor = window.__codeEditor
      if (editor) {
        editor.setValue(c)
      }
    }, optimalSolution)
    await page.waitForTimeout(300)

    const submitBtnSolve = page.locator('[data-testid="btn-submit-solution"]')
    await submitBtnSolve.click()
    await page.waitForResponse((res) => res.url().includes('/submit') && res.status() === 200)
    await page.waitForTimeout(800)

    const solvedStatusTitle = page.locator('[data-testid="results-status-title"]')
    const solvedTitleText = await solvedStatusTitle.innerText()
    assert(
      solvedTitleText.includes('All') && solvedTitleText.includes('Passed'),
      `Results overview confirms full success: "${solvedTitleText}"`
    )

    const solvedBadge = page.locator('[data-testid="problem-solved-badge"]')
    assert(await solvedBadge.isVisible(), 'Problem heading shows "Solved" checkmark badge')

    // Verify localStorage persistence
    const storedSolved = await page.evaluate(() => localStorage.getItem('codetrace_solved_problems'))
    assert(
      storedSolved && storedSolved.includes('binary-search'),
      `localStorage contains solved problem ID: ${storedSolved}`
    )

    // ─── 6. Capture Visual Screenshot ───
    console.log('\n--- 6. Capturing Phase 4 Visual Evidence ---')
    const screenshotPath = path.resolve(__dirname, 'practice_mode_preview.png')
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`  ✓ Screenshot saved to: ${screenshotPath}`)

    // Copy to brain artifact directory
    const brainDir = 'C:\\Users\\Samiran_Bera\\.gemini\\antigravity\\brain\\8938f61f-1387-449e-a84e-7b2ea653b5e0'
    const brainScreenshotPath = path.join(brainDir, 'practice_mode_preview.png')
    try {
      fs.copyFileSync(screenshotPath, brainScreenshotPath)
      console.log(`  ✓ Screenshot copied to brain artifact directory: ${brainScreenshotPath}`)
    } catch (e) {
      console.warn(`  ! Could not copy screenshot to brain dir: ${e.message}`)
    }
  } catch (err) {
    console.error('Test execution error:', err)
    failed++
  } finally {
    await browser.close()
  }

  console.log(`\n========================================`)
  console.log(`Phase 4 Test Results: ${passed} passed, ${failed} failed`)
  console.log(`========================================`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
