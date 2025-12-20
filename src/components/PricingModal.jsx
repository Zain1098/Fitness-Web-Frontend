import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { showToast } from './Toast'
import styled from 'styled-components'
import PricingCard from './ui/PricingCard'

export default function PricingModal({ open, onClose }) {
  const [plans, setPlans] = useState([])
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      fetchPlans()
    }
  }, [open])

  const fetchPlans = async () => {
    try {
      const data = await api('/pricing')
      setPlans(data.plans || [])
    } catch (error) {
      showToast('Failed to load plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanClick = (planId) => {
    if (!user) {
      showToast('Please login first', 'info')
      onClose()
      navigate(`/?auth=login&redirect=${encodeURIComponent(`/checkout?plan=${planId}`)}`)
      return
    }
    
    if (planId === 'free') {
      showToast('You are already on free plan', 'info')
      onClose()
      return
    }
    
    onClose()
    navigate(`/checkout?plan=${planId}&annual=${annual}`)
  }

  if (!open) return null

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Choose Your Plan</h2>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>
        
        <BillingToggle>
          <ToggleBtn $active={!annual} onClick={() => setAnnual(false)}>Monthly</ToggleBtn>
          <ToggleBtn $active={annual} onClick={() => setAnnual(true)}>Annual <span>Save 17%</span></ToggleBtn>
        </BillingToggle>

        {loading ? (
          <LoadingState>Loading plans...</LoadingState>
        ) : (
          <CardsGrid>
            {plans.filter(p => p.planId === 'free' || p.planId === 'premium' || p.planId === 'pro' || p.planId === 'basic').slice(0, 2).map((plan) => (
              <PricingCard
                key={plan.planId}
                badge={plan.badge}
                tier={plan.name}
                price={annual ? `Rs. ${plan.annualPrice}` : `Rs. ${plan.monthlyPrice}`}
                unit={annual ? 'year' : 'month'}
                description={plan.description}
                features={plan.features}
                cta={plan.planId === 'free' ? 'Current Plan' : 'Subscribe'}
                onClick={() => handlePlanClick(plan.planId)}
              />
            ))}
          </CardsGrid>
        )}
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`

const Modal = styled.div`
  background: #0b1220;
  border-radius: 20px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(91, 225, 255, 0.3);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0;
    color: #fff;
    font-size: 1.8rem;
  }
`

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ff6b35;
  }
`

const BillingToggle = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
`

const ToggleBtn = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid ${p => p.$active ? '#ff6b35' : 'rgba(255, 255, 255, 0.2)'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #ff6b35, #ff8c42)' : 'transparent'};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  span {
    font-size: 0.8rem;
    color: #8ef3c9;
    margin-left: 5px;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
`

const CardsGrid = styled.div`
  display: flex;
  gap: 24px;
  padding: 30px;
  justify-content: center;
  flex-wrap: wrap;
`

const LoadingState = styled.div`
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 1.2rem;
`
