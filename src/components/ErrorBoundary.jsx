import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', color: '#f8fafc', background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ App Crashed</h1>
          <p style={{ marginBottom: '20px' }}>Something went wrong. Please take a screenshot of the error below and send it to the developer.</p>
          
          <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', width: '100%', maxWidth: '600px', overflowX: 'auto', marginBottom: '20px', border: '1px solid #334155' }}>
            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '10px' }}>
              {this.state.error && this.state.error.toString()}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo?.componentStack}
            </div>
          </div>
          
          <button 
            onClick={() => {
              window.location.href = '/';
            }} 
            style={{ padding: '12px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
