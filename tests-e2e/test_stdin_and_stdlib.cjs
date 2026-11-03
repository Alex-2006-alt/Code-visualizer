/**
 * Playwright E2E Test Suite: CodeTrace Stdin & Standard Library (Phase 3)
 *
 * Verifies:
 * 1. Stdin drawer toggling, preset buttons, line count, and byte counter
 * 2. Sequential input() consumption with variables and terminal output
 * 3. Multi-line input() loop parsing 5 lines
 * 4. Graceful EOF handling when input runs out
 * 5. Expanded 21 standard library modules execution (statistics, math, collections, dataclasses)
 * 6. Editor lint warning on disallowed imports (e.g. import os)
 * 7. UI Help Modal: Supported Modules catalog with search filtering
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'

async function runTests() {
  console.log(`[E2E] Testing Stdin and Standard Library at: ${BASE_URL}`)
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
    // 1. Visit Workspace
    await page.goto(`${BASE_URL}/workspace`, { waitUntil: 'networkidle' })

    // ─── 1. Test Stdin Drawer UI Controls ───
    console.log('\n--- 1. Testing Stdin Drawer UI Controls ---')
    const toggleBtn = page.locator('[data-testid="btn-toggle-stdin"]')
    await toggleBtn.waitFor({ state: 'visible', timeout: 5000 })
    assert(await toggleBtn.isVisible(), 'Input (stdin) toggle button exists in cockpit')

    // Open drawer
    await toggleBtn.click()
    await page.waitForTimeout(400)
    const stdinPanel = page.locator('[data-testid="stdin-panel"]')
    assert(await stdinPanel.isVisible(), 'Stdin panel opens when toggle button is clicked')

    // Click sample preset "User Profile"
    const sampleBtn = page.locator('[data-testid="btn-sample-user-profile"]')
    await sampleBtn.click()
    await page.waitForTimeout(200)

    const textarea = page.locator('[data-testid="stdin-textarea"]')
    const val = await textarea.inputValue()
    assert(val.includes('Alice\n25'), 'Preset sample "User Profile" inserted into textarea')

    // Check line badge and byte counter
    const lineBadge = page.locator('[data-testid="stdin-line-count-badge"]')
    assert(await lineBadge.isVisible(), 'Line count badge appears when stdin has text')
    const lineText = await lineBadge.innerText()
    assert(lineText.includes('lines') || lineText.includes('line'), `Line count badge shows: ${lineText}`)

    // Check Clear button
    const clearBtn = page.locator('[data-testid="btn-clear-stdin"]')
    await clearBtn.click()
    await page.waitForTimeout(200)
    const clearedVal = await textarea.inputValue()
    assert(clearedVal === '', 'Clear button clears stdin textarea buffer')

    // ─── 2. Test Execution with input() ───
    console.log('\n--- 2. Testing Execution with input() ---')
    const inputProgram = `name = input()
age = int(input())
summary = f"{name} is {age} years old"
print(summary)
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), inputProgram)
    await page.evaluate((s) => window.useTraceStore.getState().setStdin(s), 'Bob\n32\n')
    await page.waitForTimeout(300)

    const runBtn = page.locator('button[aria-label="Run Python code"]')
    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    // Jump to the final step
    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(300)

    const finalStepLocals = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      const step = s.steps[s.currentStep]
      return step ? step.stack[step.stack.length - 1].locals : null
    })

    assert(finalStepLocals && finalStepLocals.name === 'Bob', 'First input() correctly assigned name = "Bob"')
    assert(finalStepLocals && finalStepLocals.age === 32, 'Second input() correctly assigned age = 32')
    assert(
      finalStepLocals && finalStepLocals.summary === 'Bob is 32 years old',
      'summary variable formatted with stdin values'
    )

    // Verify terminal output
    const terminalOutput = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      return s.steps[s.currentStep].output
    })
    assert(
      terminalOutput.includes('Bob is 32 years old'),
      'Output terminal captures printed stdin summary string'
    )

    // ─── 3. Test Multi-Line input() Loop ───
    console.log('\n--- 3. Testing Multi-Line input() Loop ---')
    const loopStdinProgram = `lines = []
try:
    while True:
        lines.append(input())
except EOFError:
    pass
total_items = len(lines)
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), loopStdinProgram)
    await page.evaluate((s) => window.useTraceStore.getState().setStdin(s), 'alpha\nbeta\ngamma\ndelta\nepsilon\n')
    await page.waitForTimeout(300)

    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(300)

    const loopLocals = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      const step = s.steps[s.currentStep]
      return step ? step.stack[step.stack.length - 1].locals : null
    })
    assert(loopLocals && loopLocals.total_items === 5, 'Multi-line input loop read all 5 lines')

    // ─── 4. Test EOF Handling When Input Exhausted ───
    console.log('\n--- 4. Testing EOF Handling ---')
    const eofProgram = `first = input()
second = input()
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), eofProgram)
    await page.evaluate((s) => window.useTraceStore.getState().setStdin(s), 'single_line\n')
    await page.waitForTimeout(300)

    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    // Last step should be an exception step with EOFError explanation
    const lastStep = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      return s.steps[s.steps.length - 1]
    })
    assert(lastStep && lastStep.event === 'exception', 'Exhausted stdin produces an exception step')
    assert(
      lastStep && lastStep.explanation && lastStep.explanation.includes('EOFError'),
      `Explanation records clear EOF error: ${lastStep.explanation}`
    )

    // ─── 5. Test Standard Library Expansion ───
    console.log('\n--- 5. Testing Standard Library (math, statistics, dataclasses, collections) ---')
    const stdlibProgram = `import math
import statistics
from dataclasses import dataclass
from collections import deque

@dataclass
class Result:
    label: str
    score: float

q = deque([10, 20, 30, 40])
avg = statistics.mean(q)
res = Result("mean_val", avg)
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), stdlibProgram)
    await page.waitForTimeout(300)

    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    const stdlibStepCount = await page.evaluate(() => window.useTraceStore.getState().steps.length)
    assert(stdlibStepCount > 5, `Standard library code executed with ${stdlibStepCount} trace steps`)

    const stdlibFinalLocals = await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      const step = s.steps[s.steps.length - 1]
      return step ? step.stack[step.stack.length - 1].locals : null
    })
    assert(stdlibFinalLocals && stdlibFinalLocals.avg === 25, 'statistics.mean calculated average of deque as 25')

    // ─── 6. Test Disallowed Module Editor Warning & Help Modal ───
    console.log('\n--- 6. Testing Disallowed Module Warning & UI Help ---')
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), 'import os\nprint(os.getcwd())\n')
    await page.waitForTimeout(400)

    const warningBanner = page.locator('[data-testid="disallowed-import-warning"]')
    assert(await warningBanner.isVisible(), 'Editor displays disallowed import warning banner for "import os"')

    const helpLink = page.locator('[data-testid="btn-view-allowed-modules"]')
    assert(await helpLink.isVisible(), 'Link to view 21 allowed modules is visible')

    await helpLink.click()
    await page.waitForTimeout(400)

    const helpModal = page.locator('[data-testid="shortcuts-modal"]')
    assert(await helpModal.isVisible(), 'Help modal opened on click')

    const modulesPanel = page.locator('[data-testid="supported-modules-panel"]')
    assert(await modulesPanel.isVisible(), 'Supported Modules panel is active in Help modal')

    // Search filter in modal
    const searchInput = page.locator('[data-testid="input-search-modules"]')
    await searchInput.fill('statistics')
    await page.waitForTimeout(200)

    const statsItem = page.locator('[data-testid="module-item-statistics"]')
    assert(await statsItem.isVisible(), 'Search filter isolates "statistics" module in help panel')

    // Close help modal
    const closeHelpBtn = page.locator('[data-testid="btn-close-shortcuts"]')
    await closeHelpBtn.click()
    await page.waitForTimeout(600)
    assert((await helpModal.count()) === 0 || !(await helpModal.isVisible()), 'Help modal closed cleanly')

    // ─── 7. Capture Visual Screenshot ───
    console.log('\n--- 7. Capturing Phase 3 Visual Evidence ---')
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), `name = input()
score = float(input())
status = "Passed" if score >= 70.0 else "Needs Review"
print(f"{name}: {status} ({score})")
`)
    await page.evaluate((s) => window.useTraceStore.getState().setStdin(s), 'Alex Rivera\n88.5\n')
    await page.waitForTimeout(300)
    await runBtn.click()
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    // Ensure stdin panel is open
    const isPanelOpen = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="stdin-panel"]')
      return el && !el.classList.contains('max-h-0')
    })
    if (!isPanelOpen) {
      await toggleBtn.click()
      await page.waitForTimeout(400)
    }

    const screenshotPath = path.resolve(__dirname, 'stdin_drawer_preview.png')
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`  ✓ Screenshot saved to: ${screenshotPath}`)

    // Copy to brain artifact directory
    const brainDir = 'C:\\Users\\Samiran_Bera\\.gemini\\antigravity\\brain\\8938f61f-1387-449e-a84e-7b2ea653b5e0'
    const brainScreenshotPath = path.join(brainDir, 'stdin_drawer_preview.png')
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
  console.log(`Phase 3 Test Results: ${passed} passed, ${failed} failed`)
  console.log(`========================================`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
