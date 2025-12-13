import React, { useRef } from 'react'

function Row({ items, direction = 'left', duration = '36s' }){
  const rowRef = useRef(null)
  const onEnter = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'paused' }
  const onLeave = () => { if (rowRef.current) rowRef.current.style.animationPlayState = 'running' }
  const dup = [...items, ...items]
  return (
    <div className="relative w-full overflow-hidden" style={{ '--gap': '16px', '--duration': duration }}>
      <div ref={rowRef} className={direction === 'right' ? 'ff-row ff-right' : 'ff-row ff-left'}>
        {dup.map((it, idx) => (
          <div key={idx} onMouseEnter={onEnter} onMouseLeave={onLeave} className="min-w-[260px] flex items-center gap-3 bg-[var(--ff-surface)] border border-[rgba(91,225,255,0.35)] backdrop-blur rounded-xl p-3 shadow-[0_12px_28px_rgba(0,200,255,0.08)]">
            <img src={String(it.image)} alt={it.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="text-[var(--ff-text)] text-sm font-semibold">{it.name} <span className="text-[var(--ff-muted)] font-normal">{it.handle}</span></div>
              <p className="text-[var(--ff-muted)] text-xs leading-relaxed" style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{it.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnimatedTestimonials({ data = [] }){
  return (
    <div className="grid gap-8">
      <Row items={data} direction="left" duration="36s" />
      <Row items={data} direction="right" duration="32s" />
      <Row items={data} direction="left" duration="38s" />
    </div>
  )
}