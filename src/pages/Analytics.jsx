import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend)

export default function Analytics(){
  const { token, user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [nutrition, setNutrition] = useState([])
  useEffect(()=>{ if(token){ api('/workouts', { token }).then(setWorkouts); api('/nutrition', { token }).then(setNutrition) } }, [token])
  if(!user) return null
  const freq = ['strength','cardio','mobility'].map(c=> workouts.filter(w=>w.category===c).length)
  const macros = ['protein','carbs','fats'].map(m=> nutrition.reduce((acc,n)=> acc + (n.items||[]).reduce((s,i)=> s + (i[m]||0), 0), 0))
  return (
    <section className="ff-section" id="analytics">
      <div className="ff-container">
        <h2 className="ff-title">Analytics</h2>
        <div className="ff-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="ff-panel" style={{padding:'16px'}}>
            <Bar data={{ labels:['Strength','Cardio','Mobility'], datasets:[{ label:'Workouts', data: freq, backgroundColor:['#14e1ff','#7deaff','#00c8ff'] }] }} options={{ plugins:{ legend:{ display:false } } }} />
          </div>
          <div className="ff-panel" style={{padding:'16px'}}>
            <Pie data={{ labels:['Protein','Carbs','Fats'], datasets:[{ data: macros, backgroundColor:['#14e1ff','#7deaff','#00c8ff'] }] }} />
          </div>
        </div>
      </div>
    </section>
  )
}