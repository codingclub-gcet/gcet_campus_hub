# Guest Data Cleanup System

## Overview
This system automatically manages guest user data with a 3-month expiration policy. Guest data is automatically marked for cleanup and can be removed using the provided cleanup script.

## How It Works

### 1. Data Expiration
- **Guest Registrations**: Include an `expiresAt` timestamp set to 3 months from creation
- **Guest Notifications**: Include an `expiresAt` timestamp set to 3 months from creation
- **Automatic Marking**: All guest data is automatically marked with expiration when created

### 2. Data Structure
```typescript
interface EventRegistration {
  // ... other fields
  isGuest?: boolean;
  guestCollege?: string;
  expiresAt?: Date; // 3 months from creation
}
```

### 3. Cleanup Process
The cleanup script removes:
- Guest registrations older than 3 months
- Guest notifications older than 3 months
- Only data marked with `isGuest: true`

## Setup Instructions

### 1. Install Dependencies
```bash
# Copy the cleanup script and package.json
cp cleanup-guest-data.js /path/to/your/cleanup/directory/
cp cleanup-package.json /path/to/your/cleanup/directory/package.json

# Install dependencies
cd /path/to/your/cleanup/directory/
npm install
```

### 2. Configure Firebase Admin
```bash
# Set up Firebase Admin credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

# Or use Firebase CLI authentication
firebase login
```

### 3. Run Cleanup
```bash
# Run the cleanup script
npm run cleanup

# Or run directly
node cleanup-guest-data.js
```

## Automated Cleanup Options

### Option 1: Cron Job (Recommended)
Add to your crontab to run daily at 2 AM:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/cleanup/directory && node cleanup-guest-data.js >> /var/log/guest-cleanup.log 2>&1
```

### Option 2: Systemd Timer (Linux)
Create a systemd service and timer for more robust scheduling.

### Option 3: Cloud Scheduler (Google Cloud)
Use Google Cloud Scheduler to trigger the cleanup script.

## Monitoring

### Log Files
The cleanup script provides detailed logging:
- ✅ Successful deletions
- 📋 Number of expired records found
- ❌ Error messages
- 📅 Cleanup timestamp

### Example Output
```
🧹 Starting cleanup of expired guest data...
📋 Checking for expired guest registrations...
📋 Found 15 expired guest registrations to delete
✅ Deleted 15 expired guest registrations
🔔 Checking for expired guest notifications...
🔔 No expired guest notifications found
🎉 Cleanup completed! Total documents deleted: 15
📅 Cleaned up data older than: 2024-07-17T21:47:00.000Z
✅ Cleanup script completed successfully
```

## Security Considerations

### Data Privacy
- Only guest data is cleaned up (marked with `isGuest: true`)
- Regular user data is never affected
- Expiration is set at creation time, not retroactively

### Access Control
- Cleanup script requires Firebase Admin credentials
- Only runs on data marked as guest data
- No access to regular user registrations

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Ensure Firebase Admin credentials are set
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

2. **No Data Found**
   - Check if guest data exists with `isGuest: true`
   - Verify expiration timestamps are set correctly
   - Ensure the script is running in the correct timezone

3. **Firebase Connection Issues**
   ```bash
   # Test Firebase connection
   firebase projects:list
   ```

### Debug Mode
Add `--dry-run` flag to see what would be deleted without actually deleting:
```bash
node cleanup-guest-data.js --dry-run
```

## Maintenance

### Regular Tasks
1. **Weekly**: Check cleanup logs for any errors
2. **Monthly**: Verify data is being cleaned up properly
3. **Quarterly**: Review and update cleanup policies if needed

### Monitoring
- Set up alerts for cleanup failures
- Monitor disk space usage
- Track cleanup statistics

## Data Retention Policy

### Current Policy
- **Guest Data**: 3 months from creation
- **Regular User Data**: No automatic expiration
- **Admin Data**: No automatic expiration

### Policy Changes
To change the expiration period:
1. Update the frontend registration service
2. Update the cleanup script
3. Deploy changes
4. Run cleanup to remove old data

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify Firebase Admin credentials
3. Test with a small dataset first
4. Contact the development team

---

**Note**: This cleanup system ensures GDPR compliance by automatically removing guest data after a reasonable retention period while maintaining data integrity for regular users.

