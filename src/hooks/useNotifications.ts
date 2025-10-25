import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'recommendation' | 'market_alert' | 'system' | 'portfolio_update' | 'news' | 'price_alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
  asset_id?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  recommendation_alerts: boolean;
  market_alerts: boolean;
  portfolio_alerts: boolean;
  news_alerts: boolean;
  price_alerts: boolean;
  system_alerts: boolean;
  price_change_threshold: number;
  portfolio_change_threshold: number;
}

export const useNotifications = (pollingInterval = 30000) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      if (notifications.length === 0) {
        setLoading(true);
      }
      setError(null);

      const response = await apiClient.getUserNotifications(user.id);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const response = await apiClient.getUnreadCount(user.id);
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();

      // Set up polling
      if (pollingInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchNotifications();
          fetchUnreadCount();
        }, pollingInterval);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, pollingInterval]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.markNotificationAsRead(user.id, notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await apiClient.markAllNotificationsAsRead(user.id);
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.deleteNotification(user.id, notificationId);
      if (response.success) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getNotificationPreferences(user.id);
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.updateNotificationPreferences(user.id, updates);
      if (response.success) {
        setPreferences(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      throw err;
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  };
};