import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Smartphone, MessageSquare, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotificationPreferences, NotificationPreferences } from '../hooks/useNotifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, loading, updatePreferences } = useNotificationPreferences();
  const [formData, setFormData] = useState<Partial<NotificationPreferences>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleInputChange = (field: keyof NotificationPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      await updatePreferences(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Loading preferences...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-600">Customize how you receive notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* Delivery Methods */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                Delivery Methods
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">In-App Notifications</div>
                      <div className="text-sm text-gray-500">Show notifications within the application</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.in_app_enabled || false}
                    onChange={(e) => handleInputChange('in_app_enabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">Receive notifications via email</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.email_enabled || false}
                    onChange={(e) => handleInputChange('email_enabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-500">Browser push notifications (when available)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.push_enabled || false}
                    onChange={(e) => handleInputChange('push_enabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">SMS Notifications</div>
                      <div className="text-sm text-gray-500">Critical alerts only via SMS</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sms_enabled || false}
                    onChange={(e) => handleInputChange('sms_enabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">AI Recommendations</div>
                    <div className="text-sm text-gray-500">New investment recommendations from AI analysis</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.recommendation_alerts || false}
                    onChange={(e) => handleInputChange('recommendation_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">Market Alerts</div>
                    <div className="text-sm text-gray-500">Important market news and developments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.market_alerts || false}
                    onChange={(e) => handleInputChange('market_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">Portfolio Updates</div>
                    <div className="text-sm text-gray-500">Significant changes in your portfolio value</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.portfolio_alerts || false}
                    onChange={(e) => handleInputChange('portfolio_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">Price Alerts</div>
                    <div className="text-sm text-gray-500">Asset price changes above your threshold</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.price_alerts || false}
                    onChange={(e) => handleInputChange('price_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">News Updates</div>
                    <div className="text-sm text-gray-500">Financial news and market insights</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.news_alerts || false}
                    onChange={(e) => handleInputChange('news_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">System Notifications</div>
                    <div className="text-sm text-gray-500">Account updates and system announcements</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.system_alerts || false}
                    onChange={(e) => handleInputChange('system_alerts', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Alert Thresholds */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Change Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={formData.price_change_threshold || 5.0}
                    onChange={(e) => handleInputChange('price_change_threshold', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Get alerts when asset prices change by this percentage or more
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Change Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={formData.portfolio_change_threshold || 10.0}
                    onChange={(e) => handleInputChange('portfolio_change_threshold', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10.0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Get alerts when your portfolio value changes by this percentage or more
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {saveSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Notification preferences saved successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{saveError}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;