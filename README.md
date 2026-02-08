# Cooking with Chris

A modern web application for managing and sharing recipes, built with React and Django.

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Hooks + Context API

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: PostgreSQL
- **Media Storage**: Cloudinary
- **Email**: SendGrid

### Deployment
- **Frontend**: Render (Static Site)
- **Backend**: Render (Web Service)
- **Database**: PostgreSQL on Render

## 📋 Features

- **Recipe Management**: Create, read, update, and delete recipes
- **Multi-step Recipe Creation**: 4-step guided recipe creation process
- **Advanced Search**: Search by recipe name or ingredients
- **Smart Filtering**: Filter by course type, protein, ethnic style, time needed, and more
- **Image Upload**: Cloudinary-powered image hosting with automatic optimization
- **User Authentication**: JWT-based secure authentication
- **Role-based Permissions**: Admin and regular user roles
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Soft Delete**: Recipes are archived, not permanently deleted

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cooking-with-chris-claude-ai.git
cd cooking-with-chris-claude-ai
```

2. **Set up Python virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Create PostgreSQL database**
```bash
createdb cooking_with_chris
```

6. **Run migrations**
```bash
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Load initial data (optional)**
```bash
python manage.py loaddata initial_data.json
```

9. **Run development server**
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env)
```
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_NAME=cooking_with_chris
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@cookingwithchris.com

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Cooking with Chris
```

## 📚 API Documentation

The API follows RESTful conventions and is versioned at `/api/v1/`.

### Authentication Endpoints
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/refresh/` - Refresh token
- `POST /api/v1/auth/logout/` - Logout
- `POST /api/v1/auth/password-reset/` - Request password reset
- `POST /api/v1/auth/password-reset-confirm/` - Confirm password reset

### Recipe Endpoints
- `GET /api/v1/recipes/` - List recipes (with filtering, search, pagination)
- `POST /api/v1/recipes/` - Create recipe (authenticated)
- `GET /api/v1/recipes/:id/` - Get recipe details
- `PUT /api/v1/recipes/:id/` - Update recipe (authenticated, owner or admin)
- `DELETE /api/v1/recipes/:id/` - Delete recipe (authenticated, owner or admin)

### User Endpoints
- `GET /api/v1/users/profile/` - Get current user profile
- `PUT /api/v1/users/profile/` - Update current user profile
- `DELETE /api/v1/users/profile/` - Delete current user account

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Deployment

### Render Deployment

1. **Create PostgreSQL database** on Render
2. **Deploy Backend**:
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `gunicorn config.wsgi:application`
   - Add environment variables
3. **Deploy Frontend**:
   - Create new Static Site
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL`

## 📖 Code Structure

### Backend Structure
```
backend/
├── config/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── recipes/         # Recipe app
│   ├── users/           # User management
│   └── authentication/  # JWT auth
├── manage.py
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Context providers
│   ├── utils/           # Utility functions
│   └── App.jsx
├── public/
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Chris** - Initial work

## 🙏 Acknowledgments

- Built with Claude AI assistance
- Designed with Tailwind CSS
- Icons from Heroicons
