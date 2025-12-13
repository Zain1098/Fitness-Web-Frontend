import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import styled, { keyframes } from 'styled-components'

export default function PromoPopup() {
  const [show, setShow] = useState(false)
  const [promo, setPromo] = useState(null)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem('promoSeen')
    if (hasSeenPromo) return

    const timer = setTimeout(async () => {
      try {
        const data = await api('/promo/active', { method: 'GET' })
        if (data.promo) {
          setPromo(data.promo)
          setShow(true)
          sessionStorage.setItem('promoSeen', 'true')
        }
      } catch (err) {
        console.error('Failed to fetch promo:', err)
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(promo.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClaim = () => {
    copyCode()
    setTimeout(() => {
      setShow(false)
      navigate('/services')
    }, 1000)
  }

  if (!show || !promo) return null

  const expiryDate = new Date(promo.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Overlay onClick={() => setShow(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={() => setShow(false)}>×</CloseBtn>
        
        <Badge>🎉 LIMITED TIME OFFER</Badge>
        
        <Title>Special Discount Just For You!</Title>
        <Description>{promo.description || `Get ${promo.discount}${promo.discountType === 'percentage' ? '%' : '$'} off on premium plans`}</Description>
        
        <CodeBox onClick={copyCode}>
          <CodeLabel>Promo Code</CodeLabel>
          <Code>{promo.code}</Code>
          <CopyIcon>{copied ? '✓ Copied!' : '📋 Click to Copy'}</CopyIcon>
        </CodeBox>
        
        <Discount>{promo.discount}{promo.discountType === 'percentage' ? '%' : '$'} OFF</Discount>
        
        <Expiry>⏰ Expires: {expiryDate}</Expiry>
        
        <ClaimBtn onClick={handleClaim}>
          🚀 Claim Offer Now
        </ClaimBtn>
        
        <SkipBtn onClick={() => setShow(false)}>Maybe Later</SkipBtn>
      </Modal>
    </Overlay>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

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
  animation: ${fadeIn} 0.3s ease;
  padding: 20px;
`

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 25px;
  padding: 40px 30px;
  max-width: 450px;
  width: 100%;
  position: relative;
  animation: ${slideUp} 0.4s ease;
  box-shadow: 0 20px 60px rgba(255, 107, 53, 0.3);
  text-align: center;
`

const CloseBtn = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 107, 53, 0.2);
    transform: rotate(90deg);
  }
`

const Badge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 1px;
`

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 15px 0;
`

const Description = styled.p`
  color: #aaa;
  font-size: 1rem;
  margin: 0 0 30px 0;
  line-height: 1.5;
`

const CodeBox = styled.div`
  background: rgba(255, 107, 53, 0.1);
  border: 2px dashed rgba(255, 107, 53, 0.5);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 107, 53, 0.15);
    border-color: rgba(255, 107, 53, 0.7);
    transform: scale(1.02);
  }
`

const CodeLabel = styled.div`
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 8px;
`

const Code = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #ff6b35;
  letter-spacing: 3px;
  margin-bottom: 8px;
`

const CopyIcon = styled.div`
  color: #888;
  font-size: 0.85rem;
`

const Discount = styled.div`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
`

const Expiry = styled.div`
  color: #ff6b35;
  font-size: 0.9rem;
  margin-bottom: 25px;
  font-weight: 600;
`

const ClaimBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  margin-bottom: 15px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
  }
`

const SkipBtn = styled.button`
  background: transparent;
  border: none;
  color: #888;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #fff;
  }
`
