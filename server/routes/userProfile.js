import express from 'express';
import { supabase } from '../database/supabase.js';

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return res.status(500).json({ error: error.message });
    }
    
    // If no profile exists, return default profile structure
    if (!profile) {
      const defaultProfile = {
        user_id: userId,
        risk_tolerance: 'moderate',
        investment_goals: [],
        time_horizon: 5,
        monthly_budget: 0,
        age: null,
        experience: 'beginner',
        preferred_sectors: [],
        investment_style: 'balanced',
        currency_preference: 'KES',
        notification_preferences: {
          email: true,
          push: false,
          sms: false
        }
      };
      
      return res.json({
        success: true,
        data: defaultProfile,
        isNew: true,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: profile,
      isNew: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    
    // Validate required fields
    const allowedFields = [
      'risk_tolerance',
      'investment_goals',
      'time_horizon',
      'monthly_budget',
      'age',
      'experience',
      'preferred_sectors',
      'investment_style',
      'currency_preference',
      'notification_preferences'
    ];
    
    // Filter out any fields not in the allowed list
    const filteredData = {};
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        filteredData[field] = profileData[field];
      }
    });
    
    // Validate risk tolerance
    if (filteredData.risk_tolerance && !['conservative', 'moderate', 'aggressive'].includes(filteredData.risk_tolerance)) {
      return res.status(400).json({ error: 'Invalid risk tolerance value' });
    }
    
    // Validate experience
    if (filteredData.experience && !['beginner', 'intermediate', 'expert'].includes(filteredData.experience)) {
      return res.status(400).json({ error: 'Invalid experience value' });
    }
    
    // Validate investment style
    if (filteredData.investment_style && !['conservative', 'balanced', 'growth', 'aggressive'].includes(filteredData.investment_style)) {
      return res.status(400).json({ error: 'Invalid investment style value' });
    }
    
    // Validate time horizon
    if (filteredData.time_horizon && (filteredData.time_horizon < 1 || filteredData.time_horizon > 50)) {
      return res.status(400).json({ error: 'Time horizon must be between 1 and 50 years' });
    }
    
    // Validate age
    if (filteredData.age && (filteredData.age < 18 || filteredData.age > 100)) {
      return res.status(400).json({ error: 'Age must be between 18 and 100' });
    }
    
    // Validate monthly budget
    if (filteredData.monthly_budget && filteredData.monthly_budget < 0) {
      return res.status(400).json({ error: 'Monthly budget cannot be negative' });
    }
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(filteredData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...filteredData
        })
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      result = data;
    }
    
    res.json({
      success: true,
      data: result,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile completion status
router.get('/:userId/completion', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }
    
    if (!profile) {
      return res.json({
        success: true,
        data: {
          completion_percentage: 0,
          missing_fields: ['risk_tolerance', 'investment_goals', 'time_horizon', 'monthly_budget', 'age', 'experience'],
          is_complete: false
        }
      });
    }
    
    // Calculate completion percentage
    const requiredFields = ['risk_tolerance', 'investment_goals', 'time_horizon', 'monthly_budget', 'age', 'experience'];
    const completedFields = requiredFields.filter(field => {
      const value = profile[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    });
    
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
    const missingFields = requiredFields.filter(field => !completedFields.includes(field));
    
    res.json({
      success: true,
      data: {
        completion_percentage: completionPercentage,
        missing_fields: missingFields,
        is_complete: completionPercentage === 100,
        completed_fields: completedFields
      }
    });
    
  } catch (error) {
    console.error('Error checking profile completion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investment recommendations based on profile
router.get('/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Generate profile-based recommendations
    const recommendations = generateProfileRecommendations(profile);
    
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating profile recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate recommendations based on profile
function generateProfileRecommendations(profile) {
  const recommendations = [];
  
  // Asset allocation based on risk tolerance and age
  const { risk_tolerance, age, time_horizon, investment_goals } = profile;
  
  // Conservative allocation
  if (risk_tolerance === 'conservative' || age > 55) {
    recommendations.push({
      category: 'bonds',
      allocation: 60,
      reasoning: 'Conservative approach prioritizes capital preservation with government bonds and treasury bills'
    });
    recommendations.push({
      category: 'stocks',
      allocation: 25,
      reasoning: 'Limited equity exposure through blue-chip stocks like Safaricom and KCB'
    });
    recommendations.push({
      category: 'mmf',
      allocation: 15,
      reasoning: 'Money market funds provide liquidity and stable returns'
    });
  }
  
  // Moderate allocation
  else if (risk_tolerance === 'moderate') {
    recommendations.push({
      category: 'stocks',
      allocation: 50,
      reasoning: 'Balanced equity exposure across banking, telecom, and consumer sectors'
    });
    recommendations.push({
      category: 'bonds',
      allocation: 35,
      reasoning: 'Government securities provide stability and regular income'
    });
    recommendations.push({
      category: 'mmf',
      allocation: 10,
      reasoning: 'Emergency fund and short-term liquidity needs'
    });
    recommendations.push({
      category: 'crypto',
      allocation: 5,
      reasoning: 'Small allocation to cryptocurrency for growth potential'
    });
  }
  
  // Aggressive allocation
  else if (risk_tolerance === 'aggressive' && age < 40) {
    recommendations.push({
      category: 'stocks',
      allocation: 70,
      reasoning: 'High equity allocation for maximum growth potential'
    });
    recommendations.push({
      category: 'crypto',
      allocation: 15,
      reasoning: 'Significant cryptocurrency exposure for high returns'
    });
    recommendations.push({
      category: 'bonds',
      allocation: 10,
      reasoning: 'Minimal bond allocation for some stability'
    });
    recommendations.push({
      category: 'mmf',
      allocation: 5,
      reasoning: 'Small cash position for opportunities'
    });
  }
  
  return recommendations;
}

export default router;