import { describe, it, expect } from 'vitest'
import { classifyHeapGraph } from '../lib/heapGraphClassifier'
import { HeapObject } from '../types/trace'

describe('Heap Graph Classifier (classifyHeapGraph)', () => {
  // 1. Empty heap
  it('1. correctly returns kind: "none" for an empty heap', () => {
    const result = classifyHeapGraph([], {})
    expect(result.kind).toBe('none')
    expect(result.nodes.length).toBe(0)
    expect(result.edges.length).toBe(0)
  })

  // 2. Flat primitive collections
  it('2. falls back to kind: "none" for flat non-graph collections', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x1',
        type: 'list',
        address: '0x1',
        value: [10, 20, 30],
        label: 'numbers',
      },
      {
        id: 'heap-0x2',
        type: 'dict',
        address: '0x2',
        value: { name: 'Alice', age: 30 },
        label: 'user',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { numbers: '0x1', user: '0x2' })
    expect(result.kind).toBe('none')
  })

  // 3. 3-node Singly Linked List
  it('3. classifies a 3-node singly linked list correctly', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x10',
        type: 'instance',
        address: '0x10',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 1, next: '0x20' } },
        label: 'head',
      },
      {
        id: 'heap-0x20',
        type: 'instance',
        address: '0x20',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 2, next: '0x30' } },
        label: 'Node',
      },
      {
        id: 'heap-0x30',
        type: 'instance',
        address: '0x30',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 3, next: null } },
        label: 'Node',
      },
    ]
    const locals = { head: '0x10', curr: '0x20' }
    const result = classifyHeapGraph(heapObjects, locals)

    expect(result.kind).toBe('linked_list')
    expect(result.nodes.length).toBe(3)
    expect(result.rootIds).toEqual(['0x10'])
    expect(result.hasCycle).toBe(false)

    // Check node referrers
    const node1 = result.nodes.find((n) => n.id === '0x10')
    const node2 = result.nodes.find((n) => n.id === '0x20')
    expect(node1?.referrers).toContain('head')
    expect(node2?.referrers).toContain('curr')

    // Check None terminator edge on last node
    const noneEdge = result.edges.find((e) => e.kind === 'none_pointer')
    expect(noneEdge).toBeDefined()
    expect(noneEdge?.from).toBe('0x30')
    expect(noneEdge?.to).toBeNull()
  })

  // 4. Cyclic Singly Linked List
  it('4. detects a cycle in a cyclic linked list', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x10',
        type: 'instance',
        address: '0x10',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 1, next: '0x20' } },
        label: 'head',
      },
      {
        id: 'heap-0x20',
        type: 'instance',
        address: '0x20',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 2, next: '0x10' } }, // Points back to 0x10
        label: 'Node',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { head: '0x10' })

    expect(result.kind).toBe('linked_list')
    expect(result.hasCycle).toBe(true)
    const cycleEdge = result.edges.find((e) => e.kind === 'cycle')
    expect(cycleEdge).toBeDefined()
  })

  // 5. Disconnected linked list components
  it('5. handles disconnected linked list components gracefully', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x10',
        type: 'instance',
        address: '0x10',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 'A', next: null } },
        label: 'listA',
      },
      {
        id: 'heap-0x20',
        type: 'instance',
        address: '0x20',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 'B', next: null } },
        label: 'listB',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { listA: '0x10', listB: '0x20' })
    expect(result.kind).toBe('linked_list')
    expect(result.nodes.length).toBe(2)
  })

  // 6. Doubly Linked List
  it('6. classifies a doubly linked list with next and prev pointers', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x1',
        type: 'instance',
        address: '0x1',
        className: 'DNode',
        value: { __class__: 'DNode', fields: { val: 10, next: '0x2', prev: null } },
        label: 'head',
      },
      {
        id: 'heap-0x2',
        type: 'instance',
        address: '0x2',
        className: 'DNode',
        value: { __class__: 'DNode', fields: { val: 20, next: null, prev: '0x1' } },
        label: 'tail',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { head: '0x1', tail: '0x2' })
    expect(result.kind).toBe('doubly_linked_list')
    expect(result.nodes.length).toBe(2)

    const prevEdges = result.edges.filter((e) => e.label === 'prev')
    expect(prevEdges.length).toBeGreaterThan(0)
  })

  // 7. Binary Tree
  it('7. classifies a balanced binary search tree with left and right children', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x100',
        type: 'instance',
        address: '0x100',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 20, left: '0x50', right: '0x300' } },
        label: 'root',
      },
      {
        id: 'heap-0x50',
        type: 'instance',
        address: '0x50',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 10, left: null, right: null } },
        label: 'TreeNode',
      },
      {
        id: 'heap-0x300',
        type: 'instance',
        address: '0x300',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 30, left: null, right: null } },
        label: 'TreeNode',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { root: '0x100' })

    expect(result.kind).toBe('binary_tree')
    expect(result.nodes.length).toBe(3)
    expect(result.rootIds).toEqual(['0x100'])

    const rootNode = result.nodes.find((n) => n.id === '0x100')
    const leftNode = result.nodes.find((n) => n.id === '0x50')
    const rightNode = result.nodes.find((n) => n.id === '0x300')

    // Root is centered above children
    expect(rootNode?.y).toBeLessThan(leftNode?.y || 0)
    expect(rootNode?.y).toBeLessThan(rightNode?.y || 0)
    expect(leftNode?.x).toBeLessThan(rootNode?.x || 0)
    expect(rightNode?.x).toBeGreaterThan(rootNode?.x || 0)
  })

  // 8. Skewed Binary Tree
  it('8. classifies a left-skewed binary tree', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x3',
        type: 'instance',
        address: '0x3',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 3, left: '0x2', right: null } },
        label: 'root',
      },
      {
        id: 'heap-0x2',
        type: 'instance',
        address: '0x2',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 2, left: '0x1', right: null } },
        label: 'TreeNode',
      },
      {
        id: 'heap-0x1',
        type: 'instance',
        address: '0x1',
        className: 'TreeNode',
        value: { __class__: 'TreeNode', fields: { val: 1, left: null, right: null } },
        label: 'TreeNode',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { root: '0x3' })
    expect(result.kind).toBe('binary_tree')
    expect(result.nodes.length).toBe(3)
  })

  // 9. Adjacency Graph
  it('9. classifies an adjacency dictionary of lists as an adjacency_graph', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x999',
        type: 'dict',
        address: '0x999',
        value: {
          A: ['B', 'C'],
          B: ['C'],
          C: ['A'],
        },
        label: 'graph',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { graph: '0x999' })

    expect(result.kind).toBe('adjacency_graph')
    expect(result.nodes.length).toBe(3)
    expect(result.edges.length).toBe(4) // A->B, A->C, B->C, C->A
  })

  // 10. Single Node Linked List
  it('10. classifies a single node pointing to None as a linked_list', () => {
    const heapObjects: HeapObject[] = [
      {
        id: 'heap-0x42',
        type: 'instance',
        address: '0x42',
        className: 'Node',
        value: { __class__: 'Node', fields: { val: 42, next: null } },
        label: 'head',
      },
    ]
    const result = classifyHeapGraph(heapObjects, { head: '0x42' })
    expect(result.kind).toBe('linked_list')
    expect(result.nodes.length).toBe(1)
    expect(result.edges.length).toBe(1)
    expect(result.edges[0].kind).toBe('none_pointer')
  })
})
