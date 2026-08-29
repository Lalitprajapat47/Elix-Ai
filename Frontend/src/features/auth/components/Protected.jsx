import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { FishSymbol } from 'lucide-react'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return (
            <main className="flex h-screen w-full items-center justify-center bg-[#040507]">
                <style>{`
                    @keyframes protectedPulse {
                        0%, 100% { opacity: 0.4; transform: scale(0.92); }
                        50% { opacity: 1; transform: scale(1.05); }
                    }
                    .protected-pulse {
                        animation: protectedPulse 1.4s ease-in-out infinite;
                    }
                    @keyframes protectedGlow {
                        0%, 100% { opacity: 0.35; transform: scale(0.95); }
                        50% { opacity: 0.7; transform: scale(1.1); }
                    }
                    .protected-glow {
                        animation: protectedGlow 2.6s ease-in-out infinite;
                    }
                `}</style>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="protected-glow h-[320px] w-[480px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.16)_0%,rgba(160,165,180,0.05)_45%,transparent_75%)] blur-[80px]" />
                </div>

                <div className="relative flex flex-col items-center gap-4">
                    <div className="protected-pulse flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 shadow-lg">
                        <FishSymbol className="h-6 w-6 text-zinc-100" />
                    </div>
                    <span
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        className="text-sm font-medium tracking-[-0.01em] text-zinc-300"
                    >
                        Elix<span className="text-zinc-500 font-light">.ai</span>
                    </span>
                </div>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }


    return children
}

export default Protected