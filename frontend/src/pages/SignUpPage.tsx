/**
 * TradeLink MVP - Sign Up Page
 * 
 * Centered card with name, email, trade dropdown, license, password, T&C checkbox.
 * Back button at top. Form validation with touched-on-blur pattern.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, FileText, Eye, EyeOff, CheckSquare, Square, X } from 'lucide-react';
import type { SignUpPageProps, TradeCategory, Tradie } from '../types';
import BackButton from '../components/ui/BackButton';
import Logo from '../components/ui/Logo';
import { signup, login } from '../lib/backendApi';

/**
 * Sign Up page component
 * Provides registration form for new tradies
 */
const SignUpPage: React.FC<SignUpPageProps> = ({ callbacks }) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    trade: '' as TradeCategory | '',
    license: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal state for legal text
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Trade categories
  const tradeCategories: TradeCategory[] = [
    'Carpentry',
    'Plumbing',
    'Electrical',
    'Roofing',
    'Landscaping',
    'Tiling',
    'Painting'
  ];

  /**
   * Validate name field
   */
  const validateName = (name: string): string => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  /**
   * Validate email field
   */
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return '';
  };

  /**
   * Validate trade field
   */
  const validateTrade = (trade: string): string => {
    if (!trade) return 'Please select your trade';
    return '';
  };

  /**
   * Validate license field
   */
  const validateLicense = (license: string): string => {
    if (!license) return 'License number is required';
    if (license.length < 3) return 'License number must be at least 3 characters';
    return '';
  };

  /**
   * Validate password field
   */
  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  /**
   * Validate confirm password field
   */
  const validateConfirmPassword = (confirmPassword: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return '';
  };

  /**
   * Validate terms checkbox
   */
  const validateTerms = (acceptTerms: boolean): string => {
    if (!acceptTerms) return 'You must accept the terms and conditions';
    return '';
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle input blur - trigger validation
   */
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(formData.name);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'trade':
        error = validateTrade(formData.trade);
        break;
      case 'license':
        error = validateLicense(formData.license);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.confirmPassword);
        break;
      case 'acceptTerms':
        error = validateTerms(formData.acceptTerms);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Check if form is valid
   */
  const isFormValid = (): boolean => {
    return (
      !validateName(formData.name) &&
      !validateEmail(formData.email) &&
      !validateTrade(formData.trade) &&
      !validateLicense(formData.license) &&
      !validatePassword(formData.password) &&
      !validateConfirmPassword(formData.confirmPassword) &&
      !validateTerms(formData.acceptTerms)
    );
  };

  /**
   * Handle form submission — call the backend API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      trade: true,
      license: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true
    });
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const tradeError = validateTrade(formData.trade);
    const licenseError = validateLicense(formData.license);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    const termsError = validateTerms(formData.acceptTerms);
    
    setErrors({
      name: nameError,
      email: emailError,
      trade: tradeError,
      license: licenseError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      acceptTerms: termsError
    });
    
    // If valid, proceed with registration
    if (!nameError && !emailError && !tradeError && !licenseError && 
        !passwordError && !confirmPasswordError && !termsError) {
      setSubmitting(true);
      try {
        // Register via backend API (creates Supabase Auth user + triggers profile row)
        await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.trade,
          formData.license
        );

        // Auto-login to get the auth token
        const loginData = await login(formData.email, formData.password);

        // Store the auth token
        localStorage.setItem('tradelink_token', loginData.access_token);

        // Build the Tradie object for app state
        const meta = loginData.user.user_metadata || {};
        const newTradie: Tradie = {
          id: loginData.user.id,
          name: meta.full_name || formData.name,
          email: loginData.user.email,
          trade: (meta.trade_type || formData.trade) as TradeCategory,
          license: meta.license_number || formData.license,
          password: '',
          createdAt: new Date()
        };

        callbacks.setTradie(newTradie);
        navigate('/onboarding');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setErrors({ email: message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Back Button */}
      <div className="p-6">
        <BackButton label="Back to Home" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="md" showWordmark={true} />
          </div>

          {/* Sign Up Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2">Create Account</h1>
              <p className="text-gray-600">Join TradeLink and start winning jobs</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`form-input pl-10 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`form-input pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              {/* Trade Dropdown */}
              <div>
                <label htmlFor="trade" className="form-label">
                  Trade Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={20} className="text-gray-400" />
                  </div>
                  <select
                    id="trade"
                    value={formData.trade}
                    onChange={(e) => handleInputChange('trade', e.target.value)}
                    onBlur={() => handleBlur('trade')}
                    className={`form-input pl-10 ${errors.trade && touched.trade ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select your trade</option>
                    {tradeCategories.map((trade) => (
                      <option key={trade} value={trade}>
                        {trade}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.trade && touched.trade && (
                  <p className="form-error">{errors.trade}</p>
                )}
              </div>

              {/* License Field */}
              <div>
                <label htmlFor="license" className="form-label">
                  License Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="license"
                    value={formData.license}
                    onChange={(e) => handleInputChange('license', e.target.value)}
                    onBlur={() => handleBlur('license')}
                    className={`form-input pl-10 ${errors.license && touched.license ? 'border-red-500' : ''}`}
                    placeholder="Enter your license number"
                  />
                </div>
                {errors.license && touched.license && (
                  <p className="form-error">{errors.license}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`form-input pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`form-input pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                  onBlur={() => handleBlur('acceptTerms')}
                  className="flex-shrink-0 mt-0.5"
                >
                  {formData.acceptTerms ? (
                    <CheckSquare size={20} className="text-orange" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                </button>
                <div>
                  <p className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-orange hover:underline"
                    >
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-orange hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </p>
                  {errors.acceptTerms && touched.acceptTerms && (
                    <p className="form-error mt-1">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid() || submitting}
                className="btn btn-primary w-full mt-6"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-orange font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-navy">Terms and Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-navy mb-4">1. Acceptance of Terms</h3>
                <p className="text-gray-700 mb-4">
                  By accessing and using TradeLink, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our service. These terms apply to all users, including registered tradies and visitors.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">2. License Verification Requirements</h3>
                <p className="text-gray-700 mb-4">
                  Australian tradies using TradeLink must hold a valid and current trade license appropriate for their trade category. You are required to provide accurate license information during registration and maintain current credentials. TradeLink reserves the right to verify license validity and may suspend accounts with invalid or expired licenses.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">3. AI-Generated Estimates Disclaimer</h3>
                <p className="text-gray-700 mb-4">
                  The AI Smart Quote feature provides estimates for informational purposes only. These estimates are guides based on available data and should not be considered final contracts or binding quotes. The actual scope of work and costs may vary based on site conditions, material availability, and other factors specific to each job.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">4. User Responsibility for Final Quotes</h3>
                <p className="text-gray-700 mb-4">
                  Users are solely responsible for the final quotes they submit to customers. TradeLink does not guarantee the accuracy of AI estimates and is not liable for any discrepancies between estimated and actual costs. You must review and adjust all quotes to reflect your professional assessment before submission.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">5. Limitation of Liability</h3>
                <p className="text-gray-700 mb-4">
                  TradeLink shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform, including but not limited to loss of business, disputes with customers, or financial losses. Users acknowledge that they use the service at their own risk.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">6. Professional Conduct</h3>
                <p className="text-gray-700 mb-4">
                  Users agree to maintain professional standards when using TradeLink, including timely communication with customers, quality workmanship, and adherence to Australian trade standards and regulations. Violations may result in account suspension or termination.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-navy">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-navy mb-4">1. Information We Collect</h3>
                <p className="text-gray-700 mb-4">
                  TradeLink collects personal information necessary to provide our services, including your name, email address, trade category, license number, and password. We also collect job-related data such as quotes submitted, jobs saved, and browsing history within the platform.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">2. How We Store Your Data</h3>
                <p className="text-gray-700 mb-4">
                  Your license and profile data is stored securely in your browser's local storage. This means your information remains on your device and is not transmitted to external servers unless you explicitly choose to sync your account. You can clear this data at any time by logging out or clearing your browser storage.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">3. Third-Party Sharing</h3>
                <p className="text-gray-700 mb-4">
                  We are committed to protecting your privacy. TradeLink does not share your personal contact details, license information, or profile data with third parties without your explicit consent. Your information will never be sold to marketing companies or used for unsolicited communications.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">4. Job Photos and AI Analysis</h3>
                <p className="text-gray-700 mb-4">
                  When you view job listings that include photos, these images are used solely for AI analysis purposes to generate accurate scope estimates and match you with relevant jobs. Job photos are not stored permanently on your device and are processed in accordance with our AI service requirements.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">5. Data Security</h3>
                <p className="text-gray-700 mb-4">
                  We implement industry-standard security measures to protect your data. Passwords are encrypted, and we use secure protocols for any data transmission. While we take every precaution to safeguard your information, we recommend using strong, unique passwords and keeping your login credentials confidential.
                </p>

                <h3 className="text-lg font-semibold text-navy mb-4">6. Your Rights</h3>
                <p className="text-gray-700 mb-4">
                  You have the right to access, modify, or delete your personal information at any time through your profile settings. You can export your data or request complete account deletion. For any privacy-related inquiries, please contact our support team.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
