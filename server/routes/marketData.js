import express from 'express';
import { supabase } from '../database/supabase.js';
import { triggerManualUpdate } from '../scrapers/index.js';

const router = express.Router();

// Get all market data
router.get('/', async (req, res) => {
  try {
    const { category, exchange, limit = 50 } = req.query;
    
    let query = supabase
      .from('market_data')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(parseInt(limit));
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (exchange) {
      query = query.eq('exchange', exchange);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific asset data
router.get('/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('asset_id', assetId)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching asset data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market overview (major indices)
router.get('/overview/major', async (req, res) => {
  try {
    const majorAssets = ['safcom', 'eqty', 'kcb', 'tbond-10yr', 'bitcoin', 'usdkes'];
    
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .in('asset_id', majorAssets)
      .order('last_updated', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top performers
router.get('/performance/top', async (req, res) => {
  try {
    const { category, period = '24h', limit = 10 } = req.query;
    
    let query = supabase
      .from('market_data')
      .select('*')
      .order('change_percent', { ascending: false })
      .limit(parseInt(limit));
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data,
      period,
      count: data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('category, change_percent, price, market_cap');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Calculate statistics by category
    const stats = {};
    data.forEach(asset => {
      if (!stats[asset.category]) {
        stats[asset.category] = {
          count: 0,
          avgChange: 0,
          totalMarketCap: 0,
          gainers: 0,
          losers: 0
        };
      }
      
      const cat = stats[asset.category];
      cat.count++;
      cat.avgChange += asset.change_percent || 0;
      cat.totalMarketCap += asset.market_cap || 0;
      
      if (asset.change_percent > 0) cat.gainers++;
      else if (asset.change_percent < 0) cat.losers++;
    });
    
    // Calculate averages
    Object.keys(stats).forEach(category => {
      stats[category].avgChange = stats[category].avgChange / stats[category].count;
    });
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching market statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual data update (admin endpoint)
router.post('/update/manual', async (req, res) => {
  try {
    // In production, add authentication/authorization here
    await triggerManualUpdate();
    
    res.json({
      success: true,
      message: 'Manual data update triggered',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering manual update:', error);
    res.status(500).json({ error: 'Failed to trigger update' });
  }
});

export default router;