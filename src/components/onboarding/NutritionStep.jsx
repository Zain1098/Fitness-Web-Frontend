import { useState } from 'react'
import { ArrowLeft, ArrowRight, Utensils, Droplets, Moon, Check, Sparkles } from 'lucide-react'

export default function NutritionStep({ data, updateData, nextStep, prevStep }) {
  const [diet, setDiet] = useState(data.dietaryPreference || 'none')
  const [allergens, setAllergens] = useState(data.allergens || [])
  const [meals, setMeals] = useState(data.mealsPerDay || 3)
  const [water, setWater] = useState(data.waterIntakeGoal || 8)
  const [sleep, setSleep] = useState(data.sleepGoal || 8)

  const diets = [
    { value: 'none', label: 'No Restrictions', desc: 'Standard balanced diet', icon: '🍽️' },
    { value: 'high_protein', label: 'High Protein', desc: 'Optimized for muscle recovery', icon: '🍗' },
    { value: 'vegetarian', label: 'Vegetarian', desc: 'Plant-forward with eggs & dairy', icon: '🥗' },
    { value: 'vegan', label: 'Vegan', desc: '100% plant-based nutrition', icon: '🌱' },
    { value: 'keto', label: 'Keto / Low Carb', desc: 'High fat, minimal carbohydrates', icon: '🥑' },
    { value: 'mediterranean', label: 'Mediterranean', desc: 'Healthy fats, fish, whole grains', icon: '🫒' }
  ]

  const allergenList = [
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
    { value: 'nuts', label: 'Tree Nuts & Peanuts', icon: '🥜' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { value: 'gluten', label: 'Gluten', icon: '🌾' }
  ]

  const toggleAllergen = (item) => {
    if (allergens.includes(item)) {
      setAllergens(allergens.filter(a => a !== item))
    } else {
      setAllergens([...allergens, item])
    }
  }

  const handleNext = () => {
    updateData('dietaryPreference', diet)
    updateData('allergens', allergens)
    updateData('mealsPerDay', parseInt(meals) || 3)
    updateData('waterIntakeGoal', parseInt(water) || 8)
    updateData('sleepGoal', parseFloat(sleep) || 8)
    nextStep()
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Utensils className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Diet & Bio-Habits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-['Outfit']">
          Nutrition & <span className="relative inline-block">
            recovery
            <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#D4F63D]/60 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Calibrate your macronutrient splits, meal timing, and daily hydration targets.
        </p>
      </div>

      {/* Dietary Preference Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Dietary Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {diets.map((d) => {
            const isSelected = diet === d.value
            return (
              <div
                key={d.value}
                onClick={() => setDiet(d.value)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-white border border-slate-200'
                  }`}
                >
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                    {d.label}
                  </h4>
                  <p className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {d.desc}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isSelected ? 'bg-[#D4F63D] border-[#D4F63D] text-slate-950' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Allergens */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Food Allergies or Avoidances
        </label>
        <div className="flex flex-wrap gap-2">
          {allergenList.map((a) => {
            const isSelected = allergens.includes(a.value)
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => toggleAllergen(a.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Steppers: Water & Sleep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {/* Water */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Water Goal
              </span>
              <span className="text-xs text-slate-500">Glasses (~250ml)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWater(Math.max(4, parseInt(water || 8) - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              -
            </button>
            <span className="font-bold text-base text-slate-950 w-6 text-center">{water}</span>
            <button
              type="button"
              onClick={() => setWater(Math.min(20, parseInt(water || 8) + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Sleep
              </span>
              <span className="text-xs text-slate-500">Hours per night</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSleep(Math.max(5, parseFloat(sleep || 8) - 0.5))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              -
            </button>
            <span className="font-bold text-base text-slate-950 w-8 text-center">{sleep}h</span>
            <button
              type="button"
              onClick={() => setSleep(Math.min(12, parseFloat(sleep || 8) + 0.5))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              +
            </button>
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
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 shadow-[0_6px_20px_rgba(212,246,61,0.35)] hover:shadow-[0_8px_25px_rgba(212,246,61,0.5)] hover:scale-102 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
