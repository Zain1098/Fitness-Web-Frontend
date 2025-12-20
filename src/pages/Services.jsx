import { api } from '@/api/client.js'
import VisitorNavbar from '../components/VisitorNavbar.jsx'
import PromoPopup from '../components/PromoPopup.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
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
      <ScrollToTop />
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
      <PlanComparison />
      <ServicesSpotlights />
      <FAQSection />
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
        const data = await api('/pricing');
        setPlans(data.plans || []);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [])
  
  const handlePlanClick = (plan) => {
    if (!user) {
      showToast('Please login to continue', 'info')
      navigate(`/?auth=login&redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`)
      return
    }
    if (plan === 'free') {
      showToast('Free plan activated!', 'success')
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
          {plans.filter(p => p.planId === 'free' || p.planId === 'premium' || p.planId === 'pro' || p.planId === 'basic').slice(0, 2).map((plan) => (
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

function PlanComparison(){
  const features = [
    { name: 'Exercise Library', free: '100+ exercises', premium: '1000+ exercises' },
    { name: 'Workout Tracking', free: 'Basic', premium: 'Advanced with analytics' },
    { name: 'Nutrition Tracking', free: 'Manual entry', premium: 'Smart food database' },
    { name: 'Progress Photos', free: '5 photos', premium: 'Unlimited photos' },
    { name: 'AI Workout Plans', free: false, premium: true },
    { name: 'Custom Meal Plans', free: false, premium: true },
    { name: 'Priority Support', free: false, premium: true },
    { name: 'Export Data', free: false, premium: true }
  ]
  return (
    <section className="ff-section" id="comparison" style={{ position: 'relative', overflow: 'hidden' }}>
      {[...Array(8)].map((_, i) => <div key={i} className="ff-particle" style={{ position: 'absolute', width: '6px', height: '6px', background: i % 2 === 0 ? '#ff6b35' : '#14e1ff', borderRadius: '50%', opacity: 0.7, animation: 'floatParticle 10s infinite', animationDelay: `${i * 0.8}s`, left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 30}%`, boxShadow: `0 0 15px ${i % 2 === 0 ? '#ff6b35' : '#14e1ff'}` }} />)}
      <div className="ff-container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="ff-title ff-glitch" data-text="Plan Comparison" style={{ textAlign: 'center', color: '#fff', fontSize: '2.5rem', marginBottom: '50px' }}>Plan Comparison</h2>
        <div className="ff-neon-border" style={{ maxWidth: '900px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(20, 225, 255, 0.05), rgba(10, 14, 39, 0.9))', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(20, 225, 255, 0.3)', animation: 'floatIn 1s ease-out forwards' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0', background: 'linear-gradient(90deg, #14e1ff, #7deaff)', padding: '20px', color: '#031b24', fontWeight: '700', fontSize: '18px' }}>
            <div>Feature</div>
            <div style={{ textAlign: 'center' }}>Free</div>
            <div style={{ textAlign: 'center' }}>Premium</div>
          </div>
          {features.map((f, i) => (
            <div key={i} className="ff-float-in ff-magnetic" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0', padding: '20px', borderBottom: i < features.length - 1 ? '1px solid rgba(20, 225, 255, 0.2)' : 'none', transition: 'all 0.3s ease', animationDelay: `${i * 0.15}s` }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(20, 225, 255, 0.15)'; e.currentTarget.style.transform = 'translateX(10px)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)' }}>
              <div style={{ color: '#e6f0ff', fontSize: '16px' }}>{f.name}</div>
              <div style={{ textAlign: 'center', color: typeof f.free === 'boolean' ? (f.free ? '#4caf50' : '#999') : '#14e1ff', fontSize: '16px' }}>
                {typeof f.free === 'boolean' ? (f.free ? '✔' : '✖') : f.free}
              </div>
              <div style={{ textAlign: 'center', color: typeof f.premium === 'boolean' ? (f.premium ? '#4caf50' : '#999') : '#14e1ff', fontSize: '16px' }}>
                {typeof f.premium === 'boolean' ? (f.premium ? '✔' : '✖') : f.premium}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection(){
  const [openIndex, setOpenIndex] = useState(null)
  const faqs = [
    { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
    { q: 'Is there a free trial for Premium?', a: 'We offer a 7-day free trial for Premium plan. No credit card required to start.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and digital wallets for your convenience.' },
    { q: 'Can I cancel my subscription?', a: 'Absolutely. You can cancel anytime from your account settings. No questions asked.' },
    { q: 'Do you offer refunds?', a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with Premium.' },
    { q: 'Is my data secure?', a: 'Your data is encrypted and stored securely. We never share your information with third parties.' }
  ]
  return (
    <section className="ff-section" id="faq" style={{ position: 'relative', background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.6), rgba(10, 14, 39, 0.8))', overflow: 'hidden' }}>
      {[...Array(6)].map((_, i) => <div key={i} className="ff-particle" style={{ position: 'absolute', width: '5px', height: '5px', background: '#ff6b35', borderRadius: '50%', opacity: 0.6, animation: 'floatParticle 12s infinite', animationDelay: `${i * 1.2}s`, right: `${15 + i * 10}%`, top: `${30 + (i % 2) * 40}%`, boxShadow: '0 0 12px #ff6b35' }} />)}
      <div className="ff-container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="ff-title ff-glitch" data-text="Frequently Asked Questions" style={{ textAlign: 'center', color: '#fff', fontSize: '2.5rem', marginBottom: '50px' }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="ff-float-in" style={{ marginBottom: '15px', background: 'linear-gradient(135deg, rgba(20, 225, 255, 0.08), rgba(10, 14, 39, 0.9))', border: '2px solid ' + (openIndex === i ? '#14e1ff' : 'rgba(20, 225, 255, 0.3)'), borderRadius: '12px', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', animationDelay: `${i * 0.12}s`, boxShadow: openIndex === i ? '0 15px 50px rgba(20, 225, 255, 0.4), inset 0 0 20px rgba(20, 225, 255, 0.1)' : '0 5px 20px rgba(0, 0, 0, 0.3)', transform: openIndex === i ? 'scale(1.02)' : 'scale(1)' }}>
              <div onClick={() => setOpenIndex(openIndex === i ? null : i)} className="ff-magnetic" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20, 225, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <h3 style={{ color: '#fff', fontSize: '18px', margin: 0, fontWeight: '600' }}>{faq.q}</h3>
                <span style={{ color: '#14e1ff', fontSize: '24px', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)', textShadow: '0 0 10px #14e1ff' }}>▼</span>
              </div>
              <div style={{ maxHeight: openIndex === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease', opacity: openIndex === i ? 1 : 0 }}>
                <p style={{ padding: '0 20px 20px', color: '#9fb3c8', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicesSpotlights(){
  return (
    <section className="ff-section" id="services-spotlights">
      <div className="ff-container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'24px' }}>
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
