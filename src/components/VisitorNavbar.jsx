import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import AuthModal from '@/components/AuthModal.jsx'
import { Sparkles, Menu, X, ArrowRight, Dumbbell } from 'lucide-react'

function VisitorNavbar({ authModalOpen, setAuthModalOpen }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (authModalOpen !== undefined) {
      setAuthOpen(authModalOpen)
    }
  }, [authModalOpen])

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user) {
      if (user.onboarding_completed) {
        nav('/dashboard')
      } else {
        nav('/onboarding')
      }
    }
  }, [user, nav])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('auth') === 'login') {
      setAuthOpen(true)
    }
  }, [location.search])

  useEffect(() => {
    function open() { setAuthOpen(true) }
    window.addEventListener('auth:open', open)
    return () => window.removeEventListener('auth:open', open)
  }, [])

  const isActive = (to) => location.pathname === to ? 'text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      nav(`/#${sectionId}`)
    } else {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  if (!mounted || user) return null

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 transition-all duration-300 ${
          scrolled ? 'shadow-[0_12px_36px_rgba(15,23,42,0.08)]' : ''
        }`}
      >
        <div className="glass-panel rounded-full px-5 sm:px-7 py-3 flex items-center justify-between transition-all">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Dumbbell className="w-5 h-5 text-[#D4F63D]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-['Outfit'] text-slate-900">
              Fit<span className="text-slate-900">Forge</span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link to="/" className={`transition-colors ${isActive('/')}`}>
              Home
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => handleSectionClick(e, 'how-it-works')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#nutrition"
              onClick={(e) => handleSectionClick(e, 'nutrition')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Nutrition
            </a>
            <a
              href="#workouts"
              onClick={(e) => handleSectionClick(e, 'workouts')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Workouts
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSectionClick(e, 'pricing')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Pricing
            </a>
            <Link to="/about" className={`transition-colors ${isActive('/about')}`}>
              About
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setAuthOpen(true)}
              className="text-sm font-bold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="group inline-flex items-center gap-1.5 text-sm font-black bg-[#D4F63D] hover:bg-[#c4e626] text-slate-950 px-5 py-2.5 rounded-full shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-105 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-5 rounded-3xl glass-panel shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-3 text-base font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/')}`}
              >
                Home
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => handleSectionClick(e, 'how-it-works')}
                className="py-1.5 text-slate-700 hover:text-slate-950"
              >
                How It Works
              </a>
              <a
                href="#nutrition"
                onClick={(e) => handleSectionClick(e, 'nutrition')}
                className="py-1.5 text-slate-700 hover:text-slate-950"
              >
                Nutrition
              </a>
              <a
                href="#workouts"
                onClick={(e) => handleSectionClick(e, 'workouts')}
                className="py-1.5 text-slate-700 hover:text-slate-950"
              >
                Workouts
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleSectionClick(e, 'pricing')}
                className="py-1.5 text-slate-700 hover:text-slate-950"
              >
                Pricing
              </a>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/about')}`}
              >
                About
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthOpen(true)
                }}
                className="w-full py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthOpen(true)
                }}
                className="w-full py-2.5 text-sm font-black bg-[#D4F63D] hover:bg-[#c4e626] text-slate-950 rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false)
          if (setAuthModalOpen) setAuthModalOpen(false)
        }}
      />
    </>
  )
}

export default VisitorNavbar