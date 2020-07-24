import React, { Component } from 'react'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'ErrorBoundary' })

class ErrorBoundary extends Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    logger.error('🔴 componentDidCatch', error, errorInfo)
    // remote.app.quit()
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

export { ErrorBoundary }
