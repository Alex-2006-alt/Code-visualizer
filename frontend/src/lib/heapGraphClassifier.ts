import { HeapObject } from '@/types/trace'

export type GraphKind =
  | 'linked_list'
  | 'doubly_linked_list'
  | 'binary_tree'
  | 'adjacency_graph'
  | 'none'

export interface GraphNode {
  id: string
  label: string
  valDisplay: string
  className?: string
  rawObject?: HeapObject
  referrers: string[]
  pointers: Record<string, string | null>
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string | null // null indicates None / null terminator pointer
  label?: string
  kind?: 'forward' | 'backward' | 'cycle' | 'none_pointer'
  isMutated?: boolean
}

export interface ClassifiedGraph {
  kind: GraphKind
  title: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  rootIds: string[]
  hasCycle: boolean
}

const HEX_ADDR_REGEX = /^0x[0-9a-fA-F]+$/

/**
 * Pure function to classify a heap object graph into a semantic data structure
 * (linked list, doubly linked list, binary tree, or adjacency graph).
 * Returns kind: 'none' if the heap does not match any connected structure.
 */
export function classifyHeapGraph(
  heapObjects: HeapObject[] = [],
  locals: Record<string, unknown> = {}
): ClassifiedGraph {
  if (!heapObjects || heapObjects.length === 0) {
    return {
      kind: 'none',
      title: 'Empty Heap',
      nodes: [],
      edges: [],
      rootIds: [],
      hasCycle: false,
    }
  }

  // 1. Build map of address -> referrers from locals
  const referrersByAddr = new Map<string, string[]>()
  for (const [varName, val] of Object.entries(locals)) {
    if (typeof val === 'string' && val.startsWith('0x')) {
      const lower = val.toLowerCase()
      const existing = referrersByAddr.get(lower) || []
      existing.push(varName)
      referrersByAddr.set(lower, existing)
    }
  }

  const addrToObj = new Map<string, HeapObject>()
  for (const obj of heapObjects) {
    addrToObj.set(obj.address.toLowerCase(), obj)
  }

  // 2. Check for Adjacency Structure (dict of lists or list of lists used as graph)
  const adjacencyGraph = detectAdjacencyGraph(heapObjects, addrToObj, referrersByAddr)
  if (adjacencyGraph) {
    return adjacencyGraph
  }

  // 3. Inspect Instance Objects for Linked Lists and Trees
  const instances = heapObjects.filter(
    (obj) =>
      obj.type === 'instance' ||
      (typeof obj.value === 'object' && obj.value !== null && (obj.value as any)?.__class__)
  )

  if (instances.length > 0) {
    // 3a. Check for Binary Tree (left/right or children of length <= 2)
    const treeGraph = detectBinaryTree(instances, addrToObj, referrersByAddr)
    if (treeGraph) {
      return treeGraph
    }

    // 3b. Check for Doubly Linked List (next + prev)
    const dllGraph = detectDoublyLinkedList(instances, addrToObj, referrersByAddr)
    if (dllGraph) {
      return dllGraph
    }

    // 3c. Check for Singly Linked List (next)
    const sllGraph = detectSinglyLinkedList(instances, addrToObj, referrersByAddr)
    if (sllGraph) {
      return sllGraph
    }
  }

  return {
    kind: 'none',
    title: 'Standard Heap Box View',
    nodes: [],
    edges: [],
    rootIds: [],
    hasCycle: false,
  }
}

// ─── HELPER: Singly Linked List Detection ───
function detectSinglyLinkedList(
  instances: HeapObject[],
  addrToObj: Map<string, HeapObject>,
  referrersByAddr: Map<string, string[]>
): ClassifiedGraph | null {
  // Check if at least one instance has a field pointing to another instance or None
  // with field name like 'next', 'nxt', 'next_node' or single pointer field
  let pointerFieldName: string | null = null

  for (const inst of instances) {
    const fields = getInstanceFields(inst)
    for (const [k, v] of Object.entries(fields)) {
      if (k.toLowerCase().includes('next') || k === 'nxt') {
        pointerFieldName = k
        break
      }
    }
    if (pointerFieldName) break
  }

  // Fallback: check if exactly 1 field contains address of another instance
  if (!pointerFieldName) {
    for (const inst of instances) {
      const fields = getInstanceFields(inst)
      const refFields = Object.entries(fields).filter(
        ([k, v]) =>
          k !== 'prev' &&
          k !== 'left' &&
          k !== 'right' &&
          typeof v === 'string' &&
          addrToObj.has(v.toLowerCase())
      )
      if (refFields.length === 1) {
        pointerFieldName = refFields[0][0]
        break
      }
    }
  }

  if (!pointerFieldName) return null

  // Extract nodes and edges
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const inDegree = new Map<string, number>()
  let hasCycle = false

  for (const inst of instances) {
    const addr = inst.address.toLowerCase()
    inDegree.set(addr, inDegree.get(addr) || 0)
    const fields = getInstanceFields(inst)
    const valDisplay = extractNodeValueDisplay(fields)
    const referrers = referrersByAddr.get(addr) || []

    const targetVal = fields[pointerFieldName]
    const pointers: Record<string, string | null> = {}

    if (targetVal === null || targetVal === undefined) {
      pointers[pointerFieldName] = null
      edges.push({
        id: `edge-${addr}-none`,
        from: addr,
        to: null,
        label: pointerFieldName,
        kind: 'none_pointer',
      })
    } else if (typeof targetVal === 'string' && targetVal.startsWith('0x')) {
      const targetLower = targetVal.toLowerCase()
      pointers[pointerFieldName] = targetLower
      inDegree.set(targetLower, (inDegree.get(targetLower) || 0) + 1)
      edges.push({
        id: `edge-${addr}-${targetLower}`,
        from: addr,
        to: targetLower,
        label: pointerFieldName,
        kind: 'forward',
      })
    }

    nodes.push({
      id: addr,
      label: inst.className || 'Node',
      valDisplay,
      className: inst.className,
      rawObject: inst,
      referrers,
      pointers,
      x: 0,
      y: 0,
    })
  }

  // Determine root: prefer node pointed by 'head' local, else in-degree 0
  let headAddr: string | null = null
  for (const [addr, refs] of referrersByAddr.entries()) {
    if (refs.some((r) => r.toLowerCase().includes('head'))) {
      headAddr = addr
      break
    }
  }
  if (!headAddr) {
    for (const [addr, deg] of inDegree.entries()) {
      if (deg === 0) {
        headAddr = addr
        break
      }
    }
  }
  if (!headAddr && nodes.length > 0) {
    headAddr = nodes[0].id
    hasCycle = true
  }

  // Compute horizontal linear layout
  const visited = new Set<string>()
  let current: string | null = headAddr
  let x = 60
  const y = 80
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  while (current && nodeMap.has(current) && !visited.has(current)) {
    visited.add(current)
    const n = nodeMap.get(current)!
    n.x = x
    n.y = y
    x += 160
    current = n.pointers[pointerFieldName] || null
  }

  // Handle any cycle detection in edges
  if (current && visited.has(current)) {
    hasCycle = true
    const cycleEdge = edges.find((e) => e.to === current)
    if (cycleEdge) {
      cycleEdge.kind = 'cycle'
    }
  }

  // Lay out any disconnected nodes on a secondary row
  let discX = 60
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      n.x = discX
      n.y = y + 100
      discX += 160
    }
  }

  return {
    kind: 'linked_list',
    title: `Singly Linked List (${nodes.length} nodes)`,
    nodes,
    edges,
    rootIds: headAddr ? [headAddr] : [],
    hasCycle,
  }
}

// ─── HELPER: Doubly Linked List Detection ───
function detectDoublyLinkedList(
  instances: HeapObject[],
  addrToObj: Map<string, HeapObject>,
  referrersByAddr: Map<string, string[]>
): ClassifiedGraph | null {
  let hasNext = false
  let hasPrev = false

  for (const inst of instances) {
    const fields = getInstanceFields(inst)
    for (const k of Object.keys(fields)) {
      const lower = k.toLowerCase()
      if (lower.includes('next') || lower === 'nxt') hasNext = true
      if (lower.includes('prev') || lower === 'prv') hasPrev = true
    }
    if (hasNext && hasPrev) break
  }

  if (!hasNext || !hasPrev) return null

  // Re-use linked list extractor but with both forward and backward edges
  const sll = detectSinglyLinkedList(instances, addrToObj, referrersByAddr)
  if (!sll) return null

  // Add backward edges for prev
  for (const inst of instances) {
    const addr = inst.address.toLowerCase()
    const fields = getInstanceFields(inst)
    const prevVal = fields['prev'] ?? fields['prv']

    if (prevVal === null) {
      sll.edges.push({
        id: `edge-${addr}-prev-none`,
        from: addr,
        to: null,
        label: 'prev',
        kind: 'none_pointer',
      })
    } else if (typeof prevVal === 'string' && prevVal.startsWith('0x')) {
      const targetLower = prevVal.toLowerCase()
      sll.edges.push({
        id: `edge-${addr}-prev-${targetLower}`,
        from: addr,
        to: targetLower,
        label: 'prev',
        kind: 'backward',
      })
    }
  }

  return {
    ...sll,
    kind: 'doubly_linked_list',
    title: `Doubly Linked List (${sll.nodes.length} nodes)`,
  }
}

// ─── HELPER: Binary Tree Detection ───
function detectBinaryTree(
  instances: HeapObject[],
  addrToObj: Map<string, HeapObject>,
  referrersByAddr: Map<string, string[]>
): ClassifiedGraph | null {
  let hasLeftOrRight = false

  for (const inst of instances) {
    const fields = getInstanceFields(inst)
    for (const k of Object.keys(fields)) {
      const lower = k.toLowerCase()
      if (lower === 'left' || lower === 'right') {
        hasLeftOrRight = true
        break
      }
    }
    if (hasLeftOrRight) break
  }

  if (!hasLeftOrRight) return null

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const inDegree = new Map<string, number>()
  const nodeMap = new Map<string, GraphNode>()

  for (const inst of instances) {
    const addr = inst.address.toLowerCase()
    inDegree.set(addr, inDegree.get(addr) || 0)
    const fields = getInstanceFields(inst)
    const valDisplay = extractNodeValueDisplay(fields)
    const referrers = referrersByAddr.get(addr) || []

    const pointers: Record<string, string | null> = {}

    for (const side of ['left', 'right']) {
      const target = fields[side]
      if (target === null || target === undefined) {
        pointers[side] = null
        edges.push({
          id: `edge-${addr}-${side}-none`,
          from: addr,
          to: null,
          label: side,
          kind: 'none_pointer',
        })
      } else if (typeof target === 'string' && target.startsWith('0x')) {
        const targetLower = target.toLowerCase()
        pointers[side] = targetLower
        inDegree.set(targetLower, (inDegree.get(targetLower) || 0) + 1)
        edges.push({
          id: `edge-${addr}-${side}-${targetLower}`,
          from: addr,
          to: targetLower,
          label: side,
          kind: 'forward',
        })
      }
    }

    const gn: GraphNode = {
      id: addr,
      label: inst.className || 'TreeNode',
      valDisplay,
      className: inst.className,
      rawObject: inst,
      referrers,
      pointers,
      x: 0,
      y: 0,
    }
    nodes.push(gn)
    nodeMap.set(addr, gn)
  }

  // Find root: prefer 'root' in locals, or in-degree 0
  let rootAddr: string | null = null
  for (const [addr, refs] of referrersByAddr.entries()) {
    if (refs.some((r) => r.toLowerCase().includes('root'))) {
      rootAddr = addr
      break
    }
  }
  if (!rootAddr) {
    for (const [addr, deg] of inDegree.entries()) {
      if (deg === 0) {
        rootAddr = addr
        break
      }
    }
  }
  if (!rootAddr && nodes.length > 0) {
    rootAddr = nodes[0].id
  }

  // Tree hierarchical layout
  if (rootAddr && nodeMap.has(rootAddr)) {
    layoutTree(rootAddr, nodeMap, 300, 50, 160)
  }

  return {
    kind: 'binary_tree',
    title: `Binary Tree (${nodes.length} nodes)`,
    nodes,
    edges,
    rootIds: rootAddr ? [rootAddr] : [],
    hasCycle: false,
  }
}

function layoutTree(
  nodeId: string,
  nodeMap: Map<string, GraphNode>,
  x: number,
  y: number,
  spread: number
) {
  const node = nodeMap.get(nodeId)
  if (!node) return
  node.x = x
  node.y = y

  const leftId = node.pointers['left']
  if (leftId && nodeMap.has(leftId)) {
    layoutTree(leftId, nodeMap, x - spread, y + 80, Math.max(50, spread / 2))
  }

  const rightId = node.pointers['right']
  if (rightId && nodeMap.has(rightId)) {
    layoutTree(rightId, nodeMap, x + spread, y + 80, Math.max(50, spread / 2))
  }
}

// ─── HELPER: Adjacency Structure Detection ───
function detectAdjacencyGraph(
  heapObjects: HeapObject[],
  addrToObj: Map<string, HeapObject>,
  _referrersByAddr: Map<string, string[]>
): ClassifiedGraph | null {
  // Look for dict of lists (e.g. { 'A': ['B', 'C'] }) or dict pointing to list addresses
  const dictObj = heapObjects.find(
    (obj) =>
      obj.type === 'dict' &&
      typeof obj.value === 'object' &&
      obj.value !== null &&
      !Array.isArray(obj.value)
  )

  if (!dictObj) return null

  const dictVal = dictObj.value as Record<string, unknown>
  const entries = Object.entries(dictVal)
  if (entries.length < 2) return null

  // Resolve neighbors for each entry (either direct array or address to a list HeapObject)
  const resolvedNeighbors = new Map<string, any[]>()
  for (const [key, v] of entries) {
    if (Array.isArray(v)) {
      resolvedNeighbors.set(key, v)
    } else if (typeof v === 'string' && addrToObj.has(v.toLowerCase())) {
      const childObj = addrToObj.get(v.toLowerCase())
      if (childObj && Array.isArray(childObj.value)) {
        resolvedNeighbors.set(key, childObj.value)
      }
    }
  }

  // Must have resolved neighbors for all entries in the dict
  if (resolvedNeighbors.size !== entries.length) return null

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const count = entries.length
  const centerX = 260
  const centerY = 160
  const radius = Math.min(180, Math.max(100, count * 26))

  entries.forEach(([key], idx) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    const nodeId = `graph-${key}`
    const neighbors = resolvedNeighbors.get(key) || []

    nodes.push({
      id: nodeId,
      label: `Node ${key}`,
      valDisplay: String(key),
      referrers: [],
      pointers: {},
      x,
      y,
    })

    for (const n of neighbors) {
      edges.push({
        id: `edge-${key}-${n}`,
        from: nodeId,
        to: `graph-${n}`,
        kind: 'forward',
      })
    }
  })

  return {
    kind: 'adjacency_graph',
    title: `Adjacency Graph (${nodes.length} vertices)`,
    nodes,
    edges,
    rootIds: nodes.length > 0 ? [nodes[0].id] : [],
    hasCycle: false,
  }
}

// ─── HELPER: Extract fields from instance ───
function getInstanceFields(obj: HeapObject): Record<string, any> {
  const val = obj.value as any
  if (val && typeof val === 'object') {
    if (val.fields && typeof val.fields === 'object') {
      return val.fields
    }
    return val
  }
  return {}
}

function extractNodeValueDisplay(fields: Record<string, any>): string {
  if (fields['val'] !== undefined) return String(fields['val'])
  if (fields['value'] !== undefined) return String(fields['value'])
  if (fields['data'] !== undefined) return String(fields['data'])
  if (fields['key'] !== undefined) return String(fields['key'])
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'number' || typeof v === 'string') {
      return `${k}: ${v}`
    }
  }
  return 'Node'
}
