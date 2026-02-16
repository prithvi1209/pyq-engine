import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // --- SIGN UP LOGIC ---
        if (!name.trim()) throw new Error("Please enter your name.");
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Add the display name to the user profile
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Note: We don't need to manually redirect.
      // UserContext detects the change and App.tsx updates automatically.
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      // Map Firebase error codes to friendly messages
      if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      if (err.code === "auth/user-not-found")
        msg = "No account found with this email.";
      if (err.code === "auth/wrong-password") msg = "Incorrect password.";
      if (err.code === "auth/email-already-in-use")
        msg = "Email already in use.";
      if (err.code === "auth/weak-password")
        msg = "Password should be at least 6 characters.";
      if (err.message) msg = err.message; // Capture custom errors like "Please enter your name"
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl shadow-slate-200 border border-white">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl text-indigo-600 mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isSignup
              ? "Start your mastery journey today."
              : "Sign in to continue your progress."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 text-red-600 text-sm font-bold border border-red-100 animate-pulse">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Name Field (Signup Only) */}
          {isSignup && (
            <div className="relative group">
              <User
                className="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative group">
            <Mail
              className="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500"
              size={20}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock
              className="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {isSignup ? "Sign Up" : "Login"}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isSignup ? "Already have an account?" : "New to UPSC.BRAIN?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="ml-1 text-indigo-600 font-black hover:underline focus:outline-none"
            >
              {isSignup ? "Login" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
