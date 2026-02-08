# 🪟 Quick Start Guide - Windows with Git Bash

## Complete Setup for Cooking with Chris on Windows

This guide is specifically for **Windows users using Git Bash** with **PostgreSQL 18.1**.

---

## ✅ Prerequisites Check

Before starting, verify you have:
- ✅ PostgreSQL 18.1 installed (you have this)
- ✅ Git Bash installed
- ✅ Python 3.11+ installed
- ✅ Node.js 18+ installed (for frontend later)

---

## 📋 PART 1: PostgreSQL Database Setup

### Step 1.1: Add PostgreSQL to Git Bash PATH

Open **Git Bash** and run:

```bash
# Add PostgreSQL to PATH for this session
export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"

# Verify psql is now accessible
psql --version
# Should output: psql (PostgreSQL) 18.1
```

**Make it permanent** (so you don't have to do this every time):

```bash
# Open your .bashrc file
nano ~/.bashrc

# Add this line at the end (use arrow keys to navigate, then add):
export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"

# Save and exit:
# Press Ctrl+X
# Press Y (for yes)
# Press Enter

# Reload your .bashrc
source ~/.bashrc

# Test again
psql --version
```

### Step 1.2: Connect to PostgreSQL

In Git Bash:

```bash
# Connect to PostgreSQL as the postgres user
psql -U postgres -d postgres

# When prompted for password, enter: Miles@123!HTX
# (Note: Password won't show as you type - this is normal)
```

**Expected output:**
```
psql (18.1)
WARNING: Console code page (437) differs from Windows code page (1252)
         8-bit characters might not work correctly. See psql reference
         page "Notes for Windows users" for details.
Type "help" for help.

postgres=#
```

### Step 1.3: Create the Database

You should now see the `postgres=#` prompt. Type:

```sql
CREATE DATABASE cooking_with_chris;
```

**Expected output:**
```
CREATE DATABASE
```

Verify it was created:

```sql
\l
```

You should see `cooking_with_chris` in the list.

Exit psql:

```sql
\q
```

### Step 1.4: Test Database Connection

Back in Git Bash:

```bash
# Try connecting to your new database
psql -U postgres -d cooking_with_chris

# Enter password: Miles@123!HTX
```

**Expected output:**
```
psql (18.1)
WARNING: Console code page (437) differs from Windows code page (1252)
         8-bit characters might not work correctly. See psql reference
         page "Notes for Windows users" for details.
Type "help" for help.

cooking_with_chris=#
```

If you see `cooking_with_chris=#`, **SUCCESS!** ✅

Exit:

```sql
\q
```

---

## 📋 PART 2: Project Setup

### Step 2.1: Navigate to Your Project

```bash
# Navigate to where you extracted the project
# Example (adjust to your actual path):
cd ~/Desktop/cooking-with-chris

# Or if it's in your Downloads:
cd ~/Downloads/cooking-with-chris

# Verify you're in the right place
ls
# Should show: backend  frontend  README.md  PROJECT_SUMMARY.md  etc.
```

### Step 2.2: Navigate to Backend

```bash
cd backend

# Verify you're in backend
ls
# Should show: apps  config  manage.py  requirements.txt  .env.example
```

---

## 📋 PART 3: Create .env File (DETAILED)

### Step 3.1: Copy the Example File

```bash
# Copy .env.example to .env
cp .env.example .env

# Verify the file was created
ls -la | grep .env
# Should show both .env.example and .env
```

### Step 3.2: Edit the .env File

**Option A: Using Notepad (Easiest)**

```bash
# Open .env in Notepad
notepad .env
```

**Option B: Using Nano (in Git Bash)**

```bash
# Open .env in nano
nano .env
```

**Option C: Using VS Code (if installed)**

```bash
# Open .env in VS Code
code .env
```

### Step 3.3: Update .env with YOUR Database Credentials

When the file opens, you'll see this template:

```env
# Django Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_NAME=cooking_with_chris
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password-here
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@cookingwithchris.com

# JWT Configuration (minutes for access, minutes for refresh)
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**CHANGE IT TO THIS** (using your actual credentials):

```env
# Django Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_NAME=cooking_with_chris
DATABASE_USER=postgres
DATABASE_PASSWORD=Miles@123!HTX
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Cloudinary Configuration (leave empty for now - we'll set this up later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SendGrid Configuration (leave empty for now - we'll set this up later)
SENDGRID_API_KEY=
DEFAULT_FROM_EMAIL=noreply@cookingwithchris.com

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**KEY CHANGES YOU MADE:**
- Line 9: `DATABASE_PASSWORD=Miles@123!HTX` (your actual password)
- Lines 14-16: Left empty (we'll add Cloudinary later when needed)
- Line 19: Left empty (we'll add SendGrid later when needed)

### Step 3.4: Save the .env File

**If using Notepad:**
- Click File → Save
- Close Notepad

**If using Nano:**
- Press `Ctrl+X`
- Press `Y` (for yes)
- Press `Enter`

**If using VS Code:**
- Press `Ctrl+S` (save)
- Close the file

### Step 3.5: Verify .env File

Back in Git Bash:

```bash
# Display your .env file to verify it's correct
cat .env
```

**You should see your password** (`Miles@123!HTX`) in the `DATABASE_PASSWORD` line.

**IMPORTANT:** Your .env file contains sensitive information (your password). This file is already in `.gitignore` so it won't be committed to Git. **Never share this file publicly!**

---

## 📋 PART 4: Python Virtual Environment Setup

### Step 4.1: Create Virtual Environment

In Git Bash (still in the `backend` directory):

```bash
# Create virtual environment
python -m venv venv

# This creates a folder called 'venv'
# Verify it exists
ls
# You should see a 'venv' folder now
```

### Step 4.2: Activate Virtual Environment

**IMPORTANT:** On Windows Git Bash, the activation command is different:

```bash
# Activate virtual environment (Windows Git Bash)
source venv/Scripts/activate

# You should now see (venv) at the start of your prompt:
# (venv) user@computer MINGW64 ~/cooking-with-chris/backend
```

**If you see `(venv)` at the start of your command prompt, SUCCESS!** ✅

### Step 4.3: Upgrade pip

```bash
# Upgrade pip to latest version
python -m pip install --upgrade pip
```

---

## 📋 PART 5: Install Python Dependencies

### Step 5.1: Install All Required Packages

```bash
# Make sure you're in backend directory with (venv) active
# Install all dependencies from requirements.txt
pip install -r requirements.txt
```

This will take 2-3 minutes. You'll see packages being downloaded and installed.

**Expected output (partial):**
```
Collecting Django==5.0.1
  Downloading Django-5.0.1-py3-none-any.whl
Collecting djangorestframework==3.14.0
  Downloading djangorestframework-3.14.0-py3-none-any.whl
...
Successfully installed Django-5.0.1 djangorestframework-3.14.0 ...
```

### Step 5.2: Verify Installation

```bash
# Check Django version
python -m django --version
# Should output: 5.0.1
```

---

## 📋 PART 6: Database Migrations

### Step 6.1: Create Migration Files

```bash
# Generate migration files
python manage.py makemigrations

# Expected output:
# Migrations for 'users':
#   apps/users/migrations/0001_initial.py
#     - Create model User
#     - Create model PasswordResetToken
# Migrations for 'recipes':
#   apps/recipes/migrations/0001_initial.py
#     - Create model Recipe
#     - Create model IngredientSection
#     - Create model Ingredient
#     - Create model InstructionSection
#     - Create model Instruction
```

**If you see migration files created, SUCCESS!** ✅

### Step 6.2: Apply Migrations to Database

```bash
# Apply all migrations to the database
python manage.py migrate
```

**Expected output:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, recipes, sessions, users, token_blacklist
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  ...
  Applying users.0001_initial... OK
  Applying recipes.0001_initial... OK
  Applying token_blacklist.0001_initial... OK
  ...
```

**If all migrations say "OK", SUCCESS!** ✅

### Step 6.3: Verify Database Tables

```bash
# Connect to database
psql -U postgres -d cooking_with_chris

# Enter password: Miles@123!HTX
```

In psql, list all tables:

```sql
\dt
```

**You should see tables like:**
```
              List of relations
 Schema |         Name          | Type  | Owner
--------+-----------------------+-------+----------
 public | auth_group            | table | postgres
 public | auth_permission       | table | postgres
 public | recipes               | table | postgres
 public | users                 | table | postgres
 public | ingredient_sections   | table | postgres
 public | ingredients           | table | postgres
 public | instruction_sections  | table | postgres
 public | instructions          | table | postgres
 ...
```

Exit psql:

```sql
\q
```

---

## 📋 PART 7: Create Superuser

### Step 7.1: Create Admin Account

Back in Git Bash (with venv active):

```bash
# Create superuser (admin account)
python manage.py createsuperuser
```

You'll be prompted:

```
Email address: admin@example.com
First name: Chris
Last name: Admin
Password: (enter a password - it won't show as you type)
Password (again): (enter same password)
```

**Example:**
- Email: `admin@example.com`
- First name: `Chris`
- Last name: `Admin`
- Password: `admin123!` (remember this!)

**Expected output:**
```
Superuser created successfully.
```

### Step 7.2: Create Test User

```bash
# Open Django shell
python manage.py shell
```

In the Python shell, type:

```python
from apps.users.models import User

# Create test user
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User'
)

print(f"Created user: {user.email}")

# Exit shell
exit()
```

**Expected output:**
```
Created user: test@example.com
```

---

## 📋 PART 8: Start the Backend Server

### Step 8.1: Run Development Server

```bash
# Start Django development server
python manage.py runserver
```

**Expected output:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
February 08, 2026 - 15:30:00
Django version 5.0.1, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**If you see "Starting development server at http://127.0.0.1:8000/", SUCCESS!** ✅

**DO NOT close this Git Bash window** - the server is running here.

---

## 📋 PART 9: Test the Backend

### Step 9.1: Open Another Git Bash Window

Open a **NEW Git Bash window** (keep the server running in the first one).

### Step 9.2: Test API Endpoints

```bash
# Test 1: Get all recipes (should be empty)
curl http://localhost:8000/api/v1/recipes/

# Expected output:
# {"count":0,"next":null,"previous":null,"results":[]}
```

```bash
# Test 2: Login with test user
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"password\": \"testpass123\"}"

# Expected output (long tokens):
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "user": {
#     "id": 2,
#     "email": "test@example.com",
#     "first_name": "Test",
#     "last_name": "User",
#     ...
#   }
# }
```

**If you see JSON responses, SUCCESS!** ✅

### Step 9.3: Access Django Admin

1. Open your browser
2. Go to: http://localhost:8000/admin
3. Login with:
   - Email: `admin@example.com`
   - Password: (the password you set in Step 7.1)

**If you see the Django admin interface, SUCCESS!** ✅

---

## 📋 PART 10: API Documentation

Open your browser and visit:

**Swagger UI (Interactive API Docs):**
- http://localhost:8000/api/docs/

**ReDoc (Alternative Documentation):**
- http://localhost:8000/api/redoc/

You can test all API endpoints directly from the Swagger UI!

---

## 🎯 Summary: What You've Accomplished

✅ Installed and configured PostgreSQL  
✅ Created `cooking_with_chris` database  
✅ Created and configured `.env` file with your credentials  
✅ Set up Python virtual environment  
✅ Installed all Python dependencies  
✅ Created database tables via migrations  
✅ Created admin user and test user  
✅ Started Django development server  
✅ Tested API endpoints  
✅ Accessed Django admin interface  

**Your backend is now fully functional!** 🎉

---

## 🔄 Daily Development Workflow

**Every time you want to work on the project:**

```bash
# 1. Open Git Bash
# 2. Navigate to backend
cd ~/path/to/cooking-with-chris/backend

# 3. Activate virtual environment
source venv/Scripts/activate

# 4. Start server
python manage.py runserver

# Server is now running at http://localhost:8000
```

**To stop the server:**
- Press `Ctrl+C` in the Git Bash window

---

## 🐛 Troubleshooting

### Issue: "psql: command not found"

**Fix:**
```bash
# Add to PATH (do this every time you open Git Bash)
export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"

# OR add to ~/.bashrc to make it permanent (see Step 1.1)
```

### Issue: "password authentication failed"

**Fix:**
- Double-check your password in `.env`: `Miles@123!HTX`
- Make sure there are no extra spaces
- The password is case-sensitive

### Issue: "database 'cooking_with_chris' does not exist"

**Fix:**
```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Create database
CREATE DATABASE cooking_with_chris;

# Exit
\q
```

### Issue: "unable to open database file"

**Fix:**
- Make sure PostgreSQL service is running
- In Windows Services, look for "postgresql-x64-18"
- If not running, start it

### Issue: Virtual environment not activating

**Fix:**
```bash
# On Windows Git Bash, use:
source venv/Scripts/activate

# NOT: source venv/bin/activate (that's for Mac/Linux)
```

### Issue: "Module not found" errors

**Fix:**
```bash
# Make sure virtual environment is active (should see (venv))
# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Port 8000 already in use

**Fix:**
```bash
# Stop any existing Django servers
# Or use a different port:
python manage.py runserver 8001
```

---

## 📁 Project Structure

```
cooking-with-chris/
├── backend/
│   ├── apps/
│   │   ├── users/          # User management
│   │   ├── recipes/        # Recipe CRUD
│   │   └── authentication/ # JWT auth
│   ├── config/
│   │   └── settings.py     # Django settings
│   ├── venv/               # Virtual environment (DO NOT COMMIT)
│   ├── .env                # Your secrets (DO NOT COMMIT)
│   ├── .env.example        # Template
│   ├── manage.py           # Django CLI
│   └── requirements.txt    # Python packages
│
├── frontend/               # React app (to be built)
├── README.md
├── PROJECT_SUMMARY.md
└── QUICK_START.md
```

---

## 📚 Next Steps

1. ✅ **Backend is running** - You're here now!
2. ⏳ **Build React Frontend** - See PROJECT_SUMMARY.md
3. ⏳ **Set up Cloudinary** - For image uploads
4. ⏳ **Set up SendGrid** - For password reset emails
5. ⏳ **Deploy to Production** - When ready

---

## 💡 Pro Tips

**Tip 1: Keep the server running**
- Don't close the Git Bash window with the server
- Open new Git Bash windows for other commands

**Tip 2: Activate venv every time**
- Always activate virtual environment: `source venv/Scripts/activate`
- You should see `(venv)` at the start of your prompt

**Tip 3: Check your .env**
- If anything doesn't work, verify `.env` has correct password
- Run: `cat .env` to display contents

**Tip 4: Use Django admin**
- Create test recipes at http://localhost:8000/admin
- Much easier than API for initial testing

---

## ✅ Verification Checklist

Before moving forward, verify:

- [ ] PostgreSQL 18 is installed
- [ ] Database `cooking_with_chris` exists
- [ ] `.env` file has correct password (`Miles@123!HTX`)
- [ ] Virtual environment activates (shows `(venv)`)
- [ ] All packages installed (`pip list` shows many packages)
- [ ] Migrations applied (tables created in database)
- [ ] Superuser created (can login to admin)
- [ ] Test user created
- [ ] Server starts without errors
- [ ] Can access http://localhost:8000/admin
- [ ] Can access http://localhost:8000/api/docs/
- [ ] API returns JSON responses

---

**Congratulations! Your backend is ready to use!** 🚀

Next, read **PROJECT_SUMMARY.md** to learn about building the React frontend.
