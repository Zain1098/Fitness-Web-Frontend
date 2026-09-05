import { ArrowLeft, ArrowRight, Check, Crosshair } from 'lucide-react'

export default function FocusAreaStep({ data, updateData, nextStep, prevStep }) {
  const areas = [
    { value: 'chest', label: 'Chest', desc: 'Pectoral development & pushing power', icon: '💥' },
    { value: 'back', label: 'Back', desc: 'Lats, upper back & postural support', icon: '🦅' },
    { value: 'arms', label: 'Arms', desc: 'Biceps, triceps & forearms', icon: '💪' },
    { value: 'shoulders', label: 'Shoulders', desc: 'Deltoid width & overhead strength', icon: '🛡️' },
    { value: 'legs', label: 'Legs & Quads', desc: 'Quadriceps, hamstrings & calves', icon: '🦵' },
    { value: 'abs', label: 'Core & Abs', desc: 'Abdominals, obliques & stability', icon: '🔥' },
    { value: 'glutes', label: 'Glutes', desc: 'Posterior chain & hip power', icon: '⚡' },
    { value: 'full_body', label: 'Full Body', desc: 'Holistic compound conditioning', icon: '✨' }
  ]

  const toggleArea = (value) => {
    const current = data.focusAreas || []
    if (current.includes(value)) {
      updateData('focusAreas', current.filter(a => a !== value))
    } else {
      updateData('focusAreas', [...current, value])
    }
  }

  const selectAll = () => {
    updateData('focusAreas', areas.map(a => a.value))
  }

  const clearAll = () => {
    updateData('focusAreas', [])
  }

  const handleNext = () => {
    if (data.focusAreas && data.focusAreas.length > 0) {
      nextStep()
    }
  }

  const selectedCount = data.focusAreas?.length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Target Muscle Groups</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Select your <span className="relative inline-block">
            focus areas
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Choose which muscle groups you want to prioritize in your splits. Select multiple options.
        </p>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500">
          Selected: <span className="text-slate-900">{selectedCount}</span> / {areas.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-bold text-slate-600 hover:text-slate-950 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Grid of Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {areas.map((area) => {
          const isSelected = data.focusAreas?.includes(area.value)
          return (
            <div
              key={area.value}
              onClick={() => toggleArea(area.value)}
              className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-colors ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-slate-200'
                }`}
              >
                {area.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                  {area.label}
                </h3>
                <p className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {area.desc}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors ${
                  isSelected ? 'bg-[#D4F63D] border-[#D4F63D] text-slate-950' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={selectedCount === 0}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
