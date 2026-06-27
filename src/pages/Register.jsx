import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message)
                setLoading(false)
                return
            }

            localStorage.setItem('token', data.token)
            alert('Registered successfully!')
            navigate('/')

        } catch (err) {
            setError('Server not reachable. Is backend running?')
        }

        setLoading(false)
    }

    const inputStyle = {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#fff',
        fontSize: '14px',
        width: '100%',
        fontFamily: 'inherit'
    }

    const fieldWrapStyle = {
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.35)',
        paddingBottom: '6px',
        gap: '10px'
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
                }}>Create Account</h2>

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
                    {/* Full Name */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={fieldWrapStyle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={fieldWrapStyle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={fieldWrapStyle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                style={inputStyle}
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

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: '#fff',
                            color: '#1a1a1a',
                            border: 'none',
                            padding: '11px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.2px',
                            fontFamily: 'inherit',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '1.25rem',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)'
                }}>
                    Already have an account?{' '}
                    <Link to="/" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none' }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register