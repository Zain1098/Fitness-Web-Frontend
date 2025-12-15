import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './MealPlanner.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍎'
}

export default function MealPlanner() {
  const { token } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(getWeekDates())
  const [mealPlan, setMealPlan] = useState({})
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 67
  })
  const [loading, setLoading] = useState(false)

  function getWeekDates() {
    const today = new Date()
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      week.push(date)
    }
    return week
  }

  const loadMealPlan = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api('/nutrition', { token })
      const entries = response.items || response || []
      
      // Group by date and meal type
      const plan = {}
      entries.forEach(entry => {
        const date = new Date(entry.date).toDateString()
        if (!plan[date]) plan[date] = {}
        plan[date][entry.mealType] = entry.items || []
      })
      
      setMealPlan(plan)
    } catch (err) {
      console.error('Failed to load meal plan:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMealPlan()
  }, [token])
  
  useEffect(() => {
    loadMealPlan()
  }, [currentWeek])

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️', 
      dinner: '🌙',
      snacks: '🍎'
    }
    return icons[mealType] || '🍽️'
  }

  const calculateDayTotals = (date) => {
    const dateStr = date.toDateString()
    const dayMeals = mealPlan[dateStr] || {}
    
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    
    Object.values(dayMeals).forEach(meals => {
      meals.forEach(item => {
        totals.calories += item.calories || 0
        totals.protein += item.protein || 0
        totals.carbs += item.carbs || 0
        totals.fats += item.fats || 0
      })
    })
    
    return totals
  }

  const getProgressPercentage = (current, goal) => {
    return Math.min(100, (current / goal) * 100)
  }

  const navigateWeek = (direction) => {
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date)
      newDate.setDate(date.getDate() + (direction * 7))
      return newDate
    })
    setCurrentWeek(newWeek)
  }

  const isCurrentWeek = () => {
    const today = new Date()
    return currentWeek.some(date => 
      date.toDateString() === today.toDateString()
    )
  }



  return (
    <div className="meal-planner">
      <div className="planner-header">
        <div>
          <h3>📅 Weekly Meal Overview</h3>
          <p className="planner-subtitle">View your logged meals from the Nutrition Tracker</p>
        </div>
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)} className="nav-btn" title="Previous week">
            ⬅️
          </button>
          <span className="week-label">
            {currentWeek[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {currentWeek[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={() => navigateWeek(1)} className="nav-btn" title="Next week">
            ➡️
          </button>
          {!isCurrentWeek() && (
            <button onClick={() => setCurrentWeek(getWeekDates())} className="today-btn" title="Go to current week">
              📍 Today
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">🔄 Loading...</div>
      ) : (
        <div className="week-table">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>🌅 Breakfast</th>
                <th>☀️ Lunch</th>
                <th>🌙 Dinner</th>
                <th>🍎 Snacks</th>
                <th>🔥 Total</th>
              </tr>
            </thead>
            <tbody>
              {currentWeek.map((date, index) => {
                const dayTotals = calculateDayTotals(date)
                const isToday = date.toDateString() === new Date().toDateString()
                const dateStr = date.toDateString()
                
                return (
                  <tr key={dateStr} className={isToday ? 'today-row' : ''}>
                    <td className="day-cell">
                      <div className="day-name">{DAYS_OF_WEEK[index].slice(0, 3)}</div>
                      <div className="day-date">{date.getDate()}</div>
                      {isToday && <span className="today-dot">•</span>}
                    </td>
                    {MEAL_TYPES.map(mealType => {
                      const meals = mealPlan[dateStr]?.[mealType] || []
                      const mealCals = meals.reduce((sum, m) => sum + (m.calories || 0), 0)
                      
                      return (
                        <td key={mealType} className="meal-cell">
                          {meals.length > 0 ? (
                            <div className="meal-info">
                              <div className="meal-count">{meals.length} item{meals.length > 1 ? 's' : ''}</div>
                              <div className="meal-cals">{Math.round(mealCals)} cal</div>
                            </div>
                          ) : (
                            <div className="meal-empty">-</div>
                          )}
                        </td>
                      )
                    })}
                    <td className="total-cell">
                      <div className="total-cals">{Math.round(dayTotals.calories)}</div>
                      <div className="total-macros">
                        P:{Math.round(dayTotals.protein)} C:{Math.round(dayTotals.carbs)} F:{Math.round(dayTotals.fats)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}