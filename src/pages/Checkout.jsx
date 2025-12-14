import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { showToast } from '../components/Toast.jsx'
import styled, { keyframes } from 'styled-components'

const PLANS = {
  basic: { name: 'Basic', price: 9.99, features: ['AI Workout Plans', 'Custom Meal Plans', 'Priority Support'] },
  pro: { name: 'Pro', price: 19.99, features: ['Advanced Analytics', 'Video Tutorials', '1-on-1 Coaching', 'No Ads'] },
  premium: { name: 'Premium', price: 29.99, features: ['Personalized Training', 'Nutrition Consultation', 'Exclusive Content', 'Early Access'] }
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      showToast('Please login to continue', 'error')
      navigate('/?auth=login')
    }
    if (!plan || !PLANS[plan]) {
      showToast('Invalid plan selected', 'error')
      navigate('/services')
    }
  }, [user, plan, navigate])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    try {
      setPromoLoading(true)
      const response = await api('/promo/validate', {
        method: 'POST',
        body: { code: promoCode, plan },
        token
      })
      setPromoApplied(response)
      showToast(`Promo code applied! ${response.discount}${response.discountType === 'percentage' ? '%' : '$'} off`, 'success')
    } catch (error) {
      showToast(error.message || 'Invalid promo code', 'error')
      setPromoApplied(null)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleCheckout = async () => {
    showToast('Payment system temporarily unavailable. Coming soon!', 'info')
  }

  if (!plan || !PLANS[plan]) return null

  const selectedPlan = PLANS[plan]
  const originalPrice = selectedPlan.price
  const discount = promoApplied ? (promoApplied.discountType === 'percentage' ? (originalPrice * promoApplied.discount / 100) : promoApplied.discount) : 0
  const finalPrice = Math.max(0, originalPrice - discount)

  return (
    <Container>
      <Card>
        <Header>
          <BackButton onClick={() => navigate('/services')}>← Back</BackButton>
          <Title>Complete Your Purchase</Title>
        </Header>

        <PlanSummary>
          <PlanBadge>{selectedPlan.name} Plan</PlanBadge>
          <PlanPrice>${selectedPlan.price}<span>/month</span></PlanPrice>
          <FeatureList>
            {selectedPlan.features.map((feature, i) => (
              <Feature key={i}>✓ {feature}</Feature>
            ))}
          </FeatureList>
        </PlanSummary>

        <Divider />

        <UserInfo>
          <InfoRow>
            <Label>Account:</Label>
            <Value>{user?.email}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Plan:</Label>
            <Value>{selectedPlan.name}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Billing:</Label>
            <Value>Monthly</Value>
          </InfoRow>
        </UserInfo>

        <Divider />

        <PromoSection>
          <PromoLabel>Have a promo code?</PromoLabel>
          <PromoInputGroup>
            <PromoInput 
              type="text" 
              placeholder="Enter code" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={promoApplied}
            />
            <PromoButton onClick={handleApplyPromo} disabled={promoLoading || promoApplied || !promoCode.trim()}>
              {promoLoading ? '...' : promoApplied ? '✓ Applied' : 'Apply'}
            </PromoButton>
          </PromoInputGroup>
          {promoApplied && (
            <PromoSuccess>🎉 {promoApplied.description || `${promoApplied.discount}${promoApplied.discountType === 'percentage' ? '%' : '$'} discount applied!`}</PromoSuccess>
          )}
        </PromoSection>

        <Divider />

        <Total>
          <div>
            <TotalLabel>Total Due Today</TotalLabel>
            {promoApplied && <OriginalPrice>${originalPrice.toFixed(2)}</OriginalPrice>}
          </div>
          <TotalAmount>${finalPrice.toFixed(2)}</TotalAmount>
        </Total>

        <CheckoutButton onClick={handleCheckout} disabled={loading}>
          {loading ? '⏳ Processing...' : '🔒 Proceed to Payment'}
        </CheckoutButton>

        <SecurityNote>
          🔒 Secure payment powered by Stripe. Your payment information is encrypted and secure.
        </SecurityNote>
      </Card>
    </Container>
  )
}

const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.6s ease;
`

const Header = styled.div`
  margin-bottom: 30px;
`

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #ff6b35;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  &:hover { transform: translateX(-5px); }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`

const PlanSummary = styled.div`
  background: rgba(255, 107, 53, 0.05);
  border: 2px solid rgba(255, 107, 53, 0.2);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
`

const PlanBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 15px;
`

const PlanPrice = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
  span { font-size: 1.2rem; color: #aaa; }
`

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Feature = styled.div`
  color: #ddd;
  font-size: 1rem;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 30px 0;
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Label = styled.div`
  color: #aaa;
  font-size: 1rem;
`

const Value = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
`

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 12px;
  margin-bottom: 25px;
`

const TotalLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
`

const TotalAmount = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #ff6b35;
`

const CheckoutButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 107, 53, 0.5);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SecurityNote = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  margin-top: 20px;
`

const PromoSection = styled.div`
  margin: 20px 0;
`

const PromoLabel = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 10px;
`

const PromoInputGroup = styled.div`
  display: flex;
  gap: 10px;
`

const PromoInput = styled.input`
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 107, 53, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PromoButton = styled.button`
  padding: 12px 24px;
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.5);
  border-radius: 8px;
  color: #ff6b35;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 107, 53, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PromoSuccess = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #4caf50;
  font-size: 0.9rem;
`

const OriginalPrice = styled.div`
  color: #888;
  font-size: 0.9rem;
  text-decoration: line-through;
  margin-top: 5px;
`
