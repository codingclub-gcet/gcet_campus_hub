# Firebase Functions Setup Guide

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`

## Setup Steps

### 1. Initialize Firebase Functions
```bash
# In your project root
firebase init functions

# Choose TypeScript when prompted
# Install dependencies when prompted
```

### 2. Create a Test Function
Create a file `functions/src/index.ts` with the following content:

```typescript
import * as functions from 'firebase-functions';

export const testFunction = functions.https.onCall((data, context) => {
  const message = data.message || 'Hello from Firebase Functions!';
  
  return {
    success: true,
    message: message,
    timestamp: new Date().toISOString(),
    userId: context.auth?.uid || 'anonymous'
  };
});
```

### 3. Deploy the Function
```bash
firebase deploy --only functions
```

### 4. Update Firebase Configuration
1. Go to Firebase Console > Project Settings > General
2. Copy your web app configuration
3. Update `firebaseConfig.ts` with your actual configuration values

### 5. Enable Firestore
1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" for now

### 6. Test the Integration
1. Start your React app: `npm run dev`
2. Navigate to `/firebase-test`
3. Click "Test Firebase Function" to test the function
4. Click "Test Firestore" to test Firestore connection

## Next Steps
- Set up authentication
- Create Firestore collections for your data
- Replace mock data with real Firebase data
- Add more functions for your specific use cases
