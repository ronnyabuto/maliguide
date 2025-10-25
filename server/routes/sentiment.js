import express from 'express';
import { supabase } from '../database/supabase.js';
import { generateMarketSentimentSummary } from '../scrapers/index.js';

const router = express.Router();

// Get overall market sentiment summary
router.get('/summary', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const daysBack = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: sentimentData, error } = await supabase
      .from('market_insights')
      .select('sentiment_score, sentiment_category, confidence_level, relevant_assets, created_at')
      .gte('created_at', startDate)
      .not('sentiment_score', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Calculate sentiment metrics
    const metrics = calculateSentimentSummary(sentimentData);
    
    res.json({
      success: true,
      data: {
        period,
        metrics,
        data_points: sentimentData.length,
        last_updated: sentimentData[0]?.created_at || null
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching sentiment summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sentiment analysis for specific asset
router.get('/asset/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const { period = '30d' } = req.query;
    
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: assetSentiment, error } = await supabase
      .from('market_insights')
      .select('*')
      .contains('relevant_assets', [assetId])
      .gte('created_at', startDate)
      .not('sentiment_score', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Calculate asset-specific metrics
    const metrics = calculateAssetSentimentMetrics(assetSentiment);
    
    res.json({
      success: true,
      data: {
        asset_id: assetId,
        period,
        metrics,
        insights: assetSentiment,
        data_points: assetSentiment.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching asset sentiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sentiment trends over time
router.get('/trends', async (req, res) => {
  try {
    const { period = '30d', granularity = 'daily' } = req.query;
    
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: sentimentData, error } = await supabase
      .from('market_insights')
      .select('sentiment_score, sentiment_category, created_at')
      .gte('created_at', startDate)
      .not('sentiment_score', 'is', null)
      .order('created_at', { ascending: true });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Group data by time periods
    const trends = groupSentimentByTime(sentimentData, granularity);
    
    res.json({
      success: true,
      data: {
        period,
        granularity,
        trends,
        total_data_points: sentimentData.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching sentiment trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sentiment by category/sector
router.get('/sectors', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: sentimentData, error } = await supabase
      .from('market_insights')
      .select('sentiment_score, sentiment_category, relevant_assets, title, created_at')
      .gte('created_at', startDate)
      .not('sentiment_score', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Group by asset categories
    const sectorSentiment = groupSentimentBySector(sentimentData);
    
    res.json({
      success: true,
      data: {
        period,
        sectors: sectorSentiment,
        total_insights: sentimentData.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching sector sentiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual sentiment analysis update
router.post('/update', async (req, res) => {
  try {
    await generateMarketSentimentSummary();
    
    res.json({
      success: true,
      message: 'Sentiment analysis update triggered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering sentiment update:', error);
    res.status(500).json({ error: 'Failed to trigger sentiment update' });
  }
});

// Helper functions
function calculateSentimentSummary(sentimentData) {
  if (!sentimentData || sentimentData.length === 0) {
    return {
      average_sentiment: 0,
      sentiment_distribution: {},
      confidence_level: 0,
      trend: 'neutral',
      volatility: 0
    };
  }
  
  const avgSentiment = sentimentData.reduce((sum, item) => sum + item.sentiment_score, 0) / sentimentData.length;
  const avgConfidence = sentimentData.reduce((sum, item) => sum + (item.confidence_level || 0), 0) / sentimentData.length;
  
  // Calculate sentiment distribution
  const distribution = sentimentData.reduce((dist, item) => {
    const category = item.sentiment_category || 'neutral';
    dist[category] = (dist[category] || 0) + 1;
    return dist;
  }, {});
  
  // Calculate trend (comparing first half vs second half)
  const midpoint = Math.floor(sentimentData.length / 2);
  const firstHalf = sentimentData.slice(0, midpoint);
  const secondHalf = sentimentData.slice(midpoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.sentiment_score, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.sentiment_score, 0) / secondHalf.length;
  
  let trend = 'neutral';
  if (secondHalfAvg - firstHalfAvg > 0.1) trend = 'improving';
  else if (firstHalfAvg - secondHalfAvg > 0.1) trend = 'declining';
  
  // Calculate volatility (standard deviation)
  const variance = sentimentData.reduce((sum, item) => 
    sum + Math.pow(item.sentiment_score - avgSentiment, 2), 0
  ) / sentimentData.length;
  const volatility = Math.sqrt(variance);
  
  return {
    average_sentiment: parseFloat(avgSentiment.toFixed(3)),
    sentiment_distribution: distribution,
    confidence_level: parseFloat(avgConfidence.toFixed(3)),
    trend,
    volatility: parseFloat(volatility.toFixed(3))
  };
}

function calculateAssetSentimentMetrics(assetData) {
  if (!assetData || assetData.length === 0) {
    return {
      average_sentiment: 0,
      total_mentions: 0,
      recent_sentiment: 0,
      sentiment_trend: 'neutral'
    };
  }
  
  const avgSentiment = assetData.reduce((sum, item) => sum + item.sentiment_score, 0) / assetData.length;
  const recentSentiment = assetData.slice(0, 5).reduce((sum, item) => sum + item.sentiment_score, 0) / Math.min(5, assetData.length);
  
  let sentimentTrend = 'neutral';
  if (recentSentiment - avgSentiment > 0.1) sentimentTrend = 'improving';
  else if (avgSentiment - recentSentiment > 0.1) sentimentTrend = 'declining';
  
  return {
    average_sentiment: parseFloat(avgSentiment.toFixed(3)),
    total_mentions: assetData.length,
    recent_sentiment: parseFloat(recentSentiment.toFixed(3)),
    sentiment_trend: sentimentTrend
  };
}

function groupSentimentByTime(sentimentData, granularity) {
  const groups = {};
  
  sentimentData.forEach(item => {
    const date = new Date(item.created_at);
    let key;
    
    if (granularity === 'hourly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    if (!groups[key]) {
      groups[key] = {
        date: key,
        sentiment_scores: [],
        count: 0
      };
    }
    
    groups[key].sentiment_scores.push(item.sentiment_score);
    groups[key].count++;
  });
  
  // Calculate averages for each time period
  return Object.values(groups).map(group => ({
    date: group.date,
    average_sentiment: group.sentiment_scores.reduce((sum, score) => sum + score, 0) / group.sentiment_scores.length,
    count: group.count
  }));
}

function groupSentimentBySector(sentimentData) {
  const assetToSector = {
    'safcom': 'Telecommunications',
    'eqty': 'Banking',
    'kcb': 'Banking',
    'coop': 'Banking',
    'absa': 'Banking',
    'tbond-10yr': 'Government Securities',
    'tbill-91d': 'Government Securities',
    'bitcoin': 'Cryptocurrency',
    'usdkes': 'Forex'
  };
  
  const sectorGroups = {};
  
  sentimentData.forEach(item => {
    item.relevant_assets?.forEach(assetId => {
      const sector = assetToSector[assetId] || 'Other';
      
      if (!sectorGroups[sector]) {
        sectorGroups[sector] = {
          sector,
          sentiment_scores: [],
          insights: []
        };
      }
      
      sectorGroups[sector].sentiment_scores.push(item.sentiment_score);
      sectorGroups[sector].insights.push({
        title: item.title,
        sentiment_score: item.sentiment_score,
        sentiment_category: item.sentiment_category,
        created_at: item.created_at
      });
    });
  });
  
  // Calculate sector averages
  return Object.values(sectorGroups).map(group => ({
    sector: group.sector,
    average_sentiment: group.sentiment_scores.reduce((sum, score) => sum + score, 0) / group.sentiment_scores.length,
    total_insights: group.insights.length,
    recent_insights: group.insights.slice(0, 3)
  }));
}

export default router;