import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './MealPlanner.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

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
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    
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
      // Load meal plan for current week
      const startDate = currentWeek[0].toISOString().split('T')[0]
      const endDate = currentWeek[6].toISOString().split('T')[0]
      
      const response = await api(`/nutrition?startDate=${startDate}&endDate=${endDate}`, { token })
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
  }, [currentWeek, token])

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

  const addQuickMeal = async (date, mealType, mealName, nutrition) => {
    try {
      await api('/nutrition', {
        method: 'POST',
        body: {
          date: date.toISOString(),
          mealType,
          items: [{
            name: mealName,
            quantity: 100,
            ...nutrition
          }]
        },
        token
      })
      loadMealPlan()
    } catch (err) {
      console.error('Failed to add meal:', err)
    }
  }

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)} className="nav-btn">
            ⬅️ Previous Week
          </button>
          <h3>
            📅 Week of {currentWeek[0].toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} - {currentWeek[6].toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </h3>
          <button onClick={() => navigateWeek(1)} className="nav-btn">
            Next Week ➡️
          </button>
        </div>
        
        {!isCurrentWeek() && (
          <button 
            onClick={() => setCurrentWeek(getWeekDates())} 
            className="current-week-btn"
          >
            📍 Go to Current Week
          </button>
        )}
      </div>

      <div className="nutrition-goals">
        <h4>🎯 Daily Nutrition Goals</h4>
        <div className="goals-grid">
          <div className="goal-item">
            <span className="goal-icon">🔥</span>
            <span className="goal-value">{goals.calories}</span>
            <span className="goal-label">Calories</span>
          </div>
          <div className="goal-item">
            <span className="goal-icon">💪</span>
            <span className="goal-value">{goals.protein}g</span>
            <span className="goal-label">Protein</span>
          </div>
          <div className="goal-item">
            <span className="goal-icon">🌾</span>
            <span className="goal-value">{goals.carbs}g</span>
            <span className="goal-label">Carbs</span>
          </div>
          <div className="goal-item">
            <span className="goal-icon">🥑</span>
            <span className="goal-value">{goals.fats}g</span>
            <span className="goal-label">Fats</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">🔄 Loading meal plan...</div>
      ) : (
        <div className="week-grid">
          {currentWeek.map((date, index) => {
            const dayTotals = calculateDayTotals(date)
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div key={date.toDateString()} className={`day-card ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <h4>{DAYS_OF_WEEK[index]}</h4>
                  <p>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  {isToday && <span className="today-badge">Today</span>}
                </div>

                <div className="day-progress">
                  <div className="progress-item">
                    <span className="progress-label">🔥 {Math.round(dayTotals.calories)}/{goals.calories}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill calories" 
                        style={{ width: `${getProgressPercentage(dayTotals.calories, goals.calories)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="day-meals">
                  {MEAL_TYPES.map(mealType => {
                    const dateStr = date.toDateString()
                    const meals = mealPlan[dateStr]?.[mealType] || []
                    
                    return (
                      <div key={mealType} className="meal-slot">
                        <div className="meal-header">
                          <span className="meal-icon">{getMealIcon(mealType)}</span>
                          <span className="meal-name">{mealType}</span>
                        </div>
                        
                        {meals.length > 0 ? (
                          <div className="meal-items">
                            {meals.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="meal-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-calories">{item.calories || 0} cal</span>
                              </div>
                            ))}
                            {meals.length > 2 && (
                              <div className="more-items">+{meals.length - 2} more</div>
                            )}
                          </div>
                        ) : (
                          <div className="empty-meal">
                            <button 
                              className="add-meal-btn"
                              onClick={() => addQuickMeal(date, mealType, 'Quick Meal', { calories: 300, protein: 20, carbs: 30, fats: 10 })}
                            >
                              ➕ Add Meal
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="day-summary">
                  <div className="macro-summary">
                    <span className="macro">💪 {Math.round(dayTotals.protein)}g</span>
                    <span className="macro">🌾 {Math.round(dayTotals.carbs)}g</span>
                    <span className="macro">🥑 {Math.round(dayTotals.fats)}g</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}