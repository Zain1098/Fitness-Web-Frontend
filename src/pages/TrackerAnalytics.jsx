import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './TrackerAnalytics.css'

export default function TrackerAnalytics() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    avgWater: 0,
    avgSleep: 0,
    avgSteps: 0
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const loadTrackerData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api('/tracker/list?limit=90', { token })
      setTrackers(data || [])
      calculateStats(data || [])
    } catch (err) {
      console.error('Failed to load tracker data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    if (data.length === 0) return

    const workouts = data.filter(d => d.workoutCompleted).length
    const avgWater = (data.reduce((sum, d) => sum + (d.water || 0), 0) / data.length).toFixed(1)
    const avgSleep = (data.reduce((sum, d) => sum + (d.sleep || 0), 0) / data.length).toFixed(1)
    const avgSteps = Math.round(data.reduce((sum, d) => sum + (d.steps || 0), 0) / data.length)

    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].workoutCompleted) {
        tempStreak++
        if (i === 0) currentStreak = tempStreak
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        if (i === 0) currentStreak = 0
        tempStreak = 0
      }
    }

    setStats({
      totalWorkouts: workouts,
      currentStreak,
      longestStreak,
      avgWater,
      avgSleep,
      avgSteps
    })
  }

  useEffect(() => {
    loadTrackerData()
  }, [token])

  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(selectedYear, selectedMonth, i)
      const tracker = trackers.find(t => 
        new Date(t.date).toDateString() === date.toDateString()
      )
      days.push({ date, tracker })
    }
    
    return days
  }

  const getMoodEmoji = (mood) => {
    const moods = {
      great: '😊',
      good: '🙂',
      okay: '😐',
      low: '😔',
      bad: '😫'
    }
    return moods[mood] || '😐'
  }

  const getIntensityClass = (tracker) => {
    if (!tracker) return 'empty'
    let score = 0
    if (tracker.workoutCompleted) score += 4
    if (tracker.water >= 6) score += 2
    if (tracker.sleep >= 7 && tracker.sleep <= 9) score += 2
    if (tracker.steps >= 8000) score += 2
    
    if (score >= 8) return 'high'
    if (score >= 5) return 'medium'
    if (score >= 2) return 'low'
    return 'minimal'
  }

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="tracker-analytics-page">
        <div className="analytics-container">
          <div className="analytics-header">
            <div>
              <h1>📊 Tracker Analytics</h1>
              <p>Your daily habits & workout history</p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/tracker')}>
              ← Back to Tracker
            </button>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card highlight">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <span className="stat-value">{stats.currentStreak}</span>
                <span className="stat-label">Current Streak</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalWorkouts}</span>
                <span className="stat-label">Total Workouts</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <span className="stat-value">{stats.longestStreak}</span>
                <span className="stat-label">Longest Streak</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💧</div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgWater}</span>
                <span className="stat-label">Avg Water/Day</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">😴</div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgSleep}h</span>
                <span className="stat-label">Avg Sleep</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👟</div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgSteps.toLocaleString()}</span>
                <span className="stat-label">Avg Steps</span>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="calendar-section">
            <div className="calendar-header">
              <h2>📅 Activity Calendar</h2>
              <div className="month-selector">
                <button onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11)
                    setSelectedYear(selectedYear - 1)
                  } else {
                    setSelectedMonth(selectedMonth - 1)
                  }
                }}>←</button>
                <span>{new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0)
                    setSelectedYear(selectedYear + 1)
                  } else {
                    setSelectedMonth(selectedMonth + 1)
                  }
                }} disabled={selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()}>→</button>
              </div>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-day-header">Sun</div>
              <div className="calendar-day-header">Mon</div>
              <div className="calendar-day-header">Tue</div>
              <div className="calendar-day-header">Wed</div>
              <div className="calendar-day-header">Thu</div>
              <div className="calendar-day-header">Fri</div>
              <div className="calendar-day-header">Sat</div>
              
              {getCalendarDays().map((day, idx) => (
                <div 
                  key={idx} 
                  className={`calendar-day ${day ? getIntensityClass(day.tracker) : 'empty'}`}
                  title={day?.tracker ? `${day.tracker.workoutCompleted ? '✅ Workout' : '⭕ No workout'} | Water: ${day.tracker.water}/8 | Sleep: ${day.tracker.sleep}h` : ''}
                >
                  {day && (
                    <>
                      <span className="day-number">{day.date.getDate()}</span>
                      {day.tracker?.workoutCompleted && <span className="workout-badge">💪</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <div className="calendar-legend">
              <span>Less</span>
              <div className="legend-box empty"></div>
              <div className="legend-box minimal"></div>
              <div className="legend-box low"></div>
              <div className="legend-box medium"></div>
              <div className="legend-box high"></div>
              <span>More</span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <h2>📈 Trends (Last 30 Days)</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>💧 Water Intake</h3>
                <div className="bar-chart">
                  {trackers.slice(0, 30).reverse().map((t, idx) => (
                    <div key={idx} className="bar-wrapper">
                      <div 
                        className="bar water"
                        style={{ height: `${(t.water / 8) * 100}%` }}
                        title={`${new Date(t.date).toLocaleDateString()}: ${t.water} glasses`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="chart-label">Goal: 8 glasses/day</div>
              </div>

              <div className="chart-card">
                <h3>😴 Sleep Hours</h3>
                <div className="bar-chart">
                  {trackers.slice(0, 30).reverse().map((t, idx) => (
                    <div key={idx} className="bar-wrapper">
                      <div 
                        className="bar sleep"
                        style={{ height: `${(t.sleep / 10) * 100}%` }}
                        title={`${new Date(t.date).toLocaleDateString()}: ${t.sleep}h`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="chart-label">Goal: 7-9 hours</div>
              </div>

              <div className="chart-card">
                <h3>👟 Steps</h3>
                <div className="bar-chart">
                  {trackers.slice(0, 30).reverse().map((t, idx) => (
                    <div key={idx} className="bar-wrapper">
                      <div 
                        className="bar steps"
                        style={{ height: `${(t.steps / 15000) * 100}%` }}
                        title={`${new Date(t.date).toLocaleDateString()}: ${t.steps.toLocaleString()} steps`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="chart-label">Goal: 10,000 steps</div>
              </div>
            </div>
          </div>

          {/* Workout History */}
          <div className="history-section">
            <h2>💪 Workout History</h2>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : trackers.filter(t => t.workoutCompleted).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💪</div>
                <h3>No workouts logged yet</h3>
                <p>Start tracking your workouts in the Daily Tracker!</p>
                <button className="btn-primary" onClick={() => navigate('/tracker')}>
                  Go to Tracker
                </button>
              </div>
            ) : (
              <div className="history-list">
                {trackers
                  .filter(t => t.workoutCompleted)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((tracker, idx) => (
                    <div key={tracker._id} className="history-item">
                      <div className="history-badge">✅</div>
                      <div className="history-content">
                        <div className="history-date">
                          {new Date(tracker.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="history-stats">
                          <span>💧 {tracker.water}/8</span>
                          <span>😴 {tracker.sleep}h</span>
                          <span>👟 {tracker.steps.toLocaleString()}</span>
                          <span>{getMoodEmoji(tracker.mood)} {tracker.mood}</span>
                          <span>⚡ {tracker.energy}/10</span>
                        </div>
                        {tracker.notes && (
                          <div className="history-notes">📝 {tracker.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
