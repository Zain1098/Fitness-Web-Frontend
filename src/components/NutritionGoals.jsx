import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './NutritionGoals.css'

export default function NutritionGoals() {
  const { token, user } = useAuth()
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 67,
    water: 8, // glasses
    fiber: 25 // grams
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [tempGoals, setTempGoals] = useState(goals)

  // Calculate goals based on user profile
  const calculateGoals = () => {
    if (!user?.profile) return

    const { weight, height, age, gender, activityLevel, goal } = user.profile
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    }

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2)

    // Adjust based on goal
    let targetCalories = tdee
    if (goal === 'lose_weight') {
      targetCalories = tdee - 500 // 1 lb per week
    } else if (goal === 'gain_weight') {
      targetCalories = tdee + 500 // 1 lb per week
    }

    // Calculate macros (40% carbs, 30% protein, 30% fat)
    const protein = Math.round((targetCalories * 0.3) / 4) // 4 cal per gram
    const carbs = Math.round((targetCalories * 0.4) / 4) // 4 cal per gram  
    const fats = Math.round((targetCalories * 0.3) / 9) // 9 cal per gram

    const calculatedGoals = {
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
      water: weight >= 70 ? 10 : 8, // More water for heavier people
      fiber: Math.round(targetCalories / 1000 * 14) // 14g per 1000 calories
    }

    setGoals(calculatedGoals)
    setTempGoals(calculatedGoals)
  }

  const saveGoals = async () => {
    try {
      setSaving(true)
      await api('/user/nutrition-goals', {
        method: 'POST',
        body: tempGoals,
        token
      })
      setGoals(tempGoals)
      setEditing(false)
    } catch (err) {
      console.error('Failed to save goals:', err)
    } finally {
      setSaving(false)
    }
  }

  const resetToCalculated = () => {
    calculateGoals()
  }

  const getGoalStatus = (current, target) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return 'achieved'
    if (percentage >= 80) return 'close'
    if (percentage >= 50) return 'progress'
    return 'low'
  }

  const goalPresets = {
    'Weight Loss': {
      calories: Math.round(goals.calories * 0.8),
      protein: Math.round(goals.protein * 1.2),
      carbs: Math.round(goals.carbs * 0.7),
      fats: Math.round(goals.fats * 0.8),
      water: goals.water + 2,
      fiber: goals.fiber + 5
    },
    'Muscle Gain': {
      calories: Math.round(goals.calories * 1.15),
      protein: Math.round(goals.protein * 1.5),
      carbs: Math.round(goals.carbs * 1.2),
      fats: Math.round(goals.fats * 1.1),
      water: goals.water + 3,
      fiber: goals.fiber
    },
    'Maintenance': {
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fats: goals.fats,
      water: goals.water,
      fiber: goals.fiber
    }
  }

  const applyPreset = (presetName) => {
    setTempGoals(goalPresets[presetName])
  }

  return (
    <div className="nutrition-goals">
      <div className="goals-header">
        <div>
          <h3>🎯 Daily Nutrition Goals</h3>
          <p className="goals-subtitle">Set your daily targets based on your fitness goals</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="info-btn"
            title="Learn how auto-calculate works"
          >
            {showInfo ? '❌ Close Info' : 'ℹ️ How it Works'}
          </button>
          <button 
            onClick={calculateGoals}
            className="calculate-btn"
            title="Auto-calculate based on your weight, height, age & activity level"
          >
            🧮 Auto Calculate
          </button>
          <button 
            onClick={() => setEditing(!editing)}
            className={`edit-btn ${editing ? 'active' : ''}`}
          >
            {editing ? '❌ Cancel' : '✏️ Edit Goals'}
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="calculation-info">
          <div className="info-card">
            <h4>📐 How Auto-Calculate Works:</h4>
            <ul>
              <li><strong>Step 1:</strong> Calculates your BMR (Basal Metabolic Rate) using Mifflin-St Jeor formula</li>
              <li><strong>Step 2:</strong> Multiplies by your activity level to get TDEE (Total Daily Energy Expenditure)</li>
              <li><strong>Step 3:</strong> Adjusts calories based on your goal:
                <ul>
                  <li>Weight Loss: -500 cal/day (1 lb/week)</li>
                  <li>Weight Gain: +500 cal/day (1 lb/week)</li>
                  <li>Maintenance: No change</li>
                </ul>
              </li>
              <li><strong>Step 4:</strong> Distributes macros: 30% Protein, 40% Carbs, 30% Fats</li>
            </ul>
          </div>
        </div>
      )}

      {editing && (
        <div className="goal-presets">
          <h4>⚡ Quick Presets:</h4>
          <p className="preset-hint">Choose a preset based on your fitness goal</p>
          <div className="preset-buttons">
            <button
              onClick={() => applyPreset('Weight Loss')}
              className="preset-btn weight-loss"
              title="Lower calories, higher protein, lower carbs"
            >
              🔥 Weight Loss
              <span className="preset-desc">-20% calories, +20% protein</span>
            </button>
            <button
              onClick={() => applyPreset('Muscle Gain')}
              className="preset-btn muscle-gain"
              title="Higher calories, much higher protein"
            >
              💪 Muscle Gain
              <span className="preset-desc">+15% calories, +50% protein</span>
            </button>
            <button
              onClick={() => applyPreset('Maintenance')}
              className="preset-btn maintenance"
              title="Balanced macros for maintaining weight"
            >
              ⚖️ Maintenance
              <span className="preset-desc">Balanced nutrition</span>
            </button>
          </div>
        </div>
      )}

      <div className="goals-grid">
        <div className="goal-card calories">
          <div className="goal-icon">🔥</div>
          <div className="goal-content">
            <div className="goal-label">Daily Calories</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.calories}
                onChange={(e) => setTempGoals({...tempGoals, calories: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.calories}</div>
            )}
            <div className="goal-unit">kcal</div>
          </div>
        </div>

        <div className="goal-card protein">
          <div className="goal-icon">💪</div>
          <div className="goal-content">
            <div className="goal-label">Protein</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.protein}
                onChange={(e) => setTempGoals({...tempGoals, protein: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.protein}</div>
            )}
            <div className="goal-unit">grams</div>
          </div>
        </div>

        <div className="goal-card carbs">
          <div className="goal-icon">🌾</div>
          <div className="goal-content">
            <div className="goal-label">Carbohydrates</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.carbs}
                onChange={(e) => setTempGoals({...tempGoals, carbs: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.carbs}</div>
            )}
            <div className="goal-unit">grams</div>
          </div>
        </div>

        <div className="goal-card fats">
          <div className="goal-icon">🥑</div>
          <div className="goal-content">
            <div className="goal-label">Fats</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.fats}
                onChange={(e) => setTempGoals({...tempGoals, fats: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.fats}</div>
            )}
            <div className="goal-unit">grams</div>
          </div>
        </div>

        <div className="goal-card water">
          <div className="goal-icon">💧</div>
          <div className="goal-content">
            <div className="goal-label">Water</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.water}
                onChange={(e) => setTempGoals({...tempGoals, water: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.water}</div>
            )}
            <div className="goal-unit">glasses</div>
          </div>
        </div>

        <div className="goal-card fiber">
          <div className="goal-icon">🌿</div>
          <div className="goal-content">
            <div className="goal-label">Fiber</div>
            {editing ? (
              <input
                type="number"
                value={tempGoals.fiber}
                onChange={(e) => setTempGoals({...tempGoals, fiber: Number(e.target.value)})}
                className="goal-input"
              />
            ) : (
              <div className="goal-value">{goals.fiber}</div>
            )}
            <div className="goal-unit">grams</div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="goals-actions">
          <button 
            onClick={saveGoals}
            disabled={saving}
            className="save-btn"
          >
            {saving ? '⏳ Saving...' : '💾 Save Goals'}
          </button>
        </div>
      )}

      <div className="goals-info">
        <h4>📊 Goal Breakdown</h4>
        <div className="macro-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Protein:</span>
            <span className="breakdown-value">{Math.round((goals.protein * 4 / goals.calories) * 100)}% of calories</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Carbs:</span>
            <span className="breakdown-value">{Math.round((goals.carbs * 4 / goals.calories) * 100)}% of calories</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Fats:</span>
            <span className="breakdown-value">{Math.round((goals.fats * 9 / goals.calories) * 100)}% of calories</span>
          </div>
        </div>
      </div>
    </div>
  )
}