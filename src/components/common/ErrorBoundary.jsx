import { Component, Fragment } from 'react';
import CrashScreen from './CrashScreen.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry() {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetKey: prev.resetKey + 1,
    }));
  }

  render() {
    const { hasError, error, resetKey } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <CrashScreen error={error} onRetry={this.handleRetry} />;
    }

    return <Fragment key={resetKey}>{children}</Fragment>;
  }
}

export default ErrorBoundary;
