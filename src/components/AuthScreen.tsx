import React, { useState } from "react";
import { supabase } from "../supabase";
import { FileText, Sparkles, Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

interface AuthScreenProps {
  onClose?: () => void;
  initialIsSignUp?: boolean;
}

export default function AuthScreen({ onClose, initialIsSignUp = false }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setIsSignUp(initialIsSignUp);
  }, [initialIsSignUp]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Attempting sign up with:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        console.log('Sign up response:', { data, error });
        if (error) throw error;
        
        if (data.user && !data.session) {
          // Email confirmation is enabled
          setSuccessMsg("Account created successfully! Please check your email to confirm your account.");
        } else {
          // No email confirmation, user is logged in
          setSuccessMsg("Account created successfully! Welcome.");
        }
      } else {
        console.log('Attempting sign in with:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Sign in response:', { data, error });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth error details:", JSON.stringify(err, null, 2));
      let friendlyMessage = "Authentication failed. Please try again.";
      if (err.message?.includes("User already registered")) {
        friendlyMessage = "This email is already registered.";
      } else if (err.message?.includes("Invalid email")) {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.message?.includes("Password should be at least 6 characters")) {
        friendlyMessage = "Password is too weak.";
      } else if (err.message?.includes("Invalid login credentials")) {
        friendlyMessage = "Incorrect email or password.";
      } else {
        friendlyMessage = err.message || "Authentication failed. Please try again.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      console.log('Starting Google OAuth sign in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      console.log('Google sign in response:', { data, error });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google auth error details:", JSON.stringify(err, null, 2));
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {onClose && (
        <div className="absolute top-6 left-6">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs cursor-pointer transition"
            id="auth-back-to-landing-btn"
          >
            <span>← Back to Home Page</span>
          </button>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/20 mb-4 animate-bounce-slow">
            <FileText className="w-8 h-8" />
          </div>
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Premium Career Tool</span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            AI CV Builder & Tailorer
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in or register to securely save your resumes, track ATS matches, and tailor profiles dynamically.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-100 shadow-xl rounded-2xl sm:px-10">
          {/* Sandbox Auth Notice */}
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-extrabold uppercase text-amber-700 tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Sandbox Notice</span>
            </div>
            <p>
              Email/Password registration is disabled in the system-managed sandbox Firebase console (which requires admin permissions to enable). 
            </p>
            <p className="font-bold text-amber-950">
              Please click the Google Account button below to register or log in instantly with one click!
            </p>
          </div>

          {/* Primary Action: Google Account Connection */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.14-5.127 4.14-3.418 0-6.205-2.787-6.205-6.205s2.787-6.205 6.205-6.205c1.554 0 2.964.57 4.05 1.51l3.073-3.073C19.3 2.85 15.99 1.5 12.24 1.5 6.438 1.5 1.714 6.224 1.714 12s4.724 10.5 10.526 10.5c5.786 0 10.157-4.05 10.157-10.3 0-.693-.07-1.373-.195-2.022H12.24z" />
              </svg>
              <span>Continue with Google Account</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-semibold uppercase tracking-wider">
                Email Option (Requires Console Config)
              </span>
            </div>
          </div>

          {/* Sign In vs Register Tabs for email */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                !isSignUp 
                  ? "bg-white text-gray-900 shadow-xs" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                isSignUp 
                  ? "bg-white text-gray-900 shadow-xs" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 opacity-75 hover:opacity-100 focus-within:opacity-100 transition duration-200">
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-1.5 py-2 px-4 border border-transparent rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition shadow-xs disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isSignUp ? (
                "Attempt Email Registration"
              ) : (
                "Attempt Email Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
