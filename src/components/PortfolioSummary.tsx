import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, Target, Activity, Plus, RefreshCw, Edit3, Trash2, AlertTriangle, Wifi } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import AddEditHoldingModal from './AddEditHoldingModal';

const PortfolioSummary: React.FC = () => {
  // Poll every 2 minutes (120000ms) for portfolio value updates
  const { holdings, summary, loading, error, addHolding, updateHolding, removeHolding, refetch } = usePortfolio(120000);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<any>(null);
  const [deletingHolding, setDeletingHolding] = useState<string | null>(null);

  const handleAddHolding = async (holdingData: {
    asset_id: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
  }) => {
    await addHolding(holdingData);
    setShowAddModal(false);
  };

  const handleEditHolding = async (holdingData: {
    asset_id: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
  }) => {
    if (editingHolding) {
      await updateHolding(editingHolding.id, {
        quantity: holdingData.quantity,
        purchase_price: holdingData.purchase_price
      });
      setEditingHolding(null);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    try {
      await removeHolding(holdingId);
      setDeletingHolding(null);
    } catch (error) {
      console.error('Failed to delete holding:', error);
    }
  };

  const openEditModal = (holding: any) => {
    setEditingHolding({
      id: holding.id,
      asset: holding.asset,
      quantity: holding.quantity,
      purchasePrice: holding.purchasePrice,
      purchaseDate: holding.purchaseDate
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <div className="flex items-center space-x-2 text-red-600">
            <RefreshCw className="h-5 w-5" />
            <span className="text-sm font-medium">Connection Error</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Unable to load your portfolio. {error || 'Please check your connection and try again.'}
          </p>
          <button 
            onClick={refetch}
            className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <div className="flex items-center space-x-2 text-emerald-600">
            <Activity className="h-5 w-5" />
            <span className="text-sm font-medium">Ready to Start</span>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Plus className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Portfolio</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first investment to begin tracking your portfolio performance and get AI-powered recommendations.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add First Investment</span>
          </button>
        </div>

        <AddEditHoldingModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddHolding}
        />
      </div>
    );
  }

  const chartData = holdings.map(item => ({
    name: item.asset.symbol,
    value: item.currentValue,
    percentage: ((item.currentValue / summary.total_value) * 100).toFixed(1)
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Live Updates</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-emerald-700 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-emerald-900">
                  KSh {summary.total_value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            summary.total_return >= 0 
              ? 'bg-gradient-to-r from-green-50 to-green-100'
              : 'bg-gradient-to-r from-red-50 to-red-100'
          }`}>
            <div className="flex items-center space-x-3">
              <TrendingUp className={`h-8 w-8 ${
                summary.total_return >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  summary.total_return >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Total Return
                </p>
                <p className={`text-2xl font-bold ${
                  summary.total_return >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {summary.total_return >= 0 ? '+' : ''}KSh {summary.total_return.toLocaleString()}
                </p>
                <p className={`text-sm ${
                  summary.total_return >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.total_return_percent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Diversification</p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.asset_count} Assets
                </p>
                <p className="text-sm text-blue-600">
                  {summary.asset_count >= 5 ? 'Well Balanced' : 'Consider Diversifying'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation Chart */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `KSh ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Asset</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Quantity</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Current Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Current Value</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Return</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{holding.asset.symbol}</p>
                      <p className="text-sm text-gray-500">{holding.asset.name}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    {holding.quantity.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    KSh {holding.asset.price.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    KSh {holding.currentValue.toLocaleString()}
                  </td>
                  <td className={`text-right py-3 px-4 font-medium ${
                    holding.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {holding.totalReturn >= 0 ? '+' : ''}KSh {holding.totalReturn.toLocaleString()}
                    <br />
                    <span className="text-sm">
                      ({holding.totalReturnPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(holding)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit holding"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingHolding(holding.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete holding"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEditHoldingModal
        isOpen={showAddModal || !!editingHolding}
        onClose={() => {
          setShowAddModal(false);
          setEditingHolding(null);
        }}
        onSave={editingHolding ? handleEditHolding : handleAddHolding}
        editingHolding={editingHolding}
      />

      {/* Delete Confirmation Modal */}
      {deletingHolding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Investment</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this investment from your portfolio?
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeletingHolding(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHolding(deletingHolding)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSummary;