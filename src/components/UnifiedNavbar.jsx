import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'

export default function UnifiedNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const openAuthModal = () => {
    window.dispatchEvent(new Event('auth:open'))
    setMobileMenuOpen(false)
  }

  return (
    <Nav className={scrolled ? 'scrolled' : ''}>
      <Container>
        <Logo to="/">
          <LogoIcon className="flaticon-002-dumbell" />
          <LogoText>
            <span className="logo-white">Fit</span>
            <span className="logo-orange">Forge</span>
          </LogoText>
          <LogoIcon className="flaticon-014-heart-beat" />
        </Logo>

        <DesktopMenu>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/services">Pricing</NavLink>
          <NavLink to="/exercises">Exercises</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          
          {user ? (
            <>
              <NavLink to="/dashboard" className="dashboard-link">
                Dashboard
              </NavLink>
              <UserMenu>
                <UserButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <UserAvatar>{user.username?.[0]?.toUpperCase() || 'U'}</UserAvatar>
                  <span>{user.username}</span>
                  <Arrow>▼</Arrow>
                </UserButton>
                {userMenuOpen && (
                  <Dropdown>
                    <DropdownItem onClick={() => { navigate('/profile'); setUserMenuOpen(false) }}>
                      👤 Profile
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}>
                      ⚙️ Settings
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleLogout} className="logout">
                      🚪 Logout
                    </DropdownItem>
                  </Dropdown>
                )}
              </UserMenu>
            </>
          ) : (
            <AuthButtons>
              <LoginBtn onClick={openAuthModal}>Login</LoginBtn>
              <SignupBtn onClick={openAuthModal}>Sign Up</SignupBtn>
            </AuthButtons>
          )}
        </DesktopMenu>

        <MobileMenuBtn onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuBtn>
      </Container>

      {mobileMenuOpen && (
        <MobileMenu>
          <MobileLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileLink>
          <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileLink>
          <MobileLink to="/services" onClick={() => setMobileMenuOpen(false)}>Pricing</MobileLink>
          <MobileLink to="/exercises" onClick={() => setMobileMenuOpen(false)}>Exercises</MobileLink>
          <MobileLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileLink>
          
          {user ? (
            <>
              <MobileDivider />
              <MobileLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileLink>
              <MobileLink to="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</MobileLink>
              <MobileLogoutBtn onClick={handleLogout}>Logout</MobileLogoutBtn>
            </>
          ) : (
            <>
              <MobileDivider />
              <MobileAuthBtn onClick={openAuthModal}>Login / Sign Up</MobileAuthBtn>
            </>
          )}
        </MobileMenu>
      )}
    </Nav>
  )
}

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(10, 10, 10, 0.95);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`

const LogoIcon = styled.span`
  font-size: 24px;
  color: #ff6b35;
`

const LogoText = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;

  .logo-white { color: #fff; }
  .logo-orange { color: #ff6b35; }
`

const DesktopMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 968px) {
    display: none;
  }
`

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.3s ease;
  position: relative;

  &:hover {
    color: #ff6b35;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #ff6b35;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  &.dashboard-link {
    color: #00e5ff;
    font-weight: 600;
  }
`

const AuthButtons = styled.div`
  display: flex;
  gap: 12px;
`

const LoginBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff6b35;
    color: #ff6b35;
  }
`

const SignupBtn = styled.button`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border: none;
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
  }
`

const UserMenu = styled.div`
  position: relative;
`

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ff6b35;
  }
`

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`

const Arrow = styled.span`
  font-size: 10px;
  transition: transform 0.3s ease;
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  min-width: 180px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
  }

  &.logout {
    color: #f44336;
    &:hover {
      background: rgba(244, 67, 54, 0.1);
    }
  }
`

const DropdownDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
`

const MobileMenuBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 968px) {
    display: block;
  }
`

const MobileMenu = styled.div`
  display: none;
  background: rgba(10, 10, 10, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  animation: slideDown 0.3s ease;

  @media (max-width: 968px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`

const MobileLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
  }
`

const MobileDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
`

const MobileAuthBtn = styled.button`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border: none;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`

const MobileLogoutBtn = styled.button`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
  }
`
