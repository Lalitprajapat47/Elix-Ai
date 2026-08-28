import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { FishSymbol } from 'lucide-react'

// Hooks
import { useAuth } from '../hook/useAuth'

const Login = () => {
  // ==========================================
  // 1. STATE & HOOKS
  // ==========================================
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  // ==========================================
  // 2. FORM SUBMISSION
  // ==========================================
  const submitForm = async (event) => {
    event.preventDefault()

    const payload = {
      email,
      password,
    }

    await handleLogin(payload)
    navigate('/')
  }

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  // ==========================================
  // 3. RENDER
  // ==========================================
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-[#040507] px-4 py-10 font-sans text-zinc-100 selection:bg-zinc-700 selection:text-white overflow-hidden select-none">
      
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes dynamicSilverGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
            filter: blur(80px);
          }
          50% {
            opacity: 0.70;
            transform: scale(1.10);
            filter: blur(95px);
          }
        }
        .animate-silver-ambient {
          animation: dynamicSilverGlow 5.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* ================= BACKGROUND AMBIENT GLOW ================= */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="animate-silver-ambient absolute h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,rgba(180,185,200,0.06)_45%,transparent_70%)]" />
        <div className="animate-silver-ambient absolute h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_0%,rgba(200,205,220,0.06)_50%,transparent_70%)]" style={{ animationDelay: '-2.5s' }} />
      </div>

      {/* Top Corner Network Tag */}
      <div className="absolute right-6 top-6 z-20 hidden sm:block">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          SECURE PROTOCOL
        </span>
      </div>

      {/* ================= GLASS LOGIN CARD ================= */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all">
        
        {/* Brand Header with FishSymbol Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 shadow-sm">
            <FishSymbol className="h-4 w-4 text-zinc-100" />
          </div>
          <span
            style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            className="text-base font-semibold tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400"
          >
            Elix<span className="text-zinc-500 font-light">.ai</span>
          </span>
        </div>

        {/* Title Header */}
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white drop-shadow-md">
          Welcome Back
        </h1>
        <p className="mt-2 text-xs md:text-sm font-light leading-relaxed text-zinc-400">
          Sign in to access your dashboard and encrypted history.
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submitForm} className="mt-7 space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-300 tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full rounded-2xl border border-white/[0.08] bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none backdrop-blur-md transition-all focus:border-white/25 focus:bg-zinc-900/70"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-300 tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full rounded-2xl border border-white/[0.08] bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none backdrop-blur-md transition-all focus:border-white/25 focus:bg-zinc-900/70"
            />
          </div>

          {/* Metallic Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 py-3.5 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Register Route Link */}
        <p className="mt-7 text-center text-xs font-light text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-zinc-200 underline underline-offset-4 transition hover:text-white">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login