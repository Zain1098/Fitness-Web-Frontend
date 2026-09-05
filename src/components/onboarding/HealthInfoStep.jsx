import { useState } from 'react'
import { ArrowLeft, ArrowRight, HeartPulse, Clock, Check, Sparkles } from 'lucide-react'

export default function HealthInfoStep({ data, updateData, nextStep, prevStep }) {
  const [conditions, setConditions] = useState(data.medicalConditions || [])
  const [injuries, setInjuries] = useState(data.injuries || '')
  const [workoutTime, setWorkoutTime] = useState(data.workoutTimePreference || 'morning')
  const [motivation, setMotivation] = useState(data.motivation || '')

  const commonConditions = [
    'None',
    'Asthma',
    'High Blood Pressure',
    'Lower Back Issues',
    'Knee / Joint Pain',
    'Diabetes',
    'Shoulder Impingement'
  ]

  const timePreferences = [
    { value: 'morning', label: 'Morning', time: '6 AM – 10 AM', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', time: '12 PM – 4 PM', icon: '☀️' },
    { value: 'evening', label: 'Evening', time: '5 PM – 9 PM', icon: '🌆' },
    { value: 'flexible', label: 'Flexible', time: 'Anytime', icon: '🔄' }
  ]

  const toggleCondition = (condition) => {
    if (condition === 'None') {
      setConditions(['None'])
    } else {
      const filtered = conditions.filter(c => c !== 'None')
      if (filtered.includes(condition)) {
        setConditions(filtered.filter(c => c !== condition))
      } else {
        setConditions([...filtered, condition])
      }
    }
  }

  const handleNext = () => {
    updateData('medicalConditions', conditions)
    updateData('injuries', injuries)
    updateData('workoutTimePreference', workoutTime)
    updateData('motivation', motivation)
    nextStep()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <HeartPulse className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Safety & Lifestyle</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Health & <span className="relative inline-block">
            preferences
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Tell us about any joint conditions or timing preferences so workouts remain safe and injury-free.
        </p>
      </div>

      {/* Conditions Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Known Medical Conditions or Joint Sensitivity
        </label>
        <div className="flex flex-wrap gap-2">
          {commonConditions.map((cond) => {
            const isSelected = conditions.includes(cond)
            return (
              <button
                key={cond}
                type="button"
                onClick={() => toggleCondition(cond)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#D4F63D]" />}
                <span>{cond}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Injuries Notes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Injuries or Limitations (Optional)
        </label>
        <textarea
          rows={2}
          value={injuries}
          onChange={(e) => setInjuries(e.target.value)}
          placeholder="e.g. Previous rotator cuff strain, avoid heavy overhead presses..."
          className="w-full p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white focus:shadow-xs transition-all"
        />
      </div>

      {/* Preferred Workout Time */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Preferred Training Window
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {timePreferences.map((t) => {
            const isSelected = workoutTime === t.value
            return (
              <div
                key={t.value}
                onClick={() => setWorkoutTime(t.value)}
                className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="font-bold text-xs sm:text-sm">{t.label}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {t.time}
                </div>
              </div>
            )
          })}
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

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
