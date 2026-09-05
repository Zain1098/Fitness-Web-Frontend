import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Activity, Sparkles, Ruler } from 'lucide-react'

export default function BodyMeasurementsStep({ data, updateData, nextStep, prevStep }) {
  const [chest, setChest] = useState(data.bodyMeasurements?.chest || '')
  const [waist, setWaist] = useState(data.bodyMeasurements?.waist || '')
  const [hips, setHips] = useState(data.bodyMeasurements?.hips || '')
  const [arms, setArms] = useState(data.bodyMeasurements?.arms || '')
  const [thighs, setThighs] = useState(data.bodyMeasurements?.thighs || '')
  const [bodyFat, setBodyFat] = useState(data.bodyFatPercentage || '')
  const [unit, setUnit] = useState('cm')

  // Auto-calculate body fat using US Navy Method
  useEffect(() => {
    if (!waist || !data.height) return
    const waistCm = unit === 'cm' ? parseFloat(waist) : parseFloat(waist) * 2.54
    const heightCm = parseFloat(data.height)
    if (!heightCm || heightCm <= 0 || !waistCm || waistCm <= 0) return

    if (data.gender === 'male') {
      const neckCm = 39 // standard male neck estimate
      if (waistCm > neckCm) {
        const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
        if (bf > 3 && bf < 60) setBodyFat(bf.toFixed(1))
      }
    } else if (data.gender === 'female') {
      const neckCm = 34 // standard female neck estimate
      const hipsCm = hips ? (unit === 'cm' ? parseFloat(hips) : parseFloat(hips) * 2.54) : waistCm * 1.15
      if (waistCm + hipsCm > neckCm) {
        const bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450
        if (bf > 8 && bf < 65) setBodyFat(bf.toFixed(1))
      }
    }
  }, [waist, hips, unit, data.height, data.gender])

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return
    const factor = newUnit === 'in' ? 0.393701 : 2.54
    if (chest) setChest((parseFloat(chest) * factor).toFixed(1))
    if (waist) setWaist((parseFloat(waist) * factor).toFixed(1))
    if (hips) setHips((parseFloat(hips) * factor).toFixed(1))
    if (arms) setArms((parseFloat(arms) * factor).toFixed(1))
    if (thighs) setThighs((parseFloat(thighs) * factor).toFixed(1))
    setUnit(newUnit)
  }

  const handleNext = () => {
    const factor = unit === 'cm' ? 1 : 2.54
    const measurements = {
      chest: chest ? (parseFloat(chest) * factor).toFixed(1) : '',
      waist: waist ? (parseFloat(waist) * factor).toFixed(1) : '',
      hips: hips ? (parseFloat(hips) * factor).toFixed(1) : '',
      arms: arms ? (parseFloat(arms) * factor).toFixed(1) : '',
      thighs: thighs ? (parseFloat(thighs) * factor).toFixed(1) : ''
    }
    updateData('bodyMeasurements', measurements)
    updateData('bodyFatPercentage', bodyFat ? parseFloat(bodyFat) : null)
    nextStep()
  }

  const handleSkip = () => {
    updateData('bodyMeasurements', {})
    updateData('bodyFatPercentage', null)
    nextStep()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Ruler className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Body Circumference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Body <span className="relative inline-block">
            measurements
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Track circumference changes to monitor lean muscle gain vs fat loss. Optional — skip if you don't have a tape measure handy!
        </p>
      </div>

      {/* Unit switch + Auto BF% display */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {bodyFat ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Estimated Body Fat: {bodyFat}%</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            Enter waist & height to auto-estimate body fat %
          </div>
        )}

        <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => toggleUnit('cm')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              unit === 'cm' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            cm
          </button>
          <button
            type="button"
            onClick={() => toggleUnit('in')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              unit === 'in' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            inches
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Waist */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Waist (at navel)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="30"
              max="200"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="e.g. 82"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Chest */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Chest (across nipples)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="30"
              max="200"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              placeholder="e.g. 100"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Hips */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Hips (widest point)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="30"
              max="200"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              placeholder="e.g. 96"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Arms */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Arms (flexed bicep)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="15"
              max="80"
              value={arms}
              onChange={(e) => setArms(e.target.value)}
              placeholder="e.g. 36"
              className="w-full text-xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Thighs */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Thighs (mid-quad)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.5"
              min="20"
              max="100"
              value={thighs}
              onChange={(e) => setThighs(e.target.value)}
              placeholder="e.g. 58"
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
