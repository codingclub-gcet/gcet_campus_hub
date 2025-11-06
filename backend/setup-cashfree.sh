#!/bin/bash

echo "🚀 Setting up Cashfree Payment Gateway for Firebase Functions..."

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend/functions directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the functions
echo "🔨 Building functions..."
npm run build

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

echo "⚙️  Setting up environment variables..."
echo "Please enter your Cashfree credentials:"

read -p "Cashfree Secret Key: " CASHFREE_SECRET_KEY
read -p "Cashfree App ID: " CASHFREE_APP_ID
read -p "Mode (sandbox/production) [sandbox]: " CASHFREE_MODE
CASHFREE_MODE=${CASHFREE_MODE:-sandbox}

# Set Firebase Functions config
echo "🔧 Setting Firebase Functions configuration..."
firebase functions:config:set cashfree.secret_key="$CASHFREE_SECRET_KEY"
firebase functions:config:set cashfree.app_id="$CASHFREE_APP_ID"
firebase functions:config:set cashfree.mode="$CASHFREE_MODE"

echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the API base URL in frontend/services/cashfreeService.ts"
echo "2. Add your domain to Cashfree dashboard whitelist"
echo "3. Test the integration at /cashfree-test"
echo ""
echo "Your Firebase Functions URL will be displayed above. Use it to update the baseUrl in cashfreeService.ts"
