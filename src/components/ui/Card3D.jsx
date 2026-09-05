import React, { useRef, useState } from 'react'

/**
 * Responsive 3D Perspective Card with realistic physics tilt and specular glare.
 * Children can specify `style={{ transform: 'translateZ(30px)' }}` to pop out in 3D!
 */
export default function Card3D({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.02,
  glare = true
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`)

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.25 })
  }

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      className={`relative will-change-transform ${className}`}
    >
      {/* Specular 3D Glare Overlay */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 60%)`,
            opacity: glarePosition.opacity ? 1 : 0
          }}
        />
      )}
      {children}
    </div>
  )
}
