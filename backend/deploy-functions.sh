#!/bin/bash

echo "🚀 Deploying Firebase Functions..."

# Build the functions
echo "📦 Building functions..."
cd functions
npm run build

# Deploy to Firebase
echo "☁️ Deploying to Firebase..."
firebase deploy --only functions --project evnty-124fb

echo "✅ Deployment complete!"
echo "🔗 Functions available at:"
echo "   - testFunction: https://us-central1-evnty-124fb.cloudfunctions.net/testFunction"
echo "   - testFirestore: https://us-central1-evnty-124fb.cloudfunctions.net/testFirestore"
echo "   - getUserData: https://us-central1-evnty-124fb.cloudfunctions.net/getUserData"
