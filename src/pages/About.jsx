import VisitorNavbar from '../components/VisitorNavbar.jsx'
import PromoPopup from '../components/PromoPopup.jsx'
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
      <section className="hero-section" id="about-hero">
        <div className="hs-item">
          <video autoPlay loop muted playsInline preload="metadata" className="hero-video">
            <source src="/img/about%20us/fitness%20book.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay">
            <div className="container">
              <div className="row">
                <div className="col-lg-6">
                  <div className="hi-text">
                    <h1>{heading}</h1>
                    <p className="ff-sub" style={{ color:'#fff' }}>{sub}</p>
                    <p style={{ color:'#e6f0ff', maxWidth:'720px' }}>{paragraph}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Mission />
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
    <section className="ff-section" id="mission">
      <div className="ff-container">
        <div className="ff-mission-grid">
          <div className="ff-float-in" style={{ width:'min(520px, 52vw)' }}>
            <Globe rotateCities={rotateCities} rotationSpeed={3000} markers={markers} />
          </div>
          <div className="ff-panel ff-float-in" style={{ padding:'22px' }}>
            <h2 className="ff-title">{heading}</h2>
            <h2 className="ff-title" style={{ textAlign:'center' }}>Smarter Fitness with AI</h2>
            <p className="ff-sub" style={{ fontSize:'16px' }}>{paragraph}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection(){
  const heading = 'Let’s Talk: Build Your Fittest Self'
  const paragraph = 'Have questions, ideas, or need guidance? Reach out and we’ll help you shape a smarter routine, track progress that matters, and stay consistent with data-backed insights.'
  return (
    <section className="ff-section" id="contact-callout">
      <div className="ff-container">
        <div className="ff-mission-grid">
          <div className="ff-panel ff-float-in" style={{ padding:'22px' }}>
            <h2 className="ff-title">{heading}</h2>
            <p className="ff-sub" style={{ fontSize:'16px' }}>{paragraph}</p>
            <div style={{ marginTop:'16px' }}>
              <Link to="/contact" className="primary-btn">Contact Us</Link>
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
                <li><a href="/">Blog</a></li>
                <li><a href="/workouts">Classes</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="fs-widget">
              <h4>Support</h4>
              <ul>
                <li><a href="/login">Login</a></li>
                <li><a href="/dashboard">My account</a></li>
                <li><a href="/register">Subscribe</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="fs-widget">
              <h4>Tips & Guides</h4>
              <div className="fw-recent">
                <h6><a href="#">Physical fitness may help prevent depression, anxiety</a></h6>
                <ul>
                  <li>3 min read</li>
                  <li>20 Comment</li>
                </ul>
              </div>
              <div className="fw-recent">
                <h6><a href="#">Fitness: The best exercise to lose belly fat and tone up...</a></h6>
                <ul>
                  <li>3 min read</li>
                  <li>20 Comment</li>
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