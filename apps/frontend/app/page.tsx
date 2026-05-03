import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] px-4">
      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-sky-400/[0.04] blur-[120px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Logo Mark */}
        <div className="mb-8 flex items-center justify-center">
          <img 
            src="/icon_no_bg.png" 
            alt="PRESS Logo" 
            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
          PROGRESSIVE
          <br />
          OVERLOAD{" "}
          <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            AUTOMATED.
          </span>
        </h1>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          High-precision workout logging with an intelligent Progression Engine
          that calculates your next target automatically.
        </p>

        {/* Algorithm Visualization Card */}
        <div className="animate-slide-up mt-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase">
              Progression Engine
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Before */}
            <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
                Last Log
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-300">
                40<span className="text-slate-600">×</span>3
                <span className="text-slate-600">×</span>12
              </p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 glow-border">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-sky-400"
                >
                  <path
                    d="M3 8h10m0 0L9 4m4 4L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-mono text-[8px] text-sky-400/60">ALGO</span>
            </div>

            {/* After */}
            <div className="flex-1 rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 text-center glow-border">
              <p className="font-mono text-[9px] font-medium tracking-wider text-sky-400/70 uppercase">
                Target
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-sky-400">
                42.5<span className="text-sky-400/40">×</span>3
                <span className="text-sky-400/40">×</span>10
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-sky-400 px-8 py-3 font-mono text-sm font-semibold text-slate-950 transition-all hover:bg-sky-300 hover:shadow-lg hover:shadow-sky-400/20"
          >
            Open Dashboard →
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-slate-800 px-8 py-3 font-mono text-sm font-medium text-slate-400 transition-all hover:border-slate-700 hover:text-slate-200"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Bottom Tag */}
      <div className="absolute bottom-6 flex items-center gap-2">
        <div className="h-px w-6 bg-slate-800" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-700">
          SBD MODUL 10
        </span>
        <div className="h-px w-6 bg-slate-800" />
      </div>
    </div>
  );
}
