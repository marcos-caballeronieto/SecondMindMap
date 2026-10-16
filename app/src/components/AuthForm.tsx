'use client'

import { useState } from 'react'
import { Loader2, Mail, Lock, Globe, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

interface AuthFormProps {
  onContinueAsGuest?: () => void
}

export default function AuthForm({ onContinueAsGuest }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const isConfigured = isSupabaseConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!isConfigured) {
      setLoading(false)
      setMessage(
        'Supabase no está configurado aún (.env.local contiene https://placeholder.supabase.co). Añade tus credenciales de Supabase o haz clic abajo en "Probar en Modo Demo".'
      )
      return
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMessage(error.message)
          return
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          setMessage(error.message)
          return
        }
        setMessage('¡Cuenta creada con éxito! Si tu proyecto tiene confirmación de email activa, revisa tu bandeja de entrada.')
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : String(err)
      if (errText.toLowerCase().includes('failed to fetch') || errText.toLowerCase().includes('fetch')) {
        setMessage(
          'Error de red (Failed to fetch): No se pudo conectar a la URL de Supabase especificada en .env.local. Verifica que la URL del proyecto sea correcta.'
        )
      } else {
        setMessage(errText || 'Error de autenticación')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 32px rgba(99,102,241,0.4)' }}
          >
            <Globe size={32} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            SecondMindMap
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Tu segundo cerebro geográfico
          </p>
        </div>

        {/* Supabase Notice if using placeholder */}
        {!isConfigured && (
          <div
            className="mb-4 p-4 rounded-xl text-xs space-y-2 border"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.25)',
              color: '#fbbf24',
            }}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-amber-300">
              <AlertTriangle size={16} />
              <span>Supabase pendiente de configurar</span>
            </div>
            <p className="text-amber-200/80 leading-relaxed">
              Actualmente <code className="bg-black/40 px-1 py-0.5 rounded">app/.env.local</code> contiene la URL de marcador de posición <code className="bg-black/40 px-1 py-0.5 rounded">placeholder.supabase.co</code>.
            </p>
            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full mt-2 py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-md text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                <Sparkles size={14} />
                <span>Probar ahora en Modo Demo (Local)</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

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
                className="text-xs p-3 rounded-lg leading-relaxed"
                style={{
                  background: message.includes('éxito') || message.includes('¡') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: message.includes('éxito') || message.includes('¡') ? '#4ade80' : '#f87171',
                  border: `1px solid ${message.includes('éxito') || message.includes('¡') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
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

          {/* Quick Guest mode access if configured or not */}
          {onContinueAsGuest && isConfigured && (
            <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-muted hover:text-secondary underline"
              >
                O continuar en Modo Demo (Local) sin iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
