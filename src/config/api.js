export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    forgot: '/auth/forgot',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    googleInit: '/auth/google/init',
    checkAvailability: '/auth/check'
  },
  workouts: '/workouts',
  nutrition: '/nutrition',
  progress: '/progress',
  exercises: '/exercises',
  chat: '/chat',
  tracker: '/tracker',
  reports: '/reports',
  recipes: '/recipes'
}
