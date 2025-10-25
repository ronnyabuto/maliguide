import React, { useState } from 'react';
import { TrendingUp, User, Bell, Search, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileCompletion } from '../hooks/useUserProfile';
import { useNotifications } from '../hooks/useNotifications';
import AuthModal from './auth/AuthModal';
import NotificationCenter from './NotificationCenter';
import NotificationSettings from './NotificationSettings';

interface NavbarProps {
  onShowProfile?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onShowProfile }) => {
  const { user, signOut } = useAuth();
  const { completion } = useProfileCompletion();
  const { unreadCount } = useNotifications();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getProfileCompletionColor = () => {
    if (!completion) return 'bg-gray-200';
    if (completion.completion_percentage >= 80) return 'bg-green-500';
    if (completion.completion_percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MaliGuide</h1>
                <p className="text-xs text-gray-500">Your Wealth Building Guide</p>
              </div>
            </div>
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ask anything about investments..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-80"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button 
                    onClick={() => setShowNotifications(true)}
                    className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <div className="relative">
                        <User className="h-4 w-4 text-emerald-600" />
                        {completion && completion.completion_percentage < 100 && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getProfileCompletionColor()}`}></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-emerald-700">
                        {getUserDisplayName()}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {completion && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Profile Completion</span>
                                <span>{completion.completion_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${getProfileCompletionColor()}`}
                                  style={{ width: `${completion.completion_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            onShowProfile?.();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <UserCircle className="h-4 w-4" />
                          <span>Investment Profile</span>
                          {completion && completion.completion_percentage < 100 && (
                            <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                              {completion.completion_percentage}%
                            </span>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowNotificationSettings(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Bell className="h-4 w-4" />
                          <span>Notification Settings</span>
                        </button>
                        
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                        
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        onOpenSettings={() => {
          setShowNotifications(false);
          setShowNotificationSettings(true);
        }}
      />
      
      <NotificationSettings 
        isOpen={showNotificationSettings} 
        onClose={() => setShowNotificationSettings(false)} 
      />
    </>
  );
};

export default Navbar;