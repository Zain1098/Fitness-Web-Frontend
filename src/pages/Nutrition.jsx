import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import FoodDatabase from '../components/FoodDatabase.jsx'
import MealPlanner from '../components/MealPlanner.jsx'
import NutritionGoals from '../components/NutritionGoals.jsx'
import RecipeBuilder from '../components/RecipeBuilder.jsx'
import NutritionAnalytics from '../components/NutritionAnalytics.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { logActivity } from '../utils/activityLogger.js'
import './Nutrition.css'

export default function Nutrition() {
  const { token, user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('tracker')
  const [showFoodDatabase, setShowFoodDatabase] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form states
  const [mealType, setMealType] = useState('breakfast')
  const [food, setFood] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')
  
  // Stats
  const [dailyStats, setDailyStats] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 })

  const loadEntries = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api('/nutrition', { token })
      const data = response.items || response || []
      setEntries(data)
      calculateDailyStats(data)
    } catch (err) {
      setError(err.message || 'Failed to load nutrition entries')
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyStats = (data) => {
    const today = new Date().toDateString()
    const todayEntries = data.filter(entry => 
      new Date(entry.date).toDateString() === today
    )
    
    const stats = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    todayEntries.forEach(entry => {
      entry.items?.forEach(item => {
        stats.calories += item.calories || 0
        stats.protein += item.protein || 0
        stats.carbs += item.carbs || 0
        stats.fats += item.fats || 0
      })
    })
    setDailyStats(stats)
  }

  useEffect(() => {
    loadEntries()
  }, [token])

  const clearMessages = () => {
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 3000)
  }

  const addMeal = async () => {
    if (!food.trim()) {
      setError('Please enter a food item')
      clearMessages()
      return
    }
    
    try {
      setAdding(true)
      await api('/nutrition', {
        method: 'POST',
        body: {
          mealType,
          items: [{
            name: food.trim(),
            quantity: Number(quantity) || 100,
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fats: Number(fats) || 0
          }]
        },
        token
      })
      
      // Reset form
      setFood('')
      setQuantity('100')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFats('')
      
      setSuccess('Meal added successfully!')
      clearMessages()
      loadEntries()
      logActivity('meal_logged', `Logged ${mealType} - ${food.trim()}`, 'nutrition', user);
    } catch (err) {
      setError('Failed to add meal')
      clearMessages()
    } finally {
      setAdding(false)
    }
  }

  const fetchNutrition = async () => {
    if (!food.trim()) {
      setError('Please enter a food item first')
      clearMessages()
      return
    }
    
    if (!token) {
      setError('Please login to use nutrition lookup')
      clearMessages()
      return
    }
    
    try {
      setFetching(true)
      const searchQuery = `${quantity}g ${food.trim()}`
      const data = await api(`/nutrition-lookup?ingr=${encodeURIComponent(searchQuery)}`, { token })
      
      if (data.calories) {
        setCalories(Math.round(data.calories).toString())
        const nutrients = data.totalNutrients || {}
        setProtein(Math.round(nutrients.PROCNT?.quantity || 0).toString())
        setCarbs(Math.round(nutrients.CHOCDF?.quantity || 0).toString())
        setFats(Math.round(nutrients.FAT?.quantity || 0).toString())
        setSuccess('Nutrition data fetched!')
      } else {
        setError('No nutrition data found for this food')
      }
      clearMessages()
    } catch (err) {
      setError('Could not find nutrition data. Try a different food name or enter manually.')
      clearMessages()
    } finally {
      setFetching(false)
    }
  }

  const deleteMeal = async (id) => {
    try {
      await api(`/nutrition/${id}`, { method: 'DELETE', token })
      setSuccess('Meal deleted successfully!')
      clearMessages()
      loadEntries()
      logActivity('meal_deleted', 'Deleted a meal entry', 'nutrition', user);
    } catch (err) {
      setError('Failed to delete meal')
      clearMessages()
    }
  }

  const handleFoodSelect = (selectedFood) => {
    setFood(selectedFood.name)
    setQuantity('100')
    setCalories(selectedFood.calories.toString())
    setProtein(selectedFood.protein.toString())
    setCarbs(selectedFood.carbs.toString())
    setFats(selectedFood.fats.toString())
    setShowFoodDatabase(false)
    setSuccess(`Selected ${selectedFood.name} from database!`)
    clearMessages()
  }

  const quickAddMeal = async (foodName, nutrition, mealTypeOverride = null) => {
    try {
      setAdding(true)
      await api('/nutrition', {
        method: 'POST',
        body: {
          mealType: mealTypeOverride || mealType,
          items: [{
            name: foodName,
            quantity: 100,
            ...nutrition
          }]
        },
        token
      })
      
      setSuccess(`${foodName} added successfully!`)
      clearMessages()
      loadEntries()
    } catch (err) {
      setError('Failed to add meal')
      clearMessages()
    } finally {
      setAdding(false)
    }
  }

  const getMealIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍎'
    }
    return icons[type] || '🍽️'
  }

  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="nutrition-page">
        <div className="nutrition-container">
          {/* Header */}
          <div className="nutrition-header">
            <h1>🥗 Professional Nutrition Hub</h1>
            <p>Complete nutrition tracking with meal planning, goals, and food database</p>
          </div>

          {/* Navigation Tabs */}
          <div className="nutrition-tabs">
            <button 
              className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => {
                api('/track/click', { method: 'POST', token });
                setActiveTab('tracker');
              }}
            >
              📊 Nutrition Tracker
            </button>
            <button 
              className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              🎯 Goals & Targets
            </button>
            <button 
              className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              📅 Meal Planner
            </button>
            <button 
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              🍽️ Food Database
            </button>
            <button 
              className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipes')}
            >
              👨🍳 Recipe Builder
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Messages */}
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          {/* Tab Content */}
          {activeTab === 'goals' && <NutritionGoals />}
          {activeTab === 'planner' && <MealPlanner />}
          {activeTab === 'database' && (
            <div className="database-tab">
              <div className="database-search">
                <input
                  type="text"
                  placeholder="🔍 Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <FoodDatabase onSelectFood={handleFoodSelect} searchTerm={searchTerm} />
            </div>
          )}
          {activeTab === 'recipes' && <RecipeBuilder />}
          {activeTab === 'analytics' && <NutritionAnalytics />}

          {activeTab === 'tracker' && (
            <div>
              {/* Daily Stats */}
              <div className="daily-stats">
            <div className="stats-header">
              <h2>📊 Today's Summary</h2>
              <div className="quick-actions">
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    setShowFoodDatabase(!showFoodDatabase);
                  }}
                  className="quick-btn"
                >
                  🍽️ Browse Foods
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Water', { calories: 0, protein: 0, carbs: 0, fats: 0 });
                  }}
                  className="quick-btn"
                >
                  💧 Add Water
                </button>
                <button 
                  onClick={() => setActiveTab('recipes')}
                  className="quick-btn"
                >
                  👨🍳 Create Recipe
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="quick-btn"
                >
                  📊 View Analytics
                </button>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card calories">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <span className="stat-value">{Math.round(dailyStats.calories)}</span>
                  <span className="stat-label">Calories</span>
                  <div className="stat-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(100, (dailyStats.calories / 2000) * 100)}%`}}></div>
                    </div>
                    <span className="progress-text">{Math.round((dailyStats.calories / 2000) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="stat-card protein">
                <div className="stat-icon">💪</div>
                <div className="stat-info">
                  <span className="stat-value">{Math.round(dailyStats.protein)}g</span>
                  <span className="stat-label">Protein</span>
                  <div className="stat-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(100, (dailyStats.protein / 150) * 100)}%`}}></div>
                    </div>
                    <span className="progress-text">{Math.round((dailyStats.protein / 150) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="stat-card carbs">
                <div className="stat-icon">🌾</div>
                <div className="stat-info">
                  <span className="stat-value">{Math.round(dailyStats.carbs)}g</span>
                  <span className="stat-label">Carbs</span>
                  <div className="stat-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(100, (dailyStats.carbs / 250) * 100)}%`}}></div>
                    </div>
                    <span className="progress-text">{Math.round((dailyStats.carbs / 250) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="stat-card fats">
                <div className="stat-icon">🥑</div>
                <div className="stat-info">
                  <span className="stat-value">{Math.round(dailyStats.fats)}g</span>
                  <span className="stat-label">Fats</span>
                  <div className="stat-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(100, (dailyStats.fats / 67) * 100)}%`}}></div>
                    </div>
                    <span className="progress-text">{Math.round((dailyStats.fats / 67) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Food Database Quick Access */}
          {showFoodDatabase && (
            <div className="quick-database">
              <div className="database-header">
                <h3>🍽️ Quick Food Selection</h3>
                <button 
                  onClick={() => setShowFoodDatabase(false)}
                  className="close-btn"
                >
                  ❌
                </button>
              </div>
              <FoodDatabase onSelectFood={handleFoodSelect} searchTerm={searchTerm} />
            </div>
          )}

          {/* Add Meal Form */}
          <div className="add-meal-section">
            <div className="section-header">
              <h2>➕ Add New Meal</h2>
              <div className="meal-shortcuts">
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Quick Breakfast', { calories: 350, protein: 20, carbs: 40, fats: 12 }, 'breakfast');
                  }}
                  className="shortcut-btn breakfast"
                >
                  🌅 Quick Breakfast
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Quick Lunch', { calories: 500, protein: 30, carbs: 50, fats: 18 }, 'lunch');
                  }}
                  className="shortcut-btn lunch"
                >
                  ☀️ Quick Lunch
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Quick Dinner', { calories: 600, protein: 35, carbs: 60, fats: 20 }, 'dinner');
                  }}
                  className="shortcut-btn dinner"
                >
                  🌙 Quick Dinner
                </button>
              </div>
            </div>
            <div className="meal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Meal Type</label>
                  <select 
                    value={mealType} 
                    onChange={(e) => setMealType(e.target.value)}
                    className="form-select"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snacks">🍎 Snacks</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Food Item</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={food}
                      onChange={(e) => setFood(e.target.value)}
                      placeholder="e.g., Chicken breast, Rice, Apple"
                      className="form-input"
                    />
                    <button 
                      onClick={() => setShowFoodDatabase(true)}
                      className="browse-btn"
                      title="Browse food database"
                    >
                      🔍
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Quantity (g)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="nutrition-inputs">
                <div className="form-group">
                  <label>Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  onClick={fetchNutrition} 
                  disabled={fetching || !food.trim()}
                  className="btn-secondary"
                  title="Auto-fill nutrition data using USDA API"
                >
                  {fetching ? '🔄 Fetching...' : '🔍 Auto-Fill Nutrition'}
                </button>
                <button 
                  onClick={() => setShowFoodDatabase(true)} 
                  className="btn-secondary"
                  title="Browse our food database"
                >
                  🍽️ Browse Database
                </button>
                <button 
                  onClick={() => alert('Barcode scanner coming soon! This will allow you to scan product barcodes for instant nutrition data.')}
                  className="btn-secondary"
                  title="Scan product barcode (Coming Soon)"
                >
                  📱 Scan Barcode
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    addMeal();
                  }} 
                  disabled={adding || !food.trim()}
                  className="btn-primary"
                >
                  {adding ? '⏳ Adding...' : '➕ Add Meal'}
                </button>
              </div>
              <div className="api-info">
                <p>💡 Professional Nutrition Tracking Platform</p>
                <div className="features-list">
                  <span className="feature">🔍 USDA API Integration</span>
                  <span className="feature">🍽️ 100+ Curated Foods</span>
                  <span className="feature">📊 Advanced Analytics</span>
                  <span className="feature">📅 Meal Planning</span>
                  <span className="feature">👨🍳 Recipe Builder</span>
                  <span className="feature">🎯 Goal Tracking</span>
                  <span className="feature">📱 Barcode Scanner*</span>
                  <span className="feature">🏆 Achievement System</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>* Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Nutrition Entries */}
          <div className="entries-section">
            <h2>📝 Nutrition History</h2>
            {loading ? (
              <div className="loading">🔄 Loading nutrition entries...</div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No nutrition entries yet</h3>
                <p>Start tracking your meals to see them here!</p>
              </div>
            ) : (
              <div className="entries-list">
                {Object.entries(groupedEntries)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, dayEntries]) => (
                    <div key={date} className="day-group">
                      <h3 className="day-header">
                        📅 {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="meals-grid">
                        {dayEntries.map((entry) => (
                          <div key={entry._id} className="meal-card">
                            <div className="meal-header">
                              <div className="meal-type">
                                <span className="meal-icon">{getMealIcon(entry.mealType)}</span>
                                <span className="meal-name">{entry.mealType}</span>
                              </div>
                              <button 
                                onClick={() => deleteMeal(entry._id)}
                                className="delete-btn"
                                title="Delete meal"
                              >
                                🗑️
                              </button>
                            </div>
                            <div className="meal-items">
                              {entry.items?.map((item, index) => (
                                <div key={index} className="food-item">
                                  <div className="food-name">{item.name}</div>
                                  <div className="food-nutrition">
                                    <span className="nutrition-badge calories">
                                      🔥 {item.calories || 0} cal
                                    </span>
                                    <span className="nutrition-badge protein">
                                      💪 {item.protein || 0}g
                                    </span>
                                    <span className="nutrition-badge carbs">
                                      🌾 {item.carbs || 0}g
                                    </span>
                                    <span className="nutrition-badge fats">
                                      🥑 {item.fats || 0}g
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  )
}