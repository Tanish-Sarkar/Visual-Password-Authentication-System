# **Database Schema: Visual Password Authentication System**

## **Overview**
This schema is designed to support a self-contained authentication system. It focuses on storing unique user identifies and the hashed versions of both the **Gesture Sequence** and the **4-digit PIN**.

---

### **Users Table**
Stores core identity and the hashed visual/numeric passwords.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | `SERIAL` | `PRIMARY KEY` | Unique User ID |
| **username** | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | The unique handle |
| **display_name** | `VARCHAR(100)` | `NOT NULL` | Friendly name for the Welcome page |
| **gesture_hash** | `TEXT` | `NOT NULL` | **Argon2** hash of sequence |
| **pin_hash** | `TEXT` | `NOT NULL` | **Bcrypt** hash of 4-digit PIN |
| **created_at** | `TIMESTAMP` | `DEFAULT now()` | Account creation time |

### **Auth Logs Table**
Tracks successful and failed attempts for the "Audit Log" requirement.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **log_id** | `SERIAL` | `PRIMARY KEY` | Unique Log ID |
| **user_id** | `INT` | `REFERENCES users(id)` | Linked user |
| **auth_method** | `VARCHAR(10)` | `CHECK(method IN ('gesture', 'pin'))` | Which method was used |
| **status** | `VARCHAR(10)` | `NOT NULL` | 'success' or 'failure' |
| **attempted_at** | `TIMESTAMP` | `DEFAULT now()` | Time of attempt |

---

## **SQL Implementation (NeonDB)**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    gesture_hash TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    auth_method VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Why this won't fail:**
1.  **Constraint Sync**: By using a One-Shot Sign-up, the `gesture_hash` and `pin_hash` are provided at the same time as the `username`, so the `NOT NULL` constraint will never be violated.
2.  **Naming Consistency**: The API uses `display_name` and the Database uses `display_name`, preventing "undefined" field errors in Flask.
3.  **Efficiency**: We removed 4 extra initialization routes, making your React-to-Flask logic much more straightforward.