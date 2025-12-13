import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './NutritionAnalytics.css'

export default function NutritionAnalytics() {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState({
    weeklyAverage: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    monthlyTrend: [],
    topFoods: [],
    mealDistribution: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
    nutritionScore: 0,
    streaks: { current: 0, longest: 0 },
    deficiencies: [],
    achievements: []
  })
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api(`/nutrition/analytics?range=${timeRange}`, { token })
      
      const mockAnalytics = {
        weeklyAverage: { calories: 1850, protein: 125, carbs: 220, fats: 65 },
        monthlyTrend: [],
        topFoods: [
          { name: 'Chicken Breast', frequency: 15, calories: 2475 },
          { name: 'Brown Rice', frequency: 12, calories: 1332 },
          { name: 'Broccoli', frequency: 10, calories: 340 },
          { name: 'Greek Yogurt', frequency: 8, calories: 472 },
          { name: 'Almonds', frequency: 6, calories: 3474 }
        ],
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        nutritionScore: 85,
        streaks: { current: 5, longest: 12 },
        deficiencies: ['Vitamin D', 'Omega-3', 'Fiber'],
        achievements: [
          { name: 'Protein Goal Master', description: 'Hit protein goal 7 days in a row', icon: '💪', date: '2024-01-07' },
          { name: 'Consistent Tracker', description: 'Logged meals for 30 days straight', icon: '📊', date: '2024-01-05' },
          { name: 'Balanced Eater', description: 'Maintained macro balance for a week', icon: '⚖️', date: '2024-01-03' }
        ]
      }
      
      setAnalytics(mockAnalytics)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      const fallbackData = {
        weeklyAverage: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        monthlyTrend: [],
        topFoods: [],
        mealDistribution: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
        nutritionScore: 0,
        streaks: { current: 0, longest: 0 },
        deficiencies: [],
        achievements: []
      }
      setAnalytics(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, token])

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'
    if (score >= 60) return '#ff9800'
    return '#ff6b6b'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍎'
    }
    return icons[mealType] || '🍽️'
  }

  if (loading) {
    return (
      <div className="nutrition-analytics">
        <div className="loading">🔄 Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="nutrition-analytics">
      <div className="analytics-header">
        <h3>📊 Nutrition Analytics</h3>
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Nutrition Score */}
        <div className="analytics-card score-card">
          <h4>🎯 Nutrition Score</h4>
          <div className="score-display">
            <div 
              className="score-circle"
              style={{ 
                background: `conic-gradient(${getScoreColor(analytics.nutritionScore)} ${analytics.nutritionScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
              }}
            >
              <div className="score-inner">
                <span className="score-value">{analytics.nutritionScore}</span>
                <span className="score-max">/100</span>
              </div>
            </div>
            <div className="score-label" style={{ color: getScoreColor(analytics.nutritionScore) }}>
              {getScoreLabel(analytics.nutritionScore)}
            </div>
          </div>
        </div>

        {/* Weekly Average */}
        <div className="analytics-card average-card">
          <h4>📈 {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Average</h4>
          <div className="average-stats">
            <div className="avg-stat">
              <span className="avg-icon">🔥</span>
              <span className="avg-value">{Math.round(analytics.weeklyAverage?.calories || 0)}</span>
              <span className="avg-label">Calories</span>
            </div>
            <div className="avg-stat">
              <span className="avg-icon">💪</span>
              <span className="avg-value">{Math.round(analytics.weeklyAverage?.protein || 0)}g</span>
              <span className="avg-label">Protein</span>
            </div>
            <div className="avg-stat">
              <span className="avg-icon">🌾</span>
              <span className="avg-value">{Math.round(analytics.weeklyAverage?.carbs || 0)}g</span>
              <span className="avg-label">Carbs</span>
            </div>
            <div className="avg-stat">
              <span className="avg-icon">🥑</span>
              <span className="avg-value">{Math.round(analytics.weeklyAverage?.fats || 0)}g</span>
              <span className="avg-label">Fats</span>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="analytics-card streaks-card">
          <h4>🔥 Tracking Streaks</h4>
          <div className="streaks-display">
            <div className="streak-item">
              <span className="streak-icon">⚡</span>
              <div className="streak-info">
                <span className="streak-value">{analytics.streaks.current}</span>
                <span className="streak-label">Current Streak</span>
              </div>
            </div>
            <div className="streak-item">
              <span className="streak-icon">🏆</span>
              <div className="streak-info">
                <span className="streak-value">{analytics.streaks.longest}</span>
                <span className="streak-label">Longest Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Distribution */}
        <div className="analytics-card distribution-card">
          <h4>🍽️ Meal Distribution</h4>
          <div className="meal-distribution">
            {Object.entries(analytics.mealDistribution).map(([meal, percentage]) => (
              <div key={meal} className="meal-dist-item">
                <div className="meal-dist-header">
                  <span className="meal-icon">{getMealIcon(meal)}</span>
                  <span className="meal-name">{meal}</span>
                  <span className="meal-percentage">{percentage}%</span>
                </div>
                <div className="meal-dist-bar">
                  <div 
                    className="meal-dist-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Foods */}
        <div className="analytics-card top-foods-card">
          <h4>🥇 Most Consumed Foods</h4>
          <div className="top-foods-list">
            {analytics.topFoods.map((food, index) => (
              <div key={food.name} className="top-food-item">
                <div className="food-rank">#{index + 1}</div>
                <div className="food-info">
                  <span className="food-name">{food.name}</span>
                  <span className="food-stats">{food.frequency} times • {food.calories} cal total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deficiencies */}
        <div className="analytics-card deficiencies-card">
          <h4>⚠️ Potential Deficiencies</h4>
          <div className="deficiencies-list">
            {analytics.deficiencies.length > 0 ? (
              analytics.deficiencies.map(deficiency => (
                <div key={deficiency} className="deficiency-item">
                  <span className="deficiency-icon">⚠️</span>
                  <span className="deficiency-name">{deficiency}</span>
                </div>
              ))
            ) : (
              <div className="no-deficiencies">
                <span className="success-icon">✅</span>
                <span>No major deficiencies detected!</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="analytics-card achievements-card">
          <h4>🏆 Recent Achievements</h4>
          <div className="achievements-list">
            {analytics.achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                  <span className="achievement-date">{new Date(achievement.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="analytics-card insights-card">
          <h4>💡 Quick Insights</h4>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">📈</span>
              <span>Your protein intake is 15% above target - great for muscle building!</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">💧</span>
              <span>Consider increasing water intake by 2 glasses daily.</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🥬</span>
              <span>Add more leafy greens for better micronutrient balance.</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">⏰</span>
              <span>Your meal timing is consistent - keep it up!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}