import styled, { keyframes, css } from 'styled-components'

export default function GoalStep({ data, updateData, nextStep, prevStep }) {
  const goals = [
    { value: 'build_muscle', label: 'Build Muscle Mass', icon: '💪', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { value: 'lose_weight', label: 'Lose Weight', icon: '🔥', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { value: 'boost_performance', label: 'Boost Sport Performance', icon: '⚡', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { value: 'stay_fit', label: 'Stay Fit & Healthy', icon: '🏃', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { value: 'gain_strength', label: 'Gain Strength', icon: '🏋️', gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' },
    { value: 'improve_endurance', label: 'Improve Endurance', icon: '🚴', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ]

  const handleSelect = (value) => {
    updateData('goal', value)
  }

  const handleNext = () => {
    if (data.goal) nextStep()
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>🎯</AnimatedIcon>
        </IconWrapper>
        <Title>What's your main goal?</Title>
        <Subtitle>Choose your primary fitness objective</Subtitle>
        
        <OptionsGrid>
          {goals.map((g) => (
            <GoalCard
              key={g.value}
              $gradient={g.gradient}
              $selected={data.goal === g.value}
              onClick={() => handleSelect(g.value)}
            >
              <CardIcon>{g.icon}</CardIcon>
              <CardLabel>{g.label}</CardLabel>
              {data.goal === g.value && <CheckMark>✓</CheckMark>}
              <Shine />
            </GoalCard>
          ))}
        </OptionsGrid>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
          <NextButton onClick={handleNext} disabled={!data.goal}>
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
  50% { transform: translateY(-20px) rotate(10deg); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

const shine = keyframes`
  0% { left: -100%; }
  100% { left: 200%; }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
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
  filter: drop-shadow(0 10px 30px rgba(245,87,108,0.4));
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #f093fb, #f5576c, #fff);
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const GoalCard = styled.div`
  position: relative;
  background: ${p => p.$selected ? p.$gradient : 'rgba(255,255,255,0.03)'};
  border: 2px solid ${p => p.$selected ? 'transparent' : 'rgba(255,255,255,0.1)'};
  border-radius: 20px;
  padding: 35px 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${p => p.$gradient};
    opacity: ${p => p.$selected ? 1 : 0};
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(245,87,108,0.3);
    border-color: rgba(245,87,108,0.5);
    
    &::before {
      opacity: 0.3;
    }
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.6s ease;
    box-shadow: 0 20px 60px rgba(245,87,108,0.5);
  `}
`

const Shine = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-25deg);
  
  ${GoalCard}:hover & {
    animation: ${shine} 0.8s ease;
  }
`

const CardIcon = styled.div`
  position: relative;
  z-index: 1;
  font-size: 50px;
  margin-bottom: 15px;
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
`

const CardLabel = styled.div`
  position: relative;
  z-index: 1;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`

const CheckMark = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  z-index: 2;
  animation: ${pulse} 0.4s ease;
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

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: #fff;
  box-shadow: 0 10px 40px rgba(245,87,108,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(245,87,108,0.6);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`
