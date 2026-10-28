'use client'

import { useState } from 'react'
import { Loader2, Mail, Lock, Globe, AlertTriangle, ArrowRight } from 'lucide-react'
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

  const isSuccess = message.includes('éxito') || message.includes('¡')

  return (
    <div
      className="min-h-screen w-full overflow-y-auto"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="mx-auto w-full max-w-sm px-4 py-8">
        {/* Diary cover: name and tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3" style={{ color: 'var(--accent)' }}>
            <Globe size={28} />
          </div>
          <h1 className="text-3xl" style={{ color: 'var(--text-primary)' }}>
            SecondMindMap
          </h1>
          <p className="hand text-xl mt-1" style={{ color: 'var(--text-secondary)' }}>
            Tu segundo cerebro geográfico
          </p>
        </div>

        {/* Supabase notice if using the placeholder URL */}
        {!isConfigured && (
          <div
            className="mb-4 p-3 text-xs space-y-2"
            style={{
              color: 'var(--warning)',
              borderTop: '1px solid var(--border-bright)',
              borderBottom: '1px solid var(--border-bright)',
            }}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle size={16} />
              <span>Supabase pendiente de configurar</span>
            </div>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Actualmente <code>app/.env.local</code> contiene la URL de marcador de posición <code>placeholder.supabase.co</code>.
            </p>
            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="btn btn-primary btn-sm w-full mt-2"
              >
                <span>Probar ahora en Modo Demo (Local)</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Cover page: sign-in form */}
        <div className="auth-cover">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border-bright)' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                className="flex-1 pb-2 text-sm"
                style={{
                  fontFamily: 'var(--font-body-stack)',
                  color: mode === m ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: mode === m ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                }}
                aria-pressed={mode === m}
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
                  style={{ position: 'absolute', left: '0.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: '1.75rem' }}
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
                  style={{ position: 'absolute', left: '0.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="auth-password"
                  type="password"
                  className="input"
                  style={{ paddingLeft: '1.75rem' }}
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
                className="text-sm leading-relaxed"
                role={isSuccess ? 'status' : 'alert'}
                style={{ color: isSuccess ? 'var(--success)' : 'var(--danger)' }}
              >
                {message}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          {/* Demo mode link */}
          {onContinueAsGuest && isConfigured && (
            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-sm underline"
                style={{ color: 'var(--focus)', background: 'transparent' }}
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
