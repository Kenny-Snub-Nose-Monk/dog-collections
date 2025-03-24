"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import ErrorFallback from "./error-fallback"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          title="Something went wrong"
          message="We're sorry, but an unexpected error occurred. Please try refreshing the page."
          onRetry={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

