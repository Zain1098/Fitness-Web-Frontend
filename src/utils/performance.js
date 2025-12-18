export const measurePerformance = (metricName, callback) => {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  const duration = end - start
  
  if (duration > 100) {
    console.warn(`⚠️ Slow operation: ${metricName} took ${duration.toFixed(2)}ms`)
  }
  
  return result
}

export const logPageLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      const connectTime = perfData.responseEnd - perfData.requestStart
      const renderTime = perfData.domComplete - perfData.domLoading
      
      console.log('📊 Performance Metrics:', {
        pageLoad: `${pageLoadTime}ms`,
        apiConnect: `${connectTime}ms`,
        render: `${renderTime}ms`
      })
    })
  }
}

export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit = 100) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
