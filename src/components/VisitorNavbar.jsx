import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import AuthModal from '@/components/AuthModal.jsx'

function VisitorNavbar({ authModalOpen, setAuthModalOpen }){
  const { user } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  
  useEffect(() => {
    if (authModalOpen !== undefined) {
      setAuthOpen(authModalOpen)
    }
  }, [authModalOpen])
  useEffect(()=>{ setMounted(true) },[])
  useEffect(()=>{ 
    if(user) {
      // Check onboarding status before redirecting
      if(user.onboarding_completed) {
        nav('/dashboard')
      } else {
        nav('/onboarding')
      }
    }
  },[user])
  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    if(params.get('auth') === 'login'){
      setAuthOpen(true)
    }
  },[location.search])
  useEffect(()=>{
    function open(){ setAuthOpen(true) }
    window.addEventListener('auth:open', open)
    return ()=>window.removeEventListener('auth:open', open)
  },[])
  useEffect(()=>{
    const $ = window.$ || window.jQuery
    if(!$) return
    if ($('.mobile-menu').length && typeof $.fn.slicknav !== 'undefined') {
      $('.mobile-menu').slicknav({
        prependTo: '#mobile-menu-wrap',
        closedSymbol: '<i class="fa fa-angle-right"></i>',
        openedSymbol: '<i class="fa fa-angle-down"></i>'
      })
    }
    $('.canvas-open').off('click').on('click', function(){
      $('.offcanvas-menu-wrapper').addClass('show-offcanvas-menu-wrapper')
      $('.offcanvas-menu-overlay').addClass('active')
    })
    $('.canvas-close, .offcanvas-menu-overlay').off('click').on('click', function(){
      $('.offcanvas-menu-wrapper').removeClass('show-offcanvas-menu-wrapper')
      $('.offcanvas-menu-overlay').removeClass('active')
    })
    return ()=>{
      if($){
        $('.mobile-menu').slicknav('destroy')
        $('.canvas-open').off('click')
        $('.canvas-close, .offcanvas-menu-overlay').off('click')
      }
    }
  },[])
  const isActive = (to)=> location.pathname === to ? 'active' : ''
  if(!mounted || user) return null
  return (
    <>
    <div className="offcanvas-menu-overlay"></div>
    <div className="offcanvas-menu-wrapper">
      <div className="canvas-close">
        <i className="fa fa-close"></i>
      </div>
      <div className="canvas-search search-switch">
        <i className="fa fa-search"></i>
      </div>
      <nav className="canvas-menu mobile-menu">
        <ul>
          <li className={isActive('/')}><Link to="/">Home</Link></li>
          <li className={isActive('/about')}><Link to="/about">About</Link></li>
          <li className={isActive('/services')}><Link to="/services">Services</Link></li>
          <li className={isActive('/contact')}><Link to="/contact">Contact</Link></li>
          <li><a href="#login" onClick={(e)=>{ e.preventDefault(); setAuthOpen(true) }}><i className="fa fa-user"></i> Login</a></li>
        </ul>
      </nav>
      <div id="mobile-menu-wrap"></div>
      <div className="canvas-social">
        <a href="#"><i className="fa fa-facebook"></i></a>
        <a href="#"><i className="fa fa-twitter"></i></a>
        <a href="#"><i className="fa fa-youtube-play"></i></a>
        <a href="#"><i className="fa fa-instagram"></i></a>
      </div>
    </div>
    <header className="header-section">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3">
            <div className="logo">
              <Link to="/" className="logo-text">
                <span className="logo-icon-left flaticon-002-dumbell"></span>
                <span className="logo-white">Fit</span><span className="logo-orange">Forge</span>
                <span className="logo-icon-right flaticon-014-heart-beat"></span>
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <nav className="nav-menu">
              <ul>
                <li className={isActive('/')}><Link to="/">Home</Link></li>
                <li className={isActive('/about')}><Link to="/about">About</Link></li>
                <li className={isActive('/services')}><Link to="/services">Services</Link></li>
                <li className={isActive('/contact')}><Link to="/contact">Contact</Link></li>
                <li><a href="#login" onClick={(e)=>{ e.preventDefault(); setAuthOpen(true) }}><i className="fa fa-user"></i> Login</a></li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-3">
            <div className="top-option">
              <div className="to-search search-switch">
                <i className="fa fa-search"></i>
              </div>
              <div className="to-social">
                <a href="#"><i className="fa fa-facebook"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-youtube-play"></i></a>
                <a href="#"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <div className="canvas-open">
          <i className="fa fa-bars"></i>
        </div>
      </div>
    </header>
    <AuthModal open={authOpen} onClose={()=>{
      setAuthOpen(false)
      if(setAuthModalOpen) setAuthModalOpen(false)
    }} />
    </>
  )
}

export default VisitorNavbar