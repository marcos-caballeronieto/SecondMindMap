'use client'

import { useState } from 'react'
import { Loader2, Mail, Lock, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('¡Cuenta creada! Revisa tu correo para confirmar.')
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 32px rgba(99,102,241,0.4)' }}
          >
            <Globe size={32} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            GeoMind
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Tu segundo cerebro geográfico
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Tab switcher */}
          <div
            className="flex gap-1 mb-6 p-1 rounded-xl"
            style={{ background: 'var(--bg-base)' }}
          >
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m
                    ? 'btn btn-primary'
                    : 'text-secondary hover:text-primary'
                }`}
                style={{ padding: '0.4rem' }}
                onClick={() => { setMode(m); setMessage('') }}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label" htmlFor="auth-email">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="auth-password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="auth-password"
                  type="password"
                  className="input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <p
                className="text-sm p-3 rounded-lg"
                style={{
                  background: message.includes('¡') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: message.includes('¡') ? '#4ade80' : '#f87171',
                  border: `1px solid ${message.includes('¡') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                {message}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
