import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components'
import VisitorNavbar from '../components/VisitorNavbar.jsx';
import PromoPopup from '../components/PromoPopup.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { showToast } from '../components/Toast.jsx';
import Clock from '@/components/ui/clock'
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials.jsx'
import PricingCard from '@/components/ui/PricingCard.jsx'
import SwitchBilling from '@/components/ui/SwitchBilling.jsx'
import '../styles/neon.css';
import { useInView, useTilt, animateCounter, animateBars, startBarsLoop } from '../utils/anim.js';
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/pagination'
import { api } from '@/api/client.js';

function WhyTracking() {
  const ref = useRef(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (inView) ref.current.querySelectorAll('.ff-card').forEach((c, i) => { c.classList.add('ff-in'); c.style.transitionDelay = `${i * 120}ms`; });
  }, [inView]);
  const cards = [
    { icon: 'flaticon-002-dumbell', title: 'Train Smarter', text: 'Structure sets, reps, load and rest with clarity. Auto‑calculate training volume and intensity, track PRs and warm‑up ramps, and avoid junk volume.', bullets: ['Volume & intensity', 'Warm‑up ramps', 'PR tracking'] },
    { icon: 'flaticon-033-juice', title: 'Recover Better', text: 'Balance training with sleep, hydration and mobility. Log soreness and HR, get recovery flags and see how rest days impact performance.', bullets: ['Sleep & hydration', 'Recovery flags', 'Mobility focus'] },
    { icon: 'flaticon-014-heart-beat', title: 'Build Consistency', text: 'Turn sessions into streaks and micro‑goals. Gentle reminders, habit chains and weekly targets keep momentum without pressure.', bullets: ['Streaks', 'Micro‑goals', 'Weekly targets'] },
    { icon: 'fa fa-line-chart', title: 'See Progress', text: 'Visualize trends that matter: peak sets, weekly volume, effort zones and exercise balance. Spot plateaus early and adjust with confidence.', bullets: ['Peak sets', 'Effort zones', 'Balance insights'] },
    { icon: 'fa fa-magic', title: 'Plan With AI', text: 'Get goal‑based plans that adapt to your schedule and recovery. FitForge suggests sets, rep ranges and progression so you focus on execution.', bullets: ['Adaptive plans', 'Suggested progressions', 'Goal‑based blocks'] },
    { icon: 'fa fa-cogs', title: 'Technique & Form', text: 'Log tempo, range of motion and coaching cues. Track form ratings per set to spot breakdowns and keep mechanics clean under load.', bullets: ['Tempo/ROM', 'Coaching cues', 'Form ratings'] },
    { icon: 'fa fa-bolt', title: 'Energy & Readiness', text: 'Capture RPE, sleep and HRV to compute a daily readiness score. Use intensity suggestions to train smart—not just hard.', bullets: ['RPE', 'HRV readiness', 'Intensity guide'] },
    { icon: 'fa fa-cutlery', title: 'Nutrition Sync', text: 'Align calories and macros with training blocks. See pre/post‑workout timing, hydration and recovery foods that boost performance.', bullets: ['Macros & timing', 'Hydration', 'Recovery foods'] },
    { icon: 'fa fa-flag-checkered', title: 'Goal Tracking', text: 'Set milestones and periodization blocks. Weekly reviews highlight wins, gaps and the next best step toward your target.', bullets: ['Milestones', 'Periodization', 'Weekly reviews'] },
    { icon: 'fa fa-bell-o', title: 'Smart Reminders', text: 'Low‑friction nudges, calendar sync and micro‑goals keep you moving. FitForge reduces decision fatigue so consistency becomes natural.', bullets: ['Calendar sync', 'Nudges', 'Decision ease'] }
  ];
  return (
    <section className="ff-section ff-particles" id="why">
      <div className="ff-container" ref={ref}>
        <h2 className="ff-title">Why Fitness Tracking Matters</h2>
        <p className="ff-sub">A clear view of training turns effort into intelligent progress.</p>
        <div className="ff-cards-wrap">
          <div className="ff-cards">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            allowTouchMove={true}
            simulateTouch={true}
            loop={true}
            navigation={false}
            pagination={{ clickable: true }}
            modules={[EffectCards, Pagination]}
            className="Carousal_002"
          >
            {cards.map((c, idx) => (
              <SwiperSlide key={idx} className="rounded-3xl">
                <div>
                  <div className="ff-icon"><i className={c.icon}></i></div>
                  <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>{c.title}</h4>
                  <p style={{ color: 'var(--ff-muted)' }}>{c.text}</p>
                  <div className="ff-bullets">
                    {c.bullets?.map((b, bi) => (
                      <span key={bi} className="ff-pill">{b}</span>
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}


function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <section className="ff-section" id="how">
      <div className="ff-container" ref={ref}>
        <h2 className="ff-title">How It Works</h2>
        <p className="ff-sub">Log Workouts → Smart Insights → Visual Progress</p>
        <div className="ff-grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
          <div>
            <div className="ff-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="ff-card ff-in">
                <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Log Workouts</h4>
                <p style={{ color: 'var(--ff-muted)' }}>Record sets, reps, load and rest with clarity.</p>
                <img src="/img/home/push%20up.png" alt="Push Up" className="ff-card-img" />
              </div>
              <div className="ff-arrow"></div>
              <div className="ff-card ff-in">
                <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Smart Insights</h4>
                <p style={{ color: 'var(--ff-muted)' }}>Auto trends highlight intensity, volume and balance.</p>
                <img src="/img/home/Smart%20Insights.png" alt="Smart Insights" className="ff-card-img" />
              </div>
              <div className="ff-arrow" style={{ gridColumn: '2 / span 1' }}></div>
              <div className="ff-card ff-in" style={{ gridColumn: '3 / span 1' }}>
                <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Visual Progress</h4>
                <p style={{ color: 'var(--ff-muted)' }}>Charts and streaks keep motivation high.</p>
                <img src="/img/home/Visual%20Progress.png" alt="Visual Progress" className="ff-card-img" />
              </div>
            </div>
          </div>
          <div>
            <div className="ff-panel ff-float-in" style={{ padding: '24px' }}>
              <LiveBars count={12} />
              <div className="ff-metrics" style={{ marginTop: '16px' }}>
                <div className="ff-metric ff-ring"><h5 style={{ color: 'var(--ff-text)' }}>Volume</h5><div style={{ color: 'var(--ff-neon)', fontSize: '24px' }}>+12%</div></div>
                <div className="ff-metric ff-ring"><h5 style={{ color: 'var(--ff-text)' }}>Consistency</h5><div style={{ color: 'var(--ff-neon)', fontSize: '24px' }}>21 days</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardShowcase() {
  return (
    <section className="ff-section ff-particles" id="showcase">
      <div className="ff-container">
        <h2 className="ff-title">Dashboard Preview Showcase</h2>
        <p className="ff-sub">Live metrics, trends and an immersive dashboard feel.</p>
        <div className="ff-dash-grid">
          <div className="ff-dash-left">
            <div className="ff-panel ff-float-in">
              <h5 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Live Weekly Snapshot</h5>
              <LiveBars count={16} />
              <div className="ff-metrics" style={{ marginTop:'16px' }}>
                <div className="ff-metric"><div style={{ color:'var(--ff-muted)' }}>Active Sessions</div><div style={{ color:'var(--ff-neon)', fontSize:'22px' }}>+5/wk</div></div>
                <div className="ff-metric"><div style={{ color:'var(--ff-muted)' }}>Weekly Volume</div><div style={{ color:'var(--ff-neon)', fontSize:'22px' }}>+12%</div></div>
                <div className="ff-metric"><div style={{ color:'var(--ff-muted)' }}>Consistency</div><div style={{ color:'var(--ff-neon)', fontSize:'22px' }}>21 days</div></div>
              </div>
            </div>
          </div>
          <div className="ff-video-float ff-float-in">
            <video autoPlay loop muted playsInline preload="metadata" className="ff-video-fit">
              <source src="/video/Dashboard%20for%20home.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveBars({ count = 14 }){
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const stop = startBarsLoop(ref.current, 68, 1400)
    return stop
  }, [])
  return (
    <div className="ff-mini-graph" ref={ref}>
      {Array.from({ length: count }).map((_, i) => <span key={i}></span>)}
    </div>
  )
}

function ProgressInsights() {
  const ref = useRef(null);
  const inView = useInView(ref);
  useEffect(() => { if (inView) ref.current.querySelectorAll('.ff-card').forEach((c, i) => { c.classList.add('ff-in'); c.style.transitionDelay = `${i * 120}ms`; }); }, [inView]);
  const items = [
    { title: 'Weekly Summary', icon: 'fa fa-calendar-check-o' },
    { title: 'Habit Tracking', icon: 'fa fa-check' },
    { title: 'Active Minutes', icon: 'fa fa-bolt' },
    { title: 'Hydration & Sleep', icon: 'fa fa-tint' }
  ];
  return (
    <section className="ff-section" id="insights">
      <div className="ff-container" ref={ref}>
        <h2 className="ff-title">Progress Insights</h2>
        <div className="ff-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {items.map((it, idx) => (
            <div key={idx} className="ff-card">
              <div className="ff-icon"><i className={it.icon}></i></div>
              <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>{it.title}</h4>
              <div style={{ marginTop: '12px' }}>
                <LiveBars count={8} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StreaksDiscipline() {
  const ref = useRef(null);
  return (
    <section className="ff-section ff-particles" id="streaks">
      <div className="ff-container" ref={ref}>
        <div className="ff-grid" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
          <div className="ff-clock-wrap ff-float-in" style={{ width:'100%', display:'flex', justifyContent:'center' }}>
            <div style={{ width:'min(24rem, 80vw)' }}>
              <Clock />
            </div>
          </div>
          <div className="ff-panel ff-float-in" style={{ padding: '26px' }}>
            <h2 className="ff-title">Time Is Slipping Away</h2>
            <p className="ff-sub">Every day you wait, you lose momentum. Start your fitness journey now — don’t let regret be your future.</p>
            <Link to="/register" className="ff-btn" onClick={() => {
              api('/track/click', { method: 'POST' });
            }}>Register Now</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransformationSplit() {
  const data = [
    {
      description: 'ScrollX-UI has completely transformed how I build interfaces. The animations are silky smooth, and the components are modular and responsive.',
      image: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Isabelle Carlos',
      handle: '@isabellecarlos'
    },
    {
      description: 'I love how ScrollX-UI makes my projects look professional with minimal effort. The documentation is clear and the community is super helpful.',
      image: 'https://plus.unsplash.com/premium_photo-1692340973636-6f2ff926af39?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Lana Akash',
      handle: '@lanaakash'
    },
    {
      description: 'The smooth scrolling animations and intuitive components in ScrollX-UI save me hours of development time!',
      image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Liam O’Connor',
      handle: '@liamoc'
    },
    {
      description: 'Using ScrollX-UI feels like magic — it’s so easy to create beautiful, interactive UIs without writing complex code.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Isabella Mendes',
      handle: '@isamendes'
    },
    {
      description: 'ScrollX-UI’s open-source nature means I can customize components exactly how I want them — plus, the performance is outstanding.',
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Meera Patel',
      handle: '@meerapatel'
    },
    {
      description: 'I recommend ScrollX-UI to everyone looking for a powerful, flexible UI library with stunning animation support.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      name: 'Emily Chen',
      handle: '@emchen'
    },
  ]
  return (
    <section className="ff-section" id="transform">
      <div className="ff-container">
        <h2 className="ff-title">What People Say</h2>
        <p className="ff-sub">Real voices, smooth motion, modern feel.</p>
        <div className="ff-panel ff-float-in" style={{ padding: '16px' }}>
          <AnimatedTestimonials data={data} />
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref);
  function Typewriter({ text = '', speed = 24, className = '' }){
    const [i, setI] = useState(0)
    useEffect(() => { setI(0) }, [text])
    useEffect(() => { const id = setInterval(() => setI(v => Math.min(v + 1, text.length)), 1000 / speed); return () => clearInterval(id) }, [text, speed])
    return <div className={className}>{text.slice(0, i)}<span className="ff-caret">|</span></div>
  }
  const heading = 'Trust Yourself'
  const slogan = 'Every step you take builds the future you want.'
  const paragraph = "You don't need a perfect plan — you just need to start. Small, consistent actions shape real progress, and every workout you track becomes proof of what you're capable of. Commit today, even if it’s not easy. Your future self will be grateful."
  return (
    <section className="ff-section ff-particles" id="trust">
      <div className="ff-container" ref={ref}>
        <h2 className="ff-title" style={{ textAlign:'center' }}>{heading}</h2>
        <p className="ff-sub" style={{ textAlign:'center' }}>{slogan}</p>
        <div className="ff-trust-full">
          <video autoPlay loop muted playsInline preload="metadata" className="ff-trust-video">
            <source src="/video/I%20will%20do.mp4" type="video/mp4" />
          </video>
          <div className="ff-trust-overlay">
            <Typewriter text={paragraph} speed={28} className="ff-type" />
            <div style={{ marginTop:'18px' }}>
              <Link to="/register" className="ff-btn" onClick={() => {
                api('/track/click', { method: 'POST' });
              }}>Start Now</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingPlans({ setAuthModalOpen }) {
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
      setAuthModalOpen(true)
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
        <h2 className="ff-title" style={{ textAlign:'center' }}>Pricing Plans</h2>
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
  );
}


function FinalCTA() {
  return (
    <section className="ff-section ff-particles" id="cta">
      <div className="ff-container">
        <h2 className="ff-title">Ready To Train With Intelligence?</h2>
        <p className="ff-sub">Own your progress with neon-clear tracking and disciplined streaks.</p>
        <a href="#contact" className="ff-btn" onClick={() => {
          api('/track/click', { method: 'POST' });
        }}>Start Tracking</a>
      </div>
    </section>
  );
}

function ThanksSection(){
  return (
    <section className="ff-section ff-particles" id="thanks">
      <div className="ff-container">
        <h2 className="ff-title" style={{ textAlign:'center' }}>Thanks for Visiting FitForge</h2>
        <div className="ff-thanks-grid">
          <div className="ff-panel ff-float-in" style={{ padding:'22px' }}>
            <p className="ff-sub" style={{ fontSize:'16px' }}>
              We appreciate you taking the time to explore what FitForge can offer. Every meaningful transformation begins with a single decision — the decision to learn, to understand, and to move forward. By visiting today, you’ve already taken that first step toward a stronger, more disciplined version of yourself. Whether you’re ready to start now or still figuring things out, know this: your progress matters, your effort counts, and we’re here to help you turn your goals into results whenever you’re ready.
            </p>
          </div>
          <div className="ff-float-in">
            <img src="/img/home/dumbells.png" alt="Dumbells" className="ff-thanks-img" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  useEffect(() => {
    const $ = window.jQuery;
    const initializePlugins = () => {
      if (typeof window.jQuery === 'undefined') {
        setTimeout(initializePlugins, 100);
        return;
      }

      const $ = window.jQuery;

      // Sticky scroll removed per request; using original template behavior

      // Set background images first
      $('.set-bg').each(function() {
        const bg = $(this).data('setbg');
        if (bg) {
          $(this).css('background-image', 'url(' + bg + ')');
        }
      });

      // Initialize Owl Carousel for hero section
      if ($('.hs-slider').length && typeof $.fn.owlCarousel !== 'undefined') {
        $('.hs-slider').owlCarousel({
          loop: true,
          margin: 0,
          items: 1,
          dots: false,
          animateOut: 'fadeOut',
          animateIn: 'fadeIn',
          active: true,
          smartSpeed: 1000,
          autoplay: true
        });
      }

      // Initialize Owl Carousel for team section
      if ($('.ts-slider').length && typeof $.fn.owlCarousel !== 'undefined') {
        $('.ts-slider').owlCarousel({
          loop: true,
          margin: 30,
          items: 3,
          dots: true,
          smartSpeed: 1200,
          autoplay: true,
          responsive: {
            320: {
              items: 1
            },
            768: {
              items: 2
            },
            992: {
              items: 3
            }
          }
        });
      }

      // Initialize Masonry for gallery
      if ($('.gallery').length && typeof $.fn.masonry !== 'undefined') {
        $('.gallery').masonry({
          itemSelector: '.gs-item',
          columnWidth: '.grid-sizer'
        });
      }

      // Initialize Magnific Popup
      if ($('.image-popup').length && typeof $.fn.magnificPopup !== 'undefined') {
        $('.image-popup').magnificPopup({
          type: 'image',
          gallery: {
            enabled: true
          }
        });
      }

      // Initialize Slicknav for mobile menu
      if ($('.mobile-menu').length && typeof $.fn.slicknav !== 'undefined') {
        $('.mobile-menu').slicknav({
          prependTo: '#mobile-menu-wrap',
          closedSymbol: '<i class="fa fa-angle-right"></i>',
          openedSymbol: '<i class="fa fa-angle-down"></i>'
        });
      }

      // Search switch
      $('.search-switch').off('click').on('click', function() {
        $('.search-model').fadeIn(400);
      });
      $('.search-close-switch').off('click').on('click', function() {
        $('.search-model').fadeOut(400, function() {
          $('.search-model-form input').val('');
        });
      });

      // Canvas menu
      $('.canvas-open').off('click').on('click', function() {
        $('.offcanvas-menu-wrapper').addClass('show-offcanvas-menu-wrapper');
        $('.offcanvas-menu-overlay').addClass('active');
      });

      $('.canvas-close, .offcanvas-menu-overlay').off('click').on('click', function() {
        $('.offcanvas-menu-wrapper').removeClass('show-offcanvas-menu-wrapper');
        $('.offcanvas-menu-overlay').removeClass('active');
      });

      
    };

    initializePlugins();
    return () => {
      if ($ && typeof $.fn.owlCarousel !== 'undefined') {
        if ($('.hs-slider').length) {
          try { $('.hs-slider').trigger('destroy.owl.carousel'); } catch (_) {}
          $('.hs-slider').removeClass('owl-carousel owl-loaded');
          const outer = $('.hs-slider').find('.owl-stage-outer');
          if (outer.length) outer.children().unwrap();
        }
        if ($('.ts-slider').length) {
          try { $('.ts-slider').trigger('destroy.owl.carousel'); } catch (_) {}
          $('.ts-slider').removeClass('owl-carousel owl-loaded');
          const outer2 = $('.ts-slider').find('.owl-stage-outer');
          if (outer2.length) outer2.children().unwrap();
        }
      }
      if ($) {
        $('.search-switch').off('click');
        $('.search-close-switch').off('click');
        $('.canvas-open').off('click');
        $('.canvas-close, .offcanvas-menu-overlay').off('click');
      }
    }
  }, []);

  return (
    <>
      <PromoPopup />
      <VisitorNavbar authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />

      <section className="hero-section" id="home">
        <div className="hs-item">
          <video autoPlay loop muted playsInline preload="metadata" className="hero-video">
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay">
            <div className="container">
              <div className="row">
                <div className="col-lg-6">
                  <div className="hi-text">
                    <span>Shape your body</span>
                    <h1>Be <strong>strong</strong> traning hard</h1>
                    <a href="#contact" className="primary-btn" onClick={() => {
                      api('/track/click', { method: 'POST' });
                    }}>Get info</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PurposeIntro />

      <TrustCarousel />

      <WhyTracking />
      <HowItWorks />
      <DashboardShowcase />

      <ProgressInsights />
      <StreaksDiscipline />

      <TransformationSplit />

      <SocialProof />
      <PricingPlans setAuthModalOpen={setAuthModalOpen} />

      <ThanksSection />

      <FinalCTA />

      {/* Get In Touch Section Begin */}
      <div className="gettouch-section" id="contact">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="gt-text">
                <i className="fa fa-map-marker"></i>
                <p>333 Middle Winchendon Rd, Rindge,<br/> NH 03461</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="gt-text">
                <i className="fa fa-mobile"></i>
                <ul>
                  <li>125-711-811</li>
                  <li>125-668-886</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="gt-text email">
                <i className="fa fa-envelope"></i>
                <p>Support.gymcenter@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Get In Touch Section End */}

      {/* Footer Section Begin */}
      <section className="footer-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="fs-about">
                <div className="fa-logo">
                  <a href="#home" className="logo-text">
                    <span className="logo-icon-left flaticon-002-dumbell"></span>
                    <span className="logo-white">Fit</span><span className="logo-orange">Forge</span>
                    <span className="logo-icon-right flaticon-014-heart-beat"></span>
                  </a>
                </div>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                  labore dolore magna aliqua endisse ultrices gravida lorem.</p>
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
                  <li><a href="#about">About</a></li>
                  <li><a href="#blog">Blog</a></li>
                  <li><a href="#classes">Classes</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="fs-widget">
                <h4>Support</h4>
                <ul>
                  <li><a href="#login">Login</a></li>
                  <li><a href="#account">My account</a></li>
                  <li><a href="#subscribe">Subscribe</a></li>
                  <li><a href="#contact">Contact</a></li>
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
      {/* Footer Section End */}

      {/* Search model Begin */}
      <div className="search-model">
        <div className="h-100 d-flex align-items-center justify-content-center">
          <div className="search-close-switch">+</div>
          <form className="search-model-form">
            <input type="text" id="search-input" placeholder="Search here....." />
          </form>
        </div>
      </div>
      {/* Search model end */}
    </>
  );
}

export default Home;

function PurposeIntro() {
  const ref = useRef(null);
  const inView = useInView(ref);
  useEffect(() => { if (inView) { const el = ref.current; el.classList.add('ff-in'); } }, [inView]);
  return (
    <section className="ff-section" id="purpose" style={{ marginTop: '-80px', position: 'relative', zIndex: 2 }}>
      <div className="ff-container" ref={ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '24px' }}>
        <div>
          <h2 className="ff-title">What is Fitforge?</h2>
          <p className="ff-sub">Fitness tracking, planning, and insights in one place.</p>
          <div className="ff-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="ff-card ff-in">
              <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Exercise Plans</h4>
              <p style={{ color: 'var(--ff-muted)' }}>Create custom workout plans with sets, reps, and load.</p>
            </div>
            <div className="ff-card ff-in">
              <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>AI Generated Plans</h4>
              <p style={{ color: 'var(--ff-muted)' }}>Get smart, goal-based plans powered by AI.</p>
            </div>
            <div className="ff-card ff-in">
              <h4 className="ff-underline" style={{ color: 'var(--ff-text)' }}>Progress Tracking</h4>
              <p style={{ color: 'var(--ff-muted)' }}>See intensity, volume, streaks, and trends visually.</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <img src="/img/home/fitness%20tracking.png" alt="Fitness tracking" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,.35)', transform: 'translateY(-40px)' }} />
        </div>
      </div>
    </section>
  );
}

const StyledRing = styled.div`
  @keyframes autoRun3d { from { transform: perspective(1200px) rotateY(-360deg);} to { transform: perspective(1200px) rotateY(0deg);} }
  @keyframes animateBrightness { 10%{ filter: brightness(1);} 50%{ filter: brightness(.35);} 90%{ filter: brightness(1);} }
  .card-3d { position: relative; width: min(94vw, 1100px); height: clamp(320px, 44vw, 460px); transform-style: preserve-3d; transform: perspective(1400px); animation: autoRun3d 48s linear infinite; will-change: transform; margin: 0 auto; --ring-depth: clamp(320px, 38vw, 520px); --card-w: clamp(200px, 20vw, 280px); --card-min-h: clamp(140px, 18vw, 220px); }
  .card-3d:hover { animation-play-state: paused !important; }
  .card-3d > div { position:absolute; width: var(--card-w); min-height: var(--card-min-h); height: auto; top:50%; left:50%; transform-origin:center; display:flex; flex-direction:column; gap:10px; padding:20px; border-radius:18px; background: linear-gradient(180deg, rgba(20,225,255,.16), rgba(125,234,255,.08)); border:1px solid rgba(91,225,255,.45); box-shadow: 0 30px 70px rgba(0,200,255,.14), inset 0 0 18px rgba(0,200,255,.12); backdrop-filter: blur(12px); color: var(--ff-text); animation: animateBrightness 48s linear infinite; will-change: transform, filter; overflow:hidden; }
  .card-3d > div:hover { animation-play-state: paused !important; }
  .card-3d > div h4 { font-family:'Oswald', sans-serif; letter-spacing:.5px; text-transform:uppercase; font-size: clamp(13px, 2vw, 16px); color: var(--ff-neon); }
  .card-3d > div p { color: var(--ff-muted); font-size: clamp(12px, 1.6vw, 14px); line-height: 1.5; word-break: break-word; hyphens: auto; }
  .card-3d > div:nth-child(1){ transform: translate(-50%,-50%) rotateY(0deg) translateZ(var(--ring-depth)); animation-delay:-0s; }
  .card-3d > div:nth-child(2){ transform: translate(-50%,-50%) rotateY(36deg) translateZ(var(--ring-depth)); animation-delay:-4.8s; }
  .card-3d > div:nth-child(3){ transform: translate(-50%,-50%) rotateY(72deg) translateZ(var(--ring-depth)); animation-delay:-9.6s; }
  .card-3d > div:nth-child(4){ transform: translate(-50%,-50%) rotateY(108deg) translateZ(var(--ring-depth)); animation-delay:-14.4s; }
  .card-3d > div:nth-child(5){ transform: translate(-50%,-50%) rotateY(144deg) translateZ(var(--ring-depth)); animation-delay:-19.2s; }
  .card-3d > div:nth-child(6){ transform: translate(-50%,-50%) rotateY(180deg) translateZ(var(--ring-depth)); animation-delay:-24s; }
  .card-3d > div:nth-child(7){ transform: translate(-50%,-50%) rotateY(216deg) translateZ(var(--ring-depth)); animation-delay:-28.8s; }
  .card-3d > div:nth-child(8){ transform: translate(-50%,-50%) rotateY(252deg) translateZ(var(--ring-depth)); animation-delay:-33.6s; }
  .card-3d > div:nth-child(9){ transform: translate(-50%,-50%) rotateY(288deg) translateZ(var(--ring-depth)); animation-delay:-38.4s; }
  .card-3d > div:nth-child(10){ transform: translate(-50%,-50%) rotateY(324deg) translateZ(var(--ring-depth)); animation-delay:-43.2s; }
  @media (max-width: 991px){ .card-3d { --ring-depth: clamp(220px, 36vw, 380px); --card-w: clamp(180px, 36vw, 240px); } }
  @media (max-width: 640px){
    .card-3d { animation: none; transform: none; height: auto; display: flex; gap: 16px; padding: 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
    .card-3d > div { position: relative; transform: none !important; flex: 0 0 85vw; min-width: 85vw; height: auto; margin: 8px 0; scroll-snap-align: center; }
  }
`

function TrustCarousel(){
  const points = [
    { t: 'Data You Can Rely On', d: 'FitForge doesn’t guess — it measures. Your workouts, calories, habits, and trends are tracked with accuracy so you always know exactly where you stand and what’s improving.' },
    { t: 'Insights That Improve Results', d: 'Most apps show pretty graphs. FitForge shows patterns that matter — performance drops, peak energy times, strongest exercises, and weak habits — so every decision pushes progress forward.' },
    { t: 'Built for Consistency, Not Excuses', d: 'Real results come from showing up. Streaks, reminders, micro-goals, and a discipline system keep you moving even on low-motivation days.' },
    { t: 'Personalized to Your Reality', d: 'No generic plans. FitForge adapts to your body type, routine, lifestyle, and goals — beginner or advanced.' },
    { t: 'Transparent Progress, Not Illusion', d: 'Photo comparisons, weekly analytics, and performance stats make improvements visible — so you never question whether your effort is paying off.' },
    { t: 'Designed for Real People, Not Fitness Models', d: 'Busy schedule? Starting from zero? Recovering from burnout? Built for everyday people who want real, sustainable progress.' },
    { t: 'One Smart Place For All Your Fitness Data', d: 'Workouts, nutrition, steps, habits, mood — everything lives in one clean dashboard.' },
    { t: 'Science, Discipline, Real-World Logic', d: 'Inspired by proven training principles, behavioral psychology, and habit-building frameworks — not gimmicks.' },
    { t: 'Your Data, Your Control', d: 'No hidden agenda. Your fitness data stays private and fully in your control for long-term trust.' },
    { t: 'Accountability Without Pressure', d: 'Gentle reminders, clear milestones, and realistic goals help you progress steadily without burnout.' }
  ]
  return (
    <section className="ff-section ff-particles" id="trust">
      <div className="ff-container">
        <h2 className="ff-title">Why Trust FitForge?</h2>
        <p className="ff-sub">Real results, not noise.</p>
        <StyledRing>
          <div className="card-3d">
            {points.map((p, i) => (
              <div key={i}>
                <h4 className="ff-underline">{p.t}</h4>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </StyledRing>
      </div>
    </section>
  )
}

