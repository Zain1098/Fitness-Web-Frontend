import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { logActivity } from '../utils/activityLogger.js'

export default function Profile(){
  const { token } = useAuth()
  const [prefs, setPrefs] = useState({})
  const [status, setStatus] = useState('')
  useEffect(()=>{
    if(!token){ window.dispatchEvent(new Event('auth:open')); return }
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/settings', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(setPrefs).catch(()=>{})
  },[token])
  async function save(){
    setStatus('Saving...')
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/settings', { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(prefs) })
      const data = await res.json()
      setPrefs(data)
      setStatus('Saved')
      setTimeout(()=>setStatus(''), 1000)
      logActivity('Profile Updated', `User updated profile information`, 'user_action', token);
    }catch(_){ setStatus('Error') }
  }
  const set = (k,v)=> setPrefs(p=>({ ...p, [k]: v }))
  return (
    <>
      <DashboardNavbar />
      <section style={{ padding:'70px 0' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color:'#e6f0ff' }}>Profile</h2>
          <div style={{ display:'grid', gap:'16px', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', marginTop:'18px' }}>
            <Field label="Gender">
              <div style={{ display:'flex', gap:'10px' }}>
                <button className={`ff-choice${prefs.gender==='male'?' active':''}`} onClick={()=>set('gender','male')}>Male</button>
                <button className={`ff-choice${prefs.gender==='female'?' active':''}`} onClick={()=>set('gender','female')}>Female</button>
              </div>
            </Field>
            <Field label="Goal">
              <select value={prefs.goal||''} onChange={(e)=>set('goal', e.target.value)} className="ff-input">
                <option value="">Select</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="get_fit">Get Fit</option>
              </select>
            </Field>
            <Field label="Focus Area">
              <select value={prefs.focusArea||''} onChange={(e)=>set('focusArea', e.target.value)} className="ff-input">
                <option value="">Select</option>
                <option value="full_body">Full Body</option>
                <option value="upper_body">Upper Body</option>
                <option value="lower_body">Lower Body</option>
              </select>
            </Field>
            <Field label="Age">
              <input type="number" value={prefs.age||''} onChange={(e)=>set('age', Number(e.target.value))} className="ff-input" min="12" max="100" />
            </Field>
            <Field label="Height (cm)">
              <input type="number" value={prefs.heightCm||''} onChange={(e)=>set('heightCm', Number(e.target.value))} className="ff-input" min="50" max="250" />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={prefs.weightKg||''} onChange={(e)=>set('weightKg', Number(e.target.value))} className="ff-input" min="30" max="300" />
            </Field>
            <Field label="Activity Level">
              <select value={prefs.activityLevel||''} onChange={(e)=>set('activityLevel', e.target.value)} className="ff-input">
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </Field>
            <Field label="Experience">
              <select value={prefs.experience||''} onChange={(e)=>set('experience', e.target.value)} className="ff-input">
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </div>
          <div style={{ marginTop:'20px' }}>
            <button onClick={save} className="ff-btn" style={{ padding:'12px 24px', borderRadius:'10px', background:'var(--ff-neon)', color:'#000', fontWeight:700 }}>Save</button>
            {status && <span style={{ marginLeft:'12px', color:'#9fb3c8' }}>{status}</span>}
          </div>
        </div>
      </section>
      <style>{`
        .ff-input{ width:100%; padding:12px; border-radius:12px; border:1px solid rgba(91,225,255,0.35); background: var(--ff-bg); color: var(--ff-text) }
        .ff-choice{ background: rgba(255,255,255,0.05); backdrop-filter: blur(4px); padding: 10px 14px; border-radius: 12px; border:1px solid rgba(91,225,255,0.25); color:#e6f0ff }
        .ff-choice.active{ border-color: var(--ff-neon) }
      `}</style>
    </>
  )
}

function Field({ label, children }){
  return (
    <div>
      <div className="label"><span className="ff-title" style={{ fontSize:'16px', color:'#9fb3c8' }}>{label}</span></div>
      {children}
    </div>
  )
}