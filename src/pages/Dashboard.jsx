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
