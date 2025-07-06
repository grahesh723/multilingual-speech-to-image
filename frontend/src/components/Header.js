import React, { useEffect, useRef } from 'react';
import { 
  Palette, Gem, History, ChevronDown, User, CreditCard 
} from 'lucide-react';

/**
 * Header component with user menu, credits display, and navigation
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user data
 * @param {boolean} props.showUserMenu - Whether user menu is visible
 * @param {Function} props.setShowUserMenu - Function to toggle user menu
 * @param {Function} props.setShowHistory - Function to show history modal
 * @param {Function} props.setShowPricing - Function to show pricing modal

 * @returns {JSX.Element} Header component
 */
export const Header = ({
  currentUser,
  showUserMenu,
  setShowUserMenu,
  setShowHistory,
  setShowPricing,
}) => {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, setShowUserMenu]);

  const UserMenu = () => (
    <div className="absolute right-0 top-12 w-64 bg-gradient-to-b from-stone-50 to-amber-50 rounded-xl shadow-2xl border border-amber-200 p-4 z-50">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-amber-200">
        <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-amber-300" />
        <div>
          <div className="font-semibold text-stone-800">{currentUser.name}</div>
          <div className="text-sm text-stone-600">{currentUser.email}</div>
        </div>
      </div>
      <div className="space-y-2">
        <button className="w-full flex items-center gap-2 p-2 hover:bg-amber-100 rounded-lg text-stone-700 transition-colors">
          <User className="w-4 h-4" /> Profile
        </button>

        <button 
          onClick={() => setShowPricing(true)}
          className="w-full flex items-center gap-2 p-2 hover:bg-amber-100 rounded-lg text-stone-700 transition-colors"
        >
          <CreditCard className="w-4 h-4" /> Billing
        </button>
      </div>
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-stone-800 via-amber-900 to-yellow-900 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Artistic Vision</h1>
              <p className="text-xs text-amber-200">AI-Powered Art Generation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Gem className="w-4 h-4 text-amber-300" />
              <span className="text-sm">{currentUser.creditsUsed}/{currentUser.creditsLimit} credits</span>
            </div>
            
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-amber-300" />
                <span className="hidden md:block text-sm">{currentUser.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showUserMenu && <UserMenu />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 