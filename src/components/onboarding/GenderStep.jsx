import { ArrowLeft, ArrowRight, Check, User, Sparkles } from 'lucide-react'

export default function GenderStep({ data, updateData, nextStep, prevStep }) {
  const genders = [
    {
      value: 'male',
      label: 'Male',
      desc: 'Calibrated for male metabolic baseline and body composition',
      icon: '👨'
    },
    {
      value: 'female',
      label: 'Female',
      desc: 'Calibrated for female metabolic baseline and body composition',
      icon: '👩'
    },
    {
      value: 'other',
      label: 'Other / Prefer not to say',
      desc: 'Neutral metabolic estimation and custom baseline',
      icon: '✨'
    }
  ]

  const handleSelect = (value) => {
    updateData('gender', value)
  }

  const handleNext = () => {
    if (data.gender) {
      nextStep()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Personal Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          What is your <span className="relative inline-block">
            gender?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Help our AI calibrate your metabolic metrics, energy expenditure, and tailored workout volumes.
        </p>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
        {genders.map((g) => {
          const isSelected = data.gender === g.value
          return (
            <div
              key={g.value}
              onClick={() => handleSelect(g.value)}
              className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/15 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-slate-200 text-slate-900'
                }`}
              >
                {g.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                    {g.label}
                  </h3>
                </div>
                <p className={`text-xs sm:text-sm mt-0.5 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {g.desc}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                  isSelected
                    ? 'bg-[#D4F63D] border-[#D4F63D] text-slate-950'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
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
          disabled={!data.gender}
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
