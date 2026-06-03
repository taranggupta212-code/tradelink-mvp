/**
 * TradeLink MVP - Welcome Page
 * 
 * Hero section with large logo, tagline "Connecting Tradies to Work",
 * and large "Get Started" CTA. No header displayed on this page.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import type { WelcomePageProps } from '../types';
import Logo from '../components/ui/Logo';

/**
 * Welcome page component
 * Landing page for new users with hero section and CTA
 */
const WelcomePage: React.FC<WelcomePageProps> = (_props) => {
  const navigate = useNavigate();

  /**
   * Handle Get Started button click
   * Navigates to sign up page
   */
  const handleGetStarted = () => {
    navigate('/signup');
  };

  /**
   * Handle Log In link click
   * Navigates to login page
   */
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Large Logo */}
        <div className="mb-8">
          <Logo size="lg" showWordmark={true} />
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto">
          {/* Tagline */}
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Connecting Tradies to Work
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-8">
            AI-powered smart quoting that turns a 30-minute manual process into a 2-minute guided experience.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center mb-3">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-navy mb-1">AI Smart Quotes</h3>
              <p className="text-sm text-gray-600">Instant scope and estimates from job photos</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center mb-3">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-navy mb-1">Verified Jobs</h3>
              <p className="text-sm text-gray-600">Quality leads from real customers</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center mb-3">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-navy mb-1">Save Time</h3>
              <p className="text-sm text-gray-600">Focus on work, not paperwork</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="btn-cta w-full max-w-md flex items-center justify-center gap-3"
            >
              <span>Get Started</span>
              <ArrowRight size={24} />
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="text-orange font-semibold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© 2026 TradeLink. All rights reserved.</p>
        <p className="mt-1">AI-powered quoting for Australian tradies</p>
      </footer>
    </div>
  );
};

export default WelcomePage;