import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import AuthModal from '@/components/AuthModal.jsx'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isActive = (to) => location.pathname === to ? 'active' : ''
  
  if(user) return null
  useEffect(() => {
    function open() { setAuthOpen(true) }
    window.addEventListener('auth:open', open)
    return () => window.removeEventListener('auth:open', open)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  useEffect(()=>{
    const nav = document.querySelector('.slicknav_nav')
    const toggleBtn = document.querySelector('.canvas-open')
    if(!nav) return
    function applyHiddenState(isHidden){
      if(isHidden){
        nav.setAttribute('inert','')
        nav.setAttribute('aria-hidden','true')
        if(nav.contains(document.activeElement)) toggleBtn?.focus()
      }else{
        nav.removeAttribute('inert')
        nav.setAttribute('aria-hidden','false')
        toggleBtn?.setAttribute('aria-expanded','true')
      }
    }
    applyHiddenState(nav.classList.contains('slicknav_hidden'))
    const obs = new MutationObserver(()=>applyHiddenState(nav.classList.contains('slicknav_hidden')))
    obs.observe(nav, { attributes:true, attributeFilter:['class'] })
    return ()=>obs.disconnect()
  },[])
  return (
    <>
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-logo" onClick={() => setMobileMenuOpen(false)}>
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
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/')}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🏠 Home
          </Link>
          <Link 
            to="/about" 
            className={`mobile-nav-link ${isActive('/about')}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            ℹ️ About
          </Link>
          <Link 
            to="/services" 
            className={`mobile-nav-link ${isActive('/services')}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🏋️ Services
          </Link>
          <Link 
            to="/contact" 
            className={`mobile-nav-link ${isActive('/contact')}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            📞 Contact
          </Link>
          
          {!user ? (
            <button 
              className="mobile-auth-btn"
              onClick={() => {
                setAuthOpen(true)
                setMobileMenuOpen(false)
              }}
            >
              👤 Login
            </button>
          ) : (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="mobile-avatar" />
                ) : (
                  <div className="mobile-avatar-placeholder">👤</div>
                )}
                <span className="mobile-username">{user.username}</span>
              </div>
              <button className="mobile-logout-btn" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          )}
        </nav>
        
        <div className="mobile-social">
          <a href="#" className="social-link">📘</a>
          <a href="#" className="social-link">🐦</a>
          <a href="#" className="social-link">📺</a>
          <a href="#" className="social-link">📷</a>
        </div>
      </div>

      {/* Main Header */}
      <header className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="main-logo">
            <span className="logo-icon">💪</span>
            <span className="logo-text">
              <span className="logo-fit">Fit</span>
              <span className="logo-forge">Forge</span>
            </span>
            <span className="logo-pulse">❤️</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
            <Link to="/services" className={`nav-link ${isActive('/services')}`}>
              Services
            </Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
              Contact
            </Link>
          </nav>
          
          {/* Right Section */}
          <div className="header-right">
            {/* Search Button */}
            <button className="search-btn" aria-label="Search">
              🔍
            </button>
            
            {/* Auth Section */}
            {!user ? (
              <button 
                className="login-btn"
                onClick={() => setAuthOpen(true)}
              >
                👤 Login
              </button>
            ) : (
              <div className="user-menu">
                <div className="user-info">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="user-avatar" />
                  ) : (
                    <div className="avatar-placeholder">👤</div>
                  )}
                  <span className="username">{user.username}</span>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                  🚪
                </button>
              </div>
            )}
            
            {/* Social Links */}
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📺</a>
              <a href="#" className="social-link">📷</a>
            </div>
            
            {/* Mobile Menu Toggle */}
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
      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} />
    </>
  )
}

export default Navbar