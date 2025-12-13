function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '60px 40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>🔧</div>
        
        <h1 style={{
          color: '#333',
          fontSize: '32px',
          marginBottom: '20px',
          fontWeight: '700'
        }}>We'll Be Right Back!</h1>
        
        <p style={{
          color: '#666',
          fontSize: '18px',
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          FitForge is currently undergoing scheduled maintenance to improve your experience. 
          We'll be back online shortly.
        </p>
        
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <p style={{
            color: '#495057',
            fontSize: '14px',
            margin: '0'
          }}>
            <strong>Estimated completion:</strong> Soon
          </p>
        </div>
        
        <p style={{
          color: '#888',
          fontSize: '14px',
          margin: '0'
        }}>
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
}

export default MaintenancePage;