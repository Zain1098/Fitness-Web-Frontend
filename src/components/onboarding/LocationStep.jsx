import styled, { keyframes, css } from 'styled-components'

export default function LocationStep({ data, updateData, nextStep, prevStep }) {
  const locations = [
    { value: 'gym', label: 'Gym', desc: 'Full equipment access', icon: '🏋️', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'home', label: 'Home', desc: 'Workout at home', icon: '🏠', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { value: 'outdoor', label: 'Outdoor', desc: 'Parks & open spaces', icon: '🌳', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { value: 'hybrid', label: 'Hybrid', desc: 'Mix of locations', icon: '🔄', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  ]

  const handleSelect = (value) => {
    updateData('location', value)
    setTimeout(() => nextStep(), 400)
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>📍</AnimatedIcon>
        </IconWrapper>
        <Title>Where do you prefer to exercise?</Title>
        <Subtitle>Choose your workout environment</Subtitle>
        
        <OptionsGrid>
          {locations.map((loc) => (
            <LocationCard
              key={loc.value}
              $gradient={loc.gradient}
              $selected={data.location === loc.value}
              onClick={() => handleSelect(loc.value)}
            >
              <CardIcon>{loc.icon}</CardIcon>
              <CardLabel>{loc.label}</CardLabel>
              <CardDesc>{loc.desc}</CardDesc>
              {data.location === loc.value && <CheckMark>✓</CheckMark>}
            </LocationCard>
          ))}
        </OptionsGrid>

        <BackButton onClick={prevStep}>
          <span>←</span> Back
        </BackButton>
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
  filter: drop-shadow(0 10px 30px rgba(79,172,254,0.4));
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #4facfe, #00f2fe, #fff);
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const LocationCard = styled.div`
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
    box-shadow: 0 20px 60px rgba(79,172,254,0.3);
    border-color: rgba(79,172,254,0.5);
    
    &::before {
      opacity: 0.3;
    }
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.6s ease;
    box-shadow: 0 20px 60px rgba(79,172,254,0.5);
  `}
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
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  margin-bottom: 8px;
`

const CardDesc = styled.div`
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
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

const BackButton = styled.button`
  padding: 18px 40px;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  
  span {
    font-size: 1.3rem;
  }
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`
