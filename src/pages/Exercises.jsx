import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './Exercises.css'

const MUSCLE_GROUPS = {
  chest: { icon: '💪', name: 'Chest', color: '#ff6b35' },
  back: { icon: '🏋️', name: 'Back', color: '#4caf50' },
  'lower legs': { icon: '🦵', name: 'Lower Legs', color: '#2196f3' },
  'upper legs': { icon: '🦵', name: 'Upper Legs', color: '#2196f3' },
  shoulders: { icon: '🤸', name: 'Shoulders', color: '#ff9800' },
  'upper arms': { icon: '💪', name: 'Upper Arms', color: '#9c27b0' },
  'lower arms': { icon: '💪', name: 'Lower Arms', color: '#9c27b0' },
  waist: { icon: '🔥', name: 'Waist', color: '#f44336' },
  cardio: { icon: '❤️', name: 'Cardio', color: '#e91e63' },
  neck: { icon: '🦒', name: 'Neck', color: '#795548' }
}

const EQUIPMENT_ICONS = {
  barbell: '🏋️',
  dumbbell: '🏋️‍♀️',
  machine: '⚙️',
  cable: '🔗',
  bodyweight: '🤸‍♂️',
  kettlebell: '🔔',
  resistance: '🎯'
}

const DIFFICULTY_COLORS = {
  beginner: '#4caf50',
  intermediate: '#ff9800',
  advanced: '#f44336'
}



export default function Exercises() {
  const { token, user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('library')
  
  // Filters
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  
  // Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Modal
  const [selectedExercise, setSelectedExercise] = useState(null)
  
  // Stats
  const [stats, setStats] = useState({ total: 0, byGroup: {} })
  
  // Custom Workout Builder
  const [customWorkout, setCustomWorkout] = useState([])
  const [workoutName, setWorkoutName] = useState('')
  
  // Saved Workouts
  const [savedWorkouts, setSavedWorkouts] = useState([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(false)
  
  // AI Weekly Planner
  const [aiPlan, setAiPlan] = useState(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [planGoal, setPlanGoal] = useState('muscle_gain')
  const [planLevel, setPlanLevel] = useState('intermediate')
  const [planDays, setPlanDays] = useState(5)
  const [planDuration, setPlanDuration] = useState(60)

  const loadExercises = async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      
      const limit = 24
      const offset = pageNum * limit
      
      // Fetch from free-exercise-db JSON
      const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json')
      let allData = await response.json()
      
      // Filter by muscle group
      if (selectedGroup !== 'all') {
        allData = allData.filter(ex => 
          ex.primaryMuscles?.some(m => m.toLowerCase().includes(selectedGroup)) ||
          ex.category?.toLowerCase() === selectedGroup
        )
      }
      
      // Filter by equipment
      if (selectedEquipment !== 'all') {
        allData = allData.filter(ex => 
          ex.equipment?.toLowerCase().includes(selectedEquipment)
        )
      }
      
      // Filter by search query
      if (searchQuery) {
        allData = allData.filter(ex => 
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.primaryMuscles?.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }
      
      // Paginate
      const data = allData.slice(offset, offset + limit)
      
      // Map to our format
      const newExercises = data.map(ex => {
        const bodyPartIcons = {
          'waist': '🔥', 'chest': '💪', 'back': '🏋️', 'core': '🔥',
          'upper legs': '🦵', 'lower legs': '🦵', 'shoulders': '🤸', 'legs': '🦵',
          'upper arms': '💪', 'lower arms': '💪', 'cardio': '❤️', 'neck': '🦒', 'arms': '💪'
        }
        const primaryMuscle = ex.primaryMuscles?.[0]?.toLowerCase() || 'other'
        const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
        const gifUrl = ex.images?.[0] ? `${baseUrl}${ex.images[0]}` : `${baseUrl}${ex.id}/images/0.jpg`
        
        return {
          _id: ex.id,
          name: ex.name,
          gifUrl: gifUrl,
          imageUrl: gifUrl,
          icon: bodyPartIcons[primaryMuscle] || '🏋️',
          target: ex.primaryMuscles?.[0] || 'general',
          bodyPart: primaryMuscle,
          equipment: ex.equipment || 'bodyweight',
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
          description: `${ex.name} - ${ex.category || 'strength'} exercise`,
          group: primaryMuscle,
          type: ex.category || 'strength',
          difficulty: 'intermediate',
          sets: 3,
          reps: 10
        }
      })
      
      if (!append && newExercises.length > 0) {
        console.log('First exercise:', newExercises[0].name, 'gifUrl:', newExercises[0].gifUrl)
      }
      
      if (append) {
        setExercises(prev => [...prev, ...newExercises])
      } else {
        setExercises(newExercises)
        calculateStats(newExercises)
      }
      
      setHasMore(newExercises.length >= limit)
      setPage(pageNum)
      
    } catch (err) {
      console.error('Failed to load exercises:', err)
      setError('Failed to load exercises')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const calculateStats = (data) => {
    const byGroup = {}
    data.forEach(ex => {
      const group = ex.group || 'other'
      byGroup[group] = (byGroup[group] || 0) + 1
    })
    setStats({ total: data.length, byGroup })
  }

  useEffect(() => {
    loadExercises(0, false)
  }, [selectedGroup, searchQuery, selectedEquipment, selectedDifficulty])
  
  useEffect(() => {
    if (activeTab === 'myworkouts') {
      loadSavedWorkouts()
    }
  }, [activeTab])
  
  const loadSavedWorkouts = async () => {
    try {
      setLoadingWorkouts(true)
      const response = await api('/workouts', { token })
      setSavedWorkouts(response.items || response || [])
    } catch (err) {
      console.error('Failed to load workouts:', err)
    } finally {
      setLoadingWorkouts(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadExercises(page + 1, true)
    }
  }

  const addToWorkout = async (exercise) => {
    if (!token) {
      setError('Please login to add exercises')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      await api('/workouts', {
        method: 'POST',
        body: {
          category: 'strength',
          exercises: [{
            name: exercise.name,
            sets: exercise.sets || 3,
            reps: exercise.reps || 10,
            weight: 0
          }]
        },
        token
      })
      
      setSuccess(`${exercise.name} added to workout!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to add exercise to workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  const saveExercise = async (exercise) => {
    if (!token) {
      setError('Please login to save exercises')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      await api('/exercise-library', {
        method: 'POST',
        body: exercise,
        token
      })
      
      setSuccess(`${exercise.name} saved to library!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save exercise')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getDifficultyColor = (difficulty) => {
    return DIFFICULTY_COLORS[difficulty?.toLowerCase()] || '#666'
  }

  const getEquipmentIcon = (equipment) => {
    return EQUIPMENT_ICONS[equipment?.toLowerCase()] || '🏋️'
  }

  const filteredExercises = exercises.filter(ex => 
    !ex.name?.includes('[deprecated]')
  )

  const addToCustomWorkout = (exercise) => {
    if (customWorkout.find(e => e._id === exercise._id)) {
      setError('Exercise already in workout')
      setTimeout(() => setError(''), 2000)
      return
    }
    setCustomWorkout([...customWorkout, { ...exercise, sets: 3, reps: 10, rest: 60 }])
    setSuccess(`${exercise.name} added to custom workout!`)
    setTimeout(() => setSuccess(''), 2000)
  }

  const removeFromCustomWorkout = (id) => {
    setCustomWorkout(customWorkout.filter(e => e._id !== id))
  }

  const updateWorkoutExercise = (id, field, value) => {
    setCustomWorkout(customWorkout.map(e => 
      e._id === id ? { ...e, [field]: value } : e
    ))
  }

  const saveCustomWorkout = async () => {
    if (!workoutName.trim()) {
      setError('Please enter workout name')
      setTimeout(() => setError(''), 2000)
      return
    }
    if (customWorkout.length === 0) {
      setError('Add at least one exercise')
      setTimeout(() => setError(''), 2000)
      return
    }
    try {
      const response = await api('/workouts', {
        method: 'POST',
        body: {
          name: workoutName,
          category: 'custom',
          isTemplate: true,
          exercises: customWorkout.map(e => ({
            name: e.name,
            sets: e.sets || 3,
            reps: e.reps || 10,
            rest: e.rest || 60,
            weight: 0
          }))
        },
        token
      })
      setSuccess('Workout saved! View in My Workouts tab')
      setCustomWorkout([])
      setWorkoutName('')
      setTimeout(() => {
        setSuccess('')
        setActiveTab('myworkouts')
      }, 2000)
    } catch (err) {
      console.error('Failed to save workout:', err)
      setError(err.message || 'Failed to save workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (!user) return null
  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="exercises-page">
        <div className="exercises-container">
          {/* Header */}
          <div className="exercises-header">
            <h1>🏋️ Professional Exercise Hub</h1>
            <p>Complete exercise library with workout planning and analytics</p>
          </div>

          {/* Navigation Tabs */}
          <div className="exercise-tabs">
            <button 
              className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              📚 Exercise Library
            </button>
            <button 
              className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
              onClick={() => setActiveTab('builder')}
            >
              🎯 Workout Builder
            </button>
            <button 
              className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              📅 Weekly Planner
            </button>
            <button 
              className={`tab-btn ${activeTab === 'myworkouts' ? 'active' : ''}`}
              onClick={() => setActiveTab('myworkouts')}
            >
              💪 My Workouts
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
          {activeTab === 'library' && (
            <div className="tab-content fade-in">
          {/* Stats */}
          <div className="exercise-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Exercises</span>
            </div>
            {Object.entries(stats.byGroup).map(([group, count]) => (
              <div key={group} className="stat-item">
                <span className="stat-icon">{MUSCLE_GROUPS[group]?.icon || '💪'}</span>
                <span className="stat-number">{count}</span>
                <span className="stat-label">{MUSCLE_GROUPS[group]?.name || group}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Muscle Group</label>
                <select 
                  value={selectedGroup} 
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">🎯 All Groups</option>
                  <option value="chest">💪 Chest</option>
                  <option value="back">🏋️ Back</option>
                  <option value="upper legs">🦵 Upper Legs</option>
                  <option value="lower legs">🦵 Lower Legs</option>
                  <option value="shoulders">🤸 Shoulders</option>
                  <option value="upper arms">💪 Upper Arms</option>
                  <option value="lower arms">💪 Lower Arms</option>
                  <option value="waist">🔥 Waist</option>
                  <option value="cardio">❤️ Cardio</option>
                  <option value="neck">🦒 Neck</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Equipment</label>
                <select 
                  value={selectedEquipment} 
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">🏋️ All Equipment</option>
                  <option value="barbell">🏋️ Barbell</option>
                  <option value="dumbbell">🏋️‍♀️ Dumbbell</option>
                  <option value="machine">⚙️ Machine</option>
                  <option value="cable">🔗 Cable</option>
                  <option value="bodyweight">🤸‍♂️ Bodyweight</option>
                </select>
              </div>
              

            </div>
            
            <div className="search-group">
              <input
                type="text"
                placeholder="🔍 Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="exercises-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>Loading exercises...</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏋️‍♂️</div>
                <h3>No exercises found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredExercises.map((exercise, index) => (
                <div key={exercise._id || index} className="exercise-card">
                  <div className="exercise-image">
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const parent = e.target.parentElement
                        parent.style.background = 'linear-gradient(135deg, #ff6b35, #ff8c42)'
                        parent.style.display = 'flex'
                        parent.style.alignItems = 'center'
                        parent.style.justifyContent = 'center'
                        parent.innerHTML = `<div style="font-size: 4rem">${exercise.icon}</div>`
                      }}
                    />
                    <div className="exercise-badges">
                      <span className="difficulty-badge" style={{ backgroundColor: '#4caf50' }}>
                        {exercise.equipment}
                      </span>
                    </div>
                  </div>
                  
                  <div className="exercise-content">
                    <h3 className="exercise-name">{exercise.name}</h3>
                    
                    <div className="exercise-meta">
                      <span className="meta-item">
                        {getEquipmentIcon(exercise.equipment)} {exercise.equipment}
                      </span>
                      <span className="meta-item">
                        🎯 {exercise.target}
                      </span>
                      <span className="meta-item">
                        📊 {exercise.type}
                      </span>
                    </div>
                    
                    {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                      <div className="secondary-muscles">
                        {exercise.secondaryMuscles.slice(0, 3).map((muscle, idx) => (
                          <span key={idx} className="muscle-tag">{muscle}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="exercise-sets">
                      💪 {exercise.sets || 3} sets × {exercise.reps || 10} reps
                    </div>
                  </div>
                  
                  <div className="exercise-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => setSelectedExercise(exercise)}
                      title="View details"
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn save-btn"
                      onClick={() => saveExercise(exercise)}
                      title="Save to library"
                    >
                      💾
                    </button>
                    <button 
                      className="action-btn builder-btn"
                      onClick={() => {
                        addToCustomWorkout(exercise)
                        setActiveTab('builder')
                      }}
                      title="Add to workout builder"
                    >
                      🎯
                    </button>
                    <button 
                      className="action-btn add-btn"
                      onClick={() => addToWorkout(exercise)}
                      title="Quick add to workout"
                    >
                      ➕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {hasMore && !loading && (
            <div className="load-more-section">
              <button 
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? '🔄 Loading...' : '📥 Load More Exercises'}
              </button>
            </div>
          )}
            </div>
          )}

          {/* Workout Builder Tab */}
          {activeTab === 'builder' && (
            <div className="tab-content fade-in">
              <div className="builder-layout">
                <div className="builder-sidebar">
                  <h2>🎯 Custom Workout Builder</h2>
                  <div className="workout-name-input">
                    <input
                      type="text"
                      placeholder="Enter workout name..."
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="custom-workout-list">
                    {customWorkout.length === 0 ? (
                      <div className="empty-workout">
                        <p>🏋️ Add exercises from library</p>
                      </div>
                    ) : (
                      customWorkout.map((ex, idx) => (
                        <div key={ex._id} className="workout-exercise-card">
                          <div className="exercise-order">{idx + 1}</div>
                          <div className="exercise-details">
                            <h4>{ex.name}</h4>
                            <div className="exercise-inputs">
                              <div className="input-group">
                                <label>Sets</label>
                                <input
                                  type="number"
                                  value={ex.sets}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'sets', Number(e.target.value))}
                                  min="1"
                                />
                              </div>
                              <div className="input-group">
                                <label>Reps</label>
                                <input
                                  type="number"
                                  value={ex.reps}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'reps', Number(e.target.value))}
                                  min="1"
                                />
                              </div>
                              <div className="input-group">
                                <label>Rest (s)</label>
                                <input
                                  type="number"
                                  value={ex.rest}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'rest', Number(e.target.value))}
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            className="remove-btn"
                            onClick={() => removeFromCustomWorkout(ex._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {customWorkout.length > 0 && (
                    <button className="save-workout-btn" onClick={saveCustomWorkout}>
                      💾 Save Workout
                    </button>
                  )}
                </div>
                <div className="builder-exercises">
                  <h3>📚 Select Exercises</h3>
                  <div className="quick-filters">
                    <select 
                      value={selectedGroup} 
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="filter-select-small"
                    >
                      <option value="all">All Groups</option>
                      {Object.entries(MUSCLE_GROUPS).map(([key, group]) => (
                        <option key={key} value={key}>{group.icon} {group.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="🔍 Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input-small"
                    />
                  </div>
                  <div className="exercises-grid-compact">
                    {loading ? (
                      <div className="loading-state">🔄 Loading...</div>
                    ) : filteredExercises.slice(0, 12).map((exercise) => (
                      <div key={exercise._id} className="exercise-card-compact">
                        <img 
                          src={exercise.gifUrl} 
                          alt={exercise.name}
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                        <div className="compact-info">
                          <h4>{exercise.name}</h4>
                          <p>{exercise.target}</p>
                        </div>
                        <button
                          className="add-compact-btn"
                          onClick={() => addToCustomWorkout(exercise)}
                        >
                          ➕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Planner Tab */}
          {activeTab === 'planner' && (
            <div className="tab-content fade-in">
              <div className="planner-container">
                <h2>🤖 AI-Powered Weekly Planner</h2>
                <p style={{ color: '#ccc', marginBottom: '20px' }}>Generate personalized workout plans using AI</p>
                
                {!aiPlan ? (
                  <div className="ai-plan-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Fitness Goal</label>
                        <select value={planGoal} onChange={(e) => setPlanGoal(e.target.value)} className="form-select">
                          <option value="muscle_gain">💪 Muscle Gain</option>
                          <option value="weight_loss">🔥 Weight Loss</option>
                          <option value="strength">🏋️ Strength</option>
                          <option value="endurance">🏃 Endurance</option>
                          <option value="general_fitness">❤️ General Fitness</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Experience Level</label>
                        <select value={planLevel} onChange={(e) => setPlanLevel(e.target.value)} className="form-select">
                          <option value="beginner">🟢 Beginner</option>
                          <option value="intermediate">🟡 Intermediate</option>
                          <option value="advanced">🔴 Advanced</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Days per Week</label>
                        <select value={planDays} onChange={(e) => setPlanDays(Number(e.target.value))} className="form-select">
                          <option value="3">3 Days</option>
                          <option value="4">4 Days</option>
                          <option value="5">5 Days</option>
                          <option value="6">6 Days</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Workout Duration</label>
                        <select value={planDuration} onChange={(e) => setPlanDuration(Number(e.target.value))} className="form-select">
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                          <option value="90">90 minutes</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      className="generate-plan-btn"
                      onClick={async () => {
                        try {
                          setGeneratingPlan(true)
                          console.log('Requesting AI plan...')
                          const response = await api('/ai/weekly-plan', {
                            method: 'POST',
                            body: { goal: planGoal, level: planLevel, days: planDays, duration: planDuration },
                            token
                          })
                          console.log('AI response:', response)
                          
                          if (response.plan && response.plan.length > 0) {
                            setAiPlan(response.plan)
                            setSuccess('AI Plan Generated!')
                            setTimeout(() => setSuccess(''), 2000)
                          } else {
                            setError('No plan generated. Try again.')
                            setTimeout(() => setError(''), 3000)
                          }
                        } catch (err) {
                          console.error('AI plan error:', err)
                          setError(err.message || 'Failed to generate plan')
                          setTimeout(() => setError(''), 3000)
                        } finally {
                          setGeneratingPlan(false)
                        }
                      }}
                      disabled={generatingPlan}
                    >
                      {generatingPlan ? '🤖 Generating AI Plan... (may take 10-15 seconds)' : '✨ Generate AI Plan'}
                    </button>
                  </div>
                ) : (
                  <div className="ai-plan-result">
                    <div className="plan-header">
                      <h3>🎯 Your Personalized {planDays}-Day Plan</h3>
                      <button 
                        className="regenerate-btn"
                        onClick={() => setAiPlan(null)}
                      >
                        🔄 Generate New Plan
                      </button>
                    </div>
                    <div className="week-grid">
                      {aiPlan.map((dayPlan, idx) => (
                        <div key={idx} className="day-card ai-day-card">
                          <h3>{dayPlan.day}</h3>
                          <div className="day-focus">{dayPlan.focus}</div>
                          <div className="day-duration">⏱️ {dayPlan.duration} min</div>
                          {dayPlan.aiTip && (
                            <div className="ai-tip">
                              🤖 <em>{dayPlan.aiTip}</em>
                            </div>
                          )}
                          <div className="day-exercises">
                            {dayPlan.exercises?.map((ex, i) => (
                              <div key={i} className="day-exercise">
                                <span className="ex-name">{ex.name}</span>
                                <span className="ex-details">{ex.sets} × {ex.reps}</span>
                              </div>
                            ))}
                          </div>
                          <button 
                            className="save-day-btn"
                            onClick={async () => {
                              try {
                                await api('/workouts', {
                                  method: 'POST',
                                  body: {
                                    name: `${dayPlan.day} - ${dayPlan.focus}`,
                                    category: 'custom',
                                    exercises: dayPlan.exercises
                                  },
                                  token
                                })
                                setSuccess('Saved to My Workouts!')
                                setTimeout(() => setSuccess(''), 2000)
                              } catch (err) {
                                setError('Failed to save')
                                setTimeout(() => setError(''), 2000)
                              }
                            }}
                          >
                            💾 Save Workout
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Workouts Tab */}
          {activeTab === 'myworkouts' && (
            <div className="tab-content fade-in">
              <div className="my-workouts-container">
                <h2>💪 My Saved Workouts</h2>
                {loadingWorkouts ? (
                  <div className="loading-state">🔄 Loading workouts...</div>
                ) : savedWorkouts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💪</div>
                    <h3>No workouts saved yet</h3>
                    <p>Create your first workout in the Workout Builder tab</p>
                    <button 
                      className="btn-primary"
                      onClick={() => setActiveTab('builder')}
                      style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(45deg, #ff6b35, #ff8c42)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                    >
                      🎯 Go to Workout Builder
                    </button>
                  </div>
                ) : (
                  <div className="workouts-grid">
                    {savedWorkouts.map((workout) => (
                      <div key={workout._id} className="workout-card">
                        <div className="workout-header">
                          <h3>{workout.name || 'Workout'}</h3>
                          <span className="workout-category">{workout.category}</span>
                        </div>
                        <div className="workout-date">
                          📅 {new Date(workout.date || workout.createdAt).toLocaleDateString()}
                        </div>
                        <div className="workout-exercises">
                          <h4>Exercises ({workout.exercises?.length || 0})</h4>
                          {workout.exercises?.slice(0, 3).map((ex, idx) => (
                            <div key={idx} className="workout-exercise-item">
                              <span className="exercise-name">{ex.name}</span>
                              <span className="exercise-details">
                                {ex.sets} × {ex.reps} {ex.rest ? `• ${ex.rest}s rest` : ''}
                              </span>
                            </div>
                          ))}
                          {workout.exercises?.length > 3 && (
                            <p className="more-exercises">+{workout.exercises.length - 3} more exercises</p>
                          )}
                        </div>
                        <div className="workout-actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => {
                              setCustomWorkout(workout.exercises.map(e => ({ ...e, _id: e.name + Date.now() })))
                              setWorkoutName(workout.name)
                              setActiveTab('builder')
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="action-btn add-btn"
                            onClick={async () => {
                              try {
                                await api('/workouts', {
                                  method: 'POST',
                                  body: {
                                    name: workout.name,
                                    category: workout.category,
                                    exercises: workout.exercises
                                  },
                                  token
                                })
                                setSuccess('Workout logged for today!')
                                setTimeout(() => setSuccess(''), 2000)
                              } catch (err) {
                                setError('Failed to log workout')
                                setTimeout(() => setError(''), 2000)
                              }
                            }}
                          >
                            ✅ Log Today
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={async () => {
                              if (confirm('Delete this workout?')) {
                                try {
                                  await api(`/workouts/${workout._id}`, { method: 'DELETE', token })
                                  setSuccess('Workout deleted!')
                                  setTimeout(() => setSuccess(''), 2000)
                                  loadSavedWorkouts()
                                } catch (err) {
                                  setError('Failed to delete')
                                  setTimeout(() => setError(''), 2000)
                                }
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content fade-in">
              <div className="analytics-container">
                <h2>📊 Exercise Analytics</h2>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">💪</div>
                    <h3>Total Exercises</h3>
                    <p className="analytics-value">{stats.total}</p>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">🔥</div>
                    <h3>Workouts Created</h3>
                    <p className="analytics-value">0</p>
                    <p className="analytics-label">This Month</p>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">⏱️</div>
                    <h3>Total Time</h3>
                    <p className="analytics-value">0h</p>
                    <p className="analytics-label">This Week</p>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">🎯</div>
                    <h3>Favorite Muscle</h3>
                    <p className="analytics-value">
                      {Object.entries(stats.byGroup).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="muscle-breakdown">
                  <h3>💪 Muscle Group Distribution</h3>
                  <div className="breakdown-bars">
                    {Object.entries(stats.byGroup).map(([group, count]) => (
                      <div key={group} className="breakdown-item">
                        <div className="breakdown-label">
                          <span>{MUSCLE_GROUPS[group]?.icon || '💪'}</span>
                          <span>{MUSCLE_GROUPS[group]?.name || group}</span>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill"
                            style={{ 
                              width: `${(count / stats.total) * 100}%`,
                              background: MUSCLE_GROUPS[group]?.color || '#ff6b35'
                            }}
                          ></div>
                        </div>
                        <span className="breakdown-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exercise Detail Modal */}
          {selectedExercise && (
            <div className="exercise-modal">
              <div className="modal-overlay" onClick={() => setSelectedExercise(null)}></div>
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{selectedExercise.name}</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setSelectedExercise(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="exercise-info">
                    <span className="info-item">
                      {getEquipmentIcon(selectedExercise.equipment)} <strong>{selectedExercise.equipment}</strong>
                    </span>
                    <span className="info-item">
                      🎯 <strong>{selectedExercise.target}</strong>
                    </span>
                    <span className="info-item">
                      📊 <strong>{selectedExercise.type}</strong>
                    </span>
                  </div>
                  
                  {selectedExercise.videoUrl ? (
                    <div className="exercise-video">
                      <video 
                        src={selectedExercise.videoUrl} 
                        controls 
                        poster={selectedExercise.gifUrl || selectedExercise.imageUrl}
                        style={{ width: '100%', borderRadius: '12px', maxHeight: '400px' }}
                      />
                    </div>
                  ) : (
                    <div className="exercise-image-large">
                      <img 
                        src={selectedExercise.gifUrl} 
                        alt={selectedExercise.name}
                        style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'contain', background: '#1a1a1a' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<div style="padding: 60px; text-align: center; background: linear-gradient(135deg, #ff6b35, #ff8c42); border-radius: 12px;"><div style="font-size: 5rem; margin-bottom: 20px;">${selectedExercise.icon}</div><h3 style="color: white;">${selectedExercise.name}</h3></div>`
                        }}
                      />
                    </div>
                  )}
                  
                  {selectedExercise.description && (
                    <div className="modal-section">
                      <p className="exercise-description" style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: '1.6' }}>{selectedExercise.description}</p>
                    </div>
                  )}
                  
                  {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                    <div className="modal-section">
                      <h4>🎯 Secondary Muscles</h4>
                      <div className="muscle-list">
                        {selectedExercise.secondaryMuscles.map((muscle, idx) => (
                          <span key={idx} className="muscle-tag">{muscle}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                    <div className="modal-section">
                      <h4>📋 How to Perform</h4>
                      <ol className="instructions-list" style={{ paddingLeft: '20px' }}>
                        {selectedExercise.instructions.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: '12px', lineHeight: '1.6', color: '#ddd' }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {selectedExercise.exerciseTips && selectedExercise.exerciseTips.length > 0 && (
                    <div className="modal-section">
                      <h4>💡 Pro Tips</h4>
                      <ul className="tips-list" style={{ paddingLeft: '20px' }}>
                        {selectedExercise.exerciseTips.map((tip, idx) => (
                          <li key={idx} style={{ marginBottom: '10px', lineHeight: '1.6', color: '#ddd' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedExercise.variations && selectedExercise.variations.length > 0 && (
                    <div className="modal-section">
                      <h4>🔄 Variations</h4>
                      <ul className="variations-list" style={{ paddingLeft: '20px' }}>
                        {selectedExercise.variations.map((variation, idx) => (
                          <li key={idx} style={{ marginBottom: '10px', lineHeight: '1.6', color: '#ddd' }}>{variation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="modal-section">
                    <h4>📊 Recommended Sets & Reps</h4>
                    <div style={{ display: 'flex', gap: '20px', padding: '15px', background: 'rgba(255,107,53,0.1)', borderRadius: '10px', border: '1px solid rgba(255,107,53,0.3)' }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💪</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>{selectedExercise.sets || 3}</div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Sets</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔢</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>{selectedExercise.reps || 10}</div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Reps</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⏱️</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>{selectedExercise.rest || 60}s</div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Rest</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    className="modal-btn save-btn"
                    onClick={() => {
                      saveExercise(selectedExercise)
                      setSelectedExercise(null)
                    }}
                  >
                    💾 Save to Library
                  </button>
                  <button 
                    className="modal-btn add-btn"
                    onClick={() => {
                      addToWorkout(selectedExercise)
                      setSelectedExercise(null)
                    }}
                  >
                    ➕ Add to Workout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}