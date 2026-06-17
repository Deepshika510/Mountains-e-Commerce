import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      alert('Login successful!')
      navigate('/dashboard')

    } catch (err) {
      setError('Something went wrong. Try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("/bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Dark overlay so glass card stays readable */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 0
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '380px'
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: '1.6rem',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '2rem',
          letterSpacing: '0.3px'
        }}>Login</h2>

        {error && (
          <div style={{
            background: 'rgba(220,50,50,0.2)',
            border: '1px solid rgba(220,50,50,0.4)',
            color: '#ffaaaa',
            fontSize: '13px',
            padding: '8px 14px',
            borderRadius: '8px',
            marginBottom: '1.2rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.35)',
              paddingBottom: '6px',
              gap: '10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.35)',
              paddingBottom: '6px',
              gap: '10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'rgba(255,255,255,0.45)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#4fc3a1', width: '13px', height: '13px' }} />
              Remember me
            </label>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#fff',
              color: '#1a1a1a',
              border: 'none',
              padding: '11px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.2px',
              fontFamily: 'inherit'
            }}
          >
            Login
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login