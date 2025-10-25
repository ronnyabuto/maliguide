import { supabase } from './supabase.js';

export async function initializeDatabase() {
  try {
    console.log('Setting up database tables...');
    
    const { error: marketDataError } = await supabase.rpc('create_market_data_table');
    if (marketDataError && !marketDataError.message.includes('already exists')) {
      console.error('Error creating market_data table:', marketDataError);
    }
    
    const { error: portfolioError } = await supabase.rpc('create_user_portfolios_table');
    if (portfolioError && !portfolioError.message.includes('already exists')) {
      console.error('Error creating user_portfolios table:', portfolioError);
    }
    
    const { error: recommendationsError } = await supabase.rpc('create_ai_recommendations_table');
    if (recommendationsError && !recommendationsError.message.includes('already exists')) {
      console.error('Error creating ai_recommendations table:', recommendationsError);
    }
    
    const { error: profilesError } = await supabase.rpc('create_user_profiles_table');
    if (profilesError && !profilesError.message.includes('already exists')) {
      console.error('Error creating user_profiles table:', profilesError);
    }
    
    const { error: notificationsError } = await supabase.rpc('create_notifications_table');
    if (notificationsError && !notificationsError.message.includes('already exists')) {
      console.error('Error creating notifications table:', notificationsError);
    }
    
    const { error: notificationPrefsError } = await supabase.rpc('create_user_notification_preferences_table');
    if (notificationPrefsError && !notificationPrefsError.message.includes('already exists')) {
      console.error('Error creating user_notification_preferences table:', notificationPrefsError);
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
export const createTablesSQL = `
-- Market Data Table
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  change_amount DECIMAL(15,4),
  change_percent DECIMAL(8,4),
  volume BIGINT,
  market_cap BIGINT,
  category TEXT NOT NULL CHECK (category IN ('stock', 'bond', 'mmf', 'crypto', 'forex')),
  exchange TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_data_asset_id ON market_data(asset_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_category ON market_data(category);
CREATE INDEX IF NOT EXISTS idx_market_data_last_updated ON market_data(last_updated);

-- User Portfolios Table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  quantity DECIMAL(15,8) NOT NULL,
  purchase_price DECIMAL(15,4) NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user portfolios
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_asset_id ON user_portfolios(asset_id);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  risk_tolerance TEXT NOT NULL DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  investment_goals TEXT[] DEFAULT '{}',
  time_horizon INTEGER DEFAULT 5 CHECK (time_horizon >= 1 AND time_horizon <= 50),
  monthly_budget DECIMAL(15,2) DEFAULT 0 CHECK (monthly_budget >= 0),
  age INTEGER CHECK (age >= 18 AND age <= 100),
  experience TEXT DEFAULT 'beginner' CHECK (experience IN ('beginner', 'intermediate', 'expert')),
  preferred_sectors TEXT[] DEFAULT '{}',
  investment_style TEXT DEFAULT 'balanced' CHECK (investment_style IN ('conservative', 'balanced', 'growth', 'aggressive')),
  currency_preference TEXT DEFAULT 'KES' CHECK (currency_preference IN ('KES', 'USD', 'EUR')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_risk_tolerance ON user_profiles(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience ON user_profiles(experience);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('buy', 'sell', 'hold', 'rebalance')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reasoning TEXT NOT NULL,
  target_allocation DECIMAL(5,2),
  timeframe TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create indexes for AI recommendations
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_asset_id ON ai_recommendations(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_active ON ai_recommendations(is_active);

-- Enhanced Market Insights Table with Sentiment Analysis
CREATE TABLE IF NOT EXISTS market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Full article content for analysis
  impact TEXT CHECK (impact IN ('positive', 'negative', 'neutral')),
  sentiment_score DECIMAL(5,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1), -- -1 (very negative) to 1 (very positive)
  sentiment_category TEXT CHECK (sentiment_category IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
  confidence_level DECIMAL(5,2) CHECK (confidence_level >= 0 AND confidence_level <= 1), -- Confidence in sentiment analysis
  relevant_assets TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}', -- Keywords that influenced sentiment
  source TEXT NOT NULL,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for market insights
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON market_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_market_insights_published_at ON market_insights(published_at);
CREATE INDEX IF NOT EXISTS idx_market_insights_impact ON market_insights(impact);
CREATE INDEX IF NOT EXISTS idx_market_insights_sentiment_category ON market_insights(sentiment_category);
CREATE INDEX IF NOT EXISTS idx_market_insights_sentiment_score ON market_insights(sentiment_score);

-- News Sources Table for tracking reliability
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  reliability_score DECIMAL(3,2) DEFAULT 0.5 CHECK (reliability_score >= 0 AND reliability_score <= 1),
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default news sources
INSERT INTO news_sources (name, url, reliability_score, is_active) VALUES
('Business Daily', 'https://www.businessdailyafrica.com', 0.85, true),
('The Star Kenya', 'https://www.the-star.co.ke', 0.75, true),
('Capital FM Business', 'https://www.capitalfm.co.ke/business', 0.80, true),
('Central Bank of Kenya', 'https://www.centralbank.go.ke', 0.95, true),
('Nairobi Securities Exchange', 'https://www.nse.co.ke', 0.90, true)
ON CONFLICT (name) DO NOTHING;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recommendation', 'market_alert', 'system', 'portfolio_update', 'news', 'price_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  link TEXT, -- Optional URL for notification action
  asset_id TEXT, -- Optional asset reference
  metadata JSONB DEFAULT '{}' -- Additional data for the notification
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- User Notification Preferences Table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  -- Specific notification type preferences
  recommendation_alerts BOOLEAN NOT NULL DEFAULT true,
  market_alerts BOOLEAN NOT NULL DEFAULT true,
  portfolio_alerts BOOLEAN NOT NULL DEFAULT true,
  news_alerts BOOLEAN NOT NULL DEFAULT false,
  price_alerts BOOLEAN NOT NULL DEFAULT true,
  system_alerts BOOLEAN NOT NULL DEFAULT true,
  -- Alert thresholds
  price_change_threshold DECIMAL(5,2) DEFAULT 5.0, -- Percentage change to trigger alert
  portfolio_change_threshold DECIMAL(5,2) DEFAULT 10.0, -- Portfolio value change threshold
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification preferences
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Market data is public (read-only)
CREATE POLICY "Market data is publicly readable" ON market_data FOR SELECT USING (true);

-- Users can only access their own portfolio data
CREATE POLICY "Users can view own portfolio" ON user_portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON user_portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON user_portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio" ON user_portfolios FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own profile data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own AI recommendations
CREATE POLICY "Users can view own recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Market insights are public (read-only)
CREATE POLICY "Market insights are publicly readable" ON market_insights FOR SELECT USING (true);

-- News sources are public (read-only)
CREATE POLICY "News sources are publicly readable" ON news_sources FOR SELECT USING (true);

-- Notifications - Users can only access their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- User notification preferences - Users can only access their own preferences
CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON user_notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notification preferences" ON user_notification_preferences FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_portfolios_updated_at BEFORE UPDATE ON user_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create notification preferences for new users
CREATE TRIGGER create_user_notification_preferences 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION create_default_notification_preferences();
`;