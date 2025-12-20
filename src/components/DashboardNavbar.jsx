import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { api } from '@/api/client.js'
import './DashboardNavbar.css'

function DashboardNavbar() {
  const { user, logout, token } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [subscription, setSubscription] = useState(null)
  
  useEffect(() => {
    const loadSubscription = async () => {
      if (!token) return
      try {
        const data = await api('/payment/subscription', { token })
        setSubscription(data)
      } catch (err) {
        console.error('Failed to load subscription:', err)
      }
    }
    loadSubscription()
  }, [token])
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadNotifications = async () => {
    if (!token) return
    try {
      const data = await api('/notifications', { token })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      // Silently fail - don't spam console
      if (err.message !== 'invalid_token') {
        console.error('Failed to load notifications:', err)
      }
    }
  }

  useEffect(() => {
    loadNotifications()
    // Refresh notifications every 2 minutes instead of 30 seconds
    const interval = setInterval(loadNotifications, 120000)
    return () => clearInterval(interval)
  }, [token])

  const markAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT', token })
      loadNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT', token })
      loadNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }
  
  const isActive = (to) => location.pathname === to ? 'active' : ''
  
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/tracker', label: 'Daily Tracker', icon: '📅' },
    { to: '/exercises', label: 'Exercises', icon: '🏋️' },
    { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
    { to: '/progress', label: 'Progress', icon: '📈' },
    { to: '/settings', label: 'Settings', icon: '⚙️' }
  ]
  
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`dashboard-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      {/* Mobile Menu */}
      <div className={`dashboard-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/dashboard" className="mobile-logo" onClick={() => setMobileMenuOpen(false)}>
            <span className="logo-icon">💪</span>
            <span className="logo-text">FitForge</span>
          </Link>
          <button 
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        
        <nav className="mobile-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActive(link.to)}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mobile-user-section">
          <div className="mobile-user-info">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="mobile-avatar" />
            ) : (
              <div className="mobile-avatar-placeholder">👤</div>
            )}
            <span className="mobile-username">{user?.username}</span>
          </div>
          <button className="mobile-logout-btn" onClick={logout}>
            ↪ Logout
          </button>
        </div>
      </div>
      
      {/* Main Navbar */}
      <header className={`dashboard-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-icon">💪</span>
            <span className="logo-text">
              <span className="logo-fit">Fit</span>
              <span className="logo-forge">Forge</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to)}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* User Section */}
          <div className="navbar-right">
            {/* Notification Icon */}
            <div className="notification-wrapper">
              <button 
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="mark-all-btn">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <span>🔕</span>
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => markAsRead(notif._id)}
                        >
                          <div className="notif-icon">
                            {notif.type === 'workout' && '💪'}
                            {notif.type === 'nutrition' && '🥗'}
                            {notif.type === 'progress' && '📈'}
                            {notif.type === 'reminder' && '⏰'}
                            {notif.type === 'achievement' && '🏆'}
                          </div>
                          <div className="notif-content">
                            <div className="notif-title">{notif.title}</div>
                            <div className="notif-message">{notif.message}</div>
                            <div className="notif-time">
                              {new Date(notif.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {!notif.read && <div className="unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-menu">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="user-avatar" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
              <div className="user-info-wrapper">
                <span className="username">{user?.username}</span>
                {subscription?.plan && subscription.plan !== 'free' && (
                  <span className="pro-badge">{subscription.plan.toUpperCase()}</span>
                )}
              </div>
              <button className="logout-btn" onClick={logout} title="Logout">
                ↪
              </button>
            </div>
            
            {/* Mobile Toggle */}
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default DashboardNavbar
