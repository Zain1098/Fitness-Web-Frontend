import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import Tutorial from '../components/Tutorial.jsx'
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
  const [foodSuggestions, setFoodSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Form states
  const [mealType, setMealType] = useState('breakfast')
  const [food, setFood] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [baseQuantity, setBaseQuantity] = useState('100')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')
  const [baseCalories, setBaseCalories] = useState('')
  const [baseProtein, setBaseProtein] = useState('')
  const [baseCarbs, setBaseCarbs] = useState('')
  const [baseFats, setBaseFats] = useState('')
  
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
    
    // Check for duplicate meal (same food, same meal type, same day)
    const today = new Date().toDateString()
    const isDuplicate = entries.some(entry => 
      new Date(entry.date).toDateString() === today &&
      entry.mealType === mealType &&
      entry.items?.some(item => item.name.toLowerCase() === food.trim().toLowerCase())
    )
    
    if (isDuplicate) {
      setError('This food item already added to this meal today!')
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
      const searchQuery = `100g ${food.trim()}`
      const data = await api(`/nutrition-lookup?ingr=${encodeURIComponent(searchQuery)}`, { token })
      
      if (data.calories) {
        const cal = Math.round(data.calories)
        const nutrients = data.totalNutrients || {}
        const prot = Math.round(nutrients.PROCNT?.quantity || 0)
        const carb = Math.round(nutrients.CHOCDF?.quantity || 0)
        const fat = Math.round(nutrients.FAT?.quantity || 0)
        
        setBaseQuantity('100')
        setBaseCalories(cal.toString())
        setBaseProtein(prot.toString())
        setBaseCarbs(carb.toString())
        setBaseFats(fat.toString())
        
        const multiplier = Number(quantity) / 100
        setCalories(Math.round(cal * multiplier).toString())
        setProtein(Math.round(prot * multiplier).toString())
        setCarbs(Math.round(carb * multiplier).toString())
        setFats(Math.round(fat * multiplier).toString())
        
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
  
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity)
    if (baseCalories && baseQuantity) {
      const multiplier = Number(newQuantity) / Number(baseQuantity)
      setCalories(Math.round(Number(baseCalories) * multiplier).toString())
      setProtein(Math.round(Number(baseProtein) * multiplier).toString())
      setCarbs(Math.round(Number(baseCarbs) * multiplier).toString())
      setFats(Math.round(Number(baseFats) * multiplier).toString())
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
    setBaseQuantity('100')
    setBaseCalories(selectedFood.calories.toString())
    setBaseProtein(selectedFood.protein.toString())
    setBaseCarbs(selectedFood.carbs.toString())
    setBaseFats(selectedFood.fats.toString())
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

  const FOOD_DATABASE = [
    { name: 'Chicken Biryani', local: 'Murgh Biryani', cal: 200, prot: 12, carb: 28, fat: 5 },
    { name: 'Beef Nihari', local: 'Nihari', cal: 235, prot: 18, carb: 8, fat: 15 },
    { name: 'Chicken Karahi', local: 'Murgh Karahi', cal: 180, prot: 20, carb: 6, fat: 9 },
    { name: 'Daal Chawal', local: 'Daal Chawal', cal: 130, prot: 6, carb: 22, fat: 2 },
    { name: 'Haleem', local: 'Haleem', cal: 150, prot: 10, carb: 15, fat: 6 },
    { name: 'Chicken Tikka', local: 'Murgh Tikka', cal: 186, prot: 25, carb: 3, fat: 8 },
    { name: 'Seekh Kabab', local: 'Seekh Kabab', cal: 220, prot: 18, carb: 2, fat: 16 },
    { name: 'Aloo Gosht', local: 'Aloo Gosht', cal: 195, prot: 15, carb: 12, fat: 10 },
    { name: 'Palak Paneer', local: 'Palak Paneer', cal: 170, prot: 11, carb: 8, fat: 11 },
    { name: 'Chana Masala', local: 'Cholay', cal: 140, prot: 7, carb: 22, fat: 3 },
    { name: 'Chicken Breast', local: 'Murgh Seena', cal: 165, prot: 31, carb: 0, fat: 3.6 },
    { name: 'Chicken Thigh', local: 'Murgh Taang', cal: 209, prot: 26, carb: 0, fat: 11 },
    { name: 'Beef', local: 'Gosht', cal: 250, prot: 26, carb: 0, fat: 15 },
    { name: 'Mutton', local: 'Bakra', cal: 294, prot: 25, carb: 0, fat: 21 },
    { name: 'Fish', local: 'Machli', cal: 206, prot: 22, carb: 0, fat: 12 },
    { name: 'Prawns', local: 'Jhinga', cal: 99, prot: 24, carb: 0.2, fat: 0.3 },
    { name: 'Eggs', local: 'Anday', cal: 155, prot: 13, carb: 1.1, fat: 11 },
    { name: 'Egg White', local: 'Safedi', cal: 52, prot: 11, carb: 0.7, fat: 0.2 },
    { name: 'Lentils', local: 'Daal', cal: 116, prot: 9, carb: 20, fat: 0.4 },
    { name: 'Chickpeas', local: 'Chanay', cal: 164, prot: 9, carb: 27, fat: 2.6 },
    { name: 'Black Chickpeas', local: 'Kala Chana', cal: 160, prot: 8, carb: 27, fat: 2.5 },
    { name: 'Kidney Beans', local: 'Rajma', cal: 127, prot: 8.7, carb: 23, fat: 0.5 },
    { name: 'White Rice', local: 'Safaid Chawal', cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
    { name: 'Brown Rice', local: 'Bhura Chawal', cal: 111, prot: 2.6, carb: 23, fat: 0.9 },
    { name: 'Basmati Rice', local: 'Basmati', cal: 121, prot: 3, carb: 25, fat: 0.4 },
    { name: 'Roti', local: 'Roti', cal: 120, prot: 3.5, carb: 24, fat: 1.2 },
    { name: 'Naan', local: 'Naan', cal: 262, prot: 9, carb: 46, fat: 5 },
    { name: 'Paratha', local: 'Paratha', cal: 320, prot: 6, carb: 38, fat: 15 },
    { name: 'Chapati', local: 'Chapati', cal: 104, prot: 3.1, carb: 18, fat: 2.5 },
    { name: 'Potato', local: 'Aloo', cal: 77, prot: 2, carb: 17, fat: 0.1 },
    { name: 'Sweet Potato', local: 'Shakarkandi', cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
    { name: 'Tomato', local: 'Timater', cal: 18, prot: 0.9, carb: 3.9, fat: 0.2 },
    { name: 'Onion', local: 'Pyaz', cal: 40, prot: 1.1, carb: 9, fat: 0.1 },
    { name: 'Spinach', local: 'Palak', cal: 23, prot: 2.9, carb: 3.6, fat: 0.4 },
    { name: 'Okra', local: 'Bhindi', cal: 33, prot: 1.9, carb: 7, fat: 0.2 },
    { name: 'Eggplant', local: 'Baigan', cal: 25, prot: 1, carb: 6, fat: 0.2 },
    { name: 'Cucumber', local: 'Kheera', cal: 16, prot: 0.7, carb: 4, fat: 0.1 },
    { name: 'Carrot', local: 'Gajar', cal: 41, prot: 0.9, carb: 10, fat: 0.2 },
    { name: 'Peas', local: 'Matar', cal: 81, prot: 5, carb: 14, fat: 0.4 },
    { name: 'Cauliflower', local: 'Phool Gobi', cal: 25, prot: 1.9, carb: 5, fat: 0.3 },
    { name: 'Cabbage', local: 'Band Gobi', cal: 25, prot: 1.3, carb: 6, fat: 0.1 },
    { name: 'Bottle Gourd', local: 'Lauki', cal: 14, prot: 0.6, carb: 3.4, fat: 0.02 },
    { name: 'Bitter Gourd', local: 'Karela', cal: 17, prot: 1, carb: 3.7, fat: 0.2 },
    { name: 'Pumpkin', local: 'Kaddu', cal: 26, prot: 1, carb: 6.5, fat: 0.1 },
    { name: 'Bell Pepper', local: 'Shimla Mirch', cal: 31, prot: 1, carb: 6, fat: 0.3 },
    { name: 'Radish', local: 'Mooli', cal: 16, prot: 0.7, carb: 3.4, fat: 0.1 },
    { name: 'Mango', local: 'Aam', cal: 60, prot: 0.8, carb: 15, fat: 0.4 },
    { name: 'Apple', local: 'Seb', cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
    { name: 'Banana', local: 'Kela', cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
    { name: 'Orange', local: 'Sangtara', cal: 47, prot: 0.9, carb: 12, fat: 0.1 },
    { name: 'Guava', local: 'Amrood', cal: 68, prot: 2.6, carb: 14, fat: 1 },
    { name: 'Watermelon', local: 'Tarbooz', cal: 30, prot: 0.6, carb: 8, fat: 0.2 },
    { name: 'Papaya', local: 'Papita', cal: 43, prot: 0.5, carb: 11, fat: 0.3 },
    { name: 'Grapes', local: 'Angoor', cal: 69, prot: 0.7, carb: 18, fat: 0.2 },
    { name: 'Pomegranate', local: 'Anar', cal: 83, prot: 1.7, carb: 19, fat: 1.2 },
    { name: 'Dates', local: 'Khajoor', cal: 277, prot: 1.8, carb: 75, fat: 0.2 },
    { name: 'Whole Milk', local: 'Doodh', cal: 61, prot: 3.2, carb: 4.8, fat: 3.3 },
    { name: 'Yogurt', local: 'Dahi', cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
    { name: 'Butter', local: 'Makkhan', cal: 717, prot: 0.9, carb: 0.1, fat: 81 },
    { name: 'Cheese', local: 'Paneer', cal: 265, prot: 18, carb: 3, fat: 20 },
    { name: 'Cream', local: 'Malai', cal: 340, prot: 2.2, carb: 2.8, fat: 36 },
    { name: 'Ghee', local: 'Ghee', cal: 900, prot: 0, carb: 0, fat: 100 },
    { name: 'Almonds', local: 'Badam', cal: 579, prot: 21, carb: 22, fat: 50 },
    { name: 'Cashews', local: 'Kaju', cal: 553, prot: 18, carb: 30, fat: 44 },
    { name: 'Walnuts', local: 'Akhrot', cal: 654, prot: 15, carb: 14, fat: 65 },
    { name: 'Pistachios', local: 'Pista', cal: 560, prot: 20, carb: 28, fat: 45 },
    { name: 'Peanuts', local: 'Mungphali', cal: 567, prot: 26, carb: 16, fat: 49 },
    { name: 'Samosa', local: 'Samosa', cal: 262, prot: 5, carb: 28, fat: 15 },
    { name: 'Pakora', local: 'Pakora', cal: 280, prot: 6, carb: 30, fat: 16 },
    { name: 'Jalebi', local: 'Jalebi', cal: 150, prot: 1, carb: 28, fat: 4 },
    { name: 'Lassi', local: 'Lassi', cal: 80, prot: 3, carb: 11, fat: 2.5 }
  ]

  const handleFoodInput = (value) => {
    setFood(value)
    if (value.length > 1) {
      const matches = FOOD_DATABASE.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.local.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setFoodSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (item) => {
    setFood(item.name)
    setBaseQuantity('100')
    setBaseCalories(item.cal.toString())
    setBaseProtein(item.prot.toString())
    setBaseCarbs(item.carb.toString())
    setBaseFats(item.fat.toString())
    setCalories(item.cal.toString())
    setProtein(item.prot.toString())
    setCarbs(item.carb.toString())
    setFats(item.fat.toString())
    setShowSuggestions(false)
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
      <Tutorial page="nutrition" />
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
              <h2>📊 Today's Nutrition</h2>
              <div className="quick-actions">
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    setShowFoodDatabase(!showFoodDatabase);
                  }}
                  className="quick-btn"
                  title="Browse our curated food database"
                >
                  🍽️ Browse Foods
                </button>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className="quick-btn"
                  title="Plan your weekly meals"
                >
                  📅 Meal Planner
                </button>
                <button 
                  onClick={() => setActiveTab('recipes')}
                  className="quick-btn"
                  title="Build custom recipes"
                >
                  👨🍳 Recipes
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="quick-btn"
                  title="View detailed nutrition analytics"
                >
                  📊 Analytics
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
                  title="350 cal • 20g protein • 40g carbs • 12g fats"
                >
                  🌅 Quick Breakfast
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Quick Lunch', { calories: 500, protein: 30, carbs: 50, fats: 18 }, 'lunch');
                  }}
                  className="shortcut-btn lunch"
                  title="500 cal • 30g protein • 50g carbs • 18g fats"
                >
                  ☀️ Quick Lunch
                </button>
                <button 
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    quickAddMeal('Quick Dinner', { calories: 600, protein: 35, carbs: 60, fats: 20 }, 'dinner');
                  }}
                  className="shortcut-btn dinner"
                  title="600 cal • 35g protein • 60g carbs • 20g fats"
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
                <div className="form-group" style={{position: 'relative'}}>
                  <label>Food Item</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={food}
                      onChange={(e) => handleFoodInput(e.target.value)}
                      onFocus={() => food.length > 1 && setShowSuggestions(true)}
                      placeholder="e.g., Timater, Aloo, Daal, Murgh"
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
                  {showSuggestions && foodSuggestions.length > 0 && (
                    <div className="food-suggestions">
                      {foodSuggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          className="suggestion-item"
                          onClick={() => selectSuggestion(item)}
                        >
                          <span className="suggestion-name">{item.name}</span>
                          <span className="suggestion-local">{item.local}</span>
                          <span className="suggestion-cal">{item.cal} cal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Quantity (g)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
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
            <h2>📝 Today's Meals</h2>
            {loading ? (
              <div className="loading">🔄 Loading nutrition entries...</div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No meals logged today</h3>
                <p>Start tracking your meals to see them here!</p>
              </div>
            ) : (
              <div className="entries-list">
                {Object.entries(groupedEntries)
                  .filter(([date]) => new Date(date).toDateString() === new Date().toDateString())
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, dayEntries]) => (
                    <div key={date} className="day-group">
                      <h3 className="day-header">
                        📅 Today - {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
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