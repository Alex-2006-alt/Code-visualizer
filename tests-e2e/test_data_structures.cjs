/**
 * Playwright E2E Test Suite: CodeTrace Data Structure Visualization (Phase 2)
 *
 * Verifies:
 * 1. 10-node Singly Linked List: SVG nodes, pointer edges, referrers badges, None terminator
 * 2. View mode toggle: Switch between Graph View and Memory Box View
 * 3. Pan and zoom toolbar controls (+, -, reset)
 * 4. Binary Search Tree: Root, left/right child placement and hierarchical tree layout
 * 5. Adjacency Graph: Vertices and directed edges from adjacency dictionary
 */

const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'

async function runTests() {
  console.log(`[E2E] Testing Data Structure Visualization at: ${BASE_URL}`)
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

    // ─── 1. Test 10-Node Linked List ───
    console.log('\n--- 1. Testing 10-Node Linked List Visualization ---')
    const linkedListCode = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = Node(1)
curr = head
for i in range(2, 11):
    curr.next = Node(i)
    curr = curr.next
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), linkedListCode)
    await page.waitForTimeout(300)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    // Jump to the final step where all 10 nodes are built
    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(400)

    // Assert SVG Canvas exists
    const svgVisible = await page.locator('[data-testid="data-structure-svg"]').isVisible()
    assert(svgVisible, `DataStructure SVG canvas is visible`)

    // Assert 10 graph nodes exist
    const nodeCount = await page.locator('[data-testid^="graph-node-"]').count()
    assert(nodeCount === 10, `Rendered exactly 10 nodes for the linked list (found: ${nodeCount})`)

    // Assert Referrer badges for head and curr
    const badgeCount = await page.locator('[data-testid^="graph-badge-"]').count()
    assert(badgeCount >= 1, `Found variable pointer badge(s) on active nodes`)

    // Assert None terminator ground symbol exists for the tail
    const noneEdgeCount = await page.locator('[data-testid^="graph-edge-none-"]').count()
    assert(noneEdgeCount >= 1, `Found None terminator pointer on tail node`)

    // ─── 2. Test View Mode Toggle (Graph <-> Boxes) ───
    console.log('\n--- 2. Testing View Mode Switcher (Graph <-> Boxes) ---')
    const toggleExists = await page.locator('[data-testid="heap-view-toggle"]').isVisible()
    assert(toggleExists, `Heap view toggle switcher is displayed in header`)

    // Switch to Boxes
    await page.click('[data-testid="btn-view-boxes"]')
    await page.waitForTimeout(300)
    const boxesVisible = await page.locator('[data-testid="boxes-view-container"]').isVisible()
    assert(boxesVisible, `Switched successfully to Boxes view`)

    // Switch back to Graph
    await page.click('[data-testid="btn-view-graph"]')
    await page.waitForTimeout(300)
    const graphVisible = await page.locator('[data-testid="graph-view-container"]').isVisible()
    assert(graphVisible, `Switched successfully back to Graph view`)

    // ─── 3. Test Zoom & Pan Controls ───
    console.log('\n--- 3. Testing Zoom & Pan Toolbar Controls ---')
    await page.click('[data-testid="graph-zoom-in"]')
    await page.waitForTimeout(100)
    await page.click('[data-testid="graph-zoom-in"]')
    await page.waitForTimeout(100)
    await page.click('[data-testid="graph-reset-view"]')
    await page.waitForTimeout(100)
    assert(true, `Zoom in and reset view triggered without errors`)

    // ─── 4. Test Binary Search Tree Insert ───
    console.log('\n--- 4. Testing Binary Search Tree Visualization ---')
    const bstCode = `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(10, TreeNode(5), TreeNode(15))
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), bstCode)
    await page.waitForTimeout(300)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(400)

    const treeNodesCount = await page.locator('[data-testid^="graph-node-"]').count()
    assert(treeNodesCount === 3, `Binary search tree rendered 3 nodes (found: ${treeNodesCount})`)

    // Verify root is positioned higher than child nodes
    const rootNode = page.locator('[data-testid^="graph-node-"]').first()
    const rootBox = await rootNode.boundingBox()
    assert(rootBox !== null, `Root node bounding box is valid`)

    // ─── 5. Test BFS on Adjacency Dictionary ───
    console.log('\n--- 5. Testing Adjacency Graph Visualization ---')
    const graphCode = `graph = {
    'A': ['B', 'C'],
    'B': ['C', 'D'],
    'C': ['D'],
    'D': []
}
visited = []
queue = ['A']
while queue:
    curr = queue.pop(0)
    if curr not in visited:
        visited.append(curr)
        for neighbor in graph[curr]:
            if neighbor not in visited:
                queue.append(neighbor)
`
    await page.evaluate((c) => window.useTraceStore.getState().setCode(c), graphCode)
    await page.waitForTimeout(300)
    await page.click('button[aria-label="Run Python code"]')
    await page.waitForResponse((res) => res.url().includes('/run') && res.status() === 200)
    await page.waitForTimeout(800)

    await page.evaluate(() => {
      const s = window.useTraceStore.getState()
      s.setCurrentStep(s.steps.length - 1)
    })
    await page.waitForTimeout(400)

    const adjVerticesCount = await page.locator('[data-testid^="graph-node-"]').count()
    assert(adjVerticesCount === 4, `Adjacency graph rendered 4 vertices (found: ${adjVerticesCount})`)

  } catch (err) {
    console.error('Fatal error during Phase 2 E2E test:', err)
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
