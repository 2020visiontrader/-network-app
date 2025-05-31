'use client'
import { useEffect, useRef } from 'react'

export default function HiveHexGrid() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const cells = svg.querySelectorAll('.hex-cell')
    let hoverX = 0, hoverY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      hoverX = e.clientX - rect.left
      hoverY = e.clientY - rect.top

      cells.forEach(cell => {
        const cx = parseFloat(cell.getAttribute('cx') || '0')
        const cy = parseFloat(cell.getAttribute('cy') || '0')
        const dist = Math.hypot(cx - hoverX, cy - hoverY)
        if (dist < 100) {
          cell.classList.add('glow')
        } else {
          cell.classList.remove('glow')
        }
      })
    }

    svg.addEventListener('mousemove', handleMouseMove)

    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * cells.length)
      const cell = cells[rand]
      if (cell) {
        cell.classList.add('pulse')
        setTimeout(() => cell.classList.remove('pulse'), 800)
      }
    }, 1600)

    return () => {
      svg.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  const hexes = []
  const cols = 30
  const rows = 20
  const spacing = 50
  const size = 22

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing + (row % 2 === 0 ? 0 : spacing / 2)
      const y = row * (spacing * 0.86)
      hexes.push(
        <circle
          key={`${row}-${col}`}
          cx={x}
          cy={y}
          r={size}
          className="hex-cell fill-purple-500/10 transition-all duration-300"
        />
      )
    }
  }

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <defs>
        <radialGradient id="sunset" cx="60%" cy="40%" r="100%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.02" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#sunset)" />
      {hexes}
    </svg>
  )
}
