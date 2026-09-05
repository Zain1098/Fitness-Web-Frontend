import { ArrowLeft, ArrowRight, Check, Wrench, Dumbbell } from 'lucide-react'

export default function EquipmentStep({ data, updateData, nextStep, prevStep }) {
  const equipment = [
    { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️‍♀️' },
    { value: 'barbell', label: 'Barbell & Plates', icon: '🏋️' },
    { value: 'kettlebell', label: 'Kettlebells', icon: '⚫' },
    { value: 'bench', label: 'Adjustable Bench', icon: '🛋️' },
    { value: 'squat_rack', label: 'Squat Rack / Cage', icon: '🏛️' },
    { value: 'cable_machine', label: 'Cable Machine', icon: '⛓️' },
    { value: 'resistance_bands', label: 'Resistance Bands', icon: '🎗️' },
    { value: 'pull_up_bar', label: 'Pull-up Bar', icon: '🔗' },
    { value: 'treadmill', label: 'Cardio Machines (Treadmill / Bike)', icon: '🏃' },
    { value: 'none', label: 'No Equipment (Bodyweight)', icon: '🤸' }
  ]

  const presets = [
    {
      name: 'Home Essentials',
      items: ['dumbbells', 'resistance_bands', 'bench', 'pull_up_bar']
    },
    {
      name: 'Full Commercial Gym',
      items: ['dumbbells', 'barbell', 'bench', 'squat_rack', 'cable_machine', 'pull_up_bar', 'treadmill']
    },
    {
      name: 'Bodyweight Only',
      items: ['none']
    }
  ]

  const toggleEquipment = (value) => {
    const current = data.equipment || []
    if (value === 'none') {
      updateData('equipment', current.includes('none') ? [] : ['none'])
    } else {
      const filtered = current.filter(e => e !== 'none')
      if (filtered.includes(value)) {
        updateData('equipment', filtered.filter(e => e !== value))
      } else {
        updateData('equipment', [...filtered, value])
      }
    }
  }

  const applyPreset = (items) => {
    updateData('equipment', items)
  }

  const handleNext = () => {
    if (data.equipment && data.equipment.length > 0) {
      nextStep()
    }
  }

  const selectedCount = data.equipment?.length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Wrench className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Available Gear</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          What equipment do you <span className="relative inline-block">
            have access to?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We only prescribe exercises for equipment you actually have available.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Presets:</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.items)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-[#D4F63D]/30 border border-slate-200 hover:border-[#D4F63D] text-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {equipment.map((item) => {
          const isSelected = data.equipment?.includes(item.value)
          return (
            <div
              key={item.value}
              onClick={() => toggleEquipment(item.value)}
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
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
                {item.icon}
              </div>

              <div className="flex-1 min-w-0 font-bold text-sm sm:text-base">
                <span className={isSelected ? 'text-white' : 'text-slate-950'}>
                  {item.label}
                </span>
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
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={selectedCount === 0}
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
