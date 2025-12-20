import { Link } from 'react-router-dom'
import styled from 'styled-components'

const NotFound = () => {
  return (
    <Container>
      <Code>404</Code>
      <Title>Page Not Found</Title>
      <Message>The page you're looking for doesn't exist.</Message>
      <HomeLink to="/">Go Back Home</HomeLink>
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  padding: 20px;
`

const Code = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`

const Title = styled.h2`
  font-size: 2rem;
  color: #fff;
  margin: 20px 0 10px;
`

const Message = styled.p`
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 30px;
`

const HomeLink = styled(Link)`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  padding: 15px 40px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
`

export default NotFound
