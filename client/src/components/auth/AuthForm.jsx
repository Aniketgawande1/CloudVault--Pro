import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const AuthForm = ({
  authMode,
  setAuthMode,
  handleLogin,
  handleSignup,
  isAuthLoading,
  authError,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  showPassword,
  setShowPassword,
  isAuthenticated,
  userData
}) => {
  const onSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      handleLogin(e);
    } else {
      handleSignup(e);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-12 animate-fade-in bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
              CV
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              CloudVault
            </span>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-scale-in bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
          {/* Header */}
          <div>
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-lg font-light">
              {authMode === 'login' 
                ? 'Enter your credentials to access your files' 
                : 'Sign up to start storing your files securely'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {authError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-slide-down">
                {authError}
              </div>
            )}
            
            {/* Full Name - Only for Signup */}
            {authMode === 'signup' && (
              <div className="animate-slide-down">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                />
              </div>
            )}

            {/* Email */}
            <div className="animate-slide-down" style={{ animationDelay: authMode === 'signup' ? '0.1s' : '0s' }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-slide-down" style={{ animationDelay: authMode === 'signup' ? '0.2s' : '0.1s' }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password - Only for Login */}
            {authMode === 'login' && (
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                  <span className="text-gray-600 group-hover:text-black transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-black hover:underline font-semibold transition-all">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-800 hover:to-black transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAuthLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button className="w-full border-2 border-gray-200 py-4 rounded-xl font-semibold text-lg hover:border-black hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-md hover:shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle Auth Mode */}
          <p className="text-center text-gray-600 text-base">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="font-bold text-black hover:underline transition-all"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {/* Debug Info - Only in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
              <div className="font-mono text-gray-600">
                <div>Auth: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
                <div>Token: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? '✅ Exists' : '❌ Missing'}</div>
                <div>User: {userData ? `✅ ${userData.email}` : '❌ Not set'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
