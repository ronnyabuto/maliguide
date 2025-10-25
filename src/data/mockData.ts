import { AssetData, PortfolioItem, AIRecommendation, MarketInsight, UserProfile } from '../types/investment';

export const mockAssets: AssetData[] = [
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
  },
  {
    id: 'tbill-91d',
    name: '91-Day Treasury Bill',
    symbol: 'T-BILL-91',
    price: 16.25,
    change: -0.05,
    changePercent: -0.31,
    category: 'bond',
    exchange: 'CBK'
  },
  {
    id: 'cic-mmf',
    name: 'CIC Money Market Fund',
    symbol: 'CIC-MMF',
    price: 12.45,
    change: 0.08,
    changePercent: 0.65,
    category: 'mmf',
    exchange: 'MMF'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 68500.00,
    change: 2150.00,
    changePercent: 3.24,
    volume: 25000000000,
    category: 'crypto',
    exchange: 'Crypto'
  },
  {
    id: 'usdkes',
    name: 'USD/KES',
    symbol: 'USD/KES',
    price: 154.75,
    change: -1.25,
    changePercent: -0.80,
    category: 'forex',
    exchange: 'Forex'
  }
];

export const mockPortfolio: PortfolioItem[] = [
  {
    asset: mockAssets[0], // Safaricom
    quantity: 500,
    purchasePrice: 25.00,
    currentValue: 14250,
    totalReturn: 1750,
    totalReturnPercent: 14.0
  },
  {
    asset: mockAssets[1], // Equity
    quantity: 200,
    purchasePrice: 70.00,
    currentValue: 13150,
    totalReturn: -1000,
    totalReturnPercent: -7.07
  },
  {
    asset: mockAssets[3], // T-Bond
    quantity: 1000,
    purchasePrice: 15.00,
    currentValue: 15850,
    totalReturn: 850,
    totalReturnPercent: 5.67
  }
];

export const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'buy',
    asset: mockAssets[2], // KCB
    confidence: 85,
    reasoning: 'Strong Q3 earnings growth and expanding digital banking services position KCB well for continued growth. The current valuation presents a good entry point.',
    targetAllocation: 15,
    timeframe: '6-12 months',
    riskLevel: 'medium'
  },
  {
    id: '2',
    type: 'hold',
    asset: mockAssets[0], // Safaricom
    confidence: 78,
    reasoning: 'Safaricom maintains strong fundamentals with M-Pesa growth, but recent gains may limit short-term upside. Hold current position.',
    timeframe: '3-6 months',
    riskLevel: 'low'
  },
  {
    id: '3',
    type: 'rebalance',
    asset: mockAssets[3], // T-Bond
    confidence: 92,
    reasoning: 'Given rising interest rates, consider increasing allocation to government bonds for stability and attractive yields.',
    targetAllocation: 25,
    timeframe: '1-3 months',
    riskLevel: 'low'
  }
];

export const mockInsights: MarketInsight[] = [
  {
    id: '1',
    title: 'CBK Maintains Benchmark Rate at 13%',
    description: 'Central Bank of Kenya maintains the policy rate, supporting bond yields and financial sector stability.',
    impact: 'positive',
    relevantAssets: ['tbond-10yr', 'tbill-91d', 'kcb', 'eqty'],
    timestamp: new Date('2024-01-15'),
    source: 'Central Bank of Kenya'
  },
  {
    id: '2',
    title: 'NSE 20 Share Index Reaches New High',
    description: 'The NSE 20 index climbed to record levels driven by banking and telecom sector performance.',
    impact: 'positive',
    relevantAssets: ['safcom', 'kcb', 'eqty'],
    timestamp: new Date('2024-01-14'),
    source: 'Nairobi Securities Exchange'
  }
];

export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Wanjiku',
  riskTolerance: 'moderate',
  investmentGoals: ['retirement', 'wealth-building', 'emergency-fund'],
  timeHorizon: 15,
  monthlyBudget: 50000,
  age: 35,
  experience: 'intermediate'
};