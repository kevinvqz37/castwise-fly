import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err) { console.error('App crashed:', err) }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: '#f5f0e8', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🎣</div>
        <div style={{ fontWeight: 800 }}>エラーが発生しました / Something went wrong</div>
        <button onClick={() => location.reload()} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#0d7377', color: '#fff', fontWeight: 800 }}>再読み込み / Reload</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>,
)
