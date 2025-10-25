import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, Filter, Clock, TrendingUp, AlertTriangle, Info, Zap, Newspaper } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case 'market_alert':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'price_alert':
        return <Zap className="h-5 w-5 text-blue-600" />;
      case 'portfolio_update':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'news':
        return <Newspaper className="h-5 w-5 text-gray-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColors = {
      recommendation: 'border-l-emerald-500 bg-emerald-50',
      market_alert: 'border-l-amber-500 bg-amber-50',
      price_alert: 'border-l-blue-500 bg-blue-50',
      portfolio_update: 'border-l-purple-500 bg-purple-50',
      news: 'border-l-gray-500 bg-gray-50',
      system: 'border-l-indigo-500 bg-indigo-50'
    };

    const readColors = {
      recommendation: 'border-l-emerald-300 bg-emerald-25',
      market_alert: 'border-l-amber-300 bg-amber-25',
      price_alert: 'border-l-blue-300 bg-blue-25',
      portfolio_update: 'border-l-purple-300 bg-purple-25',
      news: 'border-l-gray-300 bg-gray-25',
      system: 'border-l-indigo-300 bg-indigo-25'
    };

    return read ? (readColors[type as keyof typeof readColors] || 'border-l-gray-300 bg-gray-25') : 
                  (baseColors[type as keyof typeof baseColors] || 'border-l-gray-500 bg-gray-50');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      // Navigate to the link (you might want to use React Router here)
      window.location.href = notification.link;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notification Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                </select>
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="recommendation">Recommendations</option>
                <option value="market_alert">Market Alerts</option>
                <option value="price_alert">Price Alerts</option>
                <option value="portfolio_update">Portfolio Updates</option>
                <option value="news">News</option>
                <option value="system">System</option>
              </select>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type, notification.read)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                          </div>
                          
                          {notification.asset_id && (
                            <span className="bg-gray-200 px-2 py-1 rounded-full text-xs font-medium">
                              {notification.asset_id.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <button
              onClick={onOpenSettings}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage preferences →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;