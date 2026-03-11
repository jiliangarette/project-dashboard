"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export const dynamic = "force-dynamic";

/* ─── Animated 3D orb background using pure CSS ─────────────────────── */

function OrbBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[#050508]" />

      {/* Animated mesh gradient orbs */}
      <div className="absolute inset-0">
        {/* Primary orb — large, slow drift */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, #4f46e5 40%, transparent 70%)",
            top: "10%",
            left: "15%",
            animation: "orbFloat1 20s ease-in-out infinite",
          }}
        />
        {/* Secondary orb — violet/purple */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #a855f7 0%, #7c3aed 40%, transparent 70%)",
            top: "40%",
            right: "10%",
            animation: "orbFloat2 25s ease-in-out infinite",
          }}
        />
        {/* Tertiary orb — blue accent */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 40%, transparent 70%)",
            bottom: "5%",
            left: "30%",
            animation: "orbFloat3 18s ease-in-out infinite",
          }}
        />
        {/* Small accent orb — warm highlight */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[60px]"
          style={{
            background: "radial-gradient(circle, #ec4899 0%, #be185d 40%, transparent 70%)",
            top: "60%",
            left: "60%",
            animation: "orbFloat4 22s ease-in-out infinite",
          }}
        />
      </div>

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Grid pattern — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

/* ─── Floating particles ────────────────────────────────────────────── */

function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
            animation: `particleDrift ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${-Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── 3D Tilt card ──────────────────────────────────────────────────── */

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -8;
    const rotateY = (x - 0.5) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative transition-transform duration-300 ease-out"
      style={{ transform, transformStyle: "preserve-3d" }}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ─── Agent status pill ─────────────────────────────────────────────── */

function StatusPill({ label, status, delay }: { label: string; status: "active" | "idle" | "syncing"; delay: number }) {
  const colors = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    idle: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20",
    syncing: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  };
  const dotColors = {
    active: "bg-emerald-400",
    idle: "bg-zinc-500",
    syncing: "bg-indigo-400",
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[status]} animate-[fadeSlideUp_0.6s_ease-out_both]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${status === "active" || status === "syncing" ? "animate-pulse" : ""}`} />
      {label}
    </div>
  );
}

/* ─── Main login page ───────────────────────────────────────────────── */

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.05); }
          66% { transform: translate(40px, -60px) scale(0.9); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(70px, -30px) scale(1.08); }
        }
        @keyframes orbFloat4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 40px); }
        }
        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(99,102,241,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(99,102,241,0.7)); }
        }
        @keyframes borderRotate {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
      `}</style>

      {/* Full-screen login — override layout padding */}
      <div className="!fixed inset-0 z-[100] flex items-center justify-center">
        <OrbBackground />
        {mounted && <Particles />}

        {/* Content */}
        <div
          className={`relative z-10 w-full max-w-md px-6 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Top branding */}
          <div className="text-center mb-8">
            {/* 3D Logo mark */}
            <div className="inline-flex items-center justify-center mb-5">
              <div
                className="relative w-16 h-16 flex items-center justify-center"
                style={{ animation: "logoGlow 3s ease-in-out infinite" }}
              >
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-2xl border border-indigo-500/30 rotate-6" />
                <div className="absolute inset-1 rounded-xl border border-violet-500/20 -rotate-3" />
                {/* Inner face */}
                <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-indigo-600/40 to-violet-600/30 backdrop-blur-sm border border-white/10" />
                {/* Icon — custom SVG instead of lucide */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="relative w-7 h-7 text-white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" className="fill-indigo-400/30" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" className="fill-violet-400/30" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" className="fill-violet-400/30" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" className="fill-indigo-400/30" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
              Project
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                {" "}Dashboard
              </span>
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xs mx-auto leading-relaxed">
              Monitor your repos, track agents, and understand every commit — powered by AI.
            </p>
          </div>

          {/* Glass card with 3D tilt */}
          <TiltCard>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(99,102,241,0.15)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="p-8">
                {/* Agent status indicators */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  <StatusPill label="9 repos synced" status="active" delay={200} />
                  <StatusPill label="AI changelog" status="syncing" delay={400} />
                  <StatusPill label="Agents ready" status="idle" delay={600} />
                </div>

                {/* Sign in button */}
                <button
                  onClick={() => signIn("github", { callbackUrl: "/" })}
                  className="group relative w-full flex items-center justify-center gap-3 rounded-xl font-medium py-4 px-6 text-white transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
                    boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 4px 20px -4px rgba(99,102,241,0.4)",
                  }}
                >
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <svg className="w-5 h-5 relative" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="relative text-base">Continue with GitHub</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* Demo button */}
                <a
                  href="/demo"
                  className="group w-full flex items-center justify-center gap-2 rounded-xl font-medium py-3.5 px-6 text-zinc-300 transition-all duration-300 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span className="text-sm">Explore demo</span>
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">— no account needed</span>
                </a>
              </div>

              {/* Bottom trust bar */}
              <div className="border-t border-white/[0.04] px-6 py-4 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 whitespace-nowrap">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Secure OAuth
                </div>
                <div className="w-px h-3 bg-white/[0.06]" />
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 whitespace-nowrap">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Read-only access
                </div>
                <div className="w-px h-3 bg-white/[0.06]" />
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 whitespace-nowrap">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                  Free forever
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Footer */}
          <p className="text-center text-[11px] text-zinc-600 mt-8">
            Built by{" "}
            <a href="https://github.com/jiliangarette" className="text-zinc-500 hover:text-indigo-400 transition-colors" target="_blank" rel="noopener noreferrer">
              Jilian Garette
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
