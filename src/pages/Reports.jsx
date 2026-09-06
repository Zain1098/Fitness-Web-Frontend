import { useState, useEffect } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { API_BASE_URL } from '../config/api.js'
import {
  FileText,
  Download,
  Calendar,
  Dumbbell,
  Apple,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react'

export default function Reports() {
  const { token, user } = useAuth()
  const [summary, setSummary] = useState({ workouts: 0, meals: 0, progress: 0 })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!token) return
    api('/reports/summary', { token })
      .then(data => {
        if (data) setSummary(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (!user) return null

  const downloadCsv = () => {
    setDownloading(true)
    fetch(`${API_BASE_URL}/reports/workouts.csv`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fitforge_workouts_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch(() => {
        window.open(`${API_BASE_URL}/reports/workouts.csv`, '_blank')
      })
      .finally(() => setDownloading(false))
  }

  const exportJsonSummary = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      user: { username: user.username, email: user.email },
      summary,
      exportedAt: new Date().toISOString()
    }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `fitforge_summary_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      <DashboardNavbar />

      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto">
        {/* Header */}
        <header className="pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 mb-2">
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            <span>Data & Exports</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
            Performance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Export your complete training logs, nutrition history, and milestone progress.
          </p>
        </header>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-[#D4F63D] flex items-center justify-center font-bold">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{summary.workouts}</div>
              <div className="text-xs font-semibold text-slate-400">Total Workouts Logged</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{summary.meals}</div>
              <div className="text-xs font-semibold text-slate-400">Meals & Macro Entries</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-['Outfit'] text-slate-950">{summary.progress}</div>
              <div className="text-xs font-semibold text-slate-400">Body Measurements Logged</div>
            </div>
          </div>
        </div>

        {/* Download & Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. CSV Export Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">
                Workouts Detailed CSV
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Contains complete breakdown of every workout, exercise sets, reps, weight, categories, and timestamps. Suitable for Excel, Google Sheets, or personal backups.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={downloadCsv}
                disabled={downloading}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-[#D4F63D] font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing File...' : 'Download CSV Dataset'}</span>
              </button>
            </div>
          </div>

          {/* 2. JSON Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F63D]/20 flex items-center justify-center text-slate-950 mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">
                Summary Snapshot (JSON)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Export an archive copy of your total activity counts, user profile identifiers, and system sync metadata in lightweight JSON format.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={exportJsonSummary}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export JSON Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}