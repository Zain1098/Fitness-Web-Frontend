import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { logActivity } from '../utils/activityLogger.js'
import {
  Dumbbell,
  Calendar,
  Flame,
  Plus,
  Trash2,
  ArrowRight,
  Check,
  Search,
  Activity,
  Layers,
  Sparkles,
  X,
  Clock,
  Compass,
  Play,
  RotateCcw,
  Timer
} from 'lucide-react'

export default function Workouts() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create workout form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [category, setCategory] = useState('strength')
  const [exercises, setExercises] = useState([])

  // Add exercise fields
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('0')
  const [duration, setDuration] = useState('0')

  // Filter category
  const [activeCategory, setActiveCategory] = useState('all')

  // Stats
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, totalExercises: 0 })
  const [userProfile, setUserProfile] = useState({ goal: 'stay_fit', level: 'intermediate', location: 'gym', frequency: '3-4' })

  // Active Workout Player & Rest Timer
  const [activeSession, setActiveSession] = useState(null)
  const [completedSets, setCompletedSets] = useState({})
  const [restSeconds, setRestSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Pre-built Starter Plans
  const STARTER_PLANS = [
    {
      id: 'ppl_push',
      name: 'Push Hypertrophy (Chest, Shoulders & Triceps)',
      category: 'strength',
      level: 'Intermediate',
      environment: 'Gym',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 60, duration: 0 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 22, duration: 0 },
        { name: 'Overhead Dumbbell Shoulder Press', sets: 3, reps: 10, weight: 16, duration: 0 },
        { name: 'Cable Lateral Raise', sets: 4, reps: 12, weight: 8, duration: 0 },
        { name: 'Rope Tricep Pushdown', sets: 3, reps: 12, weight: 25, duration: 0 }
      ]
    },
    {
      id: 'ppl_pull',
      name: 'Pull Strength (Back, Lats & Biceps)',
      category: 'strength',
      level: 'Intermediate',
      environment: 'Gym',
      exercises: [
        { name: 'Barbell Deadlift', sets: 3, reps: 6, weight: 80, duration: 0 },
        { name: 'Lat Pulldown / Pull-ups', sets: 4, reps: 8, weight: 55, duration: 0 },
        { name: 'Seated Cable Row', sets: 3, reps: 10, weight: 50, duration: 0 },
        { name: 'Face Pulls', sets: 4, reps: 15, weight: 20, duration: 0 },
        { name: 'Barbell Bicep Curl', sets: 3, reps: 10, weight: 25, duration: 0 }
      ]
    },
    {
      id: 'home_fullbody',
      name: 'Home Athletic Mobility & Conditioning',
      category: 'mobility',
      level: 'All Levels',
      environment: 'Home',
      exercises: [
        { name: 'Bodyweight Push-ups', sets: 4, reps: 15, weight: 0, duration: 0 },
        { name: 'Walking Lunges', sets: 3, reps: 12, weight: 0, duration: 0 },
        { name: 'Plank Hold', sets: 3, reps: 1, weight: 0, duration: 60 },
        { name: 'Burpees / Mountain Climbers', sets: 3, reps: 20, weight: 0, duration: 0 }
      ]
    }
  ]

  // Rest Timer Interval
  useEffect(() => {
    let interval = null
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(sec => sec - 1)
      }, 1000)
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restSeconds])

  const startRestTimer = (seconds) => {
    setRestSeconds(seconds)
    setIsTimerRunning(true)
  }

  const toggleSetComplete = (exerciseIdx, setIdx) => {
    const key = `${exerciseIdx}_${setIdx}`
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    if (!completedSets[key]) {
      startRestTimer(60)
    }
  }

  const loadStarterTemplate = async (template) => {
    try {
      const payload = {
        name: template.name,
        category: template.category,
        exercises: template.exercises,
        date: new Date().toISOString()
      }
      await api('/workouts', { method: 'POST', body: payload, token })
      setSuccess(`Added "${template.name}" to your workouts!`)
      setTimeout(() => setSuccess(''), 3000)
      logActivity('workout_created', `Added starter template: ${template.name}`, 'fitness', user)
      loadWorkouts()
    } catch (err) {
      setError('Failed to load starter template')
      setTimeout(() => setError(''), 3000)
    }
  }

  const loadWorkouts = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [data, onboardingRes] = await Promise.all([
        api('/workouts', { token }).catch(() => []),
        api('/user/onboarding', { token }).catch(() => null)
      ])
      const list = Array.isArray(data) ? data : data?.workouts || []
      setWorkouts(list)
      calculateStats(list)

      const onb = onboardingRes?.data || user?.onboarding_data || {}
      const prefs = user?.preferences || {}
      setUserProfile({
        goal: prefs.goal || onb.goal || 'stay_fit',
        level: onb.fitness_level || prefs.experienceLevel || 'intermediate',
        location: onb.location || 'gym',
        frequency: onb.workout_frequency || prefs.workoutFrequency || '3-4'
      })
    } catch (err) {
      setError('Failed to load workouts')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = data.filter(w => new Date(w.date) >= weekAgo).length
    const totalExercises = data.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)
    setStats({ total: data.length, thisWeek, totalExercises })
  }

  useEffect(() => {
    loadWorkouts()
  }, [token])

  const addExerciseToList = () => {
    if (!exerciseName.trim()) {
      setError('Please enter exercise name')
      setTimeout(() => setError(''), 3000)
      return
    }

    const newExercise = {
      name: exerciseName.trim(),
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: Number(weight) || 0,
      duration: Number(duration) || 0
    }

    setExercises(prev => [...prev, newExercise])
    setExerciseName('')
    setSets('3')
    setReps('10')
    setWeight('0')
    setDuration('0')
  }

  const removeExercise = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const createWorkout = async () => {
    if (exercises.length === 0) {
      setError('Please add at least one exercise to your routine')
      setTimeout(() => setError(''), 3000)
      return
    }

    const workoutTitle = workoutName.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Routine`
    const isDuplicate = workouts.some(w =>
      w.name === workoutTitle &&
      w.exercises?.length === exercises.length &&
      new Date(w.date).toDateString() === new Date().toDateString()
    )

    if (isDuplicate) {
      setError('A matching workout was already logged for today!')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      await api('/workouts', {
        method: 'POST',
        body: {
          name: workoutTitle,
          category,
          exercises
        },
        token
      })

      setSuccess('Workout created successfully!')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('workout_created', `Created ${category} workout with ${exercises.length} exercises`, 'fitness', user)

      setWorkoutName('')
      setCategory('strength')
      setExercises([])
      setShowCreateForm(false)
      loadWorkouts()
    } catch (err) {
      setError('Failed to create workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  const deleteWorkout = async (id) => {
    try {
      await api(`/workouts/${id}`, { method: 'DELETE', token })
      setSuccess('Workout removed')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('workout_deleted', 'Deleted a workout', 'fitness', user)
      loadWorkouts()
    } catch (err) {
      setError('Failed to delete workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'strength':
        return { label: 'Strength', color: 'bg-slate-950 text-[#D4F63D] border-slate-950', icon: '💪' }
      case 'cardio':
        return { label: 'Cardio', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🏃' }
      case 'mobility':
        return { label: 'Mobility', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: '🧘' }
      case 'sports':
        return { label: 'Sports', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⚽' }
      default:
        return { label: 'Training', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🏋️' }
    }
  }

  const filteredWorkouts = workouts.filter(w => {
    if (activeCategory === 'all') return true
    return w.category?.toLowerCase() === activeCategory
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      {/* Universal Floating Sidebar Navigation */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* ----------------- TOP HEADER BAR ----------------- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 mb-2">
              <Dumbbell className="w-3.5 h-3.5 text-slate-950" />
              <span>Training Programs</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
              Workouts & Routines
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#D4F63D] text-[11px] font-bold capitalize">
                Level: {userProfile.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold capitalize">
                Focus: {userProfile.goal.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold capitalize">
                Environment: {userProfile.location}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                Target: {userProfile.frequency} sessions/wk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/exercises')}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Exercise Library</span>
            </button>
            <button
              onClick={() => setShowCreateForm(prev => !prev)}
              className="px-5 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              <span>{showCreateForm ? 'Cancel Form' : 'New Workout'}</span>
            </button>
          </div>
        </header>

        {/* Notifications / Feedback */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {success}
            </span>
            <button onClick={() => setSuccess('')} className="p-1 hover:bg-emerald-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ----------------- STATS ROW ----------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Stat 1 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Dumbbell className="w-6 h-6 text-[#D4F63D]" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{stats.total}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workouts</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{stats.thisWeek}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Week</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{stats.totalExercises}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Movements</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div
            onClick={() => navigate('/exercises')}
            className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#D4F63D] uppercase tracking-wider mb-1">
                <span>Explore</span>
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="text-lg font-bold font-['Outfit']">60+ AI Exercises</div>
              <div className="text-xs text-slate-400 mt-0.5">Form guide & pose hints</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 text-[#D4F63D]" />
            </div>
          </div>
        </div>

        {/* ----------------- CREATE WORKOUT DRAWER / MODAL ----------------- */}
        {showCreateForm && (
          <section className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-9 shadow-md mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-950">
                  Create Training Session
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Assemble compound exercises, set volume targets, and organize your routine.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Routine metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Session Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g., Upper Body Hypertrophy, Leg Day"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Training Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all cursor-pointer"
                  >
                    <option value="strength">💪 Strength & Hypertrophy</option>
                    <option value="cardio">🏃 Cardio & Conditioning</option>
                    <option value="mobility">🧘 Mobility & Recovery</option>
                    <option value="sports">⚽ Functional Athletics</option>
                  </select>
                </div>
              </div>

              {/* Add Exercise Panel */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Add Movement to Routine
                  </span>
                  <span className="text-xs text-slate-500">Specify sets, reps, and working weight</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Exercise Name</label>
                    <input
                      type="text"
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      placeholder="e.g., Barbell Incline Press"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={addExerciseToList}
                      className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-[#D4F63D] font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Added movements staging list */}
              {exercises.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600">Configured Movements ({exercises.length}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {exercises.map((ex, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-700">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-950">{ex.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {ex.sets} sets × {ex.reps} reps {ex.weight > 0 && `• ${ex.weight} kg`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeExercise(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setExercises([])
                    setWorkoutName('')
                  }}
                  className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={createWorkout}
                  disabled={exercises.length === 0}
                  className="px-6 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Routine</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ----------------- WORKOUTS LIST & CATEGORY TABS ----------------- */}
        <section className="space-y-6">
          {/* Filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex p-1 bg-white border border-slate-200/90 rounded-full shadow-2xs overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Routines' },
                { id: 'strength', label: 'Strength' },
                { id: 'cardio', label: 'Cardio' },
                { id: 'mobility', label: 'Mobility' },
                { id: 'sports', label: 'Sports' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-slate-950 text-[#D4F63D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400">
              Showing {filteredWorkouts.length} logged {filteredWorkouts.length === 1 ? 'routine' : 'routines'}
            </span>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold">Loading your training sessions...</p>
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="space-y-6">
              <div className="py-12 px-6 bg-white border border-slate-200 rounded-[2.5rem] text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#D4F63D]/20 text-slate-950 flex items-center justify-center mx-auto">
                  <Dumbbell className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">Pick a Pre-Built Starter Plan</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Don't want to build from scratch? Click any curated routine below to automatically load it into your profile.
                  </p>
                </div>
              </div>

              {/* Starter Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STARTER_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950 text-[#D4F63D] text-[10px] font-black uppercase tracking-wider">
                          {plan.environment} • {plan.level}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 capitalize">{plan.category}</span>
                      </div>
                      <h4 className="text-base font-bold font-['Outfit'] text-slate-950 mb-3">{plan.name}</h4>
                      <div className="space-y-1.5 mb-6">
                        {plan.exercises.map((ex, i) => (
                          <div key={i} className="text-xs text-slate-600 flex items-center justify-between py-1 border-b border-slate-50">
                            <span className="truncate max-w-[180px] font-medium">• {ex.name}</span>
                            <span className="text-[11px] font-bold text-slate-400">{ex.sets} × {ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => loadStarterTemplate(plan)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#D4F63D] font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Use This Routine</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWorkouts.map((workout) => {
                const badge = getCategoryBadge(workout.category)
                const dateStr = workout.date
                  ? new Date(workout.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent'

                return (
                  <div
                    key={workout._id}
                    className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top row: Category Badge & Date & Delete */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${badge.color}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {dateStr}
                          </span>
                          <button
                            onClick={() => deleteWorkout(workout._id)}
                            className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Workout Title */}
                      <h3 className="text-lg font-bold font-['Outfit'] text-slate-950 leading-snug mb-3">
                        {workout.name || `${badge.label} Session`}
                      </h3>

                      {/* Exercises Checklist */}
                      <div className="space-y-2 mb-6">
                        {(workout.exercises || []).map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="font-semibold text-slate-800 truncate">{ex.name}</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 shrink-0">
                              {ex.sets}×{ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{(workout.exercises || []).length} Movements</span>
                      <button
                        onClick={() => {
                          setActiveSession(workout)
                          setCompletedSets({})
                          setRestSeconds(0)
                          setIsTimerRunning(false)
                        }}
                        className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-[#D4F63D] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#D4F63D]" />
                        <span>Start Session</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ----------------- ACTIVE WORKOUT PLAYER & REST TIMER MODAL ----------------- */}
        {activeSession && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4F63D] text-slate-950 font-black text-[10px] uppercase tracking-wider mb-1">
                    Live Session
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-950">
                    {activeSession.name}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSession(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Rest Timer Box */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#D4F63D]">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rest Interval</div>
                    <div className="text-2xl font-black font-mono text-[#D4F63D]">
                      {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startRestTimer(60)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    +60s Rest
                  </button>
                  <button
                    onClick={() => startRestTimer(90)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    +90s Rest
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false)
                      setRestSeconds(0)
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-900/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Movements Checklist with Tickable Sets */}
              <div className="space-y-4 mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workout Checklist (Tick completed sets)</div>
                {(activeSession.exercises || []).map((ex, exIdx) => (
                  <div key={exIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900 text-sm">{exIdx + 1}. {ex.name}</div>
                      <span className="text-xs font-semibold text-slate-500">{ex.weight > 0 ? `${ex.weight} kg` : 'Bodyweight'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: ex.sets || 3 }).map((_, setIdx) => {
                        const isDone = completedSets[`${exIdx}_${setIdx}`]
                        return (
                          <button
                            key={setIdx}
                            type="button"
                            onClick={() => toggleSetComplete(exIdx, setIdx)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isDone
                                ? 'bg-slate-900 text-[#D4F63D] border-slate-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <span>Set {setIdx + 1} ({ex.reps} reps)</span>
                            {isDone && <Check className="w-3.5 h-3.5 text-[#D4F63D] stroke-[3]" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Finish Workout Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveSession(null)
                    setSuccess('Session complete! Great effort today.')
                    setTimeout(() => setSuccess(''), 4000)
                    logActivity('workout_completed', `Completed session: ${activeSession.name}`, 'fitness', user)
                  }}
                  className="px-6 py-3 rounded-xl bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Finish & Log Workout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
