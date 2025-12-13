import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
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
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const loadTracker = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api(`/tracker?date=${selectedDate}`, { token })
      if (data) {
        setTracker(data)
      }
    } catch (err) {
      console.error('Failed to load tracker:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracker()
  }, [selectedDate, token])

  const saveTracker = async () => {
    try {
      await api('/tracker', {
        method: 'POST',
        body: { ...tracker, date: selectedDate },
        token
      })
      setSuccess('✅ Saved!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to save')
      setTimeout(() => setError(''), 2000)
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
      <FitnessChatbot />
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

          {success && <div className="message success">{success}</div>}
          {error && <div className="message error">{error}</div>}

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
                value={tracker.steps}
                onChange={(e) => setTracker({...tracker, steps: Number(e.target.value)})}
                placeholder="0"
                className="tracker-input large"
              />
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
                value={tracker.sleep}
                onChange={(e) => setTracker({...tracker, sleep: Number(e.target.value)})}
                placeholder="0"
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
                >
                  -
                </button>
                <span className="counter-value">{tracker.mealsLogged}</span>
                <button 
                  className="counter-btn"
                  onClick={() => setTracker({...tracker, mealsLogged: Math.min(6, tracker.mealsLogged + 1)})}
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

          <button className="save-btn" onClick={saveTracker}>
            💾 Save Today's Tracker
          </button>
        </div>
      </div>
    </>
  )
}
