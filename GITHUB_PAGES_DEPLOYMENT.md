# GitHub Pages Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Set up Environment Variables
Create `frontend/.env.local` file:
```bash
cd frontend
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key
EOF
```

### 2. Set up GitHub Repository
1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to repository Settings > Pages
4. Set source to "Deploy from a branch"
5. Select "gh-pages" branch as source

### 3. Deploy to GitHub Pages
```bash
cd frontend
npm run deploy
```

### 4. Access Your Site
Your site will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 🔧 Configuration Files

### Package.json Scripts
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Manual Deployment Process
- **Build**: `npm run build` creates optimized production build
- **Deploy**: `gh-pages -d dist` pushes build to gh-pages branch
- **Hosting**: GitHub Pages serves from gh-pages branch

## 🌐 Access Your Site
After deployment, your site will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 🔒 Security Notes
- Environment variables are stored in local `.env.local` file
- `.env.local` is ignored by git (not committed)
- No sensitive data in the repository
- Build process uses local environment variables

## 📋 Pre-Deployment Checklist
- [ ] Create `.env.local` with your Firebase credentials
- [ ] Test build locally: `npm run build`
- [ ] Push your code to GitHub repository
- [ ] Set up GitHub Pages to use gh-pages branch
- [ ] Run `npm run deploy` to deploy

## 🛠️ Troubleshooting

### Build Fails
- Check environment variables are set correctly in `.env.local`
- Verify all dependencies are installed: `npm install`
- Check build logs: `npm run build`

### Site Not Loading
- Verify homepage URL is correct in package.json
- Check if GitHub Pages is enabled and using gh-pages branch
- Wait a few minutes for deployment to complete
- Check if gh-pages branch was created: `git branch -a`

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Check `.env.local` file exists and has correct values
- Verify variable names match exactly
- Restart development server after changing .env.local

## 🎯 Production Ready!
Your React app is now configured for GitHub Pages deployment with:
- ✅ Manual deployment with `npm run deploy`
- ✅ Environment variable security (local .env.local)
- ✅ Production build optimization
- ✅ GitHub Pages hosting from gh-pages branch
