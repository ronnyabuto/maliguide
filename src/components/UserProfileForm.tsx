import React, { useState, useEffect } from 'react';
import { X, User, Target, DollarSign, Clock, TrendingUp, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';

interface UserProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ isOpen, onClose }) => {
  const { profile, loading, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Investment goals options
  const investmentGoalsOptions = [
    { value: 'retirement', label: 'Retirement Planning' },
    { value: 'wealth-building', label: 'Wealth Building' },
    { value: 'emergency-fund', label: 'Emergency Fund' },
    { value: 'education', label: 'Education Funding' },
    { value: 'home-purchase', label: 'Home Purchase' },
    { value: 'business-investment', label: 'Business Investment' },
    { value: 'passive-income', label: 'Passive Income' },
    { value: 'short-term-goals', label: 'Short-term Goals' }
  ];

  // Preferred sectors options
  const sectorOptions = [
    { value: 'banking', label: 'Banking & Financial Services' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'technology', label: 'Technology' },
    { value: 'consumer-goods', label: 'Consumer Goods' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'government-securities', label: 'Government Securities' }
  ];

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleArrayToggle = (field: 'investmentGoals' | 'preferredSectors', value: string) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-lg text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Investment Profile</h2>
              <p className="text-sm text-gray-600">Customize your investment preferences for better recommendations</p>
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
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-emerald-600 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Experience
                  </label>
                  <select
                    value={formData.experience || 'beginner'}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Risk & Investment Style */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                Risk & Investment Style
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Tolerance
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'conservative', label: 'Conservative', desc: 'Prefer stable, low-risk investments' },
                      { value: 'moderate', label: 'Moderate', desc: 'Balance between risk and return' },
                      { value: 'aggressive', label: 'Aggressive', desc: 'Willing to take high risks for high returns' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="riskTolerance"
                          value={option.value}
                          checked={formData.riskTolerance === option.value}
                          onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Style
                  </label>
                  <select
                    value={formData.investmentStyle || 'balanced'}
                    onChange={(e) => handleInputChange('investmentStyle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="conservative">Conservative - Capital preservation</option>
                    <option value="balanced">Balanced - Moderate growth</option>
                    <option value="growth">Growth - Long-term appreciation</option>
                    <option value="aggressive">Aggressive - Maximum returns</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Goals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-emerald-600 mr-2" />
                Financial Goals & Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Goals (Select all that apply)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {investmentGoalsOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.investmentGoals || []).includes(option.value)}
                          onChange={() => handleArrayToggle('investmentGoals', option.value)}
                          className="text-emerald-600 focus:ring-emerald-500 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Time Horizon
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.timeHorizon || 5}
                    onChange={(e) => handleInputChange('timeHorizon', parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Years"
                  />
                  <p className="text-sm text-gray-500 mt-1">How many years do you plan to invest?</p>
                </div>
              </div>
            </div>

            {/* Budget & Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                Budget & Sector Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Investment Budget (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.monthlyBudget || ''}
                    onChange={(e) => handleInputChange('monthlyBudget', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Preference
                  </label>
                  <select
                    value={formData.currencyPreference || 'KES'}
                    onChange={(e) => handleInputChange('currencyPreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Investment Sectors
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {sectorOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.preferredSectors || []).includes(option.value)}
                        onChange={() => handleArrayToggle('preferredSectors', option.value)}
                        className="text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Market updates and recommendations' },
                  { key: 'push', label: 'Push Notifications', desc: 'Real-time alerts and price changes' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Important alerts only' }
                ].map((option) => (
                  <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationPreferences?.[option.key as keyof typeof formData.notificationPreferences] || false}
                      onChange={(e) => handleInputChange('notificationPreferences', {
                        ...formData.notificationPreferences,
                        [option.key]: e.target.checked
                      })}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {saveSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Profile saved successfully!</span>
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
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;