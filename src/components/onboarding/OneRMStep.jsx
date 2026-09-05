import { useState } from 'react'
import { ArrowLeft, ArrowRight, Dumbbell, Info, Scale } from 'lucide-react'

export default function OneRMStep({ data, updateData, nextStep, prevStep }) {
  const [bench, setBench] = useState(data.oneRM?.bench || '')
  const [squat, setSquat] = useState(data.oneRM?.squat || '')
  const [deadlift, setDeadlift] = useState(data.oneRM?.deadlift || '')
  const [unit, setUnit] = useState('kg')

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return
    const multiplier = newUnit === 'lbs' ? 2.20462 : 0.453592
    if (bench) setBench((parseFloat(bench) * multiplier).toFixed(1))
    if (squat) setSquat((parseFloat(squat) * multiplier).toFixed(1))
    if (deadlift) setDeadlift((parseFloat(deadlift) * multiplier).toFixed(1))
    setUnit(newUnit)
  }

  const handleNext = () => {
    const multiplier = unit === 'kg' ? 1 : 0.453592
    const convertedData = {
      bench: bench ? (parseFloat(bench) * multiplier).toFixed(1) : '',
      squat: squat ? (parseFloat(squat) * multiplier).toFixed(1) : '',
      deadlift: deadlift ? (parseFloat(deadlift) * multiplier).toFixed(1) : ''
    }
    updateData('oneRM', convertedData)
    nextStep()
  }

  const handleSkip = () => {
    updateData('oneRM', { bench: '', squat: '', deadlift: '' })
    nextStep()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Dumbbell className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Strength Baseline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Your estimated <span className="relative inline-block">
            1-Rep Max
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          The maximum weight you can lift for 1 repetition in key compounds. Optional — skip if you don't know yet!
        </p>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 text-cyan-950 text-xs sm:text-sm">
        <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <p>
          <strong>What is a 1RM?</strong> It's your maximum single-rep load. We use this to prescribe percentage-based working sets (e.g. 75% for 4 sets of 8).
        </p>
      </div>

      {/* Unit Selector */}
      <div className="flex justify-end">
        <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => toggleUnit('kg')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              unit === 'kg' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
            }`}
          >
            kg
          </button>
          <button
            type="button"
            onClick={() => toggleUnit('lbs')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              unit === 'lbs' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
            }`}
          >
            lbs
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Bench */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Bench Press
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={bench}
              onChange={(e) => setBench(e.target.value)}
              placeholder="e.g. 80"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Squat */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Back Squat
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={squat}
              onChange={(e) => setSquat(e.target.value)}
              placeholder="e.g. 100"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Deadlift */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Deadlift
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={deadlift}
              onChange={(e) => setDeadlift(e.target.value)}
              placeholder="e.g. 130"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
