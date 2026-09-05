import { ArrowLeft, ArrowRight, Check, TrendingUp, ShieldCheck, Award, Flame, Zap } from 'lucide-react'

export default function FitnessLevelStep({ data, updateData, nextStep, prevStep }) {
  const levels = [
    {
      value: 'beginner',
      label: 'Beginner',
      desc: 'New to exercise or returning after a lengthy hiatus. Focused on learning movement patterns and building neuromuscular foundations.',
      icon: <ShieldCheck className="w-5 h-5 text-[#10B981]" />,
      badge: 'Foundation'
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      desc: 'Consistent routine for 6-12 months. Familiar with core compound exercises, recovery protocols, and progressive overload.',
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      badge: 'Progressive'
    },
    {
      value: 'advanced',
      label: 'Advanced',
      desc: 'Consistent training for 1-3+ years. High technique proficiency, understands fatigue management, and targets specific adaptations.',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      badge: 'High Intensity'
    },
    {
      value: 'expert',
      label: 'Expert / Athlete',
      desc: 'Competitive athlete or multi-year veteran. Requires periodized programming, high workload capacity, and precise biomechanical feedback.',
      icon: <Zap className="w-5 h-5 text-rose-500" />,
      badge: 'Elite'
    }
  ]

  const handleSelect = (val) => {
    updateData('fitnessLevel', val)
  }

  const handleNext = () => {
    if (data.fitnessLevel) {
      nextStep()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Award className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Experience Level</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          What is your <span className="relative inline-block">
            fitness level?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We match your program's intensity, volume, and complex movements to your current experience.
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {levels.map((lvl) => {
          const isSelected = data.fitnessLevel === lvl.value
          return (
            <div
              key={lvl.value}
              onClick={() => handleSelect(lvl.value)}
              className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/15 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-slate-200'
                }`}
              >
                {lvl.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                    {lvl.label}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#D4F63D] text-slate-950'
                        : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {lvl.badge}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {lvl.desc}
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
          disabled={!data.fitnessLevel}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
