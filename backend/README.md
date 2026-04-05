# CareerCompass AI - Backend

NestJS backend API for the CareerCompass AI platform with Prisma ORM, JWT authentication, and WebRTC signaling.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp config.env.example .env
   # Edit .env with your database and API keys
   ```

3. **Setup database**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

## 📁 Project Structure

```
src/
├── auth/              # Authentication module
│   ├── guards/        # JWT and role guards
│   ├── decorators/    # Custom decorators
│   ├── strategies/    # Passport strategies
│   └── dto/          # Data transfer objects
├── users/            # User management
├── profiles/         # Profile management
├── ai/               # Gemini AI integration
├── mentorship/       # Mentorship & WebRTC
├── admin/            # Admin functionality
├── prisma/           # Database service
└── main.ts           # Application entry point
```

## 🔧 Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## 🔑 Environment Variables

```env
DATABASE_URL="mssql://localhost:1433/CareerCompass?user=sa&password=YourPassword&encrypt=true&trustServerCertificate=true"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:4200"
```

## 📊 Database Schema

The application uses the following main entities:

- **User**: Authentication and basic user info
- **Profile**: Extended user profile information
- **Session**: Mentorship sessions with WebRTC room IDs
- **Recommendation**: AI-generated career recommendations
- **Resource**: Mentor-shared resources

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/mentors` - Get mentors
- `GET /api/users/students` - Get students (Mentor/Admin)

### Profiles
- `GET /api/profile/me` - Get user profile
- `PUT /api/profile/update` - Update profile

### AI
- `POST /api/ai/recommend-career` - Get career recommendations
- `POST /api/ai/learning-path` - Get learning roadmap
- `POST /api/ai/chat` - Chat with AI

### Mentorship
- `POST /api/mentorship/schedule` - Schedule session
- `GET /api/mentorship/sessions` - Get user sessions
- `POST /api/mentorship/sessions/:id/join` - Join session
- `PUT /api/mentorship/sessions/:id/end` - End session

### WebSocket Events
- `join-room` - Join WebRTC room
- `leave-room` - Leave WebRTC room
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `webrtc-ice-candidate` - Send ICE candidate
- `chat-message` - Send chat message

## 🔒 Security

- JWT-based authentication
- Role-based access control (Admin, Mentor, Student)
- Input validation with class-validator
- CORS protection
- Password hashing with bcrypt

## 🤖 AI Integration

Google Gemini API integration for:
- Career recommendations based on user profile
- Learning path generation
- Real-time chat assistance

## 📡 WebRTC Signaling

Socket.io-based signaling server for WebRTC video calls:
- Room management
- Offer/Answer exchange
- ICE candidate handling
- Real-time chat during sessions

## 🧪 Testing

```bash
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
```

## 🚀 Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start production server
   ```bash
   npm run start:prod
   ```

## 📝 API Documentation

The API follows RESTful conventions with comprehensive error handling and validation. All endpoints require authentication except registration and login.

### Authentication Headers
```
Authorization: Bearer <jwt-token>
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

