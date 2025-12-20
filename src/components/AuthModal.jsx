import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '@/context/AuthContext.jsx'
import { logActivity, logSecurityEvent } from '../utils/activityLogger.js'

// Advanced, responsive, accessible Auth Modal
// - Focus trap + ESC to close
// - Keyboard accessible controls
// - Client-side validation + basic password strength hint
// - Loading/error states with ARIA
// - Responsive layout: single-column on mobile, side-by-side illustration on large screens
// - CSS variables for theme tweaking

export default function AuthModal({ open, onClose }){
  const navigate = useNavigate()
  const overlayRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)
  const previouslyFocused = useRef(null)
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'

  useEffect(()=>{
    if(!open) return
    previouslyFocused.current = document.activeElement
    // lock scroll
    document.body.style.overflow = 'hidden'
    // focus the modal
    setTimeout(()=>{ firstFocusableRef.current?.focus() }, 40)

    function onKey(e){
      if(e.key === 'Escape') onClose()
      if(e.key === 'Tab') handleTabKey(e)
    }
    function handleTabKey(e){
      const focusable = overlayRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || []
      if(focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus() }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus() }
    }

    window.addEventListener('keydown', onKey)
    return ()=>{
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  useEffect(()=>{
    if(!open){
      try{ localStorage.removeItem('auth_pending_email'); localStorage.removeItem('otp_expire_ts') }catch(_){}
    }
  }, [open])

  if(!open) return null

  return (
    <Overlay ref={overlayRef} onMouseDown={(e)=>{ if(e.target === overlayRef.current) onClose() }} aria-modal="true" role="dialog" aria-label="Authentication dialog">
      <Modal role="document">
        <Top>
          <h3 className="brand">FitForge</h3>
          <CloseBtn aria-label="Close" onClick={onClose}>×</CloseBtn>
        </Top>

        <Content>
          <Visual>
            <h4 className="welcome">Welcome back</h4>
            <p>Sign in to access your dashboard, save progress, and manage your account.</p>
          </Visual>

          <Panel>
            <ModeToggle role="tablist" aria-label="Authentication modes">
              <ModeButton
                role="tab"
                aria-selected={mode === 'login'}
                tabIndex={0}
                ref={firstFocusableRef}
                onClick={()=>setMode('login')}
              >Login</ModeButton>
              <ModeButton
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={()=>setMode('signup')}
              >Sign up</ModeButton>
              <ModeButton
                role="tab"
                aria-selected={mode === 'forgot'}
                onClick={()=>setMode('forgot')}
              >Forgot</ModeButton>
            </ModeToggle>

            {mode === 'login' && <LoginForm onDone={onClose} setMode={setMode} lastFocusableRef={lastFocusableRef} navigate={navigate} />}
            {mode === 'signup' && <SignupForm onDone={onClose} setMode={setMode} lastFocusableRef={lastFocusableRef} />}
            {mode === 'forgot' && <ForgotForm onBack={()=>setMode('login')} lastFocusableRef={lastFocusableRef} />}

            <Footer>
              <Small>By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy</a>.</Small>
            </Footer>
          </Panel>
        </Content>
      </Modal>
    </Overlay>
  )
}

/* ----------------------------- Login Form ---------------------------- */
function LoginForm({ onDone, setMode, lastFocusableRef, navigate }){
  const { login, googleInit } = useAuth()
  const nav = navigate || useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const emailValid = email.length > 3 && email.includes('@')
  const passwordValid = password.length >= 6
  const canSubmit = emailValid && passwordValid && !loading

  const submit = async (e)=>{
    e.preventDefault()
    if(!canSubmit) { setError('Please fix validation errors'); return }
    setLoading(true); setError('')
    try{ 
      await login(email, password); 
      await logActivity('User Login', `${email} logged in successfully`, 'user_action', email);
      setLoginAttempts(0);
      onDone();
      // AuthContext will handle navigation
    }catch(err){ 
      setLoginAttempts(prev => prev + 1);
      if(loginAttempts >= 2) {
        await logSecurityEvent('Failed Login', 'medium', '0.0.0.0');
      }
      if(err?.code === 'OTP_REQUIRED'){ setMode('signup') } else { setError(err?.message || 'Invalid credentials') } 
    }finally{ setLoading(false) }
  }

  return (
    <Form onSubmit={submit} noValidate>
      <h2>Sign in</h2>
      <Label>
        <span>Email</span>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} aria-invalid={!emailValid} required />
      </Label>

      <Label>
        <span>Password</span>
        <PasswordWrap>
          <input type={show? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} aria-invalid={!passwordValid} required />
          <button type="button" aria-pressed={show} className="show" onClick={()=>setShow(s=>!s)}>
            <i className={show ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
          </button>
        </PasswordWrap>
        <div className="help-row">
          <a href="#" onClick={(e)=>{ e.preventDefault(); setMode('forgot') }}>Forgot?</a>
          <PasswordStrength $len={password.length}>{password.length >= 8 ? 'Strong' : password.length >= 6 ? 'Weak' : 'Too short'}</PasswordStrength>
        </div>
      </Label>

      {error && <Error role="alert">{error}</Error>}

      <Label style={{marginTop:'8px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <input type="checkbox" id="rememberMe" style={{width:'auto', margin:0}} />
          <label htmlFor="rememberMe" style={{margin:0, cursor:'pointer', fontSize:'0.9rem'}}>Remember me</label>
        </div>
      </Label>

      <Primary type="submit" disabled={!canSubmit}>{loading ? 'Signing in...' : 'Sign in'}</Primary>

      <Divider><span>Or continue with</span></Divider>
      <Socials>
        <SocialButton type="button" aria-label="Continue with Google" onClick={()=>googleInit()}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </SocialButton>
      </Socials>

      <p className="muted">New here? <a href="#" onClick={(e)=>{ e.preventDefault(); setMode('signup') }}>Create account</a></p>
      <div style={{height:0}} ref={lastFocusableRef} />
    </Form>
  )
}

/* ----------------------------- Signup Form --------------------------- */
function SignupForm({ onDone, setMode, lastFocusableRef }){
  const { register, verifyOtpSignup, resendOtpSignup, checkAvailability } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState(localStorage.getItem('auth_pending_email') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [step, setStep] = useState(localStorage.getItem('auth_pending_email') ? 2 : 1)
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [expireLeft, setExpireLeft] = useState(()=>{
    const ts = Number(localStorage.getItem('otp_expire_ts')||'0')
    return ts>0 ? Math.max(0, Math.ceil((ts - Date.now())/1000)) : 0
  })

  const usernameValid = username.trim().length >= 3
  const emailValid = email.includes('@')
  const passwordValid = password.length >= 8
  const confirmValid = confirmPassword === password && confirmPassword.length >= 8
  const canSubmit = usernameValid && emailValid && passwordValid && confirmValid && !loading

  const submit = async (e)=>{
    e.preventDefault()
    if(step === 1){
      if(!canSubmit){ setError('Please complete the form correctly'); return }
      setLoading(true); setError('')
      try{
        const av = await checkAvailability(email)
        if(av && av.fields && !av.fields.email){
          setError('Email already registered — try login or reset password.')
          setLoading(false)
          return
        }
        const r = await register({ username, email, password })
        if(r?.status === 'otp_required'){ 
          setStep(2); 
          setCooldown(60);
          await logActivity('User Registration Started', `User ${username} started registration process`, 'user_action', username);
        } else { 
          await logActivity('User Registration', `New user ${username} registered successfully`, 'user_action', username);
          onDone(); 
        }
      }catch(err){ setError(err?.code === 'USER_EXISTS' ? 'Email already registered — try login or reset password.' : (err?.message || 'Unable to register')) }finally{ setLoading(false) }
    }else{
      if(otp.length !== 6){ setError('Enter 6-digit OTP'); return }
      setLoading(true); setError('')
      try{ 
        const userData = await verifyOtpSignup(email, otp)
        await logActivity('User Registration', `New user ${userData.username || email} completed registration`, 'user_action', userData.username || email);
        onDone() // Close modal - AuthContext will handle navigation
      }catch(err){ setError(err?.message || 'Invalid OTP') }finally{ setLoading(false) }
      }
  }

  useEffect(()=>{
    if(step!==2) return
    const id = setInterval(()=>{
      setCooldown(c=>c>0?c-1:0)
      const ts = Number(localStorage.getItem('otp_expire_ts')||'0')
      setExpireLeft(ts>0 ? Math.max(0, Math.ceil((ts - Date.now())/1000)) : 0)
    }, 1000)
    return ()=>clearInterval(id)
  }, [step])

  useEffect(()=>{
    function onStorage(e){
      if(e.key === 'otp_expire_ts'){
        const ts = Number(localStorage.getItem('otp_expire_ts')||'0')
        setExpireLeft(ts>0 ? Math.max(0, Math.ceil((ts - Date.now())/1000)) : 0)
      }
      if(e.key === 'auth_pending_email'){
        const pe = localStorage.getItem('auth_pending_email')||''
        if(pe){ setEmail(pe); setStep(2) }
      }
    }
    window.addEventListener('storage', onStorage)
    return ()=>window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <Form onSubmit={submit} noValidate>
      <h2>{step===1?'Create account':'Verify email'}</h2>
      <Label>
        {step===1 ? (
          <>
            <span>Username</span>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} aria-invalid={!usernameValid} required />
          </>
        ) : (
          <>
            <span>Email</span>
            <input type="email" value={email} readOnly aria-readonly="true" required />
          </>
        )}
      </Label>

      {step===1 && (
        <Label>
          <span>Email</span>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} aria-invalid={!emailValid} required />
        </Label>
      )}

      {step===1 ? (
        <Label>
          <span>Password</span>
          <PasswordWrap>
            <input type={show1 ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} aria-invalid={!passwordValid} required />
            <button type="button" aria-pressed={show1} className="show" onClick={()=>setShow1(s=>!s)}>
              <i className={show1 ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
            </button>
          </PasswordWrap>
          <PasswordRequirements>
            <small style={{color: password.length >= 8 ? '#8ef3c9' : '#ff6b6b'}}>{password.length >= 8 ? '✓' : '○'} At least 8 characters</small>
            <small style={{color: /[0-9]/.test(password) ? '#8ef3c9' : '#ff6b6b'}}>{/[0-9]/.test(password) ? '✓' : '○'} Contains number</small>
            <small style={{color: /[a-zA-Z]/.test(password) ? '#8ef3c9' : '#ff6b6b'}}>{/[a-zA-Z]/.test(password) ? '✓' : '○'} Contains letter</small>
          </PasswordRequirements>
        </Label>
      ) : (
        <Label>
          <span>OTP</span>
          <input value={otp} onChange={(e)=>{ const v=e.target.value.replace(/\D+/g,''); setOtp(v.slice(0,6)) }} required inputMode="numeric" autoComplete="one-time-code" />
          <div className="help-row"><small>Expires in {Math.floor(expireLeft/60)}:{String(expireLeft%60).padStart(2,'0')}</small></div>
        </Label>
      )}

      {step===1 && (
        <Label>
          <span>Confirm Password</span>
          <PasswordWrap>
            <input type={show2 ? 'text' : 'password'} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} aria-invalid={!confirmValid} required />
            <button type="button" aria-pressed={show2} className="show" onClick={()=>setShow2(s=>!s)}>
              <i className={show2 ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
            </button>
          </PasswordWrap>
          {!confirmValid && confirmPassword.length > 0 && (
            <div className="help-row"><small>Passwords must match.</small></div>
          )}
        </Label>
      )}

      {error && <Error role="alert">{error}</Error>}
      <Primary type="submit" disabled={step===1 ? !canSubmit : otp.length!==6}>{loading? (step===1?'Creating...':'Verifying...') : (step===1?'Create account':'Verify') }</Primary>
      {step===2 && (
        <div className="help-row">
          <small>{cooldown>0 ? `Resend in ${cooldown}s` : 'Didn\'t receive the code?'}</small>
          <button type="button" disabled={cooldown>0} className="show" onClick={async()=>{ setError(''); setLoading(true); try{ const r = await resendOtpSignup(email); const ra = r?.retryAfter || 60; setCooldown(ra) }catch(err){ const ra = err?.data?.retryAfter; if(typeof ra==='number'){ setCooldown(ra) } setError(err?.message || 'Resend failed') }finally{ setLoading(false) } }}>Resend OTP</button>
        </div>
      )}

      {step===1 && (
        <Label style={{marginTop:'8px'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:'8px'}}>
            <input type="checkbox" id="agreeTerms" required style={{width:'auto', margin:'4px 0 0 0', flexShrink:0}} />
            <label htmlFor="agreeTerms" style={{margin:0, cursor:'pointer', fontSize:'0.85rem', color:'var(--ff-muted)'}}>I agree to the <a href="#" style={{color:'var(--ff-neon)'}}>Terms of Service</a> and <a href="#" style={{color:'var(--ff-neon)'}}>Privacy Policy</a></label>
          </div>
        </Label>
      )}
      {step===2 && (
        <button type="button" onClick={()=>{setStep(1); setOtp(''); setError('')}} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 16px', borderRadius:'8px', color:'var(--ff-text)', cursor:'pointer', marginTop:'8px'}}>← Back to Step 1</button>
      )}
      {step===1 && (
        <>
          <Divider><span>Or continue with</span></Divider>
          <Socials>
            <SocialButton type="button" aria-label="Sign up with Google" onClick={()=>googleInit()}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </SocialButton>
          </Socials>
        </>
      )}
      <Divider><span>Already have an account?</span></Divider>
      <p className="muted"><a href="#" onClick={(e)=>{ e.preventDefault(); setMode('login'); try{ localStorage.removeItem('auth_pending_email'); localStorage.removeItem('otp_expire_ts') }catch(_){} }}>Sign in</a></p>
      <div style={{height:0}} ref={lastFocusableRef} />
    </Form>
  )
}

/* ---------------------------- Forgot Form ---------------------------- */
function ForgotForm({ onBack, lastFocusableRef }){
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [expireLeft, setExpireLeft] = useState(0)
  const [show, setShow] = useState(false)
  const { sendForgotOtp, verifyOtpReset, resetPassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const emailValid = email.includes('@')
  const otpValid = otp.length === 6
  const passwordValid = newPassword.length >= 8
  const confirmValid = confirmPassword === newPassword && confirmPassword.length >= 8

  useEffect(()=>{
    if(step !== 2) return
    const id = setInterval(()=>{
      setCooldown(c=>c>0?c-1:0)
      setExpireLeft(e=>e>0?e-1:0)
    }, 1000)
    return ()=>clearInterval(id)
  }, [step])

  const sendOtp = async (e)=>{
    e.preventDefault()
    if(!emailValid){ setError('Enter valid email'); return }
    setLoading(true); setError(''); setSuccess('')
    try{
      const r = await sendForgotOtp(email)
      setSuccess('OTP sent to your email')
      setStep(2)
      setCooldown(60)
      const exp = r?.otp_expires_at ? Math.ceil((Date.parse(r.otp_expires_at) - Date.now())/1000) : 120
      setExpireLeft(exp)
    }catch(err){
      setError(err?.message || 'Failed to send OTP')
    }finally{
      setLoading(false)
    }
  }

  const verifyOtp = async (e)=>{
    e.preventDefault()
    if(!otpValid){ setError('Enter 6-digit OTP'); return }
    setLoading(true); setError(''); setSuccess('')
    try{
      await verifyOtpReset(email, otp)
      setSuccess('Verified! Set your new password')
      setStep(3)
    }catch(err){
      setError(err?.message || 'Invalid OTP')
    }finally{
      setLoading(false)
    }
  }

  const doReset = async (e)=>{
    e.preventDefault()
    if(!passwordValid){ setError('Password must be at least 8 characters'); return }
    if(!confirmValid){ setError('Passwords must match'); return }
    setLoading(true); setError(''); setSuccess('')
    try{
      await resetPassword(email, otp, newPassword)
      setSuccess('Password updated successfully!')
      setTimeout(()=>onBack(), 1200)
    }catch(err){
      setError(err?.message || 'Update failed')
    }finally{
      setLoading(false)
    }
  }

  const resend = async ()=>{
    setLoading(true); setError(''); setSuccess('')
    try{
      const r = await sendForgotOtp(email)
      setSuccess('OTP resent to your email')
      setCooldown(60)
      const exp = r?.otp_expires_at ? Math.ceil((Date.parse(r.otp_expires_at) - Date.now())/1000) : 120
      setExpireLeft(exp)
    }catch(err){
      const ra = err?.data?.retryAfter
      if(typeof ra === 'number') setCooldown(ra)
      setError(err?.message || 'Resend failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={step === 1 ? sendOtp : step === 2 ? verifyOtp : doReset} noValidate>
      <h2>Reset password</h2>
      
      {step === 1 && (
        <>
          <Label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} aria-invalid={!emailValid} required autoFocus />
          </Label>
          <div className="help-row">
            <small>Enter your registered email to receive OTP</small>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Label>
            <span>Email</span>
            <input type="email" value={email} readOnly aria-readonly="true" required />
          </Label>
          <Label>
            <span>OTP</span>
            <input value={otp} onChange={(e)=>{ const v=e.target.value.replace(/\D+/g,''); setOtp(v.slice(0,6)) }} required inputMode="numeric" autoComplete="one-time-code" autoFocus />
            <div className="help-row">
              <small>Expires in {Math.floor(expireLeft/60)}:{String(expireLeft%60).padStart(2,'0')}</small>
            </div>
          </Label>
          <div className="help-row">
            <small>{cooldown>0 ? `Resend in ${cooldown}s` : 'Didn\'t receive the code?'}</small>
            <button type="button" disabled={cooldown>0 || loading} className="show" onClick={resend}>Resend OTP</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <Label>
            <span>New Password</span>
            <PasswordWrap>
              <input type={show ? 'text' : 'password'} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} aria-invalid={!passwordValid} required autoFocus />
              <button type="button" aria-pressed={show} className="show" onClick={()=>setShow(s=>!s)}>
                <i className={show ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
              </button>
            </PasswordWrap>
            <div className="help-row">
              <small>Use at least 8 characters</small>
              <PasswordStrength $len={newPassword.length}>{newPassword.length >= 8 ? 'Strong' : newPassword.length >= 6 ? 'Weak' : 'Too short'}</PasswordStrength>
            </div>
          </Label>
          <Label>
            <span>Confirm Password</span>
            <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} aria-invalid={!confirmValid} required />
            {!confirmValid && confirmPassword.length > 0 && (
              <div className="help-row"><small>Passwords must match</small></div>
            )}
          </Label>
        </>
      )}

      {error && <Error role="alert">{error}</Error>}
      {success && <Success role="status">{success}</Success>}

      <Primary type="submit" disabled={loading || (step===1 && !emailValid) || (step===2 && !otpValid) || (step===3 && (!passwordValid || !confirmValid))}>
        {loading ? (step===1 ? 'Sending...' : step===2 ? 'Verifying...' : 'Updating...') : (step===1 ? 'Send OTP' : step===2 ? 'Verify OTP' : 'Update Password')}
      </Primary>
      
      <p className="muted"><a href="#" onClick={(e)=>{ e.preventDefault(); onBack() }}>Back to sign in</a></p>
      <div style={{height:0}} ref={lastFocusableRef} />
    </Form>
  )
}

/* ---------------------------- Styled UI ------------------------------ */
const appear = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(.995) }
  to { opacity: 1; transform: translateY(0) scale(1) }
`

const Overlay = styled.div`
  --bg: #0b1220;
  position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:1000;
  background: #000;
  padding: 20px;
`
const Modal = styled.div`
  width: min(720px, 92vw); max-width: 720px; border-radius: 14px; overflow: hidden; animation: ${appear} .18s ease;
  background: var(--ff-bg); border:1px solid rgba(91,225,255,0.35);
  box-shadow: 0 20px 60px rgba(2,6,23,.85); max-height: 86vh;
`
const Top = styled.div`
  display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,0.03);
  .brand{ font-family: 'Oswald', sans-serif; letter-spacing: .6px; color: var(--ff-neon); text-shadow: 0 0 12px var(--ff-glow) }
`
const CloseBtn = styled.button`
  background:transparent; border: none; color: #E6F0FF; font-size: 20px; padding:8px; cursor:pointer;
`
const Content = styled.div`
  display:grid; grid-template-columns: 1fr; gap:0; min-height: 420px; overflow:auto; max-height: calc(86vh - 64px);
  @media(min-width:900px){ grid-template-columns: 40% 60%; }
`
const Visual = styled.div`
  padding: 28px; background: var(--ff-bg); color: var(--ff-text);
  display:flex; flex-direction:column; justify-content:center; gap:12px;
  h4.welcome{ margin:0; font-size:1.4rem; color: var(--ff-neon); text-shadow: 0 0 10px var(--ff-glow) }
  p{ margin:0; color: var(--ff-muted) }
`
const Panel = styled.div`
  padding: 22px; background: var(--ff-bg);
`
const ModeToggle = styled.div`
  display:flex; gap:8px; margin-bottom: 12px; background: var(--ff-bg); padding:6px; border-radius: 12px; border:1px solid rgba(91,225,255,0.25);
`
const ModeButton = styled.button`
  background: transparent; border: none; padding:8px 12px; border-radius:8px; color: var(--ff-muted);
  &[aria-selected='true']{ background: var(--ff-surface); color: var(--ff-text); box-shadow: 0 6px 18px rgba(20,225,255,0.12); border:1px solid rgba(91,225,255,0.35) }
`
const Form = styled.form`
  display:flex; flex-direction:column; gap:12px; width:100%;
  h2{ margin:0; font-size:1.25rem; color:#e6f0ff }
  .muted{ color: rgba(255,255,255,0.6); font-size:0.85rem }
`
const Label = styled.label`
  display:block; font-size:0.9rem; color: var(--ff-text);
  span{ display:block; margin-bottom:6px; color: var(--ff-muted) }
  input{ width:100%; padding:12px 14px; border-radius:12px; border:1px solid rgba(91,225,255,0.35); background: var(--ff-bg); color: var(--ff-text); outline: none; box-shadow: inset 0 0 12px rgba(0,200,255,0.08) }
  input:focus{ box-shadow: 0 0 14px rgba(20,225,255,0.16); border-color: var(--ff-neon) }
  .help-row{ display:flex; justify-content:space-between; align-items:center; margin-top:6px }
`

const PasswordWrap = styled.div`
  position:relative; display:flex; align-items:center;
  input{ flex:1 }
  .show{ position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; color: #9fb3c8; padding:6px; cursor:pointer }
`
const PasswordStrength = styled.span`
  font-size:0.85rem; color: ${p=>p.$len>=8 ? '#8ef3c9' : p.$len>=6 ? '#ffd166' : '#ff6b6b'}
`
const PasswordRequirements = styled.div`
  display:flex; flex-direction:column; gap:4px; margin-top:6px;
  small{ font-size:0.8rem; display:flex; align-items:center; gap:4px; transition:color 0.2s }
`
const Primary = styled.button`
  margin-top:6px; border:none; padding:12px; border-radius:10px; font-weight:700; cursor:pointer;
  background: linear-gradient(180deg, #7deaff, #14e1ff); color:#031b24; box-shadow: 0 8px 30px rgba(20,225,255,0.12);
  &:disabled{ opacity:.6; cursor:not-allowed }
`
const Divider = styled.div`
  display:flex; align-items:center; gap:12px; color: rgba(255,255,255,0.6); margin:8px 0;
  span{ font-size:0.85rem }
  &:before, &:after{ content:''; height:1px; flex:1; background: rgba(255,255,255,0.03) }
`
const Socials = styled.div`
  display:flex; gap:10px; margin-top:6px; justify-content:center;
`
const SocialButton = styled.button`
  border:none; padding:12px 24px; border-radius:10px; background: rgba(255,255,255,0.02); color:#e6f0ff; cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.3s ease; min-width:200px;
  &:hover{ background: rgba(255,255,255,0.08); transform:translateY(-2px) }
  svg{ flex-shrink:0 }
  span{ font-size:15px }
`
const Footer = styled.div`
  margin-top:12px; display:flex; justify-content:space-between; align-items:center;
`
const Small = styled.small`
  color: rgba(255,255,255,0.5); font-size:0.85rem
`
const Error = styled.div`
  background: rgba(255,107,107,0.08); color: #ff6b6b; padding:8px 10px; border-radius:8px; text-align:center
`
const Success = styled.div`
  background: rgba(142,243,201,0.08); color: #8ef3c9; padding:8px 10px; border-radius:8px; text-align:center
`
/* ---------------------------- End UI -------------------------------- */
