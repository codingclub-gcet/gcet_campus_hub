#!/usr/bin/env node

/**
 * Manual cleanup script for expired guest data
 * Run this script periodically to clean up guest data older than 3 months
 * 
 * Usage: node cleanup-guest-data.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Add your project ID here
    projectId: 'evnty-124fb'
  });
}

async function cleanupExpiredGuestData() {
  console.log('🧹 Starting cleanup of expired guest data...');
  
  try {
    const now = admin.firestore.Timestamp.now();
    let totalDeleted = 0;
    
    // Clean up expired guest registrations
    console.log('📋 Checking for expired guest registrations...');
    const guestRegistrationsQuery = admin.firestore()
      .collectionGroup('guestRegistrations')
      .where('expiresAt', '<', now)
      .where('isGuest', '==', true);
    
    const guestRegistrationsSnapshot = await guestRegistrationsQuery.get();
    
    if (!guestRegistrationsSnapshot.empty) {
      console.log(`📋 Found ${guestRegistrationsSnapshot.size} expired guest registrations to delete`);
      
      const batch = admin.firestore().batch();
      guestRegistrationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        totalDeleted++;
      });
      
      await batch.commit();
      console.log(`✅ Deleted ${totalDeleted} expired guest registrations`);
    } else {
      console.log('📋 No expired guest registrations found');
    }
    
    // Clean up expired guest user profiles
    console.log('👤 Checking for expired guest user profiles...');
    const guestUsersQuery = admin.firestore()
      .collection('users')
      .where('expiresAt', '<', now)
      .where('isGuest', '==', true);
    
    const guestUsersSnapshot = await guestUsersQuery.get();
    
    if (!guestUsersSnapshot.empty) {
      console.log(`👤 Found ${guestUsersSnapshot.size} expired guest user profiles to delete`);
      
      const batch = admin.firestore().batch();
      guestUsersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        totalDeleted++;
      });
      
      await batch.commit();
      console.log(`✅ Deleted ${guestUsersSnapshot.size} expired guest user profiles`);
    } else {
      console.log('👤 No expired guest user profiles found');
    }
    
    // Clean up expired guest notifications
    console.log('🔔 Checking for expired guest notifications...');
    const notificationsQuery = admin.firestore()
      .collection('notifications')
      .where('expiresAt', '<', now)
      .where('isGuest', '==', true);
    
    const notificationsSnapshot = await notificationsQuery.get();
    
    if (!notificationsSnapshot.empty) {
      console.log(`🔔 Found ${notificationsSnapshot.size} expired guest notifications to delete`);
      
      const batch = admin.firestore().batch();
      notificationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        totalDeleted++;
      });
      
      await batch.commit();
      console.log(`✅ Deleted ${notificationsSnapshot.size} expired guest notifications`);
    } else {
      console.log('🔔 No expired guest notifications found');
    }
    
    console.log(`🎉 Cleanup completed! Total documents deleted: ${totalDeleted}`);
    
    // Show summary
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    console.log(`📅 Cleaned up data older than: ${threeMonthsAgo.toISOString()}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupExpiredGuestData()
  .then(() => {
    console.log('✅ Cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup script failed:', error);
    process.exit(1);
  });

