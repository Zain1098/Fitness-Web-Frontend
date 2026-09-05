import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { CheckCircle2, ArrowRight, Sparkles, Dumbbell, Target, Calendar, MapPin, Loader2 } from 'lucide-react'

export default function CompleteStep({ data }) {
  const navigate = useNavigate()
  const { token, user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let isMounted = true

    const saveData = async () => {
      setSaving(true)
      try {
        const payload = {
          gender: data.gender,
          age: parseInt(data.age) || 25,
          height: parseFloat(data.height) || 175,
          weight: parseFloat(data.weight) || 70,
          target_weight: data.targetWeight ? parseFloat(data.targetWeight) : null,
          target_height: data.targetHeight ? parseFloat(data.targetHeight) : null,
          goal: data.goal || 'stay_fit',
          focus_areas: data.focusAreas || [],
          fitness_level: data.fitnessLevel || 'intermediate',
          one_rm: data.oneRM || {},
          workout_frequency: data.workoutFrequency || '3-4',
          equipment: data.equipment || [],
          location: data.location || 'gym',
          body_measurements: data.bodyMeasurements || {},
          body_fat_percentage: data.bodyFatPercentage ? parseFloat(data.bodyFatPercentage) : null,
          medical_conditions: data.medicalConditions || [],
          injuries: data.injuries || '',
          workout_time_preference: data.workoutTimePreference || 'morning',
          motivation: data.motivation || '',
          dietary_preference: data.dietaryPreference || 'none',
          allergens: data.allergens || [],
          meals_per_day: parseInt(data.mealsPerDay) || 3,
          water_intake_goal: parseInt(data.waterIntakeGoal) || 8,
          sleep_goal: parseFloat(data.sleepGoal) || 8,
          onboarding_completed: true
        }

        // Save to backend
        if (token) {
          await api('/user/onboarding', {
            method: 'POST',
            token,
            body: payload
          }).catch(err => {
            console.warn('Backend onboarding update failed, continuing with local persistence:', err)
          })
        }

        // Update local session state
        if (updateUser) {
          updateUser({ onboarding_completed: true })
        } else if (user) {
          const updated = { ...user, onboarding_completed: true }
          localStorage.setItem('ff_user', JSON.stringify(updated))
        }

        localStorage.setItem('onboarding_data', JSON.stringify(data))
        localStorage.removeItem('onboarding_draft')

        if (isMounted) setSaved(true)
      } catch (err) {
        console.error('Error saving onboarding data:', err)
        if (isMounted) setSaved(true)
      } finally {
        if (isMounted) setSaving(false)
      }
    }

    saveData()

    return () => {
      isMounted = false
    }
  }, [data, token, user, updateUser])

  const goalLabels = {
    build_muscle: 'Build Muscle Mass',
    lose_weight: 'Lose Weight & Burn Fat',
    boost_performance: 'Boost Athletic Performance',
    stay_fit: 'Stay Fit & Healthy',
    gain_strength: 'Gain Maximum Strength',
    improve_endurance: 'Improve Endurance'
  }

  const handleLaunchDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-2 sm:py-4">
      {/* Celebration Icon */}
      <div className="relative inline-block mx-auto">
        <div className="absolute inset-0 bg-[#D4F63D]/40 rounded-full blur-xl animate-pulse -z-10 scale-125" />
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 flex items-center justify-center text-[#D4F63D] shadow-xl shadow-slate-950/20 mx-auto">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Profile Calibrated</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 font-['Outfit']">
          You're all <span className="relative inline-block">
            set up!
            <span className="absolute left-0 -bottom-1 w-full h-2.5 bg-[#D4F63D]/70 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Your tailored training regimen, nutrition targets, and workout splits are ready on your dashboard.
        </p>
      </div>

      {/* Plan Snapshot Card */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-left max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Snapshot</span>
          <span className="text-xs font-extrabold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Primary Goal</span>
              <span className="font-bold text-slate-900">{goalLabels[data.goal] || 'Fitness'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Frequency</span>
              <span className="font-bold text-slate-900">{data.workoutFrequency || '3-4'} days / wk</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Environment</span>
              <span className="font-bold text-slate-900 capitalize">{data.location || 'Gym'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Dumbbell className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Fitness Level</span>
              <span className="font-bold text-slate-900 capitalize">{data.fitnessLevel || 'Intermediate'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLaunchDashboard}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-black bg-slate-950 hover:bg-slate-800 text-white shadow-xl shadow-slate-950/20 hover:shadow-2xl transition-all cursor-pointer group active:scale-[0.99]"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#D4F63D]" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5 text-[#D4F63D] transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
