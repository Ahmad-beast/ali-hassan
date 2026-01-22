import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, List, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userProfile?.role === 'admin';

  const navItems = [
    { to: '/transactions', icon: List, label: t('sidebar.allTransactions'), adminOnly: false },
    { to: '/add-transaction', icon: Plus, label: t('sidebar.newTransaction'), adminOnly: true },
    { to: '/accounts', icon: TrendingUp, label: t('sidebar.dashboard'), adminOnly: true },
    { to: '/logs', icon: FileText, label: t('sidebar.activityLogs'), adminOnly: false },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="mt-4">
          <div className="px-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;