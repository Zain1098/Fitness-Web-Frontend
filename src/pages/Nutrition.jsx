import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import Tutorial from '../components/Tutorial.jsx'
import FoodDatabase from '../components/FoodDatabase.jsx'
import MealPlanner from '../components/MealPlanner.jsx'
import NutritionGoals from '../components/NutritionGoals.jsx'
import RecipeBuilder from '../components/RecipeBuilder.jsx'
import NutritionAnalytics from '../components/NutritionAnalytics.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { logActivity } from '../utils/activityLogger.js'
import {
  Apple,
  Flame,
  Plus,
  Trash2,
  Check,
  Search,
  Calendar,
  Layers,
  Sparkles,
  X,
  Clock,
  Target,
  ChefHat,
  BarChart3,
  BookOpen
} from 'lucide-react'

export default function Nutrition() {
  const { token, user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('tracker')
  const [showFoodDatabase, setShowFoodDatabase] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [foodSuggestions, setFoodSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAddMealForm, setShowAddMealForm] = useState(false)

  // Form states
  const [mealType, setMealType] = useState('breakfast')
  const [food, setFood] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [baseQuantity, setBaseQuantity] = useState('100')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')
  const [baseCalories, setBaseCalories] = useState('')
  const [baseProtein, setBaseProtein] = useState('')
  const [baseCarbs, setBaseCarbs] = useState('')
  const [baseFats, setBaseFats] = useState('')

  // Stats
  const [dailyStats, setDailyStats] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 })

  const loadEntries = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api('/nutrition', { token })
      const data = response?.items || response || []
      setEntries(Array.isArray(data) ? data : [])
      calculateDailyStats(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load nutrition entries')
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyStats = (data) => {
    const today = new Date().toDateString()
    const todayEntries = data.filter(entry =>
      new Date(entry.date).toDateString() === today
    )

    const stats = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    todayEntries.forEach(entry => {
      entry.items?.forEach(item => {
        stats.calories += item.calories || 0
        stats.protein += item.protein || 0
        stats.carbs += item.carbs || 0
        stats.fats += item.fats || item.fat || 0
      })
    })

    setDailyStats(stats)
  }

  useEffect(() => {
    loadEntries()
  }, [token])

  const clearMessages = () => {
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 3000)
  }

  const fetchNutrition = async () => {
    if (!food.trim()) return
    try {
      setFetching(true)
      const data = await api(`/nutrition-lookup?food=${encodeURIComponent(food)}`, { token })
      if (data && data.calories !== undefined) {
        setBaseQuantity('100')
        setBaseCalories(data.calories.toString())
        setBaseProtein((data.protein || 0).toString())
        setBaseCarbs((data.carbs || 0).toString())
        setBaseFats((data.fats || 0).toString())

        const multiplier = Number(quantity) / 100
        setCalories(Math.round(data.calories * multiplier).toString())
        setProtein(Math.round((data.protein || 0) * multiplier).toString())
        setCarbs(Math.round((data.carbs || 0) * multiplier).toString())
        setFats(Math.round((data.fats || 0) * multiplier).toString())

        setSuccess(`Nutrition verified via USDA: ${Math.round(data.calories * multiplier)} kcal`)
        clearMessages()
      }
    } catch (err) {
      setError('Could not auto-fetch nutrition. Please enter manually.')
      clearMessages()
    } finally {
      setFetching(false)
    }
  }

  const addMeal = async () => {
    if (!food.trim()) {
      setError('Please provide a food name')
      clearMessages()
      return
    }

    try {
      setAdding(true)
      await api('/nutrition', {
        method: 'POST',
        body: {
          mealType,
          items: [{
            name: food.trim(),
            quantity: Number(quantity) || 100,
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fats: Number(fats) || 0
          }]
        },
        token
      })

      setSuccess(`${food} logged to ${mealType}!`)
      clearMessages()
      logActivity('meal_added', `Logged ${food} (${calories} kcal)`, 'nutrition', user)

      setFood('')
      setQuantity('100')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFats('')
      setShowAddMealForm(false)
      loadEntries()
    } catch (err) {
      setError('Failed to log meal')
      clearMessages()
    } finally {
      setAdding(false)
    }
  }

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity)
    if (baseCalories && baseQuantity) {
      const multiplier = Number(newQuantity) / Number(baseQuantity)
      setCalories(Math.round(Number(baseCalories) * multiplier).toString())
      setProtein(Math.round(Number(baseProtein) * multiplier).toString())
      setCarbs(Math.round(Number(baseCarbs) * multiplier).toString())
      setFats(Math.round(Number(baseFats) * multiplier).toString())
    }
  }

  const deleteMeal = async (id) => {
    try {
      await api(`/nutrition/${id}`, { method: 'DELETE', token })
      setSuccess('Meal entry deleted')
      clearMessages()
      loadEntries()
      logActivity('meal_deleted', 'Deleted meal entry', 'nutrition', user)
    } catch (err) {
      setError('Failed to delete meal')
      clearMessages()
    }
  }

  const quickAddMeal = async (foodName, nutrition, mealTypeOverride = null) => {
    try {
      setAdding(true)
      await api('/nutrition', {
        method: 'POST',
        body: {
          mealType: mealTypeOverride || mealType,
          items: [{
            name: foodName,
            quantity: 100,
            ...nutrition
          }]
        },
        token
      })

      setSuccess(`${foodName} logged successfully!`)
      clearMessages()
      loadEntries()
    } catch (err) {
      setError('Failed to quick-add meal')
      clearMessages()
    } finally {
      setAdding(false)
    }
  }

  const handleFoodSelect = (selectedFood) => {
    setFood(selectedFood.name)
    setQuantity('100')
    setBaseQuantity('100')
    setBaseCalories(selectedFood.calories.toString())
    setBaseProtein(selectedFood.protein.toString())
    setBaseCarbs(selectedFood.carbs.toString())
    setBaseFats(selectedFood.fats.toString())
    setCalories(selectedFood.calories.toString())
    setProtein(selectedFood.protein.toString())
    setCarbs(selectedFood.carbs.toString())
    setFats(selectedFood.fats.toString())
    setShowFoodDatabase(false)
    setShowAddMealForm(true)
    setSuccess(`Selected ${selectedFood.name}`)
    clearMessages()
  }

  // Local/Regional Food Quick Autocomplete
  const FOOD_DATABASE = [
    { name: 'Chicken Breast', local: 'Murgh Seena', cal: 165, prot: 31, carb: 0, fat: 3.6 },
    { name: 'Eggs (2 Whole)', local: 'Anday', cal: 140, prot: 12, carb: 1, fat: 10 },
    { name: 'Egg Whites (4)', local: 'Safedi', cal: 68, prot: 14, carb: 1, fat: 0 },
    { name: 'Basmati Rice (Cooked)', local: 'Chawal', cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
    { name: 'Roti / Chapati (1 medium)', local: 'Roti', cal: 120, prot: 3.5, carb: 22, fat: 1.2 },
    { name: 'Oats (Rolled)', local: 'Daliya', cal: 389, prot: 16.9, carb: 66, fat: 6.9 },
    { name: 'Greek Yogurt', local: 'Dahi', cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
    { name: 'Whey Protein (1 scoop)', local: 'Protein', cal: 120, prot: 24, carb: 2, fat: 1.5 },
    { name: 'Lentils / Daal (Cooked)', local: 'Daal', cal: 116, prot: 9, carb: 20, fat: 0.4 },
    { name: 'Beef Mince (Lean)', local: 'Keema', cal: 215, prot: 26, carb: 0, fat: 12 },
    { name: 'Almonds (Handful)', local: 'Badam', cal: 164, prot: 6, carb: 6, fat: 14 },
    { name: 'Banana (1 medium)', local: 'Kela', cal: 105, prot: 1.3, carb: 27, fat: 0.3 },
    { name: 'Apple', local: 'Seb', cal: 95, prot: 0.5, carb: 25, fat: 0.3 },
    { name: 'Olive Oil (1 tbsp)', local: 'Zaitoon Tel', cal: 119, prot: 0, carb: 0, fat: 14 }
  ]

  const handleFoodInput = (value) => {
    setFood(value)
    if (value.length > 1) {
      const matches = FOOD_DATABASE.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.local.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setFoodSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (item) => {
    setFood(item.name)
    setBaseQuantity('100')
    setBaseCalories(item.cal.toString())
    setBaseProtein(item.prot.toString())
    setBaseCarbs(item.carb.toString())
    setBaseFats(item.fat.toString())

    const multiplier = Number(quantity) / 100
    setCalories(Math.round(item.cal * multiplier).toString())
    setProtein(Math.round(item.prot * multiplier).toString())
    setCarbs(Math.round(item.carb * multiplier).toString())
    setFats(Math.round(item.fat * multiplier).toString())
    setShowSuggestions(false)
  }

  const getMealIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast':
        return '🌅'
      case 'lunch':
        return '☀️'
      case 'dinner':
        return '🌙'
      case 'snacks':
        return '🍎'
      default:
        return '🍽️'
    }
  }

  // Group entries for today
  const todayDateStr = new Date().toDateString()
  const todayEntries = entries.filter(e => new Date(e.date).toDateString() === todayDateStr)

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      {/* Floating Universal Sidebar Navigation */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* ----------------- TOP HEADER BAR ----------------- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 mb-2">
              <Apple className="w-3.5 h-3.5 text-slate-950" />
              <span>Bio-Nutrition Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
              Nutrition & Macros
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Precision calorie tracking, macronutrient targets, and adaptive meal plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('database')
                setShowFoodDatabase(true)
              }}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Food Database</span>
            </button>
            <button
              onClick={() => setShowAddMealForm(prev => !prev)}
              className="px-5 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              {showAddMealForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              <span>{showAddMealForm ? 'Close Form' : 'Log Meal'}</span>
            </button>
          </div>
        </header>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {success}
            </span>
            <button onClick={() => setSuccess('')} className="p-1 hover:bg-emerald-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ----------------- MODERN NAVIGATION TABS ----------------- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {[
            { id: 'tracker', label: 'Nutrition Tracker', icon: Apple },
            { id: 'goals', label: 'Goals & Targets', icon: Target },
            { id: 'planner', label: 'Meal Planner', icon: Calendar },
            { id: 'database', label: 'Food Database', icon: BookOpen },
            { id: 'recipes', label: 'Recipe Builder', icon: ChefHat },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-[#D4F63D] shadow-sm scale-[1.02]'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ----------------- TAB: TRACKER ----------------- */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {/* Daily Macros Overview Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Calories */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calories</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-950 text-[#D4F63D] flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-[#D4F63D]" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black font-['Outfit'] text-slate-950">
                    {Math.round(dailyStats.calories)}
                    <span className="text-xs font-semibold text-slate-400 ml-1">/ 2,200 kcal</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-slate-950 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyStats.calories / 2200) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Protein */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Protein</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                    P
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black font-['Outfit'] text-slate-950">
                    {Math.round(dailyStats.protein)}g
                    <span className="text-xs font-semibold text-slate-400 ml-1">/ 160g</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyStats.protein / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carbs</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                    C
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black font-['Outfit'] text-slate-950">
                    {Math.round(dailyStats.carbs)}g
                    <span className="text-xs font-semibold text-slate-400 ml-1">/ 240g</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyStats.carbs / 240) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fats */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fats</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs">
                    F
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black font-['Outfit'] text-slate-950">
                    {Math.round(dailyStats.fats)}g
                    <span className="text-xs font-semibold text-slate-400 ml-1">/ 65g</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyStats.fats / 65) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets Ribbon */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-2 mr-1">
                Quick Presets:
              </span>
              <button
                onClick={() => quickAddMeal('Morning Power Breakfast', { calories: 380, protein: 28, carbs: 42, fats: 11 }, 'breakfast')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                🌅 Breakfast (380 kcal)
              </button>
              <button
                onClick={() => quickAddMeal('Clean Lean Lunch', { calories: 540, protein: 42, carbs: 55, fats: 14 }, 'lunch')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                ☀️ Clean Lunch (540 kcal)
              </button>
              <button
                onClick={() => quickAddMeal('Recovery Athletic Dinner', { calories: 620, protein: 45, carbs: 65, fats: 18 }, 'dinner')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                🌙 Athletic Dinner (620 kcal)
              </button>
            </div>

            {/* Add Meal Form Section */}
            {showAddMealForm && (
              <section className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-9 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-950">
                      Log Meal & Food Item
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Search food item, verify calories, and record macronutrient distribution.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMealForm(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Meal Type */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Meal Type
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                      >
                        <option value="breakfast">🌅 Breakfast</option>
                        <option value="lunch">☀️ Lunch</option>
                        <option value="dinner">🌙 Dinner</option>
                        <option value="snacks">🍎 Snacks</option>
                      </select>
                    </div>

                    {/* Food Name with Autocomplete */}
                    <div className="sm:col-span-6 relative">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Food Name
                      </label>
                      <input
                        type="text"
                        value={food}
                        onChange={(e) => handleFoodInput(e.target.value)}
                        onFocus={() => food.length > 1 && setShowSuggestions(true)}
                        placeholder="e.g. Chicken Breast, Rice, Daal, Roti..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
                      />

                      {/* Autocomplete suggestions popup */}
                      {showSuggestions && foodSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                          {foodSuggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectSuggestion(item)}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <span className="text-slate-400 ml-1.5 font-medium">({item.local})</span>
                              </div>
                              <span className="font-extrabold text-slate-950">{item.cal} kcal</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Serving (Grams / Units)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                      />
                    </div>
                  </div>

                  {/* Macros breakdown row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-lg font-black text-slate-950 outline-none"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-lg font-black text-slate-950 outline-none"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-lg font-black text-slate-950 outline-none"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        value={fats}
                        onChange={(e) => setFats(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-lg font-black text-slate-950 outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={fetchNutrition}
                      disabled={fetching || !food.trim()}
                      className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{fetching ? 'Fetching USDA...' : 'Auto-Fill from USDA'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMealForm(false)}
                        className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addMeal}
                        disabled={adding || !food.trim()}
                        className="px-6 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{adding ? 'Logging...' : 'Confirm Meal'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Today's Logged Meals */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-['Outfit'] text-slate-950">
                  Today's Recorded Meals
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {todayEntries.length} logged {todayEntries.length === 1 ? 'meal' : 'meals'}
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-7 h-7 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading nutrition journal...</p>
                </div>
              ) : todayEntries.length === 0 ? (
                <div className="py-12 px-4 bg-white border border-dashed border-slate-300 rounded-[2.5rem] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Apple className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No meals logged for today</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Log your breakfast, lunch, or athletic snacks to keep your daily bio-macros on target.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMealForm(true)}
                    className="px-5 py-2 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all"
                  >
                    + Log First Meal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayEntries.map((entry) => (
                    <div
                      key={entry._id}
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getMealIcon(entry.mealType)}</span>
                          <span className="font-extrabold text-sm capitalize text-slate-950 font-['Outfit']">
                            {entry.mealType}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteMeal(entry._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {entry.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <div className="flex items-center gap-2 font-bold">
                              <span className="text-slate-950">{item.calories || 0} kcal</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-emerald-600">{item.protein || 0}g P</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-amber-600">{item.carbs || 0}g C</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-sky-600">{item.fats || item.fat || 0}g F</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ----------------- SUB-TABS (Goals, Planner, Database, Recipes, Analytics) ----------------- */}
        {activeTab !== 'tracker' && (
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-xs">
            {activeTab === 'goals' && <NutritionGoals />}
            {activeTab === 'planner' && <MealPlanner />}
            {activeTab === 'database' && (
              <FoodDatabase onSelectFood={handleFoodSelect} searchTerm={searchTerm} />
            )}
            {activeTab === 'recipes' && <RecipeBuilder />}
            {activeTab === 'analytics' && <NutritionAnalytics />}
          </div>
        )}
      </main>
    </div>
  )
}