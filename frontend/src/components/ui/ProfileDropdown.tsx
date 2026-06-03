/**
 * TradeLink MVP - ProfileDropdown Component
 * 
 * Dropdown menu that opens from user avatar.
 * Contains modals for My Profile, Saved Jobs, Recently Viewed, My Earnings, and Logout.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  Clock, 
  FileText, 
  LogOut,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import type { ProfileDropdownProps } from '../../types';
import { formatCurrency } from '../../data/sampleJobs';
import { getMyQuotes, type ApiQuote } from '../../lib/backendApi';

const STORAGE_KEY_TOKEN = 'tradelink_token';

/**
 * ProfileDropdown component for user account management
 * Displays user info and provides access to account features
 */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  tradie, 
  savedJobs, 
  recentlyViewedJobs, 
  submittedQuotes: _submittedQuotes,
  onLogout, 
  onRemoveSavedJob 
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [fetchedQuotes, setFetchedQuotes] = useState<ApiQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu items configuration
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'saved', label: 'Saved Jobs', icon: Bookmark, count: savedJobs.length },
    { id: 'recent', label: 'Recently Viewed', icon: Clock, count: recentlyViewedJobs.length },
    { id: 'quotes', label: 'Past Quotes Sent', icon: FileText },
    { id: 'logout', label: 'Log Out', icon: LogOut },
  ];

  // Fetch quotes from backend when quotes modal opens
  const fetchQuotes = async () => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) return;
    setQuotesLoading(true);
    setQuotesError(null);
    try {
      const quotes = await getMyQuotes(token);
      setFetchedQuotes(quotes);
    } catch (err) {
      setQuotesError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setQuotesLoading(false);
    }
  };

  // Handle menu item click
  const handleMenuClick = (itemId: string) => {
    if (itemId === 'logout') {
      onLogout();
      navigate('/');
      setIsOpen(false);
    } else {
      setActiveModal(itemId);
      setIsOpen(false);
      if (itemId === 'quotes') {
        fetchQuotes();
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Render modal content based on active modal
  const renderModalContent = () => {
    switch (activeModal) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white text-xl font-bold">
                {tradie.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy">{tradie.name}</h3>
                <p className="text-gray-600">{tradie.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Trade</label>
                <p className="text-gray-700">{tradie.trade}</p>
              </div>
              <div>
                <label className="form-label">License</label>
                <p className="text-gray-700">{tradie.license}</p>
              </div>
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="space-y-3">
            {savedJobs.length === 0 ? (
              <div className="empty-state">
                <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No saved jobs yet</p>
                <p className="text-sm text-gray-400">Save jobs to view them here</p>
              </div>
            ) : (
              savedJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-navy">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.customer.location}</p>
                  </div>
                  <button
                    onClick={() => onRemoveSavedJob(job.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        );

      case 'recent':
        return (
          <div className="space-y-3">
            {recentlyViewedJobs.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No recently viewed jobs</p>
                <p className="text-sm text-gray-400">Jobs you view will appear here</p>
              </div>
            ) : (
              recentlyViewedJobs.map((job) => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-navy">{job.title}</p>
                  <p className="text-sm text-gray-600">{job.customer.location}</p>
                </div>
              ))
            )}
          </div>
        );

      case 'quotes':
        return (
          <div className="space-y-3">
            {quotesLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-navy mb-3" />
                <p className="text-gray-500">Loading your quotes...</p>
              </div>
            ) : quotesError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{quotesError}</p>
                <button onClick={fetchQuotes} className="btn btn-secondary text-sm">Try Again</button>
              </div>
            ) : fetchedQuotes.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No quotes sent yet</p>
                <p className="text-sm text-gray-400">Quotes you send will appear here</p>
              </div>
            ) : (
              fetchedQuotes.map((quote) => (
                <div key={quote.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-navy">{quote.job_title || 'Unknown Job'}</p>
                  <p className="text-sm text-gray-600">{quote.customer_name || 'Unknown Customer'}</p>
                  <p className="text-sm font-semibold text-orange mt-1">
                    {formatCurrency(quote.amount)}
                  </p>
                  {quote.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{quote.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center text-white text-sm font-medium">
          {tradie.name.charAt(0)}
        </div>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-dropdown">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-medium text-navy">{tradie.name}</p>
            <p className="text-sm text-gray-600">{tradie.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="profile-dropdown-item w-full"
                >
                  <Icon size={18} className="text-gray-500" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-navy">
                {menuItems.find(item => item.id === activeModal)?.label}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {renderModalContent()}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
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

export default ProfileDropdown;