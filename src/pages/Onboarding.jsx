import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '@/context/AuthContext.jsx'
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

  useEffect(() => {
    if (!user) {
      navigate('/')
    } else if (user.onboarding_completed) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const totalSteps = 14

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Save data and redirect to dashboard
      navigate('/dashboard')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <GenderStep data={data} updateData={updateData} nextStep={nextStep} />
      case 2: return <PhysicalInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 3: return <TargetStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 4: return <GoalStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 5: return <FocusAreaStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 6: return <FitnessLevelStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 7: return <OneRMStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 8: return <WorkoutFrequencyStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 9: return <EquipmentStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 10: return <LocationStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 11: return <BodyMeasurementsStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 12: return <HealthInfoStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 13: return <NutritionStep data={data} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
      case 14: return <CompleteStep data={data} />
      default: return null
    }
  }

  if (!user) return null

  return (
    <Container>
      <ProgressBar>
        <ProgressFill $progress={(currentStep / totalSteps) * 100} />
      </ProgressBar>
      <StepContainer>
        {renderStep()}
      </StepContainer>
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
  position: relative;
  overflow-x: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(20,225,255,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255,255,255,0.05);
  z-index: 1000;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #14e1ff, #7deaff, #14e1ff);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  width: ${p => p.$progress}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 20px rgba(20,225,255,0.5);
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`

const StepContainer = styled.div`
  position: relative;
  z-index: 1;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`
