import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'

export default function LocationStep({ data, updateData, nextStep, prevStep }) {
  const locations = [
    {
      value: 'gym',
      label: 'Commercial Gym',
      desc: 'Access to full racks, barbells, cable stations, and weight stacks',
      icon: '🏋️'
    },
    {
      value: 'home',
      label: 'Home Gym / Living Room',
      desc: 'Convenient setup using dumbbells, resistance bands, or floor space',
      icon: '🏠'
    },
    {
      value: 'outdoor',
      label: 'Outdoor & Parks',
      desc: 'Calisthenics bars, running tracks, and open-air functional circuits',
      icon: '🌳'
    },
    {
      value: 'hybrid',
      label: 'Hybrid / Flexible',
      desc: 'Mix of commercial gym on weekends and home workouts during work days',
      icon: '🔄'
    }
  ]

  const handleSelect = (val) => {
    updateData('location', val)
  }

  const handleNext = () => {
    if (data.location) {
      nextStep()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Environment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Where will you <span className="relative inline-block">
            train most often?
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We optimize exercise selections to fit your physical workout space.
        </p>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {locations.map((loc) => {
          const isSelected = data.location === loc.value
          return (
            <div
              key={loc.value}
              onClick={() => handleSelect(loc.value)}
              className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/15 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-slate-200'
                  }`}
                >
                  {loc.icon}
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
                  {loc.label}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {loc.desc}
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!data.location}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
