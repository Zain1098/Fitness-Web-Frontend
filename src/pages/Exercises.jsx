import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import './Exercises.css'

const MUSCLE_GROUPS = {
  chest: { icon: '💪', name: 'Chest', color: '#ff6b35' },
  back: { icon: '🏋️', name: 'Back', color: '#4caf50' },
  legs: { icon: '🦵', name: 'Legs', color: '#2196f3' },
  shoulders: { icon: '🤸', name: 'Shoulders', color: '#ff9800' },
  arms: { icon: '💪', name: 'Arms', color: '#9c27b0' },
  core: { icon: '🔥', name: 'Core', color: '#f44336' }
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
  
  // Smart Weekly Planner
  const [smartPlan, setSmartPlan] = useState(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [planGoal, setPlanGoal] = useState('muscle_gain')
  const [planLevel, setPlanLevel] = useState('intermediate')
  const [planDays, setPlanDays] = useState(5)
  const [planDuration, setPlanDuration] = useState(60)
  const [planEquipment, setPlanEquipment] = useState('all')
  const [planFocusAreas, setPlanFocusAreas] = useState([])
  const [planRestDays, setPlanRestDays] = useState('auto')
  const [planIntensity, setPlanIntensity] = useState('moderate')
  
  // Favorites
  const [favorites, setFavorites] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  const loadExercises = async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      
      const limit = 100
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: pageNum.toString()
      })
      
      if (selectedGroup !== 'all') params.append('group', selectedGroup)
      if (selectedEquipment !== 'all') params.append('equipment', selectedEquipment)
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)
      if (searchQuery) params.append('q', searchQuery)
      
      const response = await api(`/exercises?${params.toString()}`, { token })
      const data = Array.isArray(response) ? response : (response.items || [])
      
      const newExercises = data.map(ex => {
        const imageUrl = ex.gifUrl || ex.imageUrl || 'https://via.placeholder.com/300x200?text=Exercise'
        return {
          _id: ex._id || ex.id,
          name: ex.name,
          gifUrl: imageUrl,
          imageUrl: imageUrl,
          icon: MUSCLE_GROUPS[ex.group]?.icon || '🏋️',
          target: ex.target || 'general',
          bodyPart: ex.group || 'core',
          equipment: ex.equipment || 'bodyweight',
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
          description: `${ex.name} - ${ex.type || 'strength'} exercise`,
          group: ex.group || 'core',
          type: ex.type || 'strength',
          difficulty: ex.difficulty || 'intermediate',
          sets: 3,
          reps: 10
        }
      })
      
      if (append) {
        const allExercises = [...exercises, ...newExercises]
        setExercises(allExercises)
        calculateStats(allExercises)
      } else {
        setExercises(newExercises)
        calculateStats(newExercises)
      }
      
      setHasMore(newExercises.length >= limit)
      setPage(pageNum)
      
    } catch (err) {
      console.error('Failed to load exercises:', err)
      setError(`Failed to load exercises: ${err.message}`)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const calculateStats = (data) => {
    const byGroup = {}
    data.forEach(ex => {
      const group = ex.group || ex.bodyPart || 'other'
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
    if (activeTab === 'history') {
      loadWorkoutHistory()
    }
  }, [activeTab])
  
  const [workoutHistory, setWorkoutHistory] = useState([])
  const [historyStats, setHistoryStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalReps: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteExercise: '',
    mostWorkedMuscle: ''
  })
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const loadWorkoutHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await api('/workouts', { token })
      const workouts = response.items || response || []
      const completedWorkouts = workouts.filter(w => w.status === 'completed')
      setWorkoutHistory(completedWorkouts)
      calculateHistoryStats(completedWorkouts)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }
  
  const calculateHistoryStats = (workouts) => {
    if (workouts.length === 0) return
    
    const totalWorkouts = workouts.length
    const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)
    const totalSets = workouts.reduce((sum, w) => 
      sum + (w.exercises?.reduce((s, e) => s + (e.sets || 0), 0) || 0), 0
    )
    const totalReps = workouts.reduce((sum, w) => 
      sum + (w.exercises?.reduce((s, e) => s + ((e.sets || 0) * (e.reps || 0)), 0) || 0), 0
    )
    
    // Calculate streaks
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || Math.abs(new Date(sorted[i].date) - new Date(sorted[i-1].date)) <= 2 * 24 * 60 * 60 * 1000) {
        tempStreak++
        if (i === 0) currentStreak = tempStreak
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }
    
    // Find favorite exercise
    const exerciseCount = {}
    workouts.forEach(w => {
      w.exercises?.forEach(e => {
        exerciseCount[e.name] = (exerciseCount[e.name] || 0) + 1
      })
    })
    const favoriteExercise = Object.entries(exerciseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    
    // Find most worked muscle
    const muscleCount = {}
    workouts.forEach(w => {
      const category = w.category || 'general'
      muscleCount[category] = (muscleCount[category] || 0) + 1
    })
    const mostWorkedMuscle = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    
    setHistoryStats({
      totalWorkouts,
      totalExercises,
      totalSets,
      totalReps,
      currentStreak,
      longestStreak,
      favoriteExercise,
      mostWorkedMuscle
    })
  }
  
  useEffect(() => {
    loadFavorites()
  }, [])
  
  const loadFavorites = async () => {
    if (!token) return
    try {
      setLoadingFavorites(true)
      const response = await api('/favorites', { token })
      const favoriteIds = response.favorites || []
      const favoriteExercises = exercises.filter(ex => favoriteIds.includes(ex._id))
      setFavorites(favoriteExercises)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    } finally {
      setLoadingFavorites(false)
    }
  }
  
  const toggleFavorite = async (exercise) => {
    if (!token) {
      setError('Please login to save favorites')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    const isFavorite = favorites.find(f => f._id === exercise._id)
    
    try {
      if (isFavorite) {
        await api(`/favorites/${exercise._id}`, { method: 'DELETE', token })
        setFavorites(favorites.filter(f => f._id !== exercise._id))
        setSuccess('Removed from favorites')
      } else {
        await api('/favorites', { method: 'POST', body: { exerciseId: exercise._id }, token })
        setFavorites([...favorites, exercise])
        setSuccess('Added to favorites!')
      }
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to update favorites')
      setTimeout(() => setError(''), 2000)
    }
  }
  
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

  const generateSmartPlan = (allExercises, goal, level, days, duration, equipment, focusAreas, intensity) => {
    // Filter by equipment
    let availableExercises = allExercises
    if (equipment !== 'all') {
      if (equipment === 'home') {
        availableExercises = allExercises.filter(ex => 
          ex.equipment?.toLowerCase().includes('dumbbell') || 
          ex.equipment?.toLowerCase().includes('bodyweight')
        )
      } else {
        availableExercises = allExercises.filter(ex => 
          ex.equipment?.toLowerCase().includes(equipment)
        )
      }
    }
    
    // If not enough exercises, use all available exercises
    if (availableExercises.length < 10) {
      availableExercises = allExercises
    }
    const muscleGroups = {
      3: [['chest', 'upper arms', 'shoulders'], ['back', 'lower arms'], ['upper legs', 'lower legs', 'waist']],
      4: [['chest', 'upper arms'], ['back', 'lower arms'], ['upper legs', 'lower legs'], ['shoulders', 'waist']],
      5: [['chest', 'upper arms'], ['back'], ['upper legs', 'lower legs'], ['shoulders'], ['waist', 'lower arms']],
      6: [['chest'], ['back'], ['shoulders'], ['upper arms', 'lower arms'], ['upper legs'], ['lower legs', 'waist']]
    }

    const dayNames = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6']
    const focusNames = {
      3: ['Chest & Arms', 'Back & Core', 'Legs & Abs'],
      4: ['Chest & Triceps', 'Back & Biceps', 'Legs', 'Shoulders & Core'],
      5: ['Chest & Triceps', 'Back', 'Legs', 'Shoulders', 'Arms & Core'],
      6: ['Chest', 'Back', 'Shoulders', 'Arms', 'Quads & Glutes', 'Hamstrings & Calves']
    }

    const tips = {
      muscle_gain: ['Focus on progressive overload', 'Control the negative phase', 'Mind-muscle connection is key', 'Rest 90-120 seconds between sets'],
      strength: ['Lift heavy with proper form', 'Rest 3-5 minutes between sets', 'Focus on compound movements', 'Track your max lifts'],
      weight_loss: ['Keep rest periods short (30-60s)', 'Maintain high intensity', 'Focus on compound exercises', 'Add cardio finishers'],
      endurance: ['Higher reps, lower weight', 'Minimal rest between sets', 'Circuit training style', 'Focus on time under tension'],
      general_fitness: ['Balance all muscle groups', 'Mix strength and cardio', 'Focus on form over weight', 'Stay consistent']
    }

    const intensityMultiplier = {
      light: 0.8,
      moderate: 1.0,
      high: 1.2,
      extreme: 1.4
    }

    const repsScheme = {
      muscle_gain: { beginner: [10, 12], intermediate: [8, 12], advanced: [6, 12] },
      strength: { beginner: [5, 8], intermediate: [3, 6], advanced: [1, 5] },
      weight_loss: { beginner: [12, 15], intermediate: [15, 20], advanced: [15, 25] },
      endurance: { beginner: [15, 20], intermediate: [20, 25], advanced: [25, 30] },
      general_fitness: { beginner: [10, 15], intermediate: [12, 15], advanced: [10, 15] }
    }

    let baseSets = {
      beginner: { 30: 2, 45: 3, 60: 3, 90: 4 },
      intermediate: { 30: 3, 45: 3, 60: 4, 90: 4 },
      advanced: { 30: 3, 45: 4, 60: 4, 90: 5 }
    }

    const setsCount = {}
    Object.keys(baseSets).forEach(lvl => {
      setsCount[lvl] = {}
      Object.keys(baseSets[lvl]).forEach(dur => {
        setsCount[lvl][dur] = Math.round(baseSets[lvl][dur] * intensityMultiplier[intensity])
      })
    })

    const exercisesPerDay = {
      30: 4, 45: 5, 60: 6, 90: 8
    }

    const plan = []
    const splits = muscleGroups[days]
    const focuses = focusNames[days]

    for (let i = 0; i < days; i++) {
      const targetMuscles = splits[i]
      
      // Prioritize focus areas if selected
      let dayExercises = availableExercises.filter(ex => 
        targetMuscles.some(muscle => ex.bodyPart?.toLowerCase().includes(muscle))
      )

      // If focus areas selected, prioritize them
      if (focusAreas.length > 0) {
        const focusExercises = dayExercises.filter(ex =>
          focusAreas.some(focus => ex.bodyPart?.toLowerCase().includes(focus))
        )
        const otherExercises = dayExercises.filter(ex =>
          !focusAreas.some(focus => ex.bodyPart?.toLowerCase().includes(focus))
        )
        dayExercises = [...focusExercises, ...otherExercises]
      }

      // Prioritize compound movements for beginners
      const compoundKeywords = ['press', 'squat', 'deadlift', 'row', 'pull', 'dip', 'lunge']
      const compoundExercises = dayExercises.filter(ex =>
        compoundKeywords.some(kw => ex.name.toLowerCase().includes(kw))
      )
      const isolationExercises = dayExercises.filter(ex =>
        !compoundKeywords.some(kw => ex.name.toLowerCase().includes(kw))
      )

      // Mix compound and isolation based on level
      const compoundCount = level === 'beginner' ? Math.ceil(exercisesPerDay[duration] * 0.7) : Math.ceil(exercisesPerDay[duration] * 0.5)
      const isolationCount = exercisesPerDay[duration] - compoundCount

      const selectedCompound = compoundExercises.slice(0, compoundCount)
      const selectedIsolation = isolationExercises.slice(0, isolationCount)
      const allSelected = [...selectedCompound, ...selectedIsolation]

      const selectedExercises = allSelected.map(ex => ({
        name: ex.name,
        target: ex.target,
        sets: setsCount[level][duration],
        reps: Math.floor(Math.random() * (repsScheme[goal][level][1] - repsScheme[goal][level][0] + 1)) + repsScheme[goal][level][0]
      }))

      // If no exercises found, reuse available exercises
      if (selectedExercises.length === 0 && availableExercises.length > 0) {
        const fallbackExercises = availableExercises.slice(0, exercisesPerDay[duration]).map(ex => ({
          name: ex.name,
          target: ex.target,
          sets: setsCount[level][duration],
          reps: Math.floor(Math.random() * (repsScheme[goal][level][1] - repsScheme[goal][level][0] + 1)) + repsScheme[goal][level][0]
        }))
        selectedExercises.push(...fallbackExercises)
      }

      if (selectedExercises.length > 0) {
        plan.push({
          day: dayNames[i],
          focus: focuses[i],
          duration: duration,
          exercises: selectedExercises,
          tip: tips[goal][i % tips[goal].length]
        })
      }
    }

    // If still no plan, create basic plan with available exercises
    if (plan.length === 0 && availableExercises.length > 0) {
      for (let i = 0; i < days; i++) {
        const dayExercises = availableExercises.slice(0, exercisesPerDay[duration]).map(ex => ({
          name: ex.name,
          target: ex.target,
          sets: setsCount[level][duration],
          reps: Math.floor(Math.random() * (repsScheme[goal][level][1] - repsScheme[goal][level][0] + 1)) + repsScheme[goal][level][0]
        }))
        
        plan.push({
          day: dayNames[i],
          focus: focuses[i] || 'Full Body',
          duration: duration,
          exercises: dayExercises,
          tip: tips[goal][i % tips[goal].length]
        })
      }
    }

    return plan
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
    
    // Check for duplicate workout
    const isDuplicate = savedWorkouts.some(w => 
      w.name === workoutName.trim() && 
      w.exercises?.length === customWorkout.length
    )
    
    if (isDuplicate) {
      setError('A workout with this name already exists!')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      const response = await api('/workouts', {
        method: 'POST',
        body: {
          name: workoutName.trim(),
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
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ My Favorites
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
              📅 Smart Planner
            </button>
            <button 
              className={`tab-btn ${activeTab === 'myworkouts' ? 'active' : ''}`}
              onClick={() => setActiveTab('myworkouts')}
            >
              💪 My Workouts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📊 History & Analytics
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
            <div className="stat-card primary">
              <div className="stat-icon-large">🏋️</div>
              <div className="stat-content">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Exercises</div>
              </div>
            </div>
            {Object.entries(stats.byGroup)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([group, count]) => (
                <div key={group} className="stat-card">
                  <div className="stat-icon-large">{MUSCLE_GROUPS[group]?.icon || '💪'}</div>
                  <div className="stat-content">
                    <div className="stat-number">{count}</div>
                    <div className="stat-label">{MUSCLE_GROUPS[group]?.name || group}</div>
                  </div>
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
                  <option value="legs">🦵 Legs</option>
                  <option value="shoulders">🤸 Shoulders</option>
                  <option value="arms">💪 Arms</option>
                  <option value="core">🔥 Core</option>
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
                      title="View full details"
                    >
                      <span className="btn-icon">👁️</span>
                      <span className="btn-text">View</span>
                    </button>
                    <button 
                      className={`action-btn favorite-btn ${favorites.find(f => f._id === exercise._id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(exercise)}
                      title={favorites.find(f => f._id === exercise._id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.find(f => f._id === exercise._id) ? '⭐' : '☆'}
                    </button>
                    <button 
                      className="action-btn add-btn"
                      onClick={() => {
                        addToCustomWorkout(exercise)
                        setSuccess(`${exercise.name} added to workout builder!`)
                        setTimeout(() => setSuccess(''), 2000)
                      }}
                      title="Add to workout builder"
                    >
                      <span className="btn-icon">➕</span>
                      <span className="btn-text">Add</span>
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
              <div className="builder-header">
                <div className="builder-title">
                  <h2>🎯 Custom Workout Builder</h2>
                  <p>Create your personalized workout routine</p>
                </div>
                {customWorkout.length > 0 && (
                  <div className="builder-stats">
                    <span className="stat-badge">{customWorkout.length} exercises</span>
                    <span className="stat-badge">{customWorkout.reduce((sum, ex) => sum + (ex.sets || 3), 0)} total sets</span>
                  </div>
                )}
              </div>

              <div className="builder-layout">
                <div className="builder-sidebar">
                  <div className="sidebar-header">
                    <h3>Your Workout</h3>
                    {customWorkout.length > 0 && (
                      <button 
                        className="clear-all-btn"
                        onClick={() => {
                          if (confirm('Clear all exercises?')) {
                            setCustomWorkout([])
                            setWorkoutName('')
                          }
                        }}
                      >
                        🗑️ Clear
                      </button>
                    )}
                  </div>

                  <div className="workout-name-input">
                    <label>Workout Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Monday Chest Day"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="custom-workout-list">
                    {customWorkout.length === 0 ? (
                      <div className="empty-workout">
                        <div className="empty-icon">🏋️</div>
                        <h4>No exercises added</h4>
                        <p>Select exercises from the right panel to build your workout</p>
                      </div>
                    ) : (
                      customWorkout.map((ex, idx) => (
                        <div key={ex._id} className="workout-exercise-card">
                          <div className="exercise-order">{idx + 1}</div>
                          <div className="exercise-details">
                            <h4>{ex.name}</h4>
                            <div className="exercise-meta-small">
                              <span>🎯 {ex.target}</span>
                              <span>🏋️ {ex.equipment}</span>
                            </div>
                            <div className="exercise-inputs">
                              <div className="input-group">
                                <label>Sets</label>
                                <input
                                  type="number"
                                  value={ex.sets}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'sets', Number(e.target.value))}
                                  min="1"
                                  max="10"
                                />
                              </div>
                              <div className="input-group">
                                <label>Reps</label>
                                <input
                                  type="number"
                                  value={ex.reps}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'reps', Number(e.target.value))}
                                  min="1"
                                  max="50"
                                />
                              </div>
                              <div className="input-group">
                                <label>Rest (s)</label>
                                <input
                                  type="number"
                                  value={ex.rest}
                                  onChange={(e) => updateWorkoutExercise(ex._id, 'rest', Number(e.target.value))}
                                  min="0"
                                  max="300"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            className="remove-btn"
                            onClick={() => removeFromCustomWorkout(ex._id)}
                            title="Remove exercise"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {customWorkout.length > 0 && (
                    <button className="save-workout-btn" onClick={saveCustomWorkout}>
                      <span>💾</span>
                      <span>Save Workout</span>
                    </button>
                  )}
                </div>

                <div className="builder-exercises">
                  <div className="exercises-panel-header">
                    <h3>📚 Exercise Library</h3>
                    <span className="exercise-count">{filteredExercises.length} exercises</span>
                  </div>

                  <div className="quick-filters">
                    <select 
                      value={selectedGroup} 
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="filter-select-small"
                    >
                      <option value="all">All Muscle Groups</option>
                      {Object.entries(MUSCLE_GROUPS).map(([key, group]) => (
                        <option key={key} value={key}>{group.icon} {group.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="🔍 Search exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input-small"
                    />
                  </div>

                  <div className="exercises-grid-compact">
                    {loading ? (
                      <div className="loading-state">
                        <div className="loading-spinner">🔄</div>
                        <p>Loading exercises...</p>
                      </div>
                    ) : filteredExercises.length === 0 ? (
                      <div className="empty-state-compact">
                        <p>No exercises found</p>
                      </div>
                    ) : (
                      filteredExercises.slice(0, 12).map((exercise) => (
                        <div key={exercise._id} className="exercise-card-compact">
                          <div className="compact-image">
                            <img 
                              src={exercise.gifUrl} 
                              alt={exercise.name}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = `<div style="font-size: 3rem; display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #ff6b35, #ff8c42);">${exercise.icon}</div>`
                              }}
                            />
                          </div>
                          <div className="compact-info">
                            <h4>{exercise.name}</h4>
                            <p>{exercise.target}</p>
                          </div>
                          <button
                            className="add-compact-btn"
                            onClick={() => addToCustomWorkout(exercise)}
                            disabled={customWorkout.find(e => e._id === exercise._id)}
                          >
                            {customWorkout.find(e => e._id === exercise._id) ? '✓' : '➕'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Weekly Planner Tab */}
          {activeTab === 'planner' && (
            <div className="tab-content fade-in">
              <div className="planner-container">
                <div className="planner-header">
                  <div>
                    <h2>🧠 Smart Workout Planner</h2>
                    <p style={{ color: '#ccc', marginTop: '8px' }}>Intelligent workout plans based on your goals and available exercises</p>
                  </div>
                </div>
                
                {!smartPlan ? (
                  <div className="smart-plan-form">
                    <div className="form-section">
                      <h3 className="section-title">🎯 Primary Settings</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Fitness Goal</label>
                          <select value={planGoal} onChange={(e) => setPlanGoal(e.target.value)} className="form-select">
                            <option value="muscle_gain">💪 Muscle Gain (Hypertrophy)</option>
                            <option value="strength">🏋️ Strength Building</option>
                            <option value="weight_loss">🔥 Weight Loss (Fat Burn)</option>
                            <option value="endurance">🏃 Endurance & Stamina</option>
                            <option value="general_fitness">❤️ General Fitness</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Experience Level</label>
                          <select value={planLevel} onChange={(e) => setPlanLevel(e.target.value)} className="form-select">
                            <option value="beginner">🟢 Beginner (0-6 months)</option>
                            <option value="intermediate">🟡 Intermediate (6-24 months)</option>
                            <option value="advanced">🔴 Advanced (2+ years)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Training Days per Week</label>
                          <select value={planDays} onChange={(e) => setPlanDays(Number(e.target.value))} className="form-select">
                            <option value="3">3 Days</option>
                            <option value="4">4 Days</option>
                            <option value="5">5 Days</option>
                            <option value="6">6 Days</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Session Duration</label>
                          <select value={planDuration} onChange={(e) => setPlanDuration(Number(e.target.value))} className="form-select">
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">⚙️ Advanced Customization</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Available Equipment</label>
                          <select value={planEquipment} onChange={(e) => setPlanEquipment(e.target.value)} className="form-select">
                            <option value="all">🏋️ All Equipment</option>
                            <option value="bodyweight">🤸 Bodyweight Only</option>
                            <option value="dumbbell">🏋️‍♀️ Dumbbells Only</option>
                            <option value="barbell">🏋️ Barbell & Weights</option>
                            <option value="machine">⚙️ Machines Only</option>
                            <option value="home">🏠 Home Gym (Dumbbells + Bodyweight)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Workout Intensity</label>
                          <select value={planIntensity} onChange={(e) => setPlanIntensity(e.target.value)} className="form-select">
                            <option value="light">🟢 Light (Recovery Focus)</option>
                            <option value="moderate">🟡 Moderate (Balanced)</option>
                            <option value="high">🔴 High (Performance)</option>
                            <option value="extreme">🔥 Extreme (Advanced Only)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Rest Day Placement</label>
                          <select value={planRestDays} onChange={(e) => setPlanRestDays(e.target.value)} className="form-select">
                            <option value="auto">🤖 Auto (Optimized)</option>
                            <option value="weekend">🎉 Weekends</option>
                            <option value="midweek">📅 Mid-Week</option>
                            <option value="distributed">🔄 Distributed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">🎯 Focus Areas (Optional)</h3>
                      <div className="focus-areas-grid">
                        {Object.entries(MUSCLE_GROUPS).slice(0, 8).map(([key, group]) => (
                          <label key={key} className="focus-checkbox">
                            <input
                              type="checkbox"
                              checked={planFocusAreas.includes(key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPlanFocusAreas([...planFocusAreas, key])
                                } else {
                                  setPlanFocusAreas(planFocusAreas.filter(f => f !== key))
                                }
                              }}
                            />
                            <span className="focus-label">
                              <span className="focus-icon">{group.icon}</span>
                              <span>{group.name}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {planFocusAreas.length > 0 && (
                        <p className="focus-hint">✨ Plan will prioritize: {planFocusAreas.map(f => MUSCLE_GROUPS[f]?.name).join(', ')}</p>
                      )}
                    </div>

                    <button 
                      className="generate-plan-btn"
                      onClick={() => {
                        setGeneratingPlan(true)
                        setTimeout(() => {
                          const plan = generateSmartPlan(
                            exercises, 
                            planGoal, 
                            planLevel, 
                            planDays, 
                            planDuration,
                            planEquipment,
                            planFocusAreas,
                            planIntensity
                          )
                          setSmartPlan(plan)
                          setGeneratingPlan(false)
                          setSuccess('Smart Plan Generated!')
                          setTimeout(() => setSuccess(''), 2000)
                        }, 1000)
                      }}
                      disabled={generatingPlan}
                    >
                      {generatingPlan ? '🧠 Generating Your Custom Plan...' : '✨ Generate Smart Plan'}
                    </button>
                  </div>
                ) : (
                  <div className="smart-plan-result">
                    <div className="plan-header">
                      <div>
                        <h3>🎯 Your {planDays}-Day {planGoal.replace('_', ' ').toUpperCase()} Plan</h3>
                        <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '5px' }}>
                          {planLevel.charAt(0).toUpperCase() + planLevel.slice(1)} Level • {planDuration} min sessions
                        </p>
                      </div>
                      <button 
                        className="regenerate-btn"
                        onClick={() => setSmartPlan(null)}
                      >
                        🔄 New Plan
                      </button>
                    </div>
                    <div className="week-grid">
                      {smartPlan.map((dayPlan, idx) => (
                        <div key={idx} className="day-card smart-day-card">
                          <div className="day-header">
                            <h3>{dayPlan.day}</h3>
                            <span className="day-badge">{dayPlan.focus}</span>
                          </div>
                          <div className="day-meta">
                            <span>⏱️ {dayPlan.duration} min</span>
                            <span>💪 {dayPlan.exercises.length} exercises</span>
                          </div>
                          {dayPlan.tip && (
                            <div className="smart-tip">
                              💡 <em>{dayPlan.tip}</em>
                            </div>
                          )}
                          <div className="day-exercises">
                            {dayPlan.exercises.map((ex, i) => (
                              <div key={i} className="day-exercise">
                                <div className="ex-info">
                                  <span className="ex-name">{ex.name}</span>
                                  <span className="ex-target">{ex.target}</span>
                                </div>
                                <span className="ex-details">{ex.sets} × {ex.reps}</span>
                              </div>
                            ))}
                          </div>
                          <button 
                            className="save-day-btn"
                            onClick={async () => {
                              try {
                                const workoutName = `${dayPlan.day} - ${dayPlan.focus}`
                                
                                // Check for duplicate
                                const isDuplicate = savedWorkouts.some(w => 
                                  w.name === workoutName
                                )
                                
                                if (isDuplicate) {
                                  setError('This workout already saved!')
                                  setTimeout(() => setError(''), 2000)
                                  return
                                }
                                
                                await api('/workouts', {
                                  method: 'POST',
                                  body: {
                                    name: workoutName,
                                    category: 'custom',
                                    isTemplate: true,
                                    exercises: dayPlan.exercises.map(e => ({
                                      name: e.name,
                                      sets: e.sets,
                                      reps: e.reps,
                                      rest: 60,
                                      weight: 0
                                    }))
                                  },
                                  token
                                })
                                setSuccess('Saved to My Workouts!')
                                setTimeout(() => setSuccess(''), 2000)
                                loadSavedWorkouts()
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

          {/* History & Analytics Tab */}
          {activeTab === 'history' && (
            <div className="tab-content fade-in">
              <div className="history-analytics-container">
                <h2>📊 Workout History & Analytics</h2>
                
                {/* Stats Overview */}
                <div className="analytics-stats-grid">
                  <div className="analytics-stat-card highlight">
                    <div className="stat-icon-large">🔥</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.currentStreak}</div>
                      <div className="stat-label">Current Streak</div>
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="stat-icon-large">💪</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.totalWorkouts}</div>
                      <div className="stat-label">Total Workouts</div>
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="stat-icon-large">🏋️</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.totalExercises}</div>
                      <div className="stat-label">Total Exercises</div>
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="stat-icon-large">📊</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.totalSets}</div>
                      <div className="stat-label">Total Sets</div>
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="stat-icon-large">🔢</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.totalReps.toLocaleString()}</div>
                      <div className="stat-label">Total Reps</div>
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="stat-icon-large">🏆</div>
                    <div className="stat-content">
                      <div className="stat-number">{historyStats.longestStreak}</div>
                      <div className="stat-label">Longest Streak</div>
                    </div>
                  </div>
                </div>
                
                {/* Insights */}
                <div className="insights-cards">
                  <div className="insight-card">
                    <h3>⭐ Favorite Exercise</h3>
                    <p className="insight-value">{historyStats.favoriteExercise}</p>
                    <span className="insight-label">Most performed exercise</span>
                  </div>
                  <div className="insight-card">
                    <h3>🎯 Most Worked Muscle</h3>
                    <p className="insight-value">{historyStats.mostWorkedMuscle}</p>
                    <span className="insight-label">Primary focus area</span>
                  </div>
                  <div className="insight-card">
                    <h3>📅 Avg Workouts/Week</h3>
                    <p className="insight-value">{historyStats.totalWorkouts > 0 ? (historyStats.totalWorkouts / Math.max(1, Math.ceil((new Date() - new Date(workoutHistory[workoutHistory.length - 1]?.date)) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1) : 0}</p>
                    <span className="insight-label">Weekly average</span>
                  </div>
                </div>
                
                {/* Workout History Timeline */}
                <div className="history-timeline-section">
                  <h3>📜 Workout History</h3>
                  {loadingHistory ? (
                    <div className="loading-state">🔄 Loading history...</div>
                  ) : workoutHistory.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">💪</div>
                      <h3>No workout history yet</h3>
                      <p>Complete workouts to see your history and analytics</p>
                    </div>
                  ) : (
                    <div className="history-timeline">
                      {workoutHistory
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((workout, idx) => (
                          <div key={workout._id} className="history-timeline-item">
                            <div className="timeline-marker">
                              <span className="timeline-number">{idx + 1}</span>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <div>
                                  <h4>{workout.name || `${workout.category} Workout`}</h4>
                                  <span className="timeline-date">
                                    📅 {new Date(workout.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <span className="workout-badge">{workout.category}</span>
                              </div>
                              <div className="timeline-stats">
                                <span>🏋️ {workout.exercises?.length || 0} exercises</span>
                                <span>📊 {workout.exercises?.reduce((sum, e) => sum + (e.sets || 0), 0) || 0} sets</span>
                                <span>🔢 {workout.exercises?.reduce((sum, e) => sum + ((e.sets || 0) * (e.reps || 0)), 0) || 0} reps</span>
                              </div>
                              {workout.exercises && workout.exercises.length > 0 && (
                                <div className="timeline-exercises">
                                  {workout.exercises.slice(0, 3).map((ex, i) => (
                                    <div key={i} className="timeline-exercise">
                                      <span className="ex-name">{ex.name}</span>
                                      <span className="ex-details">{ex.sets} × {ex.reps}</span>
                                    </div>
                                  ))}
                                  {workout.exercises.length > 3 && (
                                    <p className="more-exercises">+{workout.exercises.length - 3} more</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="tab-content fade-in">
              <div className="favorites-container">
                <h2>⭐ My Favorite Exercises</h2>
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">⭐</div>
                    <h3>No favorites yet</h3>
                    <p>Star exercises from the library to save them here</p>
                    <button 
                      className="btn-primary"
                      onClick={() => setActiveTab('library')}
                      style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(45deg, #ff6b35, #ff8c42)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                    >
                      📚 Browse Exercise Library
                    </button>
                  </div>
                ) : (
                  <div className="exercises-grid">
                    {favorites.map((exercise, index) => (
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
                          </div>
                          
                          <div className="exercise-sets">
                            💪 {exercise.sets || 3} sets × {exercise.reps || 10} reps
                          </div>
                        </div>
                        
                        <div className="exercise-actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => setSelectedExercise(exercise)}
                            title="View full details"
                          >
                            <span className="btn-icon">👁️</span>
                            <span className="btn-text">View</span>
                          </button>
                          <button 
                            className="action-btn favorite-btn active"
                            onClick={() => toggleFavorite(exercise)}
                            title="Remove from favorites"
                          >
                            ⭐
                          </button>
                          <button 
                            className="action-btn add-btn"
                            onClick={() => {
                              addToCustomWorkout(exercise)
                              setSuccess(`${exercise.name} added to workout builder!`)
                              setTimeout(() => setSuccess(''), 2000)
                            }}
                            title="Add to workout builder"
                          >
                            <span className="btn-icon">➕</span>
                            <span className="btn-text">Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    className="modal-btn favorite-btn"
                    onClick={() => toggleFavorite(selectedExercise)}
                  >
                    {favorites.find(f => f._id === selectedExercise._id) ? '⭐ Remove from Favorites' : '☆ Add to Favorites'}
                  </button>
                  <button 
                    className="modal-btn add-btn"
                    onClick={() => {
                      addToCustomWorkout(selectedExercise)
                      setSuccess(`${selectedExercise.name} added to workout builder!`)
                      setTimeout(() => setSuccess(''), 2000)
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