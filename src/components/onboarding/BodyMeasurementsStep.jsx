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
        <Subtitle>Track your progress with detailed measurements (optional)</Subtitle>
        
        <UnitToggleBtn onClick={toggleUnit}>
          Using {unit === 'cm' ? 'Centimeters' : 'Inches'} • Switch to {unit === 'cm' ? 'Inches' : 'CM'}
        </UnitToggleBtn>

        <FormGrid>
          <InputGroup>
            <Label>💪 Chest</Label>
            <InputWrapper>
              <Input type="number" value={chest} onChange={(e) => setChest(e.target.value)} placeholder={unit === 'cm' ? '95' : '37'} />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>⭕ Waist</Label>
            <InputWrapper>
              <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={unit === 'cm' ? '80' : '31'} />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>🍑 Hips</Label>
            <InputWrapper>
              <Input type="number" value={hips} onChange={(e) => setHips(e.target.value)} placeholder={unit === 'cm' ? '95' : '37'} />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>💪 Arms</Label>
            <InputWrapper>
              <Input type="number" value={arms} onChange={(e) => setArms(e.target.value)} placeholder={unit === 'cm' ? '35' : '14'} />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>🦵 Thighs</Label>
            <InputWrapper>
              <Input type="number" value={thighs} onChange={(e) => setThighs(e.target.value)} placeholder={unit === 'cm' ? '55' : '22'} />
              <Unit>{unit}</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>📊 Body Fat %</Label>
            <InputWrapper>
              <Input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="15" min="3" max="50" />
              <Unit>%</Unit>
            </InputWrapper>
          </InputGroup>
        </FormGrid>

        <ButtonGroup>
          <BackButton onClick={prevStep}><span>←</span> Back</BackButton>
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease;
  @media (max-width: 768px) {
    padding: 15px;
  }
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
  filter: drop-shadow(0 10px 30px rgba(138,43,226,0.4));
`

const Title = styled.h1`
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #8a2be2, #da70d6, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
  word-break: break-word;
  padding: 0 10px;
`

const Subtitle = styled.p`
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  color: rgba(255,255,255,0.7);
  margin-bottom: 30px;
  padding: 0 10px;
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`

const UnitToggleBtn = styled.button`
  background: rgba(138,43,226,0.15);
  border: 2px solid rgba(138,43,226,0.4);
  color: #da70d6;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 30px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(138,43,226,0.25);
    border-color: #8a2be2;
  }
  
  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

const InputGroup = styled.div`
  text-align: left;
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
  border: 2px solid rgba(138,43,226,0.3);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.3s ease;
  width: 100%;
  gap: 10px;
  
  &:focus-within {
    border-color: #8a2be2;
    animation: ${glow} 2s infinite;
  }
`



const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.5rem;
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
    font-size: 1.3rem;
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

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #8a2be2, #da70d6);
  color: #fff;
  box-shadow: 0 10px 40px rgba(138,43,226,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(138,43,226,0.6);
  }
`
