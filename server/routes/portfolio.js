import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();

// Get user portfolio
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get portfolio holdings with current market data
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select(`
        *,
        market_data!inner(*)
      `)
      .eq('user_id', userId);
    
    if (portfolioError) {
      return res.status(500).json({ error: portfolioError.message });
    }
    
    // Calculate portfolio metrics
    const portfolioWithMetrics = portfolio.map(holding => {
      const currentPrice = holding.market_data.price;
      const currentValue = holding.quantity * currentPrice;
      const totalCost = holding.quantity * holding.purchase_price;
      const totalReturn = currentValue - totalCost;
      const totalReturnPercent = (totalReturn / totalCost) * 100;
      
      return {
        ...holding,
        current_value: currentValue,
        total_return: totalReturn,
        total_return_percent: totalReturnPercent,
        current_price: currentPrice
      };
    });
    
    // Calculate overall portfolio metrics
    const totalValue = portfolioWithMetrics.reduce((sum, holding) => sum + holding.current_value, 0);
    const totalCost = portfolioWithMetrics.reduce((sum, holding) => sum + (holding.quantity * holding.purchase_price), 0);
    const totalReturn = totalValue - totalCost;
    const totalReturnPercent = (totalReturn / totalCost) * 100;
    
    res.json({
      success: true,
      data: {
        holdings: portfolioWithMetrics,
        summary: {
          total_value: totalValue,
          total_cost: totalCost,
          total_return: totalReturn,
          total_return_percent: totalReturnPercent,
          asset_count: portfolioWithMetrics.length
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add asset to portfolio
router.post('/:userId/holdings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { asset_id, quantity, purchase_price, purchase_date } = req.body;
    
    // Validate required fields
    if (!asset_id || !quantity || !purchase_price) {
      return res.status(400).json({ 
        error: 'Missing required fields: asset_id, quantity, purchase_price' 
      });
    }
    
    // Check if asset exists in market data
    const { data: asset, error: assetError } = await supabase
      .from('market_data')
      .select('asset_id')
      .eq('asset_id', asset_id)
      .single();
    
    if (assetError || !asset) {
      return res.status(400).json({ error: 'Invalid asset_id' });
    }
    
    // Add to portfolio
    const { data, error } = await supabase
      .from('user_portfolios')
      .insert({
        user_id: userId,
        asset_id,
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchase_price),
        purchase_date: purchase_date || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json({
      success: true,
      data,
      message: 'Asset added to portfolio successfully'
    });
    
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update portfolio holding
router.put('/:userId/holdings/:holdingId', async (req, res) => {
  try {
    const { userId, holdingId } = req.params;
    const { quantity, purchase_price } = req.body;
    
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (purchase_price !== undefined) updateData.purchase_price = parseFloat(purchase_price);
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('user_portfolios')
      .update(updateData)
      .eq('id', holdingId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    
    res.json({
      success: true,
      data,
      message: 'Portfolio holding updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating portfolio holding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove asset from portfolio
router.delete('/:userId/holdings/:holdingId', async (req, res) => {
  try {
    const { userId, holdingId } = req.params;
    
    const { error } = await supabase
      .from('user_portfolios')
      .delete()
      .eq('id', holdingId)
      .eq('user_id', userId);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      message: 'Asset removed from portfolio successfully'
    });
    
  } catch (error) {
    console.error('Error removing from portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get portfolio performance history
router.get('/:userId/performance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;
    
    // This would require historical data tracking
    // For now, return current performance
    const { data: portfolio, error } = await supabase
      .from('user_portfolios')
      .select(`
        *,
        market_data!inner(*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Calculate performance metrics
    const performance = portfolio.map(holding => {
      const currentPrice = holding.market_data.price;
      const currentValue = holding.quantity * currentPrice;
      const totalCost = holding.quantity * holding.purchase_price;
      const totalReturn = currentValue - totalCost;
      const totalReturnPercent = (totalReturn / totalCost) * 100;
      
      return {
        asset_id: holding.asset_id,
        symbol: holding.market_data.symbol,
        name: holding.market_data.name,
        total_return: totalReturn,
        total_return_percent: totalReturnPercent,
        current_value: currentValue
      };
    });
    
    res.json({
      success: true,
      data: performance,
      period,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;