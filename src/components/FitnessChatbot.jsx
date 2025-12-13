import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import { API_BASE_URL } from '@/config/api.js'
import './FitnessChatbot.css'

export default function FitnessChatbot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastMessage, setLastMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hey ${user?.username || 'there'}! 👋\n\nI'm your FitForge AI coach, here to help you crush your fitness goals!\n\nI can assist with:\n💪 Personalized workout plans\n🥗 Nutrition & meal guidance\n📊 Progress tracking strategies\n🎯 Goal setting & motivation\n\nWhat can I help you with today?`
      }])
    }
  }, [isOpen])

  const sendMessage = async (retryMsg = null) => {
    const messageToSend = retryMsg || input
    console.log('sendMessage called:', { messageToSend, loading, inputLength: input.length })
    
    if (!messageToSend.trim() || loading) {
      console.log('Message blocked:', { isEmpty: !messageToSend.trim(), loading })
      return
    }

    const userMessage = { role: 'user', content: messageToSend }
    if (!retryMsg) {
      setMessages(prev => [...prev, userMessage])
      setLastMessage(messageToSend)
    }
    setInput('')
    setLoading(true)

    try {
      const apiUrl = `${API_BASE_URL}/chat`
      console.log('Sending to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          history: messages.slice(-6)
        })
      })

      console.log('Response status:', response.status)
      console.log('Response content-type:', response.headers.get('content-type'))
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        throw new Error(data.error || 'No reply from server')
      }
    } catch (error) {
      console.error('Chat error:', error)
      let errorMsg = ''
      
      if (error.message.includes('Backend server not responding')) {
        errorMsg = "I'm having trouble connecting to my AI brain right now. Please try again in a moment! 🔄"
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = "Oops! I'm temporarily unavailable. Please refresh the page and try again. 🔄"
      } else if (error.message.includes('API key')) {
        errorMsg = "I'm experiencing some technical difficulties. Our team has been notified. Please try again later! 🛠️"
      } else {
        errorMsg = "Sorry, I couldn't process that. Could you try asking in a different way? 💭"
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    'Create a workout plan for me',
    'What should I eat to build muscle?',
    'Best exercises for weight loss',
    'How do I stay motivated?'
  ]

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🤖</span>
              <div>
                <h3>FitForge AI Coach</h3>
                <span className="chatbot-status">● Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            {!loading && messages.length > 0 && messages[messages.length - 1].content.includes('try again') && (
              <div style={{ padding: '10px 20px', textAlign: 'center' }}>
                <button 
                  className="quick-btn" 
                  onClick={() => {
                    setMessages(prev => prev.slice(0, -1))
                    sendMessage(lastMessage)
                  }}
                  style={{ background: 'rgba(255, 107, 53, 0.2)', border: '1px solid #ff6b35' }}
                >
                  🔄 Try Again
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-questions">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-btn"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (e.g., 'Create a workout plan')"
              rows="1"
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
