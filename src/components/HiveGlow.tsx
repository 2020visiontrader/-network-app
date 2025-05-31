'use client'
import { useEffect, useRef } from 'react'

export default function HiveGlow() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const cells = svg.querySelectorAll('.hex-cell')
    let hoverX = 0
    let hoverY = 0

    // Track mouse hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      hoverX = e.clientX - rect.left
      hoverY = e.clientY - rect.top

      cells.forEach((cell) => {
        const cx = parseFloat(cell.getAttribute('cx') || '0')
        const cy = parseFloat(cell.getAttribute('cy') || '0')
        const dist = Math.hypot(cx - hoverX, cy - hoverY)

        // Add glow if close
        if (dist < 60) {
          cell.classList.add('glow')
        } else {
          cell.classList.remove('glow')
        }
      })
    }

    svg.addEventListener('mousemove', handleMouseMove)

    // Idle pulse animation
    const interval = setInterval(() => {
      const randomCell = cells[Math.floor(Math.random() * cells.length)]
      randomCell?.classList.add('pulse')
      setTimeout(() => {
        randomCell?.classList.remove('pulse')
      }, 1000)
    }, 1500)

    return () => {
      svg.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    >
      {[...Array(50)].map((_, i) => {
        const cols = 12
        const size = 20
        const spacing = 24
        const row = Math.floor(i / cols)
        const col = i % cols
        const x = col * spacing + (row % 2 === 0 ? 0 : spacing / 2)
        const y = row * (spacing * 0.85)

        return (
          <circle
            key={i}
            className="hex-cell fill-purple-500/10 transition-all duration-300"
            cx={x}
            cy={y}
            r={size * 0.4}
          />
        )
      })}
    </svg>
  )
}
