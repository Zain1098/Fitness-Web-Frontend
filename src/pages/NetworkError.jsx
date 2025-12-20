import styled from 'styled-components'

const NetworkError = () => {
  const handleRetry = () => window.location.reload()

  return (
    <Container>
      <Icon>📡</Icon>
      <Title>Network Error</Title>
      <Message>Unable to connect. Please check your internet connection.</Message>
      <Button onClick={handleRetry}>Retry</Button>
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

const Icon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 2rem;
  color: #fff;
  margin: 0 0 10px;
`

const Message = styled.p`
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 30px;
  text-align: center;
`

const Button = styled.button`
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  border: none;
  padding: 15px 40px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
`

export default NetworkError
