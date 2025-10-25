import { useState, useEffect, useRef } from 'react';
import { apiClient, transformPortfolioData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface PortfolioHolding {
  id: string;
  asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    category: string;
    exchange: string;
  };
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  purchaseDate: string;
}

export interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_return: number;
  total_return_percent: number;
  asset_count: number;
}

export const usePortfolio = (pollingInterval?: number) => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPortfolio = async () => {
    if (!user?.id) return;

    try {
      // Only show loading on initial fetch
      if (holdings.length === 0 && !summary) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiClient.getPortfolio(user.id);
      
      if (response.success) {
        const transformedData = transformPortfolioData(response.data);
        setHoldings(transformedData.holdings);
        setSummary(transformedData.summary);
      } else {
        throw new Error('Failed to fetch portfolio');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data if we don't have existing data
      if (holdings.length === 0 && !summary) {
        const mockHoldings: PortfolioHolding[] = [
          {
            id: '1',
            asset: {
              id: 'safcom',
              name: 'Safaricom PLC',
              symbol: 'SCOM',
              price: 28.50,
              change: 1.25,
              changePercent: 4.58,
              category: 'stock',
              exchange: 'NSE'
            },
            quantity: 500,
            purchasePrice: 25.00,
            currentValue: 14250,
            totalReturn: 1750,
            totalReturnPercent: 14.0,
            purchaseDate: '2024-01-01'
          },
          {
            id: '2',
            asset: {
              id: 'eqty',
              name: 'Equity Group Holdings',
              symbol: 'EQTY',
              price: 65.75,
              change: -2.15,
              changePercent: -3.17,
              category: 'stock',
              exchange: 'NSE'
            },
            quantity: 200,
            purchasePrice: 70.00,
            currentValue: 13150,
            totalReturn: -1000,
            totalReturnPercent: -7.07,
            purchaseDate: '2024-01-15'
          }
        ];
        
        const totalValue = mockHoldings.reduce((sum, h) => sum + h.currentValue, 0);
        const totalCost = mockHoldings.reduce((sum, h) => sum + (h.quantity * h.purchasePrice), 0);
        const totalReturn = totalValue - totalCost;
        
        setHoldings(mockHoldings);
        setSummary({
          total_value: totalValue,
          total_cost: totalCost,
          total_return: totalReturn,
          total_return_percent: (totalReturn / totalCost) * 100,
          asset_count: mockHoldings.length
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Initial fetch
      fetchPortfolio();

      // Set up polling if interval is provided
      if (pollingInterval && pollingInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchPortfolio();
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

  const addHolding = async (holding: {
    asset_id: string;
    quantity: number;
    purchase_price: number;
    purchase_date?: string;
  }) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.addToPortfolio(user.id, holding);
      if (response.success) {
        await fetchPortfolio(); // Refresh portfolio
        return response;
      }
      throw new Error('Failed to add holding');
    } catch (err) {
      console.error('Error adding holding:', err);
      throw err;
    }
  };

  const updateHolding = async (holdingId: string, updates: {
    quantity?: number;
    purchase_price?: number;
  }) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.updatePortfolioHolding(user.id, holdingId, updates);
      if (response.success) {
        await fetchPortfolio(); // Refresh portfolio
        return response;
      }
      throw new Error('Failed to update holding');
    } catch (err) {
      console.error('Error updating holding:', err);
      throw err;
    }
  };

  const removeHolding = async (holdingId: string) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.removeFromPortfolio(user.id, holdingId);
      if (response.success) {
        await fetchPortfolio(); // Refresh portfolio
        return response;
      }
      throw new Error('Failed to remove holding');
    } catch (err) {
      console.error('Error removing holding:', err);
      throw err;
    }
  };

  return {
    holdings,
    summary,
    loading,
    error,
    refetch: fetchPortfolio,
    addHolding,
    updateHolding,
    removeHolding
  };
};