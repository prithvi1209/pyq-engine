import React, { useState } from "react";
import {
  Flame,
  Home,
  Newspaper,
  Settings2,
  LayoutGrid,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  BarChart2,
  Loader2,
} from "lucide-react";

// --- MODULE IMPORTS ---
import { UserProvider, useUser } from "./UserContext";
// Note: If you don't have firebase set up yet, the Context below handles a mock fallback
// import { auth } from "./firebase"; 
import Login from "./Login";
import PYQDashboard from "./PYQDashboard";
import ProfileDashboard from "./ProfileDashboard";

// --- MAIN CONTENT COMPONENT ---
function AppContent() {
  const { user, profile, loading, logout } = useUser(); // Added logout to context for cleaner logic
  const [view, setView] = useState<"home" | "pyq" | "profile">("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // 2. AUTH GUARD
  // If no user is logged in, show Login screen
  if (!user) {
    return <Login />;
  }

  // 3. LOGOUT HANDLER
  const handleLogout = async () => {
    await logout();
    setView("home");
  };

  // 4. VIEW ROUTING
  if (view === "pyq") {
    return <PYQDashboard onBack={() => setView("home")} />;
  }

  if (view === "profile") {
    // Assuming you have a ProfileDashboard, otherwise fallback to Home
    return <ProfileDashboard onBack={() => setView("home")} />;
  }

  // 5. HOME DASHBOARD
  return (
    <div
      className="min-h-screen bg-slate-50 pb-24 font-sans relative"
      onClick={() => setIsProfileOpen(false)}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            UPSC.BRAIN
          </span>
          <h1 className="text-xl font-black text-slate-900">Home</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Coin Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-amber-50 border-amber-100 transition-all hover:scale-105">
            <Flame size={18} className="text-amber-600 fill-amber-600" />
            <span className="font-bold text-slate-900 text-sm">
              {profile?.coins || 0}
            </span>
          </div>

          {/* AVATAR DROPDOWN */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200 hover:border-indigo-400 transition-all shadow-sm"
            >
              {profile?.displayName?.charAt(0).toUpperCase() || "U"}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {profile?.displayName || "Aspirant"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile?.email || "user@example.com"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setView("profile");
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <BarChart2 size={18} /> Performance
                </button>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="max-w-md mx-auto px-6 pt-8 space-y-6">
        
        {/* PYQ ENGINE CARD (The Entry Point) */}
        <div
          onClick={() => setView("pyq")}
          className="group relative overflow-hidden bg-slate-900 rounded-3xl p-8 cursor-pointer shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95"
        >
          {/* Animated Background Blob */}
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 shadow-inner">
              <LayoutGrid size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">PYQ Engine</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Master Economy & more with the new Split-Screen Learning Engine.
            </p>
            <div className="mt-8 flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
              <span>Enter Module</span>
              <ArrowLeft className="rotate-180" size={16} />
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-60 flex flex-col items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all">
            <Newspaper className="text-indigo-400" size={32} />
            <div className="text-sm font-bold text-slate-400">Daily News</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-60 flex flex-col items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all">
            <Settings2 className="text-indigo-400" size={32} />
            <div className="text-sm font-bold text-slate-400">Tools</div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-8 py-3 pb-8 flex justify-between items-center z-40">
        <div className="flex flex-col items-center gap-1 text-slate-900 font-bold cursor-pointer">
          <Home size={22} />
          <span className="text-[10px]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400 font-bold cursor-pointer hover:text-slate-600">
          <Newspaper size={22} />
          <span className="text-[10px]">News</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400 font-bold cursor-pointer hover:text-slate-600">
          <Settings2 size={22} />
          <span className="text-[10px]">Tools</span>
        </div>
      </nav>
    </div>
  );
}

// --- APP WRAPPER ---
export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}