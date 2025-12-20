import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const plan = searchParams.get('plan')

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard?payment=success&plan=' + plan)
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate, plan])

  return (
    <Container>
      <Card>
        <Icon>🎉</Icon>
        <Title>Payment Successful!</Title>
        <Message>Your {plan} plan subscription is now active.</Message>
        <OrderId>Order ID: {orderId}</OrderId>
        <Redirect>Redirecting to dashboard in 3 seconds...</Redirect>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard Now</Button>
      </Card>
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  padding: 20px;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  backdrop-filter: blur(10px);
`

const Icon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8ef3c9, #14e1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
`

const Message = styled.p`
  color: #ddd;
  font-size: 1.2rem;
  margin-bottom: 20px;
`

const OrderId = styled.p`
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 30px;
  font-family: monospace;
`

const Redirect = styled.p`
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 20px;
`

const Button = styled.button`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
`

export default PaymentSuccess
