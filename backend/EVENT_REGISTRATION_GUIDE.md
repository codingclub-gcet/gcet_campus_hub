# Event Registration System Guide

## 🎯 Overview

The Event Registration System provides a complete solution for managing event registrations with Firebase backend, pre-filled user data, and real-time updates.

## ✨ Features

### For Users
- **Pre-filled Registration Forms**: User profile data is automatically populated
- **Real-time Updates**: Registration status updates instantly across all devices
- **Registration Management**: View, cancel, and track registration status
- **Event Details**: Complete event information with registration requirements

### For Event Organizers
- **Registration Statistics**: Real-time dashboard with registration metrics
- **User Management**: Approve, reject, or cancel registrations
- **Check-in System**: Mark attendees as checked-in during events
- **Payment Tracking**: Monitor payment status for paid events

## 🏗️ Architecture

### Database Structure
```
events/
├── {clubId}/
    └── clubEvents/
        └── {eventId}/
            └── registrations/
                └── {registrationId}/
                    ├── eventId: string
                    ├── userId: string
                    ├── userEmail: string
                    ├── userName: string
                    ├── userPhone?: string
                    ├── userRollNumber?: string
                    ├── userDepartment?: string
                    ├── userYear?: string
                    ├── registrationDate: timestamp
                    ├── status: 'pending' | 'confirmed' | 'cancelled'
                    ├── additionalInfo?: string
                    ├── eventName?: string
                    ├── eventDate?: string
                    ├── eventLocation?: string
                    ├── registrationFee?: number
                    ├── paymentStatus?: 'pending' | 'paid' | 'refunded'
                    ├── paymentId?: string
                    ├── checkInTime?: timestamp
                    └── checkInStatus?: 'not_checked_in' | 'checked_in'
```

### Components
- **EventRegistrationModal**: Main registration interface
- **EventRegistrationStats**: Organizer dashboard
- **EventDetail**: Updated with registration integration

## 🚀 Usage

### User Registration Flow

1. **Navigate to Event**: User clicks on an upcoming event
2. **View Event Details**: See complete event information
3. **Click Register**: Opens registration modal with pre-filled data
4. **Review Information**: User can add additional information
5. **Confirm Registration**: Submit registration to Firebase
6. **Real-time Updates**: Status updates across all devices

### Organizer Management

1. **Access Statistics**: Event managers see registration dashboard
2. **View Registrations**: Complete list of all registrations
3. **Manage Status**: Approve, reject, or cancel registrations
4. **Check-in Users**: Mark attendees as checked-in
5. **Track Payments**: Monitor payment status for paid events

## 🔧 API Reference

### EventRegistrationService

#### `registerForEvent(eventId, user, eventDetails, additionalInfo?)`
Registers a user for an event with pre-filled data.

```typescript
const registrationId = await eventRegistrationService.registerForEvent(
  'ev101',
  user,
  {
    name: 'Tech Symposium',
    date: '2024-10-26',
    location: 'Main Auditorium',
    registrationFee: 0
  },
  'Special dietary requirements'
);
```

#### `isUserRegistered(eventId, userId)`
Checks if user is already registered for an event.

```typescript
const isRegistered = await eventRegistrationService.isUserRegistered('ev101', 'user123');
```

#### `getUserRegistrations(userId)`
Gets all registrations for a specific user.

```typescript
const registrations = await eventRegistrationService.getUserRegistrations('user123');
```

#### `getEventRegistrations(eventId)`
Gets all registrations for a specific event.

```typescript
const registrations = await eventRegistrationService.getEventRegistrations('ev101');
```

#### `getEventRegistrationStats(eventId)`
Gets registration statistics for an event.

```typescript
const stats = await eventRegistrationService.getEventRegistrationStats('ev101');
// Returns: { totalRegistrations, confirmedRegistrations, pendingRegistrations, ... }
```

#### `updateRegistrationStatus(registrationId, status)`
Updates the status of a registration.

```typescript
await eventRegistrationService.updateRegistrationStatus('reg123', 'confirmed');
```

#### `checkInUser(registrationId)`
Marks a user as checked-in for an event.

```typescript
await eventRegistrationService.checkInUser('reg123');
```

## 🔒 Security Rules

The Firestore security rules ensure proper access control:

```javascript
// Users can read/write their own registrations
match /eventRegistrations/{registrationId} {
  allow read, write: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  
  // Event managers can read all registrations for their events
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'contributor'];
}
```

## 📱 Real-time Features

### Live Updates
- Registration status changes appear instantly
- Statistics update in real-time
- Multiple users can see updates simultaneously

### Offline Support
- Firebase handles offline scenarios gracefully
- Data syncs when connection is restored
- No data loss during network issues

## 🎨 UI Components

### EventRegistrationModal
- **Pre-filled Forms**: User data automatically populated
- **Validation**: Required fields and format validation
- **Status Display**: Shows current registration status
- **Action Buttons**: Register, cancel, view details

### EventRegistrationStats
- **Statistics Cards**: Visual representation of registration metrics
- **Registration Table**: Detailed list of all registrations
- **Action Controls**: Approve, reject, check-in users
- **Real-time Updates**: Statistics update automatically

## 🔄 Integration Points

### App.tsx
- Handles registration state management
- Loads user registrations on login
- Provides registration update callbacks

### EventDetail.tsx
- Displays registration status
- Opens registration modal
- Shows organizer statistics

### Real-time Data Service
- Syncs registration data across devices
- Updates UI when registrations change
- Maintains data consistency

## 🚨 Error Handling

### Common Scenarios
- **Network Issues**: Graceful fallback to cached data
- **Permission Errors**: Clear error messages for unauthorized access
- **Validation Errors**: Field-specific error messages
- **Duplicate Registrations**: Prevents multiple registrations

### Error Recovery
- Automatic retry for transient errors
- User-friendly error messages
- Fallback to mock data if needed

## 📊 Analytics & Monitoring

### Registration Metrics
- Total registrations per event
- Registration status distribution
- Check-in rates
- Payment completion rates

### User Behavior
- Registration completion rates
- Drop-off points in registration flow
- Popular events and categories

## 🔮 Future Enhancements

### Planned Features
- **QR Code Generation**: For event check-in
- **Email Notifications**: Registration confirmations and updates
- **Payment Integration**: Stripe/PayPal integration for paid events
- **Waitlist Management**: Handle event capacity limits
- **Bulk Operations**: Mass approve/reject registrations
- **Export Functionality**: Download registration data as CSV/Excel

### Advanced Features
- **Event Capacity Management**: Set and enforce registration limits
- **Custom Registration Fields**: Additional fields per event
- **Group Registrations**: Register multiple people at once
- **Event Reminders**: Automated reminder emails
- **Feedback Collection**: Post-event feedback forms

## 🛠️ Development

### Testing
- Unit tests for registration service
- Integration tests for Firebase operations
- UI tests for registration flow
- Performance tests for large datasets

### Deployment
- Firebase Functions for server-side logic
- Firestore for data storage
- Real-time listeners for live updates
- CDN for static assets

## 📞 Support

For issues or questions about the Event Registration System:
1. Check the console for error messages
2. Verify Firebase permissions
3. Ensure user authentication
4. Check network connectivity

The system is designed to be robust, user-friendly, and scalable for any number of events and registrations.
