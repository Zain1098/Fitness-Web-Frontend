import { useState } from 'react'
import { Link } from 'react-router-dom'
import VisitorNavbar from '../components/VisitorNavbar.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import AuthModal from '../components/AuthModal.jsx'
import Card3D from '../components/ui/Card3D.jsx'
import BiomechanicsStage3D from '../components/ui/BiomechanicsStage3D.jsx'
import {
  Dumbbell,
  ShieldCheck,
  Activity,
  Heart,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  Users,
  Award,
  Globe2,
  ChevronRight
} from 'lucide-react'

export default function About() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const pillars = [
    {
      icon: Activity,
      title: 'Neural Computer Vision',
      desc: 'Our real-time MediaPipe computer vision algorithms track 33 joint coordinates directly through your device camera — giving you Olympic-level form guidance without wearable sensors.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      icon: Flame,
      title: 'Adaptive Bio-Nutrition',
      desc: 'We discard rigid static diets. FitForge dynamically balances your carbohydrate, protein, and lipid targets depending on actual workout volume and physical recovery status.',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      icon: ShieldCheck,
      title: 'Injury Prevention & Longevity',
      desc: 'By measuring movement range of motion, eccentric velocity, and spine alignment, we detect fatigue breakdowns before they lead to strains or long-term joint stress.',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200'
    }
  ]

  const stats = [
    { label: 'Workouts Analyzed', value: '500k+' },
    { label: 'Posture Accuracy', value: '96.8%' },
    { label: 'Global Athletes', value: '10,000+' },
    { label: 'Average User Rating', value: '4.9/5' }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <ScrollToTop />
      <VisitorNavbar authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />

      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>THE FITFORGE PHILOSOPHY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-['Outfit'] text-slate-950 leading-[1.1]">
            Built to Help You Become Your Strongest Self
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            At FitForge, we believe fitness should be simple, measurable, and built around your real life. We bridge the gap between biomechanics and computer vision so anyone can train with certainty.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-7 py-3.5 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 font-black text-sm transition-all shadow-[0_4px_16px_rgba(212,246,61,0.35)] hover:shadow-[0_6px_25px_rgba(212,246,61,0.5)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Join FitForge Today</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="px-6 py-3.5 rounded-full glass-pill hover:bg-white text-slate-800 font-semibold text-sm transition-all border border-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Hero Visual Studio Shot with 3D perspective */}
        <div className="mt-14 max-w-5xl mx-auto">
          <Card3D maxTilt={6}>
            <div className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden glass-panel border border-white shadow-xl bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85"
                alt="Athletic Gym Studio"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent flex items-end p-8 sm:p-12">
                <div
                  style={{ transform: 'translateZ(30px)' }}
                  className="glass-panel rounded-3xl p-6 border border-white/80 max-w-md shadow-2xl"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Our Mission</span>
                  <h3 className="text-lg font-bold font-['Outfit'] text-slate-950 mt-1">
                    Precision Coaching Accessible Anywhere
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Empowering everyday athletes with elite tools: form correction, progressive overload tracking, and nutrition science.
                  </p>
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* ----------------- 2. KEY STATS COUNTERS ----------------- */}
      <section className="py-12 bg-white border-y border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-['Outfit'] text-slate-950">{s.value}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- 3. INTERACTIVE 3D BIOMECHANICS STAGE ----------------- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <BiomechanicsStage3D />
      </section>

      {/* ----------------- 4. THREE CORE PILLARS ----------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Engineering Meets Movement</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] text-slate-950">
            The Three Pillars of FitForge
          </h2>
          <p className="text-slate-600 text-base">
            How we translate your daily effort into reliable physical transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <Card3D key={i} maxTilt={10} className="h-full">
                <div className="glass-panel rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                  <div>
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${p.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-['Outfit'] text-slate-950">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">{p.desc}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6 text-xs font-bold text-slate-900">
                    <span>Science-Backed</span>
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </Card3D>
            )
          })}
        </div>
      </section>

      {/* ----------------- 5. CTA BANNER ----------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
        <div className="rounded-[2.5rem] p-8 sm:p-14 bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="max-w-lg space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#D4F63D] text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Start Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
              Ready to Upgrade Your Training?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your account in under 60 seconds and experience real-time AI vision coaching on your very next set.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="self-start md:self-auto px-8 py-4 rounded-full bg-[#D4F63D] hover:bg-[#c3e626] text-slate-950 text-xs font-black transition-all shadow-[0_6px_25px_rgba(212,246,61,0.4)] hover:shadow-[0_8px_30px_rgba(212,246,61,0.55)] hover:scale-105 active:scale-95 flex items-center gap-2 relative z-10"
          >
            <span>Create Free Account</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ----------------- 6. BRAND FOOTER ----------------- */}
      <footer className="pt-16 pb-12 border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            <span>FitForge Technologies Inc.</span>
          </div>
          <div>&copy; {new Date().getFullYear()} All rights reserved. Precision health architecture.</div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}