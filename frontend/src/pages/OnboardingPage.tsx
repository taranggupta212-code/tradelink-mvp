/**
 * TradeLink MVP - Onboarding Page
 * 
 * 3-step explainer: "Browse matched jobs" → "AI Smart Quote" → "Send and get hired".
 * Security reassurance at bottom. Back button at top.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Send, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import type { OnboardingPageProps } from '../types';
import BackButton from '../components/ui/BackButton';
import Logo from '../components/ui/Logo';

/**
 * Onboarding page component
 * Guides new users through the platform's key features
 */
const OnboardingPage: React.FC<OnboardingPageProps> = (_props) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Onboarding steps configuration
  const steps = [
    {
      id: 1,
      title: 'Browse Matched Jobs',
      description: 'See jobs that match your trade and location. Our AI analyzes job photos to show you relevant opportunities.',
      icon: Search,
      color: 'bg-navy'
    },
    {
      id: 2,
      title: 'AI Smart Quote',
      description: 'Get instant scope of work and cost estimates. Our AI analyzes job details to help you quote faster and more accurately.',
      icon: Sparkles,
      color: 'bg-orange'
    },
    {
      id: 3,
      title: 'Send and Get Hired',
      description: 'Submit your quote with confidence. Customers see your professional quote with detailed scope and competitive pricing.',
      icon: Send,
      color: 'bg-navy'
    }
  ];

  /**
   * Handle next step button click
   */
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - navigate to jobs
      navigate('/jobs');
    }
  };

  /**
   * Handle skip button click
   */
  const handleSkip = () => {
    navigate('/jobs');
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Back Button */}
      <div className="p-6">
        <BackButton label="Back" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="md" showWordmark={true} />
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index <= currentStep ? 'bg-orange' : 'bg-gray-300'
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 transition-colors duration-200 ${
                        index < currentStep ? 'bg-orange' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="card p-8 text-center">
            {/* Step Icon */}
            <div className={`w-16 h-16 ${currentStepData.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon size={32} className="text-white" />
            </div>

            {/* Step Number */}
            <div className="text-sm font-semibold text-orange mb-2">
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Step Title */}
            <h1 className="text-2xl font-bold text-navy mb-4">
              {currentStepData.title}
            </h1>

            {/* Step Description */}
            <p className="text-gray-600 mb-8">
              {currentStepData.description}
            </p>

            {/* Step Visual */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center transition-all duration-300 ${
                        index === currentStep ? 'scale-110' : 'opacity-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          index === currentStep ? step.color : 'bg-gray-300'
                        }`}
                      >
                        <StepIcon size={20} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-600">{step.title.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn btn-secondary flex-1"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <span>Get Started</span>
                    <ArrowRight size={20} />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

            {/* Skip Button */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Skip onboarding
              </button>
            )}
          </div>

          {/* Security Reassurance */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">Your Data is Secure</h3>
                <p className="text-sm text-gray-600">
                  We use industry-standard encryption to protect your personal information. 
                  Your data is never shared with third parties without your consent.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-xs text-gray-500">256-bit SSL encryption</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-xs text-gray-500">GDPR compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;