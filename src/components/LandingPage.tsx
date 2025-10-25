import React, { useState } from 'react';
import { TrendingUp, Brain, Shield, Zap, BarChart3, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import AuthModal from './auth/AuthModal';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-emerald-600" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced sentiment analysis and market intelligence for smarter investment decisions'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: 'Real-Time Data',
      description: 'Live market data from NSE, CBK, crypto markets, and forex rates'
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: 'Risk Management',
      description: 'Personalized risk assessment and portfolio optimization recommendations'
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      title: 'Kenyan Markets',
      description: 'Specialized focus on Kenyan investment opportunities and local market dynamics'
    }
  ];

  const benefits = [
    'Personalized AI investment recommendations',
    'Real-time market sentiment analysis',
    'Portfolio tracking and optimization',
    'Treasury bills and bonds insights',
    'Cryptocurrency market analysis',
    'WhatsApp integration for easy access'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Guide to Building
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent block">
                Wealth in Kenya
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              MaliGuide provides AI-powered investment intelligence for Kenyan markets. 
              Get personalized recommendations, real-time sentiment analysis, and comprehensive 
              portfolio insights all in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Start Investing Smarter</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button className="text-emerald-600 hover:text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border-2 border-emerald-200 hover:border-emerald-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <div className="bg-emerald-200 rounded-full p-4">
            <Zap className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <div className="absolute top-40 right-10 opacity-20">
          <div className="bg-blue-200 rounded-full p-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Investing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to navigate the Kenyan investment landscape with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose MaliGuide?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our AI-powered platform combines cutting-edge technology with deep understanding 
                of Kenyan markets to give you the edge you need.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-600">Join thousands of smart investors already using MaliGuide</p>
              </div>
              
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Create Free Account
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                No credit card required • Free forever • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Investment Journey Today
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start your wealth-building journey with MaliGuide. Get personalized AI recommendations 
            and make data-driven investment decisions.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default LandingPage;