import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { API_BASE_URL } from '../config/api.js'
import { logActivity } from '../utils/activityLogger.js'
import { logSecurityEvent } from '../utils/securityMonitor.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const navigate = useNavigate()
  const [token, setToken] = useState(localStorage.getItem('ff_token') || '')
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('ff_user')
    return u ? JSON.parse(u) : null
  })
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const t = params.get('ff_token')
    const u = params.get('ff_user')
    if(t && u){
      try{
        const parsed = JSON.parse(atob(u))
        localStorage.setItem('ff_token', t)
        localStorage.setItem('ff_user', JSON.stringify(parsed))
        setToken(t)
        setUser(parsed)
        const url = new URL(window.location.href); url.search = ''; window.history.replaceState({}, '', url.toString())
      }catch(_){ /* ignore */ }
    }
  },[])
  useEffect(()=>{
    if(!token) return
    if(!user){
      const u = localStorage.getItem('ff_user')
      if(u){ setUser(JSON.parse(u)); return }
    }
    api('/auth/me', { token })
      .then((u)=>{ setUser(u); localStorage.setItem('ff_user', JSON.stringify(u)) })
      .catch((err)=>{
        if(err.message === 'invalid_token' || err.message === 'unauthorized') {
          localStorage.removeItem('ff_token')
          localStorage.removeItem('ff_user')
          setToken('')
          setUser(null)
          navigate('/')
        }
      })
  },[token])
  const value = useMemo(()=>({
    token,
    user,
    login: async (email, password)=>{
      try{
        const r = await api('/auth/login', { method:'POST', body:{ email, password } })
        localStorage.setItem('ff_token', r.token)
        localStorage.setItem('ff_user', JSON.stringify(r.user))
        setToken(r.token)
        setUser(r.user)
        // fetch(`${API_BASE_URL}/track/login`, { method: 'POST' }).catch(() => {});
        logActivity('user_login', 'User logged in successfully', 'auth', r.user);
        // Auto-redirect to onboarding if not completed
        if (!r.user.onboarding_completed) {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      }catch(e){
        logSecurityEvent('failed_login', 'medium', '0.0.0.0');
        throw e
      }
    },
    logout: ()=>{ 
      const currentUser = user;
      localStorage.removeItem('ff_token'); 
      localStorage.removeItem('ff_user'); 
      setToken(''); 
      setUser(null); 
      if(currentUser) logActivity('user_logout', 'User logged out', 'auth', currentUser);
      navigate('/'); 
    },
    register: async (u)=>{
      try{
        const r = await api('/auth/register', { method:'POST', body: u })
        if(r?.status === 'otp_required'){
          const exp = r?.otp_expires_at ? Date.parse(r.otp_expires_at) : (Date.now()+2*60*1000)
          localStorage.setItem('auth_pending_email', u.email)
          localStorage.setItem('otp_expire_ts', String(exp))
        }
        return r
      }catch(e){ 
        logSecurityEvent('failed_registration', 'low', '0.0.0.0');
        throw e 
      }
    },
    verifyOtpSignup: async (email, code)=>{
      const r = await api('/auth/verify-otp', { method:'POST', body:{ email, code, purpose:'signup' } })
      localStorage.setItem('ff_token', r.token)
      localStorage.setItem('ff_user', JSON.stringify(r.user))
      setToken(r.token)
      setUser(r.user)
      // fetch(`${API_BASE_URL}/track/login`, { method: 'POST' }).catch(() => {});
      logActivity('user_signup', 'User completed signup verification', 'auth', r.user);
      // Auto-redirect to onboarding if not completed
      if (!r.user.onboarding_completed) {
        navigate('/onboarding')
      }
      return r.user
    },
    resendOtpSignup: async (email)=>{ const r = await api('/auth/resend-otp', { method:'POST', body:{ email, purpose:'signup' } }); const exp = r?.otp_expires_at ? Date.parse(r.otp_expires_at) : (Date.now()+2*60*1000); localStorage.setItem('otp_expire_ts', String(exp)); return r },
    sendForgotOtp: async (email)=>{ return api('/auth/forgot', { method:'POST', body:{ email } }) },
    verifyOtpReset: async (email, code)=>{ return api('/auth/verify-otp', { method:'POST', body:{ email, code, purpose:'reset' } }) },
    resetPassword: async (email, code, newPassword)=>{ return api('/auth/reset-password', { method:'POST', body:{ email, code, newPassword } }) },
    googleInit: async ()=>{ const r = await api('/auth/google/init'); window.location.href = r.url },
    checkAvailability: async (email, username)=>{ const params = new URLSearchParams(); if(email) params.set('email', email); if(username) params.set('username', username); return api('/auth/check?'+params.toString()) }
  }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }