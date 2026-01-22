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
    <nav className="bg-blue-600 shadow-sm border-b border-blue-700 sticky top-0 z-50">
      <div className="px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 text-white hover:bg-blue-700 rounded-md mr-3"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">{t('nav.title')}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 text-white hover:bg-blue-700 rounded-md text-sm"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'اردو' : 'EN'}
            </button>

            {userProfile && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate max-w-24">{userProfile.name}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 text-white hover:bg-blue-700 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm ml-1">{t('nav.signOut')}</span>
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