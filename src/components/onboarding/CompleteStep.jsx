import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { api } from '@/api/client.js'
import { useAuth } from '@/context/AuthContext.jsx'

export default function CompleteStep({ data }) {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saveData = async () => {
      setSaving(true)
      try {
        // Save to backend
        await api('/user/onboarding', {
          method: 'POST',
          token,
          body: {
            gender: data.gender,
            age: parseInt(data.age),
            height: parseFloat(data.height),
            weight: parseFloat(data.weight),
            target_weight: data.targetWeight ? parseFloat(data.targetWeight) : null,
            target_height: data.targetHeight ? parseFloat(data.targetHeight) : null,
            goal: data.goal,
            focus_areas: data.focusAreas || [],
            fitness_level: data.fitnessLevel,
            one_rm: data.oneRM || {},
            workout_frequency: data.workoutFrequency,
            equipment: data.equipment || [],
            location: data.location,
            body_measurements: data.bodyMeasurements || {},
            body_fat_percentage: data.bodyFatPercentage || null,
            medical_conditions: data.medicalConditions || [],
            injuries: data.injuries || '',
            workout_time_preference: data.workoutTimePreference || '',
            motivation: data.motivation || '',
            dietary_preference: data.dietaryPreference || 'none',
            water_intake_goal: parseInt(data.waterIntakeGoal) || 8,
            sleep_goal: parseFloat(data.sleepGoal) || 8,
            onboarding_completed: true
          }
        })
        
        // Update localStorage
        const updatedUser = { ...user, onboarding_completed: true }
        localStorage.setItem('ff_user', JSON.stringify(updatedUser))
        localStorage.setItem('onboarding_data', JSON.stringify(data))
      } catch (e) {
        console.error('Failed to save onboarding data', e)
      } finally {
        setSaving(false)
      }
    }

    saveData()

    // Redirect to dashboard after 4 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 4000)

    return () => clearTimeout(timer)
  }, [data, navigate, token, user])

  const getGoalText = () => {
    const goalMap = {
      'build_muscle': 'Build Muscle Mass',
      'lose_weight': 'Lose Weight',
      'boost_performance': 'Boost Sport Performance',
      'stay_fit': 'Stay Fit & Healthy',
      'gain_strength': 'Gain Strength',
      'improve_endurance': 'Improve Endurance'
    }
    return goalMap[data.goal] || 'Fitness'
  }

  return (
    <StepWrapper>
      <Content>
        <Confetti>
          {[...Array(50)].map((_, i) => (
            <ConfettiPiece key={i} $delay={i * 0.05} $x={Math.random() * 100} />
          ))}
        </Confetti>

        <IconWrapper>
          <AnimatedIcon>🎉</AnimatedIcon>
        </IconWrapper>

        <Title>Congratulations!</Title>
        <Subtitle>Your {getGoalText()} plan is ready!</Subtitle>

        <CheckmarkCircle>
          <Checkmark>✓</Checkmark>
        </CheckmarkCircle>

        <Message>
          We've created a personalized fitness plan just for you based on your goals and preferences.
        </Message>

        <StatsGrid>
          <StatCard>
            <StatIcon>🎯</StatIcon>
            <StatLabel>Goal</StatLabel>
            <StatValue>{getGoalText()}</StatValue>
          </StatCard>

          <StatCard>
            <StatIcon>📅</StatIcon>
            <StatLabel>Frequency</StatLabel>
            <StatValue>{data.workoutFrequency || 'Custom'} days/week</StatValue>
          </StatCard>

          <StatCard>
            <StatIcon>📍</StatIcon>
            <StatLabel>Location</StatLabel>
            <StatValue>{data.location || 'Flexible'}</StatValue>
          </StatCard>

          <StatCard>
            <StatIcon>💪</StatIcon>
            <StatLabel>Level</StatLabel>
            <StatValue>{data.fitnessLevel || 'Beginner'}</StatValue>
          </StatCard>
        </StatsGrid>

        <LoadingBar>
          <LoadingFill />
        </LoadingBar>

        <RedirectText>Redirecting to your dashboard...</RedirectText>
      </Content>
    </StepWrapper>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-20px) rotate(10deg) scale(1.1); }
`

const checkmarkDraw = keyframes`
  0% { transform: scale(0) rotate(-45deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
`

const confettiFall = keyframes`
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`

const loadingFill = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease;
  position: relative;
  @media (max-width: 768px) {
    padding: 15px;
  }
`

const Content = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
`

const Confetti = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`

const ConfettiPiece = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8']
    return colors[Math.floor(Math.random() * colors.length)]
  }};
  top: -10%;
  left: ${p => p.$x}%;
  animation: ${confettiFall} ${() => 3 + Math.random() * 2}s linear infinite;
  animation-delay: ${p => p.$delay}s;
  border-radius: 2px;
`

const IconWrapper = styled.div`
  margin-bottom: 30px;
`

const AnimatedIcon = styled.div`
  font-size: 100px;
  animation: ${float} 2s ease-in-out infinite;
  filter: drop-shadow(0 10px 40px rgba(255,215,0,0.5));
`

const Title = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700, #ffed4e, #fff, #ffd700);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  animation: ${pulse} 2s ease-in-out infinite;
`

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 50px;
  font-weight: 600;
`

const CheckmarkCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40px;
  box-shadow: 0 20px 60px rgba(34,197,94,0.4);
  animation: ${checkmarkDraw} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`

const Checkmark = styled.div`
  font-size: 60px;
  color: #fff;
  font-weight: bold;
`

const Message = styled.p`
  font-size: 1.2rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 25px 15px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(20,225,255,0.2);
    border-color: rgba(20,225,255,0.3);
  }
`

const StatIcon = styled.div`
  font-size: 40px;
  margin-bottom: 10px;
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-transform: capitalize;
`

const LoadingBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  margin: 0 auto 20px;
  overflow: hidden;
`

const LoadingFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #14e1ff, #7deaff, #14e1ff);
  background-size: 200% 100%;
  animation: ${loadingFill} 4s ease-in-out, shimmer 2s infinite;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(20,225,255,0.5);
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`

const RedirectText = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  font-style: italic;
`
