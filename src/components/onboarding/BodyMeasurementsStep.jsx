import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

export default function BodyMeasurementsStep({ data, updateData, nextStep, prevStep }) {
  const [chest, setChest] = useState(data.bodyMeasurements?.chest || '')
  const [waist, setWaist] = useState(data.bodyMeasurements?.waist || '')
  const [hips, setHips] = useState(data.bodyMeasurements?.hips || '')
  const [arms, setArms] = useState(data.bodyMeasurements?.arms || '')
  const [thighs, setThighs] = useState(data.bodyMeasurements?.thighs || '')
  const [bodyFat, setBodyFat] = useState(data.bodyFatPercentage || '')
  const [unit, setUnit] = useState('cm')

  // Auto-calculate body fat using Navy Method (approximate)
  const calculateBodyFat = () => {
    if (!waist || !data.height || !data.weight) return
    
    const waistCm = unit === 'cm' ? parseFloat(waist) : parseFloat(waist) * 2.54
    const heightCm = parseFloat(data.height)
    const weightKg = parseFloat(data.weight)
    
    if (data.gender === 'male') {
      // Navy Method for men (simplified)
      const neckCm = 40 // Default estimate
      const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
      setBodyFat(Math.max(5, Math.min(50, bf)).toFixed(1))
    } else if (data.gender === 'female') {
      // Navy Method for women (simplified)
      const neckCm = 35 // Default estimate
      const hipsCm = hips ? (unit === 'cm' ? parseFloat(hips) : parseFloat(hips) * 2.54) : waistCm * 1.2
      const bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450
      setBodyFat(Math.max(10, Math.min(50, bf)).toFixed(1))
    }
  }

  const handleNext = () => {
    const measurements = {
      chest: chest ? (unit === 'cm' ? chest : (chest * 2.54).toFixed(1)) : '',
      waist: waist ? (unit === 'cm' ? waist : (waist * 2.54).toFixed(1)) : '',
      hips: hips ? (unit === 'cm' ? hips : (hips * 2.54).toFixed(1)) : '',
      arms: arms ? (unit === 'cm' ? arms : (arms * 2.54).toFixed(1)) : '',
      thighs: thighs ? (unit === 'cm' ? thighs : (thighs * 2.54).toFixed(1)) : ''
    }
    updateData('bodyMeasurements', measurements)
    updateData('bodyFatPercentage', bodyFat)
    nextStep()
  }

  const handleSkip = () => {
    updateData('bodyMeasurements', {})
    updateData('bodyFatPercentage', '')
    nextStep()
  }

  const toggleUnit = () => {
    const convert = (val) => unit === 'cm' ? (val / 2.54).toFixed(1) : (val * 2.54).toFixed(1)
    if (chest) setChest(convert(chest))
    if (waist) setWaist(convert(waist))
    if (hips) setHips(convert(hips))
    if (arms) setArms(convert(arms))
    if (thighs) setThighs(convert(thighs))
    setUnit(unit === 'cm' ? 'in' : 'cm')
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>📐</AnimatedIcon>
        </IconWrapper>
        <Title>Body Measurements</Title>
        <Subtitle>Track your progress with detailed measurements (Optional)</Subtitle>
        
        <InfoBox>
          <InfoIcon>📏</InfoIcon>
          <InfoText>
            <strong>How to measure:</strong> Use a measuring tape around the widest part of each area. Keep tape parallel to the ground and snug but not tight.
          </InfoText>
        </InfoBox>

        <FormGrid>
          <InputGroup>
            <LabelRow>
              <Label>💪 Chest</Label>
              <UnitToggle onClick={toggleUnit}>
                {unit === 'cm' ? '📏 in' : '📏 cm'}
              </UnitToggle>
            </LabelRow>
            <HelpText>Widest part</HelpText>
            <InputWrapper>
              <Input type="number" value={chest} onChange={(e) => setChest(e.target.value)} placeholder={unit === 'cm' ? '95' : '37'} step="0.1" />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>⭕ Waist</Label>
              <HelpText>At belly button</HelpText>
            </LabelRow>
            <InputWrapper>
              <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={unit === 'cm' ? '80' : '31'} step="0.1" />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>🍑 Hips</Label>
              <HelpText>Widest part</HelpText>
            </LabelRow>
            <InputWrapper>
              <Input type="number" value={hips} onChange={(e) => setHips(e.target.value)} placeholder={unit === 'cm' ? '95' : '37'} step="0.1" />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>💪 Arms</Label>
              <HelpText>Flexed bicep</HelpText>
            </LabelRow>
            <InputWrapper>
              <Input type="number" value={arms} onChange={(e) => setArms(e.target.value)} placeholder={unit === 'cm' ? '35' : '14'} step="0.1" />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>🦵 Thighs</Label>
              <HelpText>Upper thigh</HelpText>
            </LabelRow>
            <InputWrapper>
              <Input type="number" value={thighs} onChange={(e) => setThighs(e.target.value)} placeholder={unit === 'cm' ? '55' : '22'} step="0.1" />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>📊 Body Fat %</Label>
              <HelpText>Optional</HelpText>
            </LabelRow>
            <InputWrapper>
              <Input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="15" min="3" max="50" step="0.1" />
              <Unit>%</Unit>
            </InputWrapper>
            <AutoCalcButton onClick={calculateBodyFat} disabled={!waist || !data.height}>
              🧮 Auto Calculate
            </AutoCalcButton>
            <BodyFatGuide>
              💡 Men: 10-20% Athletic, 20-25% Average | Women: 18-28% Athletic, 28-35% Average
            </BodyFatGuide>
          </InputGroup>
        </FormGrid>

        <Hint>💡 Don't have a measuring tape? You can skip this and add measurements later from your profile!</Hint>

        <ButtonGroup>
          <BackButton onClick={prevStep}><span>←</span> Back</BackButton>
          <SkipButton onClick={handleSkip}>Skip for now</SkipButton>
          <NextButton onClick={handleNext}>Next <span>→</span></NextButton>
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
  50% { transform: translateY(-10px); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138,43,226,0.3); }
  50% { box-shadow: 0 0 40px rgba(138,43,226,0.6); }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease;
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`

const Content = styled.div`
  text-align: center;
`

const IconWrapper = styled.div`
  margin-bottom: 30px;
`

const AnimatedIcon = styled.div`
  font-size: 70px;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(255,107,53,0.4));
  
  @media (max-width: 768px) {
    font-size: 60px;
  }
`

const Title = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, #14e1ff, #7deaff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  word-break: break-word;
  padding: 0 10px;
`

const Subtitle = styled.p`
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  color: rgba(255,255,255,0.7);
  margin-bottom: 25px;
  padding: 0 10px;
  line-height: 1.5;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
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

const HelpText = styled.span`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  font-style: italic;
  font-weight: 400;
`

const UnitToggle = styled.button`
  background: rgba(255,107,53,0.1);
  border: 1px solid rgba(255,107,53,0.3);
  color: #ff6b35;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,107,53,0.2);
    border-color: #ff6b35;
  }
`

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(20,225,255,0.1);
  border: 2px solid rgba(20,225,255,0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: left;
`

const InfoIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`

const InfoText = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.5;
  margin: 0;
  
  strong {
    color: #14e1ff;
  }
`

const AutoCalcButton = styled.button`
  width: 100%;
  padding: 10px;
  background: rgba(76,175,80,0.2);
  border: 2px solid rgba(76,175,80,0.4);
  border-radius: 10px;
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  
  &:hover:not(:disabled) {
    background: rgba(76,175,80,0.3);
    border-color: #4caf50;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const BodyFatGuide = styled.p`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin-top: 8px;
  line-height: 1.4;
`

const Hint = styled.p`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.6);
  margin: 20px 0;
  padding: 12px;
  background: rgba(255,107,53,0.1);
  border-radius: 10px;
  border: 1px solid rgba(255,107,53,0.2);
`

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,107,53,0.3);
  border-radius: 12px;
  padding: 12px 14px;
  transition: all 0.3s ease;
  width: 100%;
  gap: 8px;
  
  &:focus-within {
    border-color: #ff6b35;
    box-shadow: 0 0 20px rgba(255,107,53,0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`



const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0;
  min-width: 0;
  
  &::placeholder {
    color: rgba(255,255,255,0.3);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

const Unit = styled.span`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.6);
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 15px;
    margin-top: 30px;
  }
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
  
  @media (max-width: 768px) {
    padding: 15px 30px;
    font-size: 1rem;
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
    border-color: rgba(255,255,255,0.3);
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
`
