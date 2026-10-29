import React from 'react';

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error details, and displays a graceful fallback UI instead of crashing.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('Unhandled runtime error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-wrapper container page-container">
          <div className="card error-boundary-card text-center">
            <div className="error-boundary-icon">⚠️</div>
            <h1 className="error-boundary-title">Something Went Wrong</h1>
            <p className="error-boundary-description">
              An unexpected error occurred while rendering this view. Your session and data
              are intact. You can try refreshing the page or returning to the homepage.
            </p>

            <div className="error-boundary-actions">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                🔄 Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-outline"
              >
                🔁 Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
              >
                🏠 Return to Home
              </button>
            </div>

            {/* Collapsible Error Debug Details in Development */}
            {this.state.error && (
              <details className="error-details-accordion">
                <summary className="error-details-summary">
                  Technical Details (for debugging)
                </summary>
                <div className="error-details-box">
                  <p className="error-message-text">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="error-stack-trace">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
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
