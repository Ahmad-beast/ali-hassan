import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { signOut } from '../../services/authService';
import { LogOut, User, DollarSign, Globe, Menu } from 'lucide-react';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { userProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <nav className="bg-blue-600 shadow-sm border-b border-blue-700 sticky top-0 z-50 safe-area-top">
      <div className="px-3 sm:px-4">
        <div className="flex justify-between items-center h-12 sm:h-14">
          <div className="flex items-center">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 text-white hover:bg-blue-700 rounded-md mr-2 mobile-touch-target"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-sm sm:text-lg font-semibold text-white truncate">{t('nav.title')}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-2 py-1 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm mobile-touch-target"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'اردو' : 'EN'}
            </button>

            {userProfile && (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-xs sm:text-sm truncate max-w-20">{userProfile.name}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-2 py-1 text-white hover:bg-blue-700 rounded-md mobile-touch-target"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm ml-1">{t('nav.signOut')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;