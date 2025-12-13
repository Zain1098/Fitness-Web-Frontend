import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import FitnessChatbot from '../components/FitnessChatbot.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { showToast } from '../components/Toast.jsx'
import { logSecurityEvent } from '../utils/securityMonitor.js'
import './Settings.css'

function SubscriptionSection({ subscription, token, onUpdate }) {
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)

  const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['Basic workouts', 'Nutrition tracking', 'Progress charts'] },
    { id: 'basic', name: 'Basic', price: 9.99, features: ['AI workout plans', 'Custom meal plans', 'Priority support'] },
    { id: 'pro', name: 'Pro', price: 19.99, features: ['Advanced analytics', 'Video tutorials', '1-on-1 coaching', 'No ads'] },
    { id: 'premium', name: 'Premium', price: 29.99, features: ['Personalized training', 'Nutrition consultation', 'Exclusive content'] }
  ]

  const currentPlan = subscription?.plan || 'free'

  const handleUpgrade = (planId) => {
    if (planId === 'free') return
    navigate(`/checkout?plan=${planId}`)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) return
    
    try {
      setCancelling(true)
      await api('/payment/cancel-subscription', { method: 'POST', token })
      showToast('Subscription cancelled successfully', 'success')
      onUpdate()
    } catch (error) {
      showToast(error.message || 'Failed to cancel subscription', 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div>
      <div className="subscription-current">
        <div className="sub-badge">{currentPlan.toUpperCase()}</div>
        <h3>Current Plan: {plans.find(p => p.id === currentPlan)?.name}</h3>
        {subscription?.status && <p>Status: <span className={`status-${subscription.status}`}>{subscription.status}</span></p>}
        {subscription?.currentPeriodEnd && (
          <p>Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
        )}
        {subscription?.cancelAtPeriodEnd && (
          <div className="cancel-notice">⚠️ Your subscription will be cancelled at the end of the billing period</div>
        )}
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className={`plan-card ${currentPlan === plan.id ? 'active' : ''}`}>
            <div className="plan-header">
              <h4>{plan.name}</h4>
              <div className="plan-price">${plan.price}<span>/mo</span></div>
            </div>
            <ul className="plan-features">
              {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
            </ul>
            {currentPlan === plan.id ? (
              <button className="plan-btn current" disabled>Current Plan</button>
            ) : currentPlan === 'free' || plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id) ? (
              <button className="plan-btn upgrade" onClick={() => handleUpgrade(plan.id)}>
                {plan.id === 'free' ? 'Current' : 'Upgrade'}
              </button>
            ) : (
              <button className="plan-btn downgrade" onClick={() => handleUpgrade(plan.id)}>Downgrade</button>
            )}
          </div>
        ))}
      </div>

      {currentPlan !== 'free' && !subscription?.cancelAtPeriodEnd && (
        <div className="cancel-section">
          <button className="cancel-sub-btn" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? '⏳ Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {subscription?.paymentHistory && subscription.paymentHistory.length > 0 && (
        <div className="payment-history">
          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscription.paymentHistory.slice(-5).reverse().map((payment, i) => (
                <tr key={i}>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>{payment.plan}</td>
                  <td>${payment.amount}</td>
                  <td><span className={`status-${payment.status}`}>{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ChangePasswordForm({ token }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    try {
      setLoading(true)
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        token
      })
      showToast('Password changed successfully!', 'success')
      logSecurityEvent('password_changed', 'medium', '0.0.0.0')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      logSecurityEvent('password_change_failed', 'medium', '0.0.0.0')
      showToast(err?.message || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Current Password</label>
          <div className="password-input">
            <input
              type={show1 ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow1(!show1)}>
              {show1 ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>New Password</label>
          <div className="password-input">
            <input
              type={show2 ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow2(!show2)}>
              {show2 ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="password-input">
            <input
              type={show3 ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow3(!show3)}>
              {show3 ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? '⏳ Changing...' : '🔑 Change Password'}
      </button>
    </form>
  )
}

function DangerZone({ token, logout }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error')
      return
    }

    try {
      setLoading(true)
      await api('/user/delete-account', {
        method: 'POST',
        token,
        body: { password }
      })
      logSecurityEvent('account_deleted', 'high', '0.0.0.0')
      showToast('Account deleted successfully', 'success')
      logout()
      navigate('/')
    } catch (err) {
      logSecurityEvent('account_deletion_failed', 'medium', '0.0.0.0')
      showToast(err?.message || 'Failed to delete account', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="danger-zone">
        <div className="danger-header">
          <div>
            <h3>⚠️ Delete Account</h3>
            <p>Once deleted, there is no going back. Please be certain.</p>
          </div>
          <button className="danger-btn" onClick={() => setShowModal(true)}>
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Delete Account</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="warning-box">
                <p>This will permanently delete all your data including workouts, nutrition logs, and progress.</p>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="form-group">
                <label>Type DELETE to confirm</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleDelete} disabled={loading}>
                {loading ? '⏳ Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Settings() {
  const { token, user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [settings, setSettings] = useState({
    username: '',
    email: '',
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
    bodyFatPercentage: '',
    medicalConditions: [],
    injuries: '',
    workoutTimePreference: '',
    motivation: '',
    notifications: {
      workoutReminders: true,
      progressUpdates: true,
      nutritionAlerts: true,
      weeklyReports: true
    }
  })
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [measureUnit, setMeasureUnit] = useState('cm')

  const loadSettings = async () => {
    if (!token) return
    try {
      setLoading(true)
      const userData = await api('/auth/me', { token })
      const settingsData = userData.preferences || {}
      const onboardingData = userData.onboarding_data || {}
      
      setSettings(prev => ({ 
        ...prev,
        username: user.username,
        email: user.email,
        gender: settingsData.gender || onboardingData.gender || prev.gender,
        age: settingsData.age || onboardingData.age || prev.age,
        height: settingsData.height || onboardingData.height || prev.height,
        weight: settingsData.weight || onboardingData.weight || prev.weight,
        targetWeight: settingsData.targetWeight || onboardingData.target_weight || prev.targetWeight,
        goal: settingsData.goal || onboardingData.goal || prev.goal,
        activityLevel: settingsData.activityLevel || prev.activityLevel,
        workoutFrequency: settingsData.workoutFrequency || onboardingData.workout_frequency || prev.workoutFrequency,
        experienceLevel: settingsData.experienceLevel || onboardingData.fitness_level || prev.experienceLevel,
        dietaryPreference: settingsData.dietaryPreference || onboardingData.dietary_preference || prev.dietaryPreference,
        waterIntakeGoal: settingsData.waterIntakeGoal || onboardingData.water_intake_goal || prev.waterIntakeGoal,
        sleepGoal: settingsData.sleepGoal || onboardingData.sleep_goal || prev.sleepGoal,
        bodyMeasurements: onboardingData.body_measurements || prev.bodyMeasurements,
        bodyFatPercentage: onboardingData.body_fat_percentage || prev.bodyFatPercentage,
        medicalConditions: onboardingData.medical_conditions || prev.medicalConditions,
        injuries: onboardingData.injuries || prev.injuries,
        workoutTimePreference: onboardingData.workout_time_preference || prev.workoutTimePreference,
        motivation: onboardingData.motivation || prev.motivation,
        notifications: settingsData.notifications || prev.notifications
      }))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [token])

  const saveSettings = async () => {
    try {
      setSaving(true)
      const payload = { ...settings }
      // Convert empty strings to undefined
      if (payload.age === '') delete payload.age
      if (payload.height === '') delete payload.height
      if (payload.weight === '') delete payload.weight
      if (payload.targetWeight === '') delete payload.targetWeight
      if (payload.workoutFrequency === '') delete payload.workoutFrequency
      if (payload.waterIntakeGoal === '') delete payload.waterIntakeGoal
      if (payload.sleepGoal === '') delete payload.sleepGoal
      await api('/settings', { method: 'PUT', body: payload, token })
      showToast('Settings saved successfully!', 'success')
    } catch (err) {
      showToast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateNotification = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const calculateBMI = () => {
    if (settings.height && settings.weight) {
      const heightM = settings.height / 100
      const bmi = (settings.weight / (heightM * heightM)).toFixed(1)
      return bmi
    }
    return null
  }

  const calculateCalories = () => {
    if (settings.weight && settings.height && settings.age && settings.gender) {
      let bmr
      if (settings.gender === 'male') {
        bmr = 10 * settings.weight + 6.25 * settings.height - 5 * settings.age + 5
      } else {
        bmr = 10 * settings.weight + 6.25 * settings.height - 5 * settings.age - 161
      }
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      }
      
      const tdee = bmr * (activityMultipliers[settings.activityLevel] || 1.2)
      return Math.round(tdee)
    }
    return null
  }

  if (!user) return null

  const [subscription, setSubscription] = useState(null)
  const [loadingSub, setLoadingSub] = useState(false)

  const loadSubscription = async () => {
    if (!token) return
    try {
      setLoadingSub(true)
      const data = await api('/payment/subscription', { token })
      setSubscription(data)
    } catch (err) {
      console.error('Failed to load subscription:', err)
    } finally {
      setLoadingSub(false)
    }
  }

  useEffect(() => {
    loadSubscription()
  }, [token])

  const tabs = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'subscription', icon: '💳', label: 'Subscription' },
    { id: 'fitness', icon: '💪', label: 'Fitness Goals' },
    { id: 'body', icon: '📐', label: 'Body Measurements' },
    { id: 'health', icon: '🏥', label: 'Health Info' },
    { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'security', icon: '🔒', label: 'Security' }
  ]

  const toggleHeightUnit = () => {
    if (settings.height) {
      if (heightUnit === 'cm') {
        const totalInches = settings.height / 2.54
        const feet = Math.floor(totalInches / 12)
        const inches = (totalInches % 12).toFixed(0)
        updateSetting('height', `${feet}'${inches}"`)
      } else {
        const match = settings.height.match(/(\d+)'(\d+)"?/)
        if (match) {
          const cm = (parseInt(match[1]) * 30.48 + parseInt(match[2]) * 2.54).toFixed(0)
          updateSetting('height', cm)
        }
      }
    }
    setHeightUnit(heightUnit === 'cm' ? 'ft' : 'cm')
  }

  const toggleWeightUnit = () => {
    if (settings.weight) {
      updateSetting('weight', weightUnit === 'kg' ? (settings.weight * 2.20462).toFixed(1) : (settings.weight * 0.453592).toFixed(1))
    }
    if (settings.targetWeight) {
      updateSetting('targetWeight', weightUnit === 'kg' ? (settings.targetWeight * 2.20462).toFixed(1) : (settings.targetWeight * 0.453592).toFixed(1))
    }
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')
  }

  const toggleMeasureUnit = () => {
    const convert = (val) => measureUnit === 'cm' ? (val / 2.54).toFixed(1) : (val * 2.54).toFixed(1)
    const bm = settings.bodyMeasurements
    if (bm.chest || bm.waist || bm.hips || bm.arms || bm.thighs) {
      updateSetting('bodyMeasurements', {
        chest: bm.chest ? convert(bm.chest) : '',
        waist: bm.waist ? convert(bm.waist) : '',
        hips: bm.hips ? convert(bm.hips) : '',
        arms: bm.arms ? convert(bm.arms) : '',
        thighs: bm.thighs ? convert(bm.thighs) : ''
      })
    }
    setMeasureUnit(measureUnit === 'cm' ? 'in' : 'cm')
  }

  return (
    <>
      <DashboardNavbar />
      <FitnessChatbot />
      <div className="settings-page-new">
        <div className="settings-container-new">
          <div className="settings-header-new">
            <h1>⚙️ Settings</h1>
            <p>Customize your fitness journey</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading settings...</p>
            </div>
          ) : (
            <>
              <div className="tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === 'profile' && (
                  <div className="section animated">
                    <h2>👤 Personal Information</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Gender</label>
                        <select value={settings.gender || 'male'} onChange={(e) => updateSetting('gender', e.target.value)}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Age</label>
                        <input
                          type="number"
                          value={settings.age}
                          onChange={(e) => updateSetting('age', e.target.value)}
                          placeholder="25"
                        />
                      </div>

                      <div className="form-group">
                        <label>Height ({heightUnit}) <button type="button" className="unit-toggle-btn" onClick={toggleHeightUnit}>Switch to {heightUnit === 'cm' ? 'ft' : 'cm'}</button></label>
                        <input
                          type="text"
                          value={settings.height}
                          onChange={(e) => updateSetting('height', e.target.value)}
                          placeholder={heightUnit === 'cm' ? '175' : "5'9\""}
                        />
                      </div>

                      <div className="form-group">
                        <label>Weight ({weightUnit}) <button type="button" className="unit-toggle-btn" onClick={toggleWeightUnit}>Switch to {weightUnit === 'kg' ? 'lbs' : 'kg'}</button></label>
                        <input
                          type="number"
                          value={settings.weight}
                          onChange={(e) => updateSetting('weight', e.target.value)}
                          placeholder={weightUnit === 'kg' ? '70' : '154'}
                        />
                      </div>

                      <div className="form-group">
                        <label>Target Weight ({weightUnit})</label>
                        <input
                          type="number"
                          value={settings.targetWeight}
                          onChange={(e) => updateSetting('targetWeight', e.target.value)}
                          placeholder={weightUnit === 'kg' ? '65' : '143'}
                        />
                      </div>

                      <div className="form-group">
                        <label>Experience Level</label>
                        <select value={settings.experienceLevel || 'beginner'} onChange={(e) => updateSetting('experienceLevel', e.target.value)}>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    {calculateBMI() && (
                      <div className="stats-cards">
                        <div className="stat-card">
                          <div className="stat-icon">📊</div>
                          <div className="stat-label">BMI</div>
                          <div className="stat-value">{calculateBMI()}</div>
                        </div>
                        {calculateCalories() && (
                          <div className="stat-card">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-label">Daily Calories</div>
                            <div className="stat-value">{calculateCalories()}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="section animated">
                    <h2>💳 Subscription Management</h2>
                    {loadingSub ? (
                      <div style={{textAlign: 'center', padding: '40px'}}>
                        <div className="spinner"></div>
                        <p>Loading subscription...</p>
                      </div>
                    ) : (
                      <SubscriptionSection subscription={subscription} token={token} onUpdate={loadSubscription} />
                    )}
                  </div>
                )}

                {activeTab === 'fitness' && (
                  <div className="section animated">
                    <h2>💪 Fitness Goals</h2>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Primary Goal</label>
                        <select value={settings.goal} onChange={(e) => updateSetting('goal', e.target.value)}>
                          <option value="build_muscle">Build Muscle Mass</option>
                          <option value="lose_weight">Lose Weight</option>
                          <option value="boost_performance">Boost Sport Performance</option>
                          <option value="stay_fit">Stay Fit & Healthy</option>
                          <option value="gain_strength">Gain Strength</option>
                          <option value="improve_endurance">Improve Endurance</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Activity Level</label>
                        <select value={settings.activityLevel || 'moderate'} onChange={(e) => updateSetting('activityLevel', e.target.value)}>
                          <option value="sedentary">Sedentary (Little/no exercise)</option>
                          <option value="light">Light (1-3 days/week)</option>
                          <option value="moderate">Moderate (3-5 days/week)</option>
                          <option value="active">Active (6-7 days/week)</option>
                          <option value="very_active">Very Active (Intense daily)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Workout Frequency (days/week)</label>
                        <input
                          type="number"
                          min="0"
                          max="7"
                          value={settings.workoutFrequency}
                          onChange={(e) => updateSetting('workoutFrequency', e.target.value)}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'body' && (
                  <div className="section animated">
                    <h2>📐 Body Measurements</h2>
                    <div style={{marginBottom: '20px'}}>
                      <button type="button" className="unit-toggle-btn-large" onClick={toggleMeasureUnit}>
                        Using {measureUnit === 'cm' ? 'Centimeters' : 'Inches'} • Switch to {measureUnit === 'cm' ? 'Inches' : 'CM'}
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>💪 Chest ({measureUnit})</label>
                        <input type="number" value={settings.bodyMeasurements.chest} onChange={(e) => updateSetting('bodyMeasurements', {...settings.bodyMeasurements, chest: e.target.value})} placeholder={measureUnit === 'cm' ? '95' : '37'} />
                      </div>
                      <div className="form-group">
                        <label>⭕ Waist ({measureUnit})</label>
                        <input type="number" value={settings.bodyMeasurements.waist} onChange={(e) => updateSetting('bodyMeasurements', {...settings.bodyMeasurements, waist: e.target.value})} placeholder={measureUnit === 'cm' ? '80' : '31'} />
                      </div>
                      <div className="form-group">
                        <label>🍑 Hips ({measureUnit})</label>
                        <input type="number" value={settings.bodyMeasurements.hips} onChange={(e) => updateSetting('bodyMeasurements', {...settings.bodyMeasurements, hips: e.target.value})} placeholder={measureUnit === 'cm' ? '95' : '37'} />
                      </div>
                      <div className="form-group">
                        <label>💪 Arms ({measureUnit})</label>
                        <input type="number" value={settings.bodyMeasurements.arms} onChange={(e) => updateSetting('bodyMeasurements', {...settings.bodyMeasurements, arms: e.target.value})} placeholder={measureUnit === 'cm' ? '35' : '14'} />
                      </div>
                      <div className="form-group">
                        <label>🦵 Thighs ({measureUnit})</label>
                        <input type="number" value={settings.bodyMeasurements.thighs} onChange={(e) => updateSetting('bodyMeasurements', {...settings.bodyMeasurements, thighs: e.target.value})} placeholder={measureUnit === 'cm' ? '55' : '22'} />
                      </div>
                      <div className="form-group">
                        <label>📊 Body Fat %</label>
                        <input type="number" value={settings.bodyFatPercentage} onChange={(e) => updateSetting('bodyFatPercentage', e.target.value)} placeholder="15" min="3" max="50" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="section animated">
                    <h2>🏥 Health Information</h2>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Medical Conditions</label>
                        <input type="text" value={settings.medicalConditions.join(', ')} onChange={(e) => updateSetting('medicalConditions', e.target.value.split(',').map(s => s.trim()))} placeholder="None, Diabetes, High BP, etc." />
                      </div>
                      <div className="form-group full-width">
                        <label>Injuries or Limitations</label>
                        <textarea value={settings.injuries} onChange={(e) => updateSetting('injuries', e.target.value)} placeholder="E.g., Previous knee injury, lower back pain..." rows="3" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem'}} />
                      </div>
                      <div className="form-group">
                        <label>Preferred Workout Time</label>
                        <select value={settings.workoutTimePreference} onChange={(e) => updateSetting('workoutTimePreference', e.target.value)}>
                          <option value="">— Select —</option>
                          <option value="morning">🌅 Morning (5-9 AM)</option>
                          <option value="afternoon">☀️ Afternoon (12-4 PM)</option>
                          <option value="evening">🌆 Evening (5-8 PM)</option>
                          <option value="night">🌙 Night (8-11 PM)</option>
                          <option value="flexible">🔄 Flexible</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>What Motivates You?</label>
                        <textarea value={settings.motivation} onChange={(e) => updateSetting('motivation', e.target.value)} placeholder="E.g., Want to feel confident, improve health, compete in sports..." rows="3" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem'}} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'nutrition' && (
                  <div className="section animated">
                    <h2>🥗 Nutrition Preferences</h2>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Dietary Preference</label>
                        <select value={settings.dietaryPreference || 'none'} onChange={(e) => updateSetting('dietaryPreference', e.target.value)}>
                          <option value="none">No Restrictions</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="pescatarian">Pescatarian</option>
                          <option value="keto">Keto</option>
                          <option value="paleo">Paleo</option>
                          <option value="low_carb">Low Carb</option>
                          <option value="high_protein">High Protein</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Water Intake Goal (glasses/day)</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={settings.waterIntakeGoal}
                          onChange={(e) => updateSetting('waterIntakeGoal', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Sleep Goal (hours/day)</label>
                        <input
                          type="number"
                          min="4"
                          max="12"
                          step="0.5"
                          value={settings.sleepGoal}
                          onChange={(e) => updateSetting('sleepGoal', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="section animated">
                    <h2>🔔 Notification Preferences</h2>
                    <div className="toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <div className="toggle-label">Workout Reminders</div>
                          <div className="toggle-desc">Get reminded about your scheduled workouts</div>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={settings.notifications.workoutReminders}
                            onChange={(e) => updateNotification('workoutReminders', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <div className="toggle-label">Progress Updates</div>
                          <div className="toggle-desc">Receive updates on your fitness progress</div>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={settings.notifications.progressUpdates}
                            onChange={(e) => updateNotification('progressUpdates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <div className="toggle-label">Nutrition Alerts</div>
                          <div className="toggle-desc">Get notified about meal logging and nutrition goals</div>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={settings.notifications.nutritionAlerts}
                            onChange={(e) => updateNotification('nutritionAlerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <div className="toggle-label">Weekly Reports</div>
                          <div className="toggle-desc">Receive weekly summary of your fitness journey</div>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) => updateNotification('weeklyReports', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="section animated">
                    <h2>🔒 Security</h2>
                    
                    <div className="account-info">
                      <h3>📧 Account Information</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            value={settings.username || user.username}
                            onChange={(e) => updateSetting('username', e.target.value)}
                            placeholder="Username"
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={settings.email || user.email}
                            onChange={(e) => updateSetting('email', e.target.value)}
                            placeholder="Email"
                          />
                        </div>
                      </div>
                    </div>

                    <ChangePasswordForm token={token} />
                    <DangerZone token={token} logout={logout} />
                  </div>
                )}
              </div>

              <div className="save-section">
                <button className="save-btn" onClick={saveSettings} disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
