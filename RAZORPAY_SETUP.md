# Razorpay Payment Gateway Setup Guide

This guide will help you set up Razorpay payment gateway integration for your event registration system.

## Prerequisites

- Razorpay account (sign up at [razorpay.com](https://razorpay.com))
- Firebase project with Functions enabled
- Node.js and npm installed

## Step 1: Get Razorpay Credentials

1. **Sign up/Login** to your Razorpay account
2. **Go to Settings** → **API Keys**
3. **Generate API Keys**:
   - For testing: Use Test Mode keys
   - For production: Use Live Mode keys
4. **Copy your credentials**:
   - Key ID (starts with `rzp_test_` for test mode)
   - Key Secret (starts with `rzp_test_` for test mode)

## Step 2: Update Backend Environment Variables

### For Firebase Functions:

```bash
# Set Razorpay credentials
firebase functions:config:set razorpay.key_id="your_key_id_here"
firebase functions:config:set razorpay.key_secret="your_key_secret_here"

# Deploy the functions
firebase deploy --only functions
```

### For Local Development:

Create a `.env` file in the `backend/functions` directory:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## Step 3: Update Frontend Configuration

The frontend automatically uses the deployed Firebase Functions. No additional configuration needed.

## Step 4: Test the Integration

1. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit the test page**:
   - Go to `http://localhost:5174/razorpay-test`
   - Test the API endpoints

3. **Test payment flow**:
   - Go to `http://localhost:5174/payment-demo`
   - Click "Register Now" on the demo event
   - Click "Confirm Registration"
   - Click "Pay with Razorpay"

## Step 5: Production Setup

1. **Switch to Live Mode**:
   - Get your live API keys from Razorpay dashboard
   - Update Firebase Functions config with live keys
   - Deploy functions

2. **Update Frontend**:
   - Change `RAZORPAY_MODE` from `'sandbox'` to `'production'` in `PaymentModal.tsx`

## API Endpoints

The following Firebase Functions are available:

- **POST** `/createRazorpayOrder` - Create a payment order
- **GET** `/getRazorpayPaymentStatus?orderId=xxx` - Check payment status
- **POST** `/handleRazorpayCallback` - Handle payment callbacks

## Payment Flow

1. **User initiates payment** → Frontend calls `createRazorpayOrder`
2. **Backend creates order** → Returns order details with Razorpay key
3. **Frontend opens Razorpay** → User completes payment
4. **Payment success** → Razorpay calls `handleRazorpayCallback`
5. **Registration confirmed** → User is registered for the event

## Troubleshooting

### Common Issues:

1. **"Key ID not found"**:
   - Check if Razorpay credentials are set correctly
   - Verify the key ID format (should start with `rzp_test_` or `rzp_live_`)

2. **"Payment failed"**:
   - Check Razorpay dashboard for error details
   - Verify webhook URLs are configured correctly

3. **"Order not found"**:
   - Ensure order ID is passed correctly
   - Check if the order was created successfully

### Debug Mode:

Enable debug logging by checking browser console and Firebase Functions logs:

```bash
firebase functions:log
```

## Security Notes

- Never expose your Razorpay Key Secret in frontend code
- Always verify payment signatures in production
- Use HTTPS in production
- Implement proper error handling and logging

## Support

- Razorpay Documentation: [razorpay.com/docs](https://razorpay.com/docs)
- Firebase Functions: [firebase.google.com/docs/functions](https://firebase.google.com/docs/functions)

## Migration from Cashfree

If you're migrating from Cashfree:

1. ✅ **Frontend**: Updated `PaymentModal.tsx` to use Razorpay
2. ✅ **Services**: Created `razorpayService.ts` to replace `cashfreeService.ts`
3. ✅ **Backend**: Updated Firebase Functions to use Razorpay API
4. ✅ **Dependencies**: Updated `package.json` with Razorpay SDK

The migration is complete and ready for testing!
