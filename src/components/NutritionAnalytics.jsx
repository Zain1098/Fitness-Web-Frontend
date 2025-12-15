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
      const entries = await api('/nutrition', { token })
      const data = entries.items || entries || []
      
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      const recentEntries = data.filter(e => new Date(e.date) >= cutoffDate)
      
      // Calculate averages
      const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, days: 0 }
      const dailyTotals = {}
      
      recentEntries.forEach(entry => {
        const dateKey = new Date(entry.date).toDateString()
        if (!dailyTotals[dateKey]) {
          dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0 }
        }
        entry.items?.forEach(item => {
          dailyTotals[dateKey].calories += item.calories || 0
          dailyTotals[dateKey].protein += item.protein || 0
          dailyTotals[dateKey].carbs += item.carbs || 0
          dailyTotals[dateKey].fats += item.fats || 0
        })
      })
      
      const dayCount = Object.keys(dailyTotals).length || 1
      Object.values(dailyTotals).forEach(day => {
        totals.calories += day.calories
        totals.protein += day.protein
        totals.carbs += day.carbs
        totals.fats += day.fats
      })
      
      const weeklyAverage = {
        calories: Math.round(totals.calories / dayCount),
        protein: Math.round(totals.protein / dayCount),
        carbs: Math.round(totals.carbs / dayCount),
        fats: Math.round(totals.fats / dayCount)
      }
      
      // Top foods
      const foodFreq = {}
      recentEntries.forEach(entry => {
        entry.items?.forEach(item => {
          if (!foodFreq[item.name]) {
            foodFreq[item.name] = { frequency: 0, calories: 0 }
          }
          foodFreq[item.name].frequency++
          foodFreq[item.name].calories += item.calories || 0
        })
      })
      
      const topFoods = Object.entries(foodFreq)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
      
      // Meal distribution
      const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }
      recentEntries.forEach(entry => {
        mealCounts[entry.mealType] = (mealCounts[entry.mealType] || 0) + 1
      })
      const totalMeals = Object.values(mealCounts).reduce((a, b) => a + b, 0) || 1
      const mealDistribution = {
        breakfast: Math.round((mealCounts.breakfast / totalMeals) * 100),
        lunch: Math.round((mealCounts.lunch / totalMeals) * 100),
        dinner: Math.round((mealCounts.dinner / totalMeals) * 100),
        snacks: Math.round((mealCounts.snacks / totalMeals) * 100)
      }
      
      // Streaks
      const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(b) - new Date(a))
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i])
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)
        
        if (date.toDateString() === expectedDate.toDateString()) {
          currentStreak++
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          if (i === 0) currentStreak = 0
          tempStreak = 0
        }
      }
      
      // Nutrition score
      let score = 50
      if (weeklyAverage.protein >= 100) score += 15
      if (weeklyAverage.calories >= 1500 && weeklyAverage.calories <= 2500) score += 15
      if (currentStreak >= 3) score += 10
      if (dayCount >= days * 0.8) score += 10
      
      setAnalytics({
        weeklyAverage,
        topFoods,
        mealDistribution,
        nutritionScore: Math.min(100, score),
        streaks: { current: currentStreak, longest: longestStreak },
        deficiencies: weeklyAverage.protein < 80 ? ['Protein'] : [],
        achievements: []
      })
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setAnalytics({
        weeklyAverage: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        topFoods: [],
        mealDistribution: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
        nutritionScore: 0,
        streaks: { current: 0, longest: 0 },
        deficiencies: [],
        achievements: []
      })
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

        {/* Macro Balance */}
        <div className="analytics-card macro-balance-card">
          <h4>⚖️ Macro Balance</h4>
          <div className="macro-chart">
            <div className="macro-bar">
              <div className="macro-segment protein" style={{width: `${(analytics.weeklyAverage.protein * 4 / (analytics.weeklyAverage.calories || 1) * 100)}%`}}>
                <span className="macro-label">P</span>
              </div>
              <div className="macro-segment carbs" style={{width: `${(analytics.weeklyAverage.carbs * 4 / (analytics.weeklyAverage.calories || 1) * 100)}%`}}>
                <span className="macro-label">C</span>
              </div>
              <div className="macro-segment fats" style={{width: `${(analytics.weeklyAverage.fats * 9 / (analytics.weeklyAverage.calories || 1) * 100)}%`}}>
                <span className="macro-label">F</span>
              </div>
            </div>
            <div className="macro-legend">
              <div className="legend-item">
                <span className="legend-color protein"></span>
                <span>Protein {Math.round(analytics.weeklyAverage.protein * 4 / (analytics.weeklyAverage.calories || 1) * 100)}%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color carbs"></span>
                <span>Carbs {Math.round(analytics.weeklyAverage.carbs * 4 / (analytics.weeklyAverage.calories || 1) * 100)}%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color fats"></span>
                <span>Fats {Math.round(analytics.weeklyAverage.fats * 9 / (analytics.weeklyAverage.calories || 1) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="analytics-card insights-card">
          <h4>💡 Smart Insights</h4>
          <div className="insights-list">
            {analytics.weeklyAverage.protein >= 100 && (
              <div className="insight-item positive">
                <span className="insight-icon">💪</span>
                <span>Excellent protein intake! Great for muscle recovery.</span>
              </div>
            )}
            {analytics.weeklyAverage.protein < 80 && (
              <div className="insight-item warning">
                <span className="insight-icon">⚠️</span>
                <span>Protein intake is low. Aim for 100-150g daily.</span>
              </div>
            )}
            {analytics.streaks.current >= 7 && (
              <div className="insight-item positive">
                <span className="insight-icon">🔥</span>
                <span>{analytics.streaks.current} day streak! Consistency is key.</span>
              </div>
            )}
            {analytics.weeklyAverage.calories < 1500 && (
              <div className="insight-item warning">
                <span className="insight-icon">🍽️</span>
                <span>Calorie intake seems low. Consider eating more.</span>
              </div>
            )}
            {analytics.weeklyAverage.calories > 2500 && (
              <div className="insight-item warning">
                <span className="insight-icon">⚠️</span>
                <span>High calorie intake. Monitor portion sizes.</span>
              </div>
            )}
            {analytics.topFoods.length > 0 && (
              <div className="insight-item">
                <span className="insight-icon">🍽️</span>
                <span>Most eaten: {analytics.topFoods[0]?.name} ({analytics.topFoods[0]?.frequency}x)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}