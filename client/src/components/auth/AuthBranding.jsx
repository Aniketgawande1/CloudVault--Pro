"use client"

import React from 'react';
import { Cloud, Shield, Zap } from 'lucide-react';

const AuthBranding = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-900 to-black text-white p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16 animate-fade-in-up">
          <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-100 text-black rounded-xl flex items-center justify-center text-xl font-bold shadow-2xl transform hover:scale-110 transition-transform">
            CV
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">CloudVault</span>
        </div>
        
        <div className="space-y-10 mt-24">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-6xl font-extrabold leading-tight mb-6 animate-slide-down bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Your files,<br />
              everywhere you need them
            </h1>
            <p className="text-2xl text-gray-300 font-light animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
              Secure cloud storage with enterprise-grade encryption and seamless access
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Bank-level Security</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your data is protected with AES-256 encryption and secure authentication
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Access Anywhere</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Sync your files across all your devices with real-time updates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Lightning Fast</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Upload and download at maximum speed with our global CDN
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-gray-400 text-sm">
        <p>© 2025 CloudVault. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthBranding;
