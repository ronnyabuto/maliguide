import { useState, useEffect, useRef } from 'react';
import { apiClient, transformAssetData } from '../lib/api';

export interface AssetData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  category: 'stock' | 'bond' | 'mmf' | 'crypto' | 'forex';
  exchange: string;
  lastUpdated?: string;
}

export const useMarketData = (params?: { 
  category?: string; 
  exchange?: string; 
  limit?: number;
  pollingInterval?: number; // New parameter for polling
}) => {
  const [data, setData] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMarketData = async () => {
    try {
      // Only show loading on initial fetch, not on polling updates
      if (data.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiClient.getMarketData({
        category: params?.category,
        exchange: params?.exchange,
        limit: params?.limit
      });
      
      if (response.success) {
        const transformedData = response.data.map(transformAssetData);
        setData(transformedData);
      } else {
        throw new Error('Failed to fetch market data');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data if API fails and we don't have existing data
      if (data.length === 0) {
        const mockData: AssetData[] = [
          {
            id: 'safcom',
            name: 'Safaricom PLC',
            symbol: 'SCOM',
            price: 28.50,
            change: 1.25,
            changePercent: 4.58,
            volume: 2500000,
            marketCap: 1140000000000,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'eqty',
            name: 'Equity Group Holdings',
            symbol: 'EQTY',
            price: 65.75,
            change: -2.15,
            changePercent: -3.17,
            volume: 890000,
            marketCap: 248000000000,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'kcb',
            name: 'KCB Group PLC',
            symbol: 'KCB',
            price: 42.25,
            change: 0.75,
            changePercent: 1.81,
            volume: 1200000,
            marketCap: 158000000000,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'tbond-10yr',
            name: '10-Year Treasury Bond',
            symbol: 'T-BOND-10Y',
            price: 15.85,
            change: 0.12,
            changePercent: 0.76,
            category: 'bond',
            exchange: 'CBK'
          }
        ];
        setData(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Set up polling if interval is provided
    if (params?.pollingInterval && params.pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchMarketData();
      }, params.pollingInterval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [params?.category, params?.exchange, params?.limit, params?.pollingInterval]);

  // Manual refetch function
  const refetch = () => {
    fetchMarketData();
  };

  return { data, loading, error, refetch };
};

export const useMarketOverview = (pollingInterval?: number) => {
  const [data, setData] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOverview = async () => {
    try {
      // Only show loading on initial fetch
      if (data.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiClient.getMarketOverview();
      
      if (response.success) {
        const transformedData = response.data.map(transformAssetData);
        setData(transformedData);
      } else {
        throw new Error('Failed to fetch market overview');
      }
    } catch (err) {
      console.error('Error fetching market overview:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data if we don't have existing data
      if (data.length === 0) {
        setData([
          {
            id: 'safcom',
            name: 'Safaricom PLC',
            symbol: 'SCOM',
            price: 28.50,
            change: 1.25,
            changePercent: 4.58,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'eqty',
            name: 'Equity Group Holdings',
            symbol: 'EQTY',
            price: 65.75,
            change: -2.15,
            changePercent: -3.17,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'kcb',
            name: 'KCB Group PLC',
            symbol: 'KCB',
            price: 42.25,
            change: 0.75,
            changePercent: 1.81,
            category: 'stock',
            exchange: 'NSE'
          },
          {
            id: 'tbond-10yr',
            name: '10-Year Treasury Bond',
            symbol: 'T-BOND-10Y',
            price: 15.85,
            change: 0.12,
            changePercent: 0.76,
            category: 'bond',
            exchange: 'CBK'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOverview();

    // Set up polling if interval is provided
    if (pollingInterval && pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchOverview();
      }, pollingInterval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pollingInterval]);

  return { data, loading, error, refetch: fetchOverview };
};