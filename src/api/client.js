import { logSecurityEvent } from '../utils/securityMonitor.js'
import { API_BASE_URL } from '../config/api.js'

const base = API_BASE_URL

export async function api(path, { method = 'GET', body, token } = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const res = await fetch(base + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      cache: 'no-store'
    })
    
    let data = null
    const contentType = res.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await res.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        data = { error: 'invalid_response', message: 'Server returned invalid JSON' }
      }
    } else {
      const text = await res.text()
      data = { error: 'invalid_content_type', message: text || 'Server returned non-JSON response' }
    }
    
    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`
      
      // Log security events for specific error codes
      if (res.status === 401) {
        logSecurityEvent('unauthorized_access', 'medium', '0.0.0.0');
      } else if (res.status === 403) {
        logSecurityEvent('forbidden_access', 'high', '0.0.0.0');
      } else if (res.status === 429) {
        logSecurityEvent('rate_limit_exceeded', 'medium', '0.0.0.0');
      }
      
      throw new Error(errorMessage)
    }
    
    return data
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your internet connection.')
    }
    throw error
  }
}