import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const error = useSelector(state => state.auth.error)

  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()

    const payload = {
      username,
      email,
      password,
    }

    await handleRegister(payload)
    navigate('/login')
  }

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-[#040507] px-4 py-10 font-sans text-zinc-100 selection:bg-zinc-700 selection:text-white overflow-hidden select-none">

      {/* Dynamic Breathing Keyframes */}
      <style>{`
        @keyframes dynamicSilverGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.95);
            filter: blur(80px);
          }
          50% {
            opacity: 0.75;
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
        {/* Outer Silver Layer */}
        <div className="animate-silver-ambient absolute h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,rgba(180,185,200,0.06)_45%,transparent_70%)]" />

        {/* Core Spotlight */}
        <div className="animate-silver-ambient absolute h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_0%,rgba(200,205,220,0.06)_50%,transparent_70%)]" style={{ animationDelay: '-2.5s' }} />
      </div>

      {/* Top Corner Network Tag */}
      <div className="absolute right-6 top-6 z-20 hidden sm:block">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          SECURE PROTOCOL
        </span>
      </div>

      {/* ================= GLASS REGISTER CARD ================= */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all">

        {/* Brand Beacon */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-b from-white to-zinc-400 shadow-[0_0_12px_rgba(255,255,255,0.6)] ring-2 ring-white/10" />
          <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">Elix.ai</span>
        </div>
        {/* Title Header */}
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white drop-shadow-md">
          Create Account
        </h1>
        <p className="mt-2 text-xs md:text-sm font-light leading-relaxed text-zinc-400">
          Enter your credentials to establish a new encrypted session.
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submitForm} className="mt-7 space-y-4">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-zinc-300 tracking-wide">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a handle"
              required
              className="w-full rounded-2xl border border-white/[0.08] bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none backdrop-blur-md transition-all focus:border-white/25 focus:bg-zinc-900/70"
            />
          </div>

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
              {loading ? 'Initializing...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Login Route Link */}
        <p className="mt-7 text-center text-xs font-light text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-zinc-200 underline underline-offset-4 transition hover:text-white">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Register