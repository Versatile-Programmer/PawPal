// components/ErrorBoundary.tsx
import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try refreshing the page.</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
