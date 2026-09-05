import { useState } from 'react'
import { ArrowLeft, ArrowRight, Target, Scale, HelpCircle } from 'lucide-react'

export default function TargetStep({ data, updateData, nextStep, prevStep }) {
  const [targetWeight, setTargetWeight] = useState(data.targetWeight || '')
  const [weightUnit, setWeightUnit] = useState('kg')

  const toggleWeightUnit = (unit) => {
    if (unit === weightUnit) return
    if (targetWeight) {
      if (unit === 'lbs') {
        setTargetWeight((parseFloat(targetWeight) * 2.20462).toFixed(1))
      } else {
        setTargetWeight((parseFloat(targetWeight) * 0.453592).toFixed(1))
      }
    }
    setWeightUnit(unit)
  }

  const handleNext = () => {
    const computedWeight = targetWeight
      ? (weightUnit === 'kg' ? targetWeight : (parseFloat(targetWeight) * 0.453592).toFixed(1))
      : ''
    updateData('targetWeight', computedWeight)
    nextStep()
  }

  const handleSkip = () => {
    updateData('targetWeight', '')
    nextStep()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Target className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Goal Calibration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          What is your <span className="relative inline-block">
            target weight?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Setting a target weight helps calculate your required caloric surplus or deficit and projected timeline.
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-slate-500" />
              Target Bodyweight
            </label>
            <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => toggleWeightUnit('kg')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  weightUnit === 'kg' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => toggleWeightUnit('lbs')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  weightUnit === 'lbs' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 155'}
              className="w-full text-2xl sm:text-3xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-base font-bold text-slate-400">{weightUnit}</span>
          </div>
        </div>

        {/* Informative Tip */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-200/60 text-amber-900 text-xs sm:text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            You can modify this anytime from your dashboard. If you're maintaining your current weight, you can simply re-enter your current weight or skip.
          </p>
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
