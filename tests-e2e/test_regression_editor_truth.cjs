const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('--- Starting Playwright End-to-End Regression Test ---')
  const reportsDir = path.resolve(__dirname, 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const runRequests = []
  page.on('request', (req) => {
    if (req.method() === 'POST' && (req.url().includes('/run') || req.url().includes('/api/run'))) {
      runRequests.push({
        url: req.url(),
        postData: req.postDataJSON ? req.postDataJSON() : req.postData(),
      })
    }
  })

  // 1. Navigate to Workspace
  await page.goto('http://127.0.0.1:5173/workspace', { waitUntil: 'networkidle' })
  console.log('✓ Page loaded at http://127.0.0.1:5173/workspace')

  // Check initial state: 0 steps on initial clean load
  const initialStepDisplay = await page.textContent('[data-testid="current-step-display"]')
  console.log('Initial step display on load:', initialStepDisplay)

  // 2. Load Two Sum preset & click Run
  console.log('\n--- Step 1: Run Two Sum Preset ---')
  await page.selectOption('select[aria-label="Select Python preset"]', 'two-sum')
  await page.waitForTimeout(300)

  // Click Run
  runRequests.length = 0
  await page.click('button[aria-label="Run Python code"]')
  await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
  await page.waitForTimeout(800)

  // Step to the end of Two Sum to verify output
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(400)

  const twoSumOutput = await page.textContent('[data-testid="terminal-content"]')
  const twoSumSteps = await page.textContent('[data-testid="total-steps-display"]')
  const twoSumVars = await page.textContent('[data-testid="variables-content"]')
  console.log('Two Sum Total Steps:', twoSumSteps)
  console.log('Two Sum Terminal Output:', twoSumOutput.replace(/\s+/g, ' ').trim())

  if (!twoSumOutput.includes('Indices: [0, 1]')) {
    throw new Error(`Expected Two Sum output to contain 'Indices: [0, 1]', got: ${twoSumOutput}`)
  }
  if (!twoSumVars.includes('numbers') || !twoSumVars.includes('res')) {
    throw new Error(`Expected Two Sum variables to contain 'numbers' and 'res'`)
  }
  await page.screenshot({ path: path.join(reportsDir, 'reg_01_two_sum_run.png') })
  console.log('✓ Two Sum ran successfully and produced valid output')

  // 3. Edit code to print("hallo")
  console.log('\n--- Step 2: Edit Code to print("hallo") ---')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('print("hallo")')
  })
  await page.waitForTimeout(400)

  // Verify "Code changed, press Run" notice appears!
  const noticeVisible = await page.isVisible('[data-testid="code-changed-notice"]')
  console.log('Code changed notice visible:', noticeVisible)
  if (!noticeVisible) {
    throw new Error('Expected [data-testid="code-changed-notice"] to be visible when editor code changes!')
  }
  await page.screenshot({ path: path.join(reportsDir, 'reg_02_hallo_outdated_notice.png') })
  console.log('✓ "Code changed, press Run" notice is correctly displayed')

  // Click Run for print("hallo")
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200),
    page.click('button[aria-label="Run Python code"]'),
  ])

  await page.waitForTimeout(800)
  const halloPayload = runRequests[0]?.postData
  console.log('POST request payload for hallo:', halloPayload)
  if (!halloPayload || halloPayload.code !== 'print("hallo")') {
    throw new Error(`Expected POST request to have code 'print("hallo")', got: ${JSON.stringify(halloPayload)}`)
  }

  // Jump to last step to inspect printed output
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(400)

  const halloOutput = await page.textContent('[data-testid="terminal-content"]')
  const halloTotalSteps = await page.textContent('[data-testid="total-steps-display"]')
  const halloVars = await page.textContent('[data-testid="variables-content"]')
  const halloNoticeStillVisible = await page.isVisible('[data-testid="code-changed-notice"]')

  console.log('Hallo Total Steps:', halloTotalSteps)
  console.log('Hallo Terminal Output:', halloOutput.replace(/\s+/g, ' ').trim())
  console.log('Hallo Variables Content:', halloVars.replace(/\s+/g, ' ').trim())

  if (!halloOutput.includes('hallo')) {
    throw new Error(`Expected output terminal to contain 'hallo', got: ${halloOutput}`)
  }
  if (halloOutput.includes('Indices: [0, 1]')) {
    throw new Error(`Output terminal still contains stale Two Sum text 'Indices: [0, 1]'!`)
  }
  if (halloVars.includes('numbers') || halloVars.includes('res')) {
    throw new Error(`Variables panel still contains stale Two Sum variables 'numbers' or 'res'!`)
  }
  if (halloTotalSteps.includes('/ 13') || halloTotalSteps.includes('/ 17')) {
    throw new Error(`Step count is still Two Sum step count! Expected small step count for single print statement.`)
  }
  if (halloNoticeStillVisible) {
    throw new Error(`Outdated notice should disappear after Run!`)
  }

  // Explanation check: must NOT mention Indices
  const explanationEl = await page.$('[data-testid="step-explanation"]')
  if (explanationEl) {
    const expText = await explanationEl.textContent()
    console.log('Hallo Explanation Text:', expText)
    if (expText.includes('Indices')) {
      throw new Error(`Explanation text still mentions 'Indices'! Text was: ${expText}`)
    }
  }

  await page.screenshot({ path: path.join(reportsDir, 'reg_03_hallo_success.png') })
  console.log('✓ Custom code print("hallo") produced its own trace cleanly!')

  // 4. Repeat with 5 more custom programs
  console.log('\n--- Step 3: Five Additional Custom Programs ---')

  // Program 1: Arithmetic
  console.log('Testing Program 1 (Arithmetic)...')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('x = 40 + 2\nprint("computed answer:", x)')
  })
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200),
    page.click('button[aria-label="Run Python code"]'),
  ])
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(300)
  const p1Output = await page.textContent('[data-testid="terminal-content"]')
  const p1Vars = await page.textContent('[data-testid="variables-content"]')
  if (!p1Output.includes('computed answer: 42')) {
    throw new Error(`Program 1 failed. Output: ${p1Output}`)
  }
  if (!p1Vars.includes('x') || !p1Vars.includes('42')) {
    throw new Error(`Program 1 variables missing x = 42. Vars: ${p1Vars}`)
  }
  console.log('✓ Program 1 passed: computed answer: 42, variable x = 42')

  // Program 2: String manipulation
  console.log('Testing Program 2 (String manipulation)...')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('greeting = "hello world".upper()\nprint("greeting:", greeting)')
  })
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200),
    page.click('button[aria-label="Run Python code"]'),
  ])
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(300)
  const p2Output = await page.textContent('[data-testid="terminal-content"]')
  const p2Vars = await page.textContent('[data-testid="variables-content"]')
  if (!p2Output.includes('greeting: HELLO WORLD')) {
    throw new Error(`Program 2 failed. Output: ${p2Output}`)
  }
  if (!p2Vars.includes('greeting') || !p2Vars.includes('HELLO WORLD')) {
    throw new Error(`Program 2 variables missing greeting. Vars: ${p2Vars}`)
  }
  console.log('✓ Program 2 passed: greeting: HELLO WORLD')

  // Program 3: List operations
  console.log('Testing Program 3 (List operations)...')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('items = [10, 20]\nitems.append(30)\nprint("items:", items)')
  })
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200),
    page.click('button[aria-label="Run Python code"]'),
  ])
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(300)
  const p3Output = await page.textContent('[data-testid="terminal-content"]')
  const p3Vars = await page.textContent('[data-testid="variables-content"]')
  if (!p3Output.includes('items: [10, 20, 30]')) {
    throw new Error(`Program 3 failed. Output: ${p3Output}`)
  }
  if (!p3Vars.includes('items')) {
    throw new Error(`Program 3 variables missing items. Vars: ${p3Vars}`)
  }
  console.log('✓ Program 3 passed: items: [10, 20, 30]')

  // Program 4: Syntax error
  console.log('Testing Program 4 (Syntax Error)...')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('print("unclosed string')
  })
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 400),
    page.click('button[aria-label="Run Python code"]'),
  ])
  await page.waitForTimeout(500)
  const toastText = await page.textContent('body')
  if (!toastText.includes('Syntax') && !toastText.includes('unterminated string')) {
    throw new Error(`Program 4 failed to display syntax error Toast. Body text: ${toastText}`)
  }
  console.log('✓ Program 4 passed: SyntaxError caught with 400 status and error Toast')

  // Program 5: Runtime exception (ZeroDivisionError)
  console.log('Testing Program 5 (Runtime Exception: ZeroDivisionError)...')
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('val = 100\nresult = val / 0')
  })
  runRequests.length = 0
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200),
    page.click('button[aria-label="Run Python code"]'),
  ])
  await page.waitForTimeout(600)
  // Step to the exception step (the last step)
  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(300)

  const exceptionNotice = await page.isVisible('[data-testid="exception-notice"]')
  const exceptionText = await page.textContent('[data-testid="exception-notice"]')
  console.log('Exception Notice text:', exceptionText.replace(/\s+/g, ' ').trim())
  if (!exceptionNotice || !exceptionText.includes('ZeroDivisionError')) {
    throw new Error(`Program 5 failed to show exception notice with ZeroDivisionError!`)
  }
  await page.screenshot({ path: path.join(reportsDir, 'reg_04_runtime_exception.png') })
  console.log('✓ Program 5 passed: ZeroDivisionError exception banner cleanly rendered')

  await browser.close()
  console.log('\n======================================================')
  console.log('🎉 ALL PLAYWRIGHT REGRESSION TESTS PASSED SUCCESSFULLY')
  console.log('======================================================')
}

main().catch((err) => {
  console.error('\n❌ Playwright Regression Test Failed:\n', err)
  process.exit(1)
})
