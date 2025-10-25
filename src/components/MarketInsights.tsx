import React, { useState } from 'react';
import { Newspaper, TrendingUp, AlertTriangle, Info, Brain, BarChart3, RefreshCw, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import { useMarketInsights } from '../hooks/useAI';

const MarketInsights: React.FC = () => {
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  
  // Poll every 5 minutes (300000ms) for real-time insights
  const { insights, loading, error, refetch } = useMarketInsights({
    limit: 10,
    sentiment_category: sentimentFilter !== 'all' ? sentimentFilter : undefined,
    pollingInterval: 300000
  });

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case 'negative':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'border-l-emerald-500 bg-emerald-50';
      case 'negative':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getSentimentColor = (sentimentScore?: number) => {
    if (!sentimentScore) return 'text-gray-600 bg-gray-100';
    
    if (sentimentScore >= 0.5) return 'text-emerald-700 bg-emerald-100';
    if (sentimentScore >= 0.2) return 'text-green-700 bg-green-100';
    if (sentimentScore >= -0.2) return 'text-gray-700 bg-gray-100';
    if (sentimentScore >= -0.5) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getSentimentLabel = (sentimentCategory?: string) => {
    if (!sentimentCategory) return 'Neutral';
    return sentimentCategory.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Market Insights</h2>
              <p className="text-sm text-gray-600">Loading sentiment analysis...</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-l-4 border-gray-200 rounded-r-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Market Insights</h2>
              <p className="text-sm text-gray-600">Unable to load insights</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>

        <button
          onClick={refetch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Retry Loading Insights</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Market Insights</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">Real-time sentiment analysis</p>
              <div className="flex items-center space-x-1 text-emerald-600">
                <Wifi className="h-3 w-3" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Sentiment</option>
            <option value="very_positive">Very Positive</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="very_negative">Very Negative</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 rounded-r-lg p-4 transition-all hover:shadow-sm ${getImpactColor(insight.impact)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getImpactIcon(insight.impact)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600">{insight.source}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-xs text-gray-500">
                  {format(new Date(insight.created_at), 'MMM dd, yyyy')}
                </span>
                {insight.sentiment_score !== undefined && (
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(insight.sentiment_score)}`}>
                      {getSentimentLabel(insight.sentiment_category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(insight.sentiment_score * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-3 leading-relaxed">{insight.description}</p>
            
            {insight.keywords && insight.keywords.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Key sentiment indicators:</p>
                <div className="flex flex-wrap gap-1">
                  {insight.keywords.slice(0, 4).map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {insight.relevant_assets.slice(0, 3).map((asset, index) => (
                  <span
                    key={index}
                    className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 border"
                  >
                    {asset.toUpperCase()}
                  </span>
                ))}
                {insight.relevant_assets.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{insight.relevant_assets.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {insight.confidence_level && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {(insight.confidence_level * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h4 className="font-semibold text-indigo-900">AI Sentiment Analysis</h4>
          <div className="flex items-center space-x-1 text-emerald-600">
            <Wifi className="h-3 w-3" />
            <span className="text-xs">Auto-updating every 5 minutes</span>
          </div>
        </div>
        <p className="text-sm text-indigo-700">
          Our AI analyzes news sentiment using advanced natural language processing with real-time market data 
          to provide context-aware investment insights. Sentiment scores range from -1 (very negative) to +1 (very positive).
        </p>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={refetch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Insights</span>
        </button>
      </div>
    </div>
  );
};

export default MarketInsights;