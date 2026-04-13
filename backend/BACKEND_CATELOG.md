# Backend API Catalog

This document provides all necessary details for a frontend developer to connect to and interact with the Visual Password Authentication System Backend.

## Base URL (Development)
`http://localhost:5000/api`

## Core Concepts

- **Authentication Logic**: This is a custom authentication system. 
- **Gestures**: The gesture sequence is passed around as a simple string containing underscores for spaces, e.g., `"palm_victory_fist"`. The backend does not process video or images; the frontend must determine the gestures and send the final string sequence.
- **PIN**: A 4-digit PIN string serves as a fallback.
- **JWT**: JSON Web Tokens are used for session management. After a successful login, the backend responds with a token. This token must be sent in the `Authorization` header for protected routes.

## Endpoints

### 1. Check Registration Status
Used when the user lands on the site to determine if they should be directed to the Login or Signup flow.

* **Endpoint**: `GET /api/auth/check-registration`
* **Query Parameters**: `username` (string)
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "isRegistered": boolean
  }
  ```

### 2. Sign Up (One-Shot Registration)
Creates a new user, saving their username, display name, hashed gesture sequence, and hashed PIN.

* **Endpoint**: `POST /api/auth/signup`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "username": "unique_username",
    "display_name": "User's Full Name",
    "gesture_sequence": "palm_victory_fist",
    "pin": "1234"
  }
  ```
* **Responses**:
  * **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "User registered successfully"
    }
    ```
  * **Conflict (409)** - Username already exists.

### 3. Login
Handles authentication via either the primary visual gesture method or the fallback PIN method.

* **Endpoint**: `POST /api/auth/login`
* **Content-Type**: `application/json`
* **Request Body (Gesture Method)**:
  ```json
  {
    "username": "user",
    "auth_method": "gesture",
    "gesture_sequence": "palm_victory_fist"
  }
  ```
* **Request Body (PIN Method)**:
  ```json
  {
    "username": "user",
    "auth_method": "pin",
    "pin": "1234"
  }
  ```
* **Responses**:
  * **Success (200 OK)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1Ni... (JWT String)",
      "user": {
        "username": "user",
        "display_name": "User's Full Name"
      }
    }
    ```
  * **Unauthorized (401)** - Invalid credentials.

### 4. Verify Session
A protected route to check if a provided JWT token is still valid.

* **Endpoint**: `GET /api/auth/verify-session`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "isValid": true,
    "user": { ... decoded JWT payload ... }
  }
  ```

### 5. Logout
A structural endpoint. Real logout should happen by deleting the JWT token on the frontend.

* **Endpoint**: `POST /api/auth/logout`
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

### 6. Welcome / Protected Page
A dummy protected route that requires a valid JWT token. Representing a logged in dashboard.

* **Endpoint**: `GET /api/pages/welcome`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Welcome to the Visual Password Authentication System, [user]!",
    "data": {
      "dashboard_info": "This is top secret data meant only for authenticated users.",
      "auth_timestamp": 1234567890
    }
  }
  ```
  * **Unauthorized (401)** - Token is missing or invalid.

---

## Developer Setup Reminders

1. Ensure Python 3.9 is installed.
2. Initialize and activate the virtual environment (`venv`).
3. Set the `.env` variables (`FLASK_ENV`, `SECRET_KEY`, `DATABASE_URL`).
4. Keep the NeonDB server accessible.
5. Run using `python app.py`.
