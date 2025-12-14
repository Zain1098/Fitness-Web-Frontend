import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

export default function PhysicalInfoStep({ data, updateData, nextStep, prevStep }) {
  const [age, setAge] = useState(data.age || '')
  const [height, setHeight] = useState(data.height || '')
  const [weight, setWeight] = useState(data.weight || '')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')

  const handleNext = () => {
    if (age && height && weight) {
      updateData('age', age)
      updateData('height', heightUnit === 'cm' ? height : (parseFloat(heightFeet || 0) * 30.48 + parseFloat(heightInches || 0) * 2.54).toFixed(1))
      updateData('weight', weightUnit === 'kg' ? weight : (parseFloat(weight) * 0.453592).toFixed(1))
      nextStep()
    }
  }

  const toggleHeightUnit = () => {
    if (heightUnit === 'cm' && height) {
      const totalInches = height / 2.54
      setHeightFeet(Math.floor(totalInches / 12))
      setHeightInches((totalInches % 12).toFixed(0))
      setHeight('')
    } else if (heightUnit === 'ft' && (heightFeet || heightInches)) {
      const cm = (parseFloat(heightFeet || 0) * 30.48 + parseFloat(heightInches || 0) * 2.54).toFixed(0)
      setHeight(cm)
      setHeightFeet('')
      setHeightInches('')
    }
    setHeightUnit(heightUnit === 'cm' ? 'ft' : 'cm')
  }

  const toggleWeightUnit = () => {
    if (weight) {
      setWeight(weightUnit === 'kg' ? (weight * 2.20462).toFixed(1) : (weight * 0.453592).toFixed(1))
    }
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')
  }

  const isValid = age && weight && age > 0 && weight > 0 && (heightUnit === 'cm' ? height > 0 : (heightFeet > 0 || heightInches > 0))

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>📊</AnimatedIcon>
        </IconWrapper>
        <Title>Tell us about yourself</Title>
        <Subtitle>Your physical stats help us create the perfect plan</Subtitle>
        
        <FormGrid>
          <InputGroup>
            <Label>Age</Label>
            <InputWrapper>
              <Icon>🎂</Icon>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min="1"
                max="120"
              />
              <Unit>years</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>Height</Label>
              <UnitToggle onClick={toggleHeightUnit}>
                {heightUnit === 'cm' ? '📏 ft/in' : '📏 cm'}
              </UnitToggle>
            </LabelRow>
            {heightUnit === 'cm' ? (
              <InputWrapper>
                <Icon>📏</Icon>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="1"
                  max="300"
                />
                <Unit>cm</Unit>
              </InputWrapper>
            ) : (
              <FeetInputWrapper>
                <InputWrapper style={{flex: 1}}>
                  <Icon>📏</Icon>
                  <Input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="5"
                    min="0"
                    max="8"
                  />
                  <Unit>ft</Unit>
                </InputWrapper>
                <InputWrapper style={{flex: 1}}>
                  <Input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="8"
                    min="0"
                    max="11"
                  />
                  <Unit>in</Unit>
                </InputWrapper>
              </FeetInputWrapper>
            )}
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>Weight</Label>
              <UnitToggle onClick={toggleWeightUnit}>
                {weightUnit === 'kg' ? '⚖️ lbs' : '⚖️ kg'}
              </UnitToggle>
            </LabelRow>
            <InputWrapper>
              <Icon>⚖️</Icon>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightUnit === 'kg' ? '70' : '154'}
                min="1"
                max={weightUnit === 'kg' ? '500' : '1100'}
              />
              <Unit>{weightUnit}</Unit>
            </InputWrapper>
          </InputGroup>
        </FormGrid>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
          <NextButton onClick={handleNext} disabled={!isValid}>
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
  0%, 100% { box-shadow: 0 0 20px rgba(20,225,255,0.3); }
  50% { box-shadow: 0 0 40px rgba(20,225,255,0.6); }
`

const StepWrapper = styled.div`
  width: 100%;
  max-width: 700px;
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
  filter: drop-shadow(0 10px 30px rgba(20,225,255,0.3));
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

const FormGrid = styled.div`
  display: grid;
  gap: 30px;
  margin-bottom: 50px;
  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`

const InputGroup = styled.div`
  text-align: left;
`

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const UnitToggle = styled.button`
  background: rgba(20,225,255,0.1);
  border: 1px solid rgba(20,225,255,0.3);
  color: #14e1ff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(20,225,255,0.2);
    border-color: #14e1ff;
  }
`

const FeetInputWrapper = styled.div`
  display: flex;
  gap: 15px;
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
  border: 2px solid rgba(20,225,255,0.3);
  border-radius: 15px;
  padding: 5px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:focus-within {
    border-color: #14e1ff;
    animation: ${glow} 2s infinite;
  }
`

const Icon = styled.div`
  font-size: 28px;
  padding: 0 15px;
  filter: drop-shadow(0 2px 8px rgba(20,225,255,0.3));
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
    border-color: rgba(255,255,255,0.4);
  }
`

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #14e1ff, #7deaff);
  color: #0a0e27;
  box-shadow: 0 10px 40px rgba(20,225,255,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(20,225,255,0.6);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`
