import styled, { keyframes, css } from 'styled-components'
import { useState } from 'react'

export default function NutritionStep({ data, updateData, nextStep, prevStep }) {
  const [allergens, setAllergens] = useState(data.allergens || [])

  const dietaryOptions = [
    { value: 'none', label: 'No Restrictions', icon: '🍽️', desc: 'Eat everything without limitations' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', desc: 'No meat, but includes dairy & eggs' },
    { value: 'vegan', label: 'Vegan', icon: '🌱', desc: 'Plant-based only, no animal products' },
    { value: 'pescatarian', label: 'Pescatarian', icon: '🐟', desc: 'Vegetarian diet plus fish & seafood' },
    { value: 'keto', label: 'Keto', icon: '🥑', desc: 'High fat, very low carb diet' },
    { value: 'paleo', label: 'Paleo', icon: '🥩', desc: 'Whole foods, no processed items' },
    { value: 'low_carb', label: 'Low Carb', icon: '🥦', desc: 'Reduced carbohydrate intake' },
    { value: 'high_protein', label: 'High Protein', icon: '🍗', desc: 'Protein-focused for muscle building' },
    { value: 'mediterranean', label: 'Mediterranean', icon: '🫒', desc: 'Healthy fats, fish, whole grains' },
    { value: 'gluten_free', label: 'Gluten Free', icon: '🌾', desc: 'No wheat, barley, or rye' }
  ]

  const allergenOptions = [
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
    { value: 'nuts', label: 'Nuts', icon: '🥜' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { value: 'gluten', label: 'Gluten', icon: '🌾' }
  ]

  const handleSelect = (value) => {
    updateData('dietaryPreference', value)
  }

  const handleAllergenToggle = (value) => {
    const updated = allergens.includes(value)
      ? allergens.filter(a => a !== value)
      : [...allergens, value]
    setAllergens(updated)
    updateData('allergens', updated)
  }

  const handleWaterChange = (e) => {
    updateData('waterIntakeGoal', e.target.value)
  }

  const handleSleepChange = (e) => {
    updateData('sleepGoal', e.target.value)
  }

  const handleMealsChange = (e) => {
    updateData('mealsPerDay', e.target.value)
  }

  const handleSkip = () => {
    updateData('dietaryPreference', 'none')
    updateData('allergens', [])
    nextStep()
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
        <Subtitle>Tell us about your dietary preferences and goals</Subtitle>
        
        <SectionTitle>Dietary Preference</SectionTitle>
        <OptionsGrid>
          {dietaryOptions.map((option) => (
            <OptionCard
              key={option.value}
              $selected={data.dietaryPreference === option.value}
              onClick={() => handleSelect(option.value)}
            >
              <CardIcon>{option.icon}</CardIcon>
              <CardLabel>{option.label}</CardLabel>
              <CardDesc>{option.desc}</CardDesc>
              {data.dietaryPreference === option.value && <CheckMark>✓</CheckMark>}
            </OptionCard>
          ))}
        </OptionsGrid>

        <SectionTitle>Food Allergies (Optional)</SectionTitle>
        <AllergenGrid>
          {allergenOptions.map((option) => (
            <AllergenCard
              key={option.value}
              $selected={allergens.includes(option.value)}
              onClick={() => handleAllergenToggle(option.value)}
            >
              <CardIcon>{option.icon}</CardIcon>
              <CardLabel>{option.label}</CardLabel>
              {allergens.includes(option.value) && <CheckMark>✓</CheckMark>}
            </AllergenCard>
          ))}
        </AllergenGrid>

        <GoalsSection>
          <GoalInput>
            <Label>💧 Daily Water Goal (glasses)</Label>
            <HelpText>Recommended: 8-10 glasses per day</HelpText>
            <Input
              type="number"
              min="1"
              max="20"
              value={data.waterIntakeGoal || 8}
              onChange={handleWaterChange}
            />
          </GoalInput>

          <GoalInput>
            <Label>🍽️ Meals Per Day</Label>
            <HelpText>How many times do you eat daily?</HelpText>
            <Input
              type="number"
              min="1"
              max="8"
              value={data.mealsPerDay || 3}
              onChange={handleMealsChange}
            />
          </GoalInput>

          <GoalInput>
            <Label>😴 Sleep Goal (hours)</Label>
            <HelpText>Recommended: 7-9 hours per night</HelpText>
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
          <SkipButton onClick={handleSkip}>
            Skip
          </SkipButton>
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
  filter: drop-shadow(0 10px 30px rgba(20,225,255,0.4));
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #14e1ff, #7deaff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 40px;
`

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
  text-align: left;
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

const AllergenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const OptionCard = styled.div`
  position: relative;
  background: ${p => p.$selected ? 'linear-gradient(135deg, #ff6b35, #ff8c42)' : 'rgba(255,255,255,0.03)'};
  border: 2px solid ${p => p.$selected ? 'transparent' : 'rgba(255,255,255,0.1)'};
  border-radius: 20px;
  padding: 25px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255,107,53,0.3);
    border-color: rgba(255,107,53,0.5);
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.5s ease;
    box-shadow: 0 15px 40px rgba(255,107,53,0.5);
  `}
`

const AllergenCard = styled.div`
  position: relative;
  background: ${p => p.$selected ? 'linear-gradient(135deg, #ff6b35, #ff8c42)' : 'rgba(255,255,255,0.03)'};
  border: 2px solid ${p => p.$selected ? 'transparent' : 'rgba(255,255,255,0.1)'};
  border-radius: 15px;
  padding: 20px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255,107,53,0.3);
    border-color: rgba(255,107,53,0.5);
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.5s ease;
    box-shadow: 0 10px 30px rgba(255,107,53,0.5);
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
  margin-bottom: 5px;
`

const CardDesc = styled.div`
  font-size: 0.75rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.3;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`

const GoalInput = styled.div`
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(20,225,255,0.3);
  }
`

const Label = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
`

const HelpText = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 10px;
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
    border-color: #14e1ff;
    box-shadow: 0 0 0 4px rgba(20,225,255,0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
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

const SkipButton = styled(Button)`
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  border: 2px solid rgba(255,255,255,0.1);
  
  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  box-shadow: 0 10px 40px rgba(255,107,53,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(255,107,53,0.6);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`
