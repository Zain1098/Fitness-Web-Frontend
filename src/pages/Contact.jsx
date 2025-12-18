import { API_BASE_URL } from '../config/api.js'
import VisitorNavbar from '../components/VisitorNavbar.jsx'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import styled from 'styled-components'
import '../styles/neon.css'

export default function Contact(){
  return (
    <>
      <VisitorNavbar />
      <section className="ff-section ff-particles" id="contact-hero">
        <div className="ff-container">
          <div className="ff-mission-grid">
            <div className="ff-float-in" style={{ width:'min(520px, 52vw)' }}>
              <lottie-player src="/icons/Connect with us.json" background="transparent" speed="1" loop autoplay style={{ width:'100%', maxWidth:'520px' }}></lottie-player>
            </div>
            <div className="ff-panel ff-float-in" style={{ padding:'22px' }}>
              <h2 className="ff-title">Get in Touch with FitForge</h2>
              <p className="ff-sub" style={{ marginBottom:'12px' }}>Have a question, need support, or want to collaborate? Talk to us directly — no delays, no nonsense.</p>
              <p className="ff-sub" style={{ fontSize:'16px' }}>We’re here to help you with anything related to FirForge — whether it’s technical support, feedback, business inquiries, or partnership opportunities. Just reach out, and we’ll respond with clear, actionable answers.</p>
              <div style={{ display:'flex', gap:'12px', marginTop:'16px', flexWrap:'wrap' }}>
                <a href="#contact-form" className="ff-btn" onClick={(e)=>{ e.preventDefault(); document.getElementById('contact-form')?.scrollIntoView({ behavior:'smooth' }) }}>Get in Touch</a>
                <button className="primary-btn btn-normal" onClick={()=>window.dispatchEvent(new Event('auth:open'))} style={{ border:'none', cursor:'pointer' }}>Start Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ContactFormSection />
      <FooterSection />
    </>
  )
}

function ContactFormSection(){
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  
  const inputStyle = { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(91,225,255,.35)', borderRadius:'12px', padding:'12px 14px', color:'#fff' }
  const errorText = { color:'#ff6b6b', fontSize:'13px', marginTop:'6px' }
  
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    
    const newErrors = {}
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address'
    if (!formData.subject.trim() || formData.subject.length < 3) newErrors.subject = 'Subject must be at least 3 characters'
    if (!formData.message.trim() || formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters'
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }
    
    // Check for duplicate submission (within 5 minutes)
    const lastSubmission = localStorage.getItem('lastContactSubmission')
    if (lastSubmission) {
      const lastData = JSON.parse(lastSubmission)
      const timeDiff = Date.now() - lastData.timestamp
      if (timeDiff < 5 * 60 * 1000 && lastData.email === formData.email && lastData.subject === formData.subject) {
        setError('You already submitted this message recently. Please wait a few minutes.')
        return
      }
    }
    
    setLoading(true)
    try {
      const response = await fetch(API_BASE_URL + '/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Store submission info
        localStorage.setItem('lastContactSubmission', JSON.stringify({
          email: formData.email,
          subject: formData.subject,
          timestamp: Date.now()
        }))
        
        setStatus(data.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      } else {
        setError(data.message || 'Failed to send message')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="ff-section" id="contact-form">
      <div className="ff-container">
        <div className="ff-mission-grid">
          <div className="ff-panel ff-float-in" style={{ padding:'22px' }}>
            <h2 className="ff-title">Send a Message</h2>
            <form onSubmit={handleSubmit} className="ff-form-grid">
              <div style={{ display:'flex', flexDirection:'column' }}>
                <label className="ff-sub" style={{ marginBottom:'6px', color:'#ccc' }}>Full Name</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  style={{ ...inputStyle, border: errors.name ? '1px solid #ff6b6b' : inputStyle.border }} 
                />
                {errors.name && (<span style={errorText}>{errors.name}</span>)}
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                <label className="ff-sub" style={{ marginBottom:'6px', color:'#ccc' }}>Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  style={{ ...inputStyle, border: errors.email ? '1px solid #ff6b6b' : inputStyle.border }} 
                />
                {errors.email && (<span style={errorText}>{errors.email}</span>)}

              </div>
              <div style={{ gridColumn:'1 / -1', display:'flex', flexDirection:'column' }}>
                <label className="ff-sub" style={{ marginBottom:'6px', color:'#ccc' }}>Subject</label>
                <input 
                  name="subject" 
                  type="text" 
                  required 
                  value={formData.subject}
                  onChange={handleChange}
                  style={{ ...inputStyle, border: errors.subject ? '1px solid #ff6b6b' : inputStyle.border }} 
                />
                {errors.subject && (<span style={errorText}>{errors.subject}</span>)}
              </div>
              <div style={{ gridColumn:'1 / -1', display:'flex', flexDirection:'column' }}>
                <label className="ff-sub" style={{ marginBottom:'6px', color:'#ccc' }}>Your Message</label>
                <textarea 
                  name="message" 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                  style={{ ...inputStyle, minHeight:'140px', border: errors.message ? '1px solid #ff6b6b' : inputStyle.border }} 
                />
                {errors.message && (<span style={errorText}>{errors.message}</span>)}
              </div>
              {error && (
                <div style={{ gridColumn:'1 / -1', background:'rgba(255,107,107,0.1)', border:'1px solid #ff6b6b', color:'#ff6b6b', padding:'12px', borderRadius:'8px' }}>
                  {error}
                </div>
              )}
              {status && (
                <div style={{ gridColumn:'1 / -1', background:'rgba(76,175,80,0.1)', border:'1px solid #4caf50', color:'#4caf50', padding:'12px', borderRadius:'8px' }}>
                  ✓ {status}
                </div>
              )}
              <div style={{ gridColumn:'1 / -1' }}>
                <button type="submit" className="ff-btn" disabled={loading}>
                  {loading ? '⏳ Sending...' : '📧 Send Message'}
                </button>
              </div>
            </form>
          </div>
          <div className="ff-float-in" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SocialIcons />
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterSection(){
  return (
    <section className="footer-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="fs-about">
              <div className="fa-logo">
                <a href="/" className="logo-text">
                  <span className="logo-icon-left flaticon-002-dumbell"></span>
                  <span className="logo-white">Fit</span><span className="logo-orange">Forge</span>
                  <span className="logo-icon-right flaticon-014-heart-beat"></span>
                </a>
              </div>
              <p>Train smarter with data-driven tracking, AI-powered insights, and disciplined routines designed for real progress.</p>
              <div className="fa-social">
                <a href="#"><i className="fa fa-facebook"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-youtube-play"></i></a>
                <a href="#"><i className="fa fa-instagram"></i></a>
                <a href="#"><i className="fa fa-envelope-o"></i></a>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="fs-widget">
              <h4>Useful links</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/exercises">Exercises</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6">
            <div className="fs-widget">
              <h4>Support</h4>
              <ul>
                <li><a href="#" onClick={(e)=>{e.preventDefault(); window.dispatchEvent(new Event('auth:open'))}}>Login</a></li>
                <li><a href="/dashboard">My account</a></li>
                <li><a href="#" onClick={(e)=>{e.preventDefault(); window.dispatchEvent(new Event('auth:open'))}}>Sign Up</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="fs-widget">
              <h4>Tips & Guides</h4>
              <div className="fw-recent">
                <h6><a href="/about">Why Fitness Tracking Matters</a></h6>
                <ul>
                  <li>5 min read</li>
                </ul>
              </div>
              <div className="fw-recent">
                <h6><a href="/services">Choose the Right Plan for You</a></h6>
                <ul>
                  <li>4 min read</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 text-center">
            <div className="copyright-text">
              <p>
                Copyright &copy; {new Date().getFullYear()} All rights reserved | This template is made with <i className="fa fa-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank" rel="noreferrer">Colorlib</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialIcons(){
  const links = {
    instagram: '#',
    facebook: '#',
    linkedin: '#',
    twitch: '#',
  }
  return (
    <StyledWrapper>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 114 173" id="svg-container">
        <g>
          <path fillOpacity="0.3" fill="#414750" d="M6.5517 105.313L48.4827 129.435C52.4138 131.899 58.3103 133.531 65.1896 129.288L98.6034 110.029C108.103 104.741 109.414 104.089 109.82 101.543V108.969C109.82 110.693 109.227 112.007 108.17 112.622L98.6034 118.19L66.1724 136.795C59.6207 140.974 54.3793 140.974 48.4827 137.559L5.93929 113.1C4.68554 112.38 3.66895 110.625 3.66895 109.183V101.477C3.99512 103.22 4.62371 104.091 6.5517 105.313Z" />
          <path strokeOpacity="0.5" stroke="white" fillOpacity="0.3" fill="#414750" d="M6.52505 98.1152L50.782 72.6548C54.0722 70.7616 59.4069 70.7616 62.6973 72.6548L106.954 98.1152C110.245 100.008 110.245 103.077 106.954 104.97L63.2646 130.104C59.661 132.177 53.8182 132.177 50.2145 130.104L6.52505 104.97C3.23473 103.077 3.23473 100.008 6.52505 98.1152Z" />
          <path stroke="#DADADA" d="M51.4773 64.1132L14.4116 85.4366C11.4229 87.156 11.4229 89.9436 14.4116 91.663L51.4773 112.986C54.4661 114.706 59.3118 114.706 62.3005 112.986L99.3663 91.663C102.355 89.9436 102.355 87.156 99.3663 85.4366L62.3005 64.1132C59.3118 62.3938 54.4661 62.3938 51.4773 64.1132Z" id="line-animation-v1" />
          <path stroke="#DADADA" d="M52.2674 78.5847L21.4931 96.2887C19.0116 97.7163 19.0116 100.031 21.4931 101.458L52.2674 119.162C54.7488 120.59 58.772 120.59 61.2535 119.162L92.0278 101.458C94.5092 100.031 94.5092 97.7163 92.0278 96.2887L61.2535 78.5847C58.772 77.1572 54.7488 77.1572 52.2674 78.5847Z" id="line-animation-v2" />
          <path fill="url(#paint0_linear_54_145)" d="M6.5517 64.3775L48.4827 88.5C52.4138 90.9638 58.3103 92.5959 65.1896 88.3525L98.6034 69.094C108.5 63.5401 109.414 63.6133 109.82 61.0672V68.493C109.82 70.2178 109.227 71.5313 108.17 72.1462L98.6034 77.7142L66.1724 96.3199C59.6207 100.498 54.3793 100.498 48.4827 97.083L5.93929 72.6247C4.68554 71.904 3.66895 70.1499 3.66895 68.7078V61.002C3.99512 62.744 4.62371 63.1552 6.5517 64.3775Z" />
          <path fillOpacity="0.3" fill="#414750" d="M6.5517 72.6711L48.4827 96.7938C52.4138 99.2576 58.3103 100.89 65.1896 96.6463L98.6034 77.3878C108.103 72.0998 109.414 71.447 109.82 68.901V76.3269C109.82 78.0517 109.227 79.3652 108.17 79.9802L98.6034 85.5482L66.1724 104.154C59.6207 108.332 54.3793 108.332 48.4827 104.917L5.93929 80.4587C4.68554 79.738 3.66895 77.9838 3.66895 76.5417V68.8357C3.99512 70.5781 4.62371 71.449 6.5517 72.6711Z" />
          <path stroke="#3C4149" fill="url(#paint1_linear_54_145)" d="M6.67475 57.7257L50.9316 32.2653C54.1393 30.42 59.3399 30.42 62.5475 32.2653L106.804 57.7257C110.012 59.571 110.012 62.5628 106.804 64.4081L62.5475 89.8685C59.3399 91.7138 54.1393 91.7138 50.9316 89.8685L6.67475 64.4081C3.46711 62.5628 3.46711 59.571 6.67475 57.7257Z" />
          <path strokeWidth="0.5" strokeOpacity="0.3" stroke="white" d="M14.4148 58.4075L51.2752 37.1261C54.0265 35.5376 58.4873 35.5376 61.2387 37.1261L98.0991 58.4075C100.85 59.996 100.85 62.5714 98.0991 64.1599L61.2387 85.4413C58.4873 87.0298 54.0265 87.0298 51.2752 85.4413L14.4148 64.1599C11.6634 62.5714 11.6634 59.996 14.4148 58.4075Z" />
        </g>
        <a href={links.twitch} target="_blank" rel="noreferrer">
          <g id="id-repo-ghost-twich">
            <g className="react-path-v2">
              <rect fill="#9146FF5e" transform="matrix(0.866025 -0.5 0.866025 0.5 37.1982 49.0967)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="react-path-v1">
              <rect fill="#9146FF5e" transform="matrix(0.866025 -0.5 0.866025 0.5 37.1982 49.0967)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="container-g-icons" id="id-02-twich">
              <rect fill="#383D45" transform="matrix(0.866025 -0.5 0.866025 0.5 37.1982 49.0967)" rx="4" height="22.0331" width="22.0331" />
              <g clipPath="url(#clip2_54_145)">
                <path fill="white" d="M47.735 47.5298L47.735 49.8511L54.9727 54.0298L57.3855 52.6367L59.3959 53.7974L59.3959 51.4761L61.003 50.5482L61.0037 46.3691L55.3745 43.1191L47.735 47.5298ZM59.7976 46.6015L59.7976 48.4581L58.1891 49.3867L58.1891 51.0117L56.7818 50.1992L54.9727 51.2437L48.9418 47.7617L55.3745 44.0478L59.7976 46.6015Z" />
                <path fill="white" d="M55.5758 45.5567L54.7715 46.021L57.1829 47.4132L57.9872 46.9489L55.5758 45.5567ZM53.3642 46.8335L52.5599 47.2979L54.9713 48.6901L55.7756 48.2257L53.3642 46.8335Z" />
              </g>
            </g>
          </g>
        </a>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          <g id="id-repo-ghost-linkelind">
            <g className="react-path-v2">
              <rect fill="#0A66C25e" transform="matrix(0.866025 -0.5 0.866025 0.5 58.0114 61.1133)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="react-path-v1">
              <rect fill="#0A66C25e" transform="matrix(0.866025 -0.5 0.866025 0.5 58.0114 61.1133)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="container-g-icons" id="id-04-linkelind">
              <rect fill="#383D45" transform="matrix(0.866025 -0.5 0.866025 0.5 58.0114 61.1133)" rx="4" height="22.0331" width="22.0331" />
              <g clipPath="url(#clip3_54_145)">
                <path fill="white" d="M66.6407 61.5788C66.1953 61.3217 66.2044 60.8996 66.6611 60.6359L76.2658 55.0906C76.7225 54.827 77.4536 54.8217 77.899 55.0788L87.5446 60.6477C87.99 60.9049 87.9808 61.327 87.5242 61.5906L77.9194 67.1359C77.4627 67.3996 76.7316 67.4049 76.2862 67.1477L66.6407 61.5788ZM78.737 64.5465L73.6532 61.6113L71.9637 62.5868L77.0476 65.5219L78.737 64.5465ZM72.1143 61.6979C72.7033 61.3578 72.6801 60.9211 72.1917 60.6392C71.6823 60.3573 70.9477 60.3434 70.3693 60.6774C69.7909 61.0113 69.793 61.4488 70.2912 61.7365C70.7795 62.0184 71.5359 62.0318 72.1031 61.7044L72.1143 61.6979ZM81.3462 63.0401L78.5069 61.4009C78.355 61.3132 78.2142 61.2189 78.1509 61.1303C77.9694 60.885 77.9328 60.5429 78.4 60.2732C79.0115 59.9201 79.7214 60.0481 80.4054 60.443L83.125 62.0131L84.8144 61.0377L81.8985 59.3542C80.3364 58.4523 78.7771 58.5141 77.6654 59.156C76.7689 59.6735 76.8597 60.1899 76.9814 60.5202L76.999 60.5303L76.9878 60.5368L76.9814 60.5202L76.2623 60.105L74.5736 61.08C75.0717 61.3432 79.6574 64.0151 79.6574 64.0151L81.3462 63.0401Z" />
              </g>
            </g>
          </g>
        </a>
        <a href={links.facebook} target="_blank" rel="noreferrer">
          <g id="id-repo-ghost-facebook">
            <g className="react-path-v2">
              <rect fill="#1877F25e" transform="matrix(0.866025 -0.5 0.866025 0.5 16.4136 61.0967)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="react-path-v1">
              <rect fill="#1877F25e" transform="matrix(0.866025 -0.5 0.866025 0.5 16.4136 61.0967)" rx="4" height="22.0331" width="22.0331" />
            </g>
            <g className="container-g-icons" id="id-01-facebook">
              <rect fill="#383D45" transform="matrix(0.866025 -0.5 0.866025 0.5 16.4136 61.0967)" rx="4" height="22.0331" width="22.0331" />
              <g clipPath="url(#clip0_54_145)">
                <path fill="white" d="M41.1579 57.8667C38.0295 56.0605 32.9731 56.0515 29.8644 57.8464C26.755 59.6424 26.7698 62.5613 29.8989 64.3679C32.7254 65.9998 37.1274 66.1639 40.2432 64.8558L36.2852 62.5706L34.8568 63.3953L33.2201 62.4504L34.6499 61.6249L33.4009 60.9038C31.9817 60.0844 32.0387 59.1464 33.3242 58.4041C33.9406 58.0483 34.6949 57.7403 34.6949 57.7403L36.0881 58.5447L35.3782 58.9546C34.6794 59.358 34.8983 59.7362 35.3465 59.995L36.409 60.6084L37.9697 59.7074L39.3573 60.7961L38.045 61.5538L42.003 63.8389C44.2687 62.0401 43.9845 59.4986 41.1579 57.8667Z" />
              </g>
            </g>
          </g>
        </a>
        <a href={links.instagram} target="_blank" rel="noreferrer">
          <g id="id-repo-ghost-instagram">
            <g className="react-path-v2">
              <rect fill="#E4405F5e" transform="matrix(0.866025 -0.5 0.866025 0.5 37.2268 73.1133)" rx="4" height="22.0331" width="22.0331" className="react" />
            </g>
            <g className="react-path-v1">
              <rect fill="#E4405F5e" transform="matrix(0.866025 -0.5 0.866025 0.5 37.2268 73.1133)" rx="4" height="22.0331" width="22.0331" className="react" />
            </g>
            <g className="container-g-icons" id="id-03-instagram">
              <rect fill="#383D45" transform="matrix(0.866025 -0.5 0.866025 0.5 37.2268 73.1133)" rx="4" height="22.0331" width="22.0331" />
              <g clipPath="url(#clip1_54_145)">
                <path fill="white" d="M50.6788 69.8633C49.1512 70.7453 48.9662 70.8602 48.3927 71.2222C47.8206 71.585 47.5061 71.8754 47.2873 72.1627C47.0524 72.461 46.9337 72.7855 46.9397 73.1133C46.9337 73.441 47.0524 73.7655 47.2873 74.0639C47.5054 74.3507 47.8199 74.642 48.3906 75.0032C48.9655 75.3659 49.1498 75.4805 50.6796 76.3637C52.2079 77.2461 52.4063 77.3525 53.0332 77.6836C53.6609 78.0135 54.164 78.1951 54.6615 78.3214C55.1758 78.4518 55.6818 78.5221 56.308 78.5221C56.9336 78.5225 57.4402 78.4526 57.9538 78.3218C58.452 78.1951 58.9551 78.0143 59.5821 77.684C60.2097 77.3525 60.4082 77.2461 61.9372 76.3633C63.4662 75.4805 63.6499 75.3663 64.224 75.004C64.7947 74.642 65.1106 74.3507 65.3295 74.0635C65.564 73.7652 65.6824 73.4409 65.6763 73.1133C65.6763 72.7517 65.5546 72.4596 65.3287 72.1627C65.1092 71.8758 64.7954 71.585 64.224 71.2226C63.6506 70.8606 63.4662 70.7461 61.9372 69.8633C60.4082 68.9805 60.2097 68.8741 59.5821 68.5426C58.9551 68.2131 58.4506 68.0315 57.9545 67.9052C57.4377 67.7695 56.8757 67.701 56.308 67.7045C55.7404 67.701 55.1783 67.7695 54.6615 67.9052C54.1633 68.0319 53.6588 68.2135 53.0325 68.5434C52.4049 68.8749 52.2072 68.9809 50.6774 69.8641L50.6788 69.8633Z" />
                <path fill="white" d="M55.6332 69.2535C55.5445 69.3047 55.4741 69.3655 55.4261 69.4324C55.3781 69.4994 55.3534 69.5711 55.3534 69.6435C55.3534 69.7159 55.3781 69.7877 55.4261 69.8546C55.4741 69.9215 55.5445 69.9823 55.6332 70.0335C55.7219 70.0847 55.8272 70.1253 55.9431 70.1531C56.059 70.1808 56.1833 70.195 56.3087 70.195C56.4342 70.195 56.5584 70.1808 56.6743 70.1531C56.7902 70.1253 56.8955 70.0847 56.9842 70.0335C57.1634 69.9301 57.264 69.7898 57.264 69.6435C57.264 69.4972 57.1634 69.3569 56.9842 69.2535C56.8051 69.1501 56.5621 69.092 56.3087 69.092C56.0554 69.092 55.8124 69.1501 55.6332 69.2535Z" />
                <path fill="white" d="M54.4321 72.0294C54.6785 71.8871 54.9711 71.7743 55.2931 71.6973C55.6151 71.6203 55.9602 71.5806 56.3087 71.5806C56.6572 71.5806 57.0023 71.6203 57.3243 71.6973C57.6463 71.7743 57.9389 71.8871 58.1853 72.0294C58.4318 72.1717 58.6273 72.3406 58.7606 72.5265C58.894 72.7124 58.9627 72.9117 58.9627 73.1129C58.9627 73.3141 58.894 73.5133 58.7606 73.6992C58.6273 73.8851 58.4318 74.0541 58.1853 74.1963C57.6876 74.4837 57.0126 74.6451 56.3087 74.6451C55.6048 74.6451 54.9298 74.4837 54.4321 74.1963C53.9344 73.909 53.6548 73.5193 53.6548 73.1129C53.6548 72.7065 53.9344 72.3168 54.4321 72.0294Z" />
              </g>
            </g>
          </g>
        </a>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" y2="66.329" x2="109.999" y1="65.9358" x1="3.93103" id="paint0_linear_54_145">
            <stop stopColor="#1F2127" />
            <stop stopColor="#414750" offset="1" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="110.105" x2="84.4463" y1="61" x1="0" id="paint1_linear_54_145">
            <stop stopColor="#414750" />
            <stop stopColor="#414750" offset="1" />
          </linearGradient>
          <clipPath id="clip0_54_145">
            <rect transform="matrix(0.866025 -0.5 0.866025 0.5 24.2365 61.0967)" fill="white" height="13" width="13" />
          </clipPath>
          <clipPath id="clip1_54_145">
            <rect transform="matrix(0.866025 -0.5 0.866025 0.5 45.0497 73.1133)" fill="white" height="13" width="13" />
          </clipPath>
          <clipPath id="clip2_54_145">
            <rect transform="matrix(0.866025 -0.5 0.866025 0.5 45.0211 49.0967)" fill="white" height="13" width="13" />
          </clipPath>
          <clipPath id="clip3_54_145">
            <rect transform="matrix(0.866025 -0.5 0.866025 0.5 65.8343 61.1133)" fill="white" height="13" width="13" />
          </clipPath>
        </defs>
      </svg>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  width: min(420px, 92%);
  svg { width: 100%; height: auto; display: block; }
  #id-repo-ghost-instagram .container-g-icons g,
  #id-repo-ghost-facebook .container-g-icons g,
  #id-repo-ghost-linkelind .container-g-icons g,
  #id-repo-ghost-twich .container-g-icons g {
    opacity: 0.5;
    transition: 0.3s ease-in-out;
  }
  #id-repo-ghost-instagram:hover .container-g-icons g,
  #id-repo-ghost-facebook:hover .container-g-icons g,
  #id-repo-ghost-linkelind:hover .container-g-icons g,
  #id-repo-ghost-twich:hover .container-g-icons g {
    opacity: 1;
  }
  #id-repo-ghost-twich,
  #id-repo-ghost-instagram,
  #id-repo-ghost-facebook,
  #id-repo-ghost-linkelind { cursor: pointer; }
  #id-03-instagram,
  #id-01-facebook,
  #id-04-linkelind,
  #id-02-twich,
  .react-path-v1,
  .react-path-v2 { transition: 0.5s ease-in-out; }
  #id-repo-ghost-instagram:hover #id-03-instagram,
  #id-repo-ghost-facebook:hover #id-01-facebook,
  #id-repo-ghost-linkelind:hover #id-04-linkelind,
  #id-repo-ghost-twich:hover #id-02-twich { transform: translate(0px, -10px); }
  #id-repo-ghost-instagram:hover .react-path-v1,
  #id-repo-ghost-facebook:hover .react-path-v1,
  #id-repo-ghost-linkelind:hover .react-path-v1,
  #id-repo-ghost-twich:hover .react-path-v1 { transform: translate(0px, -6px); }
  #id-repo-ghost-instagram:hover .react-path-v2,
  #id-repo-ghost-facebook:hover .react-path-v2,
  #id-repo-ghost-linkelind:hover .react-path-v2,
  #id-repo-ghost-twich:hover .react-path-v2 { transform: translate(0px, -2px); }
  @keyframes bounce-lines {
    0%, 100% { transform: translateY(-3); }
    50% { transform: translateY(-3px); }
  }
  #line-animation-v1 { animation: bounce-lines 3s infinite ease-in-out; }
  #line-animation-v2 { animation: bounce-lines 3s infinite ease-in-out; animation-delay: 0.2s; }
`
