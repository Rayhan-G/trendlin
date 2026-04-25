export default function Dashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#purple' }}>Admin Dashboard</h1>
      <p>If you can see this text, the dashboard route is working!</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#000', 
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Home
      </button>
    </div>
  );
}