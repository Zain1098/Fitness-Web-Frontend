import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { ArrowLeft, LogOut, Sparkles, CheckCircle2 } from 'lucide-react'

import GenderStep from '@/components/onboarding/GenderStep.jsx'
import PhysicalInfoStep from '@/components/onboarding/PhysicalInfoStep.jsx'
import TargetStep from '@/components/onboarding/TargetStep.jsx'
import GoalStep from '@/components/onboarding/GoalStep.jsx'
import FocusAreaStep from '@/components/onboarding/FocusAreaStep.jsx'
import FitnessLevelStep from '@/components/onboarding/FitnessLevelStep.jsx'
import OneRMStep from '@/components/onboarding/OneRMStep.jsx'
import WorkoutFrequencyStep from '@/components/onboarding/WorkoutFrequencyStep.jsx'
import EquipmentStep from '@/components/onboarding/EquipmentStep.jsx'
import LocationStep from '@/components/onboarding/LocationStep.jsx'
import BodyMeasurementsStep from '@/components/onboarding/BodyMeasurementsStep.jsx'
import HealthInfoStep from '@/components/onboarding/HealthInfoStep.jsx'
import NutritionStep from '@/components/onboarding/NutritionStep.jsx'
import CompleteStep from '@/components/onboarding/CompleteStep.jsx'

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    targetHeight: '',
    goal: '',
    focusAreas: [],
    fitnessLevel: '',
    oneRM: {},
    workoutFrequency: '',
    equipment: [],
    location: '',
    bodyMeasurements: {},
    bodyFatPercentage: '',
    medicalConditions: [],
    injuries: '',
    workoutTimePreference: '',
    motivation: '',
    dietaryPreference: 'none',
    allergens: [],
    mealsPerDay: 3,
    waterIntakeGoal: 8,
    sleepGoal: 8
  })

  // Restore existing cached onboarding data if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('onboarding_draft')
      if (saved) {
        setData(prev => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/')
    } else if (user.onboarding_completed) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const totalSteps = 14

  const stepTitles = [
    'Gender',
    'Physical Stats',
    'Target Goals',
    'Primary Goal',
    'Focus Areas',
    'Fitness Level',
    'Strength Baseline',
    'Frequency',
    'Equipment',
    'Workout Location',
    'Measurements',
    'Health & Habits',
    'Nutrition & Diet',
    'Plan Ready'
  ]

  const updateData = (field, value) => {
    setData(prev => {
      const updated = { ...prev, [field]: value }
      try {
        localStorage.setItem('onboarding_draft', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/dashboard')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const handleExit = () => {
    navigate('/')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GenderStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 2:
        return <PhysicalInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 3:
        return <TargetStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 4:
        return <GoalStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 5:
        return <FocusAreaStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 6:
        return <FitnessLevelStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 7:
        return <OneRMStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 8:
        return <WorkoutFrequencyStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 9:
        return <EquipmentStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 10:
        return <LocationStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 11:
        return <BodyMeasurementsStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 12:
        return <HealthInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 13:
        return <NutritionStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 14:
        return <CompleteStep data={data} />
      default:
        return null
    }
  }

  if (!user) return null

  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100))

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col relative overflow-x-hidden selection:bg-[#D4F63D] selection:text-slate-900">
      {/* Ambient background glows matching Home.jsx */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-lime-200/35 via-cyan-100/25 to-purple-100/25 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-emerald-100/30 via-slate-100/20 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-[#D4F63D] font-black text-lg shadow-[0_2px_10px_rgba(15,23,42,0.15)] group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] font-black text-xl tracking-tight text-slate-950 leading-none">
                FitForge
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Profile Setup
              </span>
            </div>
          </Link>

          {/* Center Progress Pill (desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-bold text-slate-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-900">
              {stepTitles[currentStep - 1]}
            </span>
          </div>

          {/* Right Action: Exit / Back to Website */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExit}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Save draft and return to website"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Website</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4F63D] via-[#10B981] to-[#D4F63D] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(212,246,61,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Mobile Step Header (below sticky header on small screens) */}
      <div className="sm:hidden px-4 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Step {currentStep} of {totalSteps}</span>
        <span className="text-slate-800 font-semibold">{stepTitles[currentStep - 1]}</span>
        <span className="text-[#10B981] font-bold">{progressPercent}%</span>
      </div>

      {/* Main Step Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 transition-all">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  )
}
