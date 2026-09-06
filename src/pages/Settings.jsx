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
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
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
    allergens: [],
    mealsPerDay: 3,
    waterIntakeGoal: 8,
    sleepGoal: 8,
    bodyMeasurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
    notifications: {
      workoutReminders: true,
      progressUpdates: true,
      nutritionAlerts: true,
      weeklyReports: true,
      paused: false
    }
  })

  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    verified: false,
    paused: false,
    phoneNumber: '',
    reminderTimes: { 
      workout: '18:00', 
      workoutEnabled: true, 
      sleep: '22:00', 
      sleepEnabled: true,
      preWorkout: true,
      hydration: true,
      mealReminder: true
    },
    dailyReport: { enabled: true, time: '08:00' },
    achievements: true,
    motivational: true
  })
  const [whatsappOtp, setWhatsappOtp] = useState('')
  const [whatsappOtpSent, setWhatsappOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [changingNumber, setChangingNumber] = useState(false)
  const [newWhatsappNumber, setNewWhatsappNumber] = useState('')
  const [savingWhatsApp, setSavingWhatsApp] = useState(false)

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
    // Test toast on page load
    // showToast('Settings page loaded', 'info')
  }, [token])

  const loadSettings = async () => {
    if (!token) return
    try {
      setLoading(true)
      const userData = await api('/auth/me', { token })
      const prefs = userData.preferences || {}
      const onb = userData.onboarding_data || {}
      
      console.log('Settings Load - Onboarding Data:', onb)
      console.log('Settings Load - Body Measurements:', onb.body_measurements)
      
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
        allergens: onb.allergens || prev.allergens,
        mealsPerDay: onb.meals_per_day || prev.mealsPerDay,
        waterIntakeGoal: prefs.waterIntakeGoal || onb.water_intake_goal || prev.waterIntakeGoal,
        sleepGoal: prefs.sleepGoal || onb.sleep_goal || prev.sleepGoal,
        bodyMeasurements: {
          chest: onb.body_measurements?.chest || prefs.bodyMeasurements?.chest || '',
          waist: onb.body_measurements?.waist || prefs.bodyMeasurements?.waist || '',
          hips: onb.body_measurements?.hips || prefs.bodyMeasurements?.hips || '',
          arms: onb.body_measurements?.arms || prefs.bodyMeasurements?.arms || '',
          thighs: onb.body_measurements?.thighs || prefs.bodyMeasurements?.thighs || ''
        },
        notifications: prefs.notifications || prev.notifications
      }))
      
      // Load WhatsApp settings
      if (userData.whatsappNotifications) {
        setWhatsappSettings({
          enabled: userData.whatsappNotifications.enabled || false,
          verified: userData.whatsappNotifications.verified || false,
          paused: userData.whatsappNotifications.paused || false,
          phoneNumber: userData.whatsappNotifications.phoneNumber || '',
          reminderTimes: {
            workout: userData.whatsappNotifications.reminderTimes?.workout || '18:00',
            workoutEnabled: userData.whatsappNotifications.reminderTimes?.workoutEnabled !== false,
            sleep: userData.whatsappNotifications.reminderTimes?.sleep || '22:00',
            sleepEnabled: userData.whatsappNotifications.reminderTimes?.sleepEnabled !== false,
            preWorkout: userData.whatsappNotifications.reminderTimes?.preWorkout !== false,
            hydration: userData.whatsappNotifications.reminderTimes?.hydration !== false,
            mealReminder: userData.whatsappNotifications.reminderTimes?.mealReminder !== false
          },
          dailyReport: userData.whatsappNotifications.dailyReport || { enabled: true, time: '08:00' },
          achievements: userData.whatsappNotifications.achievements !== false,
          motivational: userData.whatsappNotifications.motivational !== false
        })
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Save WhatsApp settings if on WhatsApp tab and verified
      if (activeTab === 'whatsapp' && whatsappSettings.verified) {
        setSavingWhatsApp(true)
        await api('/whatsapp/settings', {
          method: 'PUT',
          token,
          body: {
            reminderTimes: whatsappSettings.reminderTimes,
            dailyReport: whatsappSettings.dailyReport,
            paused: whatsappSettings.paused,
            achievements: whatsappSettings.achievements,
            motivational: whatsappSettings.motivational
          }
        })
        showToast('✅ WhatsApp settings saved successfully!', 'success', 5000)
        loadSettings()
        setSavingWhatsApp(false)
        return
      }
      
      console.log('[Frontend] Saving settings:', settings)
      console.log('[Frontend] Notifications:', settings.notifications)
      
      // Save general settings for other tabs
      await api('/settings', { method: 'PUT', body: settings, token })
      
      showToast('Settings saved successfully!', 'success', 5000)
      loadSettings()
    } catch (err) {
      console.error('Save settings error:', err)
      showToast(err?.message || 'Failed to save settings', 'error', 5000)
    } finally {
      setSaving(false)
    }
  }

  const connectWhatsApp = async () => {
    const phoneToVerify = changingNumber ? newWhatsappNumber : whatsappSettings.phoneNumber
    
    // Validate phone format
    const cleanPhone = phoneToVerify.replace(/[^0-9+]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid phone number', 'error', 5000)
      return
    }
    if (!cleanPhone.startsWith('+')) {
      showToast('Phone number must include country code (e.g., +92)', 'error', 5000)
      return
    }
    
    try {
      setSendingOtp(true)
      await api('/whatsapp/send-otp', {
        method: 'POST',
        token,
        body: { phoneNumber: cleanPhone }
      })
      setWhatsappOtpSent(true)
      showToast('📤 OTP sent to your WhatsApp! Check your phone.', 'success', 5000)
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP. Check your number.', 'error', 5000)
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyWhatsAppOtp = async () => {
    if (!whatsappOtp || whatsappOtp.length !== 6) {
      showToast('Please enter 6-digit OTP', 'error', 5000)
      return
    }
    try {
      setSaving(true)
      await api('/whatsapp/verify-otp', {
        method: 'POST',
        token,
        body: { otp: whatsappOtp }
      })
      showToast('✅ WhatsApp verified! Welcome message sent.', 'success', 5000)
      setWhatsappOtpSent(false)
      setWhatsappOtp('')
      setChangingNumber(false)
      setNewWhatsappNumber('')
      loadSettings()
    } catch (err) {
      showToast(err?.message || 'Invalid OTP. Please try again.', 'error', 5000)
    } finally {
      setSaving(false)
    }
  }

  const togglePauseWhatsApp = async () => {
    try {
      setSavingWhatsApp(true)
      const newPausedState = !whatsappSettings.paused
      await api('/whatsapp/settings', {
        method: 'PUT',
        token,
        body: { paused: newPausedState }
      })
      setWhatsappSettings({ ...whatsappSettings, paused: newPausedState })
      showToast(newPausedState ? '⏸️ Notifications paused' : '▶️ Notifications resumed', 'success', 5000)
    } catch (err) {
      showToast('Failed to update', 'error', 5000)
    } finally {
      setSavingWhatsApp(false)
    }
  }

  const disconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp notifications?')) return
    try {
      setSaving(true)
      await api('/whatsapp/disconnect', { method: 'POST', token })
      setWhatsappSettings({ enabled: false, verified: false, phoneNumber: '', reminderTimes: { workout: '18:00', workoutEnabled: true, sleep: '22:00', sleepEnabled: true, preWorkout: true, hydration: true, mealReminder: true }, dailyReport: { enabled: true, time: '08:00' }, achievements: true, motivational: true })
      showToast('WhatsApp disconnected', 'success', 5000)
    } catch (err) {
      showToast('Failed to disconnect', 'error', 5000)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.new.length < 8) {
      showToast('Password must be at least 8 characters', 'error', 5000)
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Passwords do not match', 'error', 5000)
      return
    }
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: passwordForm.current, newPassword: passwordForm.new },
        token
      })
      showToast('Password changed successfully!', 'success', 5000)
      setPasswordForm({ current: '', new: '', confirm: '', showCurrent: false, showNew: false, showConfirm: false })
    } catch (err) {
      showToast(err?.message || 'Failed to change password', 'error', 5000)
    }
  }

  const requestNameChange = async () => {
    if (!newName || newName.trim().length < 2) {
      showToast('Please enter a valid name', 'error', 5000)
      return
    }
    try {
      await api('/user/request-name-change', { method: 'POST', token, body: { newName } })
      showToast('OTP sent to your email', 'success', 5000)
      setOtpSent(true)
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP', 'error', 5000)
    }
  }

  const verifyNameChange = async () => {
    try {
      const result = await api('/user/verify-name-change', { method: 'POST', token, body: { otp: nameOtp } })
      showToast('Name updated successfully!', 'success', 5000)
      setShowNameModal(false)
      setNewName('')
      setNameOtp('')
      setOtpSent(false)
      loadSettings()
    } catch (err) {
      showToast(err?.message || 'Invalid OTP', 'error', 5000)
    }
  }

  const requestEmailChange = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showToast('Please enter a valid email', 'error', 5000)
      return
    }
    try {
      await api('/user/request-email-change', { method: 'POST', token, body: { newEmail } })
      showToast('OTP sent to new email', 'success', 5000)
      setOtpSent(true)
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP', 'error', 5000)
    }
  }

  const verifyEmailChange = async () => {
    try {
      await api('/user/verify-email-change', { method: 'POST', token, body: { otp: emailOtp } })
      showToast('Email updated successfully!', 'success', 5000)
      setShowEmailModal(false)
      setNewEmail('')
      setEmailOtp('')
      setOtpSent(false)
      loadSettings()
    } catch (err) {
      showToast(err?.message || 'Invalid OTP', 'error', 5000)
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
      
      showToast('Data exported successfully!', 'success', 5000)
      setShowExportModal(false)
    } catch (err) {
      showToast(err?.message || 'Failed to export data', 'error', 5000)
    }
  }

  const deleteAccount = async () => {
    // Validation
    if (!deletePassword || deletePassword.trim() === '') {
      showToast('Please enter your password', 'error', 5000)
      alert('Please enter your password') // Backup alert
      return
    }
    
    if (deleteConfirm !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error', 5000)
      alert('Please type DELETE to confirm') // Backup alert
      return
    }
    
    setIsDeleting(true)
    
    try {
      const response = await api('/user/delete-account', { 
        method: 'POST', 
        token, 
        body: { 
          password: deletePassword,
          reason: deleteReason || 'No reason provided'
        } 
      })
      
      showToast('Account deleted successfully. Redirecting...', 'success', 5000)
      alert('Account deleted successfully. Redirecting...') // Backup alert
      
      // Clear all data
      localStorage.clear()
      sessionStorage.clear()
      
      // Wait a bit then logout and redirect
      setTimeout(() => {
        logout()
        navigate('/')
      }, 1500)
      
    } catch (err) {
      console.error('Delete account error:', err)
      const errorMessage = err.message || 'Failed to delete account'
      showToast(errorMessage, 'error', 5000)
      alert(errorMessage) // Backup alert
      setIsDeleting(false)
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
      <div className="settings-page-pro min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 lg:pl-32 pt-8 px-4 lg:px-8">
        <div className="settings-container-pro">
          <div className="settings-header-pro">
            <h1 className="text-3xl font-black text-slate-950 font-['Outfit']">⚙️ Settings</h1>
            <p className="text-slate-500 font-medium">Manage your personal profile, fitness preferences, and account security</p>
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
                    { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
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
                            <option value="pescatarian">Pescatarian</option>
                            <option value="keto">Keto</option>
                            <option value="paleo">Paleo</option>
                            <option value="low_carb">Low Carb</option>
                            <option value="high_protein">High Protein</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="gluten_free">Gluten Free</option>
                          </select>
                        </div>
                        <div className="input-group-pro full">
                          <label>Food Allergies</label>
                          <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'10px'}}>
                            {['dairy', 'eggs', 'nuts', 'soy', 'shellfish', 'gluten'].map(allergen => (
                              <label key={allergen} style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'#F8FAFC', border:'1.5px solid #CBD5E1', borderRadius:'10px', cursor:'pointer', color:'#0F172A', fontWeight: 600}}>
                                <input 
                                  type="checkbox" 
                                  checked={settings.allergens.includes(allergen)}
                                  onChange={(e) => {
                                    const updated = e.target.checked 
                                      ? [...settings.allergens, allergen]
                                      : settings.allergens.filter(a => a !== allergen)
                                    setSettings({...settings, allergens: updated})
                                  }}
                                  style={{accentColor: '#0F172A'}}
                                />
                                <span style={{textTransform:'capitalize'}}>{allergen}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="input-group-pro">
                          <label>Meals Per Day</label>
                          <input type="number" min="1" max="8" value={settings.mealsPerDay} onChange={(e) => setSettings({...settings, mealsPerDay: e.target.value})} />
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
                      
                      {/* Notification Types */}
                      <div style={{marginBottom: '25px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px'}}>
                          {[
                            { key: 'workoutReminders', icon: '🏋️', label: 'Workout Reminders', desc: 'Get reminded about scheduled workouts' },
                            { key: 'progressUpdates', icon: '📈', label: 'Progress Updates', desc: 'Receive updates on your fitness progress' },
                            { key: 'nutritionAlerts', icon: '🍽️', label: 'Nutrition Alerts', desc: 'Meal logging and nutrition goals' },
                            { key: 'weeklyReports', icon: '📊', label: 'Weekly Reports', desc: 'Weekly summary of your journey' }
                          ].map(item => (
                            <div key={item.key} style={{
                              background: '#F8FAFC',
                              border: '1.5px solid #E2E8F0',
                              borderRadius: '16px',
                              padding: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                            onClick={() => setSettings({...settings, notifications: {...settings.notifications, [item.key]: !settings.notifications[item.key]}})}>
                              <div style={{fontSize: '1.8rem', flexShrink: 0}}>{item.icon}</div>
                              <div style={{flex: 1, minWidth: 0}}>
                                <div style={{color: '#0F172A', fontSize: '0.95rem', fontWeight: '700', marginBottom: '3px'}}>{item.label}</div>
                                <div style={{color: '#64748B', fontSize: '0.825rem'}}>{item.desc}</div>
                              </div>
                              <label className="switch-pro" style={{margin: 0}} onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={settings.notifications[item.key]} onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, [item.key]: e.target.checked}})} />
                                <span className="slider-pro"></span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Pause All */}
                      <div style={{
                        background: settings.notifications.paused ? '#FFF7ED' : '#F0FDF4',
                        border: `1.5px solid ${settings.notifications.paused ? '#FDBA74' : '#86EFAC'}`,
                        borderRadius: '16px',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{fontSize: '2rem'}}>{settings.notifications.paused ? '⏸️' : '▶️'}</div>
                        <div style={{flex: 1}}>
                          <div style={{color: '#0F172A', fontSize: '1rem', fontWeight: '800', marginBottom: '3px'}}>
                            {settings.notifications.paused ? 'All Notifications Paused' : 'All Notifications Active'}
                          </div>
                          <div style={{color: '#64748B', fontSize: '0.85rem', fontWeight: '500'}}>
                            {settings.notifications.paused ? 'Click to resume all browser notifications' : 'Click to pause all browser notifications temporarily'}
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, notifications: {...settings.notifications, paused: !settings.notifications.paused}})}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#0F172A',
                            color: settings.notifications.paused ? '#FDBA74' : '#D4F63D',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)'
                          }}
                        >
                          {settings.notifications.paused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                      </div>
                      
                      <div style={{marginTop: '20px', padding: '16px 20px', background: '#EFF6FF', borderRadius: '14px', border: '1.5px solid #BFDBFE'}}>
                        <p style={{color: '#1E3A8A', fontSize: '0.9rem', margin: 0, fontWeight: '500'}}>
                          💡 <strong>Note:</strong> For WhatsApp notifications, visit the WhatsApp tab. These toggles manage your direct in-browser push alerts.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div className="content-section">
                      <h2>💬 WhatsApp Notifications</h2>
                      <div className="info-box-pro" style={{background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '16px', padding: '20px', marginBottom: '25px'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '15px'}}>
                          <div style={{fontSize: '2rem'}}>💬</div>
                          <div>
                            <h3 style={{color: '#15803D', marginBottom: '6px', fontSize: '1.1rem', fontWeight: '800'}}>Get Fitness Updates on WhatsApp</h3>
                            <p style={{color: '#166534', lineHeight: '1.6', marginBottom: '10px', fontSize: '0.9rem'}}>Receive workout reminders, progress updates, and motivational messages directly on WhatsApp.</p>
                            <ul style={{color: '#15803D', paddingLeft: '20px', lineHeight: '1.7', fontSize: '0.85rem'}}>
                              <li>Workout & pre-workout reminders</li>
                              <li>Sleep & hydration reminders</li>
                              <li>Meal logging reminders</li>
                              <li>Daily progress reports</li>
                              <li>Weekly summaries every Sunday</li>
                              <li>Achievement notifications</li>
                              <li>Motivational messages</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="whatsapp-connect-section">
                        {(!whatsappSettings.verified || changingNumber) ? (
                          <>
                            <div className="form-grid-pro">
                              <div className="input-group-pro full">
                                <label>📱 WhatsApp Number {changingNumber && <span style={{color: '#EA580C'}}>(Changing)</span>}</label>
                                <div style={{display: 'flex', gap: '10px'}}>
                                  <input 
                                    type="tel" 
                                    value={changingNumber ? newWhatsappNumber : whatsappSettings.phoneNumber}
                                    onChange={(e) => changingNumber ? setNewWhatsappNumber(e.target.value) : setWhatsappSettings({...whatsappSettings, phoneNumber: e.target.value})}
                                    placeholder="+92 300 1234567" 
                                    style={{flex: 1}}
                                    disabled={whatsappOtpSent}
                                  />
                                  {!whatsappOtpSent && (
                                    <button 
                                      className="btn-primary-pro" 
                                      onClick={connectWhatsApp} 
                                      disabled={sendingOtp}
                                      style={{whiteSpace: 'nowrap', marginTop: 0}}
                                    >
                                      {sendingOtp ? '⏳ Sending...' : '📤 Send OTP'}
                                    </button>
                                  )}
                                </div>
                                <small style={{color: '#64748B', marginTop: '6px', display: 'block', fontWeight: 500}}>Enter your WhatsApp number with country code (e.g., +92 for Pakistan)</small>
                                {changingNumber && (
                                  <button 
                                    onClick={() => { setChangingNumber(false); setNewWhatsappNumber(''); }}
                                    style={{marginTop: '10px', background: 'transparent', border: 'none', color: '#EA580C', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600}}
                                  >
                                    Cancel Change
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {whatsappOtpSent && (
                              <div className="form-grid-pro" style={{marginTop: '20px'}}>
                                <div className="input-group-pro full">
                                  <label>🔐 Enter OTP</label>
                                  <div style={{display: 'flex', gap: '10px'}}>
                                    <input 
                                      type="text" 
                                      value={whatsappOtp}
                                      onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                      placeholder="Enter 6-digit OTP" 
                                      maxLength="6"
                                      style={{flex: 1, fontSize: '1.2rem', letterSpacing: '0.5rem', textAlign: 'center'}}
                                    />
                                    <button 
                                      className="btn-primary-pro" 
                                      onClick={verifyWhatsAppOtp}
                                      disabled={saving || whatsappOtp.length !== 6}
                                      style={{whiteSpace: 'nowrap', marginTop: 0}}
                                    >
                                      {saving ? '⏳ Verifying...' : '✅ Verify'}
                                    </button>
                                  </div>
                                  <small style={{color: '#64748B', marginTop: '6px', display: 'block', fontWeight: 500}}>Check your WhatsApp for the 6-digit OTP code (valid for 10 minutes)</small>
                                  <button 
                                    onClick={() => { setWhatsappOtpSent(false); setWhatsappOtp(''); }}
                                    style={{marginTop: '10px', background: 'transparent', border: 'none', color: '#EA580C', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600}}
                                  >
                                    Change Number
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="form-grid-pro">
                              <div className="input-group-pro full">
                                <label>📱 Connected Number <span style={{color: '#16A34A', marginLeft: '10px', fontWeight: 700}}>✓ Verified</span></label>
                                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                  <input 
                                    type="tel" 
                                    value={whatsappSettings.phoneNumber}
                                    disabled
                                    style={{flex: 1}}
                                  />
                                  <button 
                                    className="btn-edit-pro" 
                                    onClick={() => { setChangingNumber(true); setNewWhatsappNumber(''); }}
                                    style={{whiteSpace: 'nowrap'}}
                                  >
                                    🔄 Change Number
                                  </button>
                                  <button 
                                    className="btn-danger-pro" 
                                    onClick={disconnectWhatsApp}
                                    style={{whiteSpace: 'nowrap'}}
                                  >
                                    🔌 Disconnect
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="form-grid-pro" style={{marginTop: '25px'}}>
                              <div className="input-group-pro">
                                <label>🏋️ Workout Reminder Time</label>
                                <input 
                                  type="time" 
                                  value={whatsappSettings.reminderTimes.workout}
                                  onChange={(e) => setWhatsappSettings({...whatsappSettings, reminderTimes: {...whatsappSettings.reminderTimes, workout: e.target.value}})}
                                />
                                <small style={{color: '#64748B', marginTop: '5px', display: 'block', fontWeight: 500}}>24-hour format (e.g., 18:00 for 6 PM)</small>
                              </div>
                              <div className="input-group-pro">
                                <label>😴 Sleep Reminder Time</label>
                                <input 
                                  type="time" 
                                  value={whatsappSettings.reminderTimes.sleep}
                                  onChange={(e) => setWhatsappSettings({...whatsappSettings, reminderTimes: {...whatsappSettings.reminderTimes, sleep: e.target.value}})}
                                />
                                <small style={{color: '#64748B', marginTop: '5px', display: 'block', fontWeight: 500}}>24-hour format (e.g., 22:00 for 10 PM)</small>
                              </div>
                              <div className="input-group-pro">
                                <label>📊 Daily Report Time</label>
                                <input 
                                  type="time" 
                                  value={whatsappSettings.dailyReport.time}
                                  onChange={(e) => setWhatsappSettings({...whatsappSettings, dailyReport: {...whatsappSettings.dailyReport, time: e.target.value}})}
                                />
                                <small style={{color: '#64748B', marginTop: '5px', display: 'block', fontWeight: 500}}>24-hour format (e.g., 20:00 for 8 PM)</small>
                              </div>
                            </div>
                            
                            <div style={{marginTop: '25px'}}>
                              <h3 style={{marginBottom: '18px', color: '#0F172A', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <span>📬</span> Notification Preferences
                              </h3>
                              
                              {/* Compact Grid Layout */}
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px'}}>
                                {[
                                  { key: 'workoutEnabled', path: 'reminderTimes', icon: '🏋️', label: 'Workout Reminders', desc: 'At your workout time' },
                                  { key: 'preWorkout', path: 'reminderTimes', icon: '⏰', label: 'Pre-Workout Alert', desc: '30 mins before workout' },
                                  { key: 'sleepEnabled', path: 'reminderTimes', icon: '😴', label: 'Sleep Reminders', desc: 'At your sleep time' },
                                  { key: 'enabled', path: 'dailyReport', icon: '📊', label: 'Daily Reports', desc: 'Yesterday\'s summary' },
                                  { key: 'hydration', path: 'reminderTimes', icon: '💧', label: 'Hydration', desc: '10 AM, 2 PM, 6 PM' },
                                  { key: 'mealReminder', path: 'reminderTimes', icon: '🍽️', label: 'Meal Reminders', desc: 'Breakfast, lunch, dinner' },
                                  { key: 'achievements', path: null, icon: '🎯', label: 'Achievements', desc: 'Milestone notifications' },
                                  { key: 'motivational', path: null, icon: '💪', label: 'Motivational', desc: 'Encouragement & alerts' }
                                ].map(item => (
                                  <div key={item.key} style={{
                                    background: '#F8FAFC',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                  onClick={() => {
                                    if (item.path) {
                                      setWhatsappSettings({
                                        ...whatsappSettings,
                                        [item.path]: {
                                          ...whatsappSettings[item.path],
                                          [item.key]: !whatsappSettings[item.path][item.key]
                                        }
                                      })
                                    } else {
                                      setWhatsappSettings({
                                        ...whatsappSettings,
                                        [item.key]: !whatsappSettings[item.key]
                                      })
                                    }
                                  }}>
                                    <div style={{fontSize: '1.8rem', flexShrink: 0}}>{item.icon}</div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                      <div style={{color: '#0F172A', fontSize: '0.95rem', fontWeight: '700', marginBottom: '3px'}}>{item.label}</div>
                                      <div style={{color: '#64748B', fontSize: '0.825rem'}}>{item.desc}</div>
                                    </div>
                                    <label className="switch-pro" style={{margin: 0}} onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="checkbox" 
                                        checked={item.path ? whatsappSettings[item.path][item.key] : whatsappSettings[item.key]}
                                        onChange={(e) => {
                                          if (item.path) {
                                            setWhatsappSettings({
                                              ...whatsappSettings,
                                              [item.path]: {
                                                ...whatsappSettings[item.path],
                                                [item.key]: e.target.checked
                                              }
                                            })
                                          } else {
                                            setWhatsappSettings({
                                              ...whatsappSettings,
                                              [item.key]: e.target.checked
                                            })
                                          }
                                        }}
                                      />
                                      <span className="slider-pro"></span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Pause All - Prominent */}
                              <div style={{
                                marginTop: '20px',
                                background: whatsappSettings.paused ? '#FFF7ED' : '#F0FDF4',
                                border: `1.5px solid ${whatsappSettings.paused ? '#FDBA74' : '#86EFAC'}`,
                                borderRadius: '16px',
                                padding: '18px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                              }}>
                                <div style={{fontSize: '2rem'}}>{whatsappSettings.paused ? '⏸️' : '▶️'}</div>
                                <div style={{flex: 1}}>
                                  <div style={{color: '#0F172A', fontSize: '1rem', fontWeight: '800', marginBottom: '3px'}}>
                                    {whatsappSettings.paused ? 'Notifications Paused' : 'All Notifications Active'}
                                  </div>
                                  <div style={{color: '#64748B', fontSize: '0.85rem', fontWeight: '500'}}>
                                    {whatsappSettings.paused ? 'Click to resume all reminders' : 'Click to pause all reminders temporarily'}
                                  </div>
                                </div>
                                <button
                                  onClick={togglePauseWhatsApp}
                                  disabled={savingWhatsApp}
                                  style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#0F172A',
                                    color: whatsappSettings.paused ? '#FDBA74' : '#D4F63D',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: savingWhatsApp ? 'not-allowed' : 'pointer',
                                    opacity: savingWhatsApp ? 0.5 : 1,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)'
                                  }}
                                >
                                  {savingWhatsApp ? '⏳' : (whatsappSettings.paused ? '▶️ Resume' : '⏸️ Pause')}
                                </button>
                              </div>
                            </div>
                            
                            <div style={{marginTop: '20px', padding: '16px 20px', background: '#EFF6FF', borderRadius: '14px', border: '1.5px solid #BFDBFE'}}>
                              <p style={{color: '#1E3A8A', fontSize: '0.9rem', margin: 0, fontWeight: '500'}}>
                                💡 <strong>Note:</strong> Weekly reports are sent every Sunday at 8:00 PM automatically. Click "Save Changes" below to update your settings.
                              </p>
                            </div>
                          </>
                        )}
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
              <p style={{marginBottom: '20px', color: '#64748B', fontSize: '0.9rem'}}>Choose the format for your data export. CSV can be easily opened in Excel or Google Sheets.</p>
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
        <div className="modal-overlay-pro" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="modal-pro delete-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '550px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
            <div className="modal-header-pro" style={{flexShrink: 0}}>
              <h2>⚠️ Delete Account</h2>
              {!isDeleting && <button onClick={() => setShowDeleteModal(false)}>×</button>}
            </div>
            <div className="modal-body-pro" style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
              <div className="warning-box-pro" style={{background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '14px', padding: '18px', marginBottom: '20px'}}>
                <p style={{marginBottom: '8px', fontWeight: '800', color: '#DC2626', fontSize: '1rem'}}>⚠️ Warning: This action cannot be undone!</p>
                <p style={{marginBottom: '8px', color: '#991B1B', fontWeight: 600, fontSize: '0.9rem'}}>This will permanently delete:</p>
                <ul style={{textAlign: 'left', marginTop: '6px', paddingLeft: '20px', color: '#B91C1C', lineHeight: '1.7', fontSize: '0.85rem'}}>
                  <li>Your profile and account data</li>
                  <li>All workout history and progress logs</li>
                  <li>Nutrition logs and meal plans</li>
                  <li>Body measurements and photos</li>
                  <li>All saved exercises and favorites</li>
                </ul>
              </div>
              
              <div className="input-group-pro" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', color: '#334155', fontWeight: '700'}}>Reason for leaving (Optional)</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Help us improve by telling us why you're leaving..."
                  rows="3"
                  style={{width: '100%', padding: '10px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1.5px solid #CBD5E1', color: '#0F172A', resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit'}}
                  disabled={isDeleting}
                />
              </div>
              
              <div className="input-group-pro" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', color: '#334155', fontWeight: '700'}}>Enter your password to confirm <span style={{color: '#DC2626'}}>*</span></label>
                <input 
                  type="password" 
                  value={deletePassword} 
                  onChange={(e) => setDeletePassword(e.target.value)} 
                  placeholder="Your password" 
                  disabled={isDeleting}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1.5px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem'}}
                />
              </div>
              
              <div className="input-group-pro" style={{marginBottom: '0'}}>
                <label style={{display: 'block', marginBottom: '6px', color: '#334155', fontWeight: '700'}}>Type <strong style={{color: '#DC2626', fontSize: '1rem'}}>DELETE</strong> to confirm <span style={{color: '#DC2626'}}>*</span></label>
                <input 
                  type="text" 
                  value={deleteConfirm} 
                  onChange={(e) => setDeleteConfirm(e.target.value)} 
                  placeholder="Type DELETE in capital letters" 
                  disabled={isDeleting}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1.5px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem'}}
                />
              </div>
            </div>
            <div className="modal-footer-pro" style={{flexShrink: 0, padding: '16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#FAFAFA'}}>
              <button 
                className="btn-cancel-pro" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn-delete-pro" 
                onClick={deleteAccount}
                disabled={isDeleting || !deletePassword || deleteConfirm !== 'DELETE'}
              >
                {isDeleting ? '⏳ Deleting...' : '🗑️ Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
