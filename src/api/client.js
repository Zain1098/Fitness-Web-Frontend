import { logSecurityEvent } from '../utils/securityMonitor.js'
import { API_BASE_URL } from '../config/api.js'

const base = API_BASE_URL

export async function api(path, { method = 'GET', body, token } = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const res = await fetch(base + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    })
    
    let data = null
    const contentType = res.headers.get('content-type')
    
    // Handle empty body responses (204 No Content, etc)
    if (res.status === 204 || res.status === 201 || !res.ok && res.status >= 400) {
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await res.text()
          if (text && text.trim()) {
            data = JSON.parse(text)
          } else {
            data = {}
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
          data = { error: 'invalid_response', message: 'Server returned invalid JSON' }
        }
      } else {
        const text = await res.text()
        data = text && text.trim() 
          ? { error: 'invalid_content_type', message: text }
          : {}
      }
    } else if (contentType && contentType.includes('application/json')) {
      try {
        const text = await res.text()
        if (text && text.trim()) {
          data = JSON.parse(text)
        } else {
          data = {}
        }
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