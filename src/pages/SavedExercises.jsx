import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { Bookmark, Dumbbell, Trash2, ArrowLeft, Zap } from 'lucide-react'

export default function SavedExercises() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api('/exercise-library', { token })
      .then(r => setItems(r.items || []))
      .catch(e => setError(e.message || 'Failed to load saved exercises'))
      .finally(() => setLoading(false))
  }, [token])

  const remove = async (id) => {
    try {
      await api('/exercise-library/' + id, { method: 'DELETE', token })
      setItems(items.filter(x => x._id !== id))
    } catch (e) {
      console.error('Failed to remove exercise', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-24 lg:pb-12">
      <DashboardNavbar />

      <main className="lg:pl-32 px-4 sm:px-8 pt-8 max-w-[1550px] mx-auto transition-all">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              <Link to="/exercises" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Exercise Hub
              </Link>
              <span>/</span>
              <span className="text-[#0F172A]">Saved Library</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-slate-950 flex items-center gap-3">
              <span>Saved Exercises</span>
              <span className="text-xs px-3 py-1 bg-[#D4F63D] text-[#0F172A] font-black rounded-full uppercase tracking-wider">
                {items.length} Saved
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Quick access to your bookmarked workouts and movements
            </p>
          </div>

          <Link
            to="/exercises"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F172A] text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <Dumbbell className="w-4 h-4 text-[#D4F63D]" />
            <span>Browse Library</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0F172A] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Loading saved exercises...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black font-['Outfit'] text-slate-900 mb-2">No Saved Exercises Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Browse our complete exercise library and bookmark your favorite movements for quick access anytime.
            </p>
            <Link
              to="/exercises"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D4F63D] text-[#0F172A] font-black text-sm shadow-md hover:brightness-95 transition-all"
            >
              Explore Exercises
            </Link>
          </div>
        )}

        {/* Exercises Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((ex) => (
              <div
                key={ex._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={ex.imageUrl || '/img/home/dumbells.png'}
                    alt={ex.name}
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    onError={(e) => { e.target.src = '/img/home/dumbells.png' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {ex.type || 'Exercise'}
                      </span>
                      {ex.difficulty && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          {ex.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-950 truncate font-['Outfit'] capitalize">
                      {ex.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 capitalize mt-0.5">
                      Target: {ex.target || 'Full Body'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 capitalize mt-1 truncate">
                      Equipment: {ex.equipment || 'Bodyweight'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#0F172A]" /> Ready to train
                  </span>
                  <button
                    onClick={() => remove(ex._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}