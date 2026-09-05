import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { logActivity, logSecurityEvent } from '../utils/activityLogger.js'
import {
  X,
  Dumbbell,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react'

export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate()
  const overlayRef = useRef(null)
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'

    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      try {
        localStorage.removeItem('auth_pending_email')
        localStorage.removeItem('otp_expire_ts')
      } catch (_) {}
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="auth-modal relative w-full max-w-md rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border border-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] p-7 sm:p-9 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm">
            <Dumbbell className="w-5 h-5 text-[#D4F63D]" />
          </div>
          <div>
            <div className="text-lg font-black font-['Outfit'] text-slate-950 leading-none">FitForge</div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Athlete Portal
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="flex p-1 rounded-full bg-slate-100 border border-slate-200/80 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'signup'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        {mode === 'login' && <LoginForm onDone={onClose} setMode={setMode} navigate={navigate} />}
        {mode === 'signup' && <SignupForm onDone={onClose} setMode={setMode} />}
        {mode === 'forgot' && <ForgotForm onBack={() => setMode('login')} />}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          By continuing, you agree to FitForge's{' '}
          <a href="#" className="underline hover:text-slate-700">Terms</a> and{' '}
          <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Login Form ---------------------------- */
function LoginForm({ onDone, setMode, navigate }) {
  const { login, googleInit } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const emailValid = email.length > 3 && email.includes('@')
  const passwordValid = password.length >= 6
  const canSubmit = emailValid && passwordValid && !loading

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      setError('Please provide a valid email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      await logActivity('User Login', `${email} logged in successfully`, 'user_action', email)
      setLoginAttempts(0)
      onDone()
    } catch (err) {
      setLoginAttempts((prev) => prev + 1)
      if (loginAttempts >= 2) {
        await logSecurityEvent('Failed Login', 'medium', '0.0.0.0')
      }
      if (err?.code === 'OTP_REQUIRED') {
        setMode('signup')
      } else {
        setError(err?.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="auth-input w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700">Password</label>
          <button
            type="button"
            onClick={() => setMode('forgot')}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-950 transition-colors"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[10px] uppercase font-bold text-slate-400">Or continue with</span>
      </div>

      <button
        type="button"
        onClick={() => googleInit()}
        className="w-full py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-800 shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
          <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    </form>
  )
}

/* ----------------------------- Signup Form --------------------------- */
function SignupForm({ onDone, setMode }) {
  const { register, verifyOtpSignup, resendOtpSignup, checkAvailability, googleInit } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState(localStorage.getItem('auth_pending_email') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(localStorage.getItem('auth_pending_email') ? 2 : 1)
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const usernameValid = username.trim().length >= 3
  const emailValid = email.includes('@')
  const passwordValid = password.length >= 8
  const confirmValid = confirmPassword === password && confirmPassword.length >= 8
  const canSubmit = usernameValid && emailValid && passwordValid && confirmValid && !loading

  const submit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!canSubmit) {
        setError('Please check form fields and requirements')
        return
      }
      setLoading(true)
      setError('')
      try {
        const av = await checkAvailability(email)
        if (av && av.fields && !av.fields.email) {
          setError('Email is already registered. Try signing in.')
          setLoading(false)
          return
        }
        const r = await register({ username, email, password })
        if (r?.status === 'otp_required') {
          setStep(2)
          setCooldown(60)
          await logActivity('User Registration Started', `User ${username} started registration`, 'user_action', username)
        } else {
          await logActivity('User Registration', `New user ${username} registered`, 'user_action', username)
          onDone()
        }
      } catch (err) {
        setError(err?.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      if (otp.length !== 6) {
        setError('Please enter the 6-digit OTP code')
        return
      }
      setLoading(true)
      setError('')
      try {
        const userData = await verifyOtpSignup(email, otp)
        await logActivity('User Registration', `User ${userData.username || email} completed registration`, 'user_action', userData.username || email)
        onDone()
      } catch (err) {
        setError(err?.message || 'Invalid OTP code')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {step === 1 ? (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Alex Morgan"
                className="auth-input w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="auth-input w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="auth-input w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="auth-input w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
                required
              />
            </div>
          </div>
        </>
      ) : (
        <div className="py-2 text-center space-y-3">
          <span className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <h3 className="text-base font-bold text-slate-950">Verify Email Address</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            We sent a 6-digit confirmation code to <span className="font-semibold text-slate-800">{email}</span>.
          </p>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D+/g, ''))}
            placeholder="000000"
            className="auth-input text-center text-2xl tracking-widest font-black font-['Outfit'] w-44 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-300 focus:outline-none focus:border-slate-950 mx-auto block text-slate-900"
            autoFocus
          />
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={step === 1 ? !canSubmit : otp.length !== 6}
        className="w-full py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <span>{loading ? 'Processing...' : step === 1 ? 'Create Account' : 'Verify & Continue'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {step === 1 && (
        <>
          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[10px] uppercase font-bold text-slate-400">Or</span>
          </div>

          <button
            type="button"
            onClick={() => googleInit()}
            className="w-full py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-800 shadow-sm"
          >
            <span>Sign up with Google</span>
          </button>
        </>
      )}
    </form>
  )
}

/* ---------------------------- Forgot Form ---------------------------- */
function ForgotForm({ onBack }) {
  const { sendForgotOtp, verifyOtpReset, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1) // 1: request, 2: verify + new pass
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendForgotOtp(email)
      setSuccess('Verification code sent to your email!')
      setStep(2)
    } catch (err) {
      setError(err?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      setError('Passwords must match and be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyOtpReset(email, otp)
      await resetPassword(email, otp, newPassword)
      setSuccess('Password updated successfully! You can now sign in.')
      setTimeout(() => onBack(), 1500)
    } catch (err) {
      setError(err?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
        <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-950">
          ← Back to Sign In
        </button>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSend} className="space-y-3.5">
          <p className="text-xs text-slate-500">
            Enter your registered email and we'll send you an OTP code to restore your account.
          </p>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="auth-input w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
              required
            />
          </div>

          {error && <div className="text-rose-600 text-xs font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-xs transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-[1.01]"
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit OTP Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="auth-input w-full text-center tracking-widest text-lg font-bold py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="auth-input w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="auth-input w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              required
            />
          </div>

          {error && <div className="text-rose-600 text-xs font-semibold">{error}</div>}
          {success && <div className="text-emerald-600 text-xs font-semibold">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-xs transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:scale-[1.01]"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  )
}
