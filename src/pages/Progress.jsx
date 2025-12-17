import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { api } from '../api/client.js'
import { logActivity } from '../utils/activityLogger.js'
import './Progress.css'

export default function Progress() {
  const { token, user } = useAuth()
  const { convertWeight, convertHeight, convertHeightToDb, convertWeightToDb, getWeightUnit, getHeightUnit, formatDate, updateSettings } = useSettings()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscle, setMuscle] = useState('')
  const [notes, setNotes] = useState('')
  const [arms, setArms] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [thighs, setThighs] = useState('')
  const [calves, setCalves] = useState('')
  const [hips, setHips] = useState('')
  const [photos, setPhotos] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Stats
  const [stats, setStats] = useState({
    currentWeight: 0,
    weightChange: 0,
    totalEntries: 0,
    streak: 0
  })
  
  const [activeTab, setActiveTab] = useState('record')
  const [showBFCalculator, setShowBFCalculator] = useState(false)
  const [showMMCalculator, setShowMMCalculator] = useState(false)
  
  // Calculator states
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [neck, setNeck] = useState('')
  const [waistCalc, setWaistCalc] = useState('')
  const [hipCalc, setHipCalc] = useState('')
  
  const calculateBodyFat = () => {
    const w = convertWeightToDb(weight)
    
    // Calculate height in cm based on unit
    let h = 0
    if (getHeightUnit() === 'cm') {
      h = Number(height)
    } else {
      // For inches unit, check if feet/inches fields are used
      if (heightFeet || heightInches) {
        const totalInches = (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)
        h = totalInches * 2.54 // Convert to cm
      } else {
        h = Number(height) * 2.54 // Direct inches to cm
      }
    }
    
    const n = convertHeightToDb(neck)
    const wc = convertHeightToDb(waistCalc)
    const hc = convertHeightToDb(hipCalc)
    
    if (!w || !h || !n || !wc) return
    
    let bf = 0
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wc - n) + 0.15456 * Math.log10(h)) - 450
    } else {
      if (!hc) return
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wc + hc - n) + 0.22100 * Math.log10(h)) - 450
    }
    
    setBodyFat(Math.max(0, bf).toFixed(1))
    setShowBFCalculator(false)
  }
  
  const calculateMuscleMass = () => {
    const w = convertWeightToDb(weight)
    const bf = parseFloat(bodyFat)
    
    if (!w || !bf || bf <= 0 || bf >= 100) return
    
    const fatMass = (w * bf) / 100
    const leanMass = w - fatMass
    const muscleMass = leanMass * 0.45
    
    setMuscle(Number(convertWeight(muscleMass)).toFixed(1))
    setShowMMCalculator(false)
  }

  const [onboardingData, setOnboardingData] = useState(null)

  const loadProgress = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [progressData, onboarding] = await Promise.all([
        api('/progress', { token }),
        api('/user/onboarding', { token }).catch(() => ({ data: null }))
      ])
      setEntries(progressData || [])
      setOnboardingData(onboarding?.data)
      calculateStats(progressData || [])
    } catch (err) {
      setError('Failed to load progress data')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ currentWeight: 0, weightChange: 0, totalEntries: 0, streak: 0 })
      return
    }
    
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
    const current = sorted[0]?.weight || 0
    const previous = sorted[1]?.weight || current
    const change = current - previous
    
    setStats({
      currentWeight: current,
      weightChange: change,
      totalEntries: data.length,
      streak: calculateStreak(data)
    })
  }

  const calculateStreak = (data) => {
    if (data.length === 0) return 0
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
    let streak = 1
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].date)
      const next = new Date(sorted[i + 1].date)
      const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) streak++
      else break
    }
    return streak
  }



  useEffect(() => {
    loadProgress()
  }, [token])

  const addProgress = async () => {
    if (!weight.trim()) {
      setError('Please enter your weight')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    // Check for duplicate entry (same day)
    const today = new Date().toDateString()
    const isDuplicate = entries.some(entry => 
      new Date(entry.date).toDateString() === today
    )
    
    if (isDuplicate) {
      setError('Progress already recorded for today!')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      await api('/progress', {
        method: 'POST',
        body: {
          weight: convertWeightToDb(weight),
          bodyFat: Number(bodyFat) || 0,
          muscle: convertWeightToDb(muscle),
          arms: convertHeightToDb(arms),
          chest: convertHeightToDb(chest),
          waist: convertHeightToDb(waist),
          hips: convertHeightToDb(hips),
          thighs: convertHeightToDb(thighs),
          calves: convertHeightToDb(calves),
          notes: notes.trim(),
          photos: photos
        },
        token
      })
      
      setSuccess('Progress recorded!')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('progress_recorded', `Recorded weight: ${convertWeightToDb(weight)}kg`, 'progress', user);
      
      // Reset form
      setWeight('')
      setBodyFat('')
      setMuscle('')
      setNotes('')
      setArms('')
      setChest('')
      setWaist('')
      setHips('')
      setThighs('')
      setCalves('')
      setPhotos([])
      
      loadProgress()
    } catch (err) {
      setError('Failed to add progress')
      setTimeout(() => setError(''), 3000)
    }
  }

  const deleteEntry = async (id) => {
    try {
      await api(`/progress/${id}`, { method: 'DELETE', token })
      setSuccess('Entry deleted!')
      setTimeout(() => setSuccess(''), 3000)
      logActivity('progress_deleted', 'Deleted a progress entry', 'progress', user);
      loadProgress()
    } catch (err) {
      setError('Failed to delete entry')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="progress-page">
        <div className="progress-container">
          {/* Header */}
          <div className="progress-header">
            <h1>📈 Progress Tracker</h1>
            <p>Track your fitness journey and celebrate your wins</p>
          </div>

          {/* Navigation Tabs */}
          <div className="progress-tabs">
            <button 
              className={`tab-btn ${activeTab === 'record' ? 'active' : ''}`}
              onClick={() => setActiveTab('record')}
            >
              ➕ Record Progress
            </button>
            <button 
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              📜 Timeline
            </button>
            <button 
              className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              📈 Charts & Analytics
            </button>
          </div>

          {/* Messages */}
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          {/* Tab Content */}
          {activeTab === 'record' && (
            <div className="tab-content fade-in">
              {/* Quick Stats */}
              <div className="quick-stats-grid">
                <div className="quick-stat-card">
                  <div className="stat-icon">⚖️</div>
                  <div className="stat-info">
                    <span className="stat-value">{convertWeight(stats.currentWeight || onboardingData?.weight || 0)} {getWeightUnit()}</span>
                    <span className="stat-label">Current Weight</span>
                  </div>
                </div>
                <div className="quick-stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <span className="stat-value">{onboardingData?.target_weight ? convertWeight(onboardingData.target_weight) + ' ' + getWeightUnit() : 'Not Set'}</span>
                    <span className="stat-label">Target Weight</span>
                  </div>
                </div>
                <div className="quick-stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalEntries}</span>
                    <span className="stat-label">Total Records</span>
                  </div>
                </div>
              </div>

              {/* Record Form */}
              <div className="record-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>➕ Record Today's Progress</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="unit-toggle-btn"
                      onClick={() => {
                        const currentUnit = getWeightUnit()
                        const newUnit = currentUnit === 'kg' ? 'lbs' : 'kg'
                        
                        // Convert existing values
                        if (weight) {
                          const kgValue = currentUnit === 'kg' ? Number(weight) : Number(weight) * 0.453592
                          setWeight(newUnit === 'kg' ? kgValue.toFixed(1) : (kgValue * 2.20462).toFixed(1))
                        }
                        if (muscle) {
                          const kgValue = currentUnit === 'kg' ? Number(muscle) : Number(muscle) * 0.453592
                          setMuscle(newUnit === 'kg' ? kgValue.toFixed(1) : (kgValue * 2.20462).toFixed(1))
                        }
                        
                        updateSettings({ units: newUnit }, token)
                      }}
                      title="Toggle weight unit"
                    >
                      {getWeightUnit() === 'kg' ? '⚖️ kg → lbs' : '⚖️ lbs → kg'}
                    </button>
                    <button 
                      type="button" 
                      className="unit-toggle-btn"
                      onClick={() => {
                        const currentUnit = getHeightUnit()
                        const newUnit = currentUnit === 'cm' ? 'inches' : 'cm'
                        
                        // Convert existing measurement values
                        if (arms) {
                          const cmValue = currentUnit === 'cm' ? Number(arms) : Number(arms) * 2.54
                          setArms(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        if (chest) {
                          const cmValue = currentUnit === 'cm' ? Number(chest) : Number(chest) * 2.54
                          setChest(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        if (waist) {
                          const cmValue = currentUnit === 'cm' ? Number(waist) : Number(waist) * 2.54
                          setWaist(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        if (hips) {
                          const cmValue = currentUnit === 'cm' ? Number(hips) : Number(hips) * 2.54
                          setHips(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        if (thighs) {
                          const cmValue = currentUnit === 'cm' ? Number(thighs) : Number(thighs) * 2.54
                          setThighs(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        if (calves) {
                          const cmValue = currentUnit === 'cm' ? Number(calves) : Number(calves) * 2.54
                          setCalves(newUnit === 'cm' ? cmValue.toFixed(1) : (cmValue / 2.54).toFixed(1))
                        }
                        
                        updateSettings({ heightUnit: newUnit }, token)
                      }}
                      title="Toggle height unit"
                    >
                      {getHeightUnit() === 'cm' ? '📏 cm → in' : '📏 in → cm'}
                    </button>
                  </div>
                </div>
                <div className="record-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight *</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Enter weight"
                          className="form-input"
                        />
                        <span className="unit-label">{getWeightUnit()}</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Body Fat %</label>
                      <div className="input-with-btn">
                        <input
                          type="number"
                          step="0.1"
                          value={bodyFat}
                          onChange={(e) => setBodyFat(e.target.value)}
                          placeholder="Optional"
                          className="form-input"
                        />
                        <button type="button" className="calc-btn" onClick={() => setShowBFCalculator(!showBFCalculator)} title="Calculate">
                          🧮
                        </button>
                      </div>
                      {showBFCalculator && (
                        <div className="calculator-popup">
                          <h4>Body Fat Calculator (US Navy Method)</h4>
                          <p className="calc-note" style={{fontSize: '0.8rem', marginBottom: '10px'}}>Enter your body measurements</p>
                          <select value={gender} onChange={(e) => setGender(e.target.value)} className="calc-input">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                          
                          {getHeightUnit() === 'cm' ? (
                            <input 
                              type="number" 
                              placeholder="Height (e.g., 170 cm)" 
                              value={height} 
                              onChange={(e) => setHeight(e.target.value)} 
                              className="calc-input" 
                            />
                          ) : (
                            <div style={{display: 'flex', gap: '10px'}}>
                              <input 
                                type="number" 
                                placeholder="Feet (e.g., 5)" 
                                value={heightFeet} 
                                onChange={(e) => setHeightFeet(e.target.value)} 
                                className="calc-input" 
                                style={{flex: 1}}
                              />
                              <input 
                                type="number" 
                                placeholder="Inches (e.g., 4)" 
                                value={heightInches} 
                                onChange={(e) => setHeightInches(e.target.value)} 
                                className="calc-input" 
                                style={{flex: 1}}
                              />
                            </div>
                          )}
                          
                          <input type="number" placeholder={`Neck circumference (${getHeightUnit()})`} value={neck} onChange={(e) => setNeck(e.target.value)} className="calc-input" />
                          <input type="number" placeholder={`Waist circumference (${getHeightUnit()})`} value={waistCalc} onChange={(e) => setWaistCalc(e.target.value)} className="calc-input" />
                          {gender === 'female' && (
                            <input type="number" placeholder={`Hip circumference (${getHeightUnit()})`} value={hipCalc} onChange={(e) => setHipCalc(e.target.value)} className="calc-input" />
                          )}
                          <button onClick={calculateBodyFat} className="calc-submit-btn">Calculate</button>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Muscle Mass</label>
                      <div className="input-with-btn">
                        <div className="input-with-unit" style={{ flex: 1 }}>
                          <input
                            type="number"
                            step="0.1"
                            value={muscle}
                            onChange={(e) => setMuscle(e.target.value)}
                            placeholder="Optional"
                            className="form-input"
                          />
                          <span className="unit-label">{getWeightUnit()}</span>
                        </div>
                        <button type="button" className="calc-btn" onClick={() => setShowMMCalculator(!showMMCalculator)} title="Calculate">
                          🧮
                        </button>
                      </div>
                      {showMMCalculator && (
                        <div className="calculator-popup">
                          <h4>Muscle Mass Calculator</h4>
                          <p className="calc-note">Based on weight and body fat percentage</p>
                          <button onClick={calculateMuscleMass} className="calc-submit-btn" disabled={!weight || !bodyFat}>
                            {!weight || !bodyFat ? 'Enter Weight & Body Fat First' : 'Calculate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Measurements */}
                  <div className="measurements-section">
                    <h3>📏 Body Measurements (Optional)</h3>
                    <div className="measurements-grid">
                      <div className="form-group">
                        <label>💪 Arms</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={arms} onChange={(e) => setArms(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>👕 Chest</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>👖 Waist</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>🎯 Hips</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={hips} onChange={(e) => setHips(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>🦵 Thighs</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={thighs} onChange={(e) => setThighs(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>🦵 Calves</label>
                        <div className="input-with-unit">
                          <input type="number" step="0.1" value={calves} onChange={(e) => setCalves(e.target.value)} className="form-input" />
                          <span className="unit-label">{getHeightUnit()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How are you feeling? Any achievements?"
                      className="form-textarea"
                      rows="3"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="form-group">
                    <label>📸 Progress Photos (Optional)</label>
                    <input 
                      type="file" 
                      id="photo-upload-record" 
                      accept="image/*" 
                      multiple
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files)
                        if (files.length === 0) return
                        
                        try {
                          const photoUrls = []
                          for (const file of files) {
                            const reader = new FileReader()
                            const base64 = await new Promise((resolve) => {
                              reader.onloadend = () => resolve(reader.result)
                              reader.readAsDataURL(file)
                            })
                            photoUrls.push({ url: base64, type: 'front' })
                          }
                          setPhotos(photoUrls)
                          setSuccess('Photos selected!')
                          setTimeout(() => setSuccess(''), 2000)
                        } catch (err) {
                          setError('Failed to load photos')
                          setTimeout(() => setError(''), 2000)
                        }
                      }}
                    />
                    <button type="button" className="upload-btn" onClick={() => document.getElementById('photo-upload-record').click()}>
                      📁 Choose Photos
                    </button>
                    {photos.length > 0 && <p style={{marginTop: '10px', color: '#4caf50'}}>{photos.length} photo(s) selected</p>}
                  </div>
                  
                  <button 
                    className="btn-primary btn-large"
                    onClick={addProgress}
                    disabled={!weight.trim()}
                  >
                    💾 Save Progress
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tab-content fade-in">
          {onboardingData && false && (
            <div className="onboarding-stats">
              <h2>🎯 Your Fitness Profile</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <div className="stat-info">
                    <span className="stat-value">{onboardingData.age} yrs</span>
                    <span className="stat-label">Age</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📏</div>
                  <div className="stat-info">
                    <span className="stat-value">{convertHeight(onboardingData.height)} {getHeightUnit()}</span>
                    <span className="stat-label">Height</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚖️</div>
                  <div className="stat-info">
                    <span className="stat-value">{convertWeight(onboardingData.weight)} {getWeightUnit()}</span>
                    <span className="stat-label">Starting Weight</span>
                  </div>
                </div>
                {onboardingData.target_weight && (
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                      <span className="stat-value">{convertWeight(onboardingData.target_weight)} {getWeightUnit()}</span>
                      <span className="stat-label">Target Weight</span>
                    </div>
                  </div>
                )}
                <div className="stat-card">
                  <div className="stat-icon">💪</div>
                  <div className="stat-info">
                    <span className="stat-value">{onboardingData.fitness_level}</span>
                    <span className="stat-label">Fitness Level</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <span className="stat-value">{onboardingData.goal?.replace('_', ' ')}</span>
                    <span className="stat-label">Goal</span>
                  </div>
                </div>
              </div>
              {onboardingData.focus_areas?.length > 0 && (
                <div className="focus-areas">
                  <h3>🎯 Focus Areas</h3>
                  <div className="focus-tags">
                    {onboardingData.focus_areas.map((area, idx) => (
                      <span key={idx} className="focus-tag">{area}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Section */}
          <div className="timeline-section-new">
            <h2>📜 Progress Timeline</h2>
            
            {/* Stats Summary */}
            <div className="timeline-stats-summary">
              <div className="summary-card">
                <div className="summary-icon">⚖️</div>
                <div className="summary-content">
                  <span className="summary-value">{convertWeight(stats.currentWeight || 0)} {getWeightUnit()}</span>
                  <span className="summary-label">Current</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📈</div>
                <div className="summary-content">
                  <span className="summary-value">{stats.weightChange !== 0 ? (stats.weightChange > 0 ? '+' : '') + Number(convertWeight(stats.weightChange)).toFixed(1) : '0'} {getWeightUnit()}</span>
                  <span className="summary-label">Change</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📊</div>
                <div className="summary-content">
                  <span className="summary-value">{stats.totalEntries}</span>
                  <span className="summary-label">Records</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🔥</div>
                <div className="summary-content">
                  <span className="summary-value">{stats.streak}</span>
                  <span className="summary-label">Week Streak</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>Loading progress data...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <h3>No progress entries yet</h3>
                <p>Start tracking your progress in the Record tab!</p>
                <button className="btn-primary" onClick={() => setActiveTab('record')} style={{ marginTop: '20px' }}>
                  ➕ Record Progress
                </button>
              </div>
            ) : (
              <div className="timeline-list">
                {entries
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry) => (
                    <div key={entry._id} className="timeline-card">
                      <div className="timeline-card-header">
                        <div className="timeline-date-badge">
                          📅 {formatDate(entry.date)}
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            className="edit-icon-btn"
                            onClick={() => setEditingEntry(entry)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-icon-btn"
                            onClick={() => deleteEntry(entry._id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="timeline-card-body">
                        <div className="metric-row">
                          <div className="metric-item primary">
                            <span className="metric-icon">⚖️</span>
                            <div className="metric-info">
                              <span className="metric-value">{convertWeight(entry.weight || 0)} {getWeightUnit()}</span>
                              <span className="metric-label">Weight</span>
                            </div>
                          </div>
                          
                          {entry.bodyFat > 0 && (
                            <div className="metric-item">
                              <span className="metric-icon">📊</span>
                              <div className="metric-info">
                                <span className="metric-value">{entry.bodyFat}%</span>
                                <span className="metric-label">Body Fat</span>
                              </div>
                            </div>
                          )}
                          
                          {entry.muscle > 0 && (
                            <div className="metric-item">
                              <span className="metric-icon">💪</span>
                              <div className="metric-info">
                                <span className="metric-value">{convertWeight(entry.muscle)} {getWeightUnit()}</span>
                                <span className="metric-label">Muscle</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {(entry.arms || entry.chest || entry.waist || entry.hips || entry.thighs || entry.calves) && (
                          <div className="measurements-row">
                            <h4>📏 Measurements</h4>
                            <div className="measurements-list">
                              {entry.arms && <span>💪 Arms: {convertHeight(entry.arms)} {getHeightUnit()}</span>}
                              {entry.chest && <span>👕 Chest: {convertHeight(entry.chest)} {getHeightUnit()}</span>}
                              {entry.waist && <span>👖 Waist: {convertHeight(entry.waist)} {getHeightUnit()}</span>}
                              {entry.hips && <span>🎯 Hips: {convertHeight(entry.hips)} {getHeightUnit()}</span>}
                              {entry.thighs && <span>🦵 Thighs: {convertHeight(entry.thighs)} {getHeightUnit()}</span>}
                              {entry.calves && <span>🦵 Calves: {convertHeight(entry.calves)} {getHeightUnit()}</span>}
                            </div>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <div className="notes-row">
                            <span className="notes-icon">📝</span>
                            <p>{entry.notes}</p>
                          </div>
                        )}
                        
                        {entry.photos && entry.photos.length > 0 && (
                          <div className="photos-row">
                            <h4>📸 Photos</h4>
                            <div className="photos-compact">
                              {entry.photos.slice(0, 3).map((photo, idx) => (
                                <img 
                                  key={idx} 
                                  src={photo.url} 
                                  alt="Progress" 
                                  className="photo-thumb" 
                                  onClick={() => setSelectedImage(photo.url)}
                                />
                              ))}
                              {entry.photos.length > 3 && <span className="photo-more">+{entry.photos.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
            </div>
          )}

          {/* Current Stats */}
          {false && (
          <div className="current-stats">
            <h2>📊 Current Progress</h2>
            <div className="stats-grid">
              <div className="stat-card weight">
                <div className="stat-icon">⚖️</div>
                <div className="stat-info">
                  <span className="stat-value">{convertWeight(stats.currentWeight || onboardingData?.weight || 0)} {getWeightUnit()}</span>
                  <span className="stat-label">Current Weight</span>
                  {stats.weightChange !== 0 && (
                    <span className={`stat-change ${stats.weightChange > 0 ? 'up' : 'down'}`}>
                      {stats.weightChange > 0 ? '↑' : '↓'} {convertWeight(Math.abs(stats.weightChange))} {getWeightUnit()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="stat-card entries">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalEntries}</span>
                  <span className="stat-label">Total Entries</span>
                </div>
              </div>
              
              <div className="stat-card streak">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.streak}</span>
                  <span className="stat-label">Week Streak</span>
                </div>
              </div>
            </div>
          </div>
          )}

          {false && (
          <div className="add-progress-section">
            <h2>➕ Record Progress</h2>
            <div className="progress-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Weight ({getWeightUnit()}) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={getWeightUnit() === 'kg' ? '75.5' : '165'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Body Fat % (Optional)</label>
                  <div className="input-with-btn">
                    <input
                      type="number"
                      step="0.1"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="e.g., 15.5"
                      className="form-input"
                    />
                    <button type="button" className="calc-btn" onClick={() => setShowBFCalculator(!showBFCalculator)} title="Calculate Body Fat">
                      🧮
                    </button>
                  </div>
                  {showBFCalculator && (
                    <div className="calculator-popup">
                      <h4>Body Fat Calculator (US Navy Method)</h4>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="calc-input">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <input type="number" placeholder={`Height (${getHeightUnit()})`} value={height} onChange={(e) => setHeight(e.target.value)} className="calc-input" />
                      <input type="number" placeholder={`Neck (${getHeightUnit()})`} value={neck} onChange={(e) => setNeck(e.target.value)} className="calc-input" />
                      <input type="number" placeholder={`Waist (${getHeightUnit()})`} value={waistCalc} onChange={(e) => setWaistCalc(e.target.value)} className="calc-input" />
                      {gender === 'female' && (
                        <input type="number" placeholder={`Hip (${getHeightUnit()})`} value={hipCalc} onChange={(e) => setHipCalc(e.target.value)} className="calc-input" />
                      )}
                      <button onClick={calculateBodyFat} className="calc-submit-btn">Calculate</button>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Muscle Mass ({getWeightUnit()}) (Optional)</label>
                  <div className="input-with-btn">
                    <input
                      type="number"
                      step="0.1"
                      value={muscle}
                      onChange={(e) => setMuscle(e.target.value)}
                      placeholder={getWeightUnit() === 'kg' ? '45.0' : '99'}
                      className="form-input"
                    />
                    <button type="button" className="calc-btn" onClick={() => setShowMMCalculator(!showMMCalculator)} title="Calculate Muscle Mass">
                      🧮
                    </button>
                  </div>
                  {showMMCalculator && (
                    <div className="calculator-popup">
                      <h4>Muscle Mass Calculator</h4>
                      <p className="calc-note">Based on weight and body fat percentage</p>
                      <button onClick={calculateMuscleMass} className="calc-submit-btn" disabled={!weight || !bodyFat}>
                        {!weight || !bodyFat ? 'Enter Weight & Body Fat First' : 'Calculate'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any achievements?"
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <button 
                className="btn-primary"
                onClick={addProgress}
                disabled={!weight.trim()}
              >
                💾 Save Progress
              </button>
            </div>
          </div>

          )}
          {false && (
          <div className="timeline-section">
            <h2>📅 Progress Timeline</h2>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>Loading progress data...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <h3>No progress entries yet</h3>
                <p>Start tracking your progress today!</p>
              </div>
            ) : (
              <div className="timeline">
                {entries
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, index) => (
                    <div key={entry._id} className="timeline-item">
                      <div className="timeline-marker">
                        <span className="timeline-number">{index + 1}</span>
                      </div>
                      
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-date">
                            📅 {formatDate(entry.date)}
                          </div>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteEntry(entry._id)}
                            title="Delete entry"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="timeline-stats">
                          <div className="timeline-stat">
                            <span className="stat-icon">⚖️</span>
                            <div>
                              <span className="stat-label">Weight</span>
                              <span className="stat-value">{convertWeight(entry.weight || 0)} {getWeightUnit()}</span>
                            </div>
                          </div>
                          
                          {entry.bodyFat > 0 && (
                            <div className="timeline-stat">
                              <span className="stat-icon">📊</span>
                              <div>
                                <span className="stat-label">Body Fat</span>
                                <span className="stat-value">{entry.bodyFat}%</span>
                              </div>
                            </div>
                          )}
                          
                          {entry.muscle > 0 && (
                            <div className="timeline-stat">
                              <span className="stat-icon">💪</span>
                              <div>
                                <span className="stat-label">Muscle</span>
                                <span className="stat-value">{convertWeight(entry.muscle)} {getWeightUnit()}</span>
                              </div>
                            </div>
                          )}
                          
                          {entry.liftPRKg > 0 && (
                            <div className="timeline-stat">
                              <span className="stat-icon">🏋️</span>
                              <div>
                                <span className="stat-label">Lift PR</span>
                                <span className="stat-value">{convertWeight(entry.liftPRKg)} {getWeightUnit()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {entry.notes && (
                          <div className="timeline-notes">
                            <span className="notes-icon">📝</span>
                            <p>{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="tab-content fade-in">
              <div className="charts-container">
                <h2>📈 Progress Charts</h2>
                {entries.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No data to visualize yet</h3>
                    <p>Start tracking your progress to see beautiful charts!</p>
                  </div>
                ) : (
                  <>
                    <div className="charts-grid">
                      <div className="chart-card full-width">
                        <h3>⚖️ Weight Trend (Last 30 Days)</h3>
                        <div className="line-chart">
                          <div className="chart-y-axis">
                            {[...Array(5)].map((_, i) => {
                              const maxWeight = Math.max(...entries.slice(0, 30).map(e => e.weight || 0))
                              const minWeight = Math.min(...entries.slice(0, 30).map(e => e.weight || 0).filter(w => w > 0))
                              const step = (maxWeight - minWeight) / 4
                              const value = maxWeight - (i * step)
                              return (
                                <div key={i} className="y-label">
                                  {Number(convertWeight(value)).toFixed(1)}
                                </div>
                              )
                            })}
                          </div>
                          <div className="chart-area">
                            <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              {entries.slice(0, 30).reverse().length > 1 && (() => {
                                const data = entries.slice(0, 30).reverse().filter(e => e.weight > 0)
                                const maxWeight = Math.max(...data.map(e => e.weight))
                                const minWeight = Math.min(...data.map(e => e.weight))
                                const range = maxWeight - minWeight || 1
                                const points = data.map((e, i) => {
                                  const x = (i / (data.length - 1)) * 600
                                  const y = 200 - ((e.weight - minWeight) / range) * 180
                                  return `${x},${y}`
                                }).join(' ')
                                const areaPoints = `0,200 ${points} 600,200`
                                return (
                                  <>
                                    <polyline points={points} fill="none" stroke="#ff6b35" strokeWidth="3" />
                                    <polygon points={areaPoints} fill="url(#weightGradient)" />
                                    {data.map((e, i) => {
                                      const x = (i / (data.length - 1)) * 600
                                      const y = 200 - ((e.weight - minWeight) / range) * 180
                                      return (
                                        <circle key={i} cx={x} cy={y} r="4" fill="#ff6b35">
                                          <title>{convertWeight(e.weight)} {getWeightUnit()} - {formatDate(e.date)}</title>
                                        </circle>
                                      )
                                    })}
                                  </>
                                )
                              })()}
                            </svg>
                          </div>
                        </div>
                        <div className="chart-footer">
                          <span>📅 {formatDate(entries[Math.min(29, entries.length - 1)]?.date)}</span>
                          <span>→</span>
                          <span>📅 {formatDate(entries[0]?.date)}</span>
                        </div>
                      </div>
                      
                      <div className="chart-card">
                        <h3>📊 Body Fat % Progress</h3>
                        <div className="progress-comparison">
                          {entries.filter(e => e.bodyFat > 0).length > 0 ? (
                            <>
                              <div className="comparison-item">
                                <span className="comparison-label">Latest</span>
                                <div className="circular-progress" style={{'--progress': entries.find(e => e.bodyFat > 0)?.bodyFat || 0}}>
                                  <span className="progress-value">{entries.find(e => e.bodyFat > 0)?.bodyFat || 0}%</span>
                                </div>
                              </div>
                              {entries.filter(e => e.bodyFat > 0).length > 1 && (
                                <>
                                  <div className="comparison-arrow">→</div>
                                  <div className="comparison-item">
                                    <span className="comparison-label">Starting</span>
                                    <div className="circular-progress" style={{'--progress': entries.filter(e => e.bodyFat > 0)[entries.filter(e => e.bodyFat > 0).length - 1]?.bodyFat || 0}}>
                                      <span className="progress-value">{entries.filter(e => e.bodyFat > 0)[entries.filter(e => e.bodyFat > 0).length - 1]?.bodyFat || 0}%</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <p className="no-data">No body fat data recorded</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="chart-card">
                        <h3>💪 Muscle Mass Trend</h3>
                        <div className="bar-chart-horizontal">
                          {entries.filter(e => e.muscle > 0).slice(0, 10).map((entry, idx) => (
                            <div key={idx} className="bar-item">
                              <span className="bar-date">{formatDate(entry.date)}</span>
                              <div className="bar-track">
                                <div 
                                  className="bar-fill muscle"
                                  style={{ width: `${(entry.muscle / Math.max(...entries.filter(e => e.muscle > 0).map(e => e.muscle))) * 100}%` }}
                                >
                                  <span className="bar-value">{convertWeight(entry.muscle)} {getWeightUnit()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {entries.filter(e => e.muscle > 0).length === 0 && <p className="no-data">No muscle mass data recorded</p>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Monthly Comparison */}
                    {entries.length >= 30 && (
                      <div className="comparison-section">
                        <h3>📊 Monthly Comparison</h3>
                        <div className="comparison-grid">
                          <div className="comparison-card">
                            <div className="comparison-header">This Month</div>
                            <div className="comparison-stats">
                              <div className="stat-row">
                                <span>Avg Weight:</span>
                                <span className="stat-value">{Number(convertWeight(entries.slice(0, 30).reduce((sum, e) => sum + (e.weight || 0), 0) / Math.min(30, entries.length))).toFixed(1)} {getWeightUnit()}</span>
                              </div>
                              <div className="stat-row">
                                <span>Entries:</span>
                                <span className="stat-value">{Math.min(30, entries.length)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="comparison-card">
                            <div className="comparison-header">Last Month</div>
                            <div className="comparison-stats">
                              <div className="stat-row">
                                <span>Avg Weight:</span>
                                <span className="stat-value">{Number(convertWeight(entries.slice(30, 60).reduce((sum, e) => sum + (e.weight || 0), 0) / Math.min(30, entries.slice(30).length))).toFixed(1)} {getWeightUnit()}</span>
                              </div>
                              <div className="stat-row">
                                <span>Entries:</span>
                                <span className="stat-value">{Math.min(30, entries.slice(30).length)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div className="image-modal" onClick={() => setSelectedImage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
                <img src={selectedImage} alt="Progress" />
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingEntry && (
            <div className="image-modal" onClick={() => setEditingEntry(null)}>
              <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>✏️ Edit Progress Entry</h3>
                  <button className="modal-close" onClick={() => setEditingEntry(null)}>×</button>
                </div>
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight ({getWeightUnit()})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={convertWeight(editingEntry.weight)}
                        onChange={(e) => setEditingEntry({...editingEntry, weight: convertWeightToDb(e.target.value)})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Body Fat %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingEntry.bodyFat || ''}
                        onChange={(e) => setEditingEntry({...editingEntry, bodyFat: Number(e.target.value)})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Muscle ({getWeightUnit()})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingEntry.muscle ? convertWeight(editingEntry.muscle) : ''}
                        onChange={(e) => setEditingEntry({...editingEntry, muscle: convertWeightToDb(e.target.value)})}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={editingEntry.notes || ''}
                      onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                  <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                    <button 
                      className="btn-primary"
                      onClick={async () => {
                        try {
                          await api(`/progress/${editingEntry._id}`, {
                            method: 'PUT',
                            body: {
                              weight: editingEntry.weight,
                              bodyFat: editingEntry.bodyFat,
                              muscle: editingEntry.muscle,
                              notes: editingEntry.notes
                            },
                            token
                          })
                          setSuccess('Entry updated!')
                          setTimeout(() => setSuccess(''), 3000)
                          setEditingEntry(null)
                          loadProgress()
                        } catch (err) {
                          setError('Failed to update')
                          setTimeout(() => setError(''), 3000)
                        }
                      }}
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setEditingEntry(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {false && activeTab === 'photos' && (
            <div className="tab-content fade-in">
              <div className="photos-container">
                <h2>📸 Progress Photos</h2>
                <div className="photos-upload">
                  <div className="upload-box">
                    <div className="upload-icon">📷</div>
                    <p>Upload progress photos (Front, Side, Back)</p>
                    <input 
                      type="file" 
                      id="photo-upload" 
                      accept="image/*" 
                      multiple
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files)
                        if (files.length === 0) return
                        
                        try {
                          setLoading(true)
                          const photoUrls = []
                          
                          for (const file of files) {
                            const reader = new FileReader()
                            const base64 = await new Promise((resolve) => {
                              reader.onloadend = () => resolve(reader.result)
                              reader.readAsDataURL(file)
                            })
                            photoUrls.push({ url: base64, type: 'front' })
                          }
                          
                          await api('/progress', {
                            method: 'POST',
                            body: { photos: photoUrls },
                            token
                          })
                          
                          setSuccess('Photos uploaded!')
                          setTimeout(() => setSuccess(''), 2000)
                          loadProgress()
                        } catch (err) {
                          setError('Failed to upload photos')
                          setTimeout(() => setError(''), 3000)
                        } finally {
                          setLoading(false)
                        }
                      }}
                    />
                    <button className="upload-btn" onClick={() => document.getElementById('photo-upload').click()}>
                      📁 Choose Photos
                    </button>
                    <p className="upload-hint">Select one or more photos to upload</p>
                  </div>
                </div>
                <div className="photos-grid">
                  {entries.filter(e => e.photos && e.photos.length > 0).length === 0 ? (
                    <div className="photo-placeholder">
                      <span>📸</span>
                      <p>No photos yet</p>
                      <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '10px' }}>Upload your first progress photo above</p>
                    </div>
                  ) : (
                    entries
                      .filter(e => e.photos && e.photos.length > 0)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry) => (
                        <div key={entry._id} className="photo-entry">
                          <div className="photo-date">
                            📅 {formatDate(entry.date)}
                            {entry.weight && <span className="photo-weight">⚖️ {convertWeight(entry.weight)} {getWeightUnit()}</span>}
                          </div>
                          <div className="photo-images">
                            {entry.photos.map((photo, idx) => (
                              <div key={idx} className="photo-item">
                                <img src={photo.url} alt={`Progress ${photo.type}`} />
                                <span className="photo-type">{photo.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {false && activeTab === 'measurements' && (
            <div className="tab-content fade-in">
              <div className="measurements-container">
                <h2>📏 Body Measurements</h2>
                <div className="measurements-grid">
                  <div className="measurement-card">
                    <div className="measurement-icon">💪</div>
                    <h3>Arms</h3>
                    <input type="number" step="0.1" value={arms} onChange={(e) => setArms(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.arms && <p className="last-value">Last: {convertHeight(entries[0].arms)} {getHeightUnit()}</p>}
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">👕</div>
                    <h3>Chest</h3>
                    <input type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.chest && <p className="last-value">Last: {convertHeight(entries[0].chest)} {getHeightUnit()}</p>}
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">👖</div>
                    <h3>Waist</h3>
                    <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.waist && <p className="last-value">Last: {convertHeight(entries[0].waist)} {getHeightUnit()}</p>}
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">🦵</div>
                    <h3>Thighs</h3>
                    <input type="number" step="0.1" value={thighs} onChange={(e) => setThighs(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.thighs && <p className="last-value">Last: {convertHeight(entries[0].thighs)} {getHeightUnit()}</p>}
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">🦵</div>
                    <h3>Calves</h3>
                    <input type="number" step="0.1" value={calves} onChange={(e) => setCalves(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.calves && <p className="last-value">Last: {convertHeight(entries[0].calves)} {getHeightUnit()}</p>}
                  </div>
                  <div className="measurement-card">
                    <div className="measurement-icon">🎯</div>
                    <h3>Hips</h3>
                    <input type="number" step="0.1" value={hips} onChange={(e) => setHips(e.target.value)} placeholder={`0 ${getHeightUnit()}`} className="measurement-input" />
                    {entries[0]?.hips && <p className="last-value">Last: {convertHeight(entries[0].hips)} {getHeightUnit()}</p>}
                  </div>
                </div>
                
                <button className="btn-primary save-all-measurements" onClick={async () => {
                  try {
                    await api('/progress', {
                      method: 'POST',
                      body: { 
                        arms: convertHeightToDb(arms), 
                        chest: convertHeightToDb(chest), 
                        waist: convertHeightToDb(waist), 
                        thighs: convertHeightToDb(thighs), 
                        calves: convertHeightToDb(calves), 
                        hips: convertHeightToDb(hips) 
                      },
                      token
                    })
                    setSuccess('Measurements saved!')
                    setTimeout(() => setSuccess(''), 3000)
                    setArms(''); setChest(''); setWaist(''); setThighs(''); setCalves(''); setHips('')
                    loadProgress()
                  } catch (err) {
                    setError('Failed to save')
                    setTimeout(() => setError(''), 3000)
                  }
                }}>💾 Save All Measurements</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
