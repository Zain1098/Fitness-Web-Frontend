import React from 'react'

export default function AISmarter(){
  const pts = [
    'Tracks your daily workouts automatically.',
    'Monitors progress in real-time.',
    'Analyzes performance patterns and trends.',
    'Generates personalized fitness plans.',
    'Suggests smart goals based on your activity.',
    'Offers actionable recommendations to improve results.',
    'Adapts plans according to your lifestyle.',
    'Helps optimize nutrition and recovery strategies.',
    'Provides insights to prevent plateaus and injuries.',
    'Motivates you with data-driven progress updates.'
  ]
  const left = pts.slice(0,5)
  const right = pts.slice(5)
  return (
    <section className="ff-section" id="ai">
      <div className="ff-container">
        <h2 className="ff-title" style={{ textAlign:'center' }}>Smarter Fitness with AI</h2>
      </div>
      <div className="ff-ai-full">
        <video autoPlay loop muted playsInline preload="metadata" className="ff-ai-video">
          <source src="/video/AI%20Help.mp4" type="video/mp4" />
        </video>
        <div className="ff-ai-overlay">
          <div className="ff-ai-col">
            {left.map((t,i)=>(<div key={i} className="ff-ai-point">{t}</div>))}
          </div>
          <div className="ff-ai-col">
            {right.map((t,i)=>(<div key={i} className="ff-ai-point">{t}</div>))}
          </div>
        </div>
      </div>
    </section>
  )
}