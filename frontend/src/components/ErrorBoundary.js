import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const styles = {
        container: {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f5f5f5'
        },
        card: {
          maxWidth: '500px',
          width: '100%',
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          textAlign: 'center'
        },
        heading: { margin: '0 0 12px', color: '#222' },
        message: { margin: '0 0 24px', color: '#666', lineHeight: 1.5 },
        button: {
          padding: '10px 20px',
          fontSize: '14px',
          color: '#fff',
          backgroundColor: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        },
        details: {
          marginTop: '20px',
          textAlign: 'left',
          fontSize: '12px',
          color: '#999',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }
      };

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.heading}>Something went wrong</h1>
            <p style={styles.message}>
              The app hit an unexpected error. Please refresh the page to continue.
            </p>
            <button style={styles.button} onClick={this.handleReload}>
              Refresh page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary>Error details (dev only)</summary>
                {this.state.error.toString()}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
