# **Name: Visual Password Authentication System**  

## **Project Purpose — Why I'm making this project?**
It's a computer vision project for my college submission.

## **Description — What is this Visual Password Authentication System?**
- It is a auth system which protects the protected routes.
- Rather then traditional "username and password" auth system, where both are string values. I'm replacing the "password" with a squence of hand gestures performed by the user at the time of sign-up.
- At the time of login, the user has to perform the same squence of hand gestures in front of the webcam, and the system will authenticate the user based on the similarity between the recorded sequence of gestures and the stored sequence of gestures.
- The auth system will also have a 4-digit pin as a fallback option, in case the user is not able to perform the gestures as an alternative login option.
So the 2 ways of successful login are:
1. entering username + performing the sequence of hand gestures.
2. entering username + 4-digit pin. (fallback option)

## **Technical Details**
### **Disclaimer: `Some parts are not finalized yet, some needs more polishing`**

### **Tech Stack**
- **Frontend**: Vite + React.js
- **Backend**: Flask
- **Database**: NeonDB (PostgreSQL)
- **Computer Vision**: OpenCV, MediaPipe
- **Authentication (we are going to make our own auth system)**: Visual Password + 4-digit pin (fallback)

`Note: The Authentication system is the main focus of this project, the rest of the features are just for the sake of giving the project a complete look.`

### **Components**
- Landing Page
- Signup Page
- Login Page
- Welcome Page (Protected Route)

### **Logic flow**
refer to `flow.md` for detailed logic flow.

### Api Routes and endpoints
refer to `api_routes_endpoints.md` for detailed api routes.

### Database Schema
refer to `database_schema.md` for detailed database schema.

## **Special Requirements**
- **No External Authentication**: Cannot use Firebase, Supabase, or any third-party auth services
- **Self-Contained System**: Authentication must be built entirely from scratch
- **Database**: NeonDB (PostgreSQL) for data storage
- use meaningful naming, clean + lean coding practice and proper comments
- **`Use SOLID principles to make the Project robust`**


## **Environment Variables**
# Flask
FLASK_ENV=development
SECRET_KEY="your-super-secret-key-change-this-in-production"

# PostgreSQL — Neon connection string
DATABASE_URL="postgresql://neondb_owner:npg_Yw6Z5timOLUa@ep-weathered-boat-amung0nz-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Security
ARGON2_TIME_COST=2
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=2