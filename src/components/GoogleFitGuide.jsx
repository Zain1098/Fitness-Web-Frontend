import { useState, useEffect } from 'react'
import styled from 'styled-components'

export default function GoogleFitGuide({ onClose, onConnect }) {
  const [step, setStep] = useState(1)

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        
        {step === 1 && (
          <>
            <Icon>📱</Icon>
            <Title>Connect Google Fit</Title>
            <Description>
              Automatically sync your fitness data from Google Fit app to FitForge!
            </Description>
            <Features>
              <Feature>
                <FeatureIcon>👟</FeatureIcon>
                <FeatureText>
                  <strong>Steps</strong>
                  <span>Auto-sync daily steps</span>
                </FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>🔥</FeatureIcon>
                <FeatureText>
                  <strong>Calories</strong>
                  <span>Track calories burned</span>
                </FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>⚖️</FeatureIcon>
                <FeatureText>
                  <strong>Weight</strong>
                  <span>Sync weight measurements</span>
                </FeatureText>
              </Feature>
              <Feature>
                <FeatureIcon>💪</FeatureIcon>
                <FeatureText>
                  <strong>Activity</strong>
                  <span>Track active minutes</span>
                </FeatureText>
              </Feature>
            </Features>
            <Button onClick={() => setStep(2)}>Next →</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Icon>📲</Icon>
            <Title>Setup Instructions</Title>
            <Steps>
              <Step>
                <StepNumber>1</StepNumber>
                <StepText>
                  <strong>Install Google Fit</strong>
                  <span>Download from Play Store or App Store</span>
                </StepText>
              </Step>
              <Step>
                <StepNumber>2</StepNumber>
                <StepText>
                  <strong>Use Same Email</strong>
                  <span>Login with the same email you use on FitForge</span>
                </StepText>
              </Step>
              <Step>
                <StepNumber>3</StepNumber>
                <StepText>
                  <strong>Record Your Data</strong>
                  <span>Google Fit will track your steps, weight & activities</span>
                </StepText>
              </Step>
              <Step>
                <StepNumber>4</StepNumber>
                <StepText>
                  <strong>Connect Here</strong>
                  <span>Click "Connect Google Fit" to sync your data</span>
                </StepText>
              </Step>
            </Steps>
            <ButtonGroup>
              <BackButton onClick={() => setStep(1)}>← Back</BackButton>
              <Button onClick={() => {
                onClose()
                if (onConnect) onConnect()
              }}>Connect Now 🚀</Button>
            </ButtonGroup>
          </>
        )}
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  position: relative;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const CloseBtn = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
  &:hover { opacity: 1; }
`

const Icon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: 20px;
`

const Title = styled.h2`
  color: #fff;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 15px;
`

const Description = styled.p`
  color: #aaa;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 30px;
`

const Features = styled.div`
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
`

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const FeatureIcon = styled.div`
  font-size: 2rem;
`

const FeatureText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  strong { color: #fff; font-size: 1rem; }
  span { color: #999; font-size: 0.85rem; }
`

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
`

const StepNumber = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
`

const StepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  strong { color: #fff; font-size: 1rem; }
  span { color: #999; font-size: 0.9rem; }
`

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s;
  &:hover { transform: translateY(-2px); }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`

const BackButton = styled.button`
  flex: 1;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  &:hover { background: rgba(255, 255, 255, 0.15); }
`
