import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import {
  BarChart3,
  Dumbbell,
  Flame,
  Activity,
  TrendingUp,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react'

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend)

export default function Analytics() {
  const { token, user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [nutrition, setNutrition] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      api('/workouts', { token }).catch(() => []),
      api('/nutrition', { token }).catch(() => [])
    ])
      .then(([wData, nData]) => {
        setWorkouts(Array.isArray(wData) ? wData : wData?.workouts || [])
        const nList = nData?.items || nData || []
        setNutrition(Array.isArray(nList) ? nList : [])
      })
      .finally(() => setLoading(false))
  }, [token])

  if (!user) return null

  const categories = ['strength', 'cardio', 'mobility', 'sports']
  const categoryCounts = categories.map(c => workouts.filter(w => (w.category || 'strength').toLowerCase() === c).length)

  const totalProtein = nutrition.reduce((acc, n) => acc + (n.items || []).reduce((s, i) => s + (i.protein || 0), 0), 0)
  const totalCarbs = nutrition.reduce((acc, n) => acc + (n.items || []).reduce((s, i) => s + (i.carbs || 0), 0), 0)
  const totalFats = nutrition.reduce((acc, n) => acc + (n.items || []).reduce((s, i) => s + (i.fats || i.fat || 0), 0), 0)

  const barData = {
    labels: ['Strength', 'Cardio', 'Mobility', 'Sports'],
    datasets: [
      {
        label: 'Sessions Completed',
        data: categoryCounts,
        backgroundColor: ['#0F172A', '#10B981', '#38BDF8', '#F59E0B'],
        borderRadius: 12,
        maxBarThickness: 45
      }
    ]
  }

  const doughnutData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fats (g)'],
    datasets: [
      {
        data: [totalProtein || 1, totalCarbs || 1, totalFats || 1],
        backgroundColor: ['#10B981', '#F59E0B', '#38BDF8'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      <DashboardNavbar />

      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* Header */}
        <header className="pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-950" />
            <span>Telemetry & Insights</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
            Training & Nutrition Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Holistic volume distribution, macro balancing, and performance trends over time.
          </p>
        </header>

        {/* Analytics Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Workout Distribution Bar Chart */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold font-['Outfit'] text-slate-950">Workout Modality Breakdown</h3>
                  <p className="text-xs text-slate-500">Distribution of all logged sessions by training style</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                  {workouts.length} Total Sessions
                </span>
              </div>

              <div className="h-64 sm:h-72 my-4 flex items-center justify-center">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1 } },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Goal: Balanced conditioning & progressive strength</span>
              <span className="font-bold text-slate-900">Weekly Target: 4-5 Sessions</span>
            </div>
          </div>

          {/* Macro Ratio Doughnut Chart */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold font-['Outfit'] text-slate-950">Macro Split Balance</h3>
                  <p className="text-xs text-slate-500">Cumulative intake across logged meals</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-[#D4F63D] flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-[#D4F63D]" />
                </div>
              </div>

              <div className="h-56 sm:h-64 my-4 flex items-center justify-center relative">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Protein</div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">{Math.round(totalProtein)}g</div>
              </div>
              <div className="border-x border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Carbs</div>
                <div className="text-xs font-bold text-amber-600 mt-0.5">{Math.round(totalCarbs)}g</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Fats</div>
                <div className="text-xs font-bold text-sky-600 mt-0.5">{Math.round(totalFats)}g</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}