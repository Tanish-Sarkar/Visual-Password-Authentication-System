# Authentication System - Routes & Endpoints Documentation

## Base URL (while in Development)
```
http://localhost:5000/api
```

---

This revised documentation aligns your Flask backend and NeonDB schema to ensure that database constraints (like `NOT NULL`) do not cause the system to fail during user registration.

The primary change is moving to a **One-Shot Signup** API. While your frontend can still show multiple steps (Username → Gestures → PIN), the backend will only receive one request at the very end to create the user record with all required data.

---

## **1. Updated `api_routes_endpoints.md`**

**Base URL**: `http://localhost:5000/api` (Standard Flask port)

### **Landing page**
* **route**: '/'
* **Description**: The default landing page of the application, which comes directly when the user comes from internet.

### **Authentication Routes**

#### **Check Registration**
* **Endpoint**: `GET /auth/check-registration`
* **Description**: Verifies if a username exists before allowing a user to proceed to Login or Sign-up.
* **Query Params**: `?username=string`
* **Response (200)**: `{"success": true, "isRegistered": boolean}`

#### **One-Shot Sign-up**
* **Endpoint**: `POST /auth/signup`
* **Description**: Creates the user and stores both hashed credentials in a single transaction.
* **Body**:
    ```json
    {
      "username": "john_doe",
      "display_name": "John Doe",
      "gesture_sequence": "palm_victory_fist",
      "pin": "1234"
    }
    ```
* **Response (201)**: `{"success": true, "message": "User registered successfully"}`

#### **Login**
* **Endpoint**: `POST /auth/login`
* **Description**: The "Main Engine" that handles both Gesture and PIN verification.
* **Body**:
    ```json
    {
      "username": "john_doe",
      "auth_method": "gesture", // or "pin"
      "gesture_sequence": "palm_victory_fist", // if method is gesture
      "pin": "1234" // if method is pin
    }
    ```
* **Response (200)**: `{"success": true, "token": "jwt_string", "user": {...}}`

---

### **Session & Protected Routes**

#### **Verify Session**
* **Endpoint**: `GET /auth/verify-session`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200)**: `{"success": true, "isValid": true}`

#### **Logout**
* **Endpoint**: `POST /auth/logout`
* **Description**: Invalidate the session on the client side.

#### **Welcome Page (Protected)**
* **Endpoint**: `GET /pages/welcome`
* **Description**: The final route that only authenticated users can access.




