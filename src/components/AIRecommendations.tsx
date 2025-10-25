import React from 'react';
import { Bot, TrendingUp, Shield, Clock, Target, RefreshCw, Sparkles, Wifi } from 'lucide-react';
import { useAIRecommendations } from '../hooks/useAI';

const AIRecommendations: React.FC = () => {
  // Poll every 10 minutes (600000ms) for updated recommendations
  const { recommendations, loading, error, generateRecommendations } = useAIRecommendations(600000);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case 'sell':
        return <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />;
      case 'hold':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'rebalance':
        return <Target className="h-5 w-5 text-amber-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'border-emerald-200 bg-emerald-50';
      case 'sell':
        return 'border-red-200 bg-red-50';
      case 'hold':
        return 'border-blue-200 bg-blue-50';
      case 'rebalance':
        return 'border-amber-200 bg-amber-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      await generateRecommendations({
        risk_profile: 'moderate',
        investment_goals: ['growth', 'diversification']
      });
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            <p className="text-sm text-gray-600">Loading personalized insights...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            <p className="text-sm text-gray-600">Unable to load recommendations</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>

        <button
          onClick={handleGenerateRecommendations}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Retry Loading Recommendations</span>
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            <p className="text-sm text-gray-600">Generate personalized investment insights</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI-Powered Recommendations</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our AI analyzes market conditions, sentiment, and your portfolio to provide personalized investment recommendations.
          </p>
          <button
            onClick={handleGenerateRecommendations}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate Recommendations</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">Personalized insights based on market sentiment</p>
              <div className="flex items-center space-x-1 text-emerald-600">
                <Wifi className="h-3 w-3" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerateRecommendations}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${getRecommendationColor(recommendation.type)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  {getRecommendationIcon(recommendation.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {recommendation.type} {recommendation.asset.symbol}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(recommendation.riskLevel)}`}>
                      {recommendation.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendation.asset.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">Confidence:</span>
                  <span className="text-lg font-bold text-gray-900">{recommendation.confidence}%</span>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${recommendation.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{recommendation.reasoning}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                {recommendation.targetAllocation && (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Target: {recommendation.targetAllocation}%
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{recommendation.timeframe}</span>
                </div>
              </div>
              
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Apply Recommendation
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> These AI-powered recommendations are for informational purposes only and include 
            real-time sentiment analysis. Always conduct your own research and consider consulting with a financial advisor.
          </p>
          <div className="flex items-center space-x-1 text-emerald-600">
            <Wifi className="h-3 w-3" />
            <span className="text-xs">Auto-updating every 10 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;