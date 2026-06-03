/**
 * TradeLink MVP - Header Component
 * 
 * Sticky header with navigation links and profile dropdown.
 * Displays logo, navigation, and user profile controls.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  User, 
  Menu,
  X
} from 'lucide-react';
import type { HeaderProps } from '../../types';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';

/**
 * Header component for main navigation
 * Includes logo, nav links, and profile dropdown
 */
const Header: React.FC<HeaderProps> = ({ 
  tradie, 
  onLogout, 
  savedJobs = [], 
  recentlyViewedJobs = [], 
  submittedQuotes = [],
  onRemoveSavedJob 
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation links configuration
  const navLinks = [
    { path: '/jobs', label: 'Browse Jobs', icon: Search },
    { path: '/onboarding', label: 'How It Works', icon: FileText },
  ];

  // Check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${isActivePath(link.path)
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                    }
                  `}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="flex items-center gap-4">
            {tradie ? (
              <ProfileDropdown 
                tradie={tradie}
                savedJobs={savedJobs}
                recentlyViewedJobs={recentlyViewedJobs}
                submittedQuotes={submittedQuotes}
                onLogout={onLogout}
                onRemoveSavedJob={onRemoveSavedJob || (() => {})}
              />
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-navy hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${isActivePath(link.path)
                        ? 'bg-navy text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Links */}
              {!tradie && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-navy transition-colors duration-200"
                  >
                    <User size={20} />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-navy text-white hover:bg-navy-dark transition-colors duration-200"
                  >
                    <User size={20} />
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;