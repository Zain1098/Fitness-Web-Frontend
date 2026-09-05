import { ArrowLeft, ArrowRight, Check, Calendar, Zap, Sparkles } from 'lucide-react'

export default function WorkoutFrequencyStep({ data, updateData, nextStep, prevStep }) {
  const frequencies = [
    {
      value: '1-2',
      label: '1–2 days / week',
      desc: 'Great for maintaining active movement, busy work weeks, or low-intensity start.',
      badge: 'Light'
    },
    {
      value: '3-4',
      label: '3–4 days / week',
      desc: 'The optimal sweet spot for muscle hypertrophy, systemic recovery, and consistency.',
      badge: 'Recommended'
    },
    {
      value: '5-6',
      label: '5–6 days / week',
      desc: 'High dedication split (e.g. Push/Pull/Legs or Upper/Lower) for serious physique sculpting.',
      badge: 'Dedicated'
    },
    {
      value: '7',
      label: 'Every day (7 days)',
      desc: 'Active daily lifestyle incorporating high intensity days, cardio, and active recovery.',
      badge: 'Maximum'
    }
  ]

  const handleSelect = (val) => {
    updateData('workoutFrequency', val)
  }

  const handleNext = () => {
    if (data.workoutFrequency) {
      nextStep()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Training Schedule</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          How often will you <span className="relative inline-block">
            work out?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We structure your weekly volume and recovery days so you progress without burnout or overtraining.
        </p>
      </div>

      {/* Frequency Cards */}
      <div className="space-y-3">
        {frequencies.map((f) => {
          const isSelected = data.workoutFrequency === f.value
          const isRecommended = f.badge === 'Recommended'
          return (
            <div
              key={f.value}
              onClick={() => handleSelect(f.value)}
              className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/15 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                    {f.label}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isRecommended
                        ? 'bg-[#D4F63D] text-slate-950 shadow-xs'
                        : isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {f.badge}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {f.desc}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-1 transition-colors ${
                  isSelected ? 'bg-[#D4F63D] border-[#D4F63D] text-slate-950' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
          disabled={!data.workoutFrequency}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
