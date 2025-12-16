import { useEffect, useState, lazy, Suspense } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
const FitnessChatbot = lazy(() => import('../components/FitnessChatbot.jsx'))
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './DailyTracker.css'

export default function DailyTracker() {
  const { token, user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tracker, setTracker] = useState({
    water: 0,
    steps: 0,
    sleep: 0,
    mood: '',
    energy: 5,
    workoutCompleted: false,
    mealsLogged: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [showGuide, setShowGuide] = useState(false)

  const loadTracker = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api(`/tracker?date=${selectedDate}`, { token })
      if (data) {
        setTracker(data)
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
      if (data && data.length > 0) {
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
  }, [selectedDate, token])
  
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('tracker_guide_seen')
    if (!hasSeenGuide && user) {
      setShowGuide(true)
    }
  }, [user])
  
  const closeGuide = () => {
    localStorage.setItem('tracker_guide_seen', 'true')
    setShowGuide(false)
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

      if (res && (res.error || res.message)) {
        setError(res.error || res.message || 'Failed to save')
        setTimeout(() => setError(''), 3000)
      } else {
        setSuccess('✅ Saved!')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const moods = [
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😔', label: 'Low', value: 'low' },
    { emoji: '😫', label: 'Bad', value: 'bad' }
  ]

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <Suspense fallback={null}>
        <FitnessChatbot />
      </Suspense>
      
      {/* First-time Guide */}
      {showGuide && (
        <div className="guide-overlay" onClick={closeGuide}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="guide-close" onClick={closeGuide}>×</button>
            <h2>👋 Welcome to Daily Tracker!</h2>
            <p>Track your daily habits to build a healthier lifestyle:</p>
            <div className="guide-features">
              <div className="guide-item">
                <span className="guide-icon">💧</span>
                <div>
                  <strong>Water Intake</strong>
                  <p>Click glasses to track. Goal: 8 glasses/day</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">👟</span>
                <div>
                  <strong>Steps</strong>
                  <p>Enter your daily steps. Goal: 10,000 steps</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">😴</span>
                <div>
                  <strong>Sleep</strong>
                  <p>Log sleep hours. Optimal: 7-9 hours</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">😊</span>
                <div>
                  <strong>Mood & Energy</strong>
                  <p>Track how you feel each day</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">💪</span>
                <div>
                  <strong>Workout</strong>
                  <p>Mark if you completed a workout today</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">📊</span>
                <div>
                  <strong>Analytics</strong>
                  <p>View your progress, streaks & trends</p>
                </div>
              </div>
            </div>
            <div className="guide-tip">
              💡 <strong>Pro Tip:</strong> Workouts and meals auto-sync from their respective pages!
            </div>
            <button className="guide-start-btn" onClick={closeGuide}>
              Got it! Let's Start 🚀
            </button>
          </div>
        </div>
      )}
      
      <div className="daily-tracker-page">
        <div className="tracker-container">
          <div className="tracker-header">
            <h1>📅 Daily Tracker</h1>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {success && <div role="status" aria-live="polite" className="message success">{success}</div>}
          {error && <div role="status" aria-live="assertive" className="message error">{error}</div>}

          {/* Weekly Insights */}
          <div className="insights-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📊 Weekly Insights</h2>
              <button 
                className="analytics-link-btn"
                onClick={() => window.location.href = '/tracker/analytics'}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 107, 53, 0.2)',
                  border: '1px solid #ff6b35',
                  borderRadius: '8px',
                  color: '#ff6b35',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 53, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 107, 53, 0.2)'}
              >
                📊 View Full Analytics
              </button>
            </div>
            <div className="insights-grid">
              {weeklyStats ? (
                weeklyStats.avgWater > 0 || weeklyStats.avgSteps > 0 || weeklyStats.avgSleep > 0 ? (
                  <>
                    <div className="insight-card">
                      <div className="insight-icon">💧</div>
                      <div className="insight-value">{weeklyStats.avgWater}</div>
                      <div className="insight-label">Avg Water/Day</div>
                    </div>
                    <div className="insight-card">
                      <div className="insight-icon">👟</div>
                      <div className="insight-value">{weeklyStats.avgSteps.toLocaleString()}</div>
                      <div className="insight-label">Avg Steps/Day</div>
                    </div>
                    <div className="insight-card">
                      <div className="insight-icon">😴</div>
                      <div className="insight-value">{weeklyStats.avgSleep}h</div>
                      <div className="insight-label">Avg Sleep/Night</div>
                    </div>
                    <div className="insight-card">
                      <div className="insight-icon">💪</div>
                      <div className="insight-value">{weeklyStats.workoutsCompleted}/7</div>
                      <div className="insight-label">Workouts This Week</div>
                    </div>
                    <div className="insight-card highlight">
                      <div className="insight-icon">🔥</div>
                      <div className="insight-value">{streak}</div>
                      <div className="insight-label">Day Streak</div>
                    </div>
                  </>
                ) : (
                  <div className="empty-insights">
                    <div className="empty-insights-icon">📊</div>
                    <h3>Start Your Journey!</h3>
                    <p>Fill in your daily stats below to see your weekly insights and build streaks! 🚀</p>
                  </div>
                )
              ) : (
                // skeletons while loading stats
                <>
                  <div className="insight-card skeleton" />
                  <div className="insight-card skeleton" />
                  <div className="insight-card skeleton" />
                  <div className="insight-card skeleton" />
                  <div className="insight-card skeleton" />
                </>
              )}
            </div>
          </div>

          <div className="tracker-grid">
            {/* Water Intake */}
            <div className="tracker-card">
              <h3>💧 Water Intake</h3>
              <div className="water-tracker">
                <div className="water-display">{tracker.water} / 8 glasses</div>
                <div className="water-glasses">
                  {[...Array(8)].map((_, i) => (
                    <button
                      key={i}
                      className={`glass ${i < tracker.water ? 'filled' : ''}`}
                      onClick={() => setTracker({...tracker, water: i + 1})}
                      aria-label={`Water glass ${i + 1}`}
                      aria-pressed={i < tracker.water}
                    >
                      💧
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="tracker-card">
              <h3>👟 Steps</h3>
              <input
                type="number"
                min="0"
                max="200000"
                value={tracker.steps}
                onChange={(e) => setTracker({...tracker, steps: Math.max(0, Number(e.target.value) || 0)})}
                placeholder="0"
                aria-label="Steps"
                className="tracker-input large"
              />
              <div className="step-presets">
                <button type="button" className="preset-btn" onClick={() => setTracker({...tracker, steps: 5000})}>5k</button>
                <button type="button" className="preset-btn" onClick={() => setTracker({...tracker, steps: 10000})}>10k</button>
              </div>
              <div className="goal-indicator">
                <div className="goal-bar">
                  <div 
                    className="goal-fill"
                    style={{width: `${Math.min((tracker.steps / 10000) * 100, 100)}%`}}
                  ></div>
                </div>
                <span className="goal-text">Goal: 10,000 steps</span>
              </div>
            </div>

            {/* Sleep */}
            <div className="tracker-card">
              <h3>😴 Sleep Hours</h3>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={tracker.sleep}
                onChange={(e) => setTracker({...tracker, sleep: Math.max(0, Math.min(24, Number(e.target.value) || 0))})}
                placeholder="0"
                aria-label="Sleep hours"
                className="tracker-input large"
              />
              <div className="sleep-quality">
                {tracker.sleep >= 7 && tracker.sleep <= 9 && <span className="quality-badge good">✅ Optimal</span>}
                {tracker.sleep > 0 && tracker.sleep < 7 && <span className="quality-badge warning">⚠️ Too Little</span>}
                {tracker.sleep > 9 && <span className="quality-badge warning">⚠️ Too Much</span>}
              </div>
            </div>

            {/* Mood */}
            <div className="tracker-card">
              <h3>😊 Mood</h3>
              <div className="mood-selector">
                {moods.map(m => (
                  <button
                    key={m.value}
                    className={`mood-btn ${tracker.mood === m.value ? 'active' : ''}`}
                    onClick={() => setTracker({...tracker, mood: m.value})}
                    aria-label={`Mood: ${m.label}`}
                    aria-pressed={tracker.mood === m.value}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="tracker-card">
              <h3>⚡ Energy Level</h3>
              <div className="energy-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tracker.energy}
                  onChange={(e) => setTracker({...tracker, energy: Number(e.target.value)})}
                  className="slider"
                  aria-label="Energy level"
                />
                <div className="energy-display">{tracker.energy} / 10</div>
              </div>
            </div>

            {/* Workout Status */}
            <div className="tracker-card">
              <h3>💪 Workout</h3>
              <button
                className={`toggle-btn ${tracker.workoutCompleted ? 'active' : ''}`}
                onClick={() => setTracker({...tracker, workoutCompleted: !tracker.workoutCompleted})}
              >
                {tracker.workoutCompleted ? '✅ Completed' : '⭕ Not Done'}
              </button>
            </div>

            {/* Meals Logged */}
            <div className="tracker-card">
              <h3>🍽️ Meals Logged</h3>
              <div className="meals-counter">
                <button 
                  className="counter-btn"
                  onClick={() => setTracker({...tracker, mealsLogged: Math.max(0, tracker.mealsLogged - 1)})}
                  aria-label="Decrease meals logged"
                >
                  -
                </button>
                <span className="counter-value">{tracker.mealsLogged}</span>
                <button 
                  className="counter-btn"
                  onClick={() => setTracker({...tracker, mealsLogged: Math.min(6, tracker.mealsLogged + 1)})}
                  aria-label="Increase meals logged"
                >
                  +
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="tracker-card full-width">
              <h3>📝 Daily Notes</h3>
              <textarea
                value={tracker.notes}
                onChange={(e) => setTracker({...tracker, notes: e.target.value})}
                placeholder="How was your day? Any achievements or challenges?"
                className="tracker-textarea"
                rows="4"
              />
            </div>
          </div>

          <button className="save-btn" onClick={saveTracker} disabled={loading || saving} aria-disabled={loading || saving}>
            {saving ? (<span className="btn-content">Saving... <span className="spinner" aria-hidden="true"></span></span>) : '💾 Save Today\'s Tracker'}
          </button>
        </div>
      </div>
    </>
  )
}
