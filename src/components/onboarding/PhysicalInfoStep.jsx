import { useState } from 'react'
import { ArrowLeft, ArrowRight, Activity, Scale, Ruler, Calendar } from 'lucide-react'

export default function PhysicalInfoStep({ data, updateData, nextStep, prevStep }) {
  const [age, setAge] = useState(data.age || '')
  const [height, setHeight] = useState(data.height || '')
  const [weight, setWeight] = useState(data.weight || '')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')

  const toggleHeightUnit = (unit) => {
    if (unit === heightUnit) return
    if (unit === 'ft') {
      if (height) {
        const totalInches = parseFloat(height) / 2.54
        setHeightFeet(Math.floor(totalInches / 12) || '')
        setHeightInches(Math.round(totalInches % 12) || '')
      }
    } else {
      if (heightFeet || heightInches) {
        const cm = (parseFloat(heightFeet || 0) * 30.48 + parseFloat(heightInches || 0) * 2.54).toFixed(0)
        setHeight(cm)
      }
    }
    setHeightUnit(unit)
  }

  const toggleWeightUnit = (unit) => {
    if (unit === weightUnit) return
    if (weight) {
      if (unit === 'lbs') {
        setWeight((parseFloat(weight) * 2.20462).toFixed(1))
      } else {
        setWeight((parseFloat(weight) * 0.453592).toFixed(1))
      }
    }
    setWeightUnit(unit)
  }

  const handleNext = () => {
    const computedHeight = heightUnit === 'cm'
      ? parseFloat(height)
      : (parseFloat(heightFeet || 0) * 30.48 + parseFloat(heightInches || 0) * 2.54)
    const computedWeight = weightUnit === 'kg'
      ? parseFloat(weight)
      : (parseFloat(weight) * 0.453592)

    if (age && computedHeight > 0 && computedWeight > 0) {
      updateData('age', parseInt(age))
      updateData('height', computedHeight.toFixed(1))
      updateData('weight', computedWeight.toFixed(1))
      nextStep()
    }
  }

  const isFormValid = Boolean(
    age &&
    parseInt(age) > 0 &&
    (heightUnit === 'cm' ? height && parseFloat(height) > 0 : (heightFeet || heightInches)) &&
    weight &&
    parseFloat(weight) > 0
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Biometrics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Tell us about <span className="relative inline-block">
            yourself
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          We use your physical stats to calculate basal metabolic rate (BMR) and recommended daily workload.
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-5">
        {/* Age Input */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <label className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Age
            </span>
            <span className="text-slate-400 font-normal normal-case">Years</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="10"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 26"
              className="w-full text-xl sm:text-2xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-sm font-bold text-slate-400">yrs</span>
          </div>
        </div>

        {/* Height Input with Unit Switch */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Ruler className="w-4 h-4 text-slate-500" />
              Height
            </label>
            <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => toggleHeightUnit('cm')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  heightUnit === 'cm' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => toggleHeightUnit('ft')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  heightUnit === 'ft' ? 'bg-slate-950 text-[#D4F63D] font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-950 font-semibold'
                }`}
              >
                ft / in
              </button>
            </div>
          </div>

          {heightUnit === 'cm' ? (
            <div className="flex items-center">
              <input
                type="number"
                min="50"
                max="250"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 178"
                className="w-full text-xl sm:text-2xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
              />
              <span className="text-sm font-bold text-slate-400">cm</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  placeholder="5"
                  className="w-full text-xl sm:text-2xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
                />
                <span className="text-sm font-bold text-slate-400">ft</span>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  placeholder="10"
                  className="w-full text-xl sm:text-2xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
                />
                <span className="text-sm font-bold text-slate-400">in</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight Input with Unit Switch */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 focus-within:border-slate-950 focus-within:bg-white focus-within:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-slate-500" />
              Weight
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
              max="350"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === 'kg' ? 'e.g. 74' : 'e.g. 165'}
              className="w-full text-xl sm:text-2xl font-bold text-slate-950 bg-transparent outline-none placeholder:text-slate-300"
            />
            <span className="text-sm font-bold text-slate-400">{weightUnit}</span>
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

        <button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid}
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
