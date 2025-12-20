import styled, { keyframes, css } from 'styled-components'

export default function EquipmentStep({ data, updateData, nextStep, prevStep }) {
  const equipment = [
    { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️‍♀️', category: 'weights' },
    { value: 'barbell', label: 'Barbell', icon: '🏋️', category: 'weights' },
    { value: 'kettlebell', label: 'Kettlebell', icon: '⚫', category: 'weights' },
    { value: 'weight_plates', label: 'Weight Plates', icon: '🟠', category: 'weights' },
    { value: 'resistance_bands', label: 'Resistance Bands', icon: '🎗️', category: 'accessories' },
    { value: 'pull_up_bar', label: 'Pull-up Bar', icon: '🔗', category: 'accessories' },
    { value: 'dip_bars', label: 'Dip Bars', icon: '⚖️', category: 'accessories' },
    { value: 'bench', label: 'Bench', icon: '🛋️', category: 'equipment' },
    { value: 'squat_rack', label: 'Squat Rack', icon: '🏛️', category: 'equipment' },
    { value: 'cable_machine', label: 'Cable Machine', icon: '⛓️', category: 'equipment' },
    { value: 'treadmill', label: 'Treadmill', icon: '🏃', category: 'cardio' },
    { value: 'bike', label: 'Exercise Bike', icon: '🚴', category: 'cardio' },
    { value: 'rowing_machine', label: 'Rowing Machine', icon: '🚣', category: 'cardio' },
    { value: 'jump_rope', label: 'Jump Rope', icon: '🪀', category: 'accessories' },
    { value: 'yoga_mat', label: 'Yoga Mat', icon: '🧘', category: 'accessories' },
    { value: 'none', label: 'No Equipment (Bodyweight)', icon: '🤸', category: 'bodyweight' }
  ]

  const presets = [
    { name: 'Home Gym', items: ['dumbbells', 'resistance_bands', 'yoga_mat', 'jump_rope'] },
    { name: 'Full Gym', items: ['dumbbells', 'barbell', 'bench', 'squat_rack', 'cable_machine', 'treadmill'] },
    { name: 'Bodyweight Only', items: ['none'] }
  ]

  const toggleEquipment = (value) => {
    const current = data.equipment || []
    if (value === 'none') {
      updateData('equipment', current.includes('none') ? [] : ['none'])
    } else {
      const filtered = current.filter(e => e !== 'none')
      if (filtered.includes(value)) {
        updateData('equipment', filtered.filter(e => e !== value))
      } else {
        updateData('equipment', [...filtered, value])
      }
    }
  }

  const applyPreset = (items) => {
    updateData('equipment', items)
  }

  const selectAll = () => {
    updateData('equipment', equipment.filter(e => e.value !== 'none').map(e => e.value))
  }

  const clearAll = () => {
    updateData('equipment', [])
  }

  const handleNext = () => {
    if (data.equipment && data.equipment.length > 0) nextStep()
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>🏋️‍♂️</AnimatedIcon>
        </IconWrapper>
        <Title>What equipment do you have?</Title>
        <Subtitle>Select all equipment you have access to</Subtitle>
        
        <PresetsWrapper>
          <PresetsLabel>Quick Select:</PresetsLabel>
          {presets.map((preset) => (
            <PresetButton key={preset.name} onClick={() => applyPreset(preset.items)}>
              {preset.name}
            </PresetButton>
          ))}
          <PresetButton onClick={selectAll} style={{ background: 'rgba(76,175,80,0.2)', borderColor: 'rgba(76,175,80,0.4)' }}>
            Select All
          </PresetButton>
          <PresetButton onClick={clearAll} style={{ background: 'rgba(244,67,54,0.2)', borderColor: 'rgba(244,67,54,0.4)' }}>
            Clear All
          </PresetButton>
        </PresetsWrapper>
        
        <OptionsGrid>
          {equipment.map((eq) => (
            <EquipCard
              key={eq.value}
              $selected={data.equipment?.includes(eq.value)}
              onClick={() => toggleEquipment(eq.value)}
            >
              <CardIcon>{eq.icon}</CardIcon>
              <CardLabel>{eq.label}</CardLabel>
              {data.equipment?.includes(eq.value) && <CheckMark>✓</CheckMark>}
            </EquipCard>
          ))}
        </OptionsGrid>

        <SelectedCount>
          {data.equipment?.length || 0} selected
        </SelectedCount>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
          <NextButton onClick={handleNext} disabled={!data.equipment || data.equipment.length === 0}>
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
  filter: drop-shadow(0 10px 30px rgba(255,107,53,0.4));
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
  margin-bottom: 50px;
`

const PresetsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,0.1);
`

const PresetsLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  margin-right: 10px;
`

const PresetButton = styled.button`
  padding: 8px 16px;
  background: rgba(255,107,53,0.2);
  border: 2px solid rgba(255,107,53,0.4);
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,107,53,0.3);
    border-color: #ff6b35;
    transform: translateY(-2px);
  }
`

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const EquipCard = styled.div`
  position: relative;
  background: ${p => p.$selected ? 'linear-gradient(135deg, #ff6b35, #ff8c42)' : 'rgba(255,255,255,0.05)'};
  border: 2px solid ${p => p.$selected ? 'transparent' : 'rgba(255,107,53,0.3)'};
  border-radius: 20px;
  padding: 30px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 15px 40px rgba(255,107,53,0.3);
    border-color: rgba(255,107,53,0.5);
  }
  
  ${p => p.$selected && css`
    animation: ${pulse} 0.5s ease;
    box-shadow: 0 15px 40px rgba(255,107,53,0.5);
  `}
`

const CardIcon = styled.div`
  font-size: 45px;
  margin-bottom: 10px;
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
`

const CardLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`

const CheckMark = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  animation: ${pulse} 0.4s ease;
`

const SelectedCount = styled.div`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 30px;
  font-weight: 600;
  padding: 12px 24px;
  background: rgba(255,107,53,0.1);
  border-radius: 30px;
  display: inline-block;
  border: 2px solid rgba(255,107,53,0.3);
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
