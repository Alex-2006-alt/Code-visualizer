const { chromium } = require('playwright')
const path = require('path')

async function capture() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://127.0.0.1:5173/workspace', { waitUntil: 'networkidle' })

  // 1. Linked list screenshot
  const llCode = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = Node(1, Node(2, Node(3, Node(4, Node(5)))))
curr = head
`
  await page.evaluate((c) => window.useTraceStore.getState().setCode(c), llCode)
  await page.waitForTimeout(200)
  await page.click('button[aria-label="Run Python code"]')
  await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
  await page.waitForTimeout(600)

  await page.evaluate(() => {
    const s = window.useTraceStore.getState()
    s.setCurrentStep(s.steps.length - 1)
  })
  await page.waitForTimeout(400)

  const shotPath = path.resolve('tests-e2e', 'data_structure_graph_preview.png')
  await page.screenshot({ path: shotPath })
  console.log('Saved screenshot to:', shotPath)

  await browser.close()
}

capture()
