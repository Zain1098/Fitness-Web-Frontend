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

  const loadDashboardData = async (forceRefresh = false) => {
    if (!token) return
    
    // Cache check - 5 minutes cache
    if (!forceRefresh) {
      const cached = sessionStorage.getItem('dashboardCache')
      const cacheTime = sessionStorage.getItem('dashboardCacheTime')
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
        const data = JSON.parse(cached)
        setSummary(data.summary)
        setTodayStats(data.todayStats)
        setWeeklyProgress(data.weeklyProgress)
        setStreak(data.streak)
        setWeightTrend(data.weightTrend)
        setGoalProgress(data.goalProgress)
        setAchievements(data.achievements)
        setRecentActivity(data.recentActivity)
        setCalorieGoal(data.calorieGoal)
        setTodayTracker(data.todayTracker)
        setLoading(false)
        return
      }
    }
    
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
      
      // Cache the data
      const cacheData = {
        summary, todayStats, weeklyProgress, streak, weightTrend,
        goalProgress, achievements, recentActivity: activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
        calorieGoal: Math.round(bmr * activityMultiplier) || 2000,
        todayTracker: trackerData || { water: 0, steps: 0, sleep: 0, mood: '' }
      }
      sessionStorage.setItem('dashboardCache', JSON.stringify(cacheData))
      sessionStorage.setItem('dashboardCacheTime', Date.now().toString())
      
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
    // Refresh every 2 minutes instead of 30 seconds
    const interval = setInterval(() => loadDashboardData(false), 120000)
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
            <button 
              className="refresh-btn" 
              onClick={() => loadDashboardData(true)}
              aria-label="Refresh dashboard data"
            >
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
              <div className="skeleton-grid">
                <div className="skeleton-card skeleton-focus"></div>
                <div className="skeleton-card skeleton-chart"></div>
                <div className="skeleton-card skeleton-activity"></div>
                <div className="skeleton-card skeleton-actions"></div>
              </div>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div className="dashboard-main">
              {/* Today's Focus */}
              <div className="focus-section">
                <h2>🎯 Today's Focus</h2>
                <div className="focus-grid">
                  <div className="focus-card calories" onClick={() => navigate('/nutrition')}>
                    <div className="calorie-ring">
                      <svg width="100" height="100">
                        <circle className="calorie-ring-bg" cx="50" cy="50" r="40" />
                        <circle 
                          className="calorie-ring-progress" 
                          cx="50" 
                          cy="50" 
                          r="40"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(todayStats.calories / calorieGoal, 1))}`}
                        />
                      </svg>
                      <div className="calorie-ring-text">
                        <span className="calorie-ring-value">{todayStats.calories}</span>
                        <span className="calorie-ring-label">/ {calorieGoal}</span>
                      </div>
                    </div>
                    <div className="focus-info">
                      <span className="focus-label">Calories</span>
                      <span className="focus-subtitle">{Math.round((todayStats.calories / calorieGoal) * 100)}% of goal</span>
                    </div>
                  </div>
                  <div className="focus-card" onClick={() => navigate('/workouts')}>
                    <div className="focus-icon">💪</div>
                    <div className="focus-info">
                      <span className="focus-value">{todayStats.workouts}</span>
                      <span className="focus-label">Workouts</span>
                    </div>
                  </div>
                  <div className="focus-card" onClick={() => navigate('/progress')}>
                    <div className="focus-icon">⚖️</div>
                    <div className="focus-info">
                      <span className="focus-value">{todayStats.weight > 0 ? `${todayStats.weight} kg` : '-'}</span>
                      <span className="focus-label">Weight</span>
                    </div>
                  </div>
                  <div className="focus-card" onClick={() => navigate('/tracker')}>
                    <div className="focus-icon">💧</div>
                    <div className="focus-info">
                      <span className="focus-value">{todayTracker.water || 0}</span>
                      <span className="focus-label">Water (L)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Chart */}
              {weightTrend.length > 0 && (
                <div className="chart-section">
                  <h2>📈 Weight Trend</h2>
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



              {/* Weekly Progress + Recent Activity */}
              <div className="combined-section">
                <div className="weekly-compact">
                  <h3>📆 This Week</h3>
                  <div className="weekly-bars">
                    <div className="weekly-item">
                      <div className="weekly-label">
                        <span>🏋️ Workouts</span>
                        <span>{weeklyProgress.workouts}/{weeklyProgress.goal}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill workouts" style={{ width: `${Math.min((weeklyProgress.workouts / weeklyProgress.goal) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="weekly-item">
                      <div className="weekly-label">
                        <span>🍽️ Meals</span>
                        <span>{weeklyProgress.meals}/21</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill meals" style={{ width: `${Math.min((weeklyProgress.meals / 21) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="recent-compact">
                  <h3>🕐 Recent Activity</h3>
                  {recentActivity.length === 0 ? (
                    <p className="no-activity">No recent activity</p>
                  ) : (
                    <div className="activity-compact-list">
                      {recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="activity-compact-item">
                          <span className="activity-compact-icon" style={{ color: activity.color }}>{activity.icon}</span>
                          <div className="activity-compact-info">
                            <span className="activity-compact-title">{activity.title}</span>
                            <span className="activity-compact-time">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-main">
                <h2>⚡ Quick Actions</h2>
                <div className="actions-grid-main">
                  <button className="action-card-main" onClick={() => navigate('/workouts')}>
                    <span className="action-icon-main">🏋️</span>
                    <span className="action-text-main">Start Workout</span>
                  </button>
                  <button className="action-card-main" onClick={() => navigate('/nutrition')}>
                    <span className="action-icon-main">🍽️</span>
                    <span className="action-text-main">Log Meal</span>
                  </button>
                  <button className="action-card-main" onClick={() => navigate('/progress')}>
                    <span className="action-icon-main">📈</span>
                    <span className="action-text-main">Track Progress</span>
                  </button>
                  <button className="action-card-main" onClick={() => navigate('/exercises')}>
                    <span className="action-icon-main">🔍</span>
                    <span className="action-text-main">Browse Exercises</span>
                  </button>
                </div>
              </div>
            </div>

              {/* Sidebar */}
              <div className="dashboard-sidebar">
                {/* Streak + Goal */}
                <div className="sidebar-card">
                  <div className="streak-display">
                    <div className="streak-icon">🔥</div>
                    <div className="streak-info">
                      <span className="streak-value">{streak}</span>
                      <span className="streak-label">Day Streak</span>
                    </div>
                  </div>
                  {goalProgress.target > 0 && (
                    <div className="goal-compact">
                      <div className="goal-compact-header">
                        <span>🎯 Goal Progress</span>
                        <span className="goal-compact-percent">{goalProgress.percentage}%</span>
                      </div>
                      <div className="goal-progress-bar">
                        <div className="goal-progress-fill" style={{ width: `${goalProgress.percentage}%` }}></div>
                      </div>
                      <div className="goal-compact-text">{goalProgress.current} kg → {goalProgress.target} kg</div>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                {achievements.length > 0 && (
                  <div className="sidebar-card">
                    <h3>🏆 Achievements</h3>
                    <div className="achievements-compact">
                      {achievements.slice(0, 4).map((badge, index) => (
                        <div key={index} className="achievement-compact">
                          <span className="achievement-compact-icon">{badge.icon}</span>
                          <div className="achievement-compact-info">
                            <span className="achievement-compact-title">{badge.title}</span>
                            <span className="achievement-compact-desc">{badge.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracker */}
                <div className="sidebar-card tracker-sidebar" onClick={() => navigate('/tracker')}>
                  <h3>📅 Today's Tracker</h3>
                  <div className="tracker-sidebar-grid">
                    <div className="tracker-sidebar-item">
                      <span className="tracker-sidebar-icon">💧</span>
                      <span className="tracker-sidebar-value">{todayTracker.water || 0}L</span>
                    </div>
                    <div className="tracker-sidebar-item">
                      <span className="tracker-sidebar-icon">👟</span>
                      <span className="tracker-sidebar-value">{todayTracker.steps || 0}</span>
                    </div>
                    <div className="tracker-sidebar-item">
                      <span className="tracker-sidebar-icon">😴</span>
                      <span className="tracker-sidebar-value">{todayTracker.sleep || 0}h</span>
                    </div>
                    <div className="tracker-sidebar-item">
                      <span className="tracker-sidebar-icon">😊</span>
                      <span className="tracker-sidebar-value">{todayTracker.mood || 'Log'}</span>
                    </div>
                  </div>
                  <div className="tracker-sidebar-cta">Click to update →</div>
                </div>

                {/* Overall Stats */}
                <div className="sidebar-card">
                  <h3>📊 Overall Stats</h3>
                  <div className="stats-compact">
                    <div className="stat-compact-item" onClick={() => navigate('/workouts')}>
                      <span className="stat-compact-icon">🏋️</span>
                      <div className="stat-compact-info">
                        <span className="stat-compact-value">{summary.workouts}</span>
                        <span className="stat-compact-label">Workouts</span>
                      </div>
                    </div>
                    <div className="stat-compact-item" onClick={() => navigate('/nutrition')}>
                      <span className="stat-compact-icon">🥗</span>
                      <div className="stat-compact-info">
                        <span className="stat-compact-value">{summary.meals}</span>
                        <span className="stat-compact-label">Meals</span>
                      </div>
                    </div>
                    <div className="stat-compact-item" onClick={() => navigate('/progress')}>
                      <span className="stat-compact-icon">📈</span>
                      <div className="stat-compact-info">
                        <span className="stat-compact-value">{summary.progress}</span>
                        <span className="stat-compact-label">Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
