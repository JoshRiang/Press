"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, History, Cpu, Activity, User, Plus, X, LogOut, Database, HelpCircle } from "lucide-react";
import { logout } from "@/src/services/authService";
import { useSessionStore } from "@/src/store/useSessionStore";
import { useProfileStore } from "@/src/store/useProfileStore";
import { useAuth } from "@/src/hooks/useAuth";
import api from "@/src/services/authService";

// Navigation Items For Navbar

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "HOME",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/session",
    label: "Sessions",
    shortLabel: "SESSIONS",
    icon: History,
    exact: false,
  },
  {
    href: "/dashboard/engine",
    label: "Engine",
    shortLabel: "ENGINE",
    icon: Cpu,
    exact: true,
  },
  {
    href: "/dashboard/mybody",
    label: "Anatomy",
    shortLabel: "BODY",
    icon: Activity,
    exact: true,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    shortLabel: "PROFILE",
    icon: User,
    exact: true,
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

// DB Status Indicator

function DbStatusDot({ status }: { status: "connected" | "disconnected" | "checking" }) {
  const colorMap = {
    connected: "bg-emerald-400",
    disconnected: "bg-red-400",
    checking: "bg-amber-400 animate-pulse",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-1.5 w-1.5 rounded-full ${colorMap[status]}`} />
      <span className="font-mono text-[8px] tracking-wider text-slate-600 uppercase">{status === "connected" ? "" : status === "disconnected" ? "OFFLINE" : "SYNC"}</span>
    </div>
  );
}

// Main Layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startSession } = useSessionStore();
  const { dbStatus, setDbStatus, loadUser } = useProfileStore();
  const { isAuthenticated, isLoading, user, forceLogout } = useAuth();

  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load profile & DB status after auth is verified
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) return;

    const isGetStartedPage = pathname === "/dashboard/getstarted";
    const isNewUser = document.cookie.includes("press_new_user=1");

    if (isNewUser && !isGetStartedPage) {
      document.cookie = "press_new_user=; path=/; max-age=0; samesite=lax";
      router.replace("/dashboard/getstarted");
      return;
    }

    loadUser();
    setDbStatus("checking");
    // TODO: Find a new way to get the status of the database connection
    setDbStatus("connected");
  }, [isAuthenticated, pathname, router, setDbStatus, loadUser]);

  // Do not render anything until auth is verified and component is mounted on client
  if (!mounted || isLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors — we're logging out anyway
    }
    forceLogout();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await startSession(title.trim());
      setTitle("");
      setShowNew(false);
      router.push(`/dashboard`);
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* DESKTOP SIDEBAR (hidden on mobile) */}
      <aside className="hidden md:flex md:w-[220px] lg:w-[260px] flex-col border-r border-slate-800/60 bg-slate-950/50">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-800/40">
          <img src="/icon_no_bg.png" alt="PRESS Logo" className="h-5 w-auto object-contain" />
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs transition-all duration-200 ${active ? "bg-sky-400/10 text-sky-400" : "text-slate-500 hover:bg-slate-900/60 hover:text-slate-300"}`}>
                {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sky-400" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                <item.icon size={16} className={active ? "text-sky-400" : "text-slate-600 group-hover:text-slate-400"} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* New Session Button */}
          <button onClick={() => setShowNew(true)} className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-sky-400/30 px-3 py-2.5 font-mono text-xs font-medium text-sky-400/70 transition-all hover:border-sky-400/50 hover:bg-sky-400/5 hover:text-sky-400">
            <Plus size={16} />
            New Session
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800/40 px-4 py-3 flex flex-col gap-2">
          {/* <DbStatusDot status={dbStatus} /> */}
          <button
            onClick={() => {
              router.push("/dashboard/getstarted?state=3");
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[10px] text-slate-600 transition-colors hover:text-blue-400"
          >
            <HelpCircle size={12} />
            Help
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[10px] text-slate-600 transition-colors hover:text-red-400">
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Top Bar */}
        <header className="glass-strong sticky top-0 z-40 border-b border-slate-800/60 md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
              <img src="/icon_no_bg.png" alt="PRESS Logo" className="h-4 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-2 relative">
              <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 transition-colors hover:bg-sky-400/20">
                <span className="font-mono text-sm font-bold text-sky-400">{user?.full_name?.charAt(0)?.toUpperCase() || "U"}</span>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 top-10 z-50 flex w-48 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                      <Link href="/dashboard/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100">
                        <User size={14} className="text-slate-500" />
                        View My Profile
                      </Link>
                      <div className="h-px bg-slate-800" />

                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          router.push("/dashboard/getstarted?state=3");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-blye-400 transition-colors hover:bg-blue-500/10"
                      >
                        <HelpCircle size={14} />
                        Help
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-40 h-14 items-center justify-between border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-2">
            <Database size={12} className="text-slate-700" />
            <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">{NAV_ITEMS.find((item) => isActive(pathname, item.href, item.exact))?.label || "Dashboard"}</span>
          </div>
          <DbStatusDot status={dbStatus} />
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="glass-strong fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 md:hidden">
        <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${active ? "text-sky-400" : "text-slate-500"}`}>
                <item.icon size={18} />
                <span className="font-mono text-[8px] tracking-wider">{item.shortLabel}</span>
              </Link>
            );
          })}

          {/* Center FAB */}
          <button onClick={() => setShowNew(true)} className="group relative flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-sky-400 font-mono text-slate-950 shadow-[0_0_20px_-5px_rgba(56,189,248,0.6)] transition-all hover:bg-sky-300 hover:scale-105 active:scale-95">
            <div className="absolute inset-0 rounded-full bg-sky-400/40 opacity-20" />
            <Plus size={24} className="transition-transform group-hover:rotate-90" />
          </button>

          {NAV_ITEMS.slice(2, 4).map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${active ? "text-sky-400" : "text-slate-500"}`}>
                <item.icon size={18} />
                <span className="font-mono text-[8px] tracking-wider">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* NEW SESSION MODAL */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm" onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-sm rounded-2xl border border-sky-400/20 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">Start New Session</h2>
                <button onClick={() => setShowNew(false)} className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-6">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chest & Triceps, Pull Day…" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-sky-400" />
                <button type="submit" disabled={creating || !title.trim()} className="w-full rounded-xl bg-sky-400 py-3 font-mono text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50">
                  {creating ? "Starting…" : "Start Session"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
