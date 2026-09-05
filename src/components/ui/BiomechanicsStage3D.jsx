import { useState, useRef } from 'react'
import { Activity, ShieldCheck, Sparkles, Zap, Eye, Cpu, Compass } from 'lucide-react'

export default function BiomechanicsStage3D() {
  const [activeMode, setActiveMode] = useState('kinematics')
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 16
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const nodes = [
    { name: 'Cervical Spine', x: '50%', y: '22%', angle: '12°', load: 'Nominal' },
    { name: 'Left Shoulder', x: '41%', y: '28%', angle: '88°', load: 'Balanced' },
    { name: 'Right Shoulder', x: '59%', y: '28%', angle: '88°', load: 'Balanced' },
    { name: 'Lumbar Core', x: '50%', y: '45%', angle: '178°', load: 'Stable' },
    { name: 'Left Hip/Pelvis', x: '44%', y: '54%', angle: '94°', load: 'Optimal' },
    { name: 'Right Hip/Pelvis', x: '56%', y: '54%', angle: '94°', load: 'Optimal' },
    { name: 'Left Patella/Knee', x: '42%', y: '72%', angle: '91°', load: 'Low Strain' },
    { name: 'Right Patella/Knee', x: '58%', y: '72%', angle: '91°', load: 'Low Strain' },
    { name: 'Left Ankle/Base', x: '40%', y: '90%', angle: '102°', load: 'Grounded' },
    { name: 'Right Ankle/Base', x: '60%', y: '90%', angle: '102°', load: 'Grounded' },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto my-16 px-2 sm:px-4">
      {/* Outer 3D Perspective Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
        className="relative rounded-[2.5rem] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl border border-slate-800 text-white overflow-hidden transition-all duration-300"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#D4F63D]/10 via-[#10B981]/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Controls */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[#D4F63D] text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive 3D Biomechanics Visualizer</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] mt-2 text-white">
              Neural Kinematic Simulation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Hover over or touch the stage to inspect real-time 33-point skeletal spatial vectors and multi-axis joint angles.
            </p>
          </div>

          {/* Mode Pill Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveMode('kinematics')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeMode === 'kinematics'
                  ? 'bg-[#D4F63D] text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kinematics
            </button>
            <button
              onClick={() => setActiveMode('mesh')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeMode === 'mesh'
                  ? 'bg-[#D4F63D] text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Skeleton Mesh
            </button>
            <button
              onClick={() => setActiveMode('strain')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeMode === 'strain'
                  ? 'bg-[#D4F63D] text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stress Vectors
            </button>
          </div>
        </div>

        {/* 3D Kinetic Stage */}
        <div
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="relative mt-8 aspect-[16/10] sm:aspect-[21/9] w-full rounded-3xl bg-slate-950/60 border border-slate-800/80 p-4 sm:p-8 flex items-center justify-center overflow-hidden"
        >
          {/* 3D Gyro Ring Overlay */}
          <div
            style={{ transform: 'translateZ(-30px) rotateX(65deg)' }}
            className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-[#D4F63D]/25 border-dashed animate-[spin_20s_linear_infinite] pointer-events-none"
          />
          <div
            style={{ transform: 'translateZ(-40px) rotateY(65deg)' }}
            className="absolute w-60 sm:w-80 h-60 sm:h-80 rounded-full border border-cyan-400/20 animate-[spin_15s_linear_infinite_reverse] pointer-events-none"
          />

          {/* Central Athletic Vector Silhouette */}
          <div
            style={{ transform: 'translateZ(40px)' }}
            className="relative w-48 sm:w-64 h-full flex flex-col items-center justify-center"
          >
            {/* SVG Skeletal Vector Wireframe */}
            <svg
              viewBox="0 0 200 320"
              className="w-full h-full drop-shadow-[0_0_20px_rgba(212,246,61,0.25)]"
            >
              {/* Spine Line */}
              <line x1="100" y1="65" x2="100" y2="175" stroke="#D4F63D" strokeWidth="2.5" strokeDasharray={activeMode === 'mesh' ? '3,3' : 'none'} />
              {/* Clavicle / Shoulders */}
              <line x1="75" y1="85" x2="125" y2="85" stroke="#D4F63D" strokeWidth="2.5" />
              {/* Left Arm */}
              <line x1="75" y1="85" x2="55" y2="125" stroke="#D4F63D" strokeWidth="2" />
              <line x1="55" y1="125" x2="40" y2="165" stroke="#D4F63D" strokeWidth="2" />
              {/* Right Arm */}
              <line x1="125" y1="85" x2="145" y2="125" stroke="#D4F63D" strokeWidth="2" />
              <line x1="145" y1="125" x2="160" y2="165" stroke="#D4F63D" strokeWidth="2" />
              {/* Pelvis / Hips */}
              <line x1="82" y1="175" x2="118" y2="175" stroke="#D4F63D" strokeWidth="2.5" />
              {/* Left Leg */}
              <line x1="82" y1="175" x2="72" y2="235" stroke="#10B981" strokeWidth="2.5" />
              <line x1="72" y1="235" x2="68" y2="295" stroke="#10B981" strokeWidth="2.5" />
              {/* Right Leg */}
              <line x1="118" y1="175" x2="128" y2="235" stroke="#10B981" strokeWidth="2.5" />
              <line x1="128" y1="235" x2="132" y2="295" stroke="#10B981" strokeWidth="2.5" />

              {/* Head Circle */}
              <circle cx="100" cy="45" r="15" fill="none" stroke="#D4F63D" strokeWidth="2" />

              {/* Joint Keypoint Nodes */}
              {[
                { cx: 100, cy: 45 },
                { cx: 75, cy: 85 },
                { cx: 125, cy: 85 },
                { cx: 55, cy: 125 },
                { cx: 145, cy: 125 },
                { cx: 40, cy: 165 },
                { cx: 160, cy: 165 },
                { cx: 100, cy: 140 },
                { cx: 82, cy: 175 },
                { cx: 118, cy: 175 },
                { cx: 72, cy: 235 },
                { cx: 128, cy: 235 },
                { cx: 68, cy: 295 },
                { cx: 132, cy: 295 },
              ].map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4"
                  fill="#ffffff"
                  stroke="#D4F63D"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              ))}
            </svg>
          </div>

          {/* Floating 3D Telemetry HUD 1: Left */}
          <div
            style={{ transform: 'translateZ(55px)' }}
            className="absolute left-3 sm:left-8 top-6 sm:top-10 glass-panel !bg-slate-900/80 !border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-1.5 max-w-[190px]"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4F63D] animate-ping" />
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">Kinematics</span>
            </div>
            <div className="text-sm font-black font-['Outfit'] text-white">96.8% Precision</div>
            <div className="text-[10px] text-slate-400">Zero parallax distortion via camera matrix solver.</div>
          </div>

          {/* Floating 3D Telemetry HUD 2: Right */}
          <div
            style={{ transform: 'translateZ(65px)' }}
            className="absolute right-3 sm:right-8 bottom-6 sm:bottom-10 glass-panel !bg-slate-900/80 !border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-1.5 max-w-[210px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Joint Safety</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-black font-['Outfit'] text-white">Spine Align: Optimal</div>
            <div className="text-[10px] text-slate-400">Eccentric tempo within physiological threshold.</div>
          </div>

          {/* Floating Center Depth Tag */}
          <div
            style={{ transform: 'translateZ(50px)' }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-[#D4F63D]" />
            <span>Real-Time 3D MediaPipe Pipeline (30 FPS)</span>
          </div>
        </div>

        {/* Bottom Feature Specs */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 mt-8 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Tracking Points</div>
            <div className="text-lg sm:text-xl font-black font-['Outfit'] text-white">33 3D Keypoints</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Inference Latency</div>
            <div className="text-lg sm:text-xl font-black font-['Outfit'] text-[#D4F63D]">~16 ms Real-Time</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Hardware Requirements</div>
            <div className="text-lg sm:text-xl font-black font-['Outfit'] text-white">Zero Wearables</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">Feedback Loop</div>
            <div className="text-lg sm:text-xl font-black font-['Outfit'] text-emerald-400">Instant Audio-Visual</div>
          </div>
        </div>
      </div>
    </div>
  )
}
