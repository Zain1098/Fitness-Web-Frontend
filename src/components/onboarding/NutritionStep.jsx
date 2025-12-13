import styled, { keyframes, css } from 'styled-components'

export default function NutritionStep({ data, updateData, nextStep, prevStep }) {
  const dietaryOptions = [
    { value: 'none', label: 'No Restrictions', icon: '🍽️' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'pescatarian', label: 'Pescatarian', icon: '🐟' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🥩' },
    { value: 'low_carb', label: 'Low Carb', icon: '🥦' },
    { value: 'high_protein', label: 'High Protein', icon: '🍗' }
  ]

  const handleSelect = (value) => {
    updateData('dietaryPreference', value)
  }

  const handleWaterChange = (e) => {
    updateData('waterIntakeGoal', e.target.value)
  }

  const handleSleepChange = (e) => {
    updateData('sleepGoal', e.target.value)
  }

  const handleNext = () => {
    if (data.dietaryPreference) nextStep()
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>🥗</AnimatedIcon>
        </IconWrapper>
        <Title>Nutrition Preferences</Title>
        <Subtitle>Tell us about your dietary preferences</Subtitle>
        
        <OptionsGrid>
          {dietaryOptions.map((option) => (
            <OptionCard
              key={option.value}
              $selected={data.dietaryPreference === option.value}
              onClick={() => handleSelect(option.value)}
            >
              <CardIcon>{option.icon}</CardIcon>
              <CardLabel>{option.label}</CardLabel>
              {data.dietaryPreference === option.value && <CheckMark>✓</CheckMark>}
            </OptionCard>
          ))}
        </OptionsGrid>

        <GoalsSection>
          <GoalInput>
            <Label>💧 Daily Water Goal (glasses)</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={data.waterIntakeGoal || 8}
              onChange={handleWaterChange}
            />
          </GoalInput>

          <GoalInput>
            <Label>😴 Sleep Goal (hours)</Label>
            <Input
              type="number"
              min="4"
              max="12"
              step="0.5"
              value={data.sleepGoal || 8}
              onChange={handleSleepChange}
            />
          </GoalInput>
        </GoalsSection>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
          <NextButton onClick={handleNext} disabled={!data.dietaryPreference}>
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
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 900px;
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
  filter: drop-shadow(0 10px 30px rgba(76,175,80,0.4));
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #4ade80, #22c55e, #fff);
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

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const OptionCard = styled.div`
  position: relative;
  background: ${p => p.$selected ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'rgba(255,255,255,0.03)'};
  border: 2px solid ${p => p.$selected ? 'transparent' : 'rgba(255,255,255,0.1)'};
  border-radius: 20px;
  padding: 30px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(76,175,80,0.3);
    border-color: rgba(76,175,80,0.5);
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.5s ease;
    box-shadow: 0 15px 40px rgba(76,175,80,0.5);
  `}
`

const CardIcon = styled.div`
  font-size: 40px;
  margin-bottom: 10px;
`

const CardLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
`

const CheckMark = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  font-weight: bold;
`

const GoalsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`

const GoalInput = styled.div`
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(76,175,80,0.3);
  }
`

const Label = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 4px rgba(74,222,128,0.1);
  }
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
  transition: all 0.3s ease;
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
`

const BackButton = styled(Button)`
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  
  &:hover {
    background: rgba(255,255,255,0.15);
  }
`

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  box-shadow: 0 10px 40px rgba(76,175,80,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(76,175,80,0.6);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`
