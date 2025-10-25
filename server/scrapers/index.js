import cron from 'node-cron';
import { scrapeNSEData } from './nse-scraper.js';
import { scrapeCBKData } from './cbk-scraper.js';
import { scrapeMMFData } from './mmf-scraper.js';
import { scrapeCryptoData } from './crypto-scraper.js';
import { scrapeForexData } from './forex-scraper.js';
import { scrapeNewsData } from './news-scraper.js';
import { supabase } from '../database/supabase.js';

export async function startDataIngestion() {
  console.log('🔄 Starting automated data ingestion...');
  
  // Run initial data collection
  await collectAllMarketData();
  
  // Schedule regular updates
  // Every 5 minutes during market hours (9 AM - 3 PM, Monday-Friday)
  cron.schedule('*/5 9-15 * * 1-5', async () => {
    console.log('📊 Running scheduled market data update...');
    await collectAllMarketData();
  });
  
  // Every hour for bonds and MMF (less frequent updates needed)
  cron.schedule('0 * * * *', async () => {
    console.log('🏦 Running scheduled bond and MMF data update...');
    await scrapeCBKData();
    await scrapeMMFData();
  });
  
  // Every 2 minutes for crypto (24/7 markets)
  cron.schedule('*/2 * * * *', async () => {
    console.log('₿ Running scheduled crypto data update...');
    await scrapeCryptoData();
  });
  
  // Every 30 minutes for news and sentiment analysis
  cron.schedule('*/30 * * * *', async () => {
    console.log('📰 Running scheduled news and sentiment analysis...');
    await scrapeNewsData();
  });
  
  // Daily comprehensive news update at 6 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('📰 Running daily comprehensive news update...');
    await scrapeNewsData();
    await generateMarketSentimentSummary();
  });
  
  console.log('✅ Data ingestion scheduled successfully');
}

async function collectAllMarketData() {
  try {
    const results = await Promise.allSettled([
      scrapeNSEData(),
      scrapeCBKData(),
      scrapeMMFData(),
      scrapeCryptoData(),
      scrapeForexData(),
      scrapeNewsData()
    ]);
    
    let successCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      const sources = ['NSE', 'CBK', 'MMF', 'Crypto', 'Forex', 'News'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${sources[index]} data updated successfully`);
        successCount++;
      } else {
        console.error(`❌ ${sources[index]} data update failed:`, result.reason?.message);
        errorCount++;
      }
    });
    
    console.log(`📊 Data collection complete: ${successCount} successful, ${errorCount} failed`);
    
    // Log collection summary to database
    await logDataCollectionSummary(successCount, errorCount);
    
  } catch (error) {
    console.error('❌ Error in data collection:', error);
  }
}

async function generateMarketSentimentSummary() {
  try {
    console.log('🔄 Generating market sentiment summary...');
    
    // Get recent news with sentiment data
    const { data: recentNews } = await supabase
      .from('market_insights')
      .select('sentiment_score, sentiment_category, relevant_assets, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (!recentNews || recentNews.length === 0) {
      console.log('No recent news found for sentiment summary');
      return;
    }
    
    // Calculate overall market sentiment
    const avgSentiment = recentNews.reduce((sum, news) => sum + news.sentiment_score, 0) / recentNews.length;
    
    // Count sentiment categories
    const sentimentCounts = recentNews.reduce((counts, news) => {
      counts[news.sentiment_category] = (counts[news.sentiment_category] || 0) + 1;
      return counts;
    }, {});
    
    // Determine dominant sentiment
    const dominantSentiment = Object.entries(sentimentCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Generate summary description
    let summaryDescription = `Market sentiment analysis based on ${recentNews.length} recent news articles. `;
    summaryDescription += `Average sentiment score: ${avgSentiment.toFixed(2)} (${dominantSentiment.replace('_', ' ')}). `;
    
    if (avgSentiment > 0.2) {
      summaryDescription += 'Overall market sentiment is positive, suggesting optimistic investor outlook.';
    } else if (avgSentiment < -0.2) {
      summaryDescription += 'Overall market sentiment is negative, indicating cautious investor sentiment.';
    } else {
      summaryDescription += 'Market sentiment is neutral, reflecting balanced investor perspectives.';
    }
    
    // Insert sentiment summary
    const { error } = await supabase
      .from('market_insights')
      .insert({
        title: 'Daily Market Sentiment Summary',
        description: summaryDescription,
        content: `Detailed sentiment analysis: ${JSON.stringify(sentimentCounts, null, 2)}`,
        impact: avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral',
        sentiment_score: parseFloat(avgSentiment.toFixed(2)),
        sentiment_category: dominantSentiment,
        confidence_level: 0.85,
        relevant_assets: [...new Set(recentNews.flatMap(news => news.relevant_assets || []))],
        keywords: ['market sentiment', 'daily summary', 'sentiment analysis'],
        source: 'AI Sentiment Engine',
        published_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error inserting sentiment summary:', error);
    } else {
      console.log('✅ Market sentiment summary generated successfully');
    }
    
  } catch (error) {
    console.error('❌ Error generating sentiment summary:', error);
  }
}

async function logDataCollectionSummary(successCount, errorCount) {
  try {
    const { error } = await supabase
      .from('market_insights')
      .insert({
        title: 'Data Collection Summary',
        description: `Automated data collection completed: ${successCount} sources successful, ${errorCount} sources failed`,
        impact: errorCount > successCount ? 'negative' : 'neutral',
        sentiment_score: errorCount > successCount ? -0.3 : 0.0,
        sentiment_category: 'neutral',
        confidence_level: 0.9,
        source: 'System',
        relevant_assets: [],
        keywords: ['system', 'data collection', 'automation'],
        published_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging collection summary:', error);
    }
  } catch (error) {
    console.error('Error logging collection summary:', error);
  }
}

// Manual trigger function for testing
export async function triggerManualUpdate() {
  console.log('🔄 Manual data update triggered...');
  await collectAllMarketData();
}

// Export sentiment summary function for API use
export { generateMarketSentimentSummary };