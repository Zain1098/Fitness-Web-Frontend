import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

export default function OneRMStep({ data, updateData, nextStep, prevStep }) {
  const [bench, setBench] = useState(data.oneRM?.bench || '')
  const [squat, setSquat] = useState(data.oneRM?.squat || '')
  const [deadlift, setDeadlift] = useState(data.oneRM?.deadlift || '')

  const handleNext = () => {
    updateData('oneRM', { bench, squat, deadlift })
    nextStep()
  }

  return (
    <StepWrapper>
      <Content>
        <IconWrapper>
          <AnimatedIcon>🏋️</AnimatedIcon>
        </IconWrapper>
        <Title>Estimate your 1RM</Title>
        <Subtitle>One Rep Max - Maximum weight you can lift once (optional)</Subtitle>
        
        <FormGrid>
          <InputGroup>
            <Label>Bench Press</Label>
            <InputWrapper>
              <Icon>💪</Icon>
              <Input
                type="number"
                value={bench}
                onChange={(e) => setBench(e.target.value)}
                placeholder="60"
                min="0"
              />
              <Unit>kg</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Squat</Label>
            <InputWrapper>
              <Icon>🦵</Icon>
              <Input
                type="number"
                value={squat}
                onChange={(e) => setSquat(e.target.value)}
                placeholder="80"
                min="0"
              />
              <Unit>kg</Unit>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Deadlift</Label>
            <InputWrapper>
              <Icon>🏋️</Icon>
              <Input
                type="number"
                value={deadlift}
                onChange={(e) => setDeadlift(e.target.value)}
                placeholder="100"
                min="0"
              />
              <Unit>kg</Unit>
            </InputWrapper>
          </InputGroup>
        </FormGrid>

        <Hint>💡 Leave empty if you're not sure - we'll help you find out!</Hint>

        <ButtonGroup>
          <BackButton onClick={prevStep}>
            <span>←</span> Back
          </BackButton>
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

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #ff9f40, #ffcd56);
  color: #0a0e27;
  box-shadow: 0 10px 40px rgba(255,159,64,0.4);
  
  &:hover {
    box-shadow: 0 15px 50px rgba(255,159,64,0.6);
  }
`
