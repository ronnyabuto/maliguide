import { supabase } from '../database/supabase.js';
import { EventEmitter } from 'events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.setupRealtimeSubscription();
  }

  // Create a new notification
  async createNotification(userId, notification) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          asset_id: notification.asset_id,
          metadata: notification.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Emit real-time event
      this.emit('notification_created', { userId, notification: data });

      // Check user preferences and send external notifications
      await this.processExternalNotifications(userId, data);

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, unreadOnly = false, type } = options;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Emit real-time event
      this.emit('notification_read', { userId, notificationId });

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Emit real-time event
      this.emit('notifications_all_read', { userId });

      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Emit real-time event
      this.emit('notification_deleted', { userId, notificationId });

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Create default preferences if none exist
      if (!data) {
        return await this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  // Update user notification preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Create default preferences for new user
  async createDefaultPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .insert({
          user_id: userId,
          email_enabled: true,
          in_app_enabled: true,
          push_enabled: false,
          sms_enabled: false,
          recommendation_alerts: true,
          market_alerts: true,
          portfolio_alerts: true,
          news_alerts: false,
          price_alerts: true,
          system_alerts: true,
          price_change_threshold: 5.0,
          portfolio_change_threshold: 10.0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw error;
    }
  }

  // Process external notifications (email, push, SMS)
  async processExternalNotifications(userId, notification) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Check if user wants this type of notification
      const typeEnabled = this.isNotificationTypeEnabled(notification.type, preferences);
      if (!typeEnabled) return;

      // Send email notification
      if (preferences.email_enabled) {
        await this.sendEmailNotification(userId, notification);
      }

      // Send push notification
      if (preferences.push_enabled) {
        await this.sendPushNotification(userId, notification);
      }

      // Send SMS notification (for critical alerts only)
      if (preferences.sms_enabled && this.isCriticalNotification(notification)) {
        await this.sendSMSNotification(userId, notification);
      }
    } catch (error) {
      console.error('Error processing external notifications:', error);
    }
  }

  // Check if notification type is enabled for user
  isNotificationTypeEnabled(type, preferences) {
    const typeMap = {
      'recommendation': preferences.recommendation_alerts,
      'market_alert': preferences.market_alerts,
      'portfolio_update': preferences.portfolio_alerts,
      'news': preferences.news_alerts,
      'price_alert': preferences.price_alerts,
      'system': preferences.system_alerts
    };
    return typeMap[type] !== false;
  }

  // Check if notification is critical
  isCriticalNotification(notification) {
    return notification.type === 'system' || 
           (notification.type === 'price_alert' && notification.metadata?.severity === 'high') ||
           (notification.type === 'portfolio_update' && notification.metadata?.severity === 'high');
  }

  async sendEmailNotification(userId, notification) {
    try {
      // Get user email from auth.users
      const { data: user } = await supabase.auth.admin.getUserById(userId);
      if (!user?.user?.email) return;

      console.log(`Email notification sent to ${user.user.email}:`, {
        title: notification.title,
        message: notification.message
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async sendPushNotification(userId, notification) {
    try {
      console.log(`Push notification sent to user ${userId}:`, {
        title: notification.title,
        message: notification.message
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendSMSNotification(userId, notification) {
    try {
      console.log(`SMS notification sent to user ${userId}:`, {
        title: notification.title,
        message: notification.message
      });
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  // Setup real-time subscription for notifications
  setupRealtimeSubscription() {
    // This would be used for WebSocket connections
    console.log('Notification service real-time subscription initialized');
  }

  // Automated notification generators
  async createRecommendationNotification(userId, recommendation) {
    return await this.createNotification(userId, {
      type: 'recommendation',
      title: `New ${recommendation.recommendation_type.toUpperCase()} Recommendation`,
      message: `AI recommends ${recommendation.recommendation_type} ${recommendation.asset_symbol} with ${recommendation.confidence_score}% confidence`,
      link: `/portfolio?recommendation=${recommendation.id}`,
      asset_id: recommendation.asset_id,
      metadata: {
        recommendation_id: recommendation.id,
        confidence: recommendation.confidence_score,
        type: recommendation.recommendation_type
      }
    });
  }

  async createPriceAlertNotification(userId, asset, changePercent, preferences) {
    const threshold = preferences.price_change_threshold || 5.0;
    if (Math.abs(changePercent) < threshold) return;

    const direction = changePercent > 0 ? 'increased' : 'decreased';
    const severity = Math.abs(changePercent) > threshold * 2 ? 'high' : 'medium';

    return await this.createNotification(userId, {
      type: 'price_alert',
      title: `Price Alert: ${asset.symbol}`,
      message: `${asset.name} has ${direction} by ${Math.abs(changePercent).toFixed(2)}%`,
      link: `/market/${asset.asset_id}`,
      asset_id: asset.asset_id,
      metadata: {
        change_percent: changePercent,
        current_price: asset.price,
        severity
      }
    });
  }

  async createPortfolioUpdateNotification(userId, portfolioChange, preferences) {
    const threshold = preferences.portfolio_change_threshold || 10.0;
    if (Math.abs(portfolioChange.percent) < threshold) return;

    const direction = portfolioChange.percent > 0 ? 'gained' : 'lost';
    const severity = Math.abs(portfolioChange.percent) > threshold * 1.5 ? 'high' : 'medium';

    return await this.createNotification(userId, {
      type: 'portfolio_update',
      title: `Portfolio Update`,
      message: `Your portfolio has ${direction} ${Math.abs(portfolioChange.percent).toFixed(2)}% (KSh ${Math.abs(portfolioChange.amount).toLocaleString()})`,
      link: '/portfolio',
      metadata: {
        change_percent: portfolioChange.percent,
        change_amount: portfolioChange.amount,
        total_value: portfolioChange.totalValue,
        severity
      }
    });
  }

  async createMarketAlertNotification(userId, insight) {
    return await this.createNotification(userId, {
      type: 'market_alert',
      title: `Market Alert: ${insight.impact.toUpperCase()}`,
      message: insight.title,
      link: `/insights/${insight.id}`,
      metadata: {
        insight_id: insight.id,
        impact: insight.impact,
        sentiment_score: insight.sentiment_score,
        relevant_assets: insight.relevant_assets
      }
    });
  }

  async createNewsNotification(userId, newsItem) {
    return await this.createNotification(userId, {
      type: 'news',
      title: 'Market News Update',
      message: newsItem.title,
      link: newsItem.source_url || '/insights',
      metadata: {
        news_id: newsItem.id,
        source: newsItem.source,
        sentiment_category: newsItem.sentiment_category,
        relevant_assets: newsItem.relevant_assets
      }
    });
  }

  async createSystemNotification(userId, title, message, metadata = {}) {
    return await this.createNotification(userId, {
      type: 'system',
      title,
      message,
      metadata
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;