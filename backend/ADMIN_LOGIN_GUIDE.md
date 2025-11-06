# Admin Login Guide

## ✅ Updated to Use Constants Data

Your app now uses all the data from `constants.ts` instead of hardcoded mock data.

## 🔑 Admin Login Credentials

To test admin login, use these credentials:

**Email:** `admin@gmail.com`  
**Password:** Any password (mock authentication)

## 👥 Available Users

### Admin User
- **Name:** Dev Admin
- **Email:** admin@gmail.com
- **Role:** admin
- **Access:** Full administrator dashboard

### Contributor Users
- **Pavan Bejawada** (pavan@gmail.com) - Manages Coding & AI/ML clubs
- **Paramesh K** (paramesh.k@college.edu) - Manages Robotics club  
- **Nithin Kumar** (nithin.k@college.edu) - Manages Cultural club

### Student Users
- **Sankeerth Reddy** (sankeerth.r@college.edu)
- **Panda Sai** (panda.s@college.edu)
- **Puneeth Varma** (puneeth.v@college.edu)
- **Pavan Kumar** (pavan_stu@gmail.com)

## 🎯 What You Can Test

### Admin Dashboard Features:
1. **User Management** - Assign/revoke contributor roles
2. **Analytics** - View system statistics
3. **Club Management** - Manage club assignments

### Regular User Features:
1. **Event Registration** - Register for events
2. **Club Applications** - Apply to join clubs
3. **Profile Management** - Update personal information

## 🚀 How to Test

1. **Start the app:** `npm run dev`
2. **Login as admin:** Use `admin@gmail.com` with any password
3. **Explore admin features:** Check the administrator dashboard
4. **Test other users:** Try logging in with other user emails

## 📊 Available Data

Your app now has access to:
- **8 Events** (including featured events)
- **6 Clubs** (Coding, AI/ML, Robotics, Cultural, Sports, Photography)
- **8 Users** (1 admin, 3 contributors, 4 students)
- **4 Leadership members**
- **3 Annual events** (Vibgyor, Bhaswara, etc.)
- **News articles, notifications, and applications**

All data is now properly integrated and ready for testing!
