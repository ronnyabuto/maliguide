import express from 'express';
import { notificationService } from '../services/notificationService.js';

const router = express.Router();

// Get user notifications
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, unread_only, type } = req.query;

    const notifications = await notificationService.getUserNotifications(userId, {
      limit: limit ? parseInt(limit) : 50,
      unreadOnly: unread_only === 'true',
      type
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:userId/:notificationId/read', async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    const notification = await notificationService.markAsRead(userId, notificationId);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:userId/:notificationId', async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    await notificationService.deleteNotification(userId, notificationId);

    res.json({
      success: true,
      message: 'Notification deleted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user notification preferences
router.get('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user notification preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await notificationService.updateUserPreferences(userId, req.body);

    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create notification (admin/system use)
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notification = await notificationService.createNotification(userId, req.body);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test notification endpoint (development only)
router.post('/:userId/test', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint not available in production' });
    }

    const { userId } = req.params;
    const { type = 'system' } = req.body;

    const testNotifications = {
      recommendation: {
        type: 'recommendation',
        title: 'New AI Recommendation',
        message: 'AI recommends buying KCB with 85% confidence based on recent market analysis',
        asset_id: 'kcb',
        metadata: { confidence: 85, recommendation_type: 'buy' }
      },
      price_alert: {
        type: 'price_alert',
        title: 'Price Alert: SCOM',
        message: 'Safaricom has increased by 5.2% in the last hour',
        asset_id: 'safcom',
        metadata: { change_percent: 5.2, current_price: 28.50 }
      },
      portfolio_update: {
        type: 'portfolio_update',
        title: 'Portfolio Update',
        message: 'Your portfolio has gained 12.5% (KSh 15,000) today',
        metadata: { change_percent: 12.5, change_amount: 15000 }
      },
      market_alert: {
        type: 'market_alert',
        title: 'Market Alert: POSITIVE',
        message: 'CBK maintains policy rate at 13%, supporting banking sector stability',
        metadata: { impact: 'positive', relevant_assets: ['kcb', 'eqty'] }
      },
      system: {
        type: 'system',
        title: 'Welcome to InvestKE!',
        message: 'Your account has been successfully set up. Start building your portfolio today.',
        metadata: { welcome: true }
      }
    };

    const testNotification = testNotifications[type] || testNotifications.system;
    const notification = await notificationService.createNotification(userId, testNotification);

    res.status(201).json({
      success: true,
      data: notification,
      message: `Test ${type} notification created`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;