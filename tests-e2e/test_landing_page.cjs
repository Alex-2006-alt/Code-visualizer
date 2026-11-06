/**
 * Playwright E2E Test Suite: CodeTrace Landing Page
 *
 * Verifies:
 * 1. Headlines, honest copy, and no fake social proof
 * 2. All CTA and "Try it" deep links route correctly
 * 3. FAQ accordion interactivity
 * 4. Responsive viewport layouts at 390px, 768px, and 1440px without page overflow
 * 5. Console error silence
 */

const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'

async function runTests() {
  console.log(`[E2E] Testing CodeTrace Landing Page at: ${BASE_URL}`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

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
    // 1. Visit Landing Page
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

    // Check Headline
    const headline = await page.locator('h1').first().textContent()
    assert(
      headline && headline.includes('Watch your Python code'),
      `Hero headline contains 'Watch your Python code': "${headline?.trim()}"`
    )

    // Check announcement pill
    const pill = await page.locator('text=Python 3.12 Step-by-Step Execution Visualizer').count()
    assert(pill > 0, 'Found accurate announcement pill')

    // Verify fake claims are absent
    const fakeRatings = await page.locator('text=2,300+ CS students').count()
    assert(fakeRatings === 0, 'Fake 2,300+ students social proof was removed')

    const fakeBytecode = await page.locator('text=Python bytecode').count()
    assert(fakeBytecode === 0, 'Misleading "Python bytecode" claim was removed')

    const fake100 = await page.locator('text=100+ Examples').count()
    assert(fake100 === 0, 'Misleading "100+ Examples" claim was removed')

    // 2. Test FAQ Accordion
    const firstFaqQuestion = page.locator('button:has-text("How does CodeTrace trace Python execution?")')
    await firstFaqQuestion.scrollIntoViewIfNeeded()
    assert(await firstFaqQuestion.count() > 0, 'Found FAQ question')

    // Check first question is initially expanded
    const isFirstExpanded = await firstFaqQuestion.getAttribute('aria-expanded')
    assert(isFirstExpanded === 'true', 'First FAQ accordion item is open by default')

    // Click second question
    const secondFaqQuestion = page.locator('button:has-text("Can I use external packages like NumPy or Pandas?")')
    await secondFaqQuestion.click()
    await page.waitForTimeout(300)
    const isSecondExpanded = await secondFaqQuestion.getAttribute('aria-expanded')
    assert(isSecondExpanded === 'true', 'Second FAQ item expanded on click')

    // 3. Test "Try it" Preset Links
    const bubbleSortLink = page.locator('a[href="/workspace?preset=bubble-sort"]').first()
    assert(await bubbleSortLink.count() > 0, 'Found Bubble Sort preset link')

    const factorialLink = page.locator('a[href="/workspace?preset=factorial-recursion"]').first()
    assert(await factorialLink.count() > 0, 'Found Factorial Recursion preset link')

    const twoSumLink = page.locator('a[href="/workspace?preset=two-sum"]').first()
    assert(await twoSumLink.count() > 0, 'Found Two Sum preset link')

    const compareLink = page.locator('a[href="/workspace?mode=compare"]').first()
    assert(await compareLink.count() > 0, 'Found Compare Mode preset link')

    const predictLink = page.locator('a[href="/workspace?preset=two-sum&mode=predict"]').first()
    assert(await predictLink.count() > 0, 'Found Predict Mode preset link')

    // Click Bubble Sort and verify navigation
    await bubbleSortLink.click()
    await page.waitForURL('**/workspace?preset=bubble-sort', { timeout: 5000 })
    assert(page.url().includes('preset=bubble-sort'), 'Navigated to /workspace?preset=bubble-sort')

    // 4. Test Responsive Viewports (no horizontal overflow)
    const viewports = [
      { name: 'Mobile', width: 390, height: 844 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      assert(!hasHorizontalScroll, `${vp.name} (${vp.width}px): Clean layout with zero horizontal overflow`)
    }

    // 5. Console Errors
    const filteredErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('WebSocket')
    )
    assert(filteredErrors.length === 0, `Zero critical console errors (found: ${filteredErrors.length})`)

  } catch (err) {
    console.error('Test execution error:', err)
    failed++
  } finally {
    await browser.close()
  }

  console.log(`\n========================================`)
  console.log(`Landing Page Tests Completed: ${passed} passed, ${failed} failed`)
  console.log(`========================================`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
