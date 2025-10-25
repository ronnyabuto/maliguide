import { useState, useEffect } from 'react';
import { apiClient, transformUserProfileData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
  id?: string;
  userId: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  timeHorizon: number;
  monthlyBudget: number;
  age?: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  preferredSectors: string[];
  investmentStyle: 'conservative' | 'balanced' | 'growth' | 'aggressive';
  currencyPreference: 'KES' | 'USD' | 'EUR';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileCompletion {
  completion_percentage: number;
  missing_fields: string[];
  is_complete: boolean;
  completed_fields?: string[];
}

export interface ProfileRecommendation {
  category: string;
  allocation: number;
  reasoning: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getUserProfile(user.id);
      
      if (response.success) {
        const transformedProfile = transformUserProfileData(response.data);
        setProfile(transformedProfile);
        setIsNew(response.isNew || false);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set default profile on error
      if (user?.id) {
        setProfile({
          userId: user.id,
          riskTolerance: 'moderate',
          investmentGoals: [],
          timeHorizon: 5,
          monthlyBudget: 0,
          experience: 'beginner',
          preferredSectors: [],
          investmentStyle: 'balanced',
          currencyPreference: 'KES',
          notificationPreferences: {
            email: true,
            push: false,
            sms: false
          }
        });
        setIsNew(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.updateUserProfile(user.id, {
        risk_tolerance: updates.riskTolerance,
        investment_goals: updates.investmentGoals,
        time_horizon: updates.timeHorizon,
        monthly_budget: updates.monthlyBudget,
        age: updates.age,
        experience: updates.experience,
        preferred_sectors: updates.preferredSectors,
        investment_style: updates.investmentStyle,
        currency_preference: updates.currencyPreference,
        notification_preferences: updates.notificationPreferences
      });

      if (response.success) {
        const transformedProfile = transformUserProfileData(response.data);
        setProfile(transformedProfile);
        setIsNew(false);
        return response;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    isNew,
    refetch: fetchProfile,
    updateProfile
  };
};

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletion = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getProfileCompletion(user.id);
      
      if (response.success) {
        setCompletion(response.data);
      } else {
        throw new Error('Failed to fetch profile completion');
      }
    } catch (err) {
      console.error('Error fetching profile completion:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletion();
  }, [user?.id]);

  return {
    completion,
    loading,
    error,
    refetch: fetchCompletion
  };
};

export const useProfileRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ProfileRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getProfileRecommendations(user.id);
      
      if (response.success) {
        setRecommendations(response.data);
      } else {
        throw new Error('Failed to fetch profile recommendations');
      }
    } catch (err) {
      console.error('Error fetching profile recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback recommendations
      setRecommendations([
        {
          category: 'stocks',
          allocation: 50,
          reasoning: 'Balanced equity exposure for moderate growth'
        },
        {
          category: 'bonds',
          allocation: 35,
          reasoning: 'Government securities for stability'
        },
        {
          category: 'mmf',
          allocation: 15,
          reasoning: 'Liquidity and emergency funds'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations
  };
};