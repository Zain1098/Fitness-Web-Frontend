import { useEffect, useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
const FitnessChatbot = lazy(() => import('../components/FitnessChatbot.jsx'))
import Tutorial from '../components/Tutorial.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { googleFitApi } from '../api/googleFit.js'
import { showToast } from '../components/Toast.jsx'
import './DailyTracker.css'

export default function DailyTracker() {
  const { token, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tracker, setTracker] = useState({
    water: 0,
    steps: 0,
    sleep: 0,
    mood: '',
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
  const [googleFitStatus, setGoogleFitStatus] = useState({ connected: false, lastSynced: null })
  const [syncing, setSyncing] = useState(false)
  const [showGoogleFitModal, setShowGoogleFitModal] = useState(false)

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
    loadGoogleFitStatus()
  }, [selectedDate, token])
  
  useEffect(() => {
    const googleFitParam = searchParams.get('googlefit')
    if (googleFitParam === 'connected') {
      showToast('✅ Google Fit connected successfully!', 'success', 6000)
      setSearchParams({})
      handleSync()
    }
  }, [searchParams])

  const loadGoogleFitStatus = async () => {
    if (!token) return
    try {
      const status = await googleFitApi.getStatus(token)
      setGoogleFitStatus(status)
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
      showToast('❌ Failed to connect Google Fit', 'error', 5000)
    }
  }

  const handleSync = async () => {
    if (!token) return
    try {
      setSyncing(true)
      const result = await googleFitApi.sync(30, token)
      const { summary } = result
      
      let message = `✅ Synced ${result.synced} days`
      const details = []
      if (summary.stepsCount > 0) details.push(`${summary.stepsCount} days steps`)
      if (summary.caloriesCount > 0) details.push(`${summary.caloriesCount} days calories`)
      if (summary.sleepCount > 0) details.push(`${summary.sleepCount} days sleep`)
      if (summary.activeMinutesCount > 0) details.push(`${summary.activeMinutesCount} days activity`)
      
      if (details.length > 0) {
        message += `: ${details.join(', ')}`
      }
      
      showToast(message, 'success', 6000)
      loadTracker()
      loadGoogleFitStatus()
    } catch (err) {
      const errorMsg = err.message || 'Sync failed'
      if (errorMsg.includes('Token expired')) {
        showToast('⚠️ Session expired. Please reconnect Google Fit.', 'warning', 6000)
        setGoogleFitStatus({ connected: false, lastSynced: null })
      } else {
        showToast('❌ ' + errorMsg, 'error', 5000)
      }
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Fit? Your data will remain but won\'t sync anymore.')) return
    try {
      await googleFitApi.disconnect(token)
      setGoogleFitStatus({ connected: false, lastSynced: null })
      showToast('✅ Google Fit disconnected', 'success', 5000)
    } catch (err) {
      showToast('❌ Failed to disconnect', 'error', 5000)
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

      if (res && (res.error || res.message)) {
        setError(res.error || res.message || 'Failed to save')
        setTimeout(() => setError(''), 3000)
      } else {
        setSuccess('✅ Saved!')
        setTimeout(() => setSuccess(''), 2000)
        // Clear dashboard cache so fresh data loads
        sessionStorage.removeItem('dashboardCache')
        sessionStorage.removeItem('dashboardCacheTime')
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
      <Tutorial page="dailyTracker" />
      
      {/* Google Fit Setup Modal */}
      {showGoogleFitModal && (
        <div className="googlefit-modal-overlay" onClick={() => setShowGoogleFitModal(false)}>
          <div className="googlefit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGoogleFitModal(false)}>×</button>
            
            <div className="modal-icon">📱</div>
            <h2>Connect Google Fit</h2>
            <p className="modal-subtitle">Auto-sync your fitness data from Google Fit app</p>
            
            <div className="setup-steps">
              <div className="setup-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>📲 Install Google Fit App</h4>
                  <p>Download from <strong>Play Store</strong> (Android) or <strong>App Store</strong> (iPhone)</p>
                </div>
              </div>
              
              <div className="setup-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>📧 Use Same Email</h4>
                  <p>Login with <strong>same email</strong> you use on FitForge</p>
                </div>
              </div>
              
              <div className="setup-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>📊 Track in Google Fit</h4>
                  <p>App will <strong>auto-track steps</strong>. Manually add <strong>weight & calories</strong> in app</p>
                </div>
              </div>
              
              <div className="setup-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>🔗 Connect & Sync</h4>
                  <p>Click below to connect, then use <strong>🔄 Sync button</strong> to import data</p>
                </div>
              </div>
            </div>
            
            <div className="benefits-section">
              <h4>✨ Benefits</h4>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span>👟</span>
                  <span>Auto steps tracking</span>
                </div>
                <div className="benefit-item">
                  <span>⚖️</span>
                  <span>Weight sync</span>
                </div>
                <div className="benefit-item">
                  <span>🔥</span>
                  <span>Calories burned</span>
                </div>
                <div className="benefit-item">
                  <span>💪</span>
                  <span>Active minutes</span>
                </div>
              </div>
            </div>
            
            <button className="connect-now-btn" onClick={handleConnectGoogleFit}>
              🚀 Connect Google Fit Now
            </button>
          </div>
        </div>
      )}
      
      <div className="daily-tracker-page">
        <div className="tracker-container">
          <div className="tracker-header">
            <h1>📅 Daily Tracker</h1>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-picker"
                max={new Date().toISOString().split('T')[0]}
              />
              {!googleFitStatus.connected ? (
                <button 
                  className="googlefit-connect-btn"
                  onClick={() => setShowGoogleFitModal(true)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #4285f4, #34a853)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  📱 Connect Google Fit
                </button>
              ) : (
                <div style={{display: 'flex', gap: '8px'}}>
                  <button 
                    className="googlefit-sync-btn"
                    onClick={handleSync}
                    disabled={syncing}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(66, 133, 244, 0.2)',
                      border: '1px solid #4285f4',
                      borderRadius: '8px',
                      color: '#4285f4',
                      fontWeight: '600',
                      cursor: syncing ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      opacity: syncing ? 0.6 : 1
                    }}
                  >
                    {syncing ? '🔄 Syncing...' : '🔄 Sync'}
                  </button>
                  <button 
                    onClick={handleDisconnect}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 107, 53, 0.2)',
                      border: '1px solid #ff6b35',
                      borderRadius: '8px',
                      color: '#ff6b35',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    title="Disconnect Google Fit"
                  >
                    🔌
                  </button>
                </div>
              )}
            </div>
          </div>

          {googleFitStatus.connected && googleFitStatus.lastSynced && (
            <div style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.12), rgba(52, 168, 83, 0.08))',
              border: '1px solid rgba(66, 133, 244, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              position: 'relative'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span style={{fontSize: '1.5rem'}}>📱</span>
                <div>
                  <div style={{color: '#4285f4', fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px'}}>
                    Google Fit Connected
                  </div>
                  <div style={{color: '#999', fontSize: '0.8rem'}}>
                    Last synced: {new Date(googleFitStatus.lastSynced).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              <div 
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 193, 7, 0.2)',
                  border: '2px solid #ffc107',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'help',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: '#ffc107',
                  flexShrink: 0
                }}
                title="Google Fit data may take up to 24 hours to sync. Today's data might appear tomorrow."
              >
                i
              </div>
            </div>
          )}

          {success && <div role="status" aria-live="polite" className="message success">{success}</div>}
          {error && <div role="status" aria-live="assertive" className="message error">{error}</div>}

          {/* Weekly Insights */}
          <div className="insights-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📊 Weekly Insights</h2>
              <button 
                className="analytics-link-btn"
                data-tutorial="view-analytics"
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
            <div className="tracker-card" data-tutorial="water-intake">
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
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>👟 Steps</h3>
                {tracker.dataSource === 'googlefit' && (
                  <span style={{
                    padding: '4px 10px',
                    background: 'rgba(66, 133, 244, 0.2)',
                    border: '1px solid #4285f4',
                    borderRadius: '6px',
                    color: '#4285f4',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    📱 Google Fit
                  </span>
                )}
              </div>
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
