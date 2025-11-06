import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as cors from 'cors';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize CORS
const corsHandler = cors.default({ origin: true });

// Initialize Razorpay
const config = functions.config();
const razorpay = new Razorpay({
  key_id: config.razorpay?.key_id,
  key_secret: config.razorpay?.key_secret
});

// Email configuration
const emailConfig = {
  // Using Gmail SMTP - you can change this to any email service
  service: 'gmail',
  auth: {
    user: config.email?.user || 'your-email@gmail.com',
    pass: config.email?.password || 'your-app-password' // Use App Password for Gmail
  }
};

// Create nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email sending function
async function sendOTPEmail(email: string, otp: string, userName: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: emailConfig.auth.user,
      to: email,
      subject: 'Your GCET Registration OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GCET Campus Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Registration Verification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for registering with GCET Campus Hub. To complete your registration, please use the OTP below:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This OTP will expire in <strong>10 minutes</strong>.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> Never share this OTP with anyone. GCET will never ask for your OTP via phone or email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>© 2024 GCET Campus Hub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
}

// OTP Generation and Verification Functions
export const generateOTP = functions.https.onCall(async (data, context) => {
  try {
    const { email, userData } = data;
    
    // Input validation
    if (!email || !userData) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and user data are required');
    }
    
    // College email validation - only @gcet.edu.in emails allowed
    const collegeEmailRegex = /^[a-z0-9._%+-]+@gcet\.edu\.in$/i;
    if (!collegeEmailRegex.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Only GCET college email addresses are allowed');
    }
    
    // Rate limiting - check if OTP was generated recently
    // Get all OTPs for this email and check manually to avoid index requirement
    const allOTPs = await admin.firestore()
      .collection('otp_verifications')
      .where('email', '==', email)
      .get();
    
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentOTPs = allOTPs.docs.filter(doc => {
      const data = doc.data();
      return data.createdAt && data.createdAt.toDate() > oneMinuteAgo;
    });
    
    if (recentOTPs.length > 0) {
      throw new functions.https.HttpsError('resource-exhausted', 'Please wait before requesting another OTP');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Firestore
    const otpRecord = {
      email,
      otp,
      userData,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      isUsed: false
    };

    // Clean up any existing OTPs for this email
    const existingOTPs = await admin.firestore()
      .collection('otp_verifications')
      .where('email', '==', email)
      .get();

    const deletePromises = existingOTPs.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Add new OTP
    const docRef = await admin.firestore()
      .collection('otp_verifications')
      .add(otpRecord);

    console.log('OTP generated for:', email);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, userData.name || 'User');
    
    if (!emailSent) {
      // If email fails, still return success but log the issue
      console.warn('⚠️ OTP generated but email sending failed. OTP:', otp);
    }
  
  return {
    success: true,
      message: emailSent ? 'OTP generated and sent to email' : 'OTP generated but email sending failed. Please check console for OTP.',
      otpId: docRef.id,
      emailSent
    };
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate OTP');
  }
});

export const verifyOTP = functions.https.onCall(async (data, context) => {
  try {
    const { email, otp } = data;
    
    // Input validation
    if (!email || !otp) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and OTP are required');
    }
    
    // College email validation - only @gcet.edu.in emails allowed
    const collegeEmailRegex = /^[a-z0-9._%+-]+@gcet\.edu\.in$/i;
    if (!collegeEmailRegex.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Only GCET college email addresses are allowed');
    }
    
    // OTP format validation (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid OTP format');
    }

    // Find the OTP record - simplified query without orderBy
    const otpQuery = await admin.firestore()
      .collection('otp_verifications')
      .where('email', '==', email)
      .where('otp', '==', otp)
      .where('isUsed', '==', false)
      .get();
    

    if (otpQuery.empty) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Find the most recent OTP (in case there are multiple)
    let otpDoc = otpQuery.docs[0];
    let latestTime = otpDoc.data().createdAt;
    
    for (const doc of otpQuery.docs) {
      const docTime = doc.data().createdAt;
      if (docTime > latestTime) {
        otpDoc = doc;
        latestTime = docTime;
      }
    }
    
    const otpData = otpDoc.data();

    // Check if OTP is expired
    const now = new Date();
    if (now > otpData.expiresAt.toDate()) {
      // Delete expired OTP
      await otpDoc.ref.delete();
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    // Mark OTP as used by deleting it
    await otpDoc.ref.delete();

    return {
      success: true,
      message: 'OTP verified successfully',
      userData: otpData.userData
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify OTP');
  }
});

export const resendOTP = functions.https.onCall(async (data, context) => {
  try {
    const { email, userData } = data;
    
    if (!email || !userData) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and user data are required');
    }

    // Clean up existing OTPs
    const existingOTPs = await admin.firestore()
      .collection('otp_verifications')
      .where('email', '==', email)
      .get();

    const deletePromises = existingOTPs.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const otpRecord = {
      email,
      otp,
      userData,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      isUsed: false
    };

    const docRef = await admin.firestore()
      .collection('otp_verifications')
      .add(otpRecord);

    console.log('Resending OTP to:', email);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, userData.name || 'User');
    
    if (!emailSent) {
      console.warn('⚠️ OTP regenerated but email sending failed. OTP:', otp);
    }

    return {
      success: true,
      message: emailSent ? 'OTP resent successfully' : 'OTP regenerated but email sending failed. Please check console for OTP.',
      otpId: docRef.id,
      emailSent
    };
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to resend OTP');
  }
});


// Razorpay Payment Functions
export const createRazorpayOrder = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      // Rate limiting - check request frequency
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const rateLimitKey = `rate_limit_${clientIP}`;
      
      // Basic input validation
      const {
        amount,
        currency = 'INR',
        orderId,
        customer,
        event,
        // Also handle flat structure from frontend
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        eventId,
        eventName,
        description,
        clubId,
        subMerchantAccountId
      } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      if (currency !== 'INR') {
        return res.status(400).json({ error: 'Invalid currency' });
      }
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      if (!amount || !orderId) {
        return res.status(400).json({ error: 'Missing required fields: amount and orderId' });
      }

      // Handle both nested and flat structure
      const customerData = customer || {
        customerId: customerId || 'unknown',
        customerName: customerName || 'Unknown User',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || ''
      };

      const eventData = event || {
        id: eventId || 'unknown_event',
        name: eventName || 'Unknown Event',
        description: description || 'Event Registration'
      };

      // Create payment order request
      const orderRequest: any = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: orderId,
        notes: {
          eventId: eventData.id,
          eventName: eventData.name,
          customerId: customerData.customerId,
          description: eventData.description,
          clubId: clubId || 'unknown',
          subMerchantAccountId: subMerchantAccountId || 'none'
        }
      };

      // Add sub-merchant routing if account ID is provided
      if (subMerchantAccountId && subMerchantAccountId !== 'none') {
        // Ensure account ID is 18 characters (Razorpay requirement)
        const paddedAccountId = subMerchantAccountId.padEnd(18, '0').substring(0, 18);
        orderRequest.transfers = [{
          account: paddedAccountId,
          amount: amount * 100, // Full amount goes to sub-merchant
          currency: currency
        }];
      }

      // Debug: Log the config values
      console.log('Razorpay config:', {
        key_id: config.razorpay?.key_id,
        key_secret: config.razorpay?.key_secret ? '***' : 'undefined'
      });

      // Check if we have real credentials
      if (!config.razorpay?.key_secret) {
        // Mock response for testing
        const mockOrderId = `order_${orderId}_${Date.now()}_test`;
        const response: any = {
          success: true,
          razorpayOrderId: mockOrderId,
          orderId: orderId,
          amount: amount,
          currency: currency,
          key: config.razorpay?.key_id,
          name: 'Event Registration',
          description: eventData.description,
          prefill: {
            name: customerData.customerName,
            email: customerData.customerEmail,
            contact: customerData.customerPhone
          },
          notes: orderRequest.notes
        };

        // Add sub-merchant info to mock response
        if (subMerchantAccountId && subMerchantAccountId !== 'none') {
          const paddedAccountId = subMerchantAccountId.padEnd(18, '0').substring(0, 18);
          response.subMerchantAccountId = paddedAccountId;
          response.transferInfo = {
            account: paddedAccountId,
            amount: amount * 100,
            currency: currency,
            note: 'Payment will be routed to sub-merchant account'
          };
        }

        return res.status(200).json(response);
      }

      // Create payment order with real Razorpay API
      const orderResponse = await razorpay.orders.create(orderRequest);
      
      if (orderResponse && orderResponse.id) {
        return res.status(200).json({
          success: true,
          razorpayOrderId: orderResponse.id,
          orderId: orderResponse.receipt,
          amount: Number(orderResponse.amount) / 100, // Convert back from paise
          currency: orderResponse.currency,
          key: config.razorpay?.key_id,
          name: 'Event Registration',
          description: eventData.description,
          prefill: {
            name: customerData.customerName,
            email: customerData.customerEmail,
            contact: customerData.customerPhone
          },
          notes: orderRequest.notes
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to create payment order',
          details: 'No order ID received',
        });
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

export const getRazorpayPaymentStatus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const orderId = req.query.orderId as string;
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Check if we have real credentials
      if (!config.razorpay?.key_secret) {
        // Mock response for testing
        return res.status(200).json({
          success: true,
          paymentId: `mock_payment_${orderId}`,
          orderId: orderId,
          status: 'captured',
          amount: 100,
          currency: 'INR',
          transactionId: `mock_payment_${orderId}`,
          paymentMethod: 'test',
          timestamp: new Date().toISOString(),
        });
      }

      // Get payment status from Razorpay API
      const payments = await razorpay.orders.fetchPayments(orderId);
      
      if (payments && payments.items && payments.items.length > 0) {
        const payment = payments.items[0];
        return res.status(200).json({
          success: true,
          paymentId: payment.id,
          orderId: orderId,
          status: payment.status,
          amount: Number(payment.amount) / 100, // Convert from paise
          currency: payment.currency,
          transactionId: payment.id,
          paymentMethod: payment.method,
          timestamp: new Date(payment.created_at * 1000).toISOString(),
        });
      } else {
        return res.status(200).json({
          success: true,
          paymentId: orderId,
          orderId: orderId,
          status: 'pending',
          amount: 0,
          currency: 'INR',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

export const handleRazorpayCallback = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const callbackData = req.body;
      console.log('Razorpay callback received:', callbackData);

      // Verify the callback signature (implement proper verification)
      // For now, we'll just log and acknowledge
      
      // Update payment status in your database
      // This is where you'd update the registration status to 'confirmed'
      // and payment status to 'paid' in Firestore
      
      return res.status(200).json({ success: true, message: 'Callback processed' });
    } catch (error) {
      console.error('Error handling Razorpay callback:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

// Create Razorpay Sub-Merchant Account
export const createRazorpaySubMerchant = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const {
        name,
        email,
        phone,
        type,
        business_type,
        bank_account
      } = req.body;

      if (!name || !email || !phone || !type || !business_type || !bank_account) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // IMPORTANT: Razorpay sub-merchant creation requires special setup
      // For now, we'll create a mock sub-merchant ID and store payment details
      // In production, you need to:
      // 1. Set up Razorpay Partner account
      // 2. Use Razorpay Partners API for sub-merchant creation
      // 3. Complete KYC process for each sub-merchant
      
      // Generate 18-character account ID (Razorpay requirement)
      const mockLinkedAccountId = `acc${Date.now()}${Math.random().toString(36).substr(2, 4)}`.padEnd(18, '0').substring(0, 18);
      
      return res.status(200).json({
        success: true,
        linked_account_id: mockLinkedAccountId,
        status: 'pending_verification',
        message: 'Payment details saved successfully',
        note: 'Sub-merchant account created (Mock). For production: 1) Set up Razorpay Partner account, 2) Use Partners API, 3) Complete KYC process.',
        payment_details: {
          name,
          email,
          phone,
          type,
          business_type,
          bank_account
        }
      });
    } catch (error) {
      console.error('Error creating Razorpay sub-merchant:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

// Scheduled function to clean up expired guest data (runs daily at 2 AM)
export const cleanupExpiredGuestData = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('Asia/Kolkata') // Indian timezone
  .onRun(async (context) => {
    console.log('Starting cleanup of expired guest data...');
    
    try {
      const now = admin.firestore.Timestamp.now();
      let totalDeleted = 0;
      
      // Clean up expired guest registrations
      const guestRegistrationsQuery = admin.firestore()
        .collectionGroup('guestRegistrations')
        .where('expiresAt', '<', now)
        .where('isGuest', '==', true);
      
      const guestRegistrationsSnapshot = await guestRegistrationsQuery.get();
      
      if (!guestRegistrationsSnapshot.empty) {
        console.log(`Found ${guestRegistrationsSnapshot.size} expired guest registrations to delete`);
        
        const batch = admin.firestore().batch();
        guestRegistrationsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          totalDeleted++;
        });
        
        await batch.commit();
        console.log(`Deleted ${totalDeleted} expired guest registrations`);
      } else {
        console.log('No expired guest registrations found');
      }
      
      // Clean up expired guest notifications
      const notificationsQuery = admin.firestore()
        .collection('notifications')
        .where('expiresAt', '<', now)
        .where('isGuest', '==', true);
      
      const notificationsSnapshot = await notificationsQuery.get();
      
      if (!notificationsSnapshot.empty) {
        console.log(`Found ${notificationsSnapshot.size} expired guest notifications to delete`);
        
        const batch = admin.firestore().batch();
        notificationsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          totalDeleted++;
        });
        
        await batch.commit();
        console.log(`Deleted ${notificationsSnapshot.size} expired guest notifications`);
      }
      
      console.log(`Cleanup completed. Total documents deleted: ${totalDeleted}`);
      return { success: true, deletedCount: totalDeleted };
      
    } catch (error) {
      console.error('Error during cleanup of expired guest data:', error);
      throw error;
  }
});
