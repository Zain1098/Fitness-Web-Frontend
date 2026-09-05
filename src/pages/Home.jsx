import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import VisitorNavbar from '../components/VisitorNavbar.jsx'
import AuthModal from '../components/AuthModal.jsx'
import PricingModal from '../components/PricingModal.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import Card3D from '../components/ui/Card3D.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Dumbbell,
  Activity,
  Flame,
  Heart,
  Play,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Star,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [activeYogaTab, setActiveYogaTab] = useState('all')
  const [annualBilling, setAnnualBilling] = useState(false)

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return true
        }
        return false
      }

      if (!tryScroll()) {
        const t1 = setTimeout(tryScroll, 120)
        const t2 = setTimeout(tryScroll, 350)
        const t3 = setTimeout(tryScroll, 700)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
          clearTimeout(t3)
        }
      }
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (user) {
      if (user.onboarding_completed) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    }
  }, [user, navigate])

  const openAuth = () => setAuthModalOpen(true)

  const yogaStyles = [
    {
      title: 'Muscle Stretch',
      category: 'Mobility',
      duration: '20 min',
      level: 'All Levels',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      badge: 'Recovery'
    },
    {
      title: 'Relaxation Stretch',
      category: 'Mind & Body',
      duration: '25 min',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      badge: 'Calm'
    },
    {
      title: 'Balance Booster',
      category: 'Core Stability',
      duration: '30 min',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      badge: 'Balance'
    },
    {
      title: 'Flexibility Enhancer',
      category: 'Full Stretch',
      duration: '35 min',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1552196563-552368174c86?auto=format&fit=crop&w=600&q=80',
      badge: 'Flex'
    },
    {
      title: 'Full-Body Flow',
      category: 'Vinyasa',
      duration: '45 min',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80',
      badge: 'Full Body'
    },
    {
      title: 'Strength Flow',
      category: 'Power Yoga',
      duration: '40 min',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      badge: 'Power'
    }
  ]

  const events = [
    {
      id: '01',
      title: 'FitForge Wellness & Vision Expo',
      date: 'Full-day event • Oct 24, 2026',
      location: 'Main Arena & Live Stream',
      tag: 'Global Event'
    },
    {
      id: '02',
      title: 'Mind Balance & Mobility Retreat',
      date: 'Weekend retreat • Nov 12, 2026',
      location: 'Zen Studio & Digital Hub',
      tag: 'Workshop'
    },
    {
      id: '03',
      title: 'Functional Hypertrophy Training Camp',
      date: '3-Day Masterclass • Dec 05, 2026',
      location: 'Olympic Training Center',
      tag: 'Advanced'
    },
    {
      id: '04',
      title: 'Precision Meal Planning & Bio-Nutrition',
      date: 'Online Seminar • Dec 18, 2026',
      location: 'Interactive Webinar',
      tag: 'Nutrition'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <ScrollToTop />
      <VisitorNavbar authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />

      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-lime-200/40 via-cyan-100/30 to-purple-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-800 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>AI-Powered Biomechanics & Posture Vision</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-['Outfit'] leading-[1.08]">
              Perfect Fitness Path <br />
              With <span className="text-slate-900 relative">
                FitForge
                <span className="absolute left-0 -bottom-1 w-full h-2.5 bg-[#D4F63D]/60 -z-10 rounded-full" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Unlock your full potential with tailored training programs, real-time AI computer vision posture feedback, and precision nutrition plans all crafted to keep you consistent.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={openAuth}
                className="group px-7 py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-sm transition-all shadow-[0_8px_25px_rgba(212,246,61,0.4)] hover:shadow-[0_10px_30px_rgba(212,246,61,0.55)] hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Key Metrics Counters */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200/70 w-full max-w-md">
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-950">500k+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Personalized programs delivered</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-950">10k+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Active members achieving results</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with 3D Perspective Tilt & Pose Keypoints */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <Card3D maxTilt={8} className="w-full max-w-lg">
              {/* Main Stage Frame */}
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-white/60 bg-gradient-to-b from-slate-100 to-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=85"
                  alt="Fitness Athlete Pose"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />

                {/* Glowing Pose Vision Keypoints Overlaid on Joints */}
                <div className="absolute top-[32%] left-[46%] w-4 h-4 rounded-full bg-white border-2 border-[#10B981] shadow-lg keypoint-dot pointer-events-none" />
                <div className="absolute top-[44%] left-[36%] w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 shadow-md keypoint-dot pointer-events-none" />
                <div className="absolute top-[42%] left-[58%] w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 shadow-md keypoint-dot pointer-events-none" />
                <div className="absolute top-[58%] left-[48%] w-4 h-4 rounded-full bg-white border-2 border-[#10B981] shadow-lg keypoint-dot pointer-events-none" />
                <div className="absolute top-[72%] left-[38%] w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D4F63D] shadow-md keypoint-dot pointer-events-none" />
                <div className="absolute top-[70%] left-[62%] w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D4F63D] shadow-md keypoint-dot pointer-events-none" />

                {/* Connected Vision Overlay Subtle Grid */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Glass Metric Card 1: Activity & Accuracy Gauges (Top Left) */}
              <div
                style={{ transform: 'translateZ(40px)' }}
                className="absolute -top-4 -left-4 sm:-left-8 glass-panel rounded-3xl p-4 shadow-xl border border-white/80 animate-soft-float"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Accuracy</span>
                    <div className="text-xl font-black font-['Outfit'] text-slate-900">96.8%</div>
                  </div>
                </div>
              </div>

              {/* Floating Glass Metric Card 2: Stretch & Coaching Status (Top Right) */}
              <div
                style={{ transform: 'translateZ(35px)' }}
                className="absolute top-10 -right-4 sm:-right-6 glass-panel rounded-3xl p-3.5 shadow-xl border border-white/80 animate-soft-float-delayed"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#D4F63D] text-slate-950 text-[11px] font-bold">
                    Pose Check
                  </span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-800">
                  Spine Alignment: <span className="text-emerald-600 font-bold">Optimal</span>
                </div>
              </div>

              {/* Floating Card 3: Community & Coach Feedback (Bottom) */}
              <div
                style={{ transform: 'translateZ(45px)' }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[88%] glass-panel rounded-2xl p-3.5 shadow-2xl border border-white/90 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Member" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Member" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Member" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">5.8k+ Athletes</div>
                    <div className="text-[10px] text-slate-500">Live workout sessions</div>
                  </div>
                </div>
                <button
                  onClick={openAuth}
                  className="px-3.5 py-1.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Join</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* ----------------- 2. HOW IT WORKS SECTION (Matching Reference) ----------------- */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>HOW FITFORGE WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
            Three Steps to Peak Performance
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Empowering you with AI computer vision and bio-analytics to boost fitness output, enhance sleep balance, and protect joint longevity.
          </p>
        </div>

        {/* 3 Steps Cards Wrapped in Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Biomechanics & Pose Vision */}
          <Card3D maxTilt={12}>
            <div className="glass-panel rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
              <div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80"
                    alt="Athletic Pose Vision"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1/2 left-1/3 w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 keypoint-dot shadow-lg" />
                  <div className="absolute bottom-1/3 right-1/3 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#10B981] keypoint-dot shadow-lg" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    Step 01
                  </span>
                </div>

                <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">
                  AI Vision Calibration
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Position your phone or laptop camera. MediaPipe neural vision maps 33 skeletal keypoints in real time with zero wearables required.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 mt-6">
                <span>Real-time Kinematics</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              </div>
            </div>
          </Card3D>

          {/* Card 2: Form Check & Rep Counting */}
          <Card3D maxTilt={12}>
            <div className="glass-panel rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
              <div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"
                    alt="Posture Feedback"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    Step 02
                  </span>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#D4F63D] text-slate-950 text-[10px] font-extrabold">
                    96% Accuracy
                  </div>
                </div>

                <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">
                  Live Posture Feedback
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Our audio-visual coach gives instant cues on joint angles, back alignment, and squat depth, while counting valid reps automatically.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 mt-6">
                <span>Zero Cheated Reps</span>
                <span className="w-2 h-2 rounded-full bg-[#D4F63D]" />
              </div>
            </div>
          </Card3D>

          {/* Card 3: Bio-Nutrition & Recovery Sync */}
          <Card3D maxTilt={12}>
            <div className="glass-panel rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
              <div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
                    alt="Recovery and Nutrition"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    Step 03
                  </span>
                </div>

                <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">
                  Bio-Nutrition & Recovery
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Sync completed training volume with your daily calorie burn, hydration targets, and sleep metrics for full muscle restoration.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 mt-6">
                <span>Continuous Adaptation</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* ----------------- 3. NUTRITION & BALANCED MEALS ----------------- */}
      <section id="nutrition" className="py-20 bg-gradient-to-b from-[#F8FAFC] to-slate-100/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Visual: Balanced Meal & Calorie Rings Wrapped in Card3D */}
            <div className="lg:col-span-6 relative flex justify-center order-2 lg:order-1">
              <Card3D maxTilt={10} className="w-full max-w-md">
                <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border border-white/80 bg-white p-3">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                    alt="Balanced Meal"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />

                  {/* Floating Calorie Widget */}
                  <div
                    style={{ transform: 'translateZ(30px)' }}
                    className="absolute top-6 right-6 glass-panel rounded-2xl p-3 shadow-lg border border-white/90"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-bold text-slate-600">Daily Calories</span>
                      <span className="text-xs font-extrabold text-slate-900">2,040 / 2,350</span>
                    </div>
                    <div className="w-36 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full w-[86%]" />
                    </div>
                  </div>

                  {/* Floating Macros Breakdown */}
                  <div
                    style={{ transform: 'translateZ(40px)' }}
                    className="absolute bottom-6 left-6 right-6 glass-panel rounded-2xl p-3 shadow-lg border border-white/90 flex justify-between text-center"
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Protein</div>
                      <div className="text-sm font-extrabold text-slate-900 font-['Outfit']">164g</div>
                    </div>
                    <div className="w-[1px] bg-slate-200" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Carbs</div>
                      <div className="text-sm font-extrabold text-slate-900 font-['Outfit']">269g</div>
                    </div>
                    <div className="w-[1px] bg-slate-200" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Healthy Fats</div>
                      <div className="text-sm font-extrabold text-slate-900 font-['Outfit']">65g</div>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Right Text: Nutrition Explanation */}
            <div className="lg:col-span-6 flex flex-col items-start space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Precision Nutrition Architecture</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
                Fit your body with <br />
                <span className="text-slate-900 underline decoration-[#D4F63D] decoration-4 underline-offset-4">
                  balanced meals
                </span>
              </h2>

              <p className="text-slate-600 text-base leading-relaxed">
                With tailored options for every dietary preference — including high protein, vegan, keto, and Mediterranean — our bio-nutrition engine calculates your micro and macro targets automatically based on your daily training expenditure.
              </p>

              {/* Diet Tags */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {['High Protein', 'Vegan & Vegetarian', 'Keto & Low Carb', 'Mediterranean', 'Gluten Free'].map((diet) => (
                  <span
                    key={diet}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/80 shadow-sm text-slate-800"
                  >
                    {diet}
                  </span>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={openAuth}
                  className="px-7 py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-sm transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Build Your Meal Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 3. WORKOUT & YOGA STYLES ----------------- */}
      <section id="workouts" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Versatile Movement Library</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit'] text-slate-950">
            Find Your Perfect Style
          </h2>
          <p className="text-slate-600 text-base">
            Explore diverse discipline modalities designed for functional strength, joint mobility, athletic recovery, and posture alignment.
          </p>
        </div>

        {/* 6 Grid Cards Matching Reference Style Wrapped in Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yogaStyles.map((item, idx) => (
            <Card3D key={idx} maxTilt={10} className="h-full">
              <div className="group relative rounded-3xl overflow-hidden glass-panel border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full justify-between">
                {/* Image Frame */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-900">
                    {item.badge}
                  </span>
                  <span className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-medium text-white">
                    {item.duration}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.category}</div>
                    <h3 className="text-xl font-bold font-['Outfit'] text-slate-950 mt-1">{item.title}</h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{item.level}</span>
                    <button
                      onClick={openAuth}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 group-hover:bg-[#D4F63D] text-white group-hover:text-slate-950 text-xs font-black transition-all shadow-sm group-hover:shadow-[0_4px_12px_rgba(212,246,61,0.35)]"
                    >
                      <span>Start Session</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* ----------------- 4. WORKSHOPS & EVENT SCHEDULE ----------------- */}
      <section className="py-20 bg-slate-100/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Schedules & Camps</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-950 mt-1">
                Upcoming Community Events
              </h2>
            </div>
            <button
              onClick={openAuth}
              className="self-start md:self-auto text-xs font-bold px-4 py-2 rounded-full glass-pill border border-slate-300 text-slate-800 hover:bg-white transition-all"
            >
              View Full Calendar →
            </button>
          </div>

          <div className="space-y-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all border border-white"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-300">
                    {ev.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-950">{ev.title}</h3>
                    <div className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <span>{ev.date}</span>
                      <span>•</span>
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {ev.tag}
                  </span>
                  <button
                    onClick={openAuth}
                    className="px-5 py-2.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_4px_14px_rgba(212,246,61,0.3)] hover:scale-105"
                  >
                    Reserve Your Spot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- 5. PRICING SECTION ----------------- */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Flexible Memberships</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] text-slate-950">
            Invest in Your Health
          </h2>
          <p className="text-slate-600 text-base">
            Simple transparent pricing. Cancel or switch plans anytime.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!annualBilling ? 'text-slate-950' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="relative w-14 h-8 rounded-full bg-slate-950 p-1 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-full bg-[#D4F63D] transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-slate-950' : 'text-slate-400'}`}>
              <span>Annual</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D4F63D] text-slate-950">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Tier Cards Wrapped in Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Free */}
          <Card3D maxTilt={8} className="h-full">
            <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Starter</div>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-950 mt-1">Free Tier</h3>
                <p className="text-xs text-slate-500 mt-2">Essential tools for beginners starting their journey.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-950">$0</span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-slate-700">
                  {['Basic workout logging', 'Core exercise library access', 'Daily water tracker', 'Community access'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openAuth}
                className="mt-8 w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01]"
              >
                Get Started Free
              </button>
            </div>
          </Card3D>

          {/* Plan 2: Pro (Featured) */}
          <Card3D maxTilt={8} className="h-full">
            <div className="glass-panel rounded-3xl p-8 border-2 border-slate-950 shadow-xl flex flex-col justify-between relative bg-white h-full">
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-950 text-[#D4F63D] text-[11px] font-black uppercase tracking-wider shadow-md"
              >
                Most Popular
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pro Athlete</div>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-950 mt-1">Pro Plan</h3>
                <p className="text-xs text-slate-500 mt-2">For serious fitness enthusiasts needing smart AI vision coaching.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-950">
                    {annualBilling ? '$12' : '$15'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-slate-700">
                  {[
                    'MediaPipe AI camera posture tracking',
                    'Automatic rep counting & form score',
                    'Personalized macro meal planner',
                    'Google Fit & wearable biometric sync',
                    'Priority support & smart analytics'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-900">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openAuth}
                className="mt-8 w-full py-4 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-xs transition-all shadow-[0_6px_25px_rgba(212,246,61,0.4)] hover:shadow-[0_8px_30px_rgba(212,246,61,0.55)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card3D>

          {/* Plan 3: Elite */}
          <Card3D maxTilt={8} className="h-full">
            <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Elite Unlimited</div>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-950 mt-1">Elite Plan</h3>
                <p className="text-xs text-slate-500 mt-2">All-inclusive 1-on-1 coach feedback and custom nutrition design.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-950">
                    {annualBilling ? '$24' : '$29'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-slate-700">
                  {[
                    'Everything in Pro included',
                    'Unlimited AI vision workouts',
                    'Weekly coach video review',
                    'Custom macro & micro adjustment',
                    'VIP early feature access'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openAuth}
                className="mt-8 w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01]"
              >
                Choose Elite
              </button>
            </div>
          </Card3D>
        </div>
      </section>

      {/* ----------------- 6. MODERN BRAND FOOTER ----------------- */}
      <footer className="pt-20 pb-12 border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-100">
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4 text-[#D4F63D]" />
                </div>
                <span className="text-2xl font-black font-['Outfit'] text-slate-950">FitForge</span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
                Next-generation fitness architecture combining real-time computer vision, adaptive programming, and bio-nutrition for high performance.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#how-it-works" className="hover:text-slate-900 transition-colors">Vision Biomechanics</a></li>
                <li><a href="#workouts" className="hover:text-slate-900 transition-colors">Workout Library</a></li>
                <li><a href="#nutrition" className="hover:text-slate-900 transition-colors">Macro Engine</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Memberships</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Company</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                <li><Link to="/services" className="hover:text-slate-900 transition-colors">Coaching Services</Link></li>
                <li><Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
                <li><a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Stay Ahead</div>
              <p className="text-xs text-slate-500">Receive weekly evidence-based training routines and recovery protocols.</p>
              <div className="flex gap-2 pt-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs w-full focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
                <button
                  onClick={openAuth}
                  className="px-5 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>&copy; {new Date().getFullYear()} FitForge Technologies Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PricingModal isOpen={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />
    </div>
  )
}
