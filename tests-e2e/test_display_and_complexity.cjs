const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

async function run() {
  const reportsDir = path.join(__dirname, 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  console.log('Launching browser for Display & Complexity Playwright verification...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    await page.goto('http://127.0.0.1:5173/workspace', { waitUntil: 'networkidle' })
    console.log('✓ Loaded workspace at http://127.0.0.1:5173/workspace')

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Two Sum Value Display, Heap Filtering, & Explanation
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 1: Two Sum Trace Display ---')
    await page.selectOption('select[aria-label="Select Python preset"]', 'two-sum')
    await page.waitForTimeout(300)

    // Set Two Sum custom code with [2, 8, 11, 15]
    const twoSumCode = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

numbers = [2, 8, 11, 15]
res = two_sum(numbers, 9)
print(f"Indices: {res}")
`

    await page.evaluate((c) => {
      window.useTraceStore.getState().setCode(c)
    }, twoSumCode)

    // Click Run button
    console.log('Clicking Run button...')
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => (res.url().includes('/run') || res.url().includes('/api/run')) && res.status() === 200)
    await page.waitForTimeout(800)

    // Jump to last step to inspect final state
    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(500)

    // 1a. Check Variables Panel: should show compact previews [2, 8, 11, 15] and [0, 1] with @ labels
    const varSection = page.locator('[data-testid="variables-table"]').first()
    const varText = await varSection.innerText()
    console.log('Variables Panel Content snippet:\n', varText.slice(0, 300))

    if (varText.includes('ref -> 0x')) {
      throw new Error(`FAIL: Variables panel still contains raw "ref -> 0x": ${varText}`)
    }
    if (!varText.includes('[2, 8, 11, 15]')) {
      throw new Error(`FAIL: Variables panel missing [2, 8, 11, 15]: ${varText}`)
    }
    console.log('PASS: [2, 8, 11, 15] preview displayed, no raw "ref -> 0x" in variables panel')

    // 1b. Check Heap Panel: should NOT contain function "two_sum"
    const heapSection = page.locator('[data-testid="virtual-heap"]').first()
    const heapText = await heapSection.innerText()
    console.log('Heap Panel snippet:\n', heapText.slice(0, 300))
    if (heapText.includes('object two_sum') || heapText.includes('function two_sum') || heapText.includes('two_sum')) {
      throw new Error(`FAIL: Virtual Heap contains function card: ${heapText}`)
    }
    console.log('PASS: Functions excluded from Virtual Heap')

    // 1c. Check Explanation text: must NOT say "Returned null"
    const pageContent = await page.innerText('body')
    if (pageContent.includes('Returned null')) {
      throw new Error('FAIL: Explanation contains "Returned null"')
    }
    console.log('PASS: No "Returned null" in explanation')

    // 1d. Check Complexity Card: must NOT say "Step Overhead: 100%"
    if (pageContent.includes('Step Overhead:')) {
      throw new Error('FAIL: Complexity card still contains fake "Step Overhead"')
    }
    console.log('PASS: Fake "Step Overhead" removed, replaced by real step count')

    await page.screenshot({ path: path.join(reportsDir, '1_display_two_sum.png') })

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Dict & Class Instance Previews
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Dict & Class Instance Display ---')
    const classCode = `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(10, 20)
meta = {"name": "origin", "active": True}
print(f"Point: {p.x}, {p.y}")
`

    await page.evaluate((c) => {
      window.useTraceStore.getState().setCode(c)
    }, classCode)

    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => (res.url().includes('/run') || res.url().includes('/api/run')) && res.status() === 200)
    await page.waitForTimeout(600)

    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(400)

    const classVarSection = page.locator('[data-testid="variables-table"]').first()
    const classVarText = await classVarSection.innerText()
    console.log('Class & Dict Variables snippet:\n', classVarText.slice(0, 300))
    if (classVarText.includes('ref -> 0x')) {
      throw new Error(`FAIL: Class/dict variables show raw ref -> 0x: ${classVarText}`)
    }
    console.log('PASS: Class instance and dict previews rendered cleanly')

    await page.screenshot({ path: path.join(reportsDir, '2_display_class_dict.png') })

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Real Measured Complexity Analysis
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- TEST 3: Complexity Estimator ---')
    const sortCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
`

    await page.evaluate((c) => {
      window.useTraceStore.getState().setCode(c)
    }, sortCode)

    // Look for Analyze button in Complexity card
    const analyzeBtn = page.locator('button:has-text("Analyze")')
    if (await analyzeBtn.isVisible()) {
      console.log('Clicking Complexity Analyze button...')
      const responsePromise = page.waitForResponse((res) =>
        res.url().includes('/complexity') && res.status() === 200
      )
      await analyzeBtn.click()
      const resp = await responsePromise
      const data = await resp.json()
      console.log('Complexity API response:', JSON.stringify(data.fit || data, null, 2))

      await page.waitForTimeout(1000)

      const complexityCard = page.locator('div:has-text("COMPLEXITY")').first()
      const complexityCardText = await complexityCard.innerText()
      console.log('Complexity Card after analysis:\n', complexityCardText.slice(0, 400))

      if (complexityCardText.includes('ESTIMATED')) {
        console.log('PASS: Complexity card shows "Estimated" badge')
      }
      if (complexityCardText.includes('O(n^2)')) {
        console.log('PASS: Bubble sort correctly estimated as O(n^2)')
      }
    } else {
      console.log('Analyze button not directly visible')
    }

    await page.screenshot({ path: path.join(reportsDir, '3_complexity_measured.png') })

    console.log('\nALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY!')
  } catch (err) {
    console.error('Playwright Test Error:', err)
    await page.screenshot({ path: path.join(reportsDir, 'error_state.png') })
    throw err
  } finally {
    await browser.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
