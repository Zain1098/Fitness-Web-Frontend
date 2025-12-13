import { API_BASE_URL } from '../config/api.js'
import VisitorNavbar from '../components/VisitorNavbar.jsx'
import PromoPopup from '../components/PromoPopup.jsx'
import '../styles/neon.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { showToast } from '../components/Toast.jsx'
import SplitText from '@/components/ui/SplitText.jsx'
import SwitchBilling from '@/components/ui/SwitchBilling.jsx'
import PricingCard from '@/components/ui/PricingCard.jsx'
import SpotlightCard from '@/components/ui/SpotlightCard.jsx'

export default function Services(){
  const heading = 'Clear Plans. Real Results. No Hidden Nonsense.'
  const paragraph = 'You get exactly what you pay for — powerful workout tools, a complete exercise library, AI-driven plans, and detailed progress tracking. No gimmicks, no extra charges, no surprises. Pick a plan and start improving your results from day one.'
  return (
    <>
      <PromoPopup />
      <VisitorNavbar />
      <section className="ff-section" id="services-hero">
        <div className="ff-service-full">
          <video autoPlay loop muted playsInline preload="metadata" className="ff-service-video">
            <source src="/video/pricing.mp4" type="video/mp4" />
          </video>
          <div className="ff-service-overlay">
            <div className="container">
              <div className="row justify-content-end">
                <div className="col-lg-6">
                  <div className="hi-text" style={{ textAlign:'right' }}>
                    <h1>
                      Clear Plans. <span className="ff-hero-accent">Real Results.</span> No Hidden Nonsense.
                    </h1>
                    <p className="ff-sub">You get exactly what you pay for — powerful workout tools, a complete exercise library, AI-driven plans, and detailed progress tracking. No gimmicks, no extra charges, no surprises. Pick a plan and start improving your results from day one.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ServicesPricingPlans />
      <ServicesSpotlights />
      <FooterSection />
    </>
  )
}

function ServicesPricingPlans(){
  const [annual, setAnnual] = useState(false)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch(`${API_BASE_URL}/pricing`)
        const data = await response.json()
        setPlans(data.plans || [])
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])
  
  const handlePlanClick = (plan) => {
    if (!user) {
      navigate('/?auth=login')
      return
    }
    if (plan === 'free') {
      navigate('/dashboard')
    } else {
      navigate(`/checkout?plan=${plan}`)
    }
  }
  
  if (loading) return null
  
  return (
    <section className="ff-section" id="pricing">
      <div className="ff-container">
        <h2 className="ff-title" style={{ textAlign:'center' }}>
          <SplitText text="Pricing Plans" />
        </h2>
        <div style={{ display:'flex', justifyContent:'center', margin:'10px 0 24px' }}>
          <SwitchBilling checked={annual} onChange={setAnnual} />
        </div>
        <div style={{ display:'flex', gap:'24px', justifyContent:'center', flexWrap:'wrap' }}>
          {plans.map((plan) => (
            <PricingCard 
              key={plan.planId}
              badge={plan.badge}
              tier={plan.name}
              price={annual ? `$${plan.annualPrice}` : `$${plan.monthlyPrice}`}
              unit={annual ? 'year' : 'month'}
              description={plan.description}
              features={plan.features}
              cta={plan.planId === 'free' ? 'Get Started' : `Choose ${plan.name}`}
              onClick={() => handlePlanClick(plan.planId)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicesSpotlights(){
  return (
    <section className="ff-section" id="services-spotlights">
      <div className="ff-container" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'24px' }}>
        <SpotlightCard spotlightColor="rgba(0, 229, 255, 0.2)">
          <h3 className="ff-title" style={{ fontSize:'24px' }}>Complete Exercise Library</h3>
          <p className="ff-sub">Access every major exercise with clear visuals, tutorials, form breakdowns, and common mistakes to avoid. No guessing — just follow and train the right way.</p>
        </SpotlightCard>
        <SpotlightCard spotlightColor="rgba(0, 229, 255, 0.2)">
          <h3 className="ff-title" style={{ fontSize:'24px' }}>Advanced Progress Tracking</h3>
          <p className="ff-sub">Track your reps, sets, weights, body stats, and calories with accurate charts that show your real improvements. No fluff — just data that actually matters.</p>
        </SpotlightCard>
        <SpotlightCard spotlightColor="rgba(0, 229, 255, 0.2)">
          <h3 className="ff-title" style={{ fontSize:'24px' }}>Personalized AI Workout Plans</h3>
          <p className="ff-sub">Get custom routines built around your goals, equipment, and weak points. Smart, realistic, and designed to be followed consistently without a trainer.</p>
        </SpotlightCard>
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
