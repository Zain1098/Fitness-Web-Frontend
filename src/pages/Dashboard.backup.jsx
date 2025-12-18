import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { API_BASE_URL } from '../config/api.js'
import { showToast } from '../components/Toast.jsx'
import './Dashboard.css'

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    workouts: 0,
    meals: 0,
    progress: 0,
    exercises: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    workouts: 0,
    weight: 0
  })
  const [weeklyProgress, setWeeklyProgress] = useState({
    workouts: 0,
    meals: 0,
    goal: 7
  })
  const [streak, setStreak] = useState(0)
  const [weightTrend, setWeightTrend] = useState([])
  const [goalProgress, setGoalProgress] = useState({ current: 0, target: 0, percentage: 0 })
  const [achievements, setAchievements] = useState([])
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' })
  const [calorieGoal, setCalorieGoal] = useState(2000)
  const [todayTracker, setTodayTracker] = useState({ water: 0, steps: 0, sleep: 0, mood: '' })

  const loadDashboardData = async () => {
    if (!token) return
    try {
      setLoading(true)
      
      // Fetch summary
      const summaryData = await api('/reports/summary', { token })
      setSummary(summaryData || { workouts: 0, meals: 0, progress: 0, exercises: 0 })
      
      // Fetch recent data
      const [workouts, nutrition, progress] = await Promise.all([
        api('/workouts', { token }).catch(() => []),
        api('/nutrition', { token }).catch(() => []),
        api('/progress', { token }).catch(() => [])
      ])
      
      // Calculate today's stats
      const today = new Date().toDateString()
      const todayNutrition = (nutrition.items || nutrition || []).filter(n => 
        new Date(n.date).toDateString() === today
      )
      const todayWorkouts = (workouts || []).filter(w => 
        new Date(w.date).toDateString() === today
      )
      const latestProgress = (progress || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )[0]
      
      const todayCalories = todayNutrition.reduce((sum, meal) => {
        return sum + (meal.items || []).reduce((s, item) => s + (item.calories || 0), 0)
      }, 0)
      
      setTodayStats({
        calories: todayCalories,
        workouts: todayWorkouts.length,
        weight: latestProgress?.weight || 0
      })
      
      // Calculate weekly progress
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const weekWorkouts = (workouts || []).filter(w => new Date(w.date) >= weekAgo)
      const weekMeals = (nutrition.items || nutrition || []).filter(n => new Date(n.date) >= weekAgo)
      
      setWeeklyProgress({
        workouts: weekWorkouts.length,
        meals: weekMeals.length,
        goal: 7
      })
      
      // Calculate streak
      const sortedWorkouts = (workouts || []).sort((a, b) => new Date(b.date) - new Date(a.date))
      let currentStreak = 0
      let lastDate = new Date()
      
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date)
        const daysDiff = Math.floor((lastDate - workoutDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 1) {
          currentStreak++
          lastDate = workoutDate
        } else {
          break
        }
      }
      
      setStreak(currentStreak)
      
      // Weight trend (last 7 days)
      const last7Days = (progress || []).slice(0, 7).reverse()
      setWeightTrend(last7Days.map(p => ({ date: p.date, weight: p.weight })))
      
      // Goal progress
      const userData = await api('/auth/me', { token }).catch(() => null)
      const targetWeight = userData?.onboarding_data?.target_weight || userData?.preferences?.targetWeight
      if (latestProgress?.weight && targetWeight) {
        const current = latestProgress.weight
        const startWeight = (progress || []).sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.weight || current
        const totalToLose = Math.abs(startWeight - targetWeight)
        const lost = Math.abs(startWeight - current)
        const percentage = Math.min((lost / totalToLose) * 100, 100)
        setGoalProgress({ current, target: targetWeight, percentage: percentage.toFixed(1) })
      }
      
      // Calculate achievements
      const badges = []
      if (summary.workouts >= 1) badges.push({ icon: '🏋️', title: 'First Workout', desc: 'Completed your first workout' })
      if (summary.workouts >= 10) badges.push({ icon: '💪', title: 'Workout Warrior', desc: '10 workouts completed' })
      if (summary.workouts >= 50) badges.push({ icon: '🔥', title: 'Fitness Beast', desc: '50 workouts completed' })
      if (streak >= 3) badges.push({ icon: '⚡', title: '3-Day Streak', desc: 'Worked out 3 days in a row' })
      if (streak >= 7) badges.push({ icon: '🌟', title: 'Week Warrior', desc: '7-day workout streak' })
      if (summary.meals >= 10) badges.push({ icon: '🍽️', title: 'Nutrition Tracker', desc: '10 meals logged' })
      if (summary.progress >= 5) badges.push({ icon: '📈', title: 'Progress Pro', desc: '5 progress entries' })
      setAchievements(badges)
      
      // Daily motivational quote
      const quotes = [
        { text: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
        { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
        { text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'Unknown' },
        { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Unknown' },
        { text: 'Don\'t wish for it, work for it.', author: 'Unknown' },
        { text: 'Strive for progress, not perfection.', author: 'Unknown' },
        { text: 'The difference between try and triumph is a little umph.', author: 'Unknown' }
      ]
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
      setDailyQuote(quotes[dayOfYear % quotes.length])
      
      // Load today's tracker data
      const trackerData = await api('/tracker/today', { token }).catch(() => null)
      if (trackerData) {
        setTodayTracker({
          water: trackerData.water || 0,
          steps: trackerData.steps || 0,
          sleep: trackerData.sleep || 0,
          mood: trackerData.mood || ''
        })
      }
      
      // Calculate calorie goal
      const userPrefs = userData?.preferences || {}
      if (userPrefs.age && userPrefs.weight && userPrefs.height) {
        const bmr = userPrefs.gender === 'male' 
          ? 10 * userPrefs.weight + 6.25 * userPrefs.height - 5 * userPrefs.age + 5
          : 10 * userPrefs.weight + 6.25 * userPrefs.height - 5 * userPrefs.age - 161
        const activityMultiplier = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[userPrefs.activityLevel] || 1.2
        setCalorieGoal(Math.round(bmr * activityMultiplier))
      }
      
      // Build recent activity
      const activities = []
      
      workouts.slice(0, 3).forEach(w => {
        activities.push({
          type: 'workout',
          icon: '💪',
          title: w.name || `${w.category} Workout`,
          subtitle: `${w.exercises?.length || 0} exercises`,
          date: w.date,
          color: '#ff6b35'
        })
      })
      
      todayNutrition.slice(0, 2).forEach(n => {
        activities.push({
          type: 'nutrition',
          icon: '🍽️',
          title: `${n.mealType} logged`,
          subtitle: `${n.items?.length || 0} items`,
          date: n.date,
          color: '#4caf50'
        })
      })
      
      if (latestProgress) {
        activities.push({
          type: 'progress',
          icon: '📈',
          title: 'Progress updated',
          subtitle: `${latestProgress.weight} kg`,
          date: latestProgress.date,
          color: '#2196f3'
        })
      }
      
      setRecentActivity(activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5))
      
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const payment = searchParams.get('payment')
    const plan = searchParams.get('plan')
    
    if (payment === 'success' && plan) {
      showToast(`🎉 Payment successful! Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`, 'success')
      setSearchParams({})
    } else if (payment === 'cancelled') {
      showToast('Payment was cancelled', 'info')
      setSearchParams({})
    }
    
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [token, searchParams])

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>👋 Welcome back, {user.username}!</h1>
              <p>Here's your fitness overview</p>
            </div>
            <button className="refresh-btn" onClick={loadDashboardData}>
              🔄 Refresh
            </button>
          </div>

          {/* Daily Quote */}
          {dailyQuote.text && (
            <div className="quote-section">
              <div className="quote-icon">💬</div>
              <div className="quote-content">
                <p className="quote-text">"{dailyQuote.text}"</p>
                <p className="quote-author">- {dailyQuote.author}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">🔄</div>
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Today's Stats */}
              <div className="today-section">
                <h2>📅 Today's Summary</h2>
                <div className="today-grid">
                  <div className="today-card calories">
                    <div className="today-icon">🔥</div>
                    <div className="today-info">
                      <span className="today-value">{todayStats.calories}</span>
                      <span className="today-label">Calories</span>
                    </div>
                  </div>
                  <div className="today-card workouts">
                    <div className="today-icon">💪</div>
                    <div className="today-info">
                      <span className="today-value">{todayStats.workouts}</span>
                      <span className="today-label">Workouts</span>
                    </div>
                  </div>
                  <div className="today-card weight">
                    <div className="today-icon">⚖️</div>
                    <div className="today-info">
                      <span className="today-value">{todayStats.weight > 0 ? `${todayStats.weight} kg` : '-'}</span>
                      <span className="today-label">Weight</span>
                    </div>
                  </div>
                  <div className="today-card streak">
                    <div className="today-icon">🔥</div>
                    <div className="today-info">
                      <span className="today-value">{streak}</span>
                      <span className="today-label">Day Streak</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Stats */}
              <div className="stats-section">
                <h2>📊 Overall Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/workouts');
                  }}>
                    <div className="stat-icon">🏋️</div>
                    <div className="stat-info">
                      <span className="stat-value">{summary.workouts}</span>
                      <span className="stat-label">Total Workouts</span>
                    </div>
                    <div className="stat-arrow">→</div>
                  </div>
                  
                  <div className="stat-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/nutrition');
                  }}>
                    <div className="stat-icon">🥗</div>
                    <div className="stat-info">
                      <span className="stat-value">{summary.meals}</span>
                      <span className="stat-label">Meals Logged</span>
                    </div>
                    <div className="stat-arrow">→</div>
                  </div>
                  
                  <div className="stat-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/progress');
                  }}>
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <span className="stat-value">{summary.progress}</span>
                      <span className="stat-label">Progress Entries</span>
                    </div>
                    <div className="stat-arrow">→</div>
                  </div>
                  
                  <div className="stat-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/exercises');
                  }}>
                    <div className="stat-icon">💪</div>
                    <div className="stat-info">
                      <span className="stat-value">{summary.exercises || '1300+'}</span>
                      <span className="stat-label">Exercises Available</span>
                    </div>
                    <div className="stat-arrow">→</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="achievements-section">
                  <h2>🏆 Your Achievements</h2>
                  <div className="achievements-grid">
                    {achievements.map((badge, index) => (
                      <div key={index} className="achievement-badge">
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <div className="badge-title">{badge.title}</div>
                          <div className="badge-desc">{badge.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal Progress */}
              {goalProgress.target > 0 && (
                <div className="goal-section">
                  <h2>🎯 Goal Progress</h2>
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info">
                        <span className="goal-current">{goalProgress.current} kg</span>
                        <span className="goal-arrow">→</span>
                        <span className="goal-target">{goalProgress.target} kg</span>
                      </div>
                      <div className="goal-percentage">{goalProgress.percentage}%</div>
                    </div>
                    <div className="goal-progress-bar">
                      <div className="goal-progress-fill" style={{ width: `${goalProgress.percentage}%` }}>
                        <span className="progress-label">{goalProgress.percentage}% Complete</span>
                      </div>
                    </div>
                    <div className="goal-footer">
                      <span>💪 Keep going! You're doing great!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weight Trend Chart */}
              {weightTrend.length > 0 && (
                <div className="chart-section">
                  <h2>📈 Weight Trend (Last 7 Days)</h2>
                  <div className="chart-container">
                    <svg viewBox="0 0 600 200" className="trend-chart">
                      <defs>
                        <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const weights = weightTrend.map(d => d.weight)
                        const maxWeight = Math.max(...weights)
                        const minWeight = Math.min(...weights)
                        const range = maxWeight - minWeight || 1
                        
                        const points = weightTrend.map((d, i) => {
                          const x = (i / (weightTrend.length - 1)) * 580 + 10
                          const y = 180 - ((d.weight - minWeight) / range) * 160
                          return `${x},${y}`
                        }).join(' ')
                        
                        const areaPoints = `10,180 ${points} ${580 + 10},180`
                        
                        return (
                          <>
                            <polygon points={areaPoints} fill="url(#weightGradient)" />
                            <polyline points={points} fill="none" stroke="#ff6b35" strokeWidth="3" />
                            {weightTrend.map((d, i) => {
                              const x = (i / (weightTrend.length - 1)) * 580 + 10
                              const y = 180 - ((d.weight - minWeight) / range) * 160
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="5" fill="#ff6b35" />
                                  <text x={x} y="195" textAnchor="middle" fill="#999" fontSize="12">
                                    {new Date(d.date).getDate()}
                                  </text>
                                </g>
                              )
                            })}
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {/* Weekly Progress */}
              <div className="weekly-section">
                <h2>📆 This Week</h2>
                <div className="weekly-grid">
                  <div className="weekly-card">
                    <div className="weekly-header">
                      <span className="weekly-icon">🏋️</span>
                      <span className="weekly-title">Workouts</span>
                    </div>
                    <div className="weekly-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill workouts"
                          style={{ width: `${Math.min((weeklyProgress.workouts / weeklyProgress.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {weeklyProgress.workouts} / {weeklyProgress.goal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="weekly-card">
                    <div className="weekly-header">
                      <span className="weekly-icon">🍽️</span>
                      <span className="weekly-title">Meals Tracked</span>
                    </div>
                    <div className="weekly-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill meals"
                          style={{ width: `${Math.min((weeklyProgress.meals / 21) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {weeklyProgress.meals} / 21
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section">
                <h2>🕐 Recent Activity</h2>
                {recentActivity.length === 0 ? (
                  <div className="empty-activity">
                    <div className="empty-icon">📝</div>
                    <h3>No activity yet</h3>
                    <p>Start tracking your fitness journey!</p>
                    <div className="quick-actions">
                      <button className="action-btn" onClick={() => {
                        fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                        navigate('/workouts');
                      }}>
                        💪 Add Workout
                      </button>
                      <button className="action-btn" onClick={() => {
                        fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                        navigate('/nutrition');
                      }}>
                        🍽️ Log Meal
                      </button>
                      <button className="action-btn" onClick={() => {
                        fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                        navigate('/progress');
                      }}>
                        📈 Track Progress
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div 
                          className="activity-icon"
                          style={{ backgroundColor: `${activity.color}20`, color: activity.color }}
                        >
                          {activity.icon}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-subtitle">{activity.subtitle}</div>
                        </div>
                        <div className="activity-time">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Tracker Preview */}
              <div className="tracker-preview-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>📅 Today's Tracker</h2>
                  <button 
                    className="view-full-btn"
                    onClick={() => {
                      fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                      navigate('/tracker');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 107, 53, 0.2)',
                      border: '1px solid #ff6b35',
                      borderRadius: '8px',
                      color: '#ff6b35',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    View Full Tracker →
                  </button>
                </div>
                <div className="tracker-quick-grid">
                  <div className="tracker-quick-card">
                    <span className="tracker-icon">💧</span>
                    <span className="tracker-label">Water</span>
                    <span className="tracker-value">Track daily</span>
                  </div>
                  <div className="tracker-quick-card">
                    <span className="tracker-icon">👟</span>
                    <span className="tracker-label">Steps</span>
                    <span className="tracker-value">10k goal</span>
                  </div>
                  <div className="tracker-quick-card">
                    <span className="tracker-icon">😴</span>
                    <span className="tracker-label">Sleep</span>
                    <span className="tracker-value">7-9 hours</span>
                  </div>
                  <div className="tracker-quick-card">
                    <span className="tracker-icon">😊</span>
                    <span className="tracker-label">Mood</span>
                    <span className="tracker-value">Log today</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h2>⚡ Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/exercises');
                  }}>
                    <span className="action-icon">🔍</span>
                    <span className="action-text">Browse Exercises</span>
                  </button>
                  <button className="action-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/workouts');
                  }}>
                    <span className="action-icon">➕</span>
                    <span className="action-text">Create Workout</span>
                  </button>
                  <button className="action-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/nutrition');
                  }}>
                    <span className="action-icon">🍽️</span>
                    <span className="action-text">Log Meal</span>
                  </button>
                  <button className="action-card" onClick={() => {
                    fetch(`${API_BASE_URL}/track/click`, { method: 'POST' }).catch(() => {});
                    navigate('/progress');
                  }}>
                    <span className="action-icon">📊</span>
                    <span className="action-text">Update Progress</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
