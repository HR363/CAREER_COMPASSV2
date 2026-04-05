# CareerCompass AI - Frontend

Angular 17 frontend application for the CareerCompass AI platform with TailwindCSS styling and WebRTC video calls.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open browser**
   Navigate to `http://localhost:4200`

## 📁 Project Structure

```
src/
├── app/
│   ├── core/              # Core services and guards
│   │   ├── services/      # HTTP and WebSocket services
│   │   ├── guards/        # Route guards
│   │   └── interceptors/  # HTTP interceptors
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # User dashboard
│   │   ├── chat/          # AI chat interface
│   │   ├── mentorship/    # Video calls and scheduling
│   │   ├── profile/       # Profile management
│   │   └── admin/         # Admin panel
│   └── app.routes.ts      # Main routing configuration
├── environments/          # Environment configurations
└── styles.scss           # Global styles with TailwindCSS
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests
- `npm run lint` - Run linter

## 🎨 Styling

The application uses TailwindCSS for styling with custom components:

- **Cards**: `.card` - Standard card component
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Forms**: `.input-field`, `.form-label`, `.form-group`
- **Animations**: `.fade-in`, `.slide-up`, `.spinner`

## 🔐 Authentication

### Auth Service
- JWT token management
- User state management
- Role-based access control
- Automatic token refresh

### Route Guards
- `AuthGuard` - Protects authenticated routes
- `RoleGuard` - Enforces role-based access

## 🎯 Features

### Dashboard
- Role-based dashboard views
- Quick action cards
- Recent activity display
- User statistics

### AI Chat
- Real-time chat with Gemini AI
- Message history
- Contextual responses
- Loading states

### Video Calls
- WebRTC integration
- Screen sharing capabilities
- Chat during calls
- Session management

### Profile Management
- Comprehensive profile forms
- Career recommendations
- Skill and interest tracking
- Profile completion indicators

## 🌐 WebRTC Integration

### Video Call Component
- Camera and microphone controls
- Screen sharing
- Real-time chat
- Session recording (future)

### WebSocket Service
- Real-time communication
- WebRTC signaling
- Chat messaging
- Connection management

## 📱 Responsive Design

- Mobile-first approach
- Adaptive layouts
- Touch-friendly interfaces
- Progressive Web App ready

## 🔧 Configuration

### Environment Variables

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## 🎨 UI Components

### Core Components
- **Login/Register**: Authentication forms
- **Dashboard**: Role-based dashboard
- **Chat**: AI chat interface
- **Video Call**: WebRTC video component
- **Profile**: Profile management
- **Admin Panel**: Admin dashboard

### Shared Components
- Loading spinners
- Error messages
- Success notifications
- Form validations

## 🔄 State Management

- RxJS for reactive programming
- Service-based state management
- HTTP interceptors for auth
- WebSocket for real-time updates

## 🧪 Testing

```bash
npm test                    # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

## 🚀 Build and Deployment

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build --configuration=production
```

### Deployment Options
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop dist folder
- **AWS S3**: Upload dist folder
- **Azure Static Web Apps**: Connect repository

## 📱 Progressive Web App

The application is configured as a PWA with:
- Service worker for offline functionality
- App manifest for installation
- Responsive design for mobile
- Fast loading and caching

## 🔧 Development Tips

### Adding New Features
1. Create feature module in `src/app/features/`
2. Add routing configuration
3. Implement components and services
4. Add route guards if needed
5. Update navigation

### Styling Guidelines
- Use TailwindCSS utility classes
- Follow mobile-first approach
- Use custom component classes for consistency
- Maintain responsive design

### API Integration
- Use HTTP client service
- Implement error handling
- Add loading states
- Use interceptors for auth

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **WebRTC Issues**: Ensure HTTPS in production
3. **Authentication**: Verify JWT token handling
4. **Styling**: Check TailwindCSS configuration

### Debug Tools
- Angular DevTools browser extension
- Chrome DevTools
- Network tab for API calls
- Console for WebSocket messages

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

