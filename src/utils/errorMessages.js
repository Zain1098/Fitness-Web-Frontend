export const ERROR_MESSAGES = {
  network_error: 'Unable to connect to server. Please check your internet connection.',
  unauthorized: 'Your session has expired. Please login again.',
  forbidden: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  validation_error: 'Please check your input and try again.',
  server_error: 'Something went wrong on our end. Please try again later.',
  too_many_requests: 'Too many attempts. Please wait a moment and try again.',
  invalid_credentials: 'Invalid email or password.',
  user_exists: 'An account with this email already exists.',
  token_expired: 'Your session has expired. Please login again.',
  otp_expired: 'Verification code has expired. Please request a new one.',
  invalid_otp: 'Invalid verification code. Please try again.',
  default: 'An unexpected error occurred. Please try again.'
}

export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES.default
  }
  
  if (error?.message) {
    const msg = error.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) {
      return ERROR_MESSAGES.network_error
    }
    if (msg.includes('unauthorized') || msg.includes('401')) {
      return ERROR_MESSAGES.unauthorized
    }
    if (msg.includes('forbidden') || msg.includes('403')) {
      return ERROR_MESSAGES.forbidden
    }
    if (msg.includes('not found') || msg.includes('404')) {
      return ERROR_MESSAGES.not_found
    }
  }
  
  return error?.message || ERROR_MESSAGES.default
}
