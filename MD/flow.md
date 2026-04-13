## Authentication Workflow Documentation

## Overview
This document outlines a complete authentication system with three main workflows:
1. **Main App Workflow** - Entry point and routing logic
2. **Sign-up Flow** - New user registration process
3. **Login Flow** - Existing user authentication

---

## 1. Main App Workflow

### Entry Point: Landing Page
- User arrives at the application
- System checks user registration status

### Decision Point: Is User Registered?

#### Path A: User Not Registered (no)
1. Route to **Sign-up page**
2. User completes sign-up process
3. After setup completion, redirect to **Login page**

#### Path B: User Already Registered (yes)
1. Route to **Login page**
2. Continue with authentication

### Authentication Methods
From the Login page, user has two authentication options:

#### Option 1: Gesture Sequence
- User selects gesture authentication
- System initiates gesture verification
- Leads to gesture sequence validation

#### Option 2: 4-Digit PIN
- User selects PIN authentication
- System shows PIN pad interface
- User enters 4-digit PIN

### Final Step: Authentication Verification
- Both authentication methods feed into **Authenticated?** decision point
- If authentication is successful (yes), user is granted access
- Route to **Welcome page (protected)** - user is now logged in

---

## 2. Sign-up Flow

### Step 1: Enter Username
- **Action**: User provides unique display name
- **Input**: Username/Handle
- **Constraint**: Must be unique in the system

### Step 2: Gesture Password Setup
- **Action**: Camera opens and initiates gesture recording
- **Purpose**: Establish primary authentication method
- **Process**:
  - User performs a gesture sequence
  - Options available: Fist, Palm, Victory hand signals
  - Thumbs up gesture required (choose 2-4 sequences)
  - User records their unique gesture pattern

### Step 3: Set 4-Digit PIN (Fallback)
- **Action**: User creates a 4-digit PIN
- **Purpose**: Backup authentication method
- **Note**: Used if gesture authentication fails
- **Constraint**: Must be 4 digits

### Step 4: Hash and Store Credentials
- **Encryption Method 1**: Argon2 - for securing gesture string
- **Encryption Method 2**: Bcrypt - for securing 4-digit PIN
- **Location**: Credentials stored in secure database
- **Security**: Both credentials are hashed before storage (never stored in plaintext)

### Step 5: Redirect to Login Page
- **Action**: After successful setup, user is redirected to login page
- **Next**: User can now log in with their registered credentials

---

## 3. Login Flow

### Step 1: Enter Username
- **Action**: User enters their registered username
- **Retrieval**: System validates username exists in database
- **Next**: Proceed to authentication method selection

### Step 2: Choose Authentication Method
System presents two authentication options:

#### Option A: Gesture Recognition
- **Action**: Camera opens
- **Time Window**: User has 5-7 seconds to perform gesture
- **Process**:
  1. System waits for gesture input
  2. User performs their registered gesture sequence
  3. Gesture is captured and analyzed
  4. Continue to validation step

#### Option B: PIN Entry
- **Action**: PIN pad interface is displayed
- **Input**: User enters 4-digit PIN
- **Process**:
  1. System waits for PIN input
  2. User enters their 4-digit PIN
  3. Continue to validation step

### Step 3: Validation

#### For Gesture Authentication:
- **Step**: Compare order + length
  - Extract gesture sequence from input
  - Compare order of gestures with stored pattern
  - Verify total number of gestures matches
  - Check gesture sequence integrity

#### For PIN Authentication:
- **Step**: Compare hash match
  - Hash the entered PIN
  - Compare with stored bcrypt hash
  - Verify hash match

### Step 4: Match Decision
- **Decision Point**: Does authentication data match?
  - **No match**: Authentication fails, return to username entry
  - **Yes match**: Proceed to welcome page

### Step 5: Success - Welcome Page
- **Action**: Grant access to application
- **Status**: User is now authenticated
- **Route**: Redirect to protected Welcome page

---

## Security Measures

### Password Storage
- **Gesture Passwords**: Encrypted with Argon2
  - Modern, memory-hard hashing algorithm
  - Resistant to GPU/ASIC attacks
  - Scalable work factor for future security

- **PIN Passwords**: Encrypted with Bcrypt
  - Industry-standard password hashing
  - Built-in salt generation
  - Automatic cost factor

### Authentication Flow Security
1. **Two-factor capability**: Gesture + PIN provides backup method
2. **Biometric element**: Gesture recognition adds behavioral security
3. **No plaintext storage**: All credentials hashed before database storage
4. **Time-limited gestures**: 5-7 second window prevents recording exploitation

### Session Management
- After successful authentication, user receives protected session
- Access to protected pages requires valid authentication
- Unauthenticated users cannot access Welcome page directly

---

## User Flows Summary

### First-Time User Journey
```
Landing Page 
  → Not Registered (no) 
    → Sign-up Page 
      → Enter Username 
      → Gesture Setup 
      → PIN Setup 
      → Store Credentials 
    → Redirect to Login Page 
      → Login Flow
```

### Returning User Journey
```
Landing Page 
  → Registered (yes) 
    → Login Page 
      → Enter Username 
      → Choose Auth Method 
        → Gesture OR PIN 
      → Validate Match 
        → Welcome Page (Protected)
```

---

## Key Decision Points

| Decision | Condition | True Path | False Path |
|----------|-----------|-----------|-----------|
| Registered? | User exists in system | Go to Login | Go to Sign-up |
| Auth Method | User chooses gesture or PIN | Route accordingly | Show method choice |
| Authenticated? | Credentials match | Welcome page | Return to login |
| Match? (Gesture) | Order + length match | Success | Retry login |
| Match? (PIN) | Hash match verified | Success | Retry login |

---

## Error Handling

### Sign-up Errors
- **Duplicate username**: Request user to choose different username
- **Gesture not recorded**: Retry gesture sequence capture
- **PIN format invalid**: Request valid 4-digit PIN

### Login Errors
- **Username not found**: Display error, allow retry
- **Gesture mismatch**: Offer PIN fallback or retry gesture
- **PIN mismatch**: Display error, allow retry
- **Session timeout**: Return to login page for re-authentication

---

## Notes for Implementation

1. **Camera Permissions**: Ensure gesture authentication requests proper permissions
2. **Database Transactions**: Atomic operations for credential storage
3. **Rate Limiting**: Implement attempt limits to prevent brute force attacks
4. **Session Tokens**: Use secure token generation for authenticated sessions
5. **HTTPS Only**: All authentication traffic must use encrypted connections
6. **Audit Logging**: Log all authentication attempts for security monitoring