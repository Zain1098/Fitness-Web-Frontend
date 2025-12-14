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
  const { convertWeight, convertHeight, convertHeightToDb, convertWeightToDb, getWeightUnit, getHeightUnit, formatDate } = useSettings()
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
  
  // Stats
  const [stats, setStats] = useState({
    currentWeight: 0,
    weightChange: 0,
    totalEntries: 0,
    streak: 0
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showBFCalculator, setShowBFCalculator] = useState(false)
  const [showMMCalculator, setShowMMCalculator] = useState(false)
  
  // Calculator states
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [neck, setNeck] = useState('')
  const [waistCalc, setWaistCalc] = useState('')
  const [hipCalc, setHipCalc] = useState('')
  
  const calculateBodyFat = () => {
    const w = convertWeightToDb(weight)
    const h = convertHeightToDb(height)
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
    
    if (!w || !bf) return
    
    const fatMass = (w * bf) / 100
    const leanMass = w - fatMass
    const muscleMass = leanMass * 0.45
    
    setMuscle(convertWeight(muscleMass))
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
    
    try {
      await api('/progress', {
        method: 'POST',
        body: {
          weight: convertWeightToDb(weight),
          bodyFat: Number(bodyFat) || 0,
          muscle: convertWeightToDb(muscle),
          notes: notes.trim()
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
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              📈 Charts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              📸 Progress Photos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'measurements' ? 'active' : ''}`}
              onClick={() => setActiveTab('measurements')}
            >
              📏 Measurements
            </button>
          </div>

          {/* Messages */}
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="tab-content fade-in">
          {/* Onboarding Stats */}
          {onboardingData && (
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

          {/* Current Stats */}
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

          {/* Add Progress Form */}
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

          {/* Progress Timeline */}
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
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="tab-content fade-in">
              <div className="charts-container">
                <h2>📈 Progress Charts</h2>
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Weight Trend</h3>
                    <div className="chart-placeholder">
                      <div className="chart-line">
                        {entries.slice(0, 10).reverse().map((entry, idx) => (
                          <div 
                            key={idx} 
                            className="chart-bar"
                            style={{ height: `${(entry.weight / 100) * 100}%` }}
                            title={`${entry.weight} kg`}
                          >
                            <span className="bar-label">{entry.weight}</span>
                          </div>
                        ))}
                      </div>
                      {entries.length === 0 && <p className="no-data">📉 No data yet. Start tracking!</p>}
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h3>Body Composition</h3>
                    <div className="composition-stats">
                      <div className="comp-item">
                        <span className="comp-icon">💪</span>
                        <div>
                          <span className="comp-label">Muscle Mass</span>
                          <span className="comp-value">{convertWeight(entries[0]?.muscle || 0)} {getWeightUnit()}</span>
                        </div>
                      </div>
                      <div className="comp-item">
                        <span className="comp-icon">📉</span>
                        <div>
                          <span className="comp-label">Body Fat</span>
                          <span className="comp-value">{entries[0]?.bodyFat || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="tab-content fade-in">
              <div className="photos-container">
                <h2>📸 Progress Photos</h2>
                <div className="photos-upload">
                  <div className="upload-box">
                    <div className="upload-icon">📷</div>
                    <p>Upload progress photos</p>
                    <button className="upload-btn">📁 Choose Photos</button>
                    <p className="upload-hint">Coming Soon - Upload front, side, and back photos</p>
                  </div>
                </div>
                <div className="photos-grid">
                  <div className="photo-placeholder">
                    <span>📸</span>
                    <p>No photos yet</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && (
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
