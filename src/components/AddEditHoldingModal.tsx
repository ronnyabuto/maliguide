import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, DollarSign, Calendar, Hash, Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  category: string;
  exchange: string;
}

interface AddEditHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: {
    asset_id: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
  }) => Promise<void>;
  editingHolding?: {
    id: string;
    asset: Asset;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
  } | null;
}

const AddEditHoldingModal: React.FC<AddEditHoldingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHolding
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAssetSearch, setShowAssetSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: assets, loading: assetsLoading } = useMarketData({ limit: 50 });

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize form when editing
  useEffect(() => {
    if (editingHolding) {
      setSelectedAsset(editingHolding.asset);
      setQuantity(editingHolding.quantity.toString());
      setPurchasePrice(editingHolding.purchasePrice.toString());
      setPurchaseDate(editingHolding.purchaseDate.split('T')[0]); // Format for date input
      setSearchTerm('');
      setShowAssetSearch(false);
    } else {
      // Reset form for new holding
      setSelectedAsset(null);
      setQuantity('');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setSearchTerm('');
      setShowAssetSearch(false);
    }
    setError(null);
    setSuccess(false);
  }, [editingHolding, isOpen]);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setSearchTerm('');
    setShowAssetSearch(false);
    // Auto-fill current price as purchase price for new holdings
    if (!editingHolding) {
      setPurchasePrice(asset.price.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset || !quantity || !purchasePrice || !purchaseDate) {
      setError('Please fill in all required fields');
      return;
    }

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(purchasePrice);

    if (quantityNum <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (priceNum <= 0) {
      setError('Purchase price must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave({
        asset_id: selectedAsset.id,
        quantity: quantityNum,
        purchase_price: priceNum,
        purchase_date: purchaseDate
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save holding');
    } finally {
      setSaving(false);
    }
  };

  const calculateCurrentValue = () => {
    if (selectedAsset && quantity) {
      const qty = parseFloat(quantity);
      return qty * selectedAsset.price;
    }
    return 0;
  };

  const calculatePotentialReturn = () => {
    if (selectedAsset && quantity && purchasePrice) {
      const qty = parseFloat(quantity);
      const purchasePriceNum = parseFloat(purchasePrice);
      const currentValue = qty * selectedAsset.price;
      const totalCost = qty * purchasePriceNum;
      return currentValue - totalCost;
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg">
              {editingHolding ? <Edit3 className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingHolding ? 'Edit Investment' : 'Add New Investment'}
              </h2>
              <p className="text-sm text-gray-600">
                {editingHolding ? 'Update your investment details' : 'Add a new asset to your portfolio'}
              </p>
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
          <div className="space-y-6">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Asset *
              </label>
              
              {selectedAsset ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedAsset.symbol}</h3>
                        <p className="text-sm text-gray-600">{selectedAsset.name}</p>
                        <p className="text-xs text-gray-500">{selectedAsset.exchange} • {selectedAsset.category.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {selectedAsset.category === 'stock' ? 'KSh' : ''} {selectedAsset.price.toFixed(2)}
                        {selectedAsset.category === 'bond' || selectedAsset.category === 'mmf' ? '%' : ''}
                      </p>
                      <p className="text-sm text-gray-500">Current Price</p>
                    </div>
                  </div>
                  {!editingHolding && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAsset(null);
                        setShowAssetSearch(true);
                      }}
                      className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Change Asset
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowAssetSearch(true);
                      }}
                      onFocus={() => setShowAssetSearch(true)}
                      placeholder="Search for stocks, bonds, crypto..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  {showAssetSearch && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
                      {assetsLoading ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          <p className="text-sm text-gray-600">Loading assets...</p>
                        </div>
                      ) : filteredAssets.length > 0 ? (
                        filteredAssets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleAssetSelect(asset)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{asset.symbol}</p>
                                <p className="text-sm text-gray-600">{asset.name}</p>
                                <p className="text-xs text-gray-500">{asset.exchange} • {asset.category.toUpperCase()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {asset.category === 'stock' ? 'KSh' : ''} {asset.price.toFixed(2)}
                                  {asset.category === 'bond' || asset.category === 'mmf' ? '%' : ''}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p>No assets found matching "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Investment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter purchase price"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Investment Summary */}
            {selectedAsset && quantity && purchasePrice && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Investment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Investment</p>
                    <p className="font-semibold text-gray-900">
                      KSh {(parseFloat(quantity) * parseFloat(purchasePrice)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Value</p>
                    <p className="font-semibold text-gray-900">
                      KSh {calculateCurrentValue().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Potential Return</p>
                    <p className={`font-semibold ${calculatePotentialReturn() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePotentialReturn() >= 0 ? '+' : ''}KSh {calculatePotentialReturn().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Return %</p>
                    <p className={`font-semibold ${calculatePotentialReturn() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePotentialReturn() >= 0 ? '+' : ''}
                      {purchasePrice ? ((calculatePotentialReturn() / (parseFloat(quantity) * parseFloat(purchasePrice))) * 100).toFixed(2) : '0.00'}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">
                  {editingHolding ? 'Investment updated successfully!' : 'Investment added successfully!'}
                </span>
              </div>
            )}
          </div>

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
              disabled={saving || !selectedAsset || !quantity || !purchasePrice || !purchaseDate}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{editingHolding ? 'Updating...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  {editingHolding ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  <span>{editingHolding ? 'Update Investment' : 'Add Investment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditHoldingModal;