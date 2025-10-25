import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import MarketOverview from './components/MarketOverview';
import PortfolioSummary from './components/PortfolioSummary';
import AIRecommendations from './components/AIRecommendations';
import ChatInterface from './components/ChatInterface';
import MarketInsights from './components/MarketInsights';
import LandingPage from './components/LandingPage';
import UserProfileForm from './components/UserProfileForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showProfileForm, setShowProfileForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MaliGuide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onShowProfile={() => setShowProfileForm(true)} />
      
      <ProtectedRoute fallback={<LandingPage />}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Market Overview Cards */}
          <MarketOverview />
          
          {/* Portfolio Summary */}
          <PortfolioSummary />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - AI Features */}
            <div className="xl:col-span-2 space-y-8">
              <AIRecommendations />
              <ChatInterface />
            </div>
            
            {/* Right Column - Market Insights */}
            <div className="xl:col-span-1">
              <MarketInsights />
            </div>
          </div>
        </main>

        {/* User Profile Modal */}
        <UserProfileForm 
          isOpen={showProfileForm} 
          onClose={() => setShowProfileForm(false)} 
        />
      </ProtectedRoute>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;