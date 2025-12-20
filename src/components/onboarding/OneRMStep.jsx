import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

export default function OneRMStep({ data, updateData, nextStep, prevStep }) {
  const [bench, setBench] = useState(data.oneRM?.bench || '')
  const [squat, setSquat] = useState(data.oneRM?.squat || '')
  const [deadlift, setDeadlift] = useState(data.oneRM?.deadlift || '')
  const [unit, setUnit] = useState('kg')

  const handleNext = () => {
    const convertedData = {
      bench: bench ? (unit === 'kg' ? bench : (bench * 0.453592).toFixed(1)) : '',
      squat: squat ? (unit === 'kg' ? squat : (squat * 0.453592).toFixed(1)) : '',
      deadlift: deadlift ? (unit === 'kg' ? deadlift : (deadlift * 0.453592).toFixed(1)) : ''
    }
    updateData('oneRM', convertedData)
    nextStep()
  }

  const handleSkip = () => {
    updateData('oneRM', { bench: '', squat: '', deadlift: '' })
    nextStep()
  }

  const toggleUnit = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg'
    if (bench) setBench(unit === 'kg' ? (bench * 2.20462).toFixed(1) : (bench * 0.453592).toFixed(1))
    if (squat) setSquat(unit === 'kg' ? (squat * 2.20462).toFixed(1) : (squat * 0.453592).toFixed(1))
    if (deadlift) setDeadlift(unit === 'kg' ? (deadlift * 2.20462).toFixed(1) : (deadlift * 0.453592).toFixed(1))
    setUnit(newUnit)
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>🏋️</AnimatedIcon>
        </IconWrapper>
        <Title>Your Maximum Strength</Title>
        <Subtitle>Maximum weight you can lift ONCE with proper form (Optional - Skip if unsure)</Subtitle>
        
        <InfoBox>
          <InfoIcon>💡</InfoIcon>
          <InfoText>
            <strong>What does this mean?</strong> Enter the heaviest weight you can lift for just ONE repetition. Not how many times you can lift it - just the maximum weight for a single lift.
          </InfoText>
        </InfoBox>
        
        <UnitToggleWrapper>
          <UnitToggle onClick={toggleUnit}>
            Switch to {unit === 'kg' ? 'lbs' : 'kg'} ⚖️
          </UnitToggle>
        </UnitToggleWrapper>
        
        <FormGrid>
          <InputGroup>
            <LabelRow>
              <Label>Bench Press (Chest)</Label>
              <Example>Max weight: {unit === 'kg' ? '60-80 kg' : '130-175 lbs'}</Example>
            </LabelRow>
            <HelpText>Heaviest weight you can push up ONCE while lying on bench</HelpText>
            <InputWrapper>
              <Icon>💪</Icon>
              <Input
                type="number"
                value={bench}
                onChange={(e) => setBench(e.target.value)}
                placeholder={unit === 'kg' ? '60' : '130'}
                min="0"
              />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>Squat (Legs)</Label>
              <Example>Max weight: {unit === 'kg' ? '80-100 kg' : '175-220 lbs'}</Example>
            </LabelRow>
            <HelpText>Heaviest weight you can squat down and stand up ONCE</HelpText>
            <InputWrapper>
              <Icon>🦵</Icon>
              <Input
                type="number"
                value={squat}
                onChange={(e) => setSquat(e.target.value)}
                placeholder={unit === 'kg' ? '80' : '175'}
                min="0"
              />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>Deadlift (Back & Legs)</Label>
              <Example>Max weight: {unit === 'kg' ? '100-120 kg' : '220-265 lbs'}</Example>
            </LabelRow>
            <HelpText>Heaviest weight you can lift from ground to standing ONCE</HelpText>
            <InputWrapper>
              <Icon>🏋️</Icon>
              <Input
                type="number"
                value={deadlift}
                onChange={(e) => setDeadlift(e.target.value)}
                placeholder={unit === 'kg' ? '100' : '220'}
                min="0"
              />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>
        </FormGrid>

        <Hint>💡 Not sure? We'll help you discover your strength during workouts!</Hint>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
          <SkipButton onClick={handleSkip}>
            Skip for now
          </SkipButton>
          <NextButton onClick={handleNext}>
            Next <span>→</span>
          </NextButton>
        </ButtonGroup>
      </Content>
    </StepWrapper>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255,159,64,0.3); }
  50% { box-shadow: 0 0 40px rgba(255,159,64,0.6); }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
`

const Content = styled.div`
  text-align: center;
`

const IconWrapper = styled.div`
  margin-bottom: 30px;
`

const AnimatedIcon = styled.div`
  font-size: 80px;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(255,159,64,0.4));
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #ff9f40, #ffcd56, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 50px;
`

const FormGrid = styled.div`
  display: grid;
  gap: 30px;
  margin-bottom: 30px;
`

const InputGroup = styled.div`
  text-align: left;
`

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const Example = styled.span`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  font-style: italic;
`

const InfoBox = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-start;
  background: rgba(20,225,255,0.1);
  border: 2px solid rgba(20,225,255,0.3);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
`

const InfoIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`

const InfoText = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
  margin: 0;
  
  strong {
    color: #14e1ff;
  }
`

const UnitToggleWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`

const UnitToggle = styled.button`
  background: rgba(255,107,53,0.1);
  border: 2px solid rgba(255,107,53,0.3);
  color: #ff6b35;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,107,53,0.2);
    border-color: #ff6b35;
    transform: translateY(-2px);
  }
`

const HelpText = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  margin: 5px 0 10px 0;
  font-style: italic;
`

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,159,64,0.3);
  border-radius: 15px;
  padding: 5px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:focus-within {
    border-color: #ff9f40;
    animation: ${glow} 2s infinite;
  }
`

const Icon = styled.div`
  font-size: 28px;
  padding: 0 15px;
  filter: drop-shadow(0 2px 8px rgba(255,159,64,0.3));
`

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 15px 10px;
  
  &::placeholder {
    color: rgba(255,255,255,0.3);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Unit = styled.span`
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  padding: 0 20px;
  font-weight: 600;
`

const Hint = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 40px;
  padding: 15px;
  background: rgba(255,159,64,0.1);
  border-radius: 12px;
  border: 1px solid rgba(255,159,64,0.2);
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
`

const Button = styled.button`
  padding: 18px 40px;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 1.3rem;
  }
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const BackButton = styled(Button)`
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  
  &:hover {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.4);
  }
`

const SkipButton = styled(Button)`
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  border: 2px solid rgba(255,255,255,0.1);
  
  &:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
    color: #fff;
  }
`

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #ff9f40, #ffcd56);
  color: #0a0e27;
  box-shadow: 0 10px 40px rgba(255,159,64,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(255,159,64,0.6);
  }
`
