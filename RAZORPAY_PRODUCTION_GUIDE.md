# Razorpay Production Management Guide

## 🚀 Pre-Deployment Checklist

### 1. Razorpay Account Setup
- [ ] Complete KYC verification in Razorpay Dashboard
- [ ] Switch from Test Mode to Live Mode
- [ ] Generate Live API Keys (Key ID & Key Secret)
- [ ] Set up webhook endpoints for payment callbacks
- [ ] Configure allowed domains for payment forms

### 2. Environment Configuration
```bash
# Set production Razorpay credentials
firebase functions:config:set razorpay.key_id="rzp_live_YOUR_ACTUAL_KEY_ID"
firebase functions:config:set razorpay.key_secret="YOUR_ACTUAL_KEY_SECRET"

# Deploy with production config
firebase deploy --only functions
```

### 3. Frontend Configuration
Update `frontend/firebaseConfig.tsx` with live Razorpay Key ID:
```typescript
export const RAZORPAY_KEY_ID = 'rzp_live_YOUR_ACTUAL_KEY_ID';
```

## 💳 Payment Flow Management

### 1. Order Creation
- **Endpoint**: `createRazorpayOrder`
- **Purpose**: Creates payment orders for events
- **Security**: Validates user authentication and event details
- **Sub-merchant Support**: Routes payments to club accounts

### 2. Payment Verification
- **Endpoint**: `getRazorpayPaymentStatus`
- **Purpose**: Verifies payment completion
- **Security**: Server-side signature verification
- **Database**: Updates payment status in Firestore

### 3. Webhook Handling
- **Endpoint**: `handleRazorpayCallback`
- **Purpose**: Processes Razorpay webhooks
- **Security**: Validates webhook signatures
- **Actions**: Updates payment status, sends notifications

## 🏢 Sub-merchant Management

### 1. Creating Sub-merchants
- **Endpoint**: `createRazorpaySubMerchant`
- **Purpose**: Creates linked accounts for clubs
- **KYC Required**: Yes, for real-time settlements
- **Data Storage**: Stores account ID in club payment details

### 2. Sub-merchant KYC Process
1. **Collect Documents**: PAN, Aadhaar, Bank details
2. **Submit to Razorpay**: Via API or Dashboard
3. **Monitor Status**: Check approval status regularly
4. **Update Club Settings**: Store approved account ID

### 3. Payment Routing
- **Approved Sub-merchants**: Direct payments to club accounts
- **Pending KYC**: Payments to main account with manual transfers
- **Failed KYC**: Payments to main account, manual processing

## 🔒 Security Best Practices

### 1. API Key Management
- **Never expose Key Secret** in frontend code
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** (every 90 days)
- **Monitor API usage** for suspicious activity

### 2. Webhook Security
- **Validate signatures** on all webhook calls
- **Use HTTPS only** for webhook endpoints
- **Implement rate limiting** to prevent abuse
- **Log all webhook events** for audit trails

### 3. Payment Security
- **Server-side validation** for all payment operations
- **Verify payment amounts** before processing
- **Implement idempotency** for duplicate requests
- **Use secure payment forms** with PCI compliance

## 📊 Monitoring & Analytics

### 1. Payment Monitoring
- **Success Rate**: Track payment completion rates
- **Failure Analysis**: Monitor failed payment reasons
- **Refund Tracking**: Keep track of refunds and disputes
- **Settlement Reports**: Monitor fund settlements

### 2. Error Handling
- **Payment Failures**: Log and notify administrators
- **Webhook Failures**: Implement retry mechanisms
- **API Errors**: Handle rate limits and service outages
- **Database Errors**: Ensure data consistency

### 3. Alerts Setup
- **High Failure Rates**: Alert when failure rate > 5%
- **Large Transactions**: Alert for transactions > ₹10,000
- **Suspicious Activity**: Alert for unusual patterns
- **System Errors**: Alert for critical failures

## 🛠️ Maintenance Tasks

### 1. Daily Tasks
- [ ] Check payment success rates
- [ ] Monitor webhook delivery
- [ ] Review error logs
- [ ] Verify settlement reports

### 2. Weekly Tasks
- [ ] Review sub-merchant KYC status
- [ ] Update payment configurations
- [ ] Check API usage limits
- [ ] Review security logs

### 3. Monthly Tasks
- [ ] Rotate API keys
- [ ] Update documentation
- [ ] Review compliance requirements
- [ ] Backup payment data

## 📋 Compliance & Legal

### 1. PCI DSS Compliance
- **Never store card details** in your database
- **Use Razorpay's secure forms** for payment collection
- **Implement proper access controls**
- **Regular security audits**

### 2. Data Protection
- **Encrypt sensitive data** in transit and at rest
- **Implement data retention policies**
- **Regular data purging** of old records
- **User consent management**

### 3. Financial Regulations
- **Maintain transaction records** for 7 years
- **Implement audit trails** for all operations
- **Regular compliance reviews**
- **Tax reporting requirements**

## 🚨 Emergency Procedures

### 1. Payment System Down
1. **Check Razorpay status page**
2. **Switch to maintenance mode**
3. **Notify users via app/website**
4. **Monitor for resolution**

### 2. Security Breach
1. **Immediately rotate API keys**
2. **Disable affected accounts**
3. **Notify Razorpay support**
4. **Review and patch vulnerabilities**

### 3. High Failure Rates
1. **Check Razorpay dashboard**
2. **Review recent changes**
3. **Contact Razorpay support**
4. **Implement temporary fixes**

## 📞 Support Contacts

### Razorpay Support
- **Email**: support@razorpay.com
- **Phone**: +91-80-4616-1600
- **Dashboard**: https://dashboard.razorpay.com
- **Documentation**: https://razorpay.com/docs

### Emergency Contacts
- **Technical Lead**: [Your Contact]
- **Finance Team**: [Finance Contact]
- **Legal Team**: [Legal Contact]

## 📈 Performance Optimization

### 1. Database Optimization
- **Index payment-related collections**
- **Implement data archiving**
- **Optimize query performance**
- **Regular cleanup of old data**

### 2. API Optimization
- **Implement caching** for frequently accessed data
- **Use connection pooling**
- **Optimize webhook processing**
- **Monitor response times**

### 3. User Experience
- **Fast payment processing**
- **Clear error messages**
- **Progress indicators**
- **Mobile optimization**

## 🔄 Backup & Recovery

### 1. Data Backup
- **Daily Firestore backups**
- **Payment data exports**
- **Configuration backups**
- **Code repository backups**

### 2. Disaster Recovery
- **Multi-region deployment**
- **Database replication**
- **Automated failover**
- **Recovery procedures**

## 📝 Documentation Updates

### 1. Keep Updated
- **API documentation**
- **Integration guides**
- **Troubleshooting guides**
- **Security procedures**

### 2. Version Control
- **Track all changes**
- **Maintain changelog**
- **Test before deployment**
- **Rollback procedures**

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Check Razorpay status
curl https://api.razorpay.com/v1/health

# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.captured"}'

# Monitor logs
firebase functions:log --only createRazorpayOrder
```

### Key URLs
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **API Documentation**: https://razorpay.com/docs
- **Webhook Testing**: https://webhook.site
- **Status Page**: https://status.razorpay.com

### Important Limits
- **API Rate Limit**: 100 requests/minute
- **Webhook Timeout**: 30 seconds
- **Payment Timeout**: 15 minutes
- **Refund Window**: 180 days

---

**Remember**: Always test in staging environment before deploying to production!
