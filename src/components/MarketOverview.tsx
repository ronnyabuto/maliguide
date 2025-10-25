import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, Wifi } from 'lucide-react';
import { useMarketOverview } from '../hooks/useMarketData';

const MarketOverview: React.FC = () => {
  // Poll every 60 seconds (1 minute) for real-time updates
  const { data: majorIndices, loading, error } = useMarketOverview(60000);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <RefreshCw className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Unable to load market data</h3>
            <p className="text-sm text-red-700">
              {error}. Showing cached data below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Real-time indicator */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Market Overview</h2>
        <div className="flex items-center space-x-2 text-emerald-600">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Live Updates</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {majorIndices.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">{asset.exchange}</p>
                <h3 className="text-lg font-bold text-gray-900">{asset.symbol}</h3>
              </div>
              <div className={`p-2 rounded-lg ${
                asset.changePercent >= 0 ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {asset.changePercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {asset.category === 'stock' ? `KSh ${asset.price.toFixed(2)}` : `${asset.price.toFixed(2)}%`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${
                  asset.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {asset.changePercent >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(asset.changePercent).toFixed(2)}%
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {asset.changePercent >= 0 ? '+' : ''}{asset.change.toFixed(2)}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">{asset.name}</p>
              
              {asset.lastUpdated && (
                <p className="text-xs text-gray-400">
                  Updated: {new Date(asset.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MarketOverview;