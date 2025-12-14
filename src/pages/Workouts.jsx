import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { logActivity } from '../utils/activityLogger.js'
import './Workouts.css'

export default function Workouts() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Create workout form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [category, setCategory] = useState('strength')
  const [exercises, setExercises] = useState([])
  
  // Add exercise to workout
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('0')
  const [duration, setDuration] = useState('0')
  
  // Stats
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, totalExercises: 0 })

  const loadWorkouts = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api('/workouts', { token })
      setWorkouts(data || [])
      calculateStats(data || [])
    } catch (err) {
      setError('Failed to load workouts')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = data.filter(w => new Date(w.date) >= weekAgo).length
    const totalExercises = data.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)
    setStats({ total: data.length, thisWeek, totalExercises })
  }

  useEffect(() => {
    loadWorkouts()
  }, [token])

  const addExerciseToList = () => {
    if (!exerciseName.trim()) {
      setError('Please enter exercise name')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    const newExercise = {
      name: exerciseName.trim(),
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: Number(weight) || 0,
      duration: Number(duration) || 0
    }
    
    setExercises([...exercises, newExercise])
    setExerciseName('')
    setSets('3')
    setReps('10')
    setWeight('0')
    setDuration('0')
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const createWorkout = async () => {
    if (exercises.length === 0) {
      setError('Please add at least one exercise')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      await api('/workouts', {
        method: 'POST',
        body: {
          name: workoutName.trim() || `${category} Workout`,
          category,
          exercises
        },
        token
      })
      
      setSuccess('Workout created successfully!')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('workout_created', `Created ${category} workout with ${exercises.length} exercises`, 'fitness', user);
      logActivity('Workout Completed', `User completed ${workoutName.trim() || `${category} Workout`}`, 'user_action', user.username);
      
      // Reset form
      setWorkoutName('')
      setCategory('strength')
      setExercises([])
      setShowCreateForm(false)
      loadWorkouts()
    } catch (err) {
      setError('Failed to create workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  const deleteWorkout = async (id) => {
    try {
      await api(`/workouts/${id}`, { method: 'DELETE', token })
      setSuccess('Workout deleted!')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('workout_deleted', 'Deleted a workout', 'fitness', user);
      loadWorkouts()
    } catch (err) {
      setError('Failed to delete workout')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getCategoryIcon = (cat) => {
    const icons = {
      strength: '💪',
      cardio: '🏃',
      mobility: '🧘',
      sports: '⚽'
    }
    return icons[cat] || '🏋️'
  }

  const getCategoryColor = (cat) => {
    const colors = {
      strength: '#ff6b35',
      cardio: '#4caf50',
      mobility: '#2196f3',
      sports: '#ff9800'
    }
    return colors[cat] || '#666'
  }

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <div className="workouts-page">
        <div className="workouts-container">
          {/* Header */}
          <div className="workouts-header">
            <div>
              <h1>💪 My Workouts</h1>
              <p>Plan, track, and crush your fitness goals</p>
            </div>
            <button 
              className="create-workout-btn"
              onClick={() => {
                api('/track/click', { method: 'POST', token });
                setShowCreateForm(!showCreateForm);
              }}
            >
              {showCreateForm ? '✕ Cancel' : '➕ Create Workout'}
            </button>
          </div>

          {/* Messages */}
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          {/* Stats */}
          <div className="workout-stats">
            <div className="stat-card">
              <div className="stat-icon">🏋️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Workouts</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <span className="stat-value">{stats.thisWeek}</span>
                <span className="stat-label">This Week</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalExercises}</span>
                <span className="stat-label">Total Exercises</span>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => {
              api('/track/click', { method: 'POST', token });
              navigate('/exercises');
            }}>
              <div className="stat-icon">🔍</div>
              <div className="stat-info">
                <span className="stat-value">Browse</span>
                <span className="stat-label">Exercise Library</span>
              </div>
            </div>
          </div>

          {/* Create Workout Form */}
          {showCreateForm && (
            <div className="create-workout-section">
              <h2>➕ Create New Workout</h2>
              
              <div className="workout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Workout Name (Optional)</label>
                    <input
                      type="text"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      placeholder="e.g., Upper Body Day, Morning Run"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-select"
                    >
                      <option value="strength">💪 Strength</option>
                      <option value="cardio">🏃 Cardio</option>
                      <option value="mobility">🧘 Mobility</option>
                      <option value="sports">⚽ Sports</option>
                    </select>
                  </div>
                </div>

                <div className="add-exercise-section">
                  <h3>Add Exercises</h3>
                  <div className="exercise-input-grid">
                    <input
                      type="text"
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      placeholder="Exercise name"
                      className="form-input"
                    />
                    <input
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      placeholder="Sets"
                      className="form-input"
                    />
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="Reps"
                      className="form-input"
                    />
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Weight (kg)"
                      className="form-input"
                    />
                    <button 
                      className="add-exercise-btn"
                      onClick={() => {
                        api('/track/click', { method: 'POST', token });
                        addExerciseToList();
                      }}
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>

                {/* Exercise List */}
                {exercises.length > 0 && (
                  <div className="exercises-list">
                    <h4>Exercises ({exercises.length})</h4>
                    {exercises.map((ex, index) => (
                      <div key={index} className="exercise-item">
                        <div className="exercise-details">
                          <span className="exercise-name">{ex.name}</span>
                          <span className="exercise-meta">
                            {ex.sets} sets × {ex.reps} reps
                            {ex.weight > 0 && ` @ ${ex.weight}kg`}
                          </span>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeExercise(index)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateForm(false)
                      setExercises([])
                      setWorkoutName('')
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      api('/track/click', { method: 'POST', token });
                      createWorkout();
                    }}
                    disabled={exercises.length === 0}
                  >
                    💾 Save Workout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Workouts List */}
          <div className="workouts-list-section">
            <h2>📋 Your Workouts</h2>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>Loading workouts...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏋️</div>
                <h3>No workouts yet</h3>
                <p>Create your first workout to get started!</p>
                <button 
                  className="create-first-btn"
                  onClick={() => {
                    api('/track/click', { method: 'POST', token });
                    setShowCreateForm(true);
                  }}
                >
                  ➕ Create First Workout
                </button>
              </div>
            ) : (
              <div className="workouts-grid">
                {workouts.map((workout) => (
                  <div 
                    key={workout._id} 
                    className="workout-card"
                    style={{ borderLeftColor: getCategoryColor(workout.category) }}
                  >
                    <div className="workout-header">
                      <div className="workout-title">
                        <span className="category-icon">
                          {getCategoryIcon(workout.category)}
                        </span>
                        <div>
                          <h3>{workout.name || `${workout.category} Workout`}</h3>
                          <span className="workout-date">
                            📅 {new Date(workout.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="delete-workout-btn"
                        onClick={() => deleteWorkout(workout._id)}
                        title="Delete workout"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="workout-exercises">
                      {workout.exercises?.map((exercise, index) => (
                        <div key={index} className="workout-exercise">
                          <span className="exercise-number">{index + 1}</span>
                          <div className="exercise-info">
                            <span className="exercise-name">{exercise.name}</span>
                            <span className="exercise-details">
                              💪 {exercise.sets}×{exercise.reps}
                              {exercise.weight > 0 && ` • 🏋️ ${exercise.weight}kg`}
                              {exercise.duration > 0 && ` • ⏱️ ${exercise.duration}min`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="workout-footer">
                      <span className="exercise-count">
                        {workout.exercises?.length || 0} exercises
                      </span>
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(workout.category) }}
                      >
                        {workout.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
