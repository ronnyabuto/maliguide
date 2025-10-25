const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MaliGuide/1.0'
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Market Data APIs
  async getMarketData(params?: { category?: string; exchange?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.exchange) searchParams.append('exchange', params.exchange);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/api/market${query ? `?${query}` : ''}`);
  }

  async getAssetData(assetId: string) {
    return this.request(`/api/market/${assetId}`);
  }

  async getMarketOverview() {
    return this.request('/api/market/overview/major');
  }

  async getTopPerformers(params?: { category?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/api/market/performance/top${query ? `?${query}` : ''}`);
  }

  async getMarketStats() {
    return this.request('/api/market/stats/summary');
  }

  // Portfolio APIs
  async getPortfolio(userId: string) {
    return this.request(`/api/portfolio/${userId}`);
  }

  async addToPortfolio(userId: string, holding: {
    asset_id: string;
    quantity: number;
    purchase_price: number;
    purchase_date?: string;
  }) {
    return this.request(`/api/portfolio/${userId}/holdings`, {
      method: 'POST',
      body: JSON.stringify(holding),
    });
  }

  async updatePortfolioHolding(userId: string, holdingId: string, updates: {
    quantity?: number;
    purchase_price?: number;
  }) {
    return this.request(`/api/portfolio/${userId}/holdings/${holdingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async removeFromPortfolio(userId: string, holdingId: string) {
    return this.request(`/api/portfolio/${userId}/holdings/${holdingId}`, {
      method: 'DELETE',
    });
  }

  async getPortfolioPerformance(userId: string, period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/portfolio/${userId}/performance${query}`);
  }

  // User Profile APIs
  async getUserProfile(userId: string) {
    return this.request(`/api/profile/${userId}`);
  }

  async updateUserProfile(userId: string, profileData: {
    risk_tolerance?: string;
    investment_goals?: string[];
    time_horizon?: number;
    monthly_budget?: number;
    age?: number;
    experience?: string;
    preferred_sectors?: string[];
    investment_style?: string;
    currency_preference?: string;
    notification_preferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }) {
    return this.request(`/api/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfileCompletion(userId: string) {
    return this.request(`/api/profile/${userId}/completion`);
  }

  async getProfileRecommendations(userId: string) {
    return this.request(`/api/profile/${userId}/recommendations`);
  }

  // AI APIs
  async getAIRecommendations(userId: string, activeOnly = true) {
    const query = `?active_only=${activeOnly}`;
    return this.request(`/api/ai/recommendations/${userId}${query}`);
  }

  async generateAIRecommendations(userId: string, preferences: {
    risk_profile?: string;
    investment_goals?: string[];
  }) {
    return this.request(`/api/ai/recommendations/${userId}/generate`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async chatWithAI(message: string, userId?: string, context?: any) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, user_id: userId, context }),
    });
  }

  async getMarketInsights(params?: { limit?: number; impact?: string; sentiment_category?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.impact) searchParams.append('impact', params.impact);
    if (params?.sentiment_category) searchParams.append('sentiment_category', params.sentiment_category);
    
    const query = searchParams.toString();
    return this.request(`/api/ai/insights${query ? `?${query}` : ''}`);
  }

  // Notification APIs
  async getUserNotifications(userId: string, params?: { limit?: number; unread_only?: boolean; type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.unread_only) searchParams.append('unread_only', params.unread_only.toString());
    if (params?.type) searchParams.append('type', params.type);
    
    const query = searchParams.toString();
    return this.request(`/api/notifications/${userId}${query ? `?${query}` : ''}`);
  }

  async getUnreadCount(userId: string) {
    return this.request(`/api/notifications/${userId}/unread-count`);
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return this.request(`/api/notifications/${userId}/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.request(`/api/notifications/${userId}/read-all`, {
      method: 'PUT',
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    return this.request(`/api/notifications/${userId}/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async getNotificationPreferences(userId: string) {
    return this.request(`/api/notifications/${userId}/preferences`);
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.request(`/api/notifications/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async createNotification(userId: string, notification: any) {
    return this.request(`/api/notifications/${userId}`, {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  async createTestNotification(userId: string, type: string) {
    return this.request(`/api/notifications/${userId}/test`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  // Sentiment APIs
  async getSentimentSummary(period = '7d') {
    return this.request(`/api/sentiment/summary?period=${period}`);
  }

  async getAssetSentiment(assetId: string, period = '30d') {
    return this.request(`/api/sentiment/asset/${assetId}?period=${period}`);
  }

  async getSentimentTrends(period = '30d', granularity = 'daily') {
    return this.request(`/api/sentiment/trends?period=${period}&granularity=${granularity}`);
  }

  async getSectorSentiment(period = '7d') {
    return this.request(`/api/sentiment/sectors?period=${period}`);
  }

  // Manual update trigger (admin)
  async triggerDataUpdate() {
    return this.request('/api/market/update/manual', { method: 'POST' });
  }

  async triggerSentimentUpdate() {
    return this.request('/api/sentiment/update', { method: 'POST' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions for data transformation
export const transformAssetData = (apiData: any) => ({
  id: apiData.asset_id,
  name: apiData.name,
  symbol: apiData.symbol,
  price: apiData.price,
  change: apiData.change_amount,
  changePercent: apiData.change_percent,
  volume: apiData.volume,
  marketCap: apiData.market_cap,
  category: apiData.category,
  exchange: apiData.exchange,
  lastUpdated: apiData.last_updated
});

export const transformPortfolioData = (apiData: any) => ({
  holdings: apiData.holdings?.map((holding: any) => ({
    id: holding.id,
    asset: transformAssetData(holding.market_data),
    quantity: holding.quantity,
    purchasePrice: holding.purchase_price,
    currentValue: holding.current_value,
    totalReturn: holding.total_return,
    totalReturnPercent: holding.total_return_percent,
    purchaseDate: holding.purchase_date
  })) || [],
  summary: apiData.summary || {}
});

export const transformRecommendationData = (apiData: any) => ({
  id: apiData.id,
  type: apiData.recommendation_type,
  asset: transformAssetData(apiData.market_data),
  confidence: apiData.confidence_score,
  reasoning: apiData.reasoning,
  targetAllocation: apiData.target_allocation,
  timeframe: apiData.timeframe,
  riskLevel: apiData.risk_level,
  isActive: apiData.is_active,
  createdAt: apiData.created_at,
  expiresAt: apiData.expires_at
});

export const transformUserProfileData = (apiData: any) => ({
  id: apiData.id,
  userId: apiData.user_id,
  riskTolerance: apiData.risk_tolerance,
  investmentGoals: apiData.investment_goals || [],
  timeHorizon: apiData.time_horizon,
  monthlyBudget: apiData.monthly_budget,
  age: apiData.age,
  experience: apiData.experience,
  preferredSectors: apiData.preferred_sectors || [],
  investmentStyle: apiData.investment_style,
  currencyPreference: apiData.currency_preference,
  notificationPreferences: apiData.notification_preferences || { email: true, push: false, sms: false },
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at
});