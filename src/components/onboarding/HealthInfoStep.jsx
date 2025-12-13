import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

export default function HealthInfoStep({ data, updateData, nextStep, prevStep }) {
  const [conditions, setConditions] = useState(data.medicalConditions || [])
  const [injuries, setInjuries] = useState(data.injuries || '')
  const [workoutTime, setWorkoutTime] = useState(data.workoutTimePreference || '')
  const [motivation, setMotivation] = useState(data.motivation || '')

  const commonConditions = ['None', 'Diabetes', 'High Blood Pressure', 'Asthma', 'Heart Condition', 'Joint Issues', 'Back Pain']
  const timePreferences = [
    { value: 'morning', label: '🌅 Morning (5-9 AM)', icon: '🌅' },
    { value: 'afternoon', label: '☀️ Afternoon (12-4 PM)', icon: '☀️' },
    { value: 'evening', label: '🌆 Evening (5-8 PM)', icon: '🌆' },
    { value: 'night', label: '🌙 Night (8-11 PM)', icon: '🌙' },
    { value: 'flexible', label: '🔄 Flexible', icon: '🔄' }
  ]

  const toggleCondition = (condition) => {
    if (condition === 'None') {
      setConditions(['None'])
    } else {
      const filtered = conditions.filter(c => c !== 'None')
      setConditions(filtered.includes(condition) ? filtered.filter(c => c !== condition) : [...filtered, condition])
    }
  }

  const handleNext = () => {
    updateData('medicalConditions', conditions)
    updateData('injuries', injuries)
    updateData('workoutTimePreference', workoutTime)
    updateData('motivation', motivation)
    nextStep()
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper><AnimatedIcon>🏥</AnimatedIcon></IconWrapper>
        <Title>Health & Preferences</Title>
        <Subtitle>Help us personalize your fitness journey safely</Subtitle>
        
        <Section>
          <SectionTitle>Medical Conditions</SectionTitle>
          <ConditionsGrid>
            {commonConditions.map(condition => (
              <ConditionCard key={condition} $active={conditions.includes(condition)} onClick={() => toggleCondition(condition)}>
                {condition}
              </ConditionCard>
            ))}
          </ConditionsGrid>
        </Section>

        <Section>
          <SectionTitle>Injuries or Limitations (Optional)</SectionTitle>
          <TextArea value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="E.g., Previous knee injury, lower back pain..." />
        </Section>

        <Section>
          <SectionTitle>Preferred Workout Time</SectionTitle>
          <TimeGrid>
            {timePreferences.map(time => (
              <TimeCard key={time.value} $active={workoutTime === time.value} onClick={() => setWorkoutTime(time.value)}>
                <TimeIcon>{time.icon}</TimeIcon>
                <TimeLabel>{time.label.split(' ')[1]}</TimeLabel>
              </TimeCard>
            ))}
          </TimeGrid>
        </Section>

        <Section>
          <SectionTitle>What motivates you? (Optional)</SectionTitle>
          <TextArea value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="E.g., Want to feel confident, improve health, compete in sports..." rows="3" />
        </Section>

        <ButtonGroup>
          <BackButton onClick={prevStep}><span>←</span> Back</BackButton>
          <NextButton onClick={handleNext}>Next <span>→</span></NextButton>
        </ButtonGroup>
      </Content>
    </StepWrapper>
  )
}

const fadeIn = keyframes`from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); }`
const float = keyframes`0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); }`

const StepWrapper = styled.div`width: 100%; max-width: 900px; margin: 0 auto; animation: ${fadeIn} 0.6s ease;`
const Content = styled.div`text-align: center;`
const IconWrapper = styled.div`margin-bottom: 30px;`
const AnimatedIcon = styled.div`font-size: 80px; animation: ${float} 3s ease-in-out infinite; filter: drop-shadow(0 10px 30px rgba(255,99,71,0.4));`
const Title = styled.h1`font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; background: linear-gradient(135deg, #ff6347, #ff8c69, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px;`
const Subtitle = styled.p`font-size: 1.1rem; color: rgba(255,255,255,0.7); margin-bottom: 40px;`
const Section = styled.div`margin-bottom: 40px; text-align: left;`
const SectionTitle = styled.h3`font-size: 1.2rem; color: rgba(255,255,255,0.9); margin-bottom: 20px; font-weight: 700;`
const ConditionsGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;`
const ConditionCard = styled.div`background: ${p => p.$active ? 'rgba(255,99,71,0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${p => p.$active ? '#ff6347' : 'rgba(255,255,255,0.1)'}; padding: 15px; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 600; color: ${p => p.$active ? '#ff6347' : 'rgba(255,255,255,0.8)'}; &:hover { background: rgba(255,99,71,0.15); border-color: #ff6347; }`
const TextArea = styled.textarea`width: 100%; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,99,71,0.3); border-radius: 12px; padding: 15px; color: #fff; font-size: 1rem; resize: vertical; min-height: 80px; &:focus { outline: none; border-color: #ff6347; } &::placeholder { color: rgba(255,255,255,0.4); }`
const TimeGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;`
const TimeCard = styled.div`background: ${p => p.$active ? 'rgba(255,99,71,0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${p => p.$active ? '#ff6347' : 'rgba(255,255,255,0.1)'}; padding: 20px 15px; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; &:hover { background: rgba(255,99,71,0.15); border-color: #ff6347; }`
const TimeIcon = styled.div`font-size: 32px; margin-bottom: 8px;`
const TimeLabel = styled.div`font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.8);`
const ButtonGroup = styled.div`display: flex; gap: 20px; justify-content: center; margin-top: 50px;`
const Button = styled.button`padding: 18px 40px; border-radius: 15px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; border: none; display: flex; align-items: center; gap: 10px; span { font-size: 1.3rem; } &:hover { transform: translateY(-3px); }`
const BackButton = styled(Button)`background: rgba(255,255,255,0.1); color: #fff; border: 2px solid rgba(255,255,255,0.2); &:hover { background: rgba(255,255,255,0.15); }`
const NextButton = styled(Button)`background: linear-gradient(135deg, #ff6347, #ff8c69); color: #fff; box-shadow: 0 10px 40px rgba(255,99,71,0.4); &:hover { box-shadow: 0 15px 50px rgba(255,99,71,0.6); }`
