# 🚀 Quick Start Guide - Cooking with Chris

## Get Started in 5 Minutes!

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

---

## 1️⃣ Clone and Set Up

```bash
# Clone your repository (once you've pushed it)
git clone https://github.com/yourusername/cooking-with-chris-claude-ai.git
cd cooking-with-chris-claude-ai
```

---

## 2️⃣ Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb cooking_with_chris

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Email: admin@example.com
# Password: (choose a password)

# Create a test user
python manage.py shell
```

In the shell:
```python
from apps.users.models import User
User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User'
)
exit()
```

```bash
# Start backend server
python manage.py runserver
# Backend now running at http://localhost:8000
```

---

## 3️⃣ Test Backend API

**Open new terminal** and test the API:

```bash
# Test login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Should return:
# {
#   "access": "eyJ0eXAi...",
#   "refresh": "eyJ0eXAi...",
#   "user": {
#     "id": 2,
#     "email": "test@example.com",
#     "first_name": "Test",
#     "last_name": "User",
#     ...
#   }
# }

# Test getting recipes (empty at first)
curl http://localhost:8000/api/v1/recipes/

# Should return:
# {
#   "count": 0,
#   "next": null,
#   "previous": null,
#   "results": []
# }
```

✅ **Backend is working!**

---

## 4️⃣ Frontend Setup (3 minutes)

```bash
# Open NEW terminal
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# No need to edit - defaults are correct for local dev

# Start development server
npm run dev
# Frontend now running at http://localhost:5173
```

---

## 5️⃣ Access the Application

### Django Admin Interface
1. Open http://localhost:8000/admin
2. Login with superuser credentials
3. You can create recipes manually here

### API Documentation
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

### React Frontend
- Frontend: http://localhost:5173
- **Note**: Frontend components are not built yet - see PROJECT_SUMMARY.md

---

## 🎯 Create Your First Recipe (via Admin)

1. Go to http://localhost:8000/admin
2. Login with superuser
3. Click "Recipes" → "Add Recipe"
4. Fill in:
   - Recipe Name: "Test Pasta"
   - Description: "A simple test recipe"
   - User: Select your test user
   - Course Type: Dinner
   - Recipe Type: Entrée
   - Primary Protein: Vegetarian / None
   - Ethnic Style: Italian
   - Prep Time: 10
   - Cook Time: 20
   - Number Servings: 4
5. Save
6. Add Ingredient Section:
   - Click "Add another Ingredient Section"
   - Section Title: "Main Ingredients"
   - Section Order: 1
   - Save
7. Add Ingredients to Section:
   - Click on the section
   - Add ingredients with quantity, UOM, name
8. Add Instruction Section (same process)
9. Add Instructions

---

## 🧪 Test API with Your Recipe

```bash
# Get all recipes (should see your test recipe)
curl http://localhost:8000/api/v1/recipes/

# Get recipe detail (replace 1 with your recipe ID)
curl http://localhost:8000/api/v1/recipes/1/

# Search for recipe
curl "http://localhost:8000/api/v1/recipes/?search=pasta"

# Filter by course
curl "http://localhost:8000/api/v1/recipes/?course_type=Dinner"
```

---

## 📝 Next Steps

Now that your backend is running, you can:

1. **Build the Frontend** (see PROJECT_SUMMARY.md for detailed guide)
2. **Create More Test Data** (via admin or API)
3. **Set Up Cloudinary** (for image uploads)
4. **Set Up SendGrid** (for password reset emails)
5. **Write Tests** (pytest is configured)

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Make sure PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep cooking_with_chris

# If not, create it:
createdb cooking_with_chris
```

### Port Already in Use
```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Migration Issues
```bash
# Reset migrations (DANGER: deletes all data)
python manage.py migrate recipes zero
python manage.py migrate users zero
python manage.py migrate

# Or drop and recreate database
dropdb cooking_with_chris
createdb cooking_with_chris
python manage.py migrate
```

### Python Package Issues
```bash
# Upgrade pip
pip install --upgrade pip

# Clear cache and reinstall
pip cache purge
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Useful Commands

### Backend
```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Run tests
pytest

# Run server
python manage.py runserver
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🎉 You're All Set!

Your development environment is ready. The backend API is fully functional.

**Current Status:**
- ✅ Backend API running
- ✅ Database configured
- ✅ Authentication working
- ✅ Recipe CRUD endpoints ready
- ⏳ Frontend components need to be built

See **PROJECT_SUMMARY.md** for detailed information on:
- What's been built
- What needs to be built
- How to build it
- Code examples

Happy coding! 🚀
