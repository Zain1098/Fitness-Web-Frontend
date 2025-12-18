import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { showToast } from '../components/Toast.jsx'
import './Settings.css'

export default function Settings() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [nameOtp, setNameOtp] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')
  
  const [settings, setSettings] = useState({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    goal: 'build_muscle',
    activityLevel: 'moderate',
    workoutFrequency: '',
    experienceLevel: 'beginner',
    dietaryPreference: 'none',
    waterIntakeGoal: 8,
    sleepGoal: 8,
    bodyMeasurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
    notifications: {
      workoutReminders: true,
      progressUpdates: true,
      nutritionAlerts: true,
      weeklyReports: true
    }
  })

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  })

  useEffect(() => {
    loadSettings()
  }, [token])

  const loadSettings = async () => {
    if (!token) return
    try {
      setLoading(true)
      const userData = await api('/auth/me', { token })
      const prefs = userData.preferences || {}
      const onb = userData.onboarding_data || {}
      
      setSettings(prev => ({
        ...prev,
        gender: prefs.gender || onb.gender || prev.gender,
        age: prefs.age || onb.age || prev.age,
        height: prefs.height || onb.height || prev.height,
        weight: prefs.weight || onb.weight || prev.weight,
        targetWeight: prefs.targetWeight || onb.target_weight || prev.targetWeight,
        goal: prefs.goal || onb.goal || prev.goal,
        activityLevel: prefs.activityLevel || prev.activityLevel,
        workoutFrequency: prefs.workoutFrequency || onb.workout_frequency || prev.workoutFrequency,
        experienceLevel: prefs.experienceLevel || onb.fitness_level || prev.experienceLevel,
        dietaryPreference: prefs.dietaryPreference || onb.dietary_preference || prev.dietaryPreference,
        waterIntakeGoal: prefs.waterIntakeGoal || onb.water_intake_goal || prev.waterIntakeGoal,
        sleepGoal: prefs.sleepGoal || onb.sleep_goal || prev.sleepGoal,
        bodyMeasurements: onb.body_measurements || prev.bodyMeasurements,
        notifications: prefs.notifications || prev.notifications
      }))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      await api('/settings', { method: 'PUT', body: settings, token })
      showToast('Settings saved successfully!', 'success')
    } catch (err) {
      showToast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.new.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Passwords do not match', 'error')
      return
    }
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: passwordForm.current, newPassword: passwordForm.new },
        token
      })
      showToast('Password changed successfully!', 'success')
      setPasswordForm({ current: '', new: '', confirm: '', showCurrent: false, showNew: false, showConfirm: false })
    } catch (err) {
      showToast(err?.message || 'Failed to change password', 'error')
    }
  }

  const requestNameChange = async () => {
    if (!newName || newName.trim().length < 2) {
      showToast('Please enter a valid name', 'error')
      return
    }
    try {
      await api('/user/request-name-change', { method: 'POST', token, body: { newName } })
      showToast('OTP sent to your email', 'success')
      setOtpSent(true)
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP', 'error')
    }
  }

  const verifyNameChange = async () => {
    try {
      const result = await api('/user/verify-name-change', { method: 'POST', token, body: { otp: nameOtp } })
      showToast('Name updated successfully!', 'success')
      setShowNameModal(false)
      setNewName('')
      setNameOtp('')
      setOtpSent(false)
      loadSettings()
    } catch (err) {
      showToast(err?.message || 'Invalid OTP', 'error')
    }
  }

  const requestEmailChange = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showToast('Please enter a valid email', 'error')
      return
    }
    try {
      await api('/user/request-email-change', { method: 'POST', token, body: { newEmail } })
      showToast('OTP sent to new email', 'success')
      setOtpSent(true)
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP', 'error')
    }
  }

  const verifyEmailChange = async () => {
    try {
      await api('/user/verify-email-change', { method: 'POST', token, body: { otp: emailOtp } })
      showToast('Email updated successfully!', 'success')
      setShowEmailModal(false)
      setNewEmail('')
      setEmailOtp('')
      setOtpSent(false)
      loadSettings()
    } catch (err) {
      showToast(err?.message || 'Invalid OTP', 'error')
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/export-data?format=${exportFormat}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fitforge-data-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      showToast('Data exported successfully!', 'success')
      setShowExportModal(false)
    } catch (err) {
      showToast(err?.message || 'Failed to export data', 'error')
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error')
      return
    }
    try {
      await api('/user/delete-account', { method: 'POST', token, body: { password: deletePassword } })
      showToast('Account deleted', 'success')
      logout()
      navigate('/')
    } catch (err) {
      showToast(err?.message || 'Failed to delete account', 'error')
    }
  }

  const calculateBMI = () => {
    if (settings.height && settings.weight) {
      const bmi = (settings.weight / ((settings.height / 100) ** 2)).toFixed(1)
      return bmi
    }
    return null
  }

  if (!user) return null

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="settings-page-pro">
        <div className="settings-container-pro">
          <div className="settings-header-pro">
            <h1>⚙️ Settings</h1>
            <p>Manage your account and preferences</p>
          </div>

          {loading ? (
            <div className="loading-pro"><div className="spinner-pro"></div></div>
          ) : (
            <>
              <div className="settings-layout">
                <aside className="settings-sidebar">
                  {[
                    { id: 'profile', icon: '👤', label: 'Profile' },
                    { id: 'fitness', icon: '💪', label: 'Fitness' },
                    { id: 'body', icon: '📐', label: 'Body' },
                    { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
                    { id: 'notifications', icon: '🔔', label: 'Notifications' },
                    { id: 'security', icon: '🔒', label: 'Security' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="sidebar-icon">{tab.icon}</span>
                      <span className="sidebar-label">{tab.label}</span>
                    </button>
                  ))}
                </aside>

                <main className="settings-content">
                  {activeTab === 'profile' && (
                    <div className="content-section">
                      <h2>👤 Personal Information</h2>
                      <div className="form-grid-pro">
                        <div className="input-group-pro">
                          <label>Gender</label>
                          <select value={settings.gender} onChange={(e) => setSettings({...settings, gender: e.target.value})}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="input-group-pro">
                          <label>Age</label>
                          <input type="number" value={settings.age} onChange={(e) => setSettings({...settings, age: e.target.value})} placeholder="25" />
                        </div>
                        <div className="input-group-pro">
                          <label>Height (cm)</label>
                          <input type="number" value={settings.height} onChange={(e) => setSettings({...settings, height: e.target.value})} placeholder="175" />
                        </div>
                        <div className="input-group-pro">
                          <label>Weight (kg)</label>
                          <input type="number" value={settings.weight} onChange={(e) => setSettings({...settings, weight: e.target.value})} placeholder="70" />
                        </div>
                        <div className="input-group-pro">
                          <label>Target Weight (kg)</label>
                          <input type="number" value={settings.targetWeight} onChange={(e) => setSettings({...settings, targetWeight: e.target.value})} placeholder="65" />
                        </div>
                        <div className="input-group-pro">
                          <label>Experience Level</label>
                          <select value={settings.experienceLevel} onChange={(e) => setSettings({...settings, experienceLevel: e.target.value})}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                      {calculateBMI() && (
                        <div className="stats-row">
                          <div className="stat-box">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                              <div className="stat-value">{calculateBMI()}</div>
                              <div className="stat-label">BMI</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'fitness' && (
                    <div className="content-section">
                      <h2>💪 Fitness Goals</h2>
                      <div className="form-grid-pro">
                        <div className="input-group-pro full">
                          <label>Primary Goal</label>
                          <select value={settings.goal} onChange={(e) => setSettings({...settings, goal: e.target.value})}>
                            <option value="build_muscle">Build Muscle</option>
                            <option value="lose_weight">Lose Weight</option>
                            <option value="boost_performance">Boost Performance</option>
                            <option value="stay_fit">Stay Fit</option>
                          </select>
                        </div>
                        <div className="input-group-pro">
                          <label>Activity Level</label>
                          <select value={settings.activityLevel} onChange={(e) => setSettings({...settings, activityLevel: e.target.value})}>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Active</option>
                            <option value="very_active">Very Active</option>
                          </select>
                        </div>
                        <div className="input-group-pro">
                          <label>Workout Frequency (days/week)</label>
                          <input type="number" min="0" max="7" value={settings.workoutFrequency} onChange={(e) => setSettings({...settings, workoutFrequency: e.target.value})} placeholder="5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'body' && (
                    <div className="content-section">
                      <h2>📐 Body Measurements</h2>
                      <div className="form-grid-pro">
                        <div className="input-group-pro">
                          <label>💪 Chest (cm)</label>
                          <input type="number" value={settings.bodyMeasurements.chest} onChange={(e) => setSettings({...settings, bodyMeasurements: {...settings.bodyMeasurements, chest: e.target.value}})} placeholder="95" />
                        </div>
                        <div className="input-group-pro">
                          <label>⭕ Waist (cm)</label>
                          <input type="number" value={settings.bodyMeasurements.waist} onChange={(e) => setSettings({...settings, bodyMeasurements: {...settings.bodyMeasurements, waist: e.target.value}})} placeholder="80" />
                        </div>
                        <div className="input-group-pro">
                          <label>🍑 Hips (cm)</label>
                          <input type="number" value={settings.bodyMeasurements.hips} onChange={(e) => setSettings({...settings, bodyMeasurements: {...settings.bodyMeasurements, hips: e.target.value}})} placeholder="95" />
                        </div>
                        <div className="input-group-pro">
                          <label>💪 Arms (cm)</label>
                          <input type="number" value={settings.bodyMeasurements.arms} onChange={(e) => setSettings({...settings, bodyMeasurements: {...settings.bodyMeasurements, arms: e.target.value}})} placeholder="35" />
                        </div>
                        <div className="input-group-pro">
                          <label>🦵 Thighs (cm)</label>
                          <input type="number" value={settings.bodyMeasurements.thighs} onChange={(e) => setSettings({...settings, bodyMeasurements: {...settings.bodyMeasurements, thighs: e.target.value}})} placeholder="55" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'nutrition' && (
                    <div className="content-section">
                      <h2>🥗 Nutrition Preferences</h2>
                      <div className="form-grid-pro">
                        <div className="input-group-pro full">
                          <label>Dietary Preference</label>
                          <select value={settings.dietaryPreference} onChange={(e) => setSettings({...settings, dietaryPreference: e.target.value})}>
                            <option value="none">No Restrictions</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="keto">Keto</option>
                            <option value="paleo">Paleo</option>
                          </select>
                        </div>
                        <div className="input-group-pro">
                          <label>Water Goal (glasses/day)</label>
                          <input type="number" min="1" max="20" value={settings.waterIntakeGoal} onChange={(e) => setSettings({...settings, waterIntakeGoal: e.target.value})} />
                        </div>
                        <div className="input-group-pro">
                          <label>Sleep Goal (hours/day)</label>
                          <input type="number" min="4" max="12" step="0.5" value={settings.sleepGoal} onChange={(e) => setSettings({...settings, sleepGoal: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="content-section">
                      <h2>🔔 Notifications</h2>
                      <div className="toggles-pro">
                        {[
                          { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Get reminded about scheduled workouts' },
                          { key: 'progressUpdates', label: 'Progress Updates', desc: 'Receive updates on your fitness progress' },
                          { key: 'nutritionAlerts', label: 'Nutrition Alerts', desc: 'Meal logging and nutrition goals' },
                          { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly summary of your journey' }
                        ].map(item => (
                          <div key={item.key} className="toggle-row">
                            <div className="toggle-info-pro">
                              <div className="toggle-label-pro">{item.label}</div>
                              <div className="toggle-desc-pro">{item.desc}</div>
                            </div>
                            <label className="switch-pro">
                              <input type="checkbox" checked={settings.notifications[item.key]} onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, [item.key]: e.target.checked}})} />
                              <span className="slider-pro"></span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="content-section">
                      <h2>🔒 Security</h2>
                      
                      <div className="security-section">
                        <h3>Account Information</h3>
                        <div className="form-grid-pro">
                          <div className="input-group-pro">
                            <label>Username</label>
                            <div className="account-field">
                              <input type="text" value={user.username} disabled />
                              <button className="btn-edit-pro" onClick={() => setShowNameModal(true)}>Edit</button>
                            </div>
                          </div>
                          <div className="input-group-pro">
                            <label>Email</label>
                            <div className="account-field">
                              <input type="email" value={user.email} disabled />
                              <button className="btn-edit-pro" onClick={() => setShowEmailModal(true)}>Edit</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="security-section">
                        <h3>Change Password</h3>
                        <div className="form-grid-pro">
                          <div className="input-group-pro">
                            <label>Current Password</label>
                            <div className="password-field">
                              <input type={passwordForm.showCurrent ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} />
                              <button type="button" onClick={() => setPasswordForm({...passwordForm, showCurrent: !passwordForm.showCurrent})}>{passwordForm.showCurrent ? '👁️' : '👁️‍🗨️'}</button>
                            </div>
                          </div>
                          <div className="input-group-pro">
                            <label>New Password</label>
                            <div className="password-field">
                              <input type={passwordForm.showNew ? 'text' : 'password'} value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} />
                              <button type="button" onClick={() => setPasswordForm({...passwordForm, showNew: !passwordForm.showNew})}>{passwordForm.showNew ? '👁️' : '👁️‍🗨️'}</button>
                            </div>
                          </div>
                          <div className="input-group-pro">
                            <label>Confirm Password</label>
                            <div className="password-field">
                              <input type={passwordForm.showConfirm ? 'text' : 'password'} value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                              <button type="button" onClick={() => setPasswordForm({...passwordForm, showConfirm: !passwordForm.showConfirm})}>{passwordForm.showConfirm ? '👁️' : '👁️‍🗨️'}</button>
                            </div>
                          </div>
                        </div>
                        <button className="btn-primary-pro" onClick={changePassword}>Change Password</button>
                      </div>

                      <div className="security-section">
                        <h3>📥 Export Your Data</h3>
                        <p>Download all your fitness data in your preferred format</p>
                        <button className="btn-export-pro" onClick={() => setShowExportModal(true)}>Export Data</button>
                      </div>

                      <div className="danger-section">
                        <h3>⚠️ Danger Zone</h3>
                        <p>Once deleted, there is no going back</p>
                        <button className="btn-danger-pro" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
                      </div>
                    </div>
                  )}

                  <div className="save-bar">
                    <button className="btn-save-pro" onClick={saveSettings} disabled={saving}>
                      {saving ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </main>
              </div>
            </>
          )}
        </div>
      </div>

      {showExportModal && (
        <div className="modal-overlay-pro" onClick={() => setShowExportModal(false)}>
          <div className="modal-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>📥 Export Your Data</h2>
              <button onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body-pro">
              <p style={{marginBottom: '20px', color: '#ccc'}}>Choose the format for your data export. CSV can be opened in Excel.</p>
              <div className="export-options">
                <label className="export-option">
                  <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={(e) => setExportFormat(e.target.value)} />
                  <div className="option-content">
                    <div className="option-icon">📄</div>
                    <div className="option-info">
                      <div className="option-title">JSON</div>
                      <div className="option-desc">Complete data with full structure</div>
                    </div>
                  </div>
                </label>
                <label className="export-option">
                  <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={(e) => setExportFormat(e.target.value)} />
                  <div className="option-content">
                    <div className="option-icon">📊</div>
                    <div className="option-info">
                      <div className="option-title">CSV</div>
                      <div className="option-desc">Excel & Spreadsheet compatible</div>
                    </div>
                  </div>
                </label>

              </div>
            </div>
            <div className="modal-footer-pro">
              <button className="btn-cancel-pro" onClick={() => setShowExportModal(false)}>Cancel</button>
              <button className="btn-primary-pro" onClick={exportData}>Download</button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="modal-overlay-pro" onClick={() => { setShowNameModal(false); setOtpSent(false); }}>
          <div className="modal-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>✏️ Change Username</h2>
              <button onClick={() => { setShowNameModal(false); setOtpSent(false); }}>×</button>
            </div>
            <div className="modal-body-pro">
              {!otpSent ? (
                <>
                  <div className="input-group-pro">
                    <label>New Username</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter new username" />
                  </div>
                  <button className="btn-primary-pro" onClick={requestNameChange}>Send OTP</button>
                </>
              ) : (
                <>
                  <div className="input-group-pro">
                    <label>Enter OTP (sent to your email)</label>
                    <input type="text" value={nameOtp} onChange={(e) => setNameOtp(e.target.value)} placeholder="6-digit OTP" maxLength="6" />
                  </div>
                  <button className="btn-primary-pro" onClick={verifyNameChange}>Verify & Update</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-overlay-pro" onClick={() => { setShowEmailModal(false); setOtpSent(false); }}>
          <div className="modal-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>✉️ Change Email</h2>
              <button onClick={() => { setShowEmailModal(false); setOtpSent(false); }}>×</button>
            </div>
            <div className="modal-body-pro">
              {!otpSent ? (
                <>
                  <div className="input-group-pro">
                    <label>New Email</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" />
                  </div>
                  <button className="btn-primary-pro" onClick={requestEmailChange}>Send OTP</button>
                </>
              ) : (
                <>
                  <div className="input-group-pro">
                    <label>Enter OTP (sent to new email)</label>
                    <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="6-digit OTP" maxLength="6" />
                  </div>
                  <button className="btn-primary-pro" onClick={verifyEmailChange}>Verify & Update</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay-pro" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>⚠️ Delete Account</h2>
              <button onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body-pro">
              <div className="warning-box-pro">
                <p>This will permanently delete all your data</p>
              </div>
              <div className="input-group-pro">
                <label>Password</label>
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password" />
              </div>
              <div className="input-group-pro">
                <label>Type DELETE to confirm</label>
                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
              </div>
            </div>
            <div className="modal-footer-pro">
              <button className="btn-cancel-pro" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-delete-pro" onClick={deleteAccount}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
