import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import PricingModal from '../components/PricingModal.jsx'
import Tutorial from '../components/Tutorial.jsx'
import SmartPromoPopup from '../components/SmartPromoPopup.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { showToast } from '../components/Toast.jsx'
import {
  Search,
  Crown,
  Play,
  ArrowRight,
  Flame,
  Droplets,
  Moon,
  TrendingUp,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Sparkles,
  Check
} from 'lucide-react'

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dashboard Data States
  const [summary, setSummary] = useState({ workouts: 0, meals: 0, progress: 0, exercises: 0 })
  const [todayStats, setTodayStats] = useState({ calories: 0, workouts: 0, weight: 0, carbs: 0, protein: 0, fats: 0 })
  const [calorieGoal, setCalorieGoal] = useState(2350)
  const [targetWater, setTargetWater] = useState(3.0)
  const [userMetrics, setUserMetrics] = useState({ height: 175, weight: 75, goal: 'get_fit', fitnessLevel: 'intermediate', location: 'gym' })
  const [todayTracker, setTodayTracker] = useState({ water: 2.15, steps: 8420, sleep: 7.5, mood: 'Energized' })
  const [waterPeriod, setWaterPeriod] = useState('D')
  const [pricingModalOpen, setPricingModalOpen] = useState(false)

  const loadDashboardData = async (forceRefresh = false) => {
    if (!token) return

    try {
      setLoading(true)

      // Fetch summary and recent data in parallel
      const [summaryData, workouts, nutrition, progress, trackerData, goalsData, onboardingRes] = await Promise.all([
        api('/reports/summary', { token }).catch(() => null),
        api('/workouts', { token }).catch(() => []),
        api('/nutrition', { token }).catch(() => []),
        api('/progress', { token }).catch(() => []),
        api('/tracker/today', { token }).catch(() => null),
        api('/settings/nutrition-goals', { token }).catch(() => null),
        api('/user/onboarding', { token }).catch(() => null)
      ])

      if (summaryData) setSummary(summaryData)

      // Merge user preferences from token user and onboarding endpoint
      const onb = onboardingRes?.data || user?.onboarding_data || {}
      const prefs = user?.preferences || {}
      const uWeight = prefs.weight || onb.weight || 75
      const uHeight = prefs.height || onb.height || 175
      const uAge = prefs.age || onb.age || 25
      const uGender = prefs.gender || onb.gender || 'male'
      const uGoal = prefs.goal || onb.goal || 'get_fit'
      const uFitnessLevel = onb.fitness_level || prefs.experienceLevel || 'intermediate'
      const uLocation = onb.location || 'gym'
      const uWaterGlasses = prefs.waterIntakeGoal || onb.water_intake_goal || 8

      setUserMetrics({
        height: uHeight,
        weight: uWeight,
        goal: uGoal,
        fitnessLevel: uFitnessLevel,
        location: uLocation
      })

      // Calculate Personalized BMR & TDEE if goalsData is not explicitly set
      let customCalories = goalsData?.dailyCalories
      if (!customCalories) {
        // Mifflin-St Jeor Equation
        let bmr = (10 * uWeight) + (6.25 * uHeight) - (5 * uAge) + (uGender === 'female' ? -161 : 5)
        let tdee = bmr * 1.4 // moderate multiplier
        if (uGoal === 'lose_weight') customCalories = Math.round(tdee - 450)
        else if (uGoal === 'build_muscle') customCalories = Math.round(tdee + 350)
        else customCalories = Math.round(tdee)
      }
      setCalorieGoal(customCalories || 2250)

      // Water target: (glasses * 250ml) or minimum 2.5L
      const calcWater = uWaterGlasses ? Number((uWaterGlasses * 0.25).toFixed(1)) : 2.5
      setTargetWater(calcWater >= 1.5 ? calcWater : 2.5)

      // Compute today's stats
      const today = new Date().toDateString()
      const todayMeals = (nutrition.items || nutrition || []).filter(n =>
        new Date(n.date).toDateString() === today
      )
      const todayWorkoutsList = (workouts || []).filter(w =>
        new Date(w.date).toDateString() === today
      )
      const latestProgress = (progress || []).sort((a, b) => new Date(b.date) - new Date(a.date))[0]

      const nutritionCalories = todayMeals.reduce((sum, meal) => {
        return sum + (meal.items || []).reduce((s, item) => s + (item.calories || 0), 0)
      }, 0)

      const nutritionCarbs = todayMeals.reduce((sum, meal) => {
        return sum + (meal.items || []).reduce((s, item) => s + (item.carbs || 0), 0)
      }, 0)

      const nutritionProtein = todayMeals.reduce((sum, meal) => {
        return sum + (meal.items || []).reduce((s, item) => s + (item.protein || 0), 0)
      }, 0)

      const nutritionFats = todayMeals.reduce((sum, meal) => {
        return sum + (meal.items || []).reduce((s, item) => s + (item.fat || item.fats || 0), 0)
      }, 0)

      setTodayStats({
        calories: nutritionCalories || 0,
        workouts: todayWorkoutsList.length,
        weight: latestProgress?.weight || uWeight,
        carbs: nutritionCarbs || 0,
        protein: nutritionProtein || 0,
        fats: nutritionFats || 0
      })

      if (trackerData) {
        setTodayTracker({
          water: trackerData.water || 0,
          steps: trackerData.steps || 0,
          sleep: trackerData.sleep || (prefs.sleepGoal || onb.sleep_goal || 7.5),
          mood: trackerData.mood || 'Active'
        })
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [token])

  const userName = user?.username || user?.name || 'Athlete'

  // Increment water when clicking water cells
  const handleAddWater = async () => {
    const newWater = Number((todayTracker.water + 0.25).toFixed(2))
    setTodayTracker(prev => ({ ...prev, water: newWater }))
    try {
      await api('/tracker/today', {
        method: 'POST',
        token,
        body: { water: newWater }
      })
      showToast('Hydration logged (+250ml)', 'success')
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      {/* Sidebar Navigation */}
      <DashboardNavbar />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* ----------------- TOP HEADER BAR ----------------- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
              Hi, {userName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Let's look at your daily activity overview.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for healthy metrics..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
              />
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => setPricingModalOpen(true)}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5 flex-shrink-0"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Upgrade</span>
            </button>
          </div>
        </header>

        {/* ----------------- TOP ROW: HERO WORKOUT & HYDRATION STATUS ----------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Hero Workout Banner (8 cols on lg) */}
          <div className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden glass-panel border border-white p-6 sm:p-9 flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-100/90 via-slate-50 to-white min-h-[290px]">
            {/* Background Athlete Image Accent */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none opacity-30 md:opacity-85 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80"
                alt="Workout Pose"
                className="w-full h-full object-cover object-left mask-radial"
              />
            </div>

            <div className="relative z-10 max-w-md space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F63D] text-slate-950 text-[11px] font-extrabold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>Personalized Routine</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-black font-['Outfit'] text-slate-950 leading-tight">
                Your {userMetrics.location === 'home' ? 'Home' : 'Gym'} Workout <br /> Starts Here!
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Tailored for {userMetrics.fitnessLevel} level with {userMetrics.goal.replace('_', ' ')} focus. Real-time posture tracking & progressive overload enabled.
              </p>
            </div>

            {/* Bottom Row inside Hero Card */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200/50 mt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Member" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Member" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Member" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Join program with <span className="font-extrabold text-slate-950">5.8k+</span> members
                </div>
              </div>

              <button
                onClick={() => navigate('/workouts')}
                className="px-6 py-3 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-105 active:scale-95 flex items-center gap-2 group"
              >
                <span>Start Today's Workout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Hydration Card Matching Reference (4 cols on lg) */}
          <div className="lg:col-span-4 rounded-[2.5rem] p-7 bg-gradient-to-br from-[#7dd3fc] to-[#38bdf8] text-slate-950 shadow-md flex flex-col justify-between relative overflow-hidden">
            {/* Top Row: Title & Well Done Badge */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black font-['Outfit'] text-slate-950">Hydration Status</h3>
                  <p className="text-[11px] text-slate-800/80 mt-0.5 max-w-[200px]">
                    Personalized target based on your body weight & activity level.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FEF08A] text-slate-950 font-extrabold text-[10px] shadow-sm flex items-center gap-1">
                  <span>{todayTracker.water >= targetWater ? 'Goal Met' : 'In Progress'}</span>
                  <span>👍</span>
                </span>
              </div>

              {/* 4 x 6 Grid of Water Cups (Interactive) */}
              <div className="my-6 p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const filled = i < Math.round((todayTracker.water / targetWater) * 24)
                    return (
                      <div
                        key={i}
                        onClick={handleAddWater}
                        title="Click to log +250ml"
                        className={`h-6 rounded-lg cursor-pointer transition-all ${
                          filled
                            ? 'bg-white shadow-sm scale-105'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-800/80 mt-2 px-1">
                  <span>Morning</span>
                  <span>Afternoon</span>
                  <span>Evening</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metric & Period Selector */}
            <div className="flex items-end justify-between pt-2">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/40 backdrop-blur-sm">
                {['D', 'W', 'M'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setWaterPeriod(p)}
                    className={`w-7 h-7 rounded-full text-xs font-black transition-all ${
                      waterPeriod === p ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-950 leading-none">
                  {todayTracker.water.toFixed(2)}L
                </div>
                <div className="text-[10px] font-bold text-slate-800/80 uppercase tracking-wider mt-1">
                  / {targetWater}L Target
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- BOTTOM ROW: 3 METRIC CARDS ----------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Deep Sleep Card */}
          <div className="glass-panel rounded-[2.5rem] p-7 border border-white shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-bold">
                  Deep sleep
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-['Outfit'] text-slate-950">
                  Experience the Goodness of Deep Sleep
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Target sleep calibrated for high-output muscle recovery and hormonal balance.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-['Outfit'] text-slate-950">{todayTracker.sleep}</span>
                <span className="text-xs font-semibold text-slate-400">hrs logged</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTodayTracker(prev => ({ ...prev, sleep: Math.max(1, prev.sleep - 0.5) }))}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTodayTracker(prev => ({ ...prev, sleep: Math.min(14, prev.sleep + 0.5) }))}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Calories & Macros Card */}
          <div className="glass-panel rounded-[2.5rem] p-7 border border-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">Calories</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{calorieGoal} Kcal goal</span>
              </div>

              <div className="text-2xl font-black font-['Outfit'] text-slate-950 mt-1">
                {todayStats.calories.toLocaleString()} <span className="text-xs font-medium text-slate-400">/ Kcal</span>
              </div>

              {/* Vertical Lime Bars Visualization */}
              <div className="h-24 flex items-end gap-2 my-4 px-2 pt-2 bg-slate-50/70 rounded-2xl border border-slate-100">
                {[45, 60, 80, 65, 90, 75, 88, 100, 70, 85, 95, 78].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                    <div
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-full transition-all ${
                        i === 7 ? 'bg-slate-950' : 'bg-[#D4F63D]'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Breakdown Rows */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Carbs</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{todayStats.carbs}g</div>
              </div>
              <div className="border-x border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold">Protein</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{todayStats.protein}g</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Fats</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{todayStats.fats}g</div>
              </div>
            </div>
          </div>

          {/* 3. Weight & Progress Trend Card */}
          <div className="glass-panel rounded-[2.5rem] p-7 border border-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Body Weight</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{userMetrics.height} cm Height</span>
              </div>

              <div className="text-3xl font-black font-['Outfit'] text-slate-950 mt-1">
                {todayStats.weight} <span className="text-xs font-semibold text-slate-400">kg</span>
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5">
                Target: {userMetrics.goal === 'lose_weight' ? 'Fat Loss Focus' : userMetrics.goal === 'build_muscle' ? 'Hypertrophy Focus' : 'Fitness Baseline'}
              </div>

              {/* Smooth Wavy SVG Curve Line */}
              <div className="h-24 my-3 flex items-center justify-center">
                <svg className="w-full h-16" viewBox="0 0 300 80" fill="none">
                  <path
                    d="M 0 60 C 50 60, 70 30, 120 40 C 170 50, 200 15, 250 25 C 270 30, 290 20, 300 20"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="250" cy="25" r="5" fill="#38BDF8" className="shadow-lg" />
                  <circle cx="250" cy="25" r="9" stroke="#38BDF8" strokeWidth="1.5" opacity="0.4" />
                </svg>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Weekly consistency</span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Keep it up!</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Fitness AI Chatbot and Modals */}
      <FitnessChatbot />
      <PricingModal isOpen={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />
      <Tutorial page="dashboard" />
      <SmartPromoPopup />
    </div>
  )
}
