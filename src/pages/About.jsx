import VisitorNavbar from '../components/VisitorNavbar.jsx'
import PromoPopup from '../components/PromoPopup.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import '../styles/neon.css'
import Globe from '@/components/ui/Globe.jsx'
import { Link } from 'react-router-dom'
import AISmarter from '@/components/ui/AISmarter.jsx'

export default function About(){
  const heading = 'Built to Help You Become Your Strongest Self'
  const sub = 'Smart Tracking. Real Progress. No Guesswork.'
  const paragraph = 'At FitForge, we believe fitness should be simple, measurable, and built around your real life. Our mission is to give you the tools, insights, and structure you need to train smarter, stay consistent, and understand your body better. Whether you\'re just starting or pushing for your next milestone, we’re here to guide, track, and support every step of your journey.'
  return (
    <>
      <PromoPopup />
      <VisitorNavbar />
      <ScrollToTop />
      <section className="hero-section" id="about-hero">
        <div className="hs-item">
          <video autoPlay loop muted playsInline preload="metadata" className="hero-video">
            <source src="/img/about%20us/fitness%20book.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay">
            <div className="container">
              <div className="row">
                <div className="col-lg-6">
                  <div className="hi-text" style={{ animation: 'scrollReveal 1s ease-out forwards' }}>
                    <h1 className="ff-glitch" data-text={heading}>{heading}</h1>
                    <p className="ff-sub" style={{ color:'#fff', animation: 'floatIn 1.2s ease-out forwards' }}>{sub}</p>
                    <p style={{ color:'#e6f0ff', maxWidth:'720px', animation: 'floatIn 1.4s ease-out forwards' }}>{paragraph}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Mission />
      <FeaturesShowcase />
      <AISmarter />
      <ContactSection />
      <FooterSection />
    </>
  )
}

export function Mission(){
  const rotateCities = ['New York','London','Tokyo','Dubai','Paris']
  const markers = [
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [51.5074, -0.1278], size: 0.1 },
    { location: [35.6762, 139.6503], size: 0.1 },
    { location: [25.2048, 55.2708], size: 0.1 },
  ]
  const heading = 'Our Mission: Bringing Fitness to Everyone, Everywhere'
  const paragraph = 'At FitForge, we believe fitness is not just a goal—it’s a lifestyle that everyone deserves to embrace. Our mission is to make tracking your health, setting smart goals, and achieving them easier than ever, no matter where you are in the world. With FitForge, you can take control of your fitness journey, stay motivated, and monitor your progress with precision and simplicity. We’re not just building an app; we’re creating a global movement that empowers people to prioritize their health, unlock their potential, and make fitness an integral part of their everyday life. Join us, and be part of a community where your goals are not just set—they’re achieved.'
  return (
    <section className="ff-section" id="mission" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="ff-particle" style={{ position: 'absolute', top: '10%', left: '5%', width: '4px', height: '4px', background: '#ff6b35', borderRadius: '50%', opacity: 0.6, animation: 'floatParticle 8s infinite', zIndex: 0 }} />
      <div className="ff-particle" style={{ position: 'absolute', top: '60%', left: '15%', width: '3px', height: '3px', background: '#14e1ff', borderRadius: '50%', opacity: 0.5, animation: 'floatParticle 10s infinite 1s', zIndex: 0 }} />
      <div className="ff-particle" style={{ position: 'absolute', top: '30%', right: '10%', width: '5px', height: '5px', background: '#ff6b35', borderRadius: '50%', opacity: 0.4, animation: 'floatParticle 12s infinite 2s', zIndex: 0 }} />
      <div className="ff-particle" style={{ position: 'absolute', bottom: '20%', right: '20%', width: '3px', height: '3px', background: '#14e1ff', borderRadius: '50%', opacity: 0.6, animation: 'floatParticle 9s infinite 3s', zIndex: 0 }} />
      <div className="ff-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="ff-mission-grid">
          <div className="ff-float-in" style={{ width:'min(520px, 52vw)', position: 'relative' }}>
            <Globe rotateCities={rotateCities} rotationSpeed={3000} markers={markers} />
          </div>
          <div className="ff-panel ff-float-in" style={{ padding:'32px', background: 'linear-gradient(135deg, rgba(20, 225, 255, 0.1), rgba(10, 14, 39, 0.95))', backdropFilter: 'blur(15px)', border: '2px solid #14e1ff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(20, 225, 255, 0.3), inset 0 0 30px rgba(20, 225, 255, 0.1)' }}>
            <h2 className="ff-title" style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '20px', textShadow: '0 0 20px rgba(20, 225, 255, 0.5)' }}>{heading}</h2>
            <h3 className="ff-sub" style={{ textAlign:'center', fontSize:'1.6rem', marginTop:'16px', marginBottom: '20px', color: '#14e1ff', fontWeight: '700', textShadow: '0 0 15px rgba(20, 225, 255, 0.6)', animation: 'floatIn 1.2s ease-out forwards' }}>Smarter Fitness with AI</h3>
            <p className="ff-sub" style={{ fontSize:'18px', color: '#e6f0ff', lineHeight: '1.8', textAlign: 'justify' }}>{paragraph}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesShowcase(){
  const features = [
    { icon: '📊', title: 'Dashboard', desc: 'Complete fitness overview with real-time stats, streaks, and progress charts', color: '#14e1ff' },
    { icon: '📝', title: 'Daily Tracker', desc: 'Log water, steps, sleep, mood, and daily habits in one place', color: '#ff6b35' },
    { icon: '💪', title: 'Exercises', desc: 'Browse 1000+ exercises with videos, instructions, and muscle targeting', color: '#4caf50' },
    { icon: '🍽️', title: 'Nutrition', desc: 'Track meals, calories, macros with smart food database', color: '#ffc107' },
    { icon: '📈', title: 'Progress', desc: 'Body measurements, photos, weight trends, and goal tracking', color: '#9c27b0' },
    { icon: '⚙️', title: 'Settings', desc: 'Customize profile, preferences, notifications, and account', color: '#607d8b' }
  ]
  return (
    <section className="ff-section" id="features" style={{ position: 'relative', background: 'linear-gradient(180deg, rgba(10, 14, 39, 0.8), rgba(26, 31, 58, 0.6))' }}>
      <div className="ff-container">
        <h2 className="ff-title" style={{ textAlign: 'center', color: '#fff', fontSize: '2.5rem', marginBottom: '15px' }}>Powerful Features Inside</h2>
        <p className="ff-sub" style={{ textAlign: 'center', color: '#9fb3c8', fontSize: '18px', marginBottom: '50px' }}>Everything you need to track, improve, and achieve your fitness goals</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {features.map((f, i) => (
            <div key={i} className="ff-float-in" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(20, 225, 255, 0.08), rgba(10, 14, 39, 0.9))', border: `2px solid ${f.color}`, borderRadius: '16px', boxShadow: `0 10px 40px ${f.color}40`, transition: 'all 0.3s ease', cursor: 'pointer', animationDelay: `${i * 0.1}s` }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${f.color}60` }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 10px 40px ${f.color}40` }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{f.icon}</div>
              <h3 style={{ color: f.color, fontSize: '1.5rem', marginBottom: '12px', fontWeight: '700' }}>{f.title}</h3>
              <p style={{ color: '#e6f0ff', fontSize: '16px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection(){
  const heading = 'Let’s Talk: Build Your Fittest Self'
  const paragraph = 'Have questions, ideas, or need guidance? Reach out and we’ll help you shape a smarter routine, track progress that matters, and stay consistent with data-backed insights.'
  return (
    <section className="ff-section" id="contact-callout" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="ff-particle" style={{ position: 'absolute', top: '15%', left: '8%', width: '4px', height: '4px', background: '#ff6b35', borderRadius: '50%', opacity: 0.5, animation: 'floatParticle 11s infinite', zIndex: 0 }} />
      <div className="ff-particle" style={{ position: 'absolute', top: '70%', left: '20%', width: '3px', height: '3px', background: '#14e1ff', borderRadius: '50%', opacity: 0.6, animation: 'floatParticle 9s infinite 1.5s', zIndex: 0 }} />
      <div className="ff-particle" style={{ position: 'absolute', top: '40%', right: '12%', width: '5px', height: '5px', background: '#ff6b35', borderRadius: '50%', opacity: 0.4, animation: 'floatParticle 10s infinite 2.5s', zIndex: 0 }} />
      <div className="ff-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="ff-mission-grid">
          <div className="ff-panel ff-float-in" style={{ padding:'22px', background: 'rgba(10, 14, 39, 0.95)', backdropFilter: 'blur(10px)', border: '2px solid #14e1ff', borderRadius: '18px' }}>
            <h2 className="ff-title" style={{ color: '#fff', fontSize: '2rem' }}>{heading}</h2>
            <p className="ff-sub" style={{ fontSize:'17px', color: '#e6f0ff', lineHeight: '1.7' }}>{paragraph}</p>
            <div style={{ marginTop:'16px' }}>
              <Link to="/contact" className="primary-btn ff-magnetic">Contact Us</Link>
            </div>
          </div>
          <div className="ff-float-in" style={{ width:'min(420px, 44vw)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <lottie-player src="/icons/Contact Icon.json" background="transparent" speed="1" loop autoplay style={{ width:'100%', maxWidth:'420px' }}></lottie-player>
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterSection(){
  return (
    <section className="footer-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="fs-about">
              <div className="fa-logo">
                <a href="/" className="logo-text">
                  <span className="logo-icon-left flaticon-002-dumbell"></span>
                  <span className="logo-white">Fit</span><span className="logo-orange">Forge</span>
                  <span className="logo-icon-right flaticon-014-heart-beat"></span>
                </a>
              </div>
              <p>Train smarter with data-driven tracking, AI-powered insights, and disciplined routines designed for real progress.</p>
              <div className="fa-social">
                <a href="#"><i className="fa fa-facebook"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-youtube-play"></i></a>
                <a href="#"><i className="fa fa-instagram"></i></a>
                <a href="#"><i className="fa fa-envelope-o"></i></a>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="fs-widget">
              <h4>Useful links</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/exercises">Exercises</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="fs-widget">
              <h4>Support</h4>
              <ul>
                <li><a href="#" onClick={(e)=>{e.preventDefault(); window.dispatchEvent(new Event('auth:open'))}}>Login</a></li>
                <li><a href="/dashboard">My account</a></li>
                <li><a href="#" onClick={(e)=>{e.preventDefault(); window.dispatchEvent(new Event('auth:open'))}}>Sign Up</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="fs-widget">
              <h4>Tips & Guides</h4>
              <div className="fw-recent">
                <h6><a href="/about">Why Fitness Tracking Matters</a></h6>
                <ul>
                  <li>5 min read</li>
                </ul>
              </div>
              <div className="fw-recent">
                <h6><a href="/services">Choose the Right Plan for You</a></h6>
                <ul>
                  <li>4 min read</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 text-center">
            <div className="copyright-text">
              <p>
                Copyright &copy; {new Date().getFullYear()} All rights reserved | This template is made with <i className="fa fa-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank" rel="noreferrer">Colorlib</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}