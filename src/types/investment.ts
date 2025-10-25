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
  exchange: 'NSE' | 'CBK' | 'MMF' | 'Crypto' | 'Forex';
}

export interface PortfolioItem {
  asset: AssetData;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export interface UserProfile {
  id: string;
  name: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  timeHorizon: number; // years
  monthlyBudget: number;
  age: number;
  experience: 'beginner' | 'intermediate' | 'expert';
}

export interface AIRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  asset: AssetData;
  confidence: number;
  reasoning: string;
  targetAllocation?: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  relevantAssets: string[];
  timestamp: Date;
  source: string;
}