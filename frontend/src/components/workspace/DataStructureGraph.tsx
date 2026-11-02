import React, { useState, useRef, useCallback } from 'react'
import { ClassifiedGraph, GraphNode, GraphEdge } from '@/lib/heapGraphClassifier'

interface DataStructureGraphProps {
  graph: ClassifiedGraph
  addressLabels?: Map<string, string>
  mutatedVariable?: string
  className?: string
}

export const DataStructureGraph: React.FC<DataStructureGraphProps> = ({
  graph,
  addressLabels,
  className = '',
}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Handle Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      })
    },
    [isDragging]
  )

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    setZoom((prevZoom) => Math.max(0.4, Math.min(2.5, prevZoom * zoomFactor)))
  }

  const handleReset = () => {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  const nodeMap = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]))

  // Node dimensions
  const NODE_WIDTH = 110
  const NODE_HEIGHT = 65

  return (
    <div
      className={`relative w-full h-full min-h-[220px] bg-[#0A0D14] overflow-hidden select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      data-testid="data-structure-graph-canvas"
    >
      {/* Graph Toolbar Overlay */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-glass-sunken/80 backdrop-blur-md px-2 py-1 rounded-control border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="w-6 h-6 rounded bg-glass border border-border text-text-2 hover:text-text flex items-center justify-center text-xs cursor-pointer"
          aria-label="Zoom in"
          data-testid="graph-zoom-in"
        >
          +
        </button>
        <span className="text-[10px] font-mono text-text-3 px-1 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="w-6 h-6 rounded bg-glass border border-border text-text-2 hover:text-text flex items-center justify-center text-xs cursor-pointer"
          aria-label="Zoom out"
          data-testid="graph-zoom-out"
        >
          -
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-2 py-0.5 rounded bg-glass border border-border text-text-2 hover:text-text text-[10px] font-mono cursor-pointer ml-1"
          aria-label="Reset zoom and pan"
          data-testid="graph-reset-view"
        >
          Reset
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        data-testid="data-structure-svg"
      >
        <defs>
          {/* Forward Arrow Marker (Sage/Accent) */}
          <marker
            id="graph-arrow-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7FA8D1" />
          </marker>

          {/* Backward Arrow Marker (Sage) */}
          <marker
            id="graph-arrow-prev"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8DA68E" />
          </marker>

          {/* Cycle Arrow Marker (Amber) */}
          <marker
            id="graph-arrow-cycle"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FBBF24" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Render Edges */}
          {graph.edges.map((edge) => {
            return (
              <RenderEdge
                key={edge.id}
                edge={edge}
                nodeMap={nodeMap}
                nodeWidth={NODE_WIDTH}
                nodeHeight={NODE_HEIGHT}
              />
            )
          })}

          {/* 2. Render Nodes */}
          {graph.nodes.map((node) => {
            const refLabel = addressLabels?.get(node.id.toLowerCase())
            return (
              <RenderNode
                key={node.id}
                node={node}
                refLabel={refLabel}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// ─── SUBCOMPONENT: Render Edge ───
interface RenderEdgeProps {
  edge: GraphEdge
  nodeMap: Map<string, GraphNode>
  nodeWidth: number
  nodeHeight: number
}

const RenderEdge: React.FC<RenderEdgeProps> = ({
  edge,
  nodeMap,
  nodeWidth,
  nodeHeight,
}) => {
  const fromNode = nodeMap.get(edge.from)
  if (!fromNode) return null

  // None pointer (ground symbol)
  if (edge.to === null || edge.kind === 'none_pointer') {
    const startX = fromNode.x + nodeWidth
    const startY = fromNode.y + nodeHeight / 2
    const endX = startX + 35
    const endY = startY

    return (
      <g key={edge.id} data-testid={`graph-edge-none-${edge.from}`}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#55607A"
          strokeWidth="1.5"
        />
        {/* Ground symbol (3 descending lines) */}
        <line
          x1={endX}
          y1={endY - 6}
          x2={endX}
          y2={endY + 6}
          stroke="#7FA8D1"
          strokeWidth="2"
        />
        <line
          x1={endX + 3}
          y1={endY - 4}
          x2={endX + 3}
          y2={endY + 4}
          stroke="#7FA8D1"
          strokeWidth="1.5"
        />
        <line
          x1={endX + 6}
          y1={endY - 2}
          x2={endX + 6}
          y2={endY + 2}
          stroke="#7FA8D1"
          strokeWidth="1"
        />
        <text
          x={startX + 8}
          y={startY - 6}
          fill="#55607A"
          fontSize="9"
          fontFamily="monospace"
        >
          None
        </text>
      </g>
    )
  }

  const toNode = nodeMap.get(edge.to)
  if (!toNode) return null

  // Cycle Edge (looping back)
  if (edge.kind === 'cycle') {
    const startX = fromNode.x + nodeWidth / 2
    const startY = fromNode.y + nodeHeight
    const endX = toNode.x + nodeWidth / 2
    const endY = toNode.y + nodeHeight

    const arcDepth = Math.max(40, Math.abs(startX - endX) / 3)
    const pathD = `M ${startX} ${startY} C ${startX} ${startY + arcDepth}, ${endX} ${endY + arcDepth}, ${endX} ${endY + 6}`

    return (
      <g key={edge.id} data-testid={`graph-edge-cycle-${edge.from}-${edge.to}`}>
        <path
          d={pathD}
          fill="none"
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          markerEnd="url(#graph-arrow-cycle)"
        />
        <text
          x={(startX + endX) / 2}
          y={Math.max(startY, endY) + arcDepth - 6}
          fill="#FBBF24"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          cycle
        </text>
      </g>
    )
  }

  // Backward Edge (e.g. prev in doubly linked list)
  if (edge.kind === 'backward') {
    const startX = fromNode.x + 15
    const startY = fromNode.y + nodeHeight
    const endX = toNode.x + nodeWidth - 15
    const endY = toNode.y + nodeHeight

    const pathD = `M ${startX} ${startY} C ${startX} ${startY + 24}, ${endX} ${endY + 24}, ${endX} ${endY + 6}`

    return (
      <g key={edge.id} data-testid={`graph-edge-prev-${edge.from}-${edge.to}`}>
        <path
          d={pathD}
          fill="none"
          stroke="#8DA68E"
          strokeWidth="1.5"
          markerEnd="url(#graph-arrow-prev)"
        />
        <text
          x={(startX + endX) / 2}
          y={startY + 20}
          fill="#8DA68E"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          prev
        </text>
      </g>
    )
  }

  // Standard Forward Edge
  // Determine if it's horizontal or hierarchical tree
  const isHorizontal = Math.abs(fromNode.y - toNode.y) < 20
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0

  if (isHorizontal) {
    startX = fromNode.x + nodeWidth
    startY = fromNode.y + nodeHeight / 2
    endX = toNode.x - 6
    endY = toNode.y + nodeHeight / 2
  } else {
    // Tree / General
    startX = fromNode.x + nodeWidth / 2
    startY = fromNode.y + nodeHeight
    endX = toNode.x + nodeWidth / 2
    endY = toNode.y - 6
  }

  return (
    <g key={edge.id} data-testid={`graph-edge-${edge.from}-${edge.to}`}>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#7FA8D1"
        strokeWidth="1.8"
        markerEnd="url(#graph-arrow-head)"
      />
      {edge.label && (
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2 - 5}
          fill="#8DA68E"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {edge.label}
        </text>
      )}
    </g>
  )
}

// ─── SUBCOMPONENT: Render Node ───
interface RenderNodeProps {
  node: GraphNode
  refLabel?: string
  width: number
  height: number
}

const RenderNode: React.FC<RenderNodeProps> = ({
  node,
  refLabel,
  width,
  height,
}) => {
  const hasReferrers = node.referrers.length > 0

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      data-testid={`graph-node-${node.id}`}
      className="transition-transform duration-300"
    >
      {/* Variable Reference Badges (Floating on top: head, curr, prev) */}
      {hasReferrers && (
        <g transform="translate(0, -18)" data-testid={`graph-badge-${node.id}`}>
          {node.referrers.map((refName, idx) => (
            <g key={refName} transform={`translate(${idx * 48}, 0)`}>
              <rect
                x="0"
                y="0"
                width={Math.max(36, refName.length * 8 + 8)}
                height="15"
                rx="4"
                fill="#7FA8D1"
                fillOpacity="0.25"
                stroke="#7FA8D1"
                strokeWidth="1"
              />
              <text
                x="4"
                y="11"
                fill="#7FA8D1"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {refName}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Node Body Card (Midnight Glass Style) */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="8"
        ry="8"
        fill="#12151D"
        stroke={hasReferrers ? '#7FA8D1' : '#2A324B'}
        strokeWidth={hasReferrers ? '1.8' : '1'}
        className="filter drop-shadow-sm"
      />

      {/* Header Bar inside Node */}
      <rect
        x="0"
        y="0"
        width={width}
        height="20"
        rx="8"
        ry="8"
        fill="#171C26"
      />
      <rect
        x="0"
        y="12"
        width={width}
        height="8"
        fill="#171C26"
      />
      <line
        x1="0"
        y1="20"
        x2={width}
        y2="20"
        stroke="#2A324B"
        strokeWidth="1"
      />

      {/* Node Header Class / Ref Tag */}
      <text
        x="8"
        y="14"
        fill="#8DA68E"
        fontSize="9"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {refLabel ? `${refLabel} ${node.className || 'Node'}` : node.className || 'Node'}
      </text>

      {/* Node Main Value Display */}
      <text
        x={width / 2}
        y="45"
        fill="#E2E8F0"
        fontSize="13"
        fontFamily="monospace"
        fontWeight="600"
        textAnchor="middle"
      >
        {node.valDisplay}
      </text>

      {/* Address Tag Muted */}
      <text
        x={width - 6}
        y="14"
        fill="#55607A"
        fontSize="8"
        fontFamily="monospace"
        textAnchor="end"
      >
        {node.id.slice(0, 6)}
      </text>
    </g>
  )
}
