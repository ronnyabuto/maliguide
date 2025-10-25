import express from 'express';
import { supabase } from '../database/supabase.js';
import { analyzeSentiment } from '../scrapers/news-scraper.js';

const router = express.Router();

// Get AI recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only = 'true' } = req.query;
    
    let query = supabase
      .from('ai_recommendations')
      .select(`
        *,
        market_data!inner(asset_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (active_only === 'true') {
      query = query.eq('is_active', true);
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
    console.error('Error fetching AI recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new AI recommendations with sentiment analysis
router.post('/recommendations/:userId/generate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { risk_profile = 'moderate', investment_goals = [] } = req.body;
    
    // Get user's current portfolio
    const { data: portfolio } = await supabase
      .from('user_portfolios')
      .select(`
        *,
        market_data!inner(*)
      `)
      .eq('user_id', userId);
    
    // Get current market data
    const { data: marketData } = await supabase
      .from('market_data')
      .select('*')
      .order('change_percent', { ascending: false });
    
    // Get recent market sentiment
    const { data: sentimentData } = await supabase
      .from('market_insights')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    // Generate AI recommendations based on portfolio, market conditions, and sentiment
    const recommendations = await generateRecommendationsWithSentiment(
      userId, 
      portfolio, 
      marketData, 
      sentimentData,
      risk_profile, 
      investment_goals
    );
    
    // Store recommendations in database
    const { data: savedRecommendations, error } = await supabase
      .from('ai_recommendations')
      .insert(recommendations)
      .select();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data: savedRecommendations,
      count: savedRecommendations.length,
      message: 'AI recommendations generated successfully with sentiment analysis'
    });
    
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat with AI assistant (enhanced with sentiment awareness)
router.post('/chat', async (req, res) => {
  try {
    const { message, user_id, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get relevant market data for context
    const { data: marketData } = await supabase
      .from('market_data')
      .select('*')
      .limit(20);
    
    // Get recent market sentiment
    const { data: sentimentData } = await supabase
      .from('market_insights')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get user portfolio if user_id provided
    let userPortfolio = null;
    if (user_id) {
      const { data: portfolio } = await supabase
        .from('user_portfolios')
        .select(`
          *,
          market_data!inner(*)
        `)
        .eq('user_id', user_id);
      userPortfolio = portfolio;
    }
    
    // Generate AI response with sentiment context
    const aiResponse = await generateAIResponseWithSentiment(
      message, 
      marketData, 
      sentimentData,
      userPortfolio, 
      context
    );
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        context: {
          market_data_count: marketData?.length || 0,
          sentiment_data_count: sentimentData?.length || 0,
          has_portfolio: !!userPortfolio
        }
      }
    });
    
  } catch (error) {
    console.error('Error processing AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market sentiment analysis
router.get('/sentiment', async (req, res) => {
  try {
    const { period = '7d', asset_id } = req.query;
    
    // Calculate date range
    const daysBack = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    let query = supabase
      .from('market_insights')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    // Filter by specific asset if requested
    if (asset_id) {
      query = query.contains('relevant_assets', [asset_id]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Calculate sentiment metrics
    const sentimentMetrics = calculateSentimentMetrics(data);
    
    res.json({
      success: true,
      data: {
        insights: data,
        metrics: sentimentMetrics,
        period,
        asset_id: asset_id || 'all'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching sentiment analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market insights with enhanced sentiment data
router.get('/insights', async (req, res) => {
  try {
    const { limit = 10, impact, sentiment_category } = req.query;
    
    let query = supabase
      .from('market_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (impact) {
      query = query.eq('impact', impact);
    }
    
    if (sentiment_category) {
      query = query.eq('sentiment_category', sentiment_category);
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
    console.error('Error fetching market insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate AI recommendations with sentiment analysis
async function generateRecommendationsWithSentiment(userId, portfolio, marketData, sentimentData, riskProfile, investmentGoals) {
  const recommendations = [];
  
  // Calculate overall market sentiment
  const avgSentiment = sentimentData?.length > 0 
    ? sentimentData.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / sentimentData.length 
    : 0;
  
  // Analyze portfolio diversification
  const portfolioByCategory = {};
  let totalValue = 0;
  
  portfolio?.forEach(holding => {
    const category = holding.market_data.category;
    const value = holding.quantity * holding.market_data.price;
    
    if (!portfolioByCategory[category]) {
      portfolioByCategory[category] = 0;
    }
    portfolioByCategory[category] += value;
    totalValue += value;
  });
  
  // Generate sentiment-aware recommendations
  if (totalValue > 0) {
    const stockAllocation = (portfolioByCategory.stock || 0) / totalValue;
    const bondAllocation = (portfolioByCategory.bond || 0) / totalValue;
    
    // Adjust recommendations based on market sentiment
    if (avgSentiment < -0.3 && riskProfile !== 'aggressive') {
      // Negative sentiment - recommend defensive assets
      const bondAsset = marketData.find(asset => asset.category === 'bond' && asset.symbol === 'T-BOND-10Y');
      if (bondAsset && bondAllocation < 0.4) {
        recommendations.push({
          user_id: userId,
          asset_id: bondAsset.asset_id,
          recommendation_type: 'buy',
          confidence_score: 90,
          reasoning: `Given current negative market sentiment (score: ${avgSentiment.toFixed(2)}), increasing bond allocation provides stability and capital preservation. Treasury bonds offer attractive yields with government backing.`,
          target_allocation: 40,
          timeframe: '1-2 months',
          risk_level: 'low',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } else if (avgSentiment > 0.3 && riskProfile !== 'conservative') {
      // Positive sentiment - recommend growth assets
      const topStock = marketData.find(asset => 
        asset.category === 'stock' && 
        asset.change_percent > 2 && 
        !portfolio.some(holding => holding.asset_id === asset.asset_id)
      );
      
      if (topStock) {
        // Check if there's positive sentiment specifically for this asset
        const assetSentiment = sentimentData.find(item => 
          item.relevant_assets?.includes(topStock.asset_id)
        );
        
        const confidenceBoost = assetSentiment?.sentiment_score > 0 ? 10 : 0;
        
        recommendations.push({
          user_id: userId,
          asset_id: topStock.asset_id,
          recommendation_type: 'buy',
          confidence_score: Math.min(95, 75 + confidenceBoost),
          reasoning: `Positive market sentiment (score: ${avgSentiment.toFixed(2)}) supports growth investments. ${topStock.name} shows strong momentum with ${topStock.change_percent.toFixed(2)}% growth${assetSentiment ? ' and positive news sentiment' : ''}.`,
          target_allocation: 15,
          timeframe: '3-6 months',
          risk_level: riskProfile === 'aggressive' ? 'high' : 'medium',
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  }
  
  // Default recommendations for new users with sentiment context
  if (!portfolio || portfolio.length === 0) {
    const safaricom = marketData.find(asset => asset.asset_id === 'safcom');
    const tbond = marketData.find(asset => asset.asset_id === 'tbond-10yr');
    
    // Check sentiment for Safaricom
    const safaricomSentiment = sentimentData.find(item => 
      item.relevant_assets?.includes('safcom')
    );
    
    if (safaricom) {
      const sentimentBoost = safaricomSentiment?.sentiment_score > 0 ? 5 : 0;
      recommendations.push({
        user_id: userId,
        asset_id: safaricom.asset_id,
        recommendation_type: 'buy',
        confidence_score: Math.min(95, 85 + sentimentBoost),
        reasoning: `Safaricom remains a blue-chip investment with strong fundamentals. ${safaricomSentiment ? `Recent news sentiment is ${safaricomSentiment.sentiment_category.replace('_', ' ')}, ` : ''}Current market sentiment (${avgSentiment.toFixed(2)}) ${avgSentiment > 0 ? 'supports' : 'suggests caution for'} equity investments.`,
        target_allocation: 20,
        timeframe: '6-12 months',
        risk_level: 'low',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    if (tbond) {
      recommendations.push({
        user_id: userId,
        asset_id: tbond.asset_id,
        recommendation_type: 'buy',
        confidence_score: avgSentiment < 0 ? 95 : 85,
        reasoning: `Treasury bonds provide stable returns and capital preservation. ${avgSentiment < 0 ? 'Current negative market sentiment makes defensive assets particularly attractive.' : 'Essential for portfolio foundation regardless of market sentiment.'}`,
        target_allocation: avgSentiment < -0.2 ? 35 : 25,
        timeframe: '1-2 months',
        risk_level: 'low',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  return recommendations;
}

// Helper function to generate AI chat responses with sentiment awareness
async function generateAIResponseWithSentiment(message, marketData, sentimentData, userPortfolio, context) {
  const lowerMessage = message.toLowerCase();
  
  // Calculate current market sentiment
  const avgSentiment = sentimentData?.length > 0 
    ? sentimentData.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / sentimentData.length 
    : 0;
  
  const sentimentDescription = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral';
  
  // Sentiment-related queries
  if (lowerMessage.includes('sentiment') || lowerMessage.includes('market mood') || lowerMessage.includes('investor confidence')) {
    const recentNews = sentimentData?.slice(0, 3) || [];
    const newsHighlights = recentNews.map(news => 
      `• ${news.title} (${news.sentiment_category.replace('_', ' ')} sentiment)`
    ).join('\n');
    
    return `Current market sentiment is ${sentimentDescription} with an average score of ${avgSentiment.toFixed(2)} (range: -1 to +1). This is based on analysis of ${sentimentData?.length || 0} recent news articles.\n\nRecent market developments:\n${newsHighlights}\n\nThis sentiment analysis helps inform investment decisions - ${avgSentiment > 0 ? 'positive sentiment often supports growth investments' : avgSentiment < 0 ? 'negative sentiment suggests focusing on defensive assets' : 'neutral sentiment indicates balanced market conditions'}.`;
  }
  
  // Market data queries with sentiment context
  if (lowerMessage.includes('best performing') || lowerMessage.includes('top')) {
    const topPerformers = marketData
      ?.sort((a, b) => b.change_percent - a.change_percent)
      .slice(0, 3);
    
    if (topPerformers?.length > 0) {
      const performersList = topPerformers
        .map(asset => `${asset.name} (${asset.symbol}): +${asset.change_percent.toFixed(2)}%`)
        .join(', ');
      
      return `Today's top performers are: ${performersList}. Current market sentiment is ${sentimentDescription} (${avgSentiment.toFixed(2)}), which ${avgSentiment > 0 ? 'supports the positive momentum in these assets' : avgSentiment < 0 ? 'contrasts with the negative market mood - exercise caution' : 'aligns with mixed market conditions'}. Remember to consider your risk tolerance and portfolio diversification.`;
    }
  }
  
  // Specific asset queries with sentiment
  if (lowerMessage.includes('safaricom') || lowerMessage.includes('scom')) {
    const safaricom = marketData?.find(asset => asset.asset_id === 'safcom');
    const safaricomNews = sentimentData?.find(item => 
      item.relevant_assets?.includes('safcom')
    );
    
    if (safaricom) {
      let response = `Safaricom (SCOM) is currently trading at KSh ${safaricom.price}, ${safaricom.change_percent >= 0 ? 'up' : 'down'} ${Math.abs(safaricom.change_percent).toFixed(2)}% today.`;
      
      if (safaricomNews) {
        response += ` Recent news sentiment for Safaricom is ${safaricomNews.sentiment_category.replace('_', ' ')} with a score of ${safaricomNews.sentiment_score.toFixed(2)}.`;
      }
      
      response += ` Overall market sentiment is ${sentimentDescription}, which ${avgSentiment > 0 ? 'supports' : avgSentiment < 0 ? 'creates headwinds for' : 'provides neutral conditions for'} telecom investments. As Kenya's leading telecom with strong M-Pesa fundamentals, it remains a solid blue-chip investment for long-term growth.`;
      
      return response;
    }
  }
  
  // Portfolio queries with sentiment context
  if (lowerMessage.includes('portfolio') && userPortfolio) {
    const totalValue = userPortfolio.reduce((sum, holding) => 
      sum + (holding.quantity * holding.market_data.price), 0
    );
    
    return `Your portfolio is currently valued at KSh ${totalValue.toLocaleString()} across ${userPortfolio.length} assets. Given the current ${sentimentDescription} market sentiment (score: ${avgSentiment.toFixed(2)}), ${avgSentiment > 0.2 ? 'this is a good time to consider growth opportunities' : avgSentiment < -0.2 ? 'focus on defensive positioning and risk management' : 'maintain a balanced approach with regular rebalancing'}. I can provide specific recommendations based on current market conditions and sentiment analysis.`;
  }
  
  // Risk and safety queries with sentiment
  if (lowerMessage.includes('safe') || lowerMessage.includes('low risk')) {
    const bonds = marketData?.filter(asset => asset.category === 'bond');
    const mmfs = marketData?.filter(asset => asset.category === 'mmf');
    
    return `For low-risk investments in Kenya, consider Treasury Bills (currently ~16.25% yield), Treasury Bonds, and Money Market Funds (12-13% returns). Given the current ${sentimentDescription} market sentiment, ${avgSentiment < -0.2 ? 'defensive assets are particularly attractive as investors seek safety' : avgSentiment > 0.2 ? 'while growth assets are favored, maintaining some defensive allocation is prudent' : 'a balanced approach between growth and defensive assets is recommended'}. These government-backed securities offer capital preservation with attractive returns.`;
  }
  
  // Default response with sentiment context
  return `I can help you with Kenyan investment analysis including NSE stocks, Treasury bills/bonds, Money Market Funds, forex rates, and cryptocurrency. Current market sentiment is ${sentimentDescription} (score: ${avgSentiment.toFixed(2)}), which I factor into my analysis and recommendations. I can analyze your portfolio, provide market insights with sentiment analysis, and suggest investment strategies based on your risk profile and current market conditions. What specific aspect would you like to explore?`;
}

// Helper function to calculate sentiment metrics
function calculateSentimentMetrics(sentimentData) {
  if (!sentimentData || sentimentData.length === 0) {
    return {
      average_sentiment: 0,
      sentiment_distribution: {},
      total_articles: 0,
      confidence_level: 0
    };
  }
  
  const avgSentiment = sentimentData.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / sentimentData.length;
  const avgConfidence = sentimentData.reduce((sum, item) => sum + (item.confidence_level || 0), 0) / sentimentData.length;
  
  const sentimentDistribution = sentimentData.reduce((dist, item) => {
    const category = item.sentiment_category || 'neutral';
    dist[category] = (dist[category] || 0) + 1;
    return dist;
  }, {});
  
  return {
    average_sentiment: parseFloat(avgSentiment.toFixed(2)),
    sentiment_distribution: sentimentDistribution,
    total_articles: sentimentData.length,
    confidence_level: parseFloat(avgConfidence.toFixed(2))
  };
}

export default router;