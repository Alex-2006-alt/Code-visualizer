/**
 * Playwright E2E Test Suite: CodeTrace Debugger-Style Controls (Phase 1)
 *
 * Verifies:
 * 1. Step Over, Step Into, Step Out, Next Call, Restart controls
 * 2. Breakpoint toggling, timeline tick marks, and Continue-to-breakpoint
 * 3. Searchable Event Log Drawer navigation
 * 4. Keyboard shortcuts modal and hotkeys
 * 5. Replay on Factorial recursion, Bubble sort loops, and Linked list traversal
 */

const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'

async function runTests() {
  console.log(`[E2E] Testing Debugger-Style Controls at: ${BASE_URL}`)
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
    // 1. Visit Workspace with Factorial preset
    await page.goto(`${BASE_URL}/workspace`, { waitUntil: 'networkidle' })
    console.log('\n--- 1. Testing Factorial Recursion & Step Controls ---')
    await page.selectOption('select[aria-label="Select Python preset"]', 'factorial-recursion')
    await page.waitForTimeout(300)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(600)

    // Verify initial currentStep is 0 (displayed as step 1 in UI)
    let initialStep = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    assert(initialStep === 0, `Initial currentStep index is 0 in store`)

    // Step Into (F11 / btn-step-into)
    await page.click('[data-testid="btn-step-into"]')
    await page.waitForTimeout(200)
    let steppedInto = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    assert(steppedInto === 1, `Step Into advanced store to step 1 (got: ${steppedInto})`)

    // Next Call (btn-next-call)
    await page.click('[data-testid="btn-next-call"]')
    await page.waitForTimeout(200)
    const afterCallStep = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    const afterCallEvent = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      return s.steps[s.currentStep]?.event
    })
    assert(afterCallStep > 1 && afterCallEvent === 'call', `Next Call jumped to next call event at step ${afterCallStep}`)

    // Step Out (Shift+F11 / btn-step-out) from recursion
    const depthBefore = await page.evaluate(() => window.useTraceStore.getState().steps[window.useTraceStore.getState().currentStep]?.stack.length || 0)
    await page.click('[data-testid="btn-step-out"]')
    await page.waitForTimeout(200)
    const depthAfter = await page.evaluate(() => window.useTraceStore.getState().steps[window.useTraceStore.getState().currentStep]?.stack.length || 0)
    assert(depthAfter < depthBefore || depthBefore <= 1, `Step Out popped frame depth (${depthBefore} -> ${depthAfter})`)

    // Restart button
    await page.click('[data-testid="btn-restart"]')
    await page.waitForTimeout(200)
    const restartedStep = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    assert(restartedStep === 0, `Restart successfully returned execution to step 0`)

    // 2. Breakpoints and Continue
    console.log('\n--- 2. Testing Breakpoints & Continue ---')
    // Set a breakpoint at line 4 (inside factorial recursive return)
    await page.evaluate(() => window.useTraceStore.getState().toggleBreakpoint(4))
    await page.waitForTimeout(300)

    // Check breakpoint tick mark on timeline
    const tickCount = await page.locator('[data-testid="breakpoint-tick"]').count()
    assert(tickCount > 0, `Breakpoint tick mark rendered on timeline slider (found ${tickCount} ticks)`)

    // Click Continue (F8 / btn-continue)
    await page.click('[data-testid="btn-continue"]')
    await page.waitForTimeout(300)
    const continuedLine = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      return s.steps[s.currentStep]?.line
    })
    assert(continuedLine === 4, `Continue paused execution at breakpoint line 4 (at line: ${continuedLine})`)

    // 3. Event Log Drawer
    console.log('\n--- 3. Testing Event Log Drawer ---')
    await page.click('[data-testid="btn-open-event-log"]')
    await page.waitForTimeout(400)
    const drawerVisible = await page.locator('[data-testid="event-log-drawer"]').isVisible()
    assert(drawerVisible, `Event Log Drawer opened successfully`)

    // Search filter in Event Log
    await page.fill('[data-testid="event-log-search"]', 'return')
    await page.waitForTimeout(300)
    const filteredItems = await page.locator('[data-testid^="event-log-item-"]').count()
    assert(filteredItems > 0, `Event Log filtered results for 'return' (found ${filteredItems} items)`)

    // Click first item to jump
    await page.locator('[data-testid^="event-log-item-"]').first().click()
    await page.locator('[data-testid="event-log-drawer"]').waitFor({ state: 'detached', timeout: 3000 })
    assert(true, `Drawer closed upon selecting step`)

    // 4. Keyboard Shortcuts Modal
    console.log('\n--- 4. Testing Keyboard Shortcuts Modal ---')
    await page.click('[data-testid="btn-open-shortcuts"]')
    await page.waitForTimeout(400)
    const modalVisible = await page.locator('[data-testid="shortcuts-modal"]').isVisible()
    assert(modalVisible, `Keyboard Shortcuts modal opened successfully`)

    const modalText = await page.locator('[data-testid="shortcuts-modal"]').textContent()
    assert(
      modalText.includes('F10') && modalText.includes('F11') && modalText.includes('F8'),
      `Shortcuts modal documents F10 (Step Over), F11 (Step Into), and F8 (Continue)`
    )

    await page.click('[data-testid="btn-close-shortcuts"]')
    await page.locator('[data-testid="shortcuts-modal"]').waitFor({ state: 'detached', timeout: 3000 })
    assert(true, `Keyboard Shortcuts modal closed cleanly`)

    // 5. Bubble Sort (Loops & Step Over)
    console.log('\n--- 5. Testing Bubble Sort (Step Over in Loops) ---')
    await page.selectOption('select[aria-label="Select Python preset"]', 'bubble-sort')
    await page.waitForTimeout(300)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(600)

    const initialBubbleStep = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    assert(initialBubbleStep === 0, `Bubble sort loaded at step 0`)

    // Step Over several times through the loop
    await page.click('[data-testid="btn-step-over"]')
    await page.waitForTimeout(150)
    await page.click('[data-testid="btn-step-over"]')
    await page.waitForTimeout(150)
    const steppedBubble = await page.evaluate(() => window.useTraceStore.getState().currentStep)
    assert(steppedBubble >= 2, `Step Over successfully progressed through loop iterations (current: ${steppedBubble})`)

    // 6. Linked List Program Custom Execution
    console.log('\n--- 6. Testing Linked List Program Execution ---')
    const linkedListCode = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = Node(1, Node(2, Node(3)))
curr = head
while curr:
    print(curr.val)
    curr = curr.next
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), linkedListCode)
    await page.waitForTimeout(200)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    const totalLLSteps = await page.evaluate(() => window.useTraceStore.getState().steps.length)
    assert(totalLLSteps > 10, `Linked list program executed and traced ${totalLLSteps} steps (found: ${totalLLSteps})`)

    // Set breakpoint at line 10 (curr = curr.next)
    await page.evaluate(() => window.useTraceStore.getState().toggleBreakpoint(10))
    await page.waitForTimeout(200)
    await page.click('[data-testid="btn-continue"]')
    await page.waitForTimeout(300)
    const hitLine = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      return s.steps[s.currentStep]?.line
    })
    assert(hitLine === 10, `Debugger hit breakpoint at line 10 in linked list traversal (got: ${hitLine})`)

  } catch (err) {
    console.error('Fatal error during E2E test run:', err)
    failed++
  } finally {
    await browser.close()
  }

  console.log('\n--- Test Summary ---')
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
