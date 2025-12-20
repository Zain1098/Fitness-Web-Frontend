import { useState, useEffect } from 'react'
import styled from 'styled-components'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.pageYOffset > 300)
    }
    window.addEventListener('scroll', toggleVisible)
    return () => window.removeEventListener('scroll', toggleVisible)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <StyledButton onClick={scrollToTop} className={visible ? 'visible' : ''}>
      <i className="fa fa-arrow-up"></i>
    </StyledButton>
  )
}

const StyledButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #14e1ff, #7deaff);
  border: none;
  border-radius: 50%;
  color: #031b24;
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 8px 25px rgba(20, 225, 255, 0.4);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;

  &.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(20, 225, 255, 0.6);
  }

  &:active {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
`
