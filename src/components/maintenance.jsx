const MaintenancePage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    textAlign: 'center',
    padding: '20px'
  }}>
    <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🔧</h1>
    <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Under Maintenance</h2>
    <p style={{ fontSize: '18px', color: '#999' }}>
      We're currently performing scheduled maintenance.<br/>
      We'll be back shortly. Thank you for your patience!
    </p>
  </div>
);
