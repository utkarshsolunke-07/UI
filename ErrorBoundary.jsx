import React from 'react';

/**
 * UTKARSH AI — Studio Error Boundary & Auto-Recovery Component v36.0
 * Prevents application crashes by catching unexpected rendering/WebGL errors
 * and providing a clean, one-click recovery interface.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Utkarsh AI ErrorBoundary] Uncaught exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem 2rem',
          margin: '2rem auto',
          maxWidth: '700px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(20, 15, 35, 0.95), rgba(10, 8, 20, 0.98))',
          border: '1px solid rgba(255, 75, 75, 0.4)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 75, 75, 0.15)',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 15px rgba(255,75,75,0.6))'
          }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ff6b6b' }}>
            STUDIO RECOVERY SHIELD ACTIVATED
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            A temporary GPU or rendering exception occurred in this module. Your data is safe. Click below to instantly restore full studio operations.
          </p>

          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '1.8rem',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#ff8a8a',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {this.state.error?.toString() || 'Unknown Error'}
          </div>

          <button
            onClick={this.handleReset}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              border: 'none',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⚡ RESTORE STUDIO SESSION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
