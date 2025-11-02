import React from 'react';
import AuthBranding from './AuthBranding';
import AuthForm from './AuthForm';

const AuthPage = ({ 
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
  return (
    <div className="min-h-screen bg-white text-black flex">
      <AuthBranding />
      <AuthForm 
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        isAuthLoading={isAuthLoading}
        authError={authError}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isAuthenticated={isAuthenticated}
        userData={userData}
      />
    </div>
  );
};

export default AuthPage;
