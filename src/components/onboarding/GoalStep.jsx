import { ArrowLeft, ArrowRight, Check, Dumbbell, Flame, Zap, Heart, Trophy, Activity, Target } from 'lucide-react'

export default function GoalStep({ data, updateData, nextStep, prevStep }) {
  const goals = [
    {
      value: 'build_muscle',
      label: 'Build Muscle Mass',
      desc: 'Hypertrophy-focused training to increase lean muscle size and definition',
      icon: <Dumbbell className="w-5 h-5 text-indigo-500" />
    },
    {
      value: 'lose_weight',
      label: 'Lose Weight & Burn Fat',
      desc: 'Caloric burn optimization with metabolic conditioning & strength preservation',
      icon: <Flame className="w-5 h-5 text-amber-500" />
    },
    {
      value: 'boost_performance',
      label: 'Boost Athletic Performance',
      desc: 'Speed, explosive power, functional agility, and athletic biomechanics',
      icon: <Zap className="w-5 h-5 text-yellow-500" />
    },
    {
      value: 'stay_fit',
      label: 'Stay Fit & Healthy',
      desc: 'Balanced routine for longevity, daily vitality, posture, and well-being',
      icon: <Heart className="w-5 h-5 text-rose-500" />
    },
    {
      value: 'gain_strength',
      label: 'Gain Maximum Strength',
      desc: 'Low-rep, high-load compound lifting to build raw power & 1RM records',
      icon: <Trophy className="w-5 h-5 text-[#10B981]" />
    },
    {
      value: 'improve_endurance',
      label: 'Improve Endurance',
      desc: 'Cardiovascular capacity, VO2 max improvement, stamina & aerobic thresholds',
      icon: <Activity className="w-5 h-5 text-cyan-500" />
    }
  ]

  const handleSelect = (val) => {
    updateData('goal', val)
  }

  const handleNext = () => {
    if (data.goal) {
      nextStep()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Target className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Primary Objective</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          What is your <span className="relative inline-block">
            main goal?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We tune workout volume, progression schemes, and macro ratios around your core objective.
        </p>
      </div>

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {goals.map((g) => {
          const isSelected = data.goal === g.value
          return (
            <div
              key={g.value}
              onClick={() => handleSelect(g.value)}
              className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/15 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-slate-200'
                  }`}
                >
                  {g.icon}
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isSelected ? 'bg-[#D4F63D] border-[#D4F63D] text-slate-950' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div>
                <h3 className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                  {g.label}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {g.desc}
                </p>
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
          disabled={!data.goal}
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
