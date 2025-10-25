@@ .. @@
 /*
-  # Notifications System Migration
+  # MaliGuide Complete Database Schema
 
   1. New Tables
+    - `market_data` (market data for all assets)
+    - `user_portfolios` (user investment holdings)
+    - `user_profiles` (user investment preferences)
+    - `ai_recommendations` (AI-generated investment suggestions)
+    - `market_insights` (news and sentiment analysis)
+    - `news_sources` (trusted news sources)
     - `notifications`
       - `id` (uuid, primary key)
       - `user_id` (uuid, foreign key to auth.users)