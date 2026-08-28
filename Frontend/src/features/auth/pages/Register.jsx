import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { FishSymbol, ArrowRight, ShieldCheck } from 'lucide-react'

// Hooks
import { useAuth } from '../hook/useAuth'

// ================= STITCH-GRADE SUBTLE MICRO-ELASTIC DOT CANVAS =================
const InteractiveDotCanvas = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initDots()
    }

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 65,
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const spacing = 26
    let dots = []

    class Dot {
      constructor(originX, originY) {
        this.originX = originX
        this.originY = originY
        this.x = originX
        this.y = originY
        this.vx = 0
        this.vy = 0
        this.baseRadius = 1.15
        this.currentRadius = 1.15
        this.friction = 0.82
        this.spring = 0.12
      }

      update() {
        const dx = mouse.x - this.originX
        const dy = mouse.y - this.originY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouse.radius && distance > 0) {
          const norm = (mouse.radius - distance) / mouse.radius
          const force = Math.sin(norm * (Math.PI / 2)) * 4.5
          const angle = Math.atan2(dy, dx)
          
          const targetX = this.originX - Math.cos(angle) * force
          const targetY = this.originY - Math.sin(angle) * force

          this.vx += (targetX - this.x) * 0.25
          this.vy += (targetY - this.y) * 0.25
          this.currentRadius = this.baseRadius + norm * 0.6
        } else {
          this.vx += (this.originX - this.x) * this.spring
          this.vy += (this.originY - this.y) * this.spring
          this.currentRadius += (this.baseRadius - this.currentRadius) * 0.1
        }

        this.vx *= this.friction
        this.vy *= this.friction
        this.x += this.vx
        this.y += this.vy
      }

      draw() {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const isNear = dist < mouse.radius

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2)
        
        if (isNear) {
          const intensity = 1 - dist / mouse.radius
          ctx.fillStyle = `rgba(255, 255, 255, ${0.22 + intensity * 0.55})`
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
        }
        ctx.fill()
      }
    }

    function initDots() {
      dots = []
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push(new Dot(x, y))
        }
      }
    }

    initDots()

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < dots.length; i++) {
        dots[i].update()
        dots[i].draw()
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full opacity-90"
    />
  )
}

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()
    const payload = { username, email, password }
    await handleRegister(payload)
    navigate('/login')
  }

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between bg-[#040507] px-6 py-8 font-sans text-zinc-100 selection:bg-zinc-700 selection:text-white overflow-hidden select-none">
      
      {/* ================= BACKGROUND MONOCHROME SILVER AMBIENT ================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14)_0%,rgba(160,165,180,0.04)_45%,transparent_75%)] blur-[90px]" />
      </div>

      {/* ================= INTERACTIVE DOT CANVAS ================= */}
      <InteractiveDotCanvas />

      {/* ================= TOP NAV / HEADER ================= */}
      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 shadow-sm backdrop-blur-md">
            <FishSymbol className="h-4 w-4 text-zinc-100" />
          </div>
          <span
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-base font-semibold tracking-[-0.02em] text-white"
          >
            Elix<span className="text-zinc-500 font-light">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
            Secure Setup
          </span>
        </div>
      </header>

      {/* ================= FORM SECTION ================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center py-10">
        
        {/* Header Typography */}
        <div className="text-center">
          <h1 
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-3xl md:text-4xl font-semibold tracking-tight text-white drop-shadow-md"
          >
            Create your Elix Account
          </h1>
          <p className="mt-3 text-xs md:text-sm font-normal text-zinc-400">
            One account for all your workspace, models, and history.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-6 w-full rounded-2xl border border-rose-500/20 bg-rose-950/40 px-4 py-3 text-center text-xs text-rose-300 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Grouped Apple-Style Form */}
        <form onSubmit={submitForm} className="mt-8 w-full space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-zinc-950/70 backdrop-blur-xl transition-all focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/15 shadow-xl">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username / Handle"
                required
                className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
              />
            </div>

            <div className="border-t border-white/[0.07]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
              />
            </div>
            
            <div className="border-t border-white/[0.07]">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 py-3.5 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-40 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.12)]"
            >
              <span>{loading ? 'Creating...' : 'Continue'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-black" />
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs">
          <Link
            to="/login"
            className="text-zinc-400 transition hover:text-zinc-200"
          >
            Already have an account? <span className="text-white font-medium underline underline-offset-4">Sign in here.</span>
          </Link>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-20 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-[11px] text-zinc-500">
        <p>© 2026 Elix Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-zinc-400 transition">Privacy Policy</span>
          <span className="cursor-pointer hover:text-zinc-400 transition">Terms of Use</span>
          <span className="cursor-pointer hover:text-zinc-400 transition">Support</span>
        </div>
      </footer>
    </main>
  )
}

export default Register