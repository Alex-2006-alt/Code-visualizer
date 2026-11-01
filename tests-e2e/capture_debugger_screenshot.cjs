const { chromium } = require('playwright')
const path = require('path')

async function capture() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://127.0.0.1:5173/workspace', { waitUntil: 'networkidle' })
  await page.selectOption('select[aria-label="Select Python preset"]', 'factorial-recursion')
  await page.click('button[aria-label="Run Python code"]')
  await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
  await page.waitForTimeout(600)

  // Toggle breakpoint on line 4
  await page.evaluate(() => window.useTraceStore.getState().toggleBreakpoint(4))
  // Advance to breakpoint
  await page.click('[data-testid="btn-continue"]')
  await page.waitForTimeout(400)

  // Capture workspace with debugger controls and breakpoint
  const screenshotPath = path.resolve('tests-e2e', 'debugger_controls_preview.png')
  await page.screenshot({ path: screenshotPath })
  console.log('Screenshot saved to:', screenshotPath)

  await browser.close()
}

capture()
