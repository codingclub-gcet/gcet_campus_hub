# Campus Hub Application

A comprehensive campus management application for GCET with frontend and backend separation.

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Backend services and Firebase functions
├── package.json       # Root package.json for workspace management
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI

### Installation

1. Install dependencies for both frontend and backend:
   ```bash
   npm run install-all
   ```

2. Or install them separately:
   ```bash
   # Frontend dependencies
   npm run install-frontend
   
   # Backend dependencies
   npm run install-backend
   ```

### Development

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Firebase Functions Deployment

```bash
npm run deploy-functions
```

## Features

- User authentication and registration
- Event management and registration
- Club management
- Payment integration with PhonePe
- Real-time notifications
- Admin dashboard

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Firebase Authentication
- Firestore Database
- Firebase Functions
- PhonePe Payment Gateway

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
