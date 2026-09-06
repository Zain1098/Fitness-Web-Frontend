import { useEffect, useState, lazy, Suspense } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
const FitnessChatbot = lazy(() => import('../components/FitnessChatbot.jsx'))
import Tutorial from '../components/Tutorial.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { googleFitApi } from '../api/googleFit.js'
import { showToast } from '../components/Toast.jsx'
import {
  CalendarCheck2,
  Droplets,
  Flame,
  Moon,
  Activity,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Smile,
  Zap,
  TrendingUp,
  X,
  Smartphone,
  ChevronRight,
  Info
} from 'lucide-react'

export default function DailyTracker() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tracker, setTracker] = useState({
    water: 0,
    steps: 0,
    sleep: 0,
    mood: 'great',
    energy: 5,
    workoutCompleted: false,
    mealsLogged: 0,
    notes: '',
    dataSource: 'manual'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [targetWater, setTargetWater] = useState(3.0)
  const [googleFitStatus, setGoogleFitStatus] = useState({ connected: false, lastSynced: null })
  const [syncing, setSyncing] = useState(false)
  const [showGoogleFitModal, setShowGoogleFitModal] = useState(false)

  const loadTracker = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [data, onboardingRes] = await Promise.all([
        api(`/tracker?date=${selectedDate}`, { token }),
        api('/user/onboarding', { token }).catch(() => null)
      ])

      const onb = onboardingRes?.data || user?.onboarding_data || {}
      const prefs = user?.preferences || {}
      const glasses = prefs.waterIntakeGoal || onb.water_intake_goal || 8
      const calculatedWater = Number((glasses * 0.25).toFixed(1))
      setTargetWater(calculatedWater >= 1.5 ? calculatedWater : 2.5)

      if (data && !data.error) {
        setTracker(prev => ({
          ...prev,
          water: data.water || 0,
          steps: data.steps || 0,
          sleep: data.sleep || 0,
          mood: data.mood || 'great',
          energy: data.energy || 5,
          workoutCompleted: Boolean(data.workoutCompleted),
          mealsLogged: data.mealsLogged || 0,
          notes: data.notes || '',
          dataSource: data.dataSource || 'manual'
        }))
      } else {
        setTracker({
          water: 0,
          steps: 0,
          sleep: 0,
          mood: 'great',
          energy: 5,
          workoutCompleted: false,
          mealsLogged: 0,
          notes: '',
          dataSource: 'manual'
        })
      }
      await loadWeeklyStats()
    } catch (err) {
      console.error('Failed to load tracker:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyStats = async () => {
    try {
      const data = await api('/tracker/list?limit=30', { token })
      if (Array.isArray(data) && data.length > 0) {
        const last7Days = data.slice(0, 7)
        const avgWater = (last7Days.reduce((sum, d) => sum + (d.water || 0), 0) / last7Days.length).toFixed(1)
        const avgSteps = Math.round(last7Days.reduce((sum, d) => sum + (d.steps || 0), 0) / last7Days.length)
        const avgSleep = (last7Days.reduce((sum, d) => sum + (d.sleep || 0), 0) / last7Days.length).toFixed(1)
        const workoutsCompleted = last7Days.filter(d => d.workoutCompleted).length

        let currentStreak = 0
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
        for (let i = 0; i < sortedData.length; i++) {
          if (sortedData[i].workoutCompleted) currentStreak++
          else break
        }

        setWeeklyStats({ avgWater, avgSteps, avgSleep, workoutsCompleted })
        setStreak(currentStreak)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  useEffect(() => {
    loadTracker()
    loadGoogleFitStatus()
  }, [selectedDate, token])

  useEffect(() => {
    const googleFitParam = searchParams.get('googlefit')
    if (googleFitParam === 'connected') {
      showToast('Google Fit connected successfully', 'success', 5000)
      setSearchParams({})
      handleSync()
    }
  }, [searchParams])

  const loadGoogleFitStatus = async () => {
    if (!token) return
    try {
      const status = await googleFitApi.getStatus(token)
      setGoogleFitStatus(status || { connected: false, lastSynced: null })
    } catch (err) {
      console.error('Failed to load Google Fit status:', err)
    }
  }

  const handleConnectGoogleFit = async () => {
    setShowGoogleFitModal(false)
    try {
      const { url } = await googleFitApi.getAuthUrl(token)
      window.location.href = url
    } catch (err) {
      showToast('Failed to connect Google Fit', 'error', 5000)
    }
  }

  const handleSync = async () => {
    if (!token) return
    try {
      setSyncing(true)
      const result = await googleFitApi.sync(30, token)
      showToast(`Synced ${result.synced} days from Google Fit`, 'success', 5000)
      loadTracker()
      loadGoogleFitStatus()
    } catch (err) {
      const errorMsg = err.message || 'Sync failed'
      showToast(errorMsg, 'error', 5000)
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Fit? Your previously synced data will remain.')) return
    try {
      await googleFitApi.disconnect(token)
      setGoogleFitStatus({ connected: false, lastSynced: null })
      showToast('Google Fit disconnected', 'success', 4000)
    } catch (err) {
      showToast('Failed to disconnect', 'error', 4000)
    }
  }

  const saveTracker = async () => {
    if (!token) return setError('Not authenticated')
    try {
      setSaving(true)
      const res = await api('/tracker', {
        method: 'POST',
        body: { ...tracker, date: selectedDate },
        token
      })

      if (res && (res.error || res.message) && res.error) {
        setError(res.error || res.message || 'Failed to save')
        setTimeout(() => setError(''), 3000)
      } else {
        setSuccess('Daily vitals saved!')
        setTimeout(() => setSuccess(''), 2500)
        sessionStorage.removeItem('dashboardCache')
        sessionStorage.removeItem('dashboardCacheTime')
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save metrics')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const moods = [
    { emoji: '🤩', label: 'Energized', value: 'energized' },
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😴', label: 'Tired', value: 'tired' }
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      {/* Floating Universal Sidebar Navigation */}
      <DashboardNavbar />
      <Suspense fallback={null}>
        <FitnessChatbot />
      </Suspense>
      <Tutorial page="dailyTracker" />

      {/* Google Fit Setup Modal */}
      {showGoogleFitModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowGoogleFitModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[2.5rem] bg-white border border-white shadow-2xl p-7 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              onClick={() => setShowGoogleFitModal(false)}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black font-['Outfit'] text-slate-950">Connect Google Fit</h2>
                <p className="text-xs text-slate-500 font-medium">Automatic daily step & activity synchronization</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-[#D4F63D] font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900">Install Google Fit:</strong> Download from Play Store or iOS App Store.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-[#D4F63D] font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900">Sign in with Google:</strong> Ensure the Google account matches your profile.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-[#D4F63D] font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-900">One-Click Sync:</strong> All steps, active minutes, and calories will sync seamlessly.
                </div>
              </div>
            </div>

            <button
              onClick={handleConnectGoogleFit}
              className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-[#D4F63D] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Authorize & Connect Account</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* ----------------- TOP HEADER BAR ----------------- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Bio-Telemetry & Habits</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
              Daily Activity & Vitals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Log hydration, step targets, sleep recovery, and subjective readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Picker Pill */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-950 cursor-pointer"
              />
            </div>

            {/* Google Fit Integration Pill */}
            {!googleFitStatus.connected ? (
              <button
                onClick={() => setShowGoogleFitModal(true)}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-2 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Connect Fit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Fit'}</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors"
                  title="Disconnect Google Fit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveTracker}
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{saving ? 'Saving...' : 'Save Vitals'}</span>
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

        {/* ----------------- 7-DAY INSIGHTS ROW ----------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Water</span>
              <Droplets className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-slate-950">
              {weeklyStats?.avgWater || tracker.water || 0}
              <span className="text-xs font-semibold text-slate-400 ml-1">L/day</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Steps</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-slate-950">
              {(weeklyStats?.avgSteps || tracker.steps || 0).toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-1">steps</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Sleep</span>
              <Moon className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-slate-950">
              {weeklyStats?.avgSleep || tracker.sleep || 0}
              <span className="text-xs font-semibold text-slate-400 ml-1">hrs</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workouts</span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-slate-950">
              {weeklyStats?.workoutsCompleted || 0}
              <span className="text-xs font-semibold text-slate-400 ml-1">/ 7 days</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#D4F63D] uppercase tracking-wider">Consistency</span>
              <Flame className="w-4 h-4 fill-[#D4F63D] text-[#D4F63D]" />
            </div>
            <div className="text-2xl font-black font-['Outfit'] text-white">
              {streak} <span className="text-xs font-semibold text-slate-400 ml-1">Day Streak</span>
            </div>
          </div>
        </div>

        {/* ----------------- DAILY VITALS LOGGING GRID ----------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hydration Card (matches Dashboard style, 6 cols on lg) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#7dd3fc] to-[#38bdf8] text-slate-950 rounded-[2.5rem] p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black font-['Outfit'] text-slate-950">Hydration Status</h3>
                  <p className="text-xs text-slate-800/80 mt-0.5">Target: {targetWater} Liters (Personalized Goal)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FEF08A] text-slate-950 font-black text-[11px] shadow-xs">
                  {tracker.water >= targetWater ? 'Goal Reached 👍' : `${tracker.water}L / ${targetWater}L`}
                </span>
              </div>

              {/* Interactive 24-cup grid */}
              <div className="my-5 p-4 rounded-2xl bg-white/35 backdrop-blur-sm border border-white/40">
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const filled = i < Math.round((Number(tracker.water) / targetWater) * 24)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const newWater = Number(((i + 1) * (targetWater / 24)).toFixed(2))
                          setTracker(prev => ({ ...prev, water: newWater }))
                        }}
                        className={`h-7 rounded-lg transition-all flex items-center justify-center text-[11px] font-bold cursor-pointer ${
                          filled
                            ? 'bg-slate-950 text-[#D4F63D] shadow-xs scale-105'
                            : 'bg-white/40 text-slate-700/50 hover:bg-white/60'
                        }`}
                        title={`Click to set hydration to ${(((i + 1) * targetWater) / 24).toFixed(2)}L`}
                      >
                        {filled ? '💧' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick Increment buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-950/10">
              <div className="text-xs font-bold text-slate-900">
                Current Level: <span className="font-black text-slate-950 text-base">{tracker.water} L</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTracker(prev => ({ ...prev, water: Number((Number(prev.water) + 0.25).toFixed(2)) }))}
                  className="px-3 py-1.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-transform active:scale-95"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => setTracker(prev => ({ ...prev, water: Number((Number(prev.water) + 0.5).toFixed(2)) }))}
                  className="px-3 py-1.5 rounded-full bg-slate-950 text-[#D4F63D] hover:bg-slate-800 text-xs font-black shadow-xs transition-transform active:scale-95"
                >
                  +500 ml
                </button>
              </div>
            </div>
          </div>

          {/* Steps & Energy (6 cols on lg) */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-[2.5rem] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black font-['Outfit'] text-slate-950">Daily Step Count</h3>
                  <p className="text-xs text-slate-500 font-medium">Goal: 10,000 steps per day</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Number Input & Progress */}
              <div className="space-y-4 my-2">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={tracker.steps}
                    onChange={(e) => setTracker(prev => ({ ...prev, steps: Number(e.target.value) || 0 }))}
                    className="w-full text-3xl font-black font-['Outfit'] text-slate-950 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-950"
                  />
                  <span className="text-sm font-bold text-slate-400 shrink-0">steps</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{Math.round((Number(tracker.steps) / 10000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (Number(tracker.steps) / 10000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
                  value={tracker.steps}
                  onChange={(e) => setTracker(prev => ({ ...prev, steps: Number(e.target.value) }))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>Syncs automatically when Google Fit is connected</span>
              <span className="font-bold text-indigo-600">Active</span>
            </div>
          </div>

          {/* Sleep Recovery (6 cols on lg) */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-[2.5rem] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black font-['Outfit'] text-slate-950">Sleep & Circadian Rhythm</h3>
                  <p className="text-xs text-slate-500 font-medium">Optimal athletic target: 7.5 – 8.5 hours</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center gap-4 my-4">
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={tracker.sleep}
                  onChange={(e) => setTracker(prev => ({ ...prev, sleep: Number(e.target.value) || 0 }))}
                  className="w-32 text-3xl font-black font-['Outfit'] text-slate-950 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-950 text-center"
                />
                <span className="text-sm font-bold text-slate-400">Hours Last Night</span>
              </div>

              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={tracker.sleep}
                onChange={(e) => setTracker(prev => ({ ...prev, sleep: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer mb-2"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
              <span>Sleep Score:</span>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[11px]">
                {tracker.sleep >= 7 ? 'Deep Recovery 💤' : 'Needs Optimization ⚠️'}
              </span>
            </div>
          </div>

          {/* Subjective Readiness & Mood (6 cols on lg) */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-[2.5rem] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black font-['Outfit'] text-slate-950">Daily Energy & Mood</h3>
                  <p className="text-xs text-slate-500 font-medium">Subjective readiness score for training adaptation</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* Mood Selector Pills */}
              <div className="grid grid-cols-5 gap-2 my-4">
                {moods.map((m) => {
                  const isSelected = tracker.mood?.toLowerCase() === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setTracker(prev => ({ ...prev, mood: m.value }))}
                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs scale-105'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] font-bold capitalize">{m.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Energy rating (1-10) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Readiness Energy:</span>
                  <span className="text-slate-950 font-black">{tracker.energy} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tracker.energy}
                  onChange={(e) => setTracker(prev => ({ ...prev, energy: Number(e.target.value) }))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              High readiness days are recommended for maximum compound loads.
            </div>
          </div>

          {/* Habits & Reflection (12 cols) */}
          <div className="lg:col-span-12 bg-white border border-slate-200/90 rounded-[2.5rem] p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checkboxes & Habits */}
              <div className="space-y-4">
                <h3 className="text-base font-black font-['Outfit'] text-slate-950">Daily Checkpoints</h3>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={tracker.workoutCompleted}
                    onChange={(e) => setTracker(prev => ({ ...prev, workoutCompleted: e.target.checked }))}
                    className="w-5 h-5 rounded-lg accent-slate-950 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-950">Completed Today's Training</div>
                    <div className="text-[11px] text-slate-500">Adds towards your weekly consistency streak</div>
                  </div>
                </label>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-950">Meals Logged</div>
                    <div className="text-[11px] text-slate-500">Total nutrition checkpoints hit today</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTracker(prev => ({ ...prev, mealsLogged: Math.max(0, Number(prev.mealsLogged) - 1) }))}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-base font-black text-slate-950 w-6 text-center">{tracker.mealsLogged}</span>
                    <button
                      type="button"
                      onClick={() => setTracker(prev => ({ ...prev, mealsLogged: Number(prev.mealsLogged) + 1 }))}
                      className="w-8 h-8 rounded-full bg-slate-950 text-[#D4F63D] font-bold hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-base font-black font-['Outfit'] text-slate-950 mb-3">Athletic Journal & Notes</h3>
                <textarea
                  rows={4}
                  value={tracker.notes}
                  onChange={(e) => setTracker(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Record how your body felt, muscle soreness, nutrition adherence, or energy milestones..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>
            </div>

            {/* Bottom Save bar */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={loadTracker}
                className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={saveTracker}
                disabled={saving}
                className="px-7 py-3 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 text-xs font-black transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{saving ? 'Saving...' : 'Save Daily Checkpoint'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
