import { useState, useEffect, useRef } from 'react';
import { apiClient, transformRecommendationData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface AIRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    category: string;
    exchange: string;
  };
  confidence: number;
  reasoning: string;
  targetAllocation?: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  content?: string;
  impact: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  sentiment_category?: string;
  confidence_level?: number;
  relevant_assets: string[];
  keywords?: string[];
  source: string;
  source_url?: string;
  published_at?: string;
  created_at: string;
}

export const useAIRecommendations = (pollingInterval?: number) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecommendations = async () => {
    if (!user?.id) return;

    try {
      // Only show loading on initial fetch
      if (recommendations.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiClient.getAIRecommendations(user.id);
      
      if (response.success) {
        const transformedData = response.data.map(transformRecommendationData);
        setRecommendations(transformedData);
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data if we don't have existing data
      if (recommendations.length === 0) {
        const mockRecommendations: AIRecommendation[] = [
          {
            id: '1',
            type: 'buy',
            asset: {
              id: 'kcb',
              name: 'KCB Group PLC',
              symbol: 'KCB',
              price: 42.25,
              category: 'stock',
              exchange: 'NSE'
            },
            confidence: 85,
            reasoning: 'Strong Q3 earnings growth and expanding digital banking services position KCB well for continued growth. Current market sentiment is positive for banking sector.',
            targetAllocation: 15,
            timeframe: '6-12 months',
            riskLevel: 'medium',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'hold',
            asset: {
              id: 'safcom',
              name: 'Safaricom PLC',
              symbol: 'SCOM',
              price: 28.50,
              category: 'stock',
              exchange: 'NSE'
            },
            confidence: 78,
            reasoning: 'Safaricom maintains strong fundamentals with M-Pesa growth, but recent gains may limit short-term upside. Market sentiment remains positive.',
            timeframe: '3-6 months',
            riskLevel: 'low',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];
        setRecommendations(mockRecommendations);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Initial fetch
      fetchRecommendations();

      // Set up polling if interval is provided
      if (pollingInterval && pollingInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchRecommendations();
        }, pollingInterval);
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, pollingInterval]);

  const generateRecommendations = async (preferences: {
    risk_profile?: string;
    investment_goals?: string[];
  }) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.generateAIRecommendations(user.id, preferences);
      if (response.success) {
        await fetchRecommendations(); // Refresh recommendations
        return response;
      }
      throw new Error('Failed to generate recommendations');
    } catch (err) {
      console.error('Error generating recommendations:', err);
      throw err;
    }
  };

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    generateRecommendations
  };
};

export const useMarketInsights = (filters?: { 
  limit?: number; 
  impact?: string; 
  sentiment_category?: string;
  pollingInterval?: number; // New parameter for polling
}) => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInsights = async () => {
    try {
      // Only show loading on initial fetch
      if (insights.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiClient.getMarketInsights({
        limit: filters?.limit,
        impact: filters?.impact,
        sentiment_category: filters?.sentiment_category
      });
      
      if (response.success) {
        setInsights(response.data);
      } else {
        throw new Error('Failed to fetch market insights');
      }
    } catch (err) {
      console.error('Error fetching market insights:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data if we don't have existing data
      if (insights.length === 0) {
        const mockInsights: MarketInsight[] = [
          {
            id: '1',
            title: 'Safaricom Reports Strong Q3 Growth Driven by M-Pesa Expansion',
            description: 'Kenya\'s leading telecommunications company posted impressive quarterly results with M-Pesa transactions reaching new highs.',
            impact: 'positive',
            sentiment_score: 0.75,
            sentiment_category: 'positive',
            confidence_level: 0.85,
            relevant_assets: ['safcom'],
            keywords: ['growth', 'M-Pesa', 'expansion'],
            source: 'Business Daily',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Central Bank Maintains Policy Rate Amid Inflation Concerns',
            description: 'CBK holds benchmark rate at 13% as policymakers balance growth support with price stability.',
            impact: 'neutral',
            sentiment_score: 0.05,
            sentiment_category: 'neutral',
            confidence_level: 0.90,
            relevant_assets: ['tbond-10yr', 'tbill-91d'],
            keywords: ['policy rate', 'inflation'],
            source: 'Central Bank of Kenya',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setInsights(mockInsights);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInsights();

    // Set up polling if interval is provided
    if (filters?.pollingInterval && filters.pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchInsights();
      }, filters.pollingInterval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [filters?.limit, filters?.impact, filters?.sentiment_category, filters?.pollingInterval]);

  return { insights, loading, error, refetch: fetchInsights };
};

export const useAIChat = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string, context?: any) => {
    try {
      setLoading(true);
      
      const response = await apiClient.chatWithAI(message, user?.id, context);
      
      if (response.success) {
        return response.data.message;
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (err) {
      console.error('Error sending message to AI:', err);
      
      // Fallback response
      return "I'm having trouble connecting to the AI service right now. Please try again later, or check if the backend server is running.";
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};