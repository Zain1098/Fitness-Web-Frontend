import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { logActivity } from '../utils/activityLogger.js'
import { API_BASE_URL } from '../config/api.js'

export default function Profile(){
  const { token } = useAuth()
  const [prefs, setPrefs] = useState({})
  const [status, setStatus] = useState('')
  useEffect(()=>{
    if(!token){ window.dispatchEvent(new Event('auth:open')); return }
    fetch(API_BASE_URL + '/settings', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(setPrefs).catch(()=>{})
  },[token])
  async function save(){
    setStatus('Saving...')
    try{
      const res = await fetch(API_BASE_URL + '/settings', { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(prefs) })
      const data = await res.json()
      setPrefs(data)
      setStatus('Saved')
      setTimeout(()=>setStatus(''), 1000)
      logActivity('Profile Updated', `User updated profile information`, 'user_action', token);
    }catch(_){ setStatus('Error') }
  }
  const set = (k,v)=> setPrefs(p=>({ ...p, [k]: v }))
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#D4F63D] selection:text-slate-900">
      <DashboardNavbar />

      <main className="lg:pl-32 pt-8 sm:pt-12 px-4 sm:px-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            Settings & Account
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-['Outfit']">
            Your Profile & Preferences
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Update your body metrics, fitness goals, and training experience
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Gender">
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    prefs.gender === 'male'
                      ? 'bg-slate-900 text-[#D4F63D] border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => set('gender', 'male')}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    prefs.gender === 'female'
                      ? 'bg-slate-900 text-[#D4F63D] border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => set('gender', 'female')}
                >
                  Female
                </button>
              </div>
            </Field>

            <Field label="Primary Goal">
              <select
                value={prefs.goal || ''}
                onChange={(e) => set('goal', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="">Select Goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="get_fit">Get Fit & Tone</option>
              </select>
            </Field>

            <Field label="Focus Area">
              <select
                value={prefs.focusArea || ''}
                onChange={(e) => set('focusArea', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="">Select Focus</option>
                <option value="full_body">Full Body</option>
                <option value="upper_body">Upper Body</option>
                <option value="lower_body">Lower Body</option>
              </select>
            </Field>

            <Field label="Age">
              <input
                type="number"
                value={prefs.age || ''}
                onChange={(e) => set('age', Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                min="12"
                max="100"
                placeholder="e.g. 24"
              />
            </Field>

            <Field label="Height (cm)">
              <input
                type="number"
                value={prefs.heightCm || ''}
                onChange={(e) => set('heightCm', Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                min="50"
                max="250"
                placeholder="e.g. 175"
              />
            </Field>

            <Field label="Weight (kg)">
              <input
                type="number"
                value={prefs.weightKg || ''}
                onChange={(e) => set('weightKg', Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                min="30"
                max="300"
                placeholder="e.g. 70"
              />
            </Field>

            <Field label="Activity Level">
              <select
                value={prefs.activityLevel || ''}
                onChange={(e) => set('activityLevel', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="">Select Level</option>
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="light">Lightly Active (1-2 days/wk)</option>
                <option value="moderate">Moderately Active (3-5 days/wk)</option>
                <option value="active">Very Active (6-7 days/wk)</option>
              </select>
            </Field>

            <Field label="Experience">
              <select
                value={prefs.experience || ''}
                onChange={(e) => set('experience', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="">Select Experience</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
            <button
              onClick={save}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-[#D4F63D] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              Save Profile Changes
            </button>
            {status && (
              <span className={`text-sm font-semibold ${status === 'Saved' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {status}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }){
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
      {children}
    </div>
  )
}